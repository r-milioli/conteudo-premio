#!/bin/sh
set -e

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
  entities: ["./dist/database/entities/*.js"],
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

# Inicia a aplicação
echo "Iniciando aplicação..."
exec node --experimental-specifier-resolution=node dist/server/main.js 