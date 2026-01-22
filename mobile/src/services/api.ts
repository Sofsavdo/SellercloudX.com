// API Service - Backend bilan aloqa
import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

// Axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
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
      // TODO: Navigate to login
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
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  inn: string;
  businessType: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest) => {
    const response = await api.post('/auth/register', data);
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

// ==================== AI SCANNER API ====================

export interface ScanResult {
  success: boolean;
  product?: {
    brand: string;
    model: string;
    category: string;
    categoryRu: string;
    features: string[];
    materials: string[];
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      weight?: number;
    };
    country?: string;
    suggestedPrice?: number;
    confidence: number;
  };
  error?: string;
}

export const scannerApi = {
  analyzeImage: async (imageBase64: string): Promise<ScanResult> => {
    const response = await api.post('/ai/scanner/analyze', {
      image: imageBase64,
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
    return response.data;
  },
  
  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (product: Partial<Product>): Promise<Product> => {
    const response = await api.post('/products', product);
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
  autoCreate: async (data: YandexAutoCreateRequest): Promise<YandexAutoCreateResponse> => {
    const response = await api.post('/yandex/auto-create', data);
    return response.data;
  },
  
  getCampaigns: async () => {
    const response = await api.get('/yandex/campaigns');
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
};

// ==================== PARTNER API ====================

export const partnerApi = {
  getMe: async () => {
    const response = await api.get('/partners/me');
    return response.data;
  },
  
  getTierLimits: async () => {
    const response = await api.get('/partner/tier-limits');
    return response.data;
  },
  
  getReferralStats: async () => {
    const response = await api.get('/partner/referral-stats');
    return response.data;
  },
};

export default api;
