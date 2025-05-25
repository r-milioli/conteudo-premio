import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSiteSettings1710891700000 implements MigrationInterface {
    name = 'CreateSiteSettings1710891700000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "site_settings" (
                "id" SERIAL PRIMARY KEY,
                "siteName" VARCHAR NOT NULL,
                "logoUrl" TEXT,
                "faviconUrl" TEXT,
                "footerText" TEXT NOT NULL,
                "contactEmail" VARCHAR NOT NULL,
                "primaryColor" VARCHAR NOT NULL,
                "secondaryColor" VARCHAR NOT NULL,
                "heroGradientFrom" VARCHAR NOT NULL,
                "heroGradientVia" VARCHAR NOT NULL,
                "heroGradientTo" VARCHAR NOT NULL,
                "facebookUrl" TEXT,
                "instagramUrl" TEXT,
                "twitterUrl" TEXT,
                "linkedinUrl" TEXT,
                "youtubeUrl" TEXT,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Inserir configurações padrão
        await queryRunner.query(`
            INSERT INTO "site_settings" (
                "siteName",
                "footerText",
                "contactEmail",
                "primaryColor",
                "secondaryColor",
                "heroGradientFrom",
                "heroGradientVia",
                "heroGradientTo"
            ) VALUES (
                'Conteúdo Premium',
                '© 2025 Conteúdo Premium. Todos os direitos reservados.',
                'contato@conteudopremium.com',
                '#4361ee',
                '#3f37c9',
                '#dbeafe',
                '#faf5ff',
                '#e0e7ff'
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "site_settings"`);
    }
} 