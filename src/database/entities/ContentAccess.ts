import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Content } from "./Content.js";

@Entity("content_access")
export class ContentAccess {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_email: string;

    @ManyToOne(() => Content)
    content: Content;

    @Column()
    access_type: string; // 'free' ou 'paid'

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    contribution_amount: number;

    @Column({ nullable: true })
    payment_id: string;

    @Column({ nullable: true })
    payment_status: string;

    @CreateDateColumn()
    created_at: Date;
} 