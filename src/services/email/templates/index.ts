export class EmailTemplates {
  static getBaseTemplate(content: string) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Conteúdo Premium</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #4361ee;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${content}
            <div class="footer">
              <p>Este é um email automático, não responda.</p>
              <p>Conteúdo Premium - Todos os direitos reservados</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static passwordReset(resetLink: string): string {
    const content = `
      <h1>Recuperação de Senha</h1>
      <p>Você solicitou a recuperação de senha da sua conta.</p>
      <p>Clique no botão abaixo para criar uma nova senha:</p>
      <a href="${resetLink}" class="button">Redefinir Senha</a>
      <p>Se você não solicitou esta recuperação, ignore este email.</p>
      <p>Este link expira em 1 hora.</p>
    `;
    return this.getBaseTemplate(content);
  }

  static welcome(name: string): string {
    const content = `
      <h1>Bem-vindo(a) ao Conteúdo Premium!</h1>
      <p>Olá ${name},</p>
      <p>Estamos muito felizes em ter você conosco!</p>
      <p>A partir de agora você terá acesso a conteúdos exclusivos e de alta qualidade.</p>
      <p>Se precisar de ajuda ou tiver alguma dúvida, entre em contato conosco.</p>
    `;
    return this.getBaseTemplate(content);
  }
} 