import { Router, Request, Response } from 'express';
import { requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../errorHandler';
import { db } from '../db';
import { partners, users, walletTransactions } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

const router = Router();

// Get business metrics and analytics
router.get('/business-metrics', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  console.log('📊 Calculating business metrics...');

  // Get all partners
  const allPartners = await db.select().from(partners);
  
  // Calculate metrics
  const totalPartners = allPartners.length;
  const activePartners = allPartners.filter(p => p.isActive).length;
  const payingPartners = allPartners.filter(p => 
    p.pricingTier && !['free', 'free_starter'].includes(p.pricingTier)
  ).length;
  const freePartners = allPartners.filter(p => 
    !p.pricingTier || ['free', 'free_starter'].includes(p.pricingTier)
  ).length;

  // Tier distribution
  const tierDistribution = {
    free: allPartners.filter(p => !p.pricingTier || p.pricingTier === 'free' || p.pricingTier === 'free_starter').length,
    basic: allPartners.filter(p => p.pricingTier === 'basic').length,
    starter_pro: allPartners.filter(p => p.pricingTier === 'starter_pro').length,
    professional: allPartners.filter(p => p.pricingTier === 'professional').length,
  };

  // Calculate MRR (Monthly Recurring Revenue)
  const tierPrices: Record<string, number> = {
    basic: 69,
    starter_pro: 349,
    professional: 899,
  };

  let mrr = 0;
  allPartners.forEach(partner => {
    if (partner.pricingTier && tierPrices[partner.pricingTier]) {
      mrr += tierPrices[partner.pricingTier];
    }
  });

  const arr = mrr * 12; // Annual Recurring Revenue

  // Calculate total revenue from wallet transactions
  const completedTransactions = await db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.status, 'completed'));

  const totalRevenue = completedTransactions
    .filter(t => t.type === 'income' || t.type === 'commission')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Estimate costs (15% of revenue for platform costs)
  const totalCosts = totalRevenue * 0.15;
  const profit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : '0';

  // Calculate churn (simplified - need historical data for accurate)
  const churnedPartners = allPartners.filter(p => !p.isActive).length;
  const churnRate = totalPartners > 0 
    ? ((churnedPartners / totalPartners) * 100).toFixed(1)
    : '0';

  // Growth metrics (simplified - compare with last month)
  // In real scenario, you'd query historical data
  const growth = {
    partners: '+12.5', // Mock data - calculate from historical
    mrr: '+15.3',
    revenue: '+18.7',
  };

  const metrics = {
    totalPartners,
    activePartners,
    payingPartners,
    churnedPartners,
    freePartners,
    mrr: mrr.toFixed(2),
    arr: arr.toFixed(2),
    totalRevenue: totalRevenue.toFixed(2),
    totalCosts: totalCosts.toFixed(2),
    profitMargin,
    churnRate,
    growth,
    tierDistribution,
  };

  console.log('📊 Business metrics:', metrics);

  res.json({ metrics });
}));

export default router;
