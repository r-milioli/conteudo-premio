import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import { AppDataSource } from '../database/data-source.js';
import 'reflect-metadata';
import path from 'path';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize TypeORM connection
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
    })
    .catch((error) => {
        console.error("Error during Data Source initialization:", error);
        process.exit(1);
    });

// Middleware
app.use(express.json());

// Serve static files from the React app
app.use(express.static('dist'));

// API Routes
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// Handle React routing, return all requests to React app
app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 