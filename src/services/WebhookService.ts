import { AppDataSource } from "../database/data-source.js";
import { WebhookEvent } from "../database/entities/WebhookEvent.js";
import { SiteSettings } from "../database/entities/SiteSettings.js";
import fetch from "node-fetch";
import crypto from "crypto";
import { LessThan } from "typeorm";

export class WebhookService {
    private static async getSiteSettings() {
        const settingsRepository = AppDataSource.getRepository(SiteSettings);
        return await settingsRepository.findOne({ where: {} });
    }

    private static generateSignature(payload: any, secretKey: string): string {
        const hmac = crypto.createHmac("sha256", secretKey);
        hmac.update(JSON.stringify(payload));
        return hmac.digest("hex");
    }

    private static async sendWebhook(url: string, payload: any, secretKey: string): Promise<void> {
        const signature = this.generateSignature(payload, secretKey);
        
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Webhook-Signature": signature,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }

    public static async createEvent(eventType: string, payload: any): Promise<void> {
        const settings = await this.getSiteSettings();
        if (!settings?.webhookUrl || !settings?.secretKey) {
            console.log("Webhook não configurado: URL ou chave secreta faltando");
            return;
        }

        // Bypass enabledEvents check for Mercado Pago and contact form events
        const bypassEvents = [
            'payment_success', 
            'payment_failure', 
            'contact.message.created',
            'review.created',
            'review.approved',
            'review.deleted'
        ];
        const enabledEvents = JSON.parse(settings.enabledEvents || "[]");
        
        if (!bypassEvents.includes(eventType) && !enabledEvents.includes(eventType)) {
            console.log(`Evento ${eventType} não está habilitado`);
            return;
        }

        const webhookEventRepository = AppDataSource.getRepository(WebhookEvent);
        const webhookEvent = webhookEventRepository.create({
            event_type: eventType,
            payload,
            status: "pending",
        });

        await webhookEventRepository.save(webhookEvent);

        // Tenta enviar o webhook imediatamente
        try {
            await this.sendWebhook(settings.webhookUrl, {
                id: webhookEvent.id,
                type: eventType,
                created_at: webhookEvent.created_at,
                data: payload,
            }, settings.secretKey);

            webhookEvent.status = "delivered";
            await webhookEventRepository.save(webhookEvent);
            console.log(`Webhook enviado com sucesso para ${settings.webhookUrl}`);
        } catch (error: unknown) {
            webhookEvent.status = "failed";
            webhookEvent.error_message = error instanceof Error ? error.message : "Unknown error";
            webhookEvent.retry_count += 1;
            webhookEvent.last_attempt = new Date();
            await webhookEventRepository.save(webhookEvent);
            console.error("Erro ao enviar webhook:", error instanceof Error ? error.message : "Unknown error");
        }
    }

    public static async retryFailedEvents(): Promise<void> {
        const settings = await this.getSiteSettings();
        if (!settings?.webhookUrl || !settings?.secretKey) {
            return;
        }

        const webhookEventRepository = AppDataSource.getRepository(WebhookEvent);
        const failedEvents = await webhookEventRepository.find({
            where: {
                status: "failed",
                retry_count: LessThan(settings.retryAttempts),
            },
        });

        for (const event of failedEvents) {
            try {
                await this.sendWebhook(settings.webhookUrl, {
                    id: event.id,
                    type: event.event_type,
                    created_at: event.created_at,
                    data: event.payload,
                }, settings.secretKey);

                event.status = "delivered";
                await webhookEventRepository.save(event);
            } catch (error: unknown) {
                event.status = "failed";
                event.error_message = error instanceof Error ? error.message : "Unknown error";
                event.retry_count += 1;
                event.last_attempt = new Date();
                await webhookEventRepository.save(event);
            }
        }
    }
} 