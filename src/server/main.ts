import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import { AppDataSource } from '../database/data-source.js';
import { Administrator } from '../database/entities/Administrator.js';
import 'reflect-metadata';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

// Endpoint para verificar se existe admin
app.get('/api/admin/check', async (req: Request, res: Response) => {
    try {
        const adminRepository = AppDataSource.getRepository(Administrator);
        const adminCount = await adminRepository.count();
        res.json({ hasAdmin: adminCount > 0 });
    } catch (error) {
        console.error('Erro ao verificar admin:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Endpoint para criar admin master (apenas se não existir nenhum)
app.post('/api/admin/setup', async (req: Request, res: Response) => {
    try {
        const adminRepository = AppDataSource.getRepository(Administrator);
        const adminCount = await adminRepository.count();
        
        if (adminCount > 0) {
            return res.status(403).json({ error: 'Já existe um administrador cadastrado' });
        }

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        
        const admin = adminRepository.create({
            name,
            email,
            password_hash: passwordHash,
        });

        await adminRepository.save(admin);
        
        res.status(201).json({ message: 'Administrador criado com sucesso' });
    } catch (error) {
        console.error('Erro ao criar admin:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Endpoint para login do admin
app.post('/api/admin/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
        }

        const adminRepository = AppDataSource.getRepository(Administrator);
        const admin = await adminRepository.findOne({ where: { email } });

        if (!admin) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos' });
        }

        const passwordMatch = await bcrypt.compare(password, admin.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos' });
        }

        // Atualiza último login
        admin.last_login = new Date();
        await adminRepository.save(admin);

        // Gera token JWT
        const token = jwt.sign(
            { id: admin.id, email: admin.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: admin.id,
                name: admin.name,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Serve static files from the React app
app.use(express.static(path.join(process.cwd(), 'dist')));

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