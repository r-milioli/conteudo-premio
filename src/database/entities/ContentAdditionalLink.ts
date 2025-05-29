import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Content } from "./Content";

@Entity("content_additional_links")
export class ContentAdditionalLink {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne("Content", "additional_links", { onDelete: "CASCADE" })
    content: Content;

    @Column()
    title: string;

    @Column({ type: "text" })
    url: string;

    @Column({ type: "int", default: 0 })
    order_index: number;

    @CreateDateColumn()
    created_at: Date;
} 