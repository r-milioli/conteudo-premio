import { DataSource } from "typeorm";
import { join } from "path";

export const AppDataSource = new DataSource({
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
    migrations: ["./dist/database/migrations/*.js"],
});

// Inicializa a conexão
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source inicializado!");
    })
    .catch((error) => {
        console.error("Erro durante a inicialização do Data Source:", error);
    }); 