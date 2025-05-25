import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import { AppDataSource } from '../database/data-source.js';
import { Administrator } from '../database/entities/Administrator.js';
import { SiteSettings } from '../database/entities/SiteSettings.js';
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

// Middleware para verificar autenticação
const authenticateToken = (req: Request, res: Response, next: Function) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.body.user = user;
        next();
    });
};

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

// Endpoint para obter configurações do site
app.get('/api/settings', async (req: Request, res: Response) => {
    try {
        const settingsRepository = AppDataSource.getRepository(SiteSettings);
        const settings = await settingsRepository.findOne({ where: { id: 1 } });
        
        if (!settings) {
            return res.status(404).json({ error: 'Configurações não encontradas' });
        }

        res.json(settings);
    } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Endpoint para atualizar configurações do site (requer autenticação)
app.put('/api/settings', authenticateToken, async (req: Request, res: Response) => {
    try {
        const settingsRepository = AppDataSource.getRepository(SiteSettings);
        let settings = await settingsRepository.findOne({ where: { id: 1 } });
        
        if (!settings) {
            return res.status(404).json({ error: 'Configurações não encontradas' });
        }

        // Validação básica dos campos obrigatórios
        const requiredFields = [
            'siteName', 'footerText', 'contactEmail', 
            'primaryColor', 'secondaryColor', 
            'heroGradientFrom', 'heroGradientVia', 'heroGradientTo'
        ];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ error: `O campo ${field} é obrigatório` });
            }
        }

        // Validação de email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.contactEmail)) {
            return res.status(400).json({ error: 'Email inválido' });
        }

        // Validação de cores hexadecimais
        const colorFields = ['primaryColor', 'secondaryColor', 'heroGradientFrom', 'heroGradientVia', 'heroGradientTo'];
        const hexColorRegex = /^#([A-Fa-f0-9]{6})$/;
        for (const field of colorFields) {
            if (!hexColorRegex.test(req.body[field])) {
                return res.status(400).json({ error: `Cor inválida para o campo ${field}` });
            }
        }

        // Validação de URLs
        const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

        // Validação de URLs obrigatórias
        const requiredUrlFields = ['logoUrl', 'faviconUrl'];
        for (const field of requiredUrlFields) {
            if (req.body[field] && !urlRegex.test(req.body[field])) {
                return res.status(400).json({ error: `URL inválida para o campo ${field}` });
            }
        }

        // Validação de URLs de redes sociais (opcionais)
        const socialUrlFields = ['facebookUrl', 'instagramUrl', 'twitterUrl', 'linkedinUrl', 'youtubeUrl'];
        for (const field of socialUrlFields) {
            if (req.body[field] && req.body[field] !== "" && !urlRegex.test(req.body[field])) {
                return res.status(400).json({ error: `URL inválida para o campo ${field}` });
            }
        }

        // Validação opcional dos campos de checkout
        if (req.body.checkoutTitle && req.body.checkoutTitle.length < 5) {
            return res.status(400).json({ error: 'O título do checkout deve ter pelo menos 5 caracteres' });
        }
        if (req.body.checkoutDescription && req.body.checkoutDescription.length < 10) {
            return res.status(400).json({ error: 'A descrição do checkout deve ter pelo menos 10 caracteres' });
        }
        if (req.body.paymentButtonText && req.body.paymentButtonText.length < 3) {
            return res.status(400).json({ error: 'O texto do botão de pagamento deve ter pelo menos 3 caracteres' });
        }
        if (req.body.successMessage && req.body.successMessage.length < 5) {
            return res.status(400).json({ error: 'A mensagem de sucesso deve ter pelo menos 5 caracteres' });
        }
        if (req.body.merchantName && req.body.merchantName.length < 3) {
            return res.status(400).json({ error: 'O nome do comerciante deve ter pelo menos 3 caracteres' });
        }
        if (req.body.merchantId && req.body.merchantId.length < 5) {
            return res.status(400).json({ error: 'O ID do comerciante deve ter pelo menos 5 caracteres' });
        }

        console.log('Atualizando configurações:', req.body);

        // Atualiza as configurações com os novos valores
        settingsRepository.merge(settings, req.body);
        
        // Salva as alterações
        settings = await settingsRepository.save(settings);
        
        console.log('Configurações atualizadas com sucesso:', settings);
        
        res.json(settings);
    } catch (error) {
        console.error('Erro ao atualizar configurações:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao atualizar configurações' });
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