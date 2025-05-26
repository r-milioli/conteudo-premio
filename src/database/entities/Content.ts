import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import type { ContentAdditionalLink } from "./ContentAdditionalLink";

@Entity("contents")
export class Content {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar" })
    title: string;

    @Column({ type: "varchar", unique: true })
    slug: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "varchar", default: "draft" })
    status: string;

    @Column({ type: "text", nullable: true })
    thumbnail_url: string;

    @Column({ type: "text", nullable: true })
    banner_image_url: string;

    @Column({ type: "text", nullable: true })
    capture_page_title: string;

    @Column({ type: "text", nullable: true })
    capture_page_description: string;

    @Column({ type: "text", nullable: true })
    capture_page_video_url: string;

    @Column({ type: "text", nullable: true })
    capture_page_html: string;

    @Column({ type: "text", nullable: true })
    delivery_page_title: string;

    @Column({ type: "text", nullable: true })
    delivery_page_description: string;

    @Column({ type: "text", nullable: true })
    delivery_page_video_url: string;

    @Column({ type: "text", nullable: true })
    delivery_page_html: string;

    @Column({ type: "text", nullable: true })
    download_link: string;

    @Column({ type: "boolean", default: true })
    is_active: boolean;

    @OneToMany("ContentAdditionalLink", "content")
    additional_links: ContentAdditionalLink[];

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updated_at: Date;
} 