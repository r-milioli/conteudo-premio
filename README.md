# Content Contribution Hub

O Content Contribution Hub é uma plataforma full-stack desenvolvida para criadores de conteúdo distribuírem seus materiais digitais com um sistema de contribuição opcional. O sistema permite que criadores disponibilizem seus conteúdos de forma profissional, com páginas de captura personalizadas e sistema de pagamento integrado.

## 🚀 Funcionalidades

### Para Criadores
- **Gestão de Conteúdo**
  - Upload e gerenciamento de materiais digitais
  - Páginas de captura personalizáveis
  - Páginas de entrega customizáveis
  - Sistema de avaliações e feedback
  - Métricas de acesso e downloads

- **Gerenciamento de Mídia**
  - Upload e armazenamento de imagens
  - Visualização em grid de todas as mídias
  - Pesquisa de arquivos por nome
  - Compartilhamento fácil via URL
  - Integração com MinIO Storage
  - Limite de 5MB por arquivo
  - Suporte apenas para imagens

### Para Usuários
- **Acesso ao Conteúdo**
  - Download de materiais com contribuição opcional
  - Sistema de avaliação e comentários
  - Interface intuitiva e responsiva

### Administrativas
- **Personalização do Site**
  - Configuração de cores e identidade visual
  - Gestão de redes sociais
  - Personalização de textos e logos
  - Configuração de favicon dinâmico

- **Integrações**
  - Mercado Pago (Cartão e PIX)
  - Sistema de webhooks para integrações externas
  - SMTP para envio de emails
  - MinIO para armazenamento de mídia

## 🛠 Tecnologias

- **Frontend**
  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui

- **Backend**
  - Node.js
  - Express
  - TypeORM
  - PostgreSQL

## 📦 Requisitos

- Node.js 18+
- PostgreSQL 16+
- Docker (opcional)

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Configure as seguintes variáveis no arquivo .env:
```env
# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=nome_do_banco

# Configurações do JWT
JWT_SECRET=seu_segredo_jwt

# Configurações do Mercado Pago
MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token
MERCADO_PAGO_CLIENT_ID=seu_client_id
MERCADO_PAGO_CLIENT_SECRET=seu_client_secret

# Configurações do SMTP
SMTP_HOST=seu_host_smtp
SMTP_PORT=587
SMTP_USERNAME=seu_usuario
SMTP_PASSWORD=sua_senha
SMTP_FROM="Nome"<email@dominio.com>

# Configurações do MinIO Storage
MINIO_ENDPOINT=seu_endpoint_minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=sua_access_key
MINIO_SECRET_KEY=sua_secret_key
MINIO_USE_SSL=false
MINIO_BUCKET=media
MINIO_PUBLIC_URL=http://seu_endpoint_minio:9000
```

5. Execute as migrações do banco de dados:
```bash
npm run migration:run
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 🐳 Docker

Para rodar com Docker:

```bash
docker-compose up -d
```

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Suporte

Para suporte, envie um email para contato@automacaodebaixocusto.com.br ou abra uma issue no repositório.