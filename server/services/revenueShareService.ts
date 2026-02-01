/**
 * 2026 Revenue Share & Billing Service
 * Handles revenue share calculation, debt tracking, and account blocking
 */

import { db, getDbType } from '../db';
import { partners, monthlySalesTracking, revenueSharePayments } from '@shared/schema';
import { eq, and, lt, gt, isNull, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Universal timestamp formatter
function formatTimestamp(): any {
  const dbType = getDbType();
  return dbType === 'sqlite' ? Math.floor(Date.now() / 1000) : new Date();
}

// Constants
const USD_TO_UZS = 12600;
const DEBT_GRACE_DAYS = 7; // Days before blocking
const BLOCK_DURATION_DAYS = 14; // How long account stays blocked

interface SalesData {
  totalSales: number;
  orders: number;
  marketplace: string;
}

interface DebtCalculation {
  partnerId: string;
  month: number;
  totalSalesUzs: number;
  revenueShareUzs: number;
  monthlyFeeUzs: number;
  totalDebtUzs: number;
}

/**
 * Calculate revenue share for a partner's sales
 */
export function calculateRevenueShare(
  totalSalesUzs: number, 
  sharePercent: number = 0.04
): number {
  return Math.round(totalSalesUzs * sharePercent);
}

/**
 * Get current month in YYYYMM format
 */
export function getCurrentMonth(): number {
  const now = new Date();
  return parseInt(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`);
}

/**
 * Update or create monthly sales tracking record
 */
export async function updateMonthlySales(
  partnerId: string,
  salesData: SalesData
): Promise<void> {
  const month = getCurrentMonth();
  
  // Get partner's share percentage
  const [partner] = await db.select().from(partners).where(eq(partners.id, partnerId));
  if (!partner) throw new Error('Partner not found');
  
  const sharePercent = partner.revenueSharePercent || 0.04;
  const monthlyFeeUzs = (partner.monthlyFeeUsd || 499) * USD_TO_UZS;
  const revenueShareUzs = calculateRevenueShare(salesData.totalSales, sharePercent);
  const totalDebtUzs = revenueShareUzs + monthlyFeeUzs;

  // Check if record exists
  const [existing] = await db
    .select()
    .from(monthlySalesTracking)
    .where(
      and(
        eq(monthlySalesTracking.partnerId, partnerId),
        eq(monthlySalesTracking.month, month),
        eq(monthlySalesTracking.marketplace, salesData.marketplace)
      )
    );

  if (existing) {
    // Update existing
    await db
      .update(monthlySalesTracking)
      .set({
        totalSalesUzs: salesData.totalSales,
        totalOrders: salesData.orders,
        revenueShareUzs,
        monthlyFeeUzs,
        totalDebtUzs,
        lastSyncAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(monthlySalesTracking.id, existing.id));
  } else {
    // Create new
    await db.insert(monthlySalesTracking).values({
      id: nanoid(),
      partnerId,
      month,
      marketplace: salesData.marketplace,
      totalSalesUzs: salesData.totalSales,
      totalOrders: salesData.orders,
      revenueShareUzs,
      monthlyFeeUzs,
      totalDebtUzs,
      isPaid: false,
      lastSyncAt: new Date(),
      createdAt: formatTimestamp()
    });
  }

  // Update partner's total debt
  await updatePartnerTotalDebt(partnerId);
}

/**
 * Calculate and update partner's total debt across all unpaid months
 */
export async function updatePartnerTotalDebt(partnerId: string): Promise<number> {
  // Sum all unpaid debts
  const unpaidRecords = await db
    .select()
    .from(monthlySalesTracking)
    .where(
      and(
        eq(monthlySalesTracking.partnerId, partnerId),
        eq(monthlySalesTracking.isPaid, false)
      )
    );

  const totalDebt = unpaidRecords.reduce((sum, record) => sum + (record.totalDebtUzs || 0), 0);

  // Update partner
  await db
    .update(partners)
    .set({
      totalDebtUzs: totalDebt,
      lastDebtCalculatedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(partners.id, partnerId));

  return totalDebt;
}

/**
 * Record a payment
 */
export async function recordPayment(params: {
  partnerId: string;
  amountUzs: number;
  paymentType: 'revenue_share' | 'monthly_fee' | 'setup_fee';
  paymentMethod: 'click' | 'payme' | 'manual';
  transactionId?: string;
  confirmedBy?: string;
  notes?: string;
  monthlyTrackingId?: string;
}): Promise<void> {
  const {
    partnerId,
    amountUzs,
    paymentType,
    paymentMethod,
    transactionId,
    confirmedBy,
    notes,
    monthlyTrackingId
  } = params;

  // Create payment record
  await db.insert(revenueSharePayments).values({
    id: nanoid(),
    partnerId,
    monthlyTrackingId,
    amountUzs,
    paymentType,
    paymentMethod,
    transactionId,
    confirmedBy,
    notes,
    status: 'completed',
    createdAt: formatTimestamp(),
    completedAt: new Date()
  });

  // If setup fee, mark as paid
  if (paymentType === 'setup_fee') {
    await db
      .update(partners)
      .set({
        setupPaid: true,
        updatedAt: new Date()
      })
      .where(eq(partners.id, partnerId));
  }

  // If monthly tracking payment, mark as paid
  if (monthlyTrackingId) {
    await db
      .update(monthlySalesTracking)
      .set({
        isPaid: true,
        paidAt: new Date(),
        paidAmount: amountUzs,
        paymentMethod,
        updatedAt: new Date()
      })
      .where(eq(monthlySalesTracking.id, monthlyTrackingId));
  }

  // Update partner's total debt
  await updatePartnerTotalDebt(partnerId);

  // Unblock if blocked
  await unblockPartner(partnerId);
}

/**
 * Admin confirms manual payment
 */
export async function confirmManualPayment(
  paymentId: string,
  adminUserId: string
): Promise<void> {
  const [payment] = await db
    .select()
    .from(revenueSharePayments)
    .where(eq(revenueSharePayments.id, paymentId));

  if (!payment) throw new Error('Payment not found');
  if (payment.status === 'completed') throw new Error('Payment already confirmed');

  await db
    .update(revenueSharePayments)
    .set({
      status: 'completed',
      confirmedBy: adminUserId,
      completedAt: new Date()
    })
    .where(eq(revenueSharePayments.id, paymentId));

  // Update partner's debt
  await updatePartnerTotalDebt(payment.partnerId);

  // Unblock if blocked
  await unblockPartner(payment.partnerId);
}

/**
 * Check and block partners with overdue debt
 * Should be run daily via cron
 */
export async function checkAndBlockOverduePartners(): Promise<{
  checked: number;
  blocked: number;
}> {
  const overdueDate = new Date();
  overdueDate.setDate(overdueDate.getDate() - DEBT_GRACE_DAYS);

  // Find partners with unpaid debt older than grace period
  const unpaidRecords = await db
    .select()
    .from(monthlySalesTracking)
    .where(
      and(
        eq(monthlySalesTracking.isPaid, false),
        lt(monthlySalesTracking.createdAt, overdueDate)
      )
    );

  // Get unique partner IDs
  const partnerIds = [...new Set(unpaidRecords.map(r => r.partnerId))];
  let blocked = 0;

  for (const partnerId of partnerIds) {
    const [partner] = await db.select().from(partners).where(eq(partners.id, partnerId));
    
    // Skip if already blocked or trial
    if (partner?.blockedUntil || partner?.tariffType === 'trial') continue;

    // Block partner
    const blockUntil = new Date();
    blockUntil.setDate(blockUntil.getDate() + BLOCK_DURATION_DAYS);

    await db
      .update(partners)
      .set({
        blockedUntil: blockUntil,
        blockReason: 'To\'lov kechiktirilgan (7+ kun)',
        aiEnabled: false,
        updatedAt: new Date()
      })
      .where(eq(partners.id, partnerId));

    blocked++;

    // TODO: Send notification (Telegram, email)
    console.log(`[BILLING] Partner ${partnerId} blocked for overdue payment`);
  }

  return {
    checked: partnerIds.length,
    blocked
  };
}

/**
 * Unblock a partner after payment
 */
export async function unblockPartner(partnerId: string): Promise<void> {
  const [partner] = await db.select().from(partners).where(eq(partners.id, partnerId));
  
  if (!partner?.blockedUntil) return;

  // Check if all debts are paid
  const totalDebt = await updatePartnerTotalDebt(partnerId);
  
  if (totalDebt <= 0) {
    await db
      .update(partners)
      .set({
        blockedUntil: null,
        blockReason: null,
        aiEnabled: true,
        updatedAt: new Date()
      })
      .where(eq(partners.id, partnerId));

    console.log(`[BILLING] Partner ${partnerId} unblocked after payment`);
  }
}

/**
 * Get partner's billing summary
 */
export async function getPartnerBillingSummary(partnerId: string): Promise<{
  currentDebt: number;
  monthlyBreakdown: any[];
  paymentHistory: any[];
  isBlocked: boolean;
  blockReason?: string;
  salesBeforeUs: number;
  currentMonthSales: number;
  salesGrowthPercent: number;
}> {
  const [partner] = await db.select().from(partners).where(eq(partners.id, partnerId));
  if (!partner) throw new Error('Partner not found');

  const currentMonth = getCurrentMonth();

  // Get monthly breakdown
  const monthlyBreakdown = await db
    .select()
    .from(monthlySalesTracking)
    .where(eq(monthlySalesTracking.partnerId, partnerId))
    .orderBy(desc(monthlySalesTracking.month));

  // Get payment history
  const paymentHistory = await db
    .select()
    .from(revenueSharePayments)
    .where(eq(revenueSharePayments.partnerId, partnerId))
    .orderBy(desc(revenueSharePayments.createdAt));

  // Calculate current month sales
  const currentMonthRecords = monthlyBreakdown.filter(r => r.month === currentMonth);
  const currentMonthSales = currentMonthRecords.reduce((sum, r) => sum + (r.totalSalesUzs || 0), 0);

  // Calculate growth
  const salesBeforeUs = partner.salesBeforeUs || 0;
  const salesGrowthPercent = salesBeforeUs > 0
    ? Math.round(((currentMonthSales - salesBeforeUs) / salesBeforeUs) * 100)
    : (currentMonthSales > 0 ? 100 : 0);

  return {
    currentDebt: partner.totalDebtUzs || 0,
    monthlyBreakdown,
    paymentHistory,
    isBlocked: !!partner.blockedUntil && new Date(partner.blockedUntil) > new Date(),
    blockReason: partner.blockReason || undefined,
    salesBeforeUs,
    currentMonthSales,
    salesGrowthPercent
  };
}

/**
 * Start trial period for new partner
 */
export async function startTrialPeriod(partnerId: string): Promise<void> {
  const now = new Date();
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7); // 7-day trial

  await db
    .update(partners)
    .set({
      tariffType: 'trial',
      trialStartDate: now,
      trialEndDate: trialEnd,
      aiEnabled: true,
      isActive: true,
      updatedAt: now
    })
    .where(eq(partners.id, partnerId));

  console.log(`[BILLING] Trial started for partner ${partnerId}, ends ${trialEnd.toISOString()}`);
}

/**
 * Activate premium tariff after setup payment
 */
export async function activatePremiumTariff(
  partnerId: string,
  customTerms?: {
    monthlyFeeUsd?: number;
    revenueSharePercent?: number;
    setupFeeUsd?: number;
  }
): Promise<void> {
  const now = new Date();
  const guaranteeEnd = new Date();
  guaranteeEnd.setDate(guaranteeEnd.getDate() + 60); // 60-day guarantee

  await db
    .update(partners)
    .set({
      tariffType: 'premium',
      setupPaid: true,
      setupFeeUsd: customTerms?.setupFeeUsd || 699,
      monthlyFeeUsd: customTerms?.monthlyFeeUsd || 499,
      revenueSharePercent: customTerms?.revenueSharePercent || 0.04,
      guaranteeStartDate: now,
      aiEnabled: true,
      isActive: true,
      approved: true,
      activatedAt: now,
      updatedAt: now
    })
    .where(eq(partners.id, partnerId));

  console.log(`[BILLING] Premium activated for partner ${partnerId}`);
}

/**
 * Check and expire trial periods
 * Should be run daily via cron
 */
export async function checkExpiredTrials(): Promise<{
  checked: number;
  expired: number;
}> {
  const now = new Date();

  // Find expired trials
  const expiredPartners = await db
    .select()
    .from(partners)
    .where(
      and(
        eq(partners.tariffType, 'trial'),
        lt(partners.trialEndDate, now)
      )
    );

  let expired = 0;

  for (const partner of expiredPartners) {
    // Deactivate trial
    await db
      .update(partners)
      .set({
        tariffType: 'expired_trial',
        aiEnabled: false,
        isActive: false,
        updatedAt: now
      })
      .where(eq(partners.id, partner.id));

    expired++;
    console.log(`[BILLING] Trial expired for partner ${partner.id}`);
    
    // TODO: Send notification to upgrade
  }

  return {
    checked: expiredPartners.length,
    expired
  };
}

export default {
  calculateRevenueShare,
  updateMonthlySales,
  updatePartnerTotalDebt,
  recordPayment,
  confirmManualPayment,
  checkAndBlockOverduePartners,
  unblockPartner,
  getPartnerBillingSummary,
  startTrialPeriod,
  activatePremiumTariff,
  checkExpiredTrials
};
