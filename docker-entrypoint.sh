#!/bin/sh
set -e

# Valida variáveis de ambiente do SMTP
echo "Validando configurações do SMTP..."
if [ -z "$SMTP_HOST" ] || [ -z "$SMTP_USERNAME" ] || [ -z "$SMTP_PASSWORD" ] || [ -z "$NEXT_PUBLIC_SMTP_FROM" ]; then
  echo "Erro: Variáveis de ambiente do SMTP não configuradas corretamente!"
  echo "Por favor, configure as seguintes variáveis:"
  echo "- SMTP_HOST"
  echo "- SMTP_USERNAME"
  echo "- SMTP_PASSWORD"
  echo "- NEXT_PUBLIC_SMTP_FROM"
  exit 1
fi

# Aguarda o PostgreSQL estar pronto
echo "Aguardando PostgreSQL ficar pronto..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "PostgreSQL está pronto!"

# Cria arquivo de configuração temporário do TypeORM
echo "Criando configuração do TypeORM..."
cat > /app/typeorm-config.mjs << EOF
import { DataSource } from "typeorm";
import { Review } from "./dist/database/entities/Review.js";
import { Content } from "./dist/database/entities/Content.js";
import { Administrator } from "./dist/database/entities/Administrator.js";
import { SiteSettings } from "./dist/database/entities/SiteSettings.js";
import { ContentAccess } from "./dist/database/entities/ContentAccess.js";
import { WebhookEvent } from "./dist/database/entities/WebhookEvent.js";
import { ContentAdditionalLink } from "./dist/database/entities/ContentAdditionalLink.js";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: ["query", "error", "schema", "warn", "info", "log"],
  logger: "advanced-console",
  entities: [
    Review, 
    Content, 
    Administrator, 
    SiteSettings, 
    ContentAccess, 
    WebhookEvent,
    ContentAdditionalLink
  ],
  migrations: ["./dist/database/migrations/*.js"]
});

export default AppDataSource;
EOF

# Executa as migrations do TypeORM com logging detalhado
echo "Executando migrações do banco de dados..."
cd /app && \
NODE_OPTIONS="--no-warnings --loader ts-node/esm --experimental-specifier-resolution=node" \
DEBUG=typeorm:* node --loader ts-node/esm ./node_modules/typeorm/cli.js migration:run -d ./typeorm-config.mjs

# Verifica se as migrações foram bem-sucedidas
if [ $? -eq 0 ]; then
    echo "Migrações executadas com sucesso!"
else
    echo "Erro ao executar migrações!"
    exit 1
fi

# Verifica se os diretórios do serviço de email existem
echo "Verificando diretórios do serviço de email..."
mkdir -p /app/src/services/email/providers /app/src/services/email/templates

# Inicia a aplicação
echo "Iniciando aplicação..."
exec node --experimental-specifier-resolution=node dist/server/main.js 