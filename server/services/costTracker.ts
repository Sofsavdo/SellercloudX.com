// @ts-nocheck
// COST TRACKER - Real-time AI Usage Monitoring
// Track, limit, and optimize AI costs per partner

import { storage } from '../storage';
import { db } from '../db';
import { aiCostRecords } from '@shared/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export interface CostRecord {
  id: string;
  partnerId: string;
  operation: string;
  model: string;
  tokensUsed?: number;
  imagesGenerated?: number;
  cost: number;
  tier: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UsageSummary {
  partnerId: string;
  tier: string;
  periodStart: Date;
  periodEnd: Date;
  totalCost: number;
  operationBreakdown: Record<string, { count: number; cost: number }>;
  remainingBudget: number;
  budgetLimit: number;
  utilizationPercent: number;
}

// Monthly budget limits per tier (USD)
const TIER_LIMITS: Record<string, number> = {
  starter_pro: 10,
  business_standard: 20,
  professional_plus: 30,
  enterprise_elite: 50,
};

// In-memory cache (TODO: move to Redis for production)
const costCache = new Map<string, CostRecord[]>();

// ========================================
// COST LOGGING
// ========================================

export async function logCost(record: Omit<CostRecord, 'id' | 'timestamp'>): Promise<void> {
  const recordId = nanoid();
  const timestamp = new Date();
  
  const fullRecord: CostRecord = {
    ...record,
    id: recordId,
    timestamp,
  };

  try {
    // Save to database
    await db.insert(aiCostRecords).values({
      id: recordId,
      partnerId: record.partnerId,
      operation: record.operation,
      model: record.model,
      tokensUsed: record.tokensUsed,
      imagesGenerated: record.imagesGenerated,
      cost: record.cost,
      tier: record.tier,
      metadata: record.metadata ? JSON.stringify(record.metadata) : null,
      createdAt: timestamp,
    });

    // Add to cache for quick access
    const partnerCosts = costCache.get(record.partnerId) || [];
    partnerCosts.push(fullRecord);
    costCache.set(record.partnerId, partnerCosts);

    console.log(`📊 Cost logged: ${record.partnerId} | ${record.operation} | $${record.cost.toFixed(4)}`);
  } catch (error) {
    console.error('Error logging cost:', error);
    // Still add to cache even if DB fails
    const partnerCosts = costCache.get(record.partnerId) || [];
    partnerCosts.push(fullRecord);
    costCache.set(record.partnerId, partnerCosts);
  }
}

// ========================================
// USAGE SUMMARY
// ========================================

export async function getUsageSummary(
  partnerId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<UsageSummary> {
  try {
    // Get partner tier
    const partner = await storage.getPartnerById(partnerId);
    const tier = partner?.pricingTier || 'starter_pro';
    const budgetLimit = TIER_LIMITS[tier] || 10;

    // Get costs from database
    const dbCosts = await db.select()
      .from(aiCostRecords)
      .where(
        and(
          eq(aiCostRecords.partnerId, partnerId),
          gte(aiCostRecords.createdAt, periodStart),
          lte(aiCostRecords.createdAt, periodEnd)
        )
      );

    // Convert to CostRecord format
    const periodCosts: CostRecord[] = dbCosts.map(c => ({
      id: c.id,
      partnerId: c.partnerId,
      operation: c.operation,
      model: c.model,
      tokensUsed: c.tokensUsed || undefined,
      imagesGenerated: c.imagesGenerated || undefined,
      cost: c.cost,
      tier: c.tier,
      timestamp: c.createdAt || new Date(),
      metadata: c.metadata ? JSON.parse(c.metadata) : undefined,
    }));

    // Calculate totals
    const totalCost = periodCosts.reduce((sum, c) => sum + c.cost, 0);

    // Breakdown by operation
    const operationBreakdown: Record<string, { count: number; cost: number }> = {};
    periodCosts.forEach(c => {
      if (!operationBreakdown[c.operation]) {
        operationBreakdown[c.operation] = { count: 0, cost: 0 };
      }
      operationBreakdown[c.operation].count++;
      operationBreakdown[c.operation].cost += c.cost;
    });

    const remainingBudget = Math.max(0, budgetLimit - totalCost);
    const utilizationPercent = (totalCost / budgetLimit) * 100;

    return {
      partnerId,
      tier,
      periodStart,
      periodEnd,
      totalCost,
      operationBreakdown,
      remainingBudget,
      budgetLimit,
      utilizationPercent,
    };
  } catch (error) {
    console.error('Error getting usage summary:', error);
    // Return empty summary on error
    const partner = await storage.getPartnerById(partnerId);
    const tier = partner?.pricingTier || 'starter_pro';
    const budgetLimit = TIER_LIMITS[tier] || 10;
    
    return {
      partnerId,
      tier,
      periodStart,
      periodEnd,
      totalCost: 0,
      operationBreakdown: {},
      remainingBudget: budgetLimit,
      budgetLimit,
      utilizationPercent: 0,
    };
  }
}

// ========================================
// BUDGET CHECK
// ========================================

export async function checkBudget(
  partnerId: string,
  estimatedCost: number
): Promise<{ allowed: boolean; remainingBudget: number; message?: string }> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const summary = await getUsageSummary(partnerId, monthStart, monthEnd);

  if (summary.totalCost + estimatedCost > summary.budgetLimit) {
    return {
      allowed: false,
      remainingBudget: summary.remainingBudget,
      message: `Budget limit exceeded. Limit: $${summary.budgetLimit}, Used: $${summary.totalCost.toFixed(2)}, Remaining: $${summary.remainingBudget.toFixed(2)}`,
    };
  }

  return {
    allowed: true,
    remainingBudget: summary.remainingBudget - estimatedCost,
  };
}

// ========================================
// OPTIMIZATION RECOMMENDATIONS
// ========================================

export async function getOptimizationRecommendations(
  partnerId: string
): Promise<string[]> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const summary = await getUsageSummary(partnerId, monthStart, now);

  const recommendations: string[] = [];

  // Check utilization
  if (summary.utilizationPercent > 80) {
    recommendations.push(`⚠️ Budget ${summary.utilizationPercent.toFixed(0)}% ishlatilgan. Upgrade qilish tavsiya etiladi.`);
  }

  // Check operation costs
  Object.entries(summary.operationBreakdown).forEach(([op, data]) => {
    if (data.cost > summary.budgetLimit * 0.5) {
      recommendations.push(`📊 ${op} uchun harajatlar yuqori ($${data.cost.toFixed(2)}). Template ishlatishni ko'rib chiqing.`);
    }
  });

  // Template usage recommendation
  const productCardCost = summary.operationBreakdown['product_card_creation']?.cost || 0;
  if (productCardCost > 5) {
    recommendations.push(`💡 Product card template ishlatish $${(productCardCost * 0.9).toFixed(2)} tejaydi!`);
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ AI usage optimal! Davom eting.');
  }

  return recommendations;
}

// ========================================
// DASHBOARD STATS
// ========================================

export async function getDashboardStats(partnerId: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todaySummary = await getUsageSummary(partnerId, today, now);
  const weekSummary = await getUsageSummary(partnerId, weekAgo, now);
  const monthSummary = await getUsageSummary(partnerId, monthStart, now);

  return {
    today: {
      cost: todaySummary.totalCost,
      operations: Object.values(todaySummary.operationBreakdown).reduce((sum, op) => sum + op.count, 0),
    },
    week: {
      cost: weekSummary.totalCost,
      operations: Object.values(weekSummary.operationBreakdown).reduce((sum, op) => sum + op.count, 0),
    },
    month: {
      cost: monthSummary.totalCost,
      operations: Object.values(monthSummary.operationBreakdown).reduce((sum, op) => sum + op.count, 0),
      remainingBudget: monthSummary.remainingBudget,
      utilizationPercent: monthSummary.utilizationPercent,
    },
  };
}

// ========================================
// EXPORTS
// ========================================

export const costTracker = {
  logCost,
  getUsageSummary,
  checkBudget,
  getOptimizationRecommendations,
  getDashboardStats,
};

export default costTracker;
