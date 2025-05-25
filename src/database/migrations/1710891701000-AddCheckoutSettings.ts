import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCheckoutSettings1710891701000 implements MigrationInterface {
    name = 'AddCheckoutSettings1710891701000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ADD COLUMN "checkoutTitle" VARCHAR NOT NULL DEFAULT 'Finalizar contribuição',
            ADD COLUMN "checkoutDescription" TEXT NOT NULL DEFAULT 'Complete o pagamento para acessar o conteúdo',
            ADD COLUMN "paymentButtonText" VARCHAR NOT NULL DEFAULT 'Pagar e Acessar Conteúdo',
            ADD COLUMN "successMessage" VARCHAR NOT NULL DEFAULT 'Obrigado pela sua contribuição! Seu acesso foi liberado.',
            ADD COLUMN "merchantName" VARCHAR NOT NULL DEFAULT 'Conteúdo Premium',
            ADD COLUMN "merchantId" VARCHAR NOT NULL DEFAULT 'MP12345678'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            DROP COLUMN "checkoutTitle",
            DROP COLUMN "checkoutDescription",
            DROP COLUMN "paymentButtonText",
            DROP COLUMN "successMessage",
            DROP COLUMN "merchantName",
            DROP COLUMN "merchantId"
        `);
    }
} 