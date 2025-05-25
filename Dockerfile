# Estágio 1: Dependências
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev && \
    npm install zustand@4.5.2 --save

# Estágio 2: Compilação
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
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

# Instala as dependências de produção, TypeORM e ferramentas de migração
RUN npm install --omit=dev && \
    npm install -g ts-node@10.9.2 typeorm@0.3.20 && \
    npm install typeorm@0.3.20 pg reflect-metadata ts-node @types/node && \
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
    NODE_OPTIONS="--loader ts-node/esm --experimental-specifier-resolution=node"

# Expõe a porta da aplicação
EXPOSE 8080

# Verificação de saúde
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Define o script de entrada
ENTRYPOINT ["./docker-entrypoint.sh"] 