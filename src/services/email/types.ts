export interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<void>;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  text?: string;
} 