// Yandex Market Partner API Integration Service
// Based on: https://yandex.ru/dev/market/partner-api/doc/ru/

import axios, { AxiosInstance } from 'axios';

interface YandexMarketCredentials {
  apiKey: string;
  campaignId?: string;
  oauthToken?: string;
}

interface YandexProduct {
  offerId: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  vendor?: string;
  description?: string;
  pictures?: string[];
  availability?: 'ACTIVE' | 'INACTIVE';
  count?: number;
}

interface YandexOrder {
  id: string;
  status: string;
  creationDate: string;
  items: Array<{
    offerId: string;
    count: number;
    price: number;
  }>;
  delivery: {
    type: string;
    address?: string;
  };
  buyer?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

interface YandexAnalytics {
  orders: {
    total: number;
    revenue: number;
    averageOrderValue: number;
    period: string;
  };
  products: {
    views: number;
    clicks: number;
    conversion: number;
  };
  qualityIndex: {
    score: number;
    factors: Array<{
      name: string;
      score: number;
      impact: 'positive' | 'negative';
    }>;
  };
}

export class YandexMarketService {
  private api: AxiosInstance;
  private credentials: YandexMarketCredentials;

  constructor(credentials: YandexMarketCredentials) {
    this.credentials = credentials;
    this.api = axios.create({
      baseURL: 'https://api.partner.market.yandex.ru',
      headers: {
        'Authorization': `OAuth ${credentials.oauthToken || credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // ==================== PRODUCTS MANAGEMENT ====================
  
  /**
   * Mahsulotlarni qo'shish/yangilash
   * POST /campaigns/{campaignId}/offers
   */
  async createOrUpdateProduct(product: YandexProduct, campaignId?: string): Promise<string> {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error('Campaign ID required');

    try {
      const response = await this.api.post(`/campaigns/${cId}/offers`, {
        offers: [{
          offerId: product.offerId,
          name: product.name,
          category: product.category,
          price: product.price,
          oldPrice: product.oldPrice,
          vendor: product.vendor,
          description: product.description,
          pictures: product.pictures,
          availability: product.availability || 'ACTIVE',
          count: product.count,
        }],
      });

      return response.data.offerId || product.offerId;
    } catch (error: any) {
      console.error('Yandex Market: Product creation error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Mahsulotlarni o'chirish
   * DELETE /campaigns/{campaignId}/offers/{offerId}
   */
  async deleteProduct(offerId: string, campaignId?: string): Promise<boolean> {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error('Campaign ID required');

    try {
      await this.api.delete(`/campaigns/${cId}/offers/${offerId}`);
      return true;
    } catch (error: any) {
      console.error('Yandex Market: Product deletion error:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Mahsulotlar ro'yxatini olish
   * GET /campaigns/{campaignId}/offers
   */
  async getProducts(campaignId?: string, limit: number = 100): Promise<YandexProduct[]> {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error('Campaign ID required');

    try {
      const response = await this.api.get(`/campaigns/${cId}/offers`, {
        params: { limit },
      });

      return response.data.result?.offers || [];
    } catch (error: any) {
      console.error('Yandex Market: Get products error:', error.response?.data || error.message);
      return [];
    }
  }

  // ==================== PRICES MANAGEMENT ====================

  /**
   * Narxlarni yangilash
   * POST /campaigns/{campaignId}/offer-prices/updates
   */
  async updatePrices(
    prices: Array<{ offerId: string; price: number; oldPrice?: number }>,
    campaignId?: string
  ): Promise<boolean> {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error('Campaign ID required');

    try {
      await this.api.post(`/campaigns/${cId}/offer-prices/updates`, {
        offers: prices.map(p => ({
          offerId: p.offerId,
          price: p.price,
          oldPrice: p.oldPrice,
        })),
      });

      return true;
    } catch (error: any) {
      console.error('Yandex Market: Price update error:', error.response?.data || error.message);
      return false;
    }
  }

  // ==================== INVENTORY MANAGEMENT ====================

  /**
   * Qoldiqlarni yangilash
   * POST /campaigns/{campaignId}/offers/stocks
   */
  async updateStocks(
    stocks: Array<{ offerId: string; count: number }>,
    campaignId?: string
  ): Promise<boolean> {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error('Campaign ID required');

    try {
      await this.api.post(`/campaigns/${cId}/offers/stocks`, {
        skus: stocks.map(s => ({
          offerId: s.offerId,
          count: s.count,
        })),
      });

      return true;
    } catch (error: any) {
      console.error('Yandex Market: Stock update error:', error.response?.data || error.message);
      return false;
    }
  }

  // ==================== ORDERS MANAGEMENT ====================

  /**
   * Buyurtmalarni olish
   * GET /campaigns/{campaignId}/orders
   */
  async getOrders(
    campaignId?: string,
    status?: string,
    fromDate?: string,
    toDate?: string
  ): Promise<YandexOrder[]> {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error('Campaign ID required');

    try {
      const params: any = {};
      if (status) params.status = status;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await this.api.get(`/campaigns/${cId}/orders`, { params });

      return response.data.result?.orders || [];
    } catch (error: any) {
      console.error('Yandex Market: Get orders error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Buyurtma holatini yangilash
   * PUT /campaigns/{campaignId}/orders/{orderId}/status
   */
  async updateOrderStatus(
    orderId: string,
    status: string,
    campaignId?: string
  ): Promise<boolean> {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error('Campaign ID required');

    try {
      await this.api.put(`/campaigns/${cId}/orders/${orderId}/status`, {
        status,
      });

      return true;
    } catch (error: any) {
      console.error('Yandex Market: Order status update error:', error.response?.data || error.message);
      return false;
    }
  }

  // ==================== ANALYTICS ====================

  /**
   * Analitik ma'lumotlarni olish
   * GET /campaigns/{campaignId}/stats/orders
   */
  async getAnalytics(
    campaignId?: string,
    fromDate?: string,
    toDate?: string
  ): Promise<YandexAnalytics> {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error('Campaign ID required');

    try {
      const params: any = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      // Orders analytics
      const ordersResponse = await this.api.get(`/campaigns/${cId}/stats/orders`, { params });
      
      // Quality Index
      const qualityResponse = await this.api.get(`/campaigns/${cId}/quality/index`);

      const ordersData = ordersResponse.data.result || {};
      const qualityData = qualityResponse.data.result || {};

      return {
        orders: {
          total: ordersData.total || 0,
          revenue: ordersData.revenue || 0,
          averageOrderValue: ordersData.averageOrderValue || 0,
          period: `${fromDate || 'start'} - ${toDate || 'now'}`,
        },
        products: {
          views: ordersData.views || 0,
          clicks: ordersData.clicks || 0,
          conversion: ordersData.conversion || 0,
        },
        qualityIndex: {
          score: qualityData.score || 0,
          factors: qualityData.factors || [],
        },
      };
    } catch (error: any) {
      console.error('Yandex Market: Analytics error:', error.response?.data || error.message);
      return {
        orders: { total: 0, revenue: 0, averageOrderValue: 0, period: '' },
        products: { views: 0, clicks: 0, conversion: 0 },
        qualityIndex: { score: 0, factors: [] },
      };
    }
  }

  /**
   * Indeks sifatini olish
   * GET /campaigns/{campaignId}/quality/index
   */
  async getQualityIndex(campaignId?: string): Promise<number> {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error('Campaign ID required');

    try {
      const response = await this.api.get(`/campaigns/${cId}/quality/index`);
      return response.data.result?.score || 0;
    } catch (error: any) {
      console.error('Yandex Market: Quality index error:', error.response?.data || error.message);
      return 0;
    }
  }

  // ==================== CHAT MANAGEMENT ====================

  /**
   * Chatlarni olish
   * GET /campaigns/{campaignId}/chats
   */
  async getChats(campaignId?: string): Promise<any[]> {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error('Campaign ID required');

    try {
      const response = await this.api.get(`/campaigns/${cId}/chats`);
      return response.data.result?.chats || [];
    } catch (error: any) {
      console.error('Yandex Market: Get chats error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Chat xabarlarini yuborish
   * POST /campaigns/{campaignId}/chats/{chatId}/messages
   */
  async sendChatMessage(
    chatId: string,
    message: string,
    campaignId?: string
  ): Promise<boolean> {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error('Campaign ID required');

    try {
      await this.api.post(`/campaigns/${cId}/chats/${chatId}/messages`, {
        message,
      });

      return true;
    } catch (error: any) {
      console.error('Yandex Market: Send message error:', error.response?.data || error.message);
      return false;
    }
  }

  // ==================== WAREHOUSES ====================

  /**
   * Skladlarni olish
   * GET /campaigns/{campaignId}/warehouses
   */
  async getWarehouses(campaignId?: string): Promise<any[]> {
    const cId = campaignId || this.credentials.campaignId;
    if (!cId) throw new Error('Campaign ID required');

    try {
      const response = await this.api.get(`/campaigns/${cId}/warehouses`);
      return response.data.result?.warehouses || [];
    } catch (error: any) {
      console.error('Yandex Market: Get warehouses error:', error.response?.data || error.message);
      return [];
    }
  }
}

export default YandexMarketService;

