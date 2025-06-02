import { EmailProvider, EmailOptions } from './types';
import { EmailTemplates } from './templates';
import { AppDataSource } from '../../database/data-source';
import { SiteSettings } from '../../database/entities/SiteSettings';

export class EmailService {
  constructor(private provider: EmailProvider) {}

  async sendEmail(options: EmailOptions): Promise<void> {
    await this.provider.sendEmail(options);
  }

  private async getSiteName(): Promise<string> {
    try {
      const settingsRepository = AppDataSource.getRepository(SiteSettings);
      const settings = await settingsRepository
        .createQueryBuilder('settings')
        .select('settings.siteName')
        .orderBy('settings.id', 'DESC')
        .getOne();
      
      if (!settings?.siteName) {
        console.warn('Site name not found in settings, using default');
        return 'Conteúdo Premium';
      }
      
      return settings.siteName;
    } catch (error) {
      console.error('Error fetching site name:', error);
      return 'Conteúdo Premium';
    }
  }

  async sendPasswordReset(email: string, resetToken: string): Promise<void> {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/admin/reset-password?token=${resetToken}`;
    const siteName = await this.getSiteName();
    
    await this.provider.sendEmail({
      to: email,
      subject: "Recuperação de Senha",
      html: EmailTemplates.passwordReset(resetLink, siteName)
    });
  }

  async sendWelcome(email: string, name: string): Promise<void> {
    const siteName = await this.getSiteName();
    
    await this.provider.sendEmail({
      to: email,
      subject: `Bem-vindo ao ${siteName}`,
      html: EmailTemplates.welcome(name, siteName)
    });
  }
} 