import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("site_settings")
export class SiteSettings {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar" })
    siteName: string;

    @Column({ type: "text", nullable: true })
    logoUrl: string;

    @Column({ type: "text", nullable: true })
    faviconUrl: string;

    @Column({ type: "text" })
    footerText: string;

    @Column({ type: "varchar" })
    contactEmail: string;

    @Column({ type: "varchar" })
    primaryColor: string;

    @Column({ type: "varchar" })
    secondaryColor: string;

    @Column({ type: "varchar" })
    heroGradientFrom: string;

    @Column({ type: "varchar" })
    heroGradientVia: string;

    @Column({ type: "varchar" })
    heroGradientTo: string;

    @Column({ type: "text", nullable: true })
    facebookUrl: string;

    @Column({ type: "text", nullable: true })
    instagramUrl: string;

    @Column({ type: "text", nullable: true })
    twitterUrl: string;

    @Column({ type: "text", nullable: true })
    linkedinUrl: string;

    @Column({ type: "text", nullable: true })
    youtubeUrl: string;

    // Campos de checkout
    @Column({ type: "varchar", nullable: true })
    checkoutTitle: string;

    @Column({ type: "text", nullable: true })
    checkoutDescription: string;

    @Column({ type: "varchar", nullable: true })
    paymentButtonText: string;

    @Column({ type: "varchar", nullable: true })
    successMessage: string;

    @Column({ type: "varchar", nullable: true })
    merchantName: string;

    @Column({ type: "varchar", nullable: true })
    merchantId: string;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updated_at: Date;
} 