import { EmailService } from '../services/email/email-service';
import { SmtpEmailProvider } from '../services/email/providers/smtp-provider';

// Validação das variáveis de ambiente
const requiredEnvVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USERNAME',
  'SMTP_PASSWORD',
  'NEXT_PUBLIC_SMTP_FROM'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Variável de ambiente ${varName} não definida`);
  }
});

export const emailProvider = new SmtpEmailProvider();
export const emailService = new EmailService(emailProvider); 