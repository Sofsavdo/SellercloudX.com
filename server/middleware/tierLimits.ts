/**
 * Tarif Cheklovlari Middleware
 * 
 * Har bir tarif uchun limitlarni tekshiradi va boshqaradi
 */

import { db } from '../db';
import { partners, aiProductCards, analytics } from '@shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

// Tarif limitlari
export const TIER_LIMITS = {
  free_starter: {
    name: 'Free Starter',
    products: 10,
    aiCards: 10,
    trendHunter: 10,
    marketplaces: 1,
    monthlyRevenue: 15000000, // 15M so'm
    languages: 3,
    features: ['yandex_market', 'basic_stats', 'warehouse_monitoring', 'chat_support', 'email_support'],
    excluded: ['profit_analysis', 'price_monitoring', 'seo_optimization', 'multi_marketplace', 'telegram_notifications']
  },
  basic: {
    name: 'Basic',
    products: 69,
    aiCards: 69,
    trendHunter: 69,
    marketplaces: 1,
    monthlyRevenue: 69000000, // 69M so'm
    languages: 3,
    features: ['yandex_market', 'profit_analysis', 'full_stats', 'warehouse_management', 'telegram_notifications', 'email_support'],
    excluded: ['multi_marketplace', 'seo_optimization', 'price_monitoring', 'bulk_operations']
  },
  starter_pro: {
    name: 'Starter Pro',
    products: 400,
    aiCards: -1, // Cheksiz
    trendHunter: -1,
    marketplaces: 4,
    monthlyRevenue: 200000000, // 200M so'm
    languages: 3,
    features: ['all_marketplaces', 'unlimited_ai', 'seo_optimization', 'price_monitoring', 'profit_analysis', 'full_stats', 'bulk_operations', 'telegram_notifications', '24_7_monitoring'],
    excluded: []
  },
  professional: {
    name: 'Professional',
    products: -1, // Cheksiz
    aiCards: -1,
    trendHunter: -1,
    marketplaces: -1,
    monthlyRevenue: -1, // Cheksiz
    languages: 3,
    features: ['all_marketplaces', 'unlimited_all', 'advanced_ai', 'api_access', 'white_label', 'custom_integrations', 'ab_testing', 'international', 'personal_manager', 'priority_support'],
    excluded: []
  }
};

// Tarif nomlarini normalize qilish
export function normalizeTierName(tier: string): string {
  const tierMap: Record<string, string> = {
    'free': 'free_starter',
    'free_starter': 'free_starter',
    'basic': 'basic',
    'starter': 'starter_pro',
    'starter_pro': 'starter_pro',
    'pro': 'starter_pro',
    'professional': 'professional',
    'enterprise': 'professional'
  };
  return tierMap[tier?.toLowerCase()] || 'free_starter';
}

// Oylik foydalanish statistikasini olish
export async function getMonthlyUsage(partnerId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  try {
    // AI kartochkalar soni
    const aiCardsResult = await db.select({ count: sql<number>`count(*)` })
      .from(aiProductCards)
      .where(and(
        eq(aiProductCards.partnerId, partnerId),
        gte(aiProductCards.createdAt, startOfMonth)
      ));
    
    // Trend Hunter foydalanish - analytics dan
    const trendHunterResult = await db.select({ count: sql<number>`COALESCE(SUM(trend_hunter_usage), 0)` })
      .from(analytics)
      .where(and(
        eq(analytics.partnerId, partnerId),
        gte(analytics.date, startOfMonth)
      ));
    
    return {
      aiCards: aiCardsResult[0]?.count || 0,
      trendHunter: trendHunterResult[0]?.count || 0,
      products: 0, // Alohida hisoblash kerak
      monthlyRevenue: 0 // Alohida hisoblash kerak
    };
  } catch (error) {
    console.error('Error getting monthly usage:', error);
    return { aiCards: 0, trendHunter: 0, products: 0, monthlyRevenue: 0 };
  }
}

// Limit tekshirish
export async function checkTierLimit(
  partnerId: string, 
  action: 'aiCards' | 'trendHunter' | 'products' | 'marketplaces',
  increment: number = 1
): Promise<{ allowed: boolean; current: number; limit: number; remaining: number; tier: string }> {
  
  try {
    // Hamkor ma'lumotlarini olish
    const [partner] = await db.select().from(partners).where(eq(partners.id, partnerId));
    
    if (!partner) {
      return { allowed: false, current: 0, limit: 0, remaining: 0, tier: 'unknown' };
    }
    
    const tier = normalizeTierName(partner.pricingTier || 'free_starter');
    const limits = TIER_LIMITS[tier as keyof typeof TIER_LIMITS];
    
    if (!limits) {
      return { allowed: false, current: 0, limit: 0, remaining: 0, tier };
    }
    
    const limit = limits[action as keyof typeof limits] as number;
    
    // Cheksiz limit
    if (limit === -1) {
      return { allowed: true, current: 0, limit: -1, remaining: -1, tier };
    }
    
    // Hozirgi foydalanishni olish
    const usage = await getMonthlyUsage(partnerId);
    const current = usage[action as keyof typeof usage] as number || 0;
    
    const remaining = Math.max(0, limit - current);
    const allowed = current + increment <= limit;
    
    return { allowed, current, limit, remaining, tier };
    
  } catch (error) {
    console.error('Error checking tier limit:', error);
    return { allowed: false, current: 0, limit: 0, remaining: 0, tier: 'error' };
  }
}

// Funksiyaga kirish huquqini tekshirish
export async function checkFeatureAccess(
  partnerId: string,
  feature: string
): Promise<{ allowed: boolean; tier: string; requiredTier: string | null }> {
  
  try {
    const [partner] = await db.select().from(partners).where(eq(partners.id, partnerId));
    
    if (!partner) {
      return { allowed: false, tier: 'unknown', requiredTier: null };
    }
    
    const tier = normalizeTierName(partner.pricingTier || 'free_starter');
    const limits = TIER_LIMITS[tier as keyof typeof TIER_LIMITS];
    
    if (!limits) {
      return { allowed: false, tier, requiredTier: null };
    }
    
    // Funksiya mavjudligini tekshirish
    const hasFeature = limits.features.includes(feature);
    
    if (hasFeature) {
      return { allowed: true, tier, requiredTier: null };
    }
    
    // Qaysi tarifda mavjudligini aniqlash
    let requiredTier: string | null = null;
    for (const [tierName, tierLimits] of Object.entries(TIER_LIMITS)) {
      if (tierLimits.features.includes(feature)) {
        requiredTier = tierName;
        break;
      }
    }
    
    return { allowed: false, tier, requiredTier };
    
  } catch (error) {
    console.error('Error checking feature access:', error);
    return { allowed: false, tier: 'error', requiredTier: null };
  }
}

// Limit middleware - Express uchun
export function tierLimitMiddleware(action: 'aiCards' | 'trendHunter' | 'products' | 'marketplaces') {
  return async (req: any, res: any, next: any) => {
    try {
      const partner = req.partner;
      
      if (!partner?.id) {
        return res.status(401).json({
          success: false,
          error: 'Hamkor topilmadi'
        });
      }
      
      const check = await checkTierLimit(partner.id, action);
      
      if (!check.allowed) {
        return res.status(403).json({
          success: false,
          error: 'Tarif limiti tugadi',
          details: {
            action,
            current: check.current,
            limit: check.limit,
            tier: check.tier,
            message: `${TIER_LIMITS[check.tier as keyof typeof TIER_LIMITS]?.name || check.tier} tarifida ${check.limit} ta ${action} limit. Yuqori tarifga o'ting.`
          }
        });
      }
      
      // Limit ma'lumotlarini request'ga qo'shish
      req.tierLimit = check;
      next();
      
    } catch (error) {
      console.error('Tier limit middleware error:', error);
      next(error);
    }
  };
}

// Feature access middleware
export function featureAccessMiddleware(feature: string) {
  return async (req: any, res: any, next: any) => {
    try {
      const partner = req.partner;
      
      if (!partner?.id) {
        return res.status(401).json({
          success: false,
          error: 'Hamkor topilmadi'
        });
      }
      
      const check = await checkFeatureAccess(partner.id, feature);
      
      if (!check.allowed) {
        return res.status(403).json({
          success: false,
          error: 'Bu funksiya sizning tarifingizda mavjud emas',
          details: {
            feature,
            currentTier: check.tier,
            requiredTier: check.requiredTier,
            message: check.requiredTier 
              ? `Bu funksiya ${TIER_LIMITS[check.requiredTier as keyof typeof TIER_LIMITS]?.name || check.requiredTier} tarifida mavjud`
              : 'Bu funksiya mavjud emas'
          }
        });
      }
      
      next();
      
    } catch (error) {
      console.error('Feature access middleware error:', error);
      next(error);
    }
  };
}

export default {
  TIER_LIMITS,
  normalizeTierName,
  getMonthlyUsage,
  checkTierLimit,
  checkFeatureAccess,
  tierLimitMiddleware,
  featureAccessMiddleware
};
