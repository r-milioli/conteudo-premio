import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCaptureBannerUrl1710891706000 implements MigrationInterface {
    name = 'AddCaptureBannerUrl1710891706000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "contents"
            ADD COLUMN "capture_page_banner_url" TEXT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "contents"
            DROP COLUMN "capture_page_banner_url"
        `);
    }
} 