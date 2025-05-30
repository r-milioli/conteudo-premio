# Estágio 1: Dependências
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev && \
    npm install zustand@4.5.2 --save && \
    npm install nodemailer @types/nodemailer

# Estágio 2: Compilação
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Criar diretórios necessários
RUN mkdir -p src/services/email/providers src/services/email/templates
# Build frontend and server
RUN npm run build

# Estágio 3: Execução
FROM node:20-alpine AS runner
WORKDIR /app

# Instala o cliente PostgreSQL e netcat para verificação de saúde
RUN apk add --no-cache postgresql-client netcat-openbsd dos2unix

# Copia os arquivos necessários
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tsconfig*.json ./
COPY docker-entrypoint.sh ./docker-entrypoint.sh
COPY server-package.json ./dist/server/package.json

# Criar diretórios necessários
RUN mkdir -p src/services/email/providers src/services/email/templates

# Instala as dependências de produção, TypeORM e ferramentas de migração
RUN npm install --omit=dev && \
    npm install -g ts-node@10.9.2 typeorm@0.3.20 && \
    npm install typeorm@0.3.20 pg reflect-metadata ts-node @types/node nodemailer @types/nodemailer && \
    npm cache clean --force && \
    # Remove arquivos temporários
    rm -rf /tmp/* && \
    # Configura as permissões
    dos2unix ./docker-entrypoint.sh && \
    chmod +x ./docker-entrypoint.sh && \
    # Cria usuário não-root
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    # Define as permissões corretas
    chown -R nodejs:nodejs /app

# Muda para o usuário não-root
USER nodejs

# Define variáveis de ambiente padrão
ENV PORT=8080 \
    NODE_ENV=production \
    NODE_OPTIONS="--loader ts-node/esm --experimental-specifier-resolution=node" \
    # Variáveis do Mercado Pago (valores serão sobrescritos em runtime)
    MERCADO_PAGO_PUBLIC_KEY="" \
    MERCADO_PAGO_ACCESS_TOKEN="" \
    MERCADO_PAGO_CLIENT_ID="" \
    MERCADO_PAGO_CLIENT_SECRET="" \
    # Variáveis do SMTP (valores serão sobrescritos em runtime)
    SMTP_HOST="" \
    SMTP_PORT="587" \
    SMTP_USERNAME="" \
    SMTP_PASSWORD="" \
    NEXT_PUBLIC_SMTP_FROM="" \
    SMTP_AUTH_DISABLED="false" \
    SMTP_SECURE="false" \
    # URL da aplicação
    NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Expõe a porta da aplicação
EXPOSE 8080

# Verificação de saúde
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Define o script de entrada
ENTRYPOINT ["./docker-entrypoint.sh"] 