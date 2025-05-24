import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1710891600000 implements MigrationInterface {
    name = 'CreateInitialTables1710891600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criando tabela de administradores
        await queryRunner.query(`
            CREATE TABLE "administrators" (
                "id" SERIAL PRIMARY KEY,
                "email" VARCHAR NOT NULL UNIQUE,
                "password_hash" VARCHAR NOT NULL,
                "name" VARCHAR NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "last_login" TIMESTAMP
            )
        `);

        // Criando tabela de conteúdos
        await queryRunner.query(`
            CREATE TABLE "contents" (
                "id" SERIAL PRIMARY KEY,
                "title" VARCHAR NOT NULL,
                "slug" VARCHAR NOT NULL UNIQUE,
                "description" TEXT,
                "thumbnail_url" TEXT,
                "banner_image_url" TEXT,
                "capture_page_title" TEXT,
                "capture_page_description" TEXT,
                "capture_page_video_url" TEXT,
                "capture_page_html" TEXT,
                "delivery_page_title" TEXT,
                "delivery_page_description" TEXT,
                "delivery_page_video_url" TEXT,
                "delivery_page_html" TEXT,
                "download_link" TEXT,
                "is_active" BOOLEAN NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Criando tabela de links adicionais
        await queryRunner.query(`
            CREATE TABLE "content_additional_links" (
                "id" SERIAL PRIMARY KEY,
                "content_id" INTEGER REFERENCES contents(id) ON DELETE CASCADE,
                "title" VARCHAR NOT NULL,
                "url" TEXT NOT NULL,
                "order_index" INTEGER NOT NULL DEFAULT 0,
                "created_at" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Criando tabela de acessos aos conteúdos
        await queryRunner.query(`
            CREATE TABLE "content_access" (
                "id" SERIAL PRIMARY KEY,
                "user_email" VARCHAR NOT NULL,
                "content_id" INTEGER REFERENCES contents(id),
                "access_type" VARCHAR NOT NULL,
                "contribution_amount" DECIMAL(10,2),
                "payment_id" VARCHAR,
                "payment_status" VARCHAR,
                "created_at" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Criando índices
        await queryRunner.query(`CREATE INDEX "idx_content_access_email" ON "content_access" ("user_email")`);
        await queryRunner.query(`CREATE INDEX "idx_content_access_content" ON "content_access" ("content_id")`);
        await queryRunner.query(`CREATE INDEX "idx_contents_active" ON "contents" ("is_active")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Removendo índices
        await queryRunner.query(`DROP INDEX "idx_content_access_email"`);
        await queryRunner.query(`DROP INDEX "idx_content_access_content"`);
        await queryRunner.query(`DROP INDEX "idx_contents_active"`);

        // Removendo tabelas
        await queryRunner.query(`DROP TABLE "content_access"`);
        await queryRunner.query(`DROP TABLE "content_additional_links"`);
        await queryRunner.query(`DROP TABLE "contents"`);
        await queryRunner.query(`DROP TABLE "administrators"`);
    }
} 