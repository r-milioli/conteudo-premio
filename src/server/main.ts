import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import { AppDataSource } from '../database/data-source.js';
import { Administrator } from '../database/entities/Administrator.js';
import { SiteSettings } from '../database/entities/SiteSettings.js';
import 'reflect-metadata';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Content } from '../database/entities/Content.js';
import { ContentAccess } from '../database/entities/ContentAccess.js';
import fetch from 'node-fetch';
import { WebhookProcessor } from '../jobs/WebhookProcessor.js';
import { WebhookService } from '../services/WebhookService.js';
import { Review } from '../database/entities/Review.js';
import { EmailService } from '../services/email/email-service.js';
import { SmtpEmailProvider } from '../services/email/providers/smtp-provider.js';
import slugify from 'slugify';
import { Not } from "typeorm";
import { minioService } from '../services/storage/minio-service.js';
import multer from 'multer';
import crypto from 'crypto';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize email service
const emailProvider = new SmtpEmailProvider();
const emailService = new EmailService(emailProvider);

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
        const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w@\s.-]*)*(\?[^#\s]*)?(\#[^\s]*)?$/;

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

        // Validação dos campos de webhook
        if (req.body.webhookUrl) {
            if (!urlRegex.test(req.body.webhookUrl)) {
                return res.status(400).json({ error: 'URL do webhook inválida' });
            }
        }

        if (req.body.retryAttempts !== undefined) {
            const retryAttempts = parseInt(req.body.retryAttempts);
            if (isNaN(retryAttempts) || retryAttempts < 0 || retryAttempts > 10) {
                return res.status(400).json({ error: 'O número de tentativas deve estar entre 0 e 10' });
            }
        }

        if (req.body.timeout !== undefined) {
            const timeout = parseInt(req.body.timeout);
            if (isNaN(timeout) || timeout < 1 || timeout > 30) {
                return res.status(400).json({ error: 'O timeout deve estar entre 1 e 30 segundos' });
            }
        }

        if (req.body.enabledEvents) {
            try {
                const events = JSON.parse(req.body.enabledEvents);
                if (!Array.isArray(events)) {
                    return res.status(400).json({ error: 'O campo enabledEvents deve ser um array' });
                }
            } catch (error) {
                return res.status(400).json({ error: 'Formato inválido para o campo enabledEvents' });
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

// Endpoints de Conteúdo

// Listar todos os conteúdos
app.get('/api/contents', authenticateToken, async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const search = (req.query.search as string) || '';
        const itemsPerPage = 10;
        const offset = (page - 1) * itemsPerPage;

        const contentRepository = AppDataSource.getRepository(Content);

        // Consulta para contar o total de registros
        const countQuery = await contentRepository
            .createQueryBuilder('content')
            .where(search ? 'content.title LIKE :search OR content.description LIKE :search' : '1=1', {
                search: `%${search}%`
            })
            .getCount();

        // Consulta para buscar os conteúdos paginados
        const contents = await contentRepository
            .createQueryBuilder('content')
            .where(search ? 'content.title LIKE :search OR content.description LIKE :search' : '1=1', {
                search: `%${search}%`
            })
            .select([
                'content.id',
                'content.title',
                'content.description',
                'content.slug',
                'content.status',
                'content.thumbnail_url',
                'content.banner_image_url',
                'content.capture_page_title',
                'content.capture_page_description',
                'content.capture_page_video_url',
                'content.capture_page_html',
                'content.delivery_page_title',
                'content.delivery_page_description',
                'content.delivery_page_video_url',
                'content.delivery_page_html',
                'content.download_link',
                'content.is_active',
                'content.access_count',
                'content.download_count',
                'content.created_at',
                'content.updated_at'
            ])
            .orderBy('content.created_at', 'DESC')
            .skip(offset)
            .take(itemsPerPage)
            .getMany();
        
        res.json({
            contents,
            total: countQuery,
            currentPage: page,
            totalPages: Math.ceil(countQuery / itemsPerPage)
        });
    } catch (error) {
        console.error('Erro ao buscar conteúdos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Função auxiliar para gerar slug único
async function generateUniqueSlug(baseSlug: string, contentRepository: any, currentId?: number): Promise<string> {
    let slug = slugify(baseSlug, {
        lower: true,
        strict: true,
        trim: true,
        locale: 'pt'
    });
    
    let counter = 0;
    let uniqueSlug = slug;
    
    while (true) {
        // Verifica se existe outro conteúdo com o mesmo slug
        const existingContent = await contentRepository.findOne({ 
            where: { 
                slug: uniqueSlug,
                ...(currentId ? { id: Not(currentId) } : {})
            } 
        });
        
        if (!existingContent) {
            return uniqueSlug;
        }
        
        counter++;
        uniqueSlug = `${slug}-${counter}`;
    }
}

// Criar novo conteúdo
app.post('/api/contents', authenticateToken, async (req: Request, res: Response) => {
    try {
        const {
            title,
            description,
            thumbnailUrl,
            bannerImageUrl,
            capturePageTitle,
            capturePageDescription,
            capturePageBannerUrl,
            capturePageVideoUrl,
            capturePageHtml,
            deliveryPageTitle,
            deliveryPageDescription,
            deliveryPageVideoUrl,
            deliveryPageHtml,
            downloadLink
        } = req.body;

        const contentRepository = AppDataSource.getRepository(Content);
        
        // Gera o slug único a partir do título
        const slug = await generateUniqueSlug(title, contentRepository);

        const content = contentRepository.create({
            title,
            description,
            slug,
            thumbnail_url: thumbnailUrl,
            banner_image_url: bannerImageUrl,
            capture_page_title: capturePageTitle,
            capture_page_description: capturePageDescription,
            capture_page_banner_url: capturePageBannerUrl,
            capture_page_video_url: capturePageVideoUrl,
            capture_page_html: capturePageHtml,
            delivery_page_title: deliveryPageTitle,
            delivery_page_description: deliveryPageDescription,
            delivery_page_video_url: deliveryPageVideoUrl,
            delivery_page_html: deliveryPageHtml,
            download_link: downloadLink,
            is_active: true
        });

        await contentRepository.save(content);
        
        await WebhookService.createEvent('content_created', {
            content_id: content.id,
            title: content.title,
            slug: content.slug,
            status: content.status,
        });
        
        res.status(201).json(content);
    } catch (error) {
        console.error('Erro ao criar conteúdo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar conteúdo
app.put('/api/contents/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            thumbnailUrl,
            bannerImageUrl,
            capturePageTitle,
            capturePageDescription,
            capturePageBannerUrl,
            capturePageVideoUrl,
            capturePageHtml,
            deliveryPageTitle,
            deliveryPageDescription,
            deliveryPageVideoUrl,
            deliveryPageHtml,
            downloadLink,
            slug: customSlug
        } = req.body;

        const contentRepository = AppDataSource.getRepository(Content);
        const content = await contentRepository.findOne({ where: { id: parseInt(id) } });
        
        if (!content) {
            return res.status(404).json({ error: 'Conteúdo não encontrado' });
        }

        // Se o título mudou e não foi fornecido um slug customizado, gera um novo
        let newSlug = content.slug;
        if (customSlug) {
            newSlug = await generateUniqueSlug(customSlug, contentRepository, content.id);
        } else if (title !== content.title) {
            newSlug = await generateUniqueSlug(title, contentRepository, content.id);
        }

        Object.assign(content, {
            title,
            description,
            slug: newSlug,
            thumbnail_url: thumbnailUrl,
            banner_image_url: bannerImageUrl,
            capture_page_title: capturePageTitle,
            capture_page_description: capturePageDescription,
            capture_page_banner_url: capturePageBannerUrl,
            capture_page_video_url: capturePageVideoUrl,
            capture_page_html: capturePageHtml,
            delivery_page_title: deliveryPageTitle,
            delivery_page_description: deliveryPageDescription,
            delivery_page_video_url: deliveryPageVideoUrl,
            delivery_page_html: deliveryPageHtml,
            download_link: downloadLink
        });

        await contentRepository.save(content);
        
        await WebhookService.createEvent('content_updated', {
            content_id: content.id,
            title: content.title,
            slug: newSlug,
            status: content.status,
        });
        
        res.json(content);
    } catch (error) {
        console.error('Erro ao atualizar conteúdo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Excluir conteúdo
app.delete('/api/contents/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const contentRepository = AppDataSource.getRepository(Content);
        const content = await contentRepository.findOne({ where: { id: parseInt(id) } });
        
        if (!content) {
            return res.status(404).json({ error: 'Conteúdo não encontrado' });
        }

        await contentRepository.remove(content);
        
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir conteúdo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar status do conteúdo
app.put('/api/contents/:id/status', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['draft', 'published'].includes(status)) {
            return res.status(400).json({ error: 'Status inválido' });
        }

        const contentRepository = AppDataSource.getRepository(Content);
        const content = await contentRepository.findOne({ where: { id: parseInt(id) } });
        
        if (!content) {
            return res.status(404).json({ error: 'Conteúdo não encontrado' });
        }

        const oldStatus = content.status;
        content.status = status;
        content.updated_at = new Date();

        await contentRepository.save(content);

        // Dispara o evento apenas quando o conteúdo é publicado
        if (status === 'published' && oldStatus === 'draft') {
            await WebhookService.createEvent('content_published', {
                content_id: content.id,
                title: content.title,
                slug: content.slug,
                status: content.status,
                published_at: new Date().toISOString()
            });
        }
        
        res.json(content);
    } catch (error) {
        console.error('Erro ao atualizar status do conteúdo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar conteúdo público por slug
app.get('/api/public/contents/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const contentRepository = AppDataSource.getRepository(Content);
        const content = await contentRepository.findOne({ 
            where: { 
                slug,
                status: 'published',
                is_active: true 
            } 
        });
        
        if (!content) {
            return res.status(404).json({ error: 'Conteúdo não encontrado' });
        }

        res.json(content);
    } catch (error) {
        console.error('Erro ao buscar conteúdo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar dados do conteúdo para o formulário
app.get('/api/public/contents/:slug/form', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const contentRepository = AppDataSource.getRepository(Content);
        const content = await contentRepository.findOne({ 
            where: { 
                slug,
                status: 'published',
                is_active: true 
            },
            select: [
                'id',
                'title',
                'description',
                'slug',
                'thumbnail_url',
                'banner_image_url',
                'capture_page_title',
                'capture_page_description',
                'capture_page_banner_url',
                'capture_page_video_url',
                'capture_page_html'
            ]
        });
        
        if (!content) {
            return res.status(404).json({ error: 'Conteúdo não encontrado' });
        }

        res.json({
            id: content.id,
            titulo: content.capture_page_title || content.title,
            descricao: content.capture_page_description || content.description,
            slug: content.slug,
            thumbnail: content.thumbnail_url,
            capture_page_title: content.capture_page_title,
            capture_page_description: content.capture_page_description,
            capture_page_banner_url: content.capture_page_banner_url,
            capture_page_video_url: content.capture_page_video_url,
            capture_page_html: content.capture_page_html
        });
    } catch (error) {
        console.error('Erro ao buscar dados do formulário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar dados do conteúdo para a página de entrega
app.get('/api/public/contents/:slug/delivery', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const contentRepository = AppDataSource.getRepository(Content);
        const content = await contentRepository.findOne({ 
            where: { 
                slug,
                status: 'published',
                is_active: true 
            },
            select: [
                'id',
                'title',
                'description',
                'slug',
                'thumbnail_url',
                'banner_image_url',
                'delivery_page_title',
                'delivery_page_description',
                'delivery_page_video_url',
                'delivery_page_html',
                'download_link'
            ]
        });
        
        if (!content) {
            return res.status(404).json({ error: 'Conteúdo não encontrado' });
        }

        res.json({
            id: content.id,
            titulo: content.delivery_page_title || content.title,
            descricao: content.delivery_page_description || content.description,
            slug: content.slug,
            banner_image_url: content.banner_image_url,
            delivery_page_title: content.delivery_page_title,
            delivery_page_description: content.delivery_page_description,
            delivery_page_video_url: content.delivery_page_video_url,
            delivery_page_html: content.delivery_page_html,
            downloadLink: content.download_link
        });
    } catch (error) {
        console.error('Erro ao buscar dados da página de entrega:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Registrar acesso ao conteúdo
app.post('/api/public/contents/:slug/access', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const { email, contribution_amount = 0, payment_id = null, payment_status = null } = req.body;

        // Validação básica dos campos obrigatórios
        if (!email) {
            return res.status(400).json({ error: 'O campo email é obrigatório' });
        }

        // Validação de email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Email inválido' });
        }

        // Busca o conteúdo
        const contentRepository = AppDataSource.getRepository(Content);
        const content = await contentRepository.findOne({ 
            where: { 
                slug,
                status: 'published',
                is_active: true 
            } 
        });
        
        if (!content) {
            return res.status(404).json({ error: 'Conteúdo não encontrado' });
        }

        // Registra o acesso
        const contentAccessRepository = AppDataSource.getRepository(ContentAccess);
        const access = contentAccessRepository.create({
            user_email: email,
            content,
            access_type: contribution_amount > 0 ? 'paid' : 'free',
            contribution_amount: contribution_amount,
            payment_id: payment_id,
            payment_status: payment_status
        });

        await contentAccessRepository.save(access);

        // Incrementa o contador de acessos do conteúdo
        await contentRepository.increment({ id: content.id }, 'access_count', 1);
        
        // Adiciona evento de webhook para novo acesso
        await WebhookService.createEvent('content.access.created', {
            content_id: content.id,
            user_email: email,
            access_type: access.access_type,
            contribution_amount: access.contribution_amount,
            payment_id: access.payment_id,
            payment_status: access.payment_status,
        });
        
        res.status(201).json({ 
            message: 'Acesso registrado com sucesso',
            content_id: content.id 
        });
    } catch (error) {
        console.error('Erro ao registrar acesso:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Registrar download do conteúdo
app.post('/api/public/contents/:slug/download', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const contentRepository = AppDataSource.getRepository(Content);
        const content = await contentRepository.findOne({ 
            where: { 
                slug,
                status: 'published',
                is_active: true 
            } 
        });
        
        if (!content) {
            return res.status(404).json({ error: 'Conteúdo não encontrado' });
        }

        // Incrementa o contador de downloads do conteúdo
        await contentRepository.increment({ id: content.id }, 'download_count', 1);
        
        res.status(200).json({ 
            message: 'Download registrado com sucesso',
            content_id: content.id 
        });
    } catch (error) {
        console.error('Erro ao registrar download:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar dados para relatórios
app.get('/api/admin/reports', async (req: Request, res: Response) => {
  try {
    console.log('Iniciando busca de relatórios');
    const { startDate, endDate, search } = req.query;
    
    const contentAccessRepository = AppDataSource.getRepository(ContentAccess);

    // Query base
    const queryBuilder = contentAccessRepository
      .createQueryBuilder('access')
      .leftJoinAndSelect('access.content', 'content')
      .orderBy('access.created_at', 'DESC');

    // Aplicar filtros se existirem
    if (startDate && endDate) {
      queryBuilder.andWhere('access.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      });
    }

    if (search) {
      queryBuilder.andWhere('(access.user_email LIKE :search OR content.title LIKE :search)', {
        search: `%${search}%`
      });
    }

    // Buscar os dados
    const accesses = await queryBuilder.getMany();
    console.log('Acessos encontrados:', accesses.length);

    // Formatar dados para resposta
    const formattedAccesses = accesses.map(access => ({
      id: access.id,
      conteudo_id: access.content?.id || 0,
      conteudo_titulo: access.content?.title || 'Conteúdo não encontrado',
      email: access.user_email,
      valor_contribuido: Number(access.contribution_amount) || 0,
      status_pagamento: Number(access.contribution_amount) > 0 ? 'aprovado' : 'gratuito',
      data_acesso: access.created_at
    }));

    // Calcular estatísticas
    const totalDownloads = formattedAccesses.length;
    const paidDownloads = formattedAccesses.filter(access => access.valor_contribuido > 0).length;
    const totalRevenue = Number(formattedAccesses.reduce((sum, access) => sum + access.valor_contribuido, 0).toFixed(2));

    const response = {
      downloads: formattedAccesses,
      statistics: {
        totalDownloads,
        paidDownloads,
        totalRevenue
      }
    };

    console.log('Resposta formatada:', response);
    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar dados dos relatórios',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Webhook do Mercado Pago (DEVE VIR ANTES DO WEBHOOK GENÉRICO)
app.post('/api/webhooks/mercadopago', async (req: Request, res: Response) => {
    try {
        const { action, data, live_mode } = req.body;
        console.log('Webhook do Mercado Pago recebido:', JSON.stringify(req.body, null, 2));

        if (!action || !data || !data.id) {
            return res.status(400).json({ 
                error: 'Payload inválido',
                details: 'Os campos action e data.id são obrigatórios'
            });
        }

        // Se não for modo live (teste), retorna sucesso sem processar
        if (live_mode === false) {
            console.log('Evento de teste do Mercado Pago recebido e validado com sucesso');
            return res.status(200).json({ 
                message: 'Evento de teste processado com sucesso',
                details: 'Webhooks de teste são validados mas não processados'
            });
        }

        if (action === "payment.created" || action === "payment.updated") {
            const paymentId = data.id;
            
            // Busca o pagamento no Mercado Pago
            const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
                }
            });

            if (!response.ok) {
                console.error('Erro ao buscar pagamento:', await response.text());
                throw new Error('Erro ao buscar pagamento no Mercado Pago');
            }

            const payment = await response.json();
            console.log('Dados do pagamento:', JSON.stringify(payment, null, 2));

            // Dispara eventos com base no status do pagamento
            if (payment.status === 'approved') {
                await WebhookService.createEvent('payment_success', {
                    payment_id: payment.id,
                    amount: payment.transaction_amount,
                    payer_email: payment.payer.email,
                    status: payment.status,
                    payment_method: payment.payment_method_id,
                    timestamp: new Date().toISOString()
                });
            } else if (['rejected', 'cancelled'].includes(payment.status)) {
                await WebhookService.createEvent('payment_failure', {
                    payment_id: payment.id,
                    amount: payment.transaction_amount,
                    payer_email: payment.payer.email,
                    status: payment.status,
                    payment_method: payment.payment_method_id,
                    timestamp: new Date().toISOString()
                });
            }
        }

        res.status(200).json({ message: 'Webhook do Mercado Pago processado com sucesso' });
    } catch (error) {
        console.error('Erro ao processar webhook do Mercado Pago:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Listar conteúdos públicos
app.get('/api/public/contents', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const search = (req.query.search as string) || '';
        const itemsPerPage = 10;
        const offset = (page - 1) * itemsPerPage;

        // Consulta para contar o total de registros
        const countQuery = await AppDataSource.getRepository(Content)
            .createQueryBuilder('content')
            .where('content.status = :status AND content.is_active = :is_active', {
                status: 'published',
                is_active: true
            })
            .andWhere('(content.title LIKE :search OR content.description LIKE :search)', {
                search: `%${search}%`
            })
            .getCount();

        // Consulta para buscar os conteúdos paginados
        const contents = await AppDataSource.getRepository(Content)
            .createQueryBuilder('content')
            .where('content.status = :status AND content.is_active = :is_active', {
                status: 'published',
                is_active: true
            })
            .andWhere('(content.title LIKE :search OR content.description LIKE :search)', {
                search: `%${search}%`
            })
            .select([
                'content.id',
                'content.title',
                'content.description',
                'content.slug',
                'content.thumbnail_url',
                'content.banner_image_url',
                'content.access_count',
                'content.download_count'
            ])
            .orderBy('content.created_at', 'DESC')
            .skip(offset)
            .take(itemsPerPage)
            .getMany();

        // Formatar a resposta
        const formattedContents = contents.map(content => ({
            id: content.id,
            title: content.title,
            description: content.description,
            slug: content.slug,
            thumbnail_url: content.thumbnail_url,
            banner_image_url: content.banner_image_url,
            access_count: content.access_count,
            download_count: content.download_count,
        }));

        res.json({
            contents: formattedContents,
            total: countQuery,
            currentPage: page,
            totalPages: Math.ceil(countQuery / itemsPerPage),
        });
    } catch (error) {
        console.error('Erro ao listar conteúdos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Sistema de Webhooks Genérico
app.post('/api/webhooks/:event', async (req: Request, res: Response) => {
    try {
        const { event } = req.params;
        console.log(`Webhook recebido para evento ${event}:`, JSON.stringify(req.body, null, 2));

        // Busca as configurações de webhook
        const settingsRepository = AppDataSource.getRepository(SiteSettings);
        const settings = await settingsRepository.findOne({ where: { id: 1 } });

        if (!settings) {
            console.error('Configurações não encontradas');
            return res.status(500).json({ 
                error: 'Configurações não encontradas',
                details: 'Verifique se as configurações do site foram inicializadas'
            });
        }

        // Verifica se o evento está habilitado
        const enabledEvents = JSON.parse(settings.enabledEvents || '[]');
        if (!enabledEvents.includes(event)) {
            console.warn(`Evento ${event} não está habilitado`);
            return res.status(400).json({
                error: 'Evento não habilitado',
                details: `O evento ${event} não está configurado para receber webhooks`
            });
        }

        // Processa diferentes tipos de eventos
        switch (event) {
            case 'content.accessed':
                // Lógica para quando um conteúdo é acessado
                const { contentId, userEmail } = req.body;
                console.log(`Conteúdo ${contentId} acessado por ${userEmail}`);
                break;

            case 'payment.received':
                // Lógica para quando um pagamento é recebido
                const { paymentId, amount, status } = req.body;
                console.log(`Pagamento ${paymentId} recebido: ${amount} (${status})`);
                break;

            case 'user.registered':
                // Lógica para quando um usuário se registra
                const { email, timestamp } = req.body;
                console.log(`Novo usuário registrado: ${email} em ${timestamp}`);
                break;

            default:
                // Para eventos personalizados
                console.log(`Evento personalizado ${event} recebido`);
        }

        // Envia o webhook para a URL configurada
        if (settings.webhookUrl) {
            try {
                const webhookResponse = await fetch(settings.webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Webhook-Event': event,
                        'X-Webhook-Signature': settings.secretKey || ''
                    },
                    body: JSON.stringify({
                        event,
                        data: req.body,
                        timestamp: new Date().toISOString()
                    })
                });

                if (!webhookResponse.ok) {
                    console.error(`Erro ao enviar webhook para ${settings.webhookUrl}:`, await webhookResponse.text());
                }
            } catch (error: any) {
                console.error('Erro ao enviar webhook:', error.message);
            }
        }

        return res.json({ 
            message: 'Webhook processado com sucesso',
            event,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Erro ao processar webhook:', error);
        return res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message || 'Erro desconhecido'
        });
    }
});

// Configuração do multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  },
});

// Endpoint para verificar status do storage
app.get('/api/media/status', async (_req: Request, res: Response) => {
  try {
    const status = await minioService.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Erro ao verificar status do storage:', error);
    res.status(500).json({ error: 'Erro ao verificar status do storage' });
  }
});

// Endpoint para listar arquivos
app.get('/api/media/files', async (_req: Request, res: Response) => {
  try {
    const files = await minioService.listFiles();
    res.json(files);
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ error: 'Erro ao listar arquivos' });
  }
});

// Endpoint para upload de arquivo
app.post('/api/media/upload', upload.single('file'), async (req: Request & { file?: Express.Multer.File }, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const file = req.file;
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${crypto.randomBytes(16).toString('hex')}.${fileExtension}`;

    const url = await minioService.uploadFile(
      file.buffer,
      fileName,
      file.mimetype
    );

    res.json({ url, fileName });
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
  }
});

// Endpoint para deletar arquivo
app.delete('/api/media/files/:fileName', async (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;
    await minioService.deleteFile(fileName);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    res.status(500).json({ error: 'Erro ao deletar arquivo' });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(process.cwd(), 'dist')));

// API Routes
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// Endpoint para configuração do Mercado Pago
app.get('/api/config/mercadopago', (_req: Request, res: Response) => {
    try {
        console.log('Variáveis de ambiente do Mercado Pago:');
        console.log('PUBLIC_KEY:', process.env.MERCADO_PAGO_PUBLIC_KEY);
        console.log('ACCESS_TOKEN:', process.env.MERCADO_PAGO_ACCESS_TOKEN ? '**presente**' : '**ausente**');
        console.log('CLIENT_ID:', process.env.MERCADO_PAGO_CLIENT_ID ? '**presente**' : '**ausente**');
        console.log('CLIENT_SECRET:', process.env.MERCADO_PAGO_CLIENT_SECRET ? '**presente**' : '**ausente**');
        
        const publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY;
        
        if (!publicKey) {
            console.error('Chave pública do Mercado Pago não encontrada nas variáveis de ambiente');
            return res.status(500).json({ 
                error: 'Chave pública do Mercado Pago não configurada' 
            });
        }

        res.json({ publicKey });
    } catch (error) {
        console.error('Erro ao buscar configuração do Mercado Pago:', error);
        res.status(500).json({ 
            error: 'Erro ao buscar configuração do Mercado Pago' 
        });
    }
});

// Endpoint para processar pagamentos
app.post('/api/payments/process', async (req: Request, res: Response) => {
    try {
        const {
            token,
            transaction_amount,
            description,
            installments,
            payment_method_id,
            issuer_id,
            payer,
            binary_mode
        } = req.body;

        // Validar dados obrigatórios
        if (!token || !transaction_amount || !payment_method_id || !payer.email) {
            return res.status(400).json({
                error: 'Dados de pagamento incompletos',
                details: 'Todos os campos são obrigatórios'
            });
        }

        // Gerar uma chave de idempotência única
        const idempotencyKey = `${Date.now()}-${token}-${Math.random().toString(36).substring(2, 15)}`;

        // Log dos dados que serão enviados
        console.log('Dados do pagamento a serem enviados:', {
            transaction_amount,
            token,
            description,
            installments,
            payment_method_id,
            issuer_id,
            payer,
            binary_mode
        });

        // Criar pagamento no Mercado Pago
        const response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': idempotencyKey
            },
            body: JSON.stringify({
                transaction_amount: Number(transaction_amount),
                token,
                description,
                installments: Number(installments),
                payment_method_id,
                issuer_id,
                payer,
                binary_mode: true
            })
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error('Erro do Mercado Pago:', responseData);
            return res.status(response.status).json(responseData);
        }

        // Log do resultado do pagamento
        console.log('Resultado do pagamento:', JSON.stringify(responseData, null, 2));

        res.json(responseData);
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        res.status(500).json({
            error: 'Erro ao processar pagamento',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Endpoint para configurações públicas do site
app.get('/api/public/site-settings', async (_req: Request, res: Response) => {
  try {
    const settingsRepository = AppDataSource.getRepository(SiteSettings);
    const settings = await settingsRepository.findOne({ where: {} });

    if (!settings) {
      return res.status(404).json({ error: 'Configurações do site não encontradas' });
    }

    // Retorna apenas as configurações públicas
    const publicSettings = {
      siteName: settings.siteName,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      footerText: settings.footerText,
      contactEmail: settings.contactEmail,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      heroGradientFrom: settings.heroGradientFrom,
      heroGradientVia: settings.heroGradientVia,
      heroGradientTo: settings.heroGradientTo,
      facebookUrl: settings.facebookUrl,
      instagramUrl: settings.instagramUrl,
      twitterUrl: settings.twitterUrl,
      linkedinUrl: settings.linkedinUrl,
      youtubeUrl: settings.youtubeUrl
    };

    res.json(publicSettings);
  } catch (error) {
    console.error('Erro ao buscar configurações do site:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar configurações do site',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Endpoint para receber mensagens do formulário de contato
app.post('/api/public/contact', async (req: Request, res: Response) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validação básica
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                error: 'Dados incompletos',
                details: 'Todos os campos são obrigatórios'
            });
        }

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Email inválido',
                details: 'Por favor, forneça um email válido'
            });
        }

        // Busca o email de contato das configurações
        const settingsRepository = AppDataSource.getRepository(SiteSettings);
        const settings = await settingsRepository.findOne({ where: { id: 1 } });
        
        if (!settings?.contactEmail) {
            console.error('Email de contato não configurado no sistema');
        } else {
            // Envia email de notificação usando o serviço SMTP configurado
            try {
                const emailHtml = `
                    <h2>Nova mensagem de contato recebida</h2>
                    <p><strong>Nome:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Assunto:</strong> ${subject}</p>
                    <p><strong>Mensagem:</strong></p>
                    <p>${message}</p>
                `;

                await emailService.sendEmail({
                    to: settings.contactEmail,
                    subject: `Nova mensagem de contato: ${subject}`,
                    html: emailHtml
                });
            } catch (emailError) {
                console.error('Erro ao enviar email de notificação:', emailError);
                // Não retornamos erro para o usuário pois o webhook ainda funcionou
            }
        }

        // Mantém o comportamento existente do webhook
        await WebhookService.createEvent('contact.message.created', {
            name,
            email,
            subject,
            message,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({ 
            message: 'Mensagem recebida com sucesso',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erro ao processar mensagem de contato:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

// Endpoint para criar pagamento PIX
app.post('/api/payments/pix/create', async (req: Request, res: Response) => {
  try {
    const {
      transaction_amount,
      description,
      payer
    } = req.body;

    // Validar dados obrigatórios
    if (!transaction_amount || !payer.email) {
      return res.status(400).json({
        error: 'Dados de pagamento incompletos',
        details: 'Valor e email são obrigatórios'
      });
    }

    // Gerar uma chave de idempotência única
    const idempotencyKey = `pix-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    // Criar pagamento PIX no Mercado Pago
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        transaction_amount: Number(transaction_amount),
        description,
        payment_method_id: 'pix',
        payer,
        installments: 1,
        binary_mode: true
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Erro do Mercado Pago:', responseData);
      return res.status(response.status).json(responseData);
    }

    // Retorna os dados do PIX
    res.json({
      id: responseData.id,
      qr_code: responseData.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: responseData.point_of_interaction.transaction_data.qr_code_base64,
      status: responseData.status
    });
  } catch (error) {
    console.error('Erro ao criar pagamento PIX:', error);
    res.status(500).json({
      error: 'Erro ao criar pagamento PIX',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Endpoint para verificar status do PIX
app.get('/api/payments/pix/status/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar status do pagamento');
    }

    const payment = await response.json();

    res.json({
      status: payment.status,
      status_detail: payment.status_detail
    });
  } catch (error) {
    console.error('Erro ao verificar status do PIX:', error);
    res.status(500).json({
      error: 'Erro ao verificar status do PIX',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Reviews routes
app.post("/api/public/contents/:slug/reviews", async (req, res) => {
    try {
        const { slug } = req.params;
        const { comment, rating, user_email, user_name } = req.body;

        const content = await AppDataSource.getRepository(Content)
            .findOne({ where: { slug } });

        if (!content) {
            return res.status(404).json({ error: "Conteúdo não encontrado" });
        }

        const review = new Review();
        review.comment = comment;
        review.rating = rating;
        review.user_email = user_email;
        review.user_name = user_name;
        review.content = content;
        review.content_id = content.id;
        review.is_approved = false;

        await AppDataSource.getRepository(Review).save(review);

        // Dispara o webhook de criação de avaliação
        await WebhookService.createEvent('review.created', {
            review: {
                id: review.id,
                comment: review.comment,
                rating: review.rating,
                user_name: review.user_name,
                user_email: review.user_email,
                created_at: review.created_at,
                is_approved: review.is_approved
            },
            content: {
                id: content.id,
                title: content.title,
                slug: content.slug
            }
        });

        res.json({ message: "Avaliação enviada com sucesso!" });
    } catch (error) {
        console.error("Erro ao salvar avaliação:", error);
        res.status(500).json({ error: "Erro ao salvar avaliação" });
    }
});

app.get("/api/public/contents/:slug/reviews", async (req, res) => {
    try {
        const { slug } = req.params;
        const content = await AppDataSource.getRepository(Content)
            .findOne({ where: { slug } });

        if (!content) {
            return res.status(404).json({ error: "Conteúdo não encontrado" });
        }

        const reviews = await AppDataSource.getRepository(Review)
            .find({
                where: { 
                    content_id: content.id,
                    is_approved: true 
                },
                order: { created_at: "DESC" }
            });

        const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

        res.json({
            reviews,
            averageRating: reviews.length > 0 ? averageRating : 0,
            totalReviews: reviews.length
        });
    } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
        res.status(500).json({ error: "Erro ao buscar avaliações" });
    }
});

// Admin routes for reviews
app.get("/api/admin/reviews", async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const search = (req.query.search as string) || '';
        const itemsPerPage = 10;
        const offset = (page - 1) * itemsPerPage;

        const reviewRepository = AppDataSource.getRepository(Review);

        // Consulta para contar o total de registros
        const countQuery = await reviewRepository
            .createQueryBuilder('review')
            .leftJoin('review.content', 'content')
            .where(search ? 'review.user_name LIKE :search OR review.user_email LIKE :search OR review.comment LIKE :search OR content.title LIKE :search' : '1=1', {
                search: `%${search}%`
            })
            .getCount();

        // Consulta para buscar as avaliações paginadas
        const reviews = await reviewRepository
            .createQueryBuilder('review')
            .leftJoinAndSelect('review.content', 'content')
            .where(search ? 'review.user_name LIKE :search OR review.user_email LIKE :search OR review.comment LIKE :search OR content.title LIKE :search' : '1=1', {
                search: `%${search}%`
            })
            .orderBy('review.created_at', 'DESC')
            .skip(offset)
            .take(itemsPerPage)
            .getMany();

        res.json({
            reviews,
            total: countQuery,
            currentPage: page,
            totalPages: Math.ceil(countQuery / itemsPerPage)
        });
    } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
        res.status(500).json({ error: "Erro ao buscar avaliações" });
    }
});

app.put("/api/admin/reviews/:id/approve", async (req, res) => {
    try {
        const { id } = req.params;
        const review = await AppDataSource.getRepository(Review)
            .findOne({ 
                where: { id: parseInt(id) },
                relations: ["content"]
            });

        if (!review) {
            return res.status(404).json({ error: "Avaliação não encontrada" });
        }

        review.is_approved = true;
        await AppDataSource.getRepository(Review).save(review);

        // Dispara o webhook de aprovação de avaliação
        await WebhookService.createEvent('review.approved', {
            review: {
                id: review.id,
                comment: review.comment,
                rating: review.rating,
                user_name: review.user_name,
                user_email: review.user_email,
                created_at: review.created_at,
                is_approved: review.is_approved
            },
            content: {
                id: review.content.id,
                title: review.content.title,
                slug: review.content.slug
            }
        });

        res.json({ message: "Avaliação aprovada com sucesso!" });
    } catch (error) {
        console.error("Erro ao aprovar avaliação:", error);
        res.status(500).json({ error: "Erro ao aprovar avaliação" });
    }
});

app.delete("/api/admin/reviews/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const review = await AppDataSource.getRepository(Review)
            .findOne({ 
                where: { id: parseInt(id) },
                relations: ["content"]
            });

        if (!review) {
            return res.status(404).json({ error: "Avaliação não encontrada" });
        }

        // Captura os dados da avaliação antes de excluir
        const reviewData = {
            id: review.id,
            comment: review.comment,
            rating: review.rating,
            user_name: review.user_name,
            user_email: review.user_email,
            created_at: review.created_at,
            is_approved: review.is_approved,
            content: {
                id: review.content.id,
                title: review.content.title,
                slug: review.content.slug
            }
        };

        await AppDataSource.getRepository(Review).remove(review);

        // Dispara o webhook de exclusão de avaliação
        await WebhookService.createEvent('review.deleted', { review: reviewData });

        res.json({ message: "Avaliação removida com sucesso!" });
    } catch (error) {
        console.error("Erro ao remover avaliação:", error);
        res.status(500).json({ error: "Erro ao remover avaliação" });
    }
});

// Endpoint para recuperação de senha
app.post('/api/admin/forgot-password', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'E-mail é obrigatório' });
        }

        const adminRepository = AppDataSource.getRepository(Administrator);
        const admin = await adminRepository.findOne({ where: { email } });

        // Por segurança, não informamos se o email existe ou não
        if (!admin) {
            return res.json({ message: 'Se este email estiver cadastrado, você receberá as instruções de recuperação.' });
        }

        // Gera token de reset
        const resetToken = jwt.sign(
            { id: admin.id, email: admin.email, purpose: 'password-reset' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        // Envia email com instruções usando o serviço inicializado
        await emailService.sendPasswordReset(email, resetToken);

        res.json({ message: 'Se este email estiver cadastrado, você receberá as instruções de recuperação.' });
    } catch (error) {
        console.error('Erro ao processar recuperação de senha:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Endpoint para redefinir a senha
app.post('/api/admin/reset-password', async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
        }

        // Verifica o token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
                id: number;
                email: string;
                purpose: string;
            };
        } catch (error) {
            return res.status(400).json({ error: 'Token inválido ou expirado' });
        }

        // Verifica se é um token de reset de senha
        if (decodedToken.purpose !== 'password-reset') {
            return res.status(400).json({ error: 'Token inválido' });
        }

        const adminRepository = AppDataSource.getRepository(Administrator);
        const admin = await adminRepository.findOne({ where: { id: decodedToken.id } });

        if (!admin) {
            return res.status(404).json({ error: 'Administrador não encontrado' });
        }

        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(password, 10);
        admin.password_hash = hashedPassword;

        // Salva a nova senha
        await adminRepository.save(admin);

        res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Handle React routing, return all requests to React app
app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Inicializa o processador de webhooks
WebhookProcessor.start();