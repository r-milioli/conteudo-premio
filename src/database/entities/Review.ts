import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Content } from "./Content";

@Entity("reviews")
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "text" })
    comment: string;

    @Column({ type: "int" })
    rating: number;

    @Column()
    user_email: string;

    @Column()
    user_name: string;

    @ManyToOne(() => Content)
    @JoinColumn({ name: "content_id" })
    content: Content;

    @Column()
    content_id: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({ default: false })
    is_approved: boolean;
} 