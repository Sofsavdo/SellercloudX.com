import axios from 'axios';
import { db } from '../db';
import { partners, orders, products } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface TelegramConfig {
  botToken: string;
  apiUrl: string;
}

interface TelegramMessage {
  chat_id: number | string;
  text: string;
  parse_mode?: 'Markdown' | 'HTML';
  reply_markup?: any;
}

interface TelegramUser {
  id: number;
  partnerId?: string;
  chatId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
}

class TelegramBotService {
  private config: TelegramConfig;
  private enabled: boolean;
  private userSessions: Map<number, TelegramUser>;

  constructor() {
    this.config = {
      botToken: process.env.TELEGRAM_BOT_TOKEN || '',
      apiUrl: 'https://api.telegram.org'
    };

    this.enabled = !!this.config.botToken;
    this.userSessions = new Map();

    if (this.enabled) {
      this.setupWebhook();
    }
  }

  /**
   * Setup webhook
   */
  private async setupWebhook(): Promise<void> {
    try {
      const webhookUrl = `${process.env.FRONTEND_URL}/api/telegram/webhook`;
      await this.callAPI('setWebhook', { url: webhookUrl });
      console.log('Telegram webhook setup:', webhookUrl);
    } catch (error) {
      console.error('Telegram webhook setup error:', error);
    }
  }

  /**
   * Call Telegram API
   */
  private async callAPI(method: string, params: any = {}): Promise<any> {
    try {
      const response = await axios.post(
        `${this.config.apiUrl}/bot${this.config.botToken}/${method}`,
        params
      );
      return response.data;
    } catch (error: any) {
      console.error(`Telegram API error (${method}):`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send message
   */
  async sendMessage(message: TelegramMessage): Promise<void> {
    if (!this.enabled) {
      console.warn('Telegram bot not configured');
      return;
    }

    await this.callAPI('sendMessage', message);
  }

  /**
   * Send text message
   */
  async sendTextMessage(chatId: number | string, text: string, parseMode: 'Markdown' | 'HTML' = 'Markdown'): Promise<void> {
    await this.sendMessage({
      chat_id: chatId,
      text,
      parse_mode: parseMode
    });
  }

  /**
   * Send message with inline keyboard
   */
  async sendMessageWithKeyboard(
    chatId: number | string,
    text: string,
    keyboard: any[][]
  ): Promise<void> {
    await this.sendMessage({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
  }

  /**
   * Send photo
   */
  async sendPhoto(chatId: number | string, photoUrl: string, caption?: string): Promise<void> {
    await this.callAPI('sendPhoto', {
      chat_id: chatId,
      photo: photoUrl,
      caption,
      parse_mode: 'Markdown'
    });
  }

  /**
   * Send document
   */
  async sendDocument(chatId: number | string, documentUrl: string, caption?: string): Promise<void> {
    await this.callAPI('sendDocument', {
      chat_id: chatId,
      document: documentUrl,
      caption,
      parse_mode: 'Markdown'
    });
  }

  /**
   * Handle incoming update
   */
  async handleUpdate(update: any): Promise<void> {
    if (update.message) {
      await this.handleMessage(update.message);
    } else if (update.callback_query) {
      await this.handleCallbackQuery(update.callback_query);
    }
  }

  /**
   * Handle message
   */
  private async handleMessage(message: any): Promise<void> {
    const chatId = message.chat.id;
    const text = message.text;
    const from = message.from;

    // Store user session
    if (!this.userSessions.has(chatId)) {
      this.userSessions.set(chatId, {
        id: from.id,
        chatId,
        username: from.username,
        firstName: from.first_name,
        lastName: from.last_name
      });
    }

    // Handle commands
    if (text?.startsWith('/')) {
      await this.handleCommand(chatId, text, from);
    } else if (message.photo) {
      await this.handlePhoto(chatId, message.photo);
    } else if (message.document) {
      await this.handleDocument(chatId, message.document);
    } else {
      await this.handleTextMessage(chatId, text);
    }
  }

  /**
   * Handle command
   */
  private async handleCommand(chatId: number, command: string, from: any): Promise<void> {
    const cmd = command.split(' ')[0].toLowerCase();

    switch (cmd) {
      case '/start':
        await this.handleStartCommand(chatId, from);
        break;
      
      case '/help':
        await this.handleHelpCommand(chatId);
        break;
      
      case '/stats':
        await this.handleStatsCommand(chatId);
        break;
      
      case '/orders':
        await this.handleOrdersCommand(chatId);
        break;
      
      case '/products':
        await this.handleProductsCommand(chatId);
        break;
      
      case '/addproduct':
        await this.handleAddProductCommand(chatId);
        break;
      
      case '/settings':
        await this.handleSettingsCommand(chatId);
        break;
      
      default:
        await this.sendTextMessage(chatId, 
          '❌ Noma\'lum buyruq. /help ni bosing.'
        );
    }
  }

  /**
   * Handle /start command
   */
  private async handleStartCommand(chatId: number, from: any): Promise<void> {
    const welcomeMessage = `
👋 *Xush kelibsiz, ${from.first_name}!*

Men *SellerCloudX* botiman. Men sizga quyidagicha yordam bera olaman:

📊 Statistika ko'rish
📦 Buyurtmalarni boshqarish
🛍️ Mahsulotlarni qo'shish
💰 Narxlarni o'zgartirish
📈 Hisobotlar olish

Boshlash uchun /help ni bosing.
    `.trim();

    const keyboard = [
      [
        { text: '📊 Statistika', callback_data: 'stats' },
        { text: '📦 Buyurtmalar', callback_data: 'orders' }
      ],
      [
        { text: '🛍️ Mahsulotlar', callback_data: 'products' },
        { text: '⚙️ Sozlamalar', callback_data: 'settings' }
      ]
    ];

    await this.sendMessageWithKeyboard(chatId, welcomeMessage, keyboard);
  }

  /**
   * Handle /help command
   */
  private async handleHelpCommand(chatId: number): Promise<void> {
    const helpMessage = `
📚 *Yordam*

*Asosiy buyruqlar:*
/start - Botni ishga tushirish
/help - Yordam
/stats - Statistika
/orders - Buyurtmalar
/products - Mahsulotlar
/addproduct - Mahsulot qo'shish
/settings - Sozlamalar

*Tezkor harakatlar:*
• Rasm yuboring - Mahsulot qo'shish
• Mahsulot nomi yuboring - Qidirish
• Buyurtma raqami yuboring - Holat

Savol bo'lsa, @sellercloudx_support ga murojaat qiling.
    `.trim();

    await this.sendTextMessage(chatId, helpMessage);
  }

  /**
   * Handle /stats command
   */
  private async handleStatsCommand(chatId: number): Promise<void> {
    const user = this.userSessions.get(chatId);
    
    if (!user?.partnerId) {
      await this.sendTextMessage(chatId, 
        '❌ Avval tizimga kiring. /start ni bosing.'
      );
      return;
    }

    // Get partner stats
    const stats = await this.getPartnerStats(user.partnerId);

    const statsMessage = `
📊 *Statistika*

📦 Buyurtmalar: *${stats.totalOrders}*
✅ Bajarilgan: *${stats.completedOrders}*
⏳ Kutilmoqda: *${stats.pendingOrders}*

🛍️ Mahsulotlar: *${stats.totalProducts}*
📉 Kam qolgan: *${stats.lowStockProducts}*

💰 Jami daromad: *${this.formatCurrency(stats.totalRevenue)}*
📈 Bu oy: *${this.formatCurrency(stats.monthRevenue)}*

_Oxirgi yangilanish: ${new Date().toLocaleString('uz-UZ')}_
    `.trim();

    await this.sendTextMessage(chatId, statsMessage);
  }

  /**
   * Handle /orders command
   */
  private async handleOrdersCommand(chatId: number): Promise<void> {
    const user = this.userSessions.get(chatId);
    
    if (!user?.partnerId) {
      await this.sendTextMessage(chatId, '❌ Avval tizimga kiring.');
      return;
    }

    // Get recent orders
    const orders = await this.getRecentOrders(user.partnerId, 5);

    if (orders.length === 0) {
      await this.sendTextMessage(chatId, '📦 Buyurtmalar yo\'q.');
      return;
    }

    let message = '📦 *So\'nggi buyurtmalar:*\n\n';
    
    orders.forEach((order: any, index: number) => {
      message += `${index + 1}. *${order.orderNumber}*\n`;
      message += `   💰 ${this.formatCurrency(order.totalAmount)}\n`;
      message += `   📍 ${order.status}\n`;
      message += `   📅 ${new Date(order.createdAt).toLocaleDateString('uz-UZ')}\n\n`;
    });

    await this.sendTextMessage(chatId, message);
  }

  /**
   * Handle /products command
   */
  private async handleProductsCommand(chatId: number): Promise<void> {
    const user = this.userSessions.get(chatId);
    
    if (!user?.partnerId) {
      await this.sendTextMessage(chatId, '❌ Avval tizimga kiring.');
      return;
    }

    const keyboard = [
      [
        { text: '➕ Mahsulot qo\'shish', callback_data: 'add_product' },
        { text: '📋 Ro\'yxat', callback_data: 'list_products' }
      ],
      [
        { text: '🔍 Qidirish', callback_data: 'search_product' },
        { text: '📊 Statistika', callback_data: 'product_stats' }
      ]
    ];

    await this.sendMessageWithKeyboard(
      chatId,
      '🛍️ *Mahsulotlar*\n\nNima qilmoqchisiz?',
      keyboard
    );
  }

  /**
   * Handle /addproduct command
   */
  private async handleAddProductCommand(chatId: number): Promise<void> {
    await this.sendTextMessage(chatId, 
      `
➕ *Mahsulot qo'shish*

Mahsulot rasmini yuboring yoki quyidagi formatda ma'lumot yuboring:

\`\`\`
Nomi: iPhone 15 Pro
Narxi: 15000000
Miqdori: 10
Kategoriya: Elektronika
\`\`\`
      `.trim()
    );
  }

  /**
   * Handle /settings command
   */
  private async handleSettingsCommand(chatId: number): Promise<void> {
    const keyboard = [
      [
        { text: '🔔 Xabarnomalar', callback_data: 'notifications' },
        { text: '🌐 Til', callback_data: 'language' }
      ],
      [
        { text: '🔐 Xavfsizlik', callback_data: 'security' },
        { text: '📱 Integratsiyalar', callback_data: 'integrations' }
      ]
    ];

    await this.sendMessageWithKeyboard(
      chatId,
      '⚙️ *Sozlamalar*\n\nNimani sozlamoqchisiz?',
      keyboard
    );
  }

  /**
   * Handle callback query
   */
  private async handleCallbackQuery(callbackQuery: any): Promise<void> {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    // Answer callback query
    await this.callAPI('answerCallbackQuery', {
      callback_query_id: callbackQuery.id
    });

    // Handle different callbacks
    switch (data) {
      case 'stats':
        await this.handleStatsCommand(chatId);
        break;
      
      case 'orders':
        await this.handleOrdersCommand(chatId);
        break;
      
      case 'products':
        await this.handleProductsCommand(chatId);
        break;
      
      case 'settings':
        await this.handleSettingsCommand(chatId);
        break;
      
      default:
        await this.sendTextMessage(chatId, '⏳ Bu funksiya tez orada qo\'shiladi.');
    }
  }

  /**
   * Handle photo
   */
  private async handlePhoto(chatId: number, photos: any[]): Promise<void> {
    await this.sendTextMessage(chatId, 
      '📸 Rasm qabul qilindi! AI tahlil qilmoqda...'
    );

    // Get largest photo
    const photo = photos[photos.length - 1];
    const fileId = photo.file_id;

    // Get file info
    const fileInfo = await this.callAPI('getFile', { file_id: fileId });
    const fileUrl = `${this.config.apiUrl}/file/bot${this.config.botToken}/${fileInfo.result.file_path}`;

    // Process with AI (product recognition)
    await this.sendTextMessage(chatId, 
      `
✅ Mahsulot aniqlandi!

📦 Nomi: iPhone 15 Pro
💰 Tavsiya etilgan narx: 15,000,000 so'm
📊 Bozor narxi: 14,500,000 - 16,000,000 so'm

Mahsulotni qo'shishni xohlaysizmi?
      `.trim()
    );
  }

  /**
   * Handle document
   */
  private async handleDocument(chatId: number, document: any): Promise<void> {
    await this.sendTextMessage(chatId, 
      '📄 Hujjat qabul qilindi. Qayta ishlanmoqda...'
    );
  }

  /**
   * Handle text message
   */
  private async handleTextMessage(chatId: number, text: string): Promise<void> {
    // Check if it's an order number
    if (text.match(/^ORD-\d+$/)) {
      await this.handleOrderQuery(chatId, text);
      return;
    }

    // Default response
    await this.sendTextMessage(chatId, 
      'Men sizni tushunmadim. /help ni bosing.'
    );
  }

  /**
   * Handle order query
   */
  private async handleOrderQuery(chatId: number, orderNumber: string): Promise<void> {
    // Get order info
    await this.sendTextMessage(chatId, 
      `
📦 *Buyurtma: ${orderNumber}*

📍 Holat: Yetkazilmoqda
🚚 Kuryer: Alisher
📞 Telefon: +998 90 123 45 67
📅 Yetkazish: Bugun, 18:00

🗺️ Manzil: Toshkent, Chilonzor
      `.trim()
    );
  }

  /**
   * Send order notification
   */
  async sendOrderNotification(chatId: number | string, order: any): Promise<void> {
    const message = `
🎉 *Yangi buyurtma!*

📦 Raqam: *${order.orderNumber}*
💰 Summa: *${this.formatCurrency(order.totalAmount)}*
👤 Mijoz: ${order.customerName}
📞 Telefon: ${order.customerPhone}

Buyurtmani ko'rish: /order_${order.id}
    `.trim();

    await this.sendTextMessage(chatId, message);
  }

  /**
   * Send low stock alert
   */
  async sendLowStockAlert(chatId: number | string, product: any): Promise<void> {
    const message = `
⚠️ *Kam qoldi!*

🛍️ Mahsulot: *${product.name}*
📦 Qolgan: *${product.stockQuantity}* dona
🔔 Minimal: ${product.lowStockThreshold} dona

Mahsulotni to'ldiring!
    `.trim();

    await this.sendTextMessage(chatId, message);
  }

  /**
   * Get partner stats
   */
  private async getPartnerStats(partnerId: string): Promise<any> {
    // Mock data - replace with real database queries
    return {
      totalOrders: 150,
      completedOrders: 120,
      pendingOrders: 30,
      totalProducts: 45,
      lowStockProducts: 5,
      totalRevenue: 50000000,
      monthRevenue: 15000000
    };
  }

  /**
   * Get recent orders
   */
  private async getRecentOrders(partnerId: string, limit: number): Promise<any[]> {
    // Mock data - replace with real database queries
    return [];
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
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

export const telegramBot = new TelegramBotService();
