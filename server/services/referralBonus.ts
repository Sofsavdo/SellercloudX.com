/**
 * Referal Bonus Tizimi
 * 
 * - Referrer ga 10% bonus (3 oy davomida)
 * - Avtomatik hisoblash
 * - Wallet'ga qo'shish
 */

import { db, getDbType } from '../db';
import { referrals, partners, walletTransactions, auditLogs } from '@shared/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

// Universal timestamp formatter
function formatTimestamp(): any {
  const dbType = getDbType();
  return dbType === 'sqlite' ? Math.floor(Date.now() / 1000) : new Date();
}

// Referal sozlamalari
export const REFERRAL_CONFIG = {
  bonusPercent: 10, // 10% bonus
  bonusDurationMonths: 3, // 3 oy davomida
  minPaymentForBonus: 100000, // Minimum 100,000 so'm to'lov
  maxBonusPerReferral: 5000000, // Maximum 5M so'm bonus
};

// Referal bonus hisoblash
export async function calculateReferralBonus(
  referredPartnerId: string,
  paymentAmount: number
): Promise<{ referrerId: string | null; bonusAmount: number; eligible: boolean }> {
  
  try {
    // Referred partner'ning referral ma'lumotlarini olish
    const [referral] = await db.select()
      .from(referrals)
      .where(eq(referrals.referredId, referredPartnerId));
    
    if (!referral) {
      return { referrerId: null, bonusAmount: 0, eligible: false };
    }
    
    // Bonus muddati tekshirish (3 oy ichida)
    const referralDate = new Date(referral.createdAt);
    const bonusEndDate = new Date(referralDate);
    bonusEndDate.setMonth(bonusEndDate.getMonth() + REFERRAL_CONFIG.bonusDurationMonths);
    
    if (new Date() > bonusEndDate) {
      return { referrerId: referral.referrerId, bonusAmount: 0, eligible: false };
    }
    
    // Minimum to'lov tekshirish
    if (paymentAmount < REFERRAL_CONFIG.minPaymentForBonus) {
      return { referrerId: referral.referrerId, bonusAmount: 0, eligible: false };
    }
    
    // Bonus hisoblash (10%)
    let bonusAmount = Math.round(paymentAmount * (REFERRAL_CONFIG.bonusPercent / 100));
    
    // Maximum limit
    bonusAmount = Math.min(bonusAmount, REFERRAL_CONFIG.maxBonusPerReferral);
    
    return {
      referrerId: referral.referrerId,
      bonusAmount,
      eligible: true
    };
    
  } catch (error) {
    console.error('Error calculating referral bonus:', error);
    return { referrerId: null, bonusAmount: 0, eligible: false };
  }
}

// Bonus to'lash
export async function payReferralBonus(
  referrerId: string,
  referredPartnerId: string,
  bonusAmount: number,
  paymentId: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  
  try {
    // Transaction yaratish
    const transactionId = crypto.randomUUID();
    
    await db.insert(walletTransactions).values({
      id: transactionId,
      partnerId: referrerId,
      type: 'credit',
      amount: bonusAmount,
      currency: 'UZS',
      description: `Referal bonus (${REFERRAL_CONFIG.bonusPercent}%) - Hamkor: ${referredPartnerId.slice(0, 8)}...`,
      status: 'completed',
      referenceType: 'referral_bonus',
      referenceId: paymentId,
      createdAt: formatTimestamp()
    });
    
    // Partner wallet balansini yangilash
    await db.update(partners)
      .set({
        walletBalance: sql`COALESCE(wallet_balance, 0) + ${bonusAmount}`,
        updatedAt: new Date()
      })
      .where(eq(partners.id, referrerId));
    
    // Referral statistikani yangilash
    await db.update(referrals)
      .set({
        totalEarnings: sql`COALESCE(total_earnings, 0) + ${bonusAmount}`,
        bonusPaidCount: sql`COALESCE(bonus_paid_count, 0) + 1`,
        lastBonusAt: new Date()
      })
      .where(eq(referrals.referredId, referredPartnerId));
    
    // Audit log
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId: referrerId,
      action: 'REFERRAL_BONUS_PAID',
      entityType: 'wallet',
      entityId: transactionId,
      payload: JSON.stringify({
        referrerId,
        referredPartnerId,
        bonusAmount,
        paymentId,
        percent: REFERRAL_CONFIG.bonusPercent
      }),
      createdAt: formatTimestamp()
    });
    
    return { success: true, transactionId };
    
  } catch (error) {
    console.error('Error paying referral bonus:', error);
    return { success: false, error: String(error) };
  }
}

// To'lov qilinganda avtomatik bonus
export async function processReferralBonusOnPayment(
  partnerId: string,
  paymentAmount: number,
  paymentId: string
): Promise<{ bonusPaid: boolean; referrerId?: string; bonusAmount?: number }> {
  
  try {
    // Bonus hisoblash
    const { referrerId, bonusAmount, eligible } = await calculateReferralBonus(partnerId, paymentAmount);
    
    if (!eligible || !referrerId || bonusAmount <= 0) {
      return { bonusPaid: false };
    }
    
    // Bonus to'lash
    const result = await payReferralBonus(referrerId, partnerId, bonusAmount, paymentId);
    
    if (result.success) {
      console.log(`✅ Referal bonus to'landi: ${bonusAmount} so'm -> ${referrerId}`);
      return { bonusPaid: true, referrerId, bonusAmount };
    }
    
    return { bonusPaid: false };
    
  } catch (error) {
    console.error('Error processing referral bonus:', error);
    return { bonusPaid: false };
  }
}

// Referrer statistikasi
export async function getReferrerStats(referrerId: string) {
  try {
    const referralsList = await db.select()
      .from(referrals)
      .where(eq(referrals.referrerId, referrerId));
    
    const totalReferrals = referralsList.length;
    const totalEarnings = referralsList.reduce((sum, r) => sum + (r.totalEarnings || 0), 0);
    const activeReferrals = referralsList.filter(r => {
      const createdAt = new Date(r.createdAt);
      const bonusEndDate = new Date(createdAt);
      bonusEndDate.setMonth(bonusEndDate.getMonth() + REFERRAL_CONFIG.bonusDurationMonths);
      return new Date() <= bonusEndDate;
    }).length;
    
    return {
      totalReferrals,
      activeReferrals,
      totalEarnings,
      bonusPercent: REFERRAL_CONFIG.bonusPercent,
      bonusDurationMonths: REFERRAL_CONFIG.bonusDurationMonths
    };
    
  } catch (error) {
    console.error('Error getting referrer stats:', error);
    return {
      totalReferrals: 0,
      activeReferrals: 0,
      totalEarnings: 0,
      bonusPercent: REFERRAL_CONFIG.bonusPercent,
      bonusDurationMonths: REFERRAL_CONFIG.bonusDurationMonths
    };
  }
}

// Promo kod yaratish
export function generatePromoCode(partnerId: string): string {
  const prefix = 'SCX';
  const partnerPart = partnerId.slice(0, 4).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${partnerPart}${randomPart}`;
}

export default {
  REFERRAL_CONFIG,
  calculateReferralBonus,
  payReferralBonus,
  processReferralBonusOnPayment,
  getReferrerStats,
  generatePromoCode
};
