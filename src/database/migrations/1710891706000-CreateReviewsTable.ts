import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateReviewsTable1710891706000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "reviews",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "comment",
                        type: "text"
                    },
                    {
                        name: "rating",
                        type: "int"
                    },
                    {
                        name: "user_email",
                        type: "varchar"
                    },
                    {
                        name: "user_name",
                        type: "varchar"
                    },
                    {
                        name: "content_id",
                        type: "int"
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()"
                    },
                    {
                        name: "is_approved",
                        type: "boolean",
                        default: false
                    }
                ]
            }),
            true
        );

        // Adiciona a foreign key para a tabela contents
        await queryRunner.createForeignKey(
            "reviews",
            new TableForeignKey({
                columnNames: ["content_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "contents",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("reviews");
        if (table) {
            const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("content_id") !== -1);
            if (foreignKey) {
                await queryRunner.dropForeignKey("reviews", foreignKey);
            }
        }
        await queryRunner.dropTable("reviews");
    }
} 