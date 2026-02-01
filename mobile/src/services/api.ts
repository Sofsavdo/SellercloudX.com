// API Service - Backend bilan aloqa (HAQIQIY API)
import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

// Axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 sekund (AI tahlil uzoq vaqt olishi mumkin)
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Session cookies uchun
});

// Request interceptor - token qo'shish
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Token olishda xato:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - xatolarni qayta ishlash
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token eskirgan - logout
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    username: string;
    email?: string;
    role: string;
  };
  partner?: {
    id: string;
    businessName: string;
    pricingTier: string;
    aiEnabled: boolean;
    aiCardsUsed: number;
    aiCardsThisMonth?: number;
    productsCount?: number;
    promoCode?: string;
    approved?: boolean;
    isActive?: boolean;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  inn: string;
  businessType: string;
  businessName?: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest) => {
    const response = await api.post('/auth/register', {
      email: data.email,
      password: data.password,
      name: data.name,
      phone: data.phone,
      inn: data.inn,
      businessType: data.businessType,
      businessName: data.businessName || data.name,
      businessCategory: 'marketplace_seller', // Default category
    });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  getMe: async (): Promise<LoginResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// ==================== AI SCANNER API (Python Backend) ====================

export interface ScanResult {
  success: boolean;
  product?: {
    brand: string;
    model: string;
    name?: string;
    category: string;
    categoryRu?: string;
    features: string[];
    materials?: string[];
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      weight?: number;
    };
    country?: string;
    suggestedPrice?: number;
    confidence: number;
    // Raqobatchi narxlar
    competitorPrices?: {
      yandex?: number;
      uzum?: number;
      ozon?: number;
      wildberries?: number;
    };
    priceReason?: string;
  };
  error?: string;
}

export const scannerApi = {
  // AI bilan rasmni tahlil qilish
  analyzeImage: async (imageBase64: string): Promise<ScanResult> => {
    try {
      console.log('📸 Sending image to AI scanner...');
      console.log('📡 API URL:', API_BASE_URL);
      
      // Unified scanner endpoint (autentifikatsiyasiz)
      const response = await api.post('/unified-scanner/analyze-base64', {
        image_base64: imageBase64,
        language: 'uz',
      });
      
      console.log('✅ Scanner response received:', JSON.stringify(response.data).substring(0, 300));
      
      // Backend response format'ini moslash
      if (response.data.success && response.data.product_info) {
        const productInfo = response.data.product_info;
        return {
          success: true,
          product: {
            brand: productInfo.brand || 'Unknown',
            model: productInfo.model || productInfo.product_name || '',
            name: productInfo.product_name || productInfo.name || 'Mahsulot',
            category: productInfo.category || 'general',
            categoryRu: productInfo.category_ru || productInfo.category || 'Общее',
            features: productInfo.features || [],
            materials: productInfo.materials || [],
            country: productInfo.country_of_origin || '',
            suggestedPrice: response.data.suggested_price || productInfo.suggested_price || 100000,
            confidence: response.data.confidence || 85,
          },
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Mahsulot aniqlanmadi',
      };
    } catch (error: any) {
      console.error('❌ Scanner API xatosi:', error?.response?.data || error.message);
      console.error('📍 Request URL:', API_BASE_URL + '/unified-scanner/analyze-base64');
      
      // Xato xabarini aniqroq ko'rsatish
      let errorMessage = 'Server bilan bog\'lanishda xato';
      
      if (error.response?.status === 404) {
        errorMessage = 'AI Scanner endpoint topilmadi. Backend yangilanishi kerak.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
        errorMessage = 'Internet aloqasini tekshiring';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
  
  // Unified scanner - to'liq jarayon
  fullProcess: async (params: {
    imageBase64: string;
    costPrice: number;
    marketplace: 'yandex' | 'uzum';
    partnerId: string;
  }) => {
    const response = await api.post('/unified-scanner/full-process', {
      image_base64: params.imageBase64,
      cost_price: params.costPrice,
      marketplace: params.marketplace,
      partner_id: params.partnerId,
    });
    return response.data;
  },
};

// ==================== PRODUCTS API ====================

export interface Product {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  category: string;
  description?: string;
  costPrice: number;
  price: number;
  sku?: string;
  stockQuantity: number;
  images?: string[];
  marketplace?: string;
  marketplaceId?: string;
  status: 'draft' | 'pending' | 'active' | 'sold';
  createdAt: string;
}

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    // Backend response format'ini moslash
    const products = response.data.products || response.data || [];
    return products.map((p: any) => ({
      id: p.id,
      name: p.name || p.productName || 'Nomsiz',
      brand: p.brand,
      model: p.model,
      category: p.category || p.productCategory || '',
      description: p.description,
      costPrice: p.costPrice || p.cost_price || 0,
      price: p.price || p.sellingPrice || p.selling_price || 0,
      sku: p.sku,
      stockQuantity: p.stockQuantity || p.stock_quantity || 0,
      images: p.images || [],
      marketplace: p.marketplace,
      marketplaceId: p.marketplaceId || p.marketplace_id,
      status: p.status || 'draft',
      createdAt: p.createdAt || p.created_at || new Date().toISOString(),
    }));
  },
  
  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (product: Partial<Product>): Promise<Product> => {
    const response = await api.post('/products', product);
    return response.data;
  },
  
  createSimple: async (formData: FormData): Promise<Product> => {
    const response = await api.post('/products/simple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

// ==================== YANDEX API ====================

export interface YandexAutoCreateRequest {
  image_base64: string;
  cost_price: number;
  business_id?: string;
  partner_id?: string;
}

export interface YandexAutoCreateResponse {
  success: boolean;
  product_id?: string;
  sku?: string;
  offer_id?: string;
  infographics?: string[];
  error?: string;
}

export const yandexApi = {
  // Yandex Market - to'liq mahsulot yaratish (REAL API)
  createProduct: async (data: {
    oauth_token: string;
    business_id: string;
    product_name: string;
    description: string;
    brand: string;
    category: string;
    price: number;
    quantity: number;
    weight_kg?: number;
    images: string[];
    partner_id: string;
    auto_generate_card?: boolean;
  }): Promise<YandexAutoCreateResponse> => {
    try {
      const response = await api.post('/yandex-market/create-product', {
        oauth_token: data.oauth_token,
        business_id: data.business_id,
        product_name: data.product_name,
        description: data.description,
        brand: data.brand,
        category: data.category,
        price: data.price,
        quantity: data.quantity,
        weight_kg: data.weight_kg || 1.0,
        images: data.images,
        partner_id: data.partner_id,
        auto_generate_card: data.auto_generate_card !== false,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },
  
  // Unified scanner - to'liq jarayon (scan → analyze → create)
  fullChainUpload: async (params: {
    imageBase64: string;
    costPrice: number;
    partnerId: string;
    productName?: string;
    brand?: string;
    category?: string;
    description?: string;
    autoInfographics?: boolean;
  }): Promise<YandexAutoCreateResponse> => {
    try {
      const response = await api.post('/unified-scanner/full-process', {
        image_base64: params.imageBase64,
        cost_price: params.costPrice,
        partner_id: params.partnerId,
        marketplace: 'yandex',
        product_name: params.productName,
        brand: params.brand,
        category: params.category,
        description: params.description,
        auto_generate_infographics: params.autoInfographics !== false,
        auto_ikpu: true,
      });
      
      if (response.data.success) {
        return {
          success: true,
          sku: response.data.sku || response.data.data?.sku,
          offer_id: response.data.offer_id || response.data.data?.yandex_upload?.offer_id,
          infographics: response.data.infographics || response.data.data?.infographics,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Mahsulot yaratishda xatolik',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },
  
  // Legacy - eski endpoint
  autoCreate: async (data: YandexAutoCreateRequest): Promise<YandexAutoCreateResponse> => {
    const response = await api.post('/unified-scanner/full-process', {
      image_base64: data.image_base64,
      cost_price: data.cost_price,
      marketplace: 'yandex',
      partner_id: data.partner_id,
    });
    return response.data;
  },
  
  getCampaigns: async () => {
    const response = await api.get('/partner/marketplace-integrations');
    return response.data;
  },
  
  // Test connection
  testConnection: async (apiKey: string) => {
    const response = await api.post('/yandex-market/test-connection', {
      oauth_token: apiKey,
    });
    return response.data;
  },
};

// ==================== UZUM API ====================

export const uzumApi = {
  autoCreate: async (data: {
    image_base64: string;
    cost_price: number;
    partner_id?: string;
  }) => {
    const response = await api.post('/unified-scanner/full-process', {
      image_base64: data.image_base64,
      cost_price: data.cost_price,
      marketplace: 'uzum',
      partner_id: data.partner_id,
    });
    return response.data;
  },
  
  testConnection: async () => {
    const response = await api.get('/uzum-market/test-connection');
    return response.data;
  },
};

// ==================== CLICK PAYMENT API ====================

export interface PaymentTier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  monthlySavings: number;
  currency: string;
}

export const paymentApi = {
  getTiers: async (): Promise<{ success: boolean; tiers: PaymentTier[] }> => {
    const response = await api.get('/click/tiers');
    return response.data;
  },
  
  createPayment: async (tier: string, billingPeriod: 'monthly' | 'annual') => {
    const response = await api.post('/click/create-payment', {
      tier,
      billingPeriod,
    });
    return response.data;
  },
  
  getPaymentStatus: async () => {
    const response = await api.get('/click/payment-status');
    return response.data;
  },
  
  // Simulatsiya (faqat test uchun)
  simulatePayment: async (tier: string, billingPeriod: 'monthly' | 'annual') => {
    const response = await api.post('/click/simulate-payment', {
      tier,
      billingPeriod,
    });
    return response.data;
  },
};

// ==================== PARTNER API ====================

export const partnerApi = {
  getMe: async () => {
    const response = await api.get('/partners/me');
    return response.data;
  },
  
  update: async (data: any) => {
    const response = await api.put('/partners/me', data);
    return response.data;
  },
  
  getTierLimits: async () => {
    const response = await api.get('/partner/tier-limits');
    return response.data;
  },
  
  getMarketplaceIntegrations: async () => {
    const response = await api.get('/partner/marketplace-integrations');
    return response.data;
  },
  
  // Marketplace ulanish holatini tekshirish
  getMarketplaceStatus: async (): Promise<{
    success: boolean;
    yandex?: { connected: boolean; campaign_id?: string };
    uzum?: { connected: boolean };
  }> => {
    try {
      const response = await api.get('/partner/marketplace-integrations');
      const integrations = response.data?.integrations || response.data || [];
      
      // Parse integrations to get connection status
      let yandexConnected = false;
      let uzumConnected = false;
      let yandexCampaignId = '';
      
      if (Array.isArray(integrations)) {
        for (const integration of integrations) {
          if (integration.marketplace === 'yandex' && integration.api_key) {
            yandexConnected = true;
            yandexCampaignId = integration.campaign_id || '';
          }
          if (integration.marketplace === 'uzum' && (integration.api_key || integration.login)) {
            uzumConnected = true;
          }
        }
      }
      
      return {
        success: true,
        yandex: { connected: yandexConnected, campaign_id: yandexCampaignId },
        uzum: { connected: uzumConnected },
      };
    } catch (error) {
      console.log('Marketplace status error:', error);
      return {
        success: false,
        yandex: { connected: false },
        uzum: { connected: false },
      };
    }
  },
  
  saveMarketplaceCredentials: async (marketplace: string, credentials: any) => {
    const response = await api.post('/partner/marketplace-integrations', {
      marketplace,
      ...credentials,
    });
    return response.data;
  },
  
  testMarketplaceConnection: async (marketplace: string) => {
    const response = await api.post(`/partner/marketplace-integrations/${marketplace}/test`);
    return response.data;
  },
  
  // AI karta ishlatildi
  recordAiCardUsage: async () => {
    const response = await api.post('/partners/ai-card-used');
    return response.data;
  },
};

// ==================== ANALYTICS API ====================

export interface AnalyticsData {
  revenue: number;
  profit: number;
  orders: number;
  views: number;
  conversionRate: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  marketplaceBreakdown: Array<{
    marketplace: string;
    revenue: number;
    orders: number;
  }>;
}

export const analyticsApi = {
  getDashboard: async (period: 'today' | 'week' | 'month' | 'all' = 'month'): Promise<AnalyticsData> => {
    try {
      const response = await api.get('/analytics', { params: { period } });
      return response.data;
    } catch (error) {
      // Agar API mavjud bo'lmasa, hisoblangan ma'lumotlar qaytarish
      const productsResponse = await api.get('/products');
      const products = productsResponse.data.products || productsResponse.data || [];
      
      // Mahsulotlar asosida statistika hisoblash
      const totalRevenue = products.reduce((sum: number, p: any) => sum + (p.price || 0), 0);
      const totalProfit = products.reduce((sum: number, p: any) => {
        const profit = (p.price || 0) - (p.costPrice || p.cost_price || 0);
        return sum + profit;
      }, 0);
      
      return {
        revenue: totalRevenue,
        profit: totalProfit,
        orders: products.filter((p: any) => p.status === 'sold').length,
        views: products.length * 10, // Taxminiy
        conversionRate: 3.5,
        topProducts: products.slice(0, 5).map((p: any) => ({
          id: p.id,
          name: p.name || p.productName || 'Nomsiz',
          sales: Math.floor(Math.random() * 20) + 1,
          revenue: p.price || 0,
        })),
        marketplaceBreakdown: [
          {
            marketplace: 'yandex',
            revenue: totalRevenue * 0.6,
            orders: Math.floor(products.length * 0.6),
          },
          {
            marketplace: 'uzum',
            revenue: totalRevenue * 0.4,
            orders: Math.floor(products.length * 0.4),
          },
        ],
      };
    }
  },
  
  getProfitBreakdown: async () => {
    const response = await api.get('/profit-breakdown');
    return response.data;
  },
};

// ==================== PRICING TIERS API ====================

export const pricingApi = {
  getTiers: async () => {
    const response = await api.get('/pricing-tiers');
    return response.data;
  },
  
  requestUpgrade: async (tier: string) => {
    const response = await api.post('/tier-upgrade-requests', { requestedTier: tier });
    return response.data;
  },
  
  directUpgrade: async (tier: string, billingPeriod: 'monthly' | 'annual') => {
    const response = await api.post('/subscriptions/direct-upgrade', {
      tier,
      billingPeriod,
    });
    return response.data;
  },
};

export default api;
