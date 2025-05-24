import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("administrators")
export class Administrator {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar", unique: true })
    email: string;

    @Column({ type: "varchar" })
    password_hash: string;

    @Column({ type: "varchar" })
    name: string;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @Column({ type: "timestamp", nullable: true })
    last_login: Date;
} 