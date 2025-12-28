// Uzum Market Seller API Integration Service
// Based on: https://api-seller.uzum.uz/api/seller-openapi/swagger/

import axios, { AxiosInstance } from 'axios';

interface UzumCredentials {
  apiKey: string;
  sellerId?: string;
  accessToken?: string;
}

interface UzumProduct {
  productId?: string;
  name: string;
  categoryId: number;
  price: number;
  oldPrice?: number;
  description?: string;
  images?: string[];
  sku?: string;
  barcode?: string;
  stockQuantity?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  attributes?: Record<string, any>;
}

interface UzumOrder {
  orderId: string;
  status: string;
  createdAt: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
  };
  totalAmount: number;
}

interface UzumAnalytics {
  sales: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    period: string;
  };
  products: {
    totalViews: number;
    totalClicks: number;
    conversionRate: number;
    topProducts: Array<{
      productId: string;
      name: string;
      sales: number;
    }>;
  };
  performance: {
    responseTime: number;
    fulfillmentRate: number;
    customerSatisfaction: number;
  };
}

export class UzumMarketService {
  private api: AxiosInstance;
  private credentials: UzumCredentials;

  constructor(credentials: UzumCredentials) {
    this.credentials = credentials;
    this.api = axios.create({
      baseURL: 'https://api-seller.uzum.uz/api',
      headers: {
        'Authorization': `Bearer ${credentials.accessToken || credentials.apiKey}`,
        'Content-Type': 'application/json',
        'X-Seller-Id': credentials.sellerId || '',
      },
    });
  }

  // ==================== PRODUCTS MANAGEMENT ====================

  /**
   * Mahsulot yaratish/yangilash
   * POST /products
   */
  async createOrUpdateProduct(product: UzumProduct): Promise<string> {
    try {
      const productData: any = {
        name: product.name,
        categoryId: product.categoryId,
        price: product.price,
        oldPrice: product.oldPrice,
        description: product.description,
        images: product.images || [],
        sku: product.sku,
        barcode: product.barcode,
        stockQuantity: product.stockQuantity || 0,
        weight: product.weight,
        dimensions: product.dimensions,
        attributes: product.attributes || {},
      };

      let response;
      if (product.productId) {
        // Update existing product
        response = await this.api.put(`/products/${product.productId}`, productData);
      } else {
        // Create new product
        response = await this.api.post('/products', productData);
      }

      return response.data.productId || response.data.id || product.productId || '';
    } catch (error: any) {
      console.error('Uzum Market: Product creation error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Mahsulotni o'chirish
   * DELETE /products/{productId}
   */
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      await this.api.delete(`/products/${productId}`);
      return true;
    } catch (error: any) {
      console.error('Uzum Market: Product deletion error:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Mahsulotlar ro'yxatini olish
   * GET /products
   */
  async getProducts(limit: number = 100, offset: number = 0): Promise<UzumProduct[]> {
    try {
      const response = await this.api.get('/products', {
        params: { limit, offset },
      });

      return response.data.result?.products || response.data.products || [];
    } catch (error: any) {
      console.error('Uzum Market: Get products error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Bitta mahsulotni olish
   * GET /products/{productId}
   */
  async getProduct(productId: string): Promise<UzumProduct | null> {
    try {
      const response = await this.api.get(`/products/${productId}`);
      return response.data.result || response.data || null;
    } catch (error: any) {
      console.error('Uzum Market: Get product error:', error.response?.data || error.message);
      return null;
    }
  }

  // ==================== PRICES MANAGEMENT ====================

  /**
   * Narxlarni yangilash
   * PUT /products/{productId}/price
   */
  async updatePrice(productId: string, price: number, oldPrice?: number): Promise<boolean> {
    try {
      await this.api.put(`/products/${productId}/price`, {
        price,
        oldPrice,
      });

      return true;
    } catch (error: any) {
      console.error('Uzum Market: Price update error:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Bir nechta mahsulotlar narxlarini yangilash
   * POST /products/prices/bulk-update
   */
  async updatePricesBulk(
    prices: Array<{ productId: string; price: number; oldPrice?: number }>
  ): Promise<boolean> {
    try {
      await this.api.post('/products/prices/bulk-update', {
        prices,
      });

      return true;
    } catch (error: any) {
      console.error('Uzum Market: Bulk price update error:', error.response?.data || error.message);
      return false;
    }
  }

  // ==================== INVENTORY MANAGEMENT ====================

  /**
   * Qoldiqlarni yangilash
   * PUT /products/{productId}/stock
   */
  async updateStock(productId: string, quantity: number): Promise<boolean> {
    try {
      await this.api.put(`/products/${productId}/stock`, {
        quantity,
      });

      return true;
    } catch (error: any) {
      console.error('Uzum Market: Stock update error:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Bir nechta mahsulotlar qoldiqlarini yangilash
   * POST /products/stocks/bulk-update
   */
  async updateStocksBulk(
    stocks: Array<{ productId: string; quantity: number }>
  ): Promise<boolean> {
    try {
      await this.api.post('/products/stocks/bulk-update', {
        stocks,
      });

      return true;
    } catch (error: any) {
      console.error('Uzum Market: Bulk stock update error:', error.response?.data || error.message);
      return false;
    }
  }

  // ==================== ORDERS MANAGEMENT ====================

  /**
   * Buyurtmalarni olish
   * GET /orders
   */
  async getOrders(
    status?: string,
    fromDate?: string,
    toDate?: string,
    limit: number = 100
  ): Promise<UzumOrder[]> {
    try {
      const params: any = { limit };
      if (status) params.status = status;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await this.api.get('/orders', { params });

      return response.data.result?.orders || response.data.orders || [];
    } catch (error: any) {
      console.error('Uzum Market: Get orders error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Bitta buyurtmani olish
   * GET /orders/{orderId}
   */
  async getOrder(orderId: string): Promise<UzumOrder | null> {
    try {
      const response = await this.api.get(`/orders/${orderId}`);
      return response.data.result || response.data || null;
    } catch (error: any) {
      console.error('Uzum Market: Get order error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Buyurtma holatini yangilash
   * PUT /orders/{orderId}/status
   */
  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      await this.api.put(`/orders/${orderId}/status`, {
        status,
      });

      return true;
    } catch (error: any) {
      console.error('Uzum Market: Order status update error:', error.response?.data || error.message);
      return false;
    }
  }

  // ==================== ANALYTICS ====================

  /**
   * Analitik ma'lumotlarni olish
   * GET /analytics/sales
   */
  async getAnalytics(fromDate?: string, toDate?: string): Promise<UzumAnalytics> {
    try {
      const params: any = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      // Sales analytics
      const salesResponse = await this.api.get('/analytics/sales', { params });
      
      // Products analytics
      const productsResponse = await this.api.get('/analytics/products', { params });
      
      // Performance analytics
      const performanceResponse = await this.api.get('/analytics/performance', { params });

      const salesData = salesResponse.data.result || salesResponse.data || {};
      const productsData = productsResponse.data.result || productsResponse.data || {};
      const performanceData = performanceResponse.data.result || performanceResponse.data || {};

      return {
        sales: {
          totalRevenue: salesData.totalRevenue || 0,
          totalOrders: salesData.totalOrders || 0,
          averageOrderValue: salesData.averageOrderValue || 0,
          period: `${fromDate || 'start'} - ${toDate || 'now'}`,
        },
        products: {
          totalViews: productsData.totalViews || 0,
          totalClicks: productsData.totalClicks || 0,
          conversionRate: productsData.conversionRate || 0,
          topProducts: productsData.topProducts || [],
        },
        performance: {
          responseTime: performanceData.responseTime || 0,
          fulfillmentRate: performanceData.fulfillmentRate || 0,
          customerSatisfaction: performanceData.customerSatisfaction || 0,
        },
      };
    } catch (error: any) {
      console.error('Uzum Market: Analytics error:', error.response?.data || error.message);
      return {
        sales: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, period: '' },
        products: { totalViews: 0, totalClicks: 0, conversionRate: 0, topProducts: [] },
        performance: { responseTime: 0, fulfillmentRate: 0, customerSatisfaction: 0 },
      };
    }
  }

  /**
   * Top mahsulotlarni olish
   * GET /analytics/products/top
   */
  async getTopProducts(limit: number = 10): Promise<Array<{ productId: string; name: string; sales: number }>> {
    try {
      const response = await this.api.get('/analytics/products/top', {
        params: { limit },
      });

      return response.data.result?.products || response.data.products || [];
    } catch (error: any) {
      console.error('Uzum Market: Get top products error:', error.response?.data || error.message);
      return [];
    }
  }
}

export default UzumMarketService;

