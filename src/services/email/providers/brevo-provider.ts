import nodemailer from 'nodemailer';
import { EmailProvider, EmailOptions } from '../types';

export class BrevoEmailProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_AUTH_DISABLED === 'true' ? undefined : {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.NEXT_PUBLIC_SMTP_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new Error('Falha ao enviar email');
    }
  }
} 