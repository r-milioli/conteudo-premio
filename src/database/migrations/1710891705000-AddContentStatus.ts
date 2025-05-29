import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContentStatus1710891705000 implements MigrationInterface {
    name = 'AddContentStatus1710891705000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Adicionando coluna status
        await queryRunner.query(`
            ALTER TABLE "contents"
            ADD COLUMN "status" VARCHAR NOT NULL DEFAULT 'draft'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Removendo coluna status
        await queryRunner.query(`
            ALTER TABLE "contents"
            DROP COLUMN "status"
        `);
    }
} 