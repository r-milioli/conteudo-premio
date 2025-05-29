import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContentStatus1710891705000 implements MigrationInterface {
    name = 'AddContentStatus1710891705000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verifica se a coluna status já existe
        const hasStatusColumn = await queryRunner.hasColumn('contents', 'status');
        
        if (!hasStatusColumn) {
            // Só adiciona a coluna se ela não existir
            await queryRunner.query(`
                ALTER TABLE "contents"
                ADD COLUMN "status" VARCHAR NOT NULL DEFAULT 'draft'
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Verifica se a coluna existe antes de tentar removê-la
        const hasStatusColumn = await queryRunner.hasColumn('contents', 'status');
        
        if (hasStatusColumn) {
            await queryRunner.query(`
                ALTER TABLE "contents"
                DROP COLUMN "status"
            `);
        }
    }
} 