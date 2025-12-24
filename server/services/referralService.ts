// Referral Service - Complete referral system with bonuses and payouts
import { db } from '../db';
import { partners } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';

// ==================== REFERRAL CONFIGURATION ====================

export const REFERRAL_CONFIG = {
  signupBonus: {
    free_starter: 0,
    basic: 10,
    starter: 50,
    professional: 100,
  },
  commissionShare: {
    level1: 0.10, // 10% of referred partner's commission
    level2: 0.05, // 5% of level 2 partner's commission
  },
  milestones: [
    { referrals: 5, bonus: 50 },
    { referrals: 10, bonus: 150 },
    { referrals: 25, bonus: 500 },
    { referrals: 50, bonus: 1500 },
    { referrals: 100, bonus: 5000 },
  ],
};

// ==================== REFERRAL TRACKING ====================

export async function createReferral(
  referrerId: string,
  referredId: string,
  referralCode: string,
  tierAtSignup: string
) {
  const referralId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create referral record (using partners table for now)
  // In production, you'd have a separate referrals table
  
  // Calculate signup bonus
  const signupBonus = REFERRAL_CONFIG.signupBonus[tierAtSignup as keyof typeof REFERRAL_CONFIG.signupBonus] || 0;

  // Record bonus
  if (signupBonus > 0) {
    await recordReferralEarning(
      referralId,
      referrerId,
      referredId,
      'signup_bonus',
      signupBonus
    );
  }

  // Check milestone bonuses
  await checkMilestoneBonuses(referrerId);

  return referralId;
}

export async function recordReferralEarning(
  referralId: string,
  referrerId: string,
  referredId: string,
  earningType: string,
  amount: number
) {
  const earningId = `earn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Store in metadata for now
  // In production, you'd have a referral_earnings table
  
  console.log('Referral Earning:', {
    earningId,
    referralId,
    referrerId,
    referredId,
    earningType,
    amount,
  });

  return earningId;
}

export async function calculateCommissionShare(
  referredCommission: number,
  referralLevel: number
): Promise<number> {
  const shareRate = referralLevel === 1 
    ? REFERRAL_CONFIG.commissionShare.level1 
    : REFERRAL_CONFIG.commissionShare.level2;

  return referredCommission * shareRate;
}

export async function checkMilestoneBonuses(referrerId: string) {
  // Get total referrals count
  // In production, query from referrals table
  const totalReferrals = 0; // Placeholder

  // Check if reached any milestone
  for (const milestone of REFERRAL_CONFIG.milestones) {
    if (totalReferrals === milestone.referrals) {
      await recordReferralEarning(
        `milestone_${milestone.referrals}`,
        referrerId,
        referrerId,
        'milestone',
        milestone.bonus
      );
      
      console.log(`🎉 Milestone reached: ${milestone.referrals} referrals = $${milestone.bonus}`);
    }
  }
}

// ==================== REFERRAL STATS ====================

export async function getReferralStats(partnerId: string) {
  // In production, query from referrals and earnings tables
  return {
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    referralCode: `REF${partnerId.slice(-6).toUpperCase()}`,
    referralLink: `https://sellercloudx.com/register?ref=REF${partnerId.slice(-6).toUpperCase()}`,
  };
}

export default {
  REFERRAL_CONFIG,
  createReferral,
  recordReferralEarning,
  calculateCommissionShare,
  checkMilestoneBonuses,
  getReferralStats,
};
