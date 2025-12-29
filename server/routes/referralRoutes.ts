// 💰 REFERRAL SYSTEM - Complete Implementation with Error Handling
// Fixes: Constant errors, proper validation, detailed logging
import express, { Request, Response } from 'express';
import { asyncHandler } from '../errorHandler';
import { db } from '../db';
import { referrals, partners, referralEarnings, withdrawals } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// IMPROVED: Add comprehensive logging
const logInfo = (message: string, data?: any) => {
  console.log(`[REFERRAL] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

const logError = (message: string, error: any) => {
  console.error(`[REFERRAL ERROR] ${message}`, error);
};

const router = express.Router();

// Referral Commission Rates by Partner Tier (based on actual pricing)
// Commission is calculated as percentage of referred partner's monthly fee
const REFERRAL_COMMISSION_RATES: Record<string, number> = {
  free_starter: 0,      // $0/oy - no commission
  basic: 6.90,          // $69/oy × 10% = $6.90/oy
  starter_pro: 34.90,   // $349/oy × 10% = $34.90/oy
  professional: 89.90   // $899/oy × 10% = $89.90/oy
};

// Simple referral commission calculation (no tier bonuses)
function calculateReferralCommission(referredPartnerTier: string): number {
  return REFERRAL_COMMISSION_RATES[referredPartnerTier] || 0;
}

// Get referral stats without tier system
function getReferralStats(referralCount: number) {
  return {
    totalReferrals: referralCount,
    commissionRate: 10, // Fixed 10% commission
    message: 'Har bir taklif qilingan hamkor uchun oylik to\'lovning 10% komissiya olasiz'
  };
}

// Generate promo code
router.post('/generate-code', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const partner = (req as any).partner;
  
  if (!user || !partner) {
    logError('Generate code: Unauthorized', { userId: user?.id });
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    logInfo('Generating promo code', { partnerId: partner.id });

    // Check if partner already has a promo code
    const existingReferral = await db
      .select({ promoCode: referrals.promoCode })
      .from(referrals)
      .where(and(
        eq(referrals.referrerPartnerId, partner.id),
        eq(referrals.referredPartnerId, partner.id) // Self-reference for promo code
      ))
      .limit(1);

    let promoCode = existingReferral[0]?.promoCode;

    // If no promo code exists, create one
    if (!promoCode) {
      promoCode = `SCX-${nanoid(6).toUpperCase()}`;
      
      // Create self-referral record for promo code storage
      const selfReferralId = nanoid();
      await db.insert(referrals).values({
        id: selfReferralId,
        referrerPartnerId: partner.id,
        referredPartnerId: partner.id, // Self-reference
        promoCode: promoCode,
        contractType: partner.pricingTier || 'free_starter',
        status: 'active',
        createdAt: new Date(),
        activatedAt: new Date()
      });

      logInfo('Promo code created', { partnerId: partner.id, promoCode });
    } else {
      logInfo('Using existing promo code', { partnerId: partner.id, promoCode });
    }

    // Get base URL from environment or request
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shareUrl = `${baseUrl}/partner-registration?ref=${promoCode}`;
    
    res.json({
      promoCode,
      shareUrl,
      message: 'Promo kod yaratildi',
      socialShare: {
        telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('SellerCloudX bilan qo\'shiling!')}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`SellerCloudX bilan qo'shiling! ${shareUrl}`)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
      }
    });
  } catch (error: any) {
    logError('Failed to generate promo code', error);
    res.status(500).json({ 
      message: 'Promo kod yaratishda xatolik', 
      error: error.message 
    });
  }
}));

// Get referral stats - IMPROVED with error handling
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const partner = (req as any).partner;
  
  if (!user || !partner) {
    logError('Stats: Unauthorized access', { userId: user?.id });
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    logInfo('Fetching referral stats', { partnerId: partner.id });
    
    // Get all referrals with NULL safety
    const allReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerPartnerId, partner.id))
      .catch(err => {
        logError('Failed to fetch referrals', err);
        return [];
      });

    logInfo('Referrals fetched', { count: allReferrals.length });

    // Count active referrals (paid at least 1 month)
    const activeReferrals = allReferrals.filter(r => 
      r.status === 'active' || r.status === 'paid_1month'
    );

    // Get earnings with proper NULL handling
    const earnings = await db
      .select({
        total: sql<number>`COALESCE(SUM(amount), 0)`,
        paid: sql<number>`COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0)`,
        pending: sql<number>`COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0)`
      })
      .from(referralEarnings)
      .where(eq(referralEarnings.referrerPartnerId, partner.id))
      .catch(err => {
        logError('Failed to fetch earnings', err);
        return [{ total: 0, paid: 0, pending: 0 }];
      });

    const totalEarned = Number(earnings[0]?.total) || 0;
    const totalPaid = Number(earnings[0]?.paid) || 0;
    const available = Number(earnings[0]?.pending) || 0;

    // Get partner's promo code
    const partnerPromoCode = await db
      .select({ promoCode: referrals.promoCode })
      .from(referrals)
      .where(and(
        eq(referrals.referrerPartnerId, partner.id),
        eq(referrals.referredPartnerId, partner.id) // Self-reference
      ))
      .limit(1);

    const promoCode = partnerPromoCode[0]?.promoCode || null;

    // Calculate average commission per referral based on referred partners' tiers
    const referredPartners = await db
      .select({ pricingTier: partners.pricingTier })
      .from(referrals)
      .leftJoin(partners, eq(referrals.referredPartnerId, partners.id))
      .where(and(
        eq(referrals.referrerPartnerId, partner.id),
        sql`${referrals.referredPartnerId} != ${referrals.referrerPartnerId}` // Exclude self-reference
      ));

    const avgCommission = referredPartners.length > 0
      ? referredPartners.reduce((sum, p) => sum + calculateReferralCommission(p.pricingTier || 'free_starter'), 0) / referredPartners.length
      : 0;

    const response = {
      totalReferrals: allReferrals.length,
      activeReferrals: activeReferrals.length,
      totalEarned: totalEarned,
      totalPaid: totalPaid,
      available: available,
      canWithdraw: available >= 50, // Minimum $50
      commissionRate: 10, // Fixed 10% commission
      avgCommissionPerReferral: avgCommission.toFixed(2),
      promoCode: promoCode,
      referralCode: promoCode, // Alias for backward compatibility
      benefits: {
        forNewUser: {
          discount: 5,
          message: 'Ro\'yxatdan o\'tganingizda $5 chegirma'
        },
        forReferrer: {
          commissionRate: 10,
          message: 'Har bir taklif qilingan hamkor uchun oylik to\'lovning 10% komissiya olasiz',
          examples: {
            free_starter: '$0/oy (chegirma yo\'q)',
            basic: '$6.90/oy',
            starter_pro: '$34.90/oy',
            professional: '$89.90/oy'
          }
        }
      },
      howItWorks: [
        'Do\'stlaringizni taklif qiling promo kod orqali',
        'Do\'stingiz ro\'yxatdan o\'tadi va $5 chegirma oladi',
        'Do\'stingiz birinchi oylik to\'lovni amalga oshiradi',
        'Siz har oy oylik to\'lovning 10% komissiya olasiz!'
      ]
    };

    logInfo('Stats response', response);
    res.json(response);
    
  } catch (error: any) {
    logError('Referral stats error', error);
    // Return safe defaults instead of error
    res.json({
      totalReferrals: 0,
      activeReferrals: 0,
      totalEarned: 0,
      totalPaid: 0,
      available: 0,
      canWithdraw: false,
      commissionRate: 10,
      avgCommissionPerReferral: '0.00',
      promoCode: null,
      referralCode: null,
      benefits: {
        forNewUser: { discount: 5, message: 'Ro\'yxatdan o\'tganingizda $5 chegirma' },
        forReferrer: {
          commissionRate: 10,
          message: 'Har bir taklif qilingan hamkor uchun oylik to\'lovning 10% komissiya olasiz',
          examples: {
            free_starter: '$0/oy (chegirma yo\'q)',
            basic: '$6.90/oy',
            starter_pro: '$34.90/oy',
            professional: '$89.90/oy'
          }
        }
      },
      howItWorks: [
        'Do\'stlaringizni taklif qiling promo kod orqali',
        'Do\'stingiz ro\'yxatdan o\'tadi va $5 chegirma oladi',
        'Do\'stingiz birinchi oylik to\'lovni amalga oshiradi',
        'Siz har oy oylik to\'lovning 10% komissiya olasiz!'
      ],
      error: true,
      message: 'Error loading stats - showing defaults'
    });
  }
}));

// Get referral list
router.get('/list', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const partner = (req as any).partner;
  
  if (!user || !partner) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const referralList = await db
      .select({
        id: referrals.id,
        referredPartner: {
          id: partners.id,
          businessName: partners.businessName,
          pricingTier: partners.pricingTier
        },
        status: referrals.status,
        bonusEarned: referrals.bonusEarned,
        bonusPaid: referrals.bonusPaid,
        createdAt: referrals.createdAt,
        activatedAt: referrals.activatedAt
      })
      .from(referrals)
      .leftJoin(partners, eq(referrals.referredPartnerId, partners.id))
      .where(eq(referrals.referrerPartnerId, partner.id))
      .orderBy(sql`${referrals.createdAt} DESC`);

    res.json({ referrals: referralList });
  } catch (error) {
    console.error('Referral list error:', error);
    res.status(500).json({ message: 'Failed to fetch referrals' });
  }
}));

// Withdrawal request
router.post('/withdraw', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const partner = (req as any).partner;
  
  if (!user || !partner) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { amount, method, accountDetails } = req.body;

  if (!amount || amount < 50) {
    return res.status(400).json({ message: 'Minimum withdrawal amount is $50' });
  }

  if (!method) {
    return res.status(400).json({ message: 'Payment method required' });
  }

  try {
    // Check available balance
    const earnings = await db
      .select({
        available: sql<number>`COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0)`
      })
      .from(referralEarnings)
      .where(eq(referralEarnings.referrerPartnerId, partner.id));

    const available = earnings[0]?.available || 0;

    if (amount > available) {
      return res.status(400).json({ 
        message: 'Insufficient balance',
        available 
      });
    }

    // Create withdrawal request
    const withdrawalId = `wd_${nanoid()}`;
    
    await db.insert(withdrawals).values({
      id: withdrawalId,
      partnerId: partner.id,
      amount,
      method,
      accountDetails: JSON.stringify(accountDetails),
      status: 'pending',
      createdAt: new Date()
    });

    res.json({
      message: "Pul yechish so'rovi yuborildi",
      withdrawalId,
      amount,
      method,
      status: 'pending',
      estimatedProcessing: '3-5 business days'
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ message: 'Failed to process withdrawal' });
  }
}));

// Get withdrawal history
router.get('/withdrawals', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const partner = (req as any).partner;
  
  if (!user || !partner) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const withdrawalHistory = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.partnerId, partner.id))
      .orderBy(sql`${withdrawals.createdAt} DESC`);

    res.json({ withdrawals: withdrawalHistory });
  } catch (error) {
    console.error('Withdrawal history error:', error);
    res.status(500).json({ message: 'Failed to fetch withdrawals' });
  }
}));

// Leaderboard
router.get('/leaderboard', asyncHandler(async (req: Request, res: Response) => {
  try {
    const leaderboard = await db
      .select({
        partnerId: referrals.referrerPartnerId,
        businessName: partners.businessName,
        referralCount: sql<number>`COUNT(*)`,
        totalEarnings: sql<number>`COALESCE(SUM(${referrals.bonusEarned}), 0)`
      })
      .from(referrals)
      .leftJoin(partners, eq(referrals.referrerPartnerId, partners.id))
      .where(eq(referrals.status, 'active'))
      .groupBy(referrals.referrerPartnerId, partners.businessName)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);

    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      name: entry.businessName || 'Anonymous',
      referrals: entry.referralCount,
      earnings: entry.totalEarnings
    }));

    res.json({ leaderboard: formattedLeaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
}));

// Validate promo code
router.get('/validate/:code', asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.params;
  const upperCode = code.toUpperCase().trim();

  try {
    logInfo('Validating promo code', { code: upperCode });
    
    // Check if code exists and is valid
    const referral = await db
      .select({
        referrer: {
          id: partners.id,
          businessName: partners.businessName,
          pricingTier: partners.pricingTier
        },
        promoCode: referrals.promoCode,
        status: referrals.status
      })
      .from(referrals)
      .leftJoin(partners, eq(referrals.referrerPartnerId, partners.id))
      .where(eq(referrals.promoCode, upperCode))
      .limit(1);

    if (referral.length === 0) {
      logInfo('Promo code not found', { code: upperCode });
      return res.status(404).json({ 
        valid: false,
        message: 'Promo kod topilmadi' 
      });
    }

    const referrerData = referral[0];
    
    // Calculate benefits based on actual pricing
    const referrerTier = referrerData.referrer?.pricingTier || 'free_starter';
    const commissionAmount = calculateReferralCommission(referrerTier);
    
    const benefits = {
      forNewUser: {
        discount: 5, // $5 discount for new user
        message: 'Ro\'yxatdan o\'tganingizda $5 chegirma olasiz!'
      },
      forReferrer: {
        commissionRate: 10,
        commissionAmount: commissionAmount,
        message: commissionAmount > 0 
          ? `Taklif qiluvchi har oy $${commissionAmount.toFixed(2)} komissiya oladi (oylik to'lovning 10%)`
          : 'Taklif qiluvchi komissiya olmaydi (Free Starter tarif)'
      }
    };

    logInfo('Promo code validated', { 
      code: upperCode, 
      referrer: referrerData.referrer?.businessName 
    });

    res.json({
      valid: true,
      referrer: referrerData.referrer,
      benefits,
      message: 'Promo kod to\'g\'ri!'
    });
  } catch (error) {
    logError('Validate code error', error);
    res.status(500).json({ message: 'Promo kod tekshirishda xatolik' });
  }
}));

export default router;
