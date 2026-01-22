// Yandex Market API Service - REAL Implementation
import axios, { AxiosInstance } from 'axios';

const YANDEX_API_KEY = process.env.YANDEX_API_KEY || 'ACMA:CEZ5yFOtzlZ3IKfhPdMq0FN5R1EMdnHAaxQYDvtg:509d92ef';
const YANDEX_CAMPAIGN_ID = process.env.YANDEX_CAMPAIGN_ID || '148650502';
const YANDEX_BASE_URL = 'https://api.partner.market.yandex.net'; // Uzbekistan uses .net

export interface YandexProductData {
  offer_id: string; // Unique SKU
  name: string;
  description: string;
  price: number;
  currency: string;
  category_id?: number;
  vendor?: string; // Brand
  pictures?: string[];
  vat?: number;
}

export interface YandexProductResult {
  success: boolean;
  offer_id?: string;
  status?: string;
  error?: string;
  details?: any;
}

class YandexMarketService {
  private client: AxiosInstance;
  private apiKey: string;
  private campaignId: string;

  constructor(apiKey: string = YANDEX_API_KEY, campaignId: string = YANDEX_CAMPAIGN_ID) {
    this.apiKey = apiKey;
    this.campaignId = campaignId;
    
    this.client = axios.create({
      baseURL: YANDEX_BASE_URL,
      timeout: 30000,
      headers: {
        'Authorization': `OAuth ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Yandex Market Service initialized');
    console.log(`Campaign ID: ${campaignId}`);
  }

  /**
   * Create/Update product on Yandex Market
   * Uses POST /v2/campaigns/{campaignId}/offers/update
   */
  async createProduct(productData: YandexProductData): Promise<YandexProductResult> {
    try {
      console.log('📦 Creating product on Yandex Market...');
      console.log('Product:', productData.name);

      // Yandex Market uses offer updates
      const payload = {
        offers: [
          {
            offerId: productData.offer_id,
            name: productData.name,
            description: productData.description,
            vendor: productData.vendor || 'Generic',
            price: {
              value: productData.price,
              currencyId: productData.currency || 'UZS',
            },
            pictures: productData.pictures || [],
            available: true,
          },
        ],
      };

      // Call Yandex Market API
      const response = await this.client.post(
        `/v2/campaigns/${this.campaignId}/offers/update`,
        payload
      );

      console.log('✅ Product created on Yandex Market');
      console.log('Response:', response.data);

      return {
        success: true,
        offer_id: productData.offer_id,
        status: response.data?.status || 'processing',
        details: response.data,
      };
    } catch (error: any) {
      console.error('❌ Yandex Market error:', error.message);
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        return {
          success: false,
          error: error.response.data?.message || error.message,
          details: error.response.data,
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update product price
   * Uses POST /v2/campaigns/{campaignId}/offer-prices/updates
   */
  async updatePrice(offerId: string, price: number, currency: string = 'UZS'): Promise<boolean> {
    try {
      const payload = {
        offers: [
          {
            id: offerId,
            price: {
              value: price,
              currencyId: currency,
            },
          },
        ],
      };

      await this.client.post(
        `/v2/campaigns/${this.campaignId}/offer-prices/updates`,
        payload
      );

      console.log(`✅ Price updated for offer ${offerId}`);
      return true;
    } catch (error: any) {
      console.error('❌ Price update failed:', error.message);
      return false;
    }
  }

  /**
   * Get product status
   */
  async getProductStatus(offerId: string): Promise<any> {
    try {
      const response = await this.client.post(
        `/v2/campaigns/${this.campaignId}/offers`,
        {
          offerIds: [offerId],
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Get status failed:', error.message);
      return null;
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Yandex Market API connection...');
      
      // Try to get campaign info
      const response = await this.client.get(`/v2/campaigns/${this.campaignId}`);
      
      console.log('✅ Yandex Market API: Connected');
      console.log('Campaign:', response.data?.campaign?.domain);
      return true;
    } catch (error: any) {
      console.error('❌ Yandex Market API: Connection failed');
      console.error('Error:', error.message);
      return false;
    }
  }
}

export default YandexMarketService;
export const yandexMarketService = new YandexMarketService();
