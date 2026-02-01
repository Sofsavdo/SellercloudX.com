// @ts-nocheck
import { db, getDbType } from '../db';
import { partners, referrals, referralBonuses } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import crypto from 'crypto';

// Universal timestamp formatter
function formatTimestamp(): any {
  const dbType = getDbType();
  return dbType === 'sqlite' ? Math.floor(Date.now() / 1000) : new Date();
}

interface AffiliateStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  conversionRate: number;
  tier: string;
  nextTierProgress: number;
}

interface AffiliateTier {
  name: string;
  minReferrals: number;
  commissionRate: number;
  bonuses: string[];
  color: string;
}

class AffiliateProgramService {
  private tiers: AffiliateTier[] = [
    {
      name: 'Bronze',
      minReferrals: 0,
      commissionRate: 10,
      bonuses: ['Basic dashboard', 'Email support'],
      color: '#CD7F32'
    },
    {
      name: 'Silver',
      minReferrals: 5,
      commissionRate: 15,
      bonuses: ['Advanced analytics', 'Priority support', 'Marketing materials'],
      color: '#C0C0C0'
    },
    {
      name: 'Gold',
      minReferrals: 15,
      commissionRate: 20,
      bonuses: ['Custom landing pages', 'Dedicated manager', 'Early access to features'],
      color: '#FFD700'
    },
    {
      name: 'Platinum',
      minReferrals: 30,
      commissionRate: 25,
      bonuses: ['White-label options', 'API access', 'Revenue share'],
      color: '#E5E4E2'
    },
    {
      name: 'Diamond',
      minReferrals: 50,
      commissionRate: 30,
      bonuses: ['Exclusive partnership', 'Custom features', 'Profit sharing'],
      color: '#B9F2FF'
    }
  ];

  /**
   * Generate unique affiliate code
   */
  generateAffiliateCode(partnerId: string): string {
    const hash = crypto.createHash('md5').update(partnerId + Date.now()).digest('hex');
    return `SCX-${hash.substring(0, 8).toUpperCase()}`;
  }

  /**
   * Create affiliate link
   */
  createAffiliateLink(affiliateCode: string, campaign?: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'https://sellercloudx.com';
    const params = new URLSearchParams({
      ref: affiliateCode,
      ...(campaign && { campaign })
    });
    return `${baseUrl}/register?${params.toString()}`;
  }

  /**
   * Track affiliate click
   */
  async trackClick(affiliateCode: string, metadata?: any): Promise<void> {
    // Store click data for analytics
    console.log('Affiliate click tracked:', { affiliateCode, metadata });
    // In production, store in database
  }

  /**
   * Register referral
   */
  async registerReferral(params: {
    referrerCode: string;
    referredPartnerId: string;
    contractType: string;
  }): Promise<{
    success: boolean;
    referralId?: string;
    error?: string;
  }> {
    try {
      // Find referrer by affiliate code
      const referrer = await db
        .select()
        .from(partners)
        .where(sql`${partners.id} = (SELECT partner_id FROM affiliate_codes WHERE code = ${params.referrerCode})`)
        .limit(1);

      if (!referrer || referrer.length === 0) {
        return { success: false, error: 'Invalid referral code' };
      }

      const referrerId = referrer[0].id;

      // Create referral record
      const referralId = crypto.randomUUID();
      await db.insert(referrals).values({
        id: referralId,
        referrerPartnerId: referrerId,
        referredPartnerId: params.referredPartnerId,
        promoCode: params.referrerCode,
        contractType: params.contractType,
        status: 'registered',
        createdAt: formatTimestamp()
      });

      return { success: true, referralId };
    } catch (error: any) {
      console.error('Register referral error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate commission
   */
  async calculateCommission(params: {
    referralId: string;
    amount: number;
    monthNumber: number;
  }): Promise<{
    commission: number;
    tier: string;
    rate: number;
  }> {
    // Get referral
    const referral = await db
      .select()
      .from(referrals)
      .where(eq(referrals.id, params.referralId))
      .limit(1);

    if (!referral || referral.length === 0) {
      return { commission: 0, tier: 'Bronze', rate: 0 };
    }

    const referrerId = referral[0].referrerPartnerId;

    // Get referrer's tier
    const stats = await this.getAffiliateStats(referrerId);
    const tier = this.getTier(stats.totalReferrals);

    // Calculate commission
    const baseCommission = params.amount * (tier.commissionRate / 100);

    // Apply time-based multiplier (higher commission in first months)
    let multiplier = 1;
    if (params.monthNumber <= 3) {
      multiplier = 1.5; // 50% bonus for first 3 months
    } else if (params.monthNumber <= 6) {
      multiplier = 1.25; // 25% bonus for months 4-6
    }

    const finalCommission = baseCommission * multiplier;

    return {
      commission: finalCommission,
      tier: tier.name,
      rate: tier.commissionRate
    };
  }

  /**
   * Process commission payment
   */
  async processCommission(params: {
    referralId: string;
    amount: number;
    monthNumber: number;
  }): Promise<{
    success: boolean;
    bonusId?: string;
    error?: string;
  }> {
    try {
      const { commission, tier, rate } = await this.calculateCommission(params);

      const referral = await db
        .select()
        .from(referrals)
        .where(eq(referrals.id, params.referralId))
        .limit(1);

      if (!referral || referral.length === 0) {
        return { success: false, error: 'Referral not found' };
      }

      const referrerId = referral[0].referrerPartnerId;

      // Create bonus record
      const bonusId = crypto.randomUUID();
      await db.insert(referralBonuses).values({
        id: bonusId,
        referralId: params.referralId,
        referrerPartnerId: referrerId,
        amount: commission,
        monthNumber: params.monthNumber,
        platformProfit: params.amount,
        bonusRate: rate,
        tierMultiplier: 1,
        status: 'pending',
        createdAt: formatTimestamp()
      });

      // Update referral total earnings
      await db
        .update(referrals)
        .set({
          bonusEarned: sql`${referrals.bonusEarned} + ${commission}`
        })
        .where(eq(referrals.id, params.referralId));

      return { success: true, bonusId };
    } catch (error: any) {
      console.error('Process commission error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get affiliate stats
   */
  async getAffiliateStats(partnerId: string): Promise<AffiliateStats> {
    // Get total referrals
    const totalReferralsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(referrals)
      .where(eq(referrals.referrerPartnerId, partnerId));

    const totalReferrals = totalReferralsResult[0]?.count || 0;

    // Get active referrals
    const activeReferralsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(referrals)
      .where(
        and(
          eq(referrals.referrerPartnerId, partnerId),
          eq(referrals.status, 'active')
        )
      );

    const activeReferrals = activeReferralsResult[0]?.count || 0;

    // Get total earnings
    const earningsResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${referralBonuses.amount}), 0)`,
        pending: sql<number>`COALESCE(SUM(CASE WHEN ${referralBonuses.status} = 'pending' THEN ${referralBonuses.amount} ELSE 0 END), 0)`
      })
      .from(referralBonuses)
      .where(eq(referralBonuses.referrerPartnerId, partnerId));

    const totalEarnings = earningsResult[0]?.total || 0;
    const pendingEarnings = earningsResult[0]?.pending || 0;

    // Calculate conversion rate
    const registeredResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(referrals)
      .where(
        and(
          eq(referrals.referrerPartnerId, partnerId),
          sql`${referrals.status} IN ('registered', 'active')`
        )
      );

    const registered = registeredResult[0]?.count || 0;
    const conversionRate = totalReferrals > 0 ? (registered / totalReferrals) * 100 : 0;

    // Get current tier
    const tier = this.getTier(totalReferrals);
    const nextTier = this.getNextTier(totalReferrals);
    const nextTierProgress = nextTier 
      ? ((totalReferrals - tier.minReferrals) / (nextTier.minReferrals - tier.minReferrals)) * 100
      : 100;

    return {
      totalReferrals,
      activeReferrals,
      totalEarnings,
      pendingEarnings,
      conversionRate,
      tier: tier.name,
      nextTierProgress
    };
  }

  /**
   * Get tier based on referral count
   */
  private getTier(referralCount: number): AffiliateTier {
    for (let i = this.tiers.length - 1; i >= 0; i--) {
      if (referralCount >= this.tiers[i].minReferrals) {
        return this.tiers[i];
      }
    }
    return this.tiers[0];
  }

  /**
   * Get next tier
   */
  private getNextTier(referralCount: number): AffiliateTier | null {
    const currentTier = this.getTier(referralCount);
    const currentIndex = this.tiers.findIndex(t => t.name === currentTier.name);
    return currentIndex < this.tiers.length - 1 ? this.tiers[currentIndex + 1] : null;
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<any[]> {
    const leaderboard = await db
      .select({
        partnerId: referralBonuses.referrerPartnerId,
        partnerName: partners.businessName,
        totalEarnings: sql<number>`SUM(${referralBonuses.amount})`,
        totalReferrals: sql<number>`COUNT(DISTINCT ${referrals.id})`
      })
      .from(referralBonuses)
      .leftJoin(partners, eq(referralBonuses.referrerPartnerId, partners.id))
      .leftJoin(referrals, eq(referralBonuses.referrerPartnerId, referrals.referrerPartnerId))
      .groupBy(referralBonuses.referrerPartnerId, partners.businessName)
      .orderBy(sql`SUM(${referralBonuses.amount}) DESC`)
      .limit(limit);

    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      partnerId: entry.partnerId,
      partnerName: entry.partnerName,
      totalEarnings: entry.totalEarnings,
      totalReferrals: entry.totalReferrals,
      tier: this.getTier(entry.totalReferrals).name
    }));
  }

  /**
   * Generate marketing materials
   */
  async generateMarketingMaterials(partnerId: string): Promise<{
    banners: string[];
    emailTemplates: string[];
    socialPosts: string[];
  }> {
    const affiliateCode = await this.getAffiliateCode(partnerId);
    const affiliateLink = this.createAffiliateLink(affiliateCode);

    return {
      banners: [
        `https://sellercloudx.com/assets/banners/728x90.png?ref=${affiliateCode}`,
        `https://sellercloudx.com/assets/banners/300x250.png?ref=${affiliateCode}`,
        `https://sellercloudx.com/assets/banners/160x600.png?ref=${affiliateCode}`
      ],
      emailTemplates: [
        `Subject: Transform Your E-commerce Business\n\nCheck out SellerCloudX: ${affiliateLink}`,
        `Subject: Automate Your Marketplace Management\n\nDiscover SellerCloudX: ${affiliateLink}`
      ],
      socialPosts: [
        `🚀 Revolutionize your e-commerce with SellerCloudX! ${affiliateLink}`,
        `💰 Increase your marketplace sales with AI automation: ${affiliateLink}`
      ]
    };
  }

  /**
   * Get affiliate code for partner
   */
  private async getAffiliateCode(partnerId: string): Promise<string> {
    // In production, fetch from database
    return this.generateAffiliateCode(partnerId);
  }

  /**
   * Request payout
   */
  async requestPayout(partnerId: string, amount: number): Promise<{
    success: boolean;
    payoutId?: string;
    error?: string;
  }> {
    try {
      const stats = await this.getAffiliateStats(partnerId);

      if (amount > stats.pendingEarnings) {
        return { success: false, error: 'Insufficient balance' };
      }

      if (amount < 100000) { // Minimum payout: 100,000 UZS
        return { success: false, error: 'Minimum payout is 100,000 UZS' };
      }

      // Create payout request
      const payoutId = crypto.randomUUID();
      // In production, create payout record in database

      return { success: true, payoutId };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const affiliateProgram = new AffiliateProgramService();
