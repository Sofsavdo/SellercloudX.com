// @ts-nocheck
// Context Caching Service
// Marketplace qoidalarini cache qilish - 50-70% token kamayishi

import { geminiService } from './geminiService';
import { getDbType } from '../db';

// Universal timestamp formatter
function formatTimestamp(): any {
  const dbType = getDbType();
  return dbType === 'sqlite' ? Math.floor(Date.now() / 1000) : new Date();
}

interface CachedContext {
  id: string;
  type: 'marketplace_rules' | 'product_template' | 'seo_guidelines';
  content: string;
  tokens: number;
  createdAt: Date;
  expiresAt: Date;
}

class ContextCacheService {
  private cache: Map<string, CachedContext> = new Map();
  private enabled: boolean;

  constructor() {
    this.enabled = geminiService.isEnabled();
    if (this.enabled) {
      console.log('✅ Context Cache Service initialized');
      this.loadMarketplaceRules();
    }
  }

  /**
   * Load marketplace rules into cache
   */
  private async loadMarketplaceRules(): Promise<void> {
    try {
      // Uzum marketplace rules
      const uzumRules = `
UZUM MARKETPLACE QOIDALARI:
- Mahsulot nomi: 200 belgigacha
- Tavsif: 5000 belgigacha
- Rasm: 10 ta, 1200x1200 px minimal
- Narx: UZS formatida
- Kategoriya: To'g'ri kategoriya tanlash kerak
- SKU: Unique bo'lishi kerak
`;

      // Wildberries rules
      const wildberriesRules = `
WILDBERRIES MARKETPLACE QOIDALARI:
- Mahsulot nomi: 150 belgigacha
- Tavsif: 3000 belgigacha
- Rasm: 30 ta, 1000x1000 px
- Narx: RUB formatida
- Kategoriya: WB kategoriya tizimi
- Barcode: Majburiy
`;

      // Yandex Market rules
      const yandexRules = `
YANDEX MARKET QOIDALARI:
- Mahsulot nomi: 120 belgigacha
- Tavsif: 2000 belgigacha
- Rasm: 20 ta, 800x800 px
- Narx: RUB formatida
- Kategoriya: Yandex kategoriya tizimi
- Vendor code: Majburiy
`;

      // Ozon rules
      const ozonRules = `
OZON MARKETPLACE QOIDALARI:
- Mahsulot nomi: 100 belgigacha
- Tavsif: 5000 belgigacha
- Rasm: 15 ta, 1000x1000 px
- Narx: RUB formatida
- Kategoriya: Ozon kategoriya tizimi
- FBO/FBS: Tanlash kerak
`;

      // Cache rules
      this.cache.set('marketplace_rules_uzum', {
        id: 'uzum_rules',
        type: 'marketplace_rules',
        content: uzumRules,
        tokens: Math.ceil(uzumRules.length / 4),
        createdAt: formatTimestamp(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      this.cache.set('marketplace_rules_wildberries', {
        id: 'wildberries_rules',
        type: 'marketplace_rules',
        content: wildberriesRules,
        tokens: Math.ceil(wildberriesRules.length / 4),
        createdAt: formatTimestamp(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      this.cache.set('marketplace_rules_yandex', {
        id: 'yandex_rules',
        type: 'marketplace_rules',
        content: yandexRules,
        tokens: Math.ceil(yandexRules.length / 4),
        createdAt: formatTimestamp(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      this.cache.set('marketplace_rules_ozon', {
        id: 'ozon_rules',
        type: 'marketplace_rules',
        content: ozonRules,
        tokens: Math.ceil(ozonRules.length / 4),
        createdAt: formatTimestamp(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      console.log('✅ Marketplace rules cached');
    } catch (error) {
      console.error('Error loading marketplace rules:', error);
    }
  }

  /**
   * Get cached context
   */
  getContext(type: string, marketplace?: string): string | null {
    const key = marketplace ? `${type}_${marketplace}` : type;
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check expiration
    if (cached.expiresAt < new Date()) {
      this.cache.delete(key);
      return null;
    }

    return cached.content;
  }

  /**
   * Get marketplace rules for a specific marketplace
   */
  getMarketplaceRules(marketplace: 'uzum' | 'wildberries' | 'yandex' | 'ozon'): string | null {
    return this.getContext('marketplace_rules', marketplace);
  }

  /**
   * Add context to cache
   */
  addContext(key: string, content: string, ttl: number = 3600): void {
    const tokens = Math.ceil(content.length / 4);
    this.cache.set(key, {
      id: key,
      type: 'marketplace_rules',
      content,
      tokens,
      createdAt: formatTimestamp(),
      expiresAt: new Date(Date.now() + ttl * 1000),
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalEntries: number;
    totalTokens: number;
    byType: Record<string, number>;
  } {
    const entries = Array.from(this.cache.values());
    const totalTokens = entries.reduce((sum, e) => sum + e.tokens, 0);
    const byType: Record<string, number> = {};

    entries.forEach(entry => {
      byType[entry.type] = (byType[entry.type] || 0) + 1;
    });

    return {
      totalEntries: entries.length,
      totalTokens,
      byType,
    };
  }

  /**
   * Clear expired cache
   */
  clearExpired(): void {
    const now = new Date();
    for (const [key, value] of this.cache.entries()) {
      if (value.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

export const contextCacheService = new ContextCacheService();
export default contextCacheService;

