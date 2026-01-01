// Admin Referral Management Routes
// Admin panelda referral tizimini boshqarish, bonuslarni sozlash

import express, { Request, Response } from 'express';
import { asyncHandler } from '../errorHandler';
import { db } from '../db';
import { referrals, referralEarnings, partners } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

const router = express.Router();

// Get all referral statistics (Admin)
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    // Total referrals
    const [totalReferrals] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(referrals);

    // Active referrals
    const [activeReferrals] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(referrals)
      .where(eq(referrals.status, 'active'));

    // Total earnings
    const [totalEarnings] = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(referralEarnings);

    // Top referrers
    const topReferrers = await db
      .select({
        partnerId: referrals.referrerPartnerId,
        businessName: partners.businessName,
        referralCount: sql<number>`COUNT(*)`,
        totalEarnings: sql<number>`COALESCE(SUM(${referralEarnings.amount}), 0)`
      })
      .from(referrals)
      .leftJoin(partners, eq(referrals.referrerPartnerId, partners.id))
      .leftJoin(referralEarnings, eq(referrals.referrerPartnerId, referralEarnings.referrerPartnerId))
      .groupBy(referrals.referrerPartnerId, partners.businessName)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);

    res.json({
      totalReferrals: totalReferrals.count,
      activeReferrals: activeReferrals.count,
      totalEarnings: totalEarnings.total,
      topReferrers: topReferrers.map(r => ({
        partnerId: r.partnerId,
        businessName: r.businessName,
        referralCount: r.referralCount,
        totalEarnings: r.totalEarnings
      }))
    });
  } catch (error: any) {
    console.error('Referral stats error:', error);
    res.status(500).json({ error: error.message });
  }
}));

// Update referral bonus rates (Admin)
router.put('/bonus-rates', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { tier, commissionRate, bonus } = req.body;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    // Update referral tier configuration
    await db.run(
      `INSERT OR REPLACE INTO referral_tier_config 
       (tier, commission_rate, bonus, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      [tier, commissionRate, bonus]
    );

    res.json({
      success: true,
      message: 'Bonus rates yangilandi'
    });
  } catch (error: any) {
    console.error('Update bonus rates error:', error);
    res.status(500).json({ error: error.message });
  }
}));

// Approve referral bonus payment (Admin)
router.post('/approve-payment/:earningId', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { earningId } = req.params;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    await db.run(
      `UPDATE referral_earnings 
       SET status = 'paid', paid_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [earningId]
    );

    res.json({
      success: true,
      message: 'Bonus to\'lovi tasdiqlandi'
    });
  } catch (error: any) {
    console.error('Approve payment error:', error);
    res.status(500).json({ error: error.message });
  }
}));

// Get all referral earnings (Admin)
router.get('/earnings', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { status } = req.query;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    let query = `
      SELECT 
        e.*,
        p.business_name as referrer_name,
        p2.business_name as referred_name
      FROM referral_earnings e
      LEFT JOIN partners p ON e.referrer_partner_id = p.id
      LEFT JOIN referrals r ON e.referral_id = r.id
      LEFT JOIN partners p2 ON r.referred_partner_id = p2.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY e.created_at DESC LIMIT 100';
    
    const earnings = await db.all(query, params);

    res.json({ earnings });
  } catch (error: any) {
    console.error('Get earnings error:', error);
    res.status(500).json({ error: error.message });
  }
}));

export default router;

