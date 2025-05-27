import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("webhook_events")
export class WebhookEvent {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar" })
    event_type: string;

    @Column({ type: "jsonb" })
    payload: Record<string, any>;

    @Column({ type: "varchar", default: "pending" })
    status: string;

    @Column({ type: "integer", default: 0 })
    retry_count: number;

    @Column({ type: "text", nullable: true })
    error_message: string;

    @Column({ type: "timestamp", nullable: true })
    last_attempt: Date;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updated_at: Date;
} 