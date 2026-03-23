import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import path from 'path';
import fs from 'fs';
import logger from './logger';

export class WhatsAppEngine {
    private client: Client;
    private isReady: boolean = false;
    private qrCode: string | null = null;
    private vendorId: string;

    constructor(vendorId: string) {
        this.vendorId = vendorId;
        const sessionPath = path.join(process.cwd(), 'whatsapp_session', `vendor_${vendorId}`);
        
        // Ensure session directory exists
        if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
        }

        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: `vendor_${vendorId}`,
                dataPath: './whatsapp_session'
            }),
            puppeteer: {
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu'
                ],
                headless: true
            }
        });

        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.client.on('qr', (qr) => {
            this.qrCode = qr;
            logger.info(`[WhatsApp] QR code generated for vendor ${this.vendorId}`);
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            logger.info(`[WhatsApp] READY: Client is ready for vendor ${this.vendorId}`);
            this.isReady = true;
            this.qrCode = null;
        });

        this.client.on('message', async (msg) => {
            logger.info(`[WhatsApp] Message received for ${this.vendorId} from ${msg.from}`);
        });

        this.client.on('authenticated', () => {
            logger.info(`[WhatsApp] AUTH: Authenticated successfully for vendor ${this.vendorId}`);
        });

        this.client.on('auth_failure', (msg) => {
            logger.error(`[WhatsApp] AUTH FAILURE for ${this.vendorId}: ${msg}`);
            this.isReady = false;
        });

        this.client.on('disconnected', (reason) => {
            logger.info(`[WhatsApp] DISCONNECTED for Vendor ${this.vendorId}: ${reason}`);
            this.isReady = false;
            this.qrCode = null;
        });
    }

    public async initialize() {
        try {
            await this.client.initialize();
        } catch (error) {
            console.error(`Failed to initialize WhatsApp client for Vendor ${this.vendorId}:`, error);
        }
    }

    public getStatus() {
        return {
            isReady: this.isReady,
            qrCode: this.qrCode,
            vendorId: this.vendorId
        };
    }

    private formatNumber(phone: string) {
        if (!phone) return '';
        let formatted = phone.replace(/\D/g, '');
        // Handle India numbers
        if (formatted.length === 10) {
            formatted = '91' + formatted;
        } else if (formatted.length === 12 && formatted.startsWith('91')) {
            // Already includes 91
        } else if (formatted.length > 10) {
            // Probably already has country code, leave as is but ensure no +
        }
        
        const chatId = formatted.includes('@') ? formatted : `${formatted}@c.us`;
        logger.info(`[WhatsApp] Formatted number: ${phone} -> ${chatId}`);
        return chatId;
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async waitUntilReady(timeoutMs: number = 30000): Promise<boolean> {
        if (this.isReady) return true;
        
        console.log(`[WhatsApp] Waiting for engine ${this.vendorId} to become ready...`);
        return new Promise((resolve) => {
            const start = Date.now();
            const check = setInterval(() => {
                if (this.isReady) {
                    clearInterval(check);
                    resolve(true);
                } else if (Date.now() - start > timeoutMs) {
                    clearInterval(check);
                    console.warn(`[WhatsApp] Timeout waiting for engine ${this.vendorId} to be ready`);
                    resolve(false);
                }
            }, 1000);
        });
    }

    public async sendMessage(phone: string, message: string) {
        // Wait for ready state if not already ready
        const ready = await this.waitUntilReady();
        if (!ready) {
            console.warn(`[WhatsApp] Engine for ${this.vendorId} is not ready after waiting. Message not sent.`);
            return false;
        }

        try {
            const chatId = this.formatNumber(phone);
            if (!chatId || chatId === '@c.us') {
                logger.error(`[WhatsApp] Invalid phone number reached sendMessage: ${phone}`);
                return false;
            }

            // Check if the number is registered on WhatsApp first
            const isRegistered = await this.client.isRegisteredUser(chatId);
            if (!isRegistered) {
                logger.warn(`[WhatsApp] FAIL: To ${phone} from ${this.vendorId}: Number is not registered on WhatsApp`);
                return false;
            }

            logger.info(`[WhatsApp] SENDING: From ${this.vendorId} to ${chatId}...`);
            
            // Send the actual message
            await this.client.sendMessage(chatId, message);
            
            logger.info(`[WhatsApp] SUCCESS: Sent to ${phone} from ${this.vendorId}`);
            return true;
        } catch (error: any) {
            logger.error(`[WhatsApp] FAIL: To ${phone} from ${this.vendorId}: ${error.message}`);
            return false;
        }
    }

    public async sendOrderSuccess(order: any, shopName: string = 'Our Shop') {
        console.log(`[WhatsApp] Preparing order success notification for order ${order.id} from ${shopName}...`);
        if (!order.customer?.phone) {
            console.warn(`[WhatsApp] No customer phone found for order ${order.id}`);
            return false;
        }
        
        const itemsList = order.items.map((item: any) => `• ${item.name} (x${item.quantity})`).join('\n');
        const message = `*Order Confirmed!* 🎉\n\nHello *${order.customer.name}*,\n\nGreat news! Your order *${order.id}* from *${shopName}* has been successfully placed.\n\n*Order Details:*\n${itemsList}\n\n*Total Amount:* ₹${order.total}\n\n*Delivery Address:*\n${order.customer.address}, ${order.customer.pincode}\n\nThank you for choosing *Grofast*! We hope you love your products. 🌿`;
        return this.sendMessage(order.customer.phone, message);
    }

    public async sendNewOrderToVendor(order: any, vendorPhone: string) {
        if (!vendorPhone) return false;
        
        const itemsList = order.items.map((item: any) => `• ${item.name} (x${item.quantity})`).join('\n');
        const message = `*New Order Received!* 📦\n\n*Order ID:* ${order.id}\n*Customer:* ${order.customer.name}\n*Phone:* ${order.customer.phone}\n*Address:* ${order.customer.address}, ${order.customer.pincode}\n\n*Items:*\n${itemsList}\n\n*Total Revenue:* ₹${order.total}\n\nPlease check your dashboard to process this order. 🚀`;
        
        return this.sendMessage(vendorPhone, message);
    }

    public async sendOrderDelivered(order: any) {
        const message = `*Order Delivered!* 🚚\n\nHello *${order.customer.name}*,\n\nYour order *${order.id}* has been delivered successfully. ✨\n\nWe hope you're happy with your purchase! If you enjoyed our service, please leave a rating on the app.\n\nThank you for choosing *Grofast*! 🌿`;
        return this.sendMessage(order.customer.phone, message);
    }

    public async sendOrderCancelled(order: any, shopName: string, vendorPhone: string, reason: string) {
        const message = `*Order Cancelled* ❌\n\nHello ${order.customer.name},\nWe're sorry to inform you that your order *${order.id}* has been cancelled by the shop *${shopName}*.\n\n*Reason:* ${reason}\n\n*Shop Contact:* ${vendorPhone}\n\nPlease contact the shop for more details or try ordering from another store.\n\nGrofast Team`;
        return this.sendMessage(order.customer.phone, message);
    }
}

export class WhatsAppManager {
    private engines: Map<string, WhatsAppEngine> = new Map();

    public async getEngine(vendorId: string): Promise<WhatsAppEngine> {
        let engine = this.engines.get(vendorId);
        if (!engine) {
            console.log(`Initializing new WhatsApp engine for vendor: ${vendorId}`);
            engine = new WhatsAppEngine(vendorId);
            this.engines.set(vendorId, engine);
            await engine.initialize();
        }
        return engine;
    }

    public getStatus(vendorId: string) {
        const engine = this.engines.get(vendorId);
        if (!engine) {
            return { isReady: false, qrCode: null, vendorId, initialized: false };
        }
        return { ...engine.getStatus(), initialized: true };
    }
}

export const whatsappManager = new WhatsAppManager();
