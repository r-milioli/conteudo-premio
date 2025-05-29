import { MigrationInterface, QueryRunner } from "typeorm";

export class EnsureWebhookDefaults1710891700002 implements MigrationInterface {
    name = 'EnsureWebhookDefaults1710891700002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verifica se as colunas existem, se não, cria
        const hasTable = await queryRunner.hasTable("site_settings");
        if (!hasTable) {
            return; // A tabela será criada pela migration anterior
        }

        // Adiciona as colunas se não existirem
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ADD COLUMN IF NOT EXISTS "webhookUrl" TEXT,
            ADD COLUMN IF NOT EXISTS "secretKey" TEXT,
            ADD COLUMN IF NOT EXISTS "enabledEvents" TEXT DEFAULT '[]',
            ADD COLUMN IF NOT EXISTS "retryAttempts" INTEGER DEFAULT 3,
            ADD COLUMN IF NOT EXISTS "timeout" INTEGER DEFAULT 10
        `);

        // Garante que os eventos padrão estejam configurados
        await queryRunner.query(`
            UPDATE "site_settings"
            SET "enabledEvents" = COALESCE(
                CASE 
                    WHEN "enabledEvents" IS NULL OR "enabledEvents" = '[]' 
                    THEN '["review.created", "review.approved", "review.deleted", "payment_success", "payment_failure", "access_granted", "content_created", "content_updated", "content_published", "content.access.created"]'
                    ELSE "enabledEvents"
                END,
                '["review.created", "review.approved", "review.deleted", "payment_success", "payment_failure", "access_granted", "content_created", "content_updated", "content_published", "content.access.created"]'
            ),
            "retryAttempts" = COALESCE("retryAttempts", 3),
            "timeout" = COALESCE("timeout", 10)
            WHERE "id" = 1
        `);

        // Garante que exista pelo menos uma configuração
        await queryRunner.query(`
            INSERT INTO "site_settings" (
                "siteName",
                "footerText",
                "contactEmail",
                "primaryColor",
                "secondaryColor",
                "heroGradientFrom",
                "heroGradientVia",
                "heroGradientTo",
                "enabledEvents",
                "retryAttempts",
                "timeout"
            )
            SELECT
                'Conteúdo Premium',
                '© 2025 Conteúdo Premium. Todos os direitos reservados.',
                'contato@conteudopremium.com',
                '#4361ee',
                '#3f37c9',
                '#dbeafe',
                '#faf5ff',
                '#e0e7ff',
                '["review.created", "review.approved", "review.deleted", "payment_success", "payment_failure", "access_granted", "content_created", "content_updated", "content_published", "content.access.created"]',
                3,
                10
            WHERE NOT EXISTS (SELECT 1 FROM "site_settings" WHERE "id" = 1)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Não faz nada no down pois é uma migration de garantia
    }
} 