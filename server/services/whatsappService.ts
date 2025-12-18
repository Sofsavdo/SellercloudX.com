import axios from 'axios';
import { db } from '../db';
import { partners, orders } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface WhatsAppConfig {
  apiUrl: string;
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
}

interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'interactive';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  interactive?: any;
}

interface WhatsAppNotification {
  partnerId: string;
  phone: string;
  type: 'order_confirmation' | 'order_status' | 'payment_reminder' | 'marketing' | 'support';
  data: any;
}

class WhatsAppService {
  private config: WhatsAppConfig;
  private enabled: boolean;

  constructor() {
    this.config = {
      apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0',
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || ''
    };

    this.enabled = !!(this.config.accessToken && this.config.phoneNumberId);
  }

  /**
   * Send WhatsApp message
   */
  async sendMessage(message: WhatsAppMessage): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    if (!this.enabled) {
      console.warn('WhatsApp service not configured');
      return { success: false, error: 'WhatsApp service not configured' };
    }

    try {
      const response = await axios.post(
        `${this.config.apiUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          ...message
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id
      };
    } catch (error: any) {
      console.error('WhatsApp send error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Send text message
   */
  async sendTextMessage(phone: string, text: string): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    return this.sendMessage({
      to: this.formatPhoneNumber(phone),
      type: 'text',
      text: { body: text }
    });
  }

  /**
   * Send template message
   */
  async sendTemplateMessage(
    phone: string,
    templateName: string,
    languageCode: string = 'uz',
    components?: any[]
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    return this.sendMessage({
      to: this.formatPhoneNumber(phone),
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components
      }
    });
  }

  /**
   * Send order confirmation
   */
  async sendOrderConfirmation(notification: WhatsAppNotification): Promise<void> {
    const { phone, data } = notification;
    const { orderNumber, totalAmount, items } = data;

    const message = `
🎉 *Buyurtma tasdiqlandi!*

📦 Buyurtma raqami: *${orderNumber}*
💰 Jami summa: *${this.formatCurrency(totalAmount)}*

📋 Mahsulotlar:
${items.map((item: any, index: number) => 
  `${index + 1}. ${item.name} - ${item.quantity} dona`
).join('\n')}

✅ Buyurtmangiz qabul qilindi va tez orada yetkazib beriladi.

Savol bo'lsa, biz bilan bog'laning: +998 XX XXX XX XX
    `.trim();

    await this.sendTextMessage(phone, message);
  }

  /**
   * Send order status update
   */
  async sendOrderStatusUpdate(notification: WhatsAppNotification): Promise<void> {
    const { phone, data } = notification;
    const { orderNumber, status, trackingNumber } = data;

    const statusMessages: Record<string, string> = {
      processing: '⏳ Buyurtmangiz tayyorlanmoqda',
      shipped: '🚚 Buyurtmangiz yo\'lga chiqdi',
      delivered: '✅ Buyurtmangiz yetkazib berildi',
      cancelled: '❌ Buyurtmangiz bekor qilindi'
    };

    let message = `
${statusMessages[status] || '📦 Buyurtma holati yangilandi'}

📦 Buyurtma: *${orderNumber}*
📍 Holat: *${status}*
    `.trim();

    if (trackingNumber) {
      message += `\n🔍 Kuzatuv raqami: *${trackingNumber}*`;
    }

    await this.sendTextMessage(phone, message);
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(notification: WhatsAppNotification): Promise<void> {
    const { phone, data } = notification;
    const { amount, dueDate, invoiceUrl } = data;

    const message = `
💳 *To'lov eslatmasi*

Hurmatli mijoz, sizda to'lanmagan hisob-faktura mavjud:

💰 Summa: *${this.formatCurrency(amount)}*
📅 Muddat: *${dueDate}*

To'lov qilish uchun: ${invoiceUrl}

Savol bo'lsa, biz bilan bog'laning.
    `.trim();

    await this.sendTextMessage(phone, message);
  }

  /**
   * Send marketing message
   */
  async sendMarketingMessage(notification: WhatsAppNotification): Promise<void> {
    const { phone, data } = notification;
    const { title, message, imageUrl, ctaUrl } = data;

    let fullMessage = `
🎁 *${title}*

${message}
    `.trim();

    if (ctaUrl) {
      fullMessage += `\n\n👉 Batafsil: ${ctaUrl}`;
    }

    await this.sendTextMessage(phone, fullMessage);
  }

  /**
   * Send support message
   */
  async sendSupportMessage(notification: WhatsAppNotification): Promise<void> {
    const { phone, data } = notification;
    const { message } = data;

    await this.sendTextMessage(phone, message);
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(notifications: WhatsAppNotification[]): Promise<{
    success: number;
    failed: number;
    errors: any[];
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[]
    };

    for (const notification of notifications) {
      try {
        await this.sendNotification(notification);
        results.success++;
        
        // Rate limiting - 80 messages per second for WhatsApp Business API
        await this.delay(15);
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          phone: notification.phone,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Send notification based on type
   */
  async sendNotification(notification: WhatsAppNotification): Promise<void> {
    switch (notification.type) {
      case 'order_confirmation':
        await this.sendOrderConfirmation(notification);
        break;
      
      case 'order_status':
        await this.sendOrderStatusUpdate(notification);
        break;
      
      case 'payment_reminder':
        await this.sendPaymentReminder(notification);
        break;
      
      case 'marketing':
        await this.sendMarketingMessage(notification);
        break;
      
      case 'support':
        await this.sendSupportMessage(notification);
        break;
      
      default:
        throw new Error(`Unknown notification type: ${notification.type}`);
    }
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(body: any): Promise<void> {
    const { entry } = body;

    if (!entry || !entry[0]) {
      return;
    }

    const changes = entry[0].changes;
    if (!changes || !changes[0]) {
      return;
    }

    const value = changes[0].value;
    if (!value.messages || !value.messages[0]) {
      return;
    }

    const message = value.messages[0];
    const from = message.from;
    const text = message.text?.body;
    const messageType = message.type;

    console.log('WhatsApp incoming message:', {
      from,
      type: messageType,
      text
    });

    // Handle different message types
    if (messageType === 'text') {
      await this.handleTextMessage(from, text);
    } else if (messageType === 'interactive') {
      await this.handleInteractiveMessage(from, message.interactive);
    }
  }

  /**
   * Handle text message
   */
  private async handleTextMessage(from: string, text: string): Promise<void> {
    // Simple command handling
    const lowerText = text.toLowerCase().trim();

    if (lowerText.includes('buyurtma') || lowerText.includes('order')) {
      await this.sendTextMessage(from, 
        'Buyurtmangiz haqida ma\'lumot olish uchun buyurtma raqamingizni yuboring.'
      );
    } else if (lowerText.includes('yordam') || lowerText.includes('help')) {
      await this.sendTextMessage(from,
        `
🤖 *SellerCloudX Yordam*

Quyidagi buyruqlardan foydalanishingiz mumkin:
• Buyurtma - Buyurtma holati
• Narx - Narxlar haqida
• Yordam - Yordam olish
• Aloqa - Biz bilan bog'lanish

Yoki to'g'ridan-to'g'ri savolingizni yozing.
        `.trim()
      );
    } else {
      // Forward to support team
      console.log('Forwarding message to support:', { from, text });
    }
  }

  /**
   * Handle interactive message (buttons, lists)
   */
  private async handleInteractiveMessage(from: string, interactive: any): Promise<void> {
    const { type, button_reply, list_reply } = interactive;

    if (type === 'button_reply') {
      const buttonId = button_reply.id;
      console.log('Button clicked:', buttonId);
      // Handle button action
    } else if (type === 'list_reply') {
      const listId = list_reply.id;
      console.log('List item selected:', listId);
      // Handle list selection
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(signature: string, body: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.WHATSAPP_APP_SECRET || '')
      .update(body)
      .digest('hex');

    return signature === `sha256=${expectedSignature}`;
  }

  /**
   * Format phone number for WhatsApp
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present (Uzbekistan: +998)
    if (!cleaned.startsWith('998')) {
      cleaned = '998' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Format currency
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

export const whatsappService = new WhatsAppService();
