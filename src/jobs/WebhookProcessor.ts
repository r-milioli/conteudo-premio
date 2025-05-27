import { WebhookService } from "../services/WebhookService.js";

export class WebhookProcessor {
    private static isRunning = false;
    private static interval: NodeJS.Timeout | null = null;

    public static start(intervalMs: number = 60000): void {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        this.interval = setInterval(async () => {
            try {
                await WebhookService.retryFailedEvents();
            } catch (error: unknown) {
                console.error("Error processing webhook events:", error instanceof Error ? error.message : "Unknown error");
            }
        }, intervalMs);
    }

    public static stop(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
    }
} 