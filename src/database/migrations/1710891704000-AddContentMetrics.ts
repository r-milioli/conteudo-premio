import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContentMetrics1710891704000 implements MigrationInterface {
    name = 'AddContentMetrics1710891704000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "contents"
            ADD COLUMN "access_count" INTEGER NOT NULL DEFAULT 0,
            ADD COLUMN "download_count" INTEGER NOT NULL DEFAULT 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "contents"
            DROP COLUMN "access_count",
            DROP COLUMN "download_count"
        `);
    }
} 