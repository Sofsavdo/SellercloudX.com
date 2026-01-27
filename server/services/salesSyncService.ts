/**
 * Sales Sync Service - Automatic Revenue Share Calculation
 * Fetches sales data from Yandex Market and calculates revenue share
 * 
 * Should be run via cron job every day at midnight
 */

import { db } from '../db';
import { partners } from '@shared/schema';
import { eq, isNotNull, ne } from 'drizzle-orm';
import YandexMarketService from './yandexMarketService';
import revenueShareService from './revenueShareService';

interface PartnerMarketplaceConfig {
  yandex?: {
    apiKey: string;
    campaignId: string;
    enabled: boolean;
  };
  uzum?: {
    apiKey: string;
    enabled: boolean;
  };
}

/**
 * Sync sales data for a single partner
 */
async function syncPartnerSales(partner: any): Promise<{
  success: boolean;
  totalSalesUzs: number;
  totalOrders: number;
  marketplace: string;
  error?: string;
}> {
  try {
    // Parse marketplace integrations
    const integrations: PartnerMarketplaceConfig = partner.marketplaceIntegrations 
      ? JSON.parse(partner.marketplaceIntegrations) 
      : {};

    // Check if Yandex is configured
    if (!integrations.yandex?.enabled || !integrations.yandex?.apiKey) {
      console.log(`⏭️ Partner ${partner.id}: Yandex not configured`);
      return {
        success: false,
        totalSalesUzs: 0,
        totalOrders: 0,
        marketplace: 'yandex',
        error: 'Yandex not configured'
      };
    }

    // Create Yandex service with partner's credentials
    const yandexService = new YandexMarketService(
      integrations.yandex.apiKey,
      integrations.yandex.campaignId
    );

    // Get current month sales
    const now = new Date();
    const stats = await yandexService.getMonthlySales(now.getFullYear(), now.getMonth() + 1);

    if (!stats.success) {
      console.error(`❌ Partner ${partner.id}: Failed to fetch Yandex sales`);
      return {
        success: false,
        totalSalesUzs: 0,
        totalOrders: 0,
        marketplace: 'yandex',
        error: 'API fetch failed'
      };
    }

    console.log(`✅ Partner ${partner.id}: ${stats.totalOrders} orders, ${stats.totalSalesUzs} UZS`);

    // Update monthly sales tracking
    await revenueShareService.updateMonthlySales(partner.id, {
      totalSales: stats.totalSalesUzs,
      orders: stats.totalOrders,
      marketplace: 'yandex'
    });

    return {
      success: true,
      totalSalesUzs: stats.totalSalesUzs,
      totalOrders: stats.totalOrders,
      marketplace: 'yandex'
    };

  } catch (error: any) {
    console.error(`❌ Partner ${partner.id} sync error:`, error.message);
    return {
      success: false,
      totalSalesUzs: 0,
      totalOrders: 0,
      marketplace: 'yandex',
      error: error.message
    };
  }
}

/**
 * Sync all partners' sales data
 * Should be called via cron job
 */
export async function syncAllPartnerSales(): Promise<{
  totalPartners: number;
  synced: number;
  failed: number;
  totalSalesUzs: number;
  results: any[];
}> {
  console.log('🔄 Starting daily sales sync...');
  const startTime = Date.now();

  // Get all active partners with Yandex integration
  const activePartners = await db
    .select()
    .from(partners)
    .where(eq(partners.isActive, true));

  console.log(`📊 Found ${activePartners.length} active partners`);

  let synced = 0;
  let failed = 0;
  let totalSalesUzs = 0;
  const results: any[] = [];

  for (const partner of activePartners) {
    // Skip trial/blocked partners
    if (partner.blockedUntil && new Date(partner.blockedUntil) > new Date()) {
      console.log(`⏭️ Partner ${partner.id}: Blocked, skipping`);
      continue;
    }

    const result = await syncPartnerSales(partner);
    results.push({
      partnerId: partner.id,
      businessName: partner.businessName,
      ...result
    });

    if (result.success) {
      synced++;
      totalSalesUzs += result.totalSalesUzs;
    } else {
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const duration = Date.now() - startTime;
  console.log(`✅ Sales sync completed in ${duration}ms`);
  console.log(`📊 Synced: ${synced}, Failed: ${failed}, Total Sales: ${totalSalesUzs} UZS`);

  return {
    totalPartners: activePartners.length,
    synced,
    failed,
    totalSalesUzs,
    results
  };
}

/**
 * Calculate and update revenue share for all partners
 * Should be called after sales sync
 */
export async function calculateAllRevenueShares(): Promise<{
  calculated: number;
  totalRevenueShare: number;
}> {
  console.log('💰 Calculating revenue shares...');

  const activePartners = await db
    .select()
    .from(partners)
    .where(eq(partners.isActive, true));

  let calculated = 0;
  let totalRevenueShare = 0;

  for (const partner of activePartners) {
    try {
      const debt = await revenueShareService.updatePartnerTotalDebt(partner.id);
      if (debt > 0) {
        calculated++;
        totalRevenueShare += debt;
      }
    } catch (error: any) {
      console.error(`Error calculating share for ${partner.id}:`, error.message);
    }
  }

  console.log(`✅ Calculated: ${calculated} partners, Total: ${totalRevenueShare} UZS`);

  return {
    calculated,
    totalRevenueShare
  };
}

/**
 * Run full daily sync process
 * 1. Sync sales from all marketplaces
 * 2. Calculate revenue shares
 * 3. Check for overdue debts and block if needed
 * 4. Check for expired trials
 */
export async function runDailySyncJob(): Promise<{
  sales: any;
  revenue: any;
  blocks: any;
  trials: any;
  duration: number;
}> {
  console.log('='.repeat(60));
  console.log('🚀 DAILY SYNC JOB STARTED');
  console.log('='.repeat(60));
  
  const startTime = Date.now();

  // 1. Sync sales
  const sales = await syncAllPartnerSales();

  // 2. Calculate revenue shares
  const revenue = await calculateAllRevenueShares();

  // 3. Check for overdue debts
  const blocks = await revenueShareService.checkAndBlockOverduePartners();

  // 4. Check expired trials
  const trials = await revenueShareService.checkExpiredTrials();

  const duration = Date.now() - startTime;

  console.log('='.repeat(60));
  console.log(`✅ DAILY SYNC JOB COMPLETED in ${duration}ms`);
  console.log(`📊 Sales: ${sales.synced}/${sales.totalPartners} synced`);
  console.log(`💰 Revenue: ${revenue.calculated} calculated`);
  console.log(`🚫 Blocked: ${blocks.blocked} partners`);
  console.log(`⏰ Trials: ${trials.expired} expired`);
  console.log('='.repeat(60));

  return {
    sales,
    revenue,
    blocks,
    trials,
    duration
  };
}

export default {
  syncPartnerSales,
  syncAllPartnerSales,
  calculateAllRevenueShares,
  runDailySyncJob
};
