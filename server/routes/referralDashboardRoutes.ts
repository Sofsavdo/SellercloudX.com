import { Router, Request, Response } from 'express';
import { requirePartner } from '../middleware/auth';
import { asyncHandler } from '../errorHandler';
import { db } from '../db';
import { referrals, partners, walletTransactions } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const router = Router();

// Get referral dashboard data
router.get('/referrals/dashboard', requirePartner, asyncHandler(async (req: Request, res: Response) => {
  const partnerId = req.session.user!.id;

  const [partner] = await db
    .select()
    .from(partners)
    .where(eq(partners.userId, partnerId))
    .limit(1);

  if (!partner) {
    return res.status(404).json({ message: 'Hamkor topilmadi' });
  }

  // Get all referrals
  const allReferrals = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referrerId, partner.id));

  // Get referral earnings from wallet transactions
  const earnings = await db
    .select()
    .from(walletTransactions)
    .where(and(
      eq(walletTransactions.partnerId, partner.id),
      eq(walletTransactions.type, 'commission'),
      eq(walletTransactions.status, 'completed')
    ));

  const totalEarnings = earnings.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const pendingEarnings = await db
    .select()
    .from(walletTransactions)
    .where(and(
      eq(walletTransactions.partnerId, partner.id),
      eq(walletTransactions.type, 'commission'),
      eq(walletTransactions.status, 'pending')
    ));

  const pending = pendingEarnings.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Generate referral link
  const referralCode = partner.referralCode || partner.id.slice(0, 8);
  const referralLink = `https://sellercloudx.com/register?ref=${referralCode}`;

  res.json({
    referralCode,
    referralLink,
    stats: {
      totalReferrals: allReferrals.length,
      activeReferrals: allReferrals.filter(r => r.status === 'active').length,
      pendingReferrals: allReferrals.filter(r => r.status === 'pending').length,
      totalEarnings: totalEarnings.toFixed(2),
      pendingEarnings: pending.toFixed(2),
      conversionRate: allReferrals.length > 0 
        ? ((allReferrals.filter(r => r.status === 'active').length / allReferrals.length) * 100).toFixed(1)
        : '0'
    },
    referrals: allReferrals.slice(0, 20),
    recentEarnings: earnings.slice(0, 10)
  });
}));

// Get referral analytics
router.get('/referrals/analytics', requirePartner, asyncHandler(async (req: Request, res: Response) => {
  const partnerId = req.session.user!.id;

  const [partner] = await db
    .select()
    .from(partners)
    .where(eq(partners.userId, partnerId))
    .limit(1);

  if (!partner) {
    return res.status(404).json({ message: 'Hamkor topilmadi' });
  }

  const allReferrals = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referrerId, partner.id));

  // Group by month
  const byMonth = allReferrals.reduce((acc: any, ref) => {
    const month = new Date(ref.createdAt).toISOString().slice(0, 7);
    if (!acc[month]) {
      acc[month] = { month, count: 0, active: 0 };
    }
    acc[month].count++;
    if (ref.status === 'active') acc[month].active++;
    return acc;
  }, {});

  res.json({
    byMonth: Object.values(byMonth),
    byStatus: {
      active: allReferrals.filter(r => r.status === 'active').length,
      pending: allReferrals.filter(r => r.status === 'pending').length,
      inactive: allReferrals.filter(r => r.status === 'inactive').length,
    }
  });
}));

export default router;
