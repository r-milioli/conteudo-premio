import { EmailProvider, EmailOptions } from './types';
import { EmailTemplates } from './templates';

export class EmailService {
  constructor(private provider: EmailProvider) {}

  async sendPasswordReset(email: string, resetToken: string): Promise<void> {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    await this.provider.sendEmail({
      to: email,
      subject: "Recuperação de Senha",
      html: EmailTemplates.passwordReset(resetLink)
    });
  }

  async sendWelcome(email: string, name: string): Promise<void> {
    await this.provider.sendEmail({
      to: email,
      subject: "Bem-vindo ao Conteúdo Premium",
      html: EmailTemplates.welcome(name)
    });
  }
} 