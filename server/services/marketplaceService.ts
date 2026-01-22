// Marketplace API Service - Infrastructure for Partner Marketplace Integrations
// Partners provide their own API keys for Wildberries, Ozon, Uzum, Yandex

import axios, { AxiosInstance } from 'axios';
import { storage } from '../storage';

// ==================== TYPES ====================

export interface MarketplaceCredentials {
  marketplace: 'wildberries' | 'ozon' | 'uzum' | 'yandex';
  apiKey?: string;
  apiSecret?: string;
  clientId?: string;
  accessToken?: string;
  sellerId?: string;
}

export interface ProductCard {
  offerId: string; // Partner's unique product ID
  title: string;
  description: string;
  images: string[]; // Image URLs
  price: number;
  category: string | number;
  brand: string;
  characteristics?: Record<string, any>;
  keywords?: string[];
}

export interface ProductCreationResult {
  success: boolean;
  marketplace: string;
  productId?: string; // Marketplace product ID
  status?: string; // 'pending', 'active', 'moderation', 'rejected'
  error?: string;
  details?: any;
}

// ==================== BASE MARKETPLACE SERVICE ====================

abstract class BaseMarketplaceService {
  protected axiosInstance: AxiosInstance;
  protected marketplace: string;
  
  constructor(marketplace: string, baseURL: string) {
    this.marketplace = marketplace;
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  abstract createProduct(product: ProductCard): Promise<ProductCreationResult>;
  abstract updatePrice(productId: string, price: number): Promise<boolean>;
  abstract getProductStatus(productId: string): Promise<any>;
}

// ==================== WILDBERRIES SERVICE ====================

export class WildberriesService extends BaseMarketplaceService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    super('wildberries', 'https://suppliers-api.wildberries.ru');
    this.apiKey = apiKey;
    
    // Set authorization header
    this.axiosInstance.defaults.headers.common['HeaderApiKey'] = apiKey;
  }
  
  async createProduct(product: ProductCard): Promise<ProductCreationResult> {
    try {
      // Wildberries POST /content/v2/cards/upload
      const payload = {
        cards: [{
          nmID: 0, // Will be assigned by Wildberries
          vendorCode: product.offerId,
          brand: product.brand,
          title: product.title.substring(0, 60), // Max 60 chars
          description: product.description,
          characteristics: this.formatCharacteristics(product.characteristics),
          sizes: [{
            techSize: 'onesize',
            price: product.price,
          }],
        }],
      };
      
      const response = await this.axiosInstance.post('/content/v2/cards/upload', payload);
      
      return {
        success: true,
        marketplace: 'wildberries',
        productId: response.data?.data?.nmID || product.offerId,
        status: 'pending_moderation',
        details: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        marketplace: 'wildberries',
        error: error.response?.data?.message || error.message,
        details: error.response?.data,
      };
    }
  }
  
  async updatePrice(productId: string, price: number): Promise<boolean> {
    try {
      // Wildberries pricing endpoint
      await this.axiosInstance.post('/public/api/v1/prices', {
        prices: [{
          nmId: productId,
          price: price,
        }],
      });
      return true;
    } catch (error) {
      console.error('Wildberries price update error:', error);
      return false;
    }
  }
  
  async getProductStatus(productId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/content/v1/cards/list`, {
        params: { nmID: productId },
      });
      return response.data;
    } catch (error) {
      return null;
    }
  }
  
  private formatCharacteristics(characteristics?: Record<string, any>): any[] {
    if (!characteristics) return [];
    
    return Object.entries(characteristics).map(([key, value]) => ({
      attributeId: parseInt(key) || 0,
      value: String(value),
    }));
  }
}

// ==================== OZON SERVICE ====================

export class OzonService extends BaseMarketplaceService {
  private clientId: string;
  private apiKey: string;
  
  constructor(clientId: string, apiKey: string) {
    super('ozon', 'https://api-seller.ozon.ru');
    this.clientId = clientId;
    this.apiKey = apiKey;
    
    // Set Ozon auth headers
    this.axiosInstance.defaults.headers.common['Client-ID'] = clientId;
    this.axiosInstance.defaults.headers.common['Api-Key'] = apiKey;
  }
  
  async createProduct(product: ProductCard): Promise<ProductCreationResult> {
    try {
      // Ozon POST /v2/product/import (up to 100 products)
      const payload = {
        items: [{
          offer_id: product.offerId,
          name: product.title,
          description: product.description,
          vendor: product.brand,
          category_id: parseInt(String(product.category)) || 0,
          pictures: product.images,
          price: String(product.price),
          currency_code: 'RUB',
          attributes: this.formatAttributes(product.characteristics),
        }],
      };
      
      const response = await this.axiosInstance.post('/v2/product/import', payload);
      
      const taskId = response.data?.result?.task_id;
      
      return {
        success: true,
        marketplace: 'ozon',
        productId: taskId || product.offerId,
        status: 'pending_moderation',
        details: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        marketplace: 'ozon',
        error: error.response?.data?.message || error.message,
        details: error.response?.data,
      };
    }
  }
  
  async updatePrice(productId: string, price: number): Promise<boolean> {
    try {
      // Ozon pricing endpoint
      await this.axiosInstance.post('/v1/product/import/prices', {
        prices: [{
          offer_id: productId,
          price: String(price),
          currency_code: 'RUB',
        }],
      });
      return true;
    } catch (error) {
      console.error('Ozon price update error:', error);
      return false;
    }
  }
  
  async getProductStatus(productId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/v2/product/info/list', {
        offer_id: [productId],
      });
      return response.data;
    } catch (error) {
      return null;
    }
  }
  
  private formatAttributes(characteristics?: Record<string, any>): any[] {
    if (!characteristics) return [];
    
    return Object.entries(characteristics).map(([key, value]) => ({
      attribute_id: parseInt(key) || 0,
      value: String(value),
    }));
  }
}

// ==================== UZUM SERVICE ====================

export class UzumService extends BaseMarketplaceService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    super('uzum', 'https://api-seller.uzum.uz');
    this.apiKey = apiKey;
    
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
  }
  
  async createProduct(product: ProductCard): Promise<ProductCreationResult> {
    try {
      // Uzum Market API structure (based on Swagger docs)
      const payload = {
        offer_id: product.offerId,
        name: product.title,
        description: product.description,
        brand: product.brand,
        category_id: product.category,
        images: product.images,
        price: product.price,
        attributes: product.characteristics || {},
      };
      
      const response = await this.axiosInstance.post('/api/seller/products', payload);
      
      return {
        success: true,
        marketplace: 'uzum',
        productId: response.data?.id || product.offerId,
        status: 'pending',
        details: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        marketplace: 'uzum',
        error: error.response?.data?.message || error.message,
        details: error.response?.data,
      };
    }
  }
  
  async updatePrice(productId: string, price: number): Promise<boolean> {
    try {
      await this.axiosInstance.patch(`/api/seller/products/${productId}/price`, {
        price,
      });
      return true;
    } catch (error) {
      console.error('Uzum price update error:', error);
      return false;
    }
  }
  
  async getProductStatus(productId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/api/seller/products/${productId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
}

// ==================== YANDEX MARKET SERVICE ====================

export class YandexMarketService extends BaseMarketplaceService {
  private campaignId: string;
  private oauthToken: string;
  
  constructor(campaignId: string, oauthToken: string) {
    super('yandex', 'https://api.partner.market.yandex.ru');
    this.campaignId = campaignId;
    this.oauthToken = oauthToken;
    
    this.axiosInstance.defaults.headers.common['Authorization'] = `OAuth ${oauthToken}`;
  }
  
  async createProduct(product: ProductCard): Promise<ProductCreationResult> {
    try {
      // Yandex Market focuses on offers (SKUs) management
      const payload = {
        offer: {
          shopSku: product.offerId,
          name: product.title,
          description: product.description,
          vendor: product.brand,
          price: {
            value: product.price,
            currencyId: 'RUB',
          },
          pictures: product.images,
        },
      };
      
      const response = await this.axiosInstance.post(
        `/campaigns/${this.campaignId}/offers`,
        payload
      );
      
      return {
        success: true,
        marketplace: 'yandex',
        productId: product.offerId,
        status: 'active',
        details: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        marketplace: 'yandex',
        error: error.response?.data?.message || error.message,
        details: error.response?.data,
      };
    }
  }
  
  async updatePrice(productId: string, price: number): Promise<boolean> {
    try {
      await this.axiosInstance.post(`/campaigns/${this.campaignId}/offer-prices`, {
        offerIds: [productId],
        prices: [{
          value: price,
          currencyId: 'RUB',
        }],
      });
      return true;
    } catch (error) {
      console.error('Yandex price update error:', error);
      return false;
    }
  }
  
  async getProductStatus(productId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/campaigns/${this.campaignId}/offers/${productId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
}

// ==================== MARKETPLACE SERVICE FACTORY ====================

export class MarketplaceServiceFactory {
  static create(credentials: MarketplaceCredentials): BaseMarketplaceService | null {
    switch (credentials.marketplace) {
      case 'wildberries':
        if (!credentials.apiKey) return null;
        return new WildberriesService(credentials.apiKey);
      
      case 'ozon':
        if (!credentials.clientId || !credentials.apiKey) return null;
        return new OzonService(credentials.clientId, credentials.apiKey);
      
      case 'uzum':
        if (!credentials.apiKey) return null;
        return new UzumService(credentials.apiKey);
      
      case 'yandex':
        if (!credentials.sellerId || !credentials.accessToken) return null;
        return new YandexMarketService(credentials.sellerId, credentials.accessToken);
      
      default:
        return null;
    }
  }
}

// ==================== EXPORTS ====================

export {
  BaseMarketplaceService,
};
