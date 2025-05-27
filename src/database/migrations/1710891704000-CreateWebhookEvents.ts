import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateWebhookEvents1710891704000 implements MigrationInterface {
    name = 'CreateWebhookEvents1710891704000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "webhook_events",
                columns: [
                    {
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "event_type",
                        type: "varchar",
                    },
                    {
                        name: "payload",
                        type: "jsonb",
                    },
                    {
                        name: "status",
                        type: "varchar",
                        default: "'pending'",
                    },
                    {
                        name: "retry_count",
                        type: "integer",
                        default: 0,
                    },
                    {
                        name: "error_message",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "last_attempt",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("webhook_events");
    }
} 