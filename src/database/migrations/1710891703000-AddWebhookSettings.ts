import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWebhookSettings1710891703000 implements MigrationInterface {
    name = 'AddWebhookSettings1710891703000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ADD COLUMN "webhookUrl" VARCHAR NOT NULL DEFAULT '',
            ADD COLUMN "secretKey" VARCHAR NOT NULL DEFAULT '',
            ADD COLUMN "enabledEvents" TEXT NOT NULL DEFAULT '[]',
            ADD COLUMN "retryAttempts" INTEGER NOT NULL DEFAULT 3,
            ADD COLUMN "timeout" INTEGER NOT NULL DEFAULT 10
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            DROP COLUMN "webhookUrl",
            DROP COLUMN "secretKey",
            DROP COLUMN "enabledEvents",
            DROP COLUMN "retryAttempts",
            DROP COLUMN "timeout"
        `);
    }
} 