import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeCheckoutFieldsOptional1710891702000 implements MigrationInterface {
    name = 'MakeCheckoutFieldsOptional1710891702000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "checkoutTitle" DROP NOT NULL,
            ALTER COLUMN "checkoutDescription" DROP NOT NULL,
            ALTER COLUMN "paymentButtonText" DROP NOT NULL,
            ALTER COLUMN "successMessage" DROP NOT NULL,
            ALTER COLUMN "merchantName" DROP NOT NULL,
            ALTER COLUMN "merchantId" DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "site_settings"
            ALTER COLUMN "checkoutTitle" SET NOT NULL,
            ALTER COLUMN "checkoutDescription" SET NOT NULL,
            ALTER COLUMN "paymentButtonText" SET NOT NULL,
            ALTER COLUMN "successMessage" SET NOT NULL,
            ALTER COLUMN "merchantName" SET NOT NULL,
            ALTER COLUMN "merchantId" SET NOT NULL
        `);
    }
} 