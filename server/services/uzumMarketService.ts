// Uzum Market API Service - REAL Implementation
import axios, { AxiosInstance } from 'axios';

// API key from environment variable only - no default value for security
const UZUM_API_KEY = process.env.UZUM_API_KEY || '';
const UZUM_BASE_URL = 'https://api-seller.uzum.uz/api/seller-openapi';

export interface UzumProductData {
  title: string;
  description: string;
  images: string[];
  price: number;
  quantity: number;
  category_id?: number;
  brand?: string;
  attributes?: Record<string, any>;
}

export interface UzumProductResult {
  success: boolean;
  product_id?: string;
  sku?: string;
  status?: string;
  error?: string;
  details?: any;
}

class UzumMarketService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string = UZUM_API_KEY) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: UZUM_BASE_URL,
      timeout: 30000,
      headers: {
        // Uzum API: Token WITHOUT "Bearer" prefix (as per documentation)
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Uzum Market Service initialized');
    console.log('🔑 API Key format: Direct token (no Bearer prefix)');
  }

  /**
   * Create product on Uzum Market
   */
  async createProduct(productData: UzumProductData): Promise<UzumProductResult> {
    try {
      console.log('📦 Creating product on Uzum Market...');
      console.log('Product:', productData.title);

      // Uzum Market product creation payload
      const payload = {
        name: productData.title,
        description: productData.description,
        price: productData.price,
        quantity: productData.quantity,
        images: productData.images,
        category_id: productData.category_id || 1000, // Default category
        brand: productData.brand || 'Generic',
        attributes: productData.attributes || {},
      };

      // Call Uzum API - endpoint from documentation
      const response = await this.client.post('/api/seller/products', payload);

      console.log('✅ Product created on Uzum Market');
      console.log('Response:', response.data);

      return {
        success: true,
        product_id: response.data?.id || response.data?.product_id,
        sku: response.data?.sku,
        status: response.data?.status || 'pending',
        details: response.data,
      };
    } catch (error: any) {
      console.error('❌ Uzum Market error:', error.message);
      
      // Handle specific errors
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
   */
  async updatePrice(productId: string, price: number): Promise<boolean> {
    try {
      await this.client.patch(`/api/seller/products/${productId}/price`, {
        price,
      });
      console.log(`✅ Price updated for product ${productId}`);
      return true;
    } catch (error: any) {
      console.error('❌ Price update failed:', error.message);
      return false;
    }
  }

  /**
   * Get product status
   */
  async getProductStatus(productId: string): Promise<any> {
    try {
      const response = await this.client.get(`/api/seller/products/${productId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get status failed:', error.message);
      return null;
    }
  }

  /**
   * Test API connection - using /v2/fbs/orders endpoint from documentation
   */
  async testConnection(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('🧪 Testing Uzum Market API connection...');
      console.log('📍 URL:', UZUM_BASE_URL);
      
      // Try to get orders list (from Swagger documentation)
      const response = await this.client.get('/v2/fbs/orders', {
        params: { 
          limit: 10,
          offset: 0 
        },
      });
      
      console.log('✅ Uzum Market API: Connected successfully!');
      console.log('📦 Response:', JSON.stringify(response.data, null, 2));
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('❌ Uzum Market API: Connection failed');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        return { 
          success: false, 
          error: `${error.response.status}: ${JSON.stringify(error.response.data)}` 
        };
      }
      console.error('Error:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get FBS orders
   */
  async getOrders(limit: number = 10, offset: number = 0): Promise<any> {
    try {
      const response = await this.client.get('/v2/fbs/orders', {
        params: { limit, offset },
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ Get orders failed:', error.message);
      return null;
    }
  }
  
  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<any> {
    try {
      const response = await this.client.get(`/v1/fbs/order/${orderId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get order failed:', error.message);
      return null;
    }
  }
  
  /**
   * Get stocks by SKU
   */
  async getStocks(): Promise<any> {
    try {
      const response = await this.client.get('/v2/fbs/sku/stocks');
      return response.data;
    } catch (error: any) {
      console.error('❌ Get stocks failed:', error.message);
      return null;
    }
  }
}

export default UzumMarketService;
export const uzumMarketService = new UzumMarketService();
