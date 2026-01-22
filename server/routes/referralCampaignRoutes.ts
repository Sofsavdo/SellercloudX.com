// @ts-nocheck
// Referral Campaign Routes - Konkurslar va aksiyalar boshqaruvi
import express, { Request, Response } from 'express';
import { asyncHandler } from '../errorHandler';
import { db } from '../db';
import { referralCampaigns, referralCampaignParticipants, partners, referralFirstPurchases, referrals } from '@shared/schema';
import { eq, and, sql, gte, lte } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const router = express.Router();

// Admin: Konkurs yaratish
router.post('/create', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }

  const {
    name,
    description,
    durationDays,
    targetReferrals,
    bonusAmount,
    minTier,
    minSubscriptionMonths
  } = req.body;

  if (!name || !durationDays || !targetReferrals || !bonusAmount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + durationDays);

  const campaignId = nanoid();
  await db.insert(referralCampaigns).values({
    id: campaignId,
    name,
    description: description || '',
    startDate: startDate,
    endDate: endDate,
    durationDays,
    targetReferrals,
    bonusAmount,
    minTier: minTier || 'basic',
    minSubscriptionMonths: minSubscriptionMonths || 1,
    status: 'active',
    participants: 0,
    winners: 0,
    createdAt: new Date(),
    createdBy: user.id
  });

  res.json({
    success: true,
    campaignId,
    message: 'Konkurs yaratildi'
  });
}));

// Admin: Barcha konkurslarni olish
router.get('/all', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }

  const campaigns = await db
    .select()
    .from(referralCampaigns)
    .orderBy(sql`${referralCampaigns.createdAt} DESC`);

  res.json({ campaigns });
}));

// Partner: Faol konkurslarni ko'rish
router.get('/active', asyncHandler(async (req: Request, res: Response) => {
  const now = new Date();
  
  const campaigns = await db
    .select()
    .from(referralCampaigns)
    .where(and(
      eq(referralCampaigns.status, 'active'),
      gte(referralCampaigns.endDate, now),
      lte(referralCampaigns.startDate, now)
    ))
    .orderBy(sql`${referralCampaigns.endDate} ASC`);

  // Har bir konkurs uchun qolgan vaqtni hisoblash
  const campaignsWithTimer = campaigns.map(campaign => {
    const endDate = new Date(campaign.endDate);
    const startDate = new Date(campaign.startDate);
    const now = new Date();
    const timeLeft = Math.max(0, endDate.getTime() - now.getTime());
    
    return {
      ...campaign,
      endDate: Math.floor(endDate.getTime() / 1000), // Convert to Unix timestamp for frontend
      startDate: Math.floor(startDate.getTime() / 1000),
      timeLeftMs: timeLeft,
      timeLeftDays: Math.floor(timeLeft / (1000 * 60 * 60 * 24)),
      timeLeftHours: Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      timeLeftMinutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
      timeLeftSeconds: Math.floor((timeLeft % (1000 * 60)) / 1000)
    };
  });

  res.json({ campaigns: campaignsWithTimer });
}));

// Partner: Konkursga qo'shilish
router.post('/join/:campaignId', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const partner = (req as any).partner;
  
  if (!user || !partner) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { campaignId } = req.params;

  // Konkursni tekshirish
  const campaign = await db
    .select()
    .from(referralCampaigns)
    .where(and(
      eq(referralCampaigns.id, campaignId),
      eq(referralCampaigns.status, 'active')
    ))
    .limit(1);

  if (campaign.length === 0) {
    return res.status(404).json({ message: 'Konkurs topilmadi yoki faol emas' });
  }

  // Allaqachon qo'shilganmi?
  const existing = await db
    .select()
    .from(referralCampaignParticipants)
    .where(and(
      eq(referralCampaignParticipants.campaignId, campaignId),
      eq(referralCampaignParticipants.referrerPartnerId, partner.id)
    ))
    .limit(1);

  if (existing.length > 0) {
    return res.json({
      success: true,
      message: 'Allaqachon qo\'shilgansiz',
      participant: existing[0]
    });
  }

  // Qo'shilish
  const participantId = nanoid();
  await db.insert(referralCampaignParticipants).values({
    id: participantId,
    campaignId,
    referrerPartnerId: partner.id,
    referralsCount: 0,
    bonusEarned: 0,
    status: 'participating',
    joinedAt: new Date()
  });

  // Konkurs participants sonini yangilash
  await db.update(referralCampaigns)
    .set({
      participants: sql`${referralCampaigns.participants} + 1`
    })
    .where(eq(referralCampaigns.id, campaignId));

  res.json({
    success: true,
    message: 'Konkursga qo\'shildingiz!',
    participantId
  });
}));

// Partner: O'zining konkurs statistikasini ko'rish
router.get('/my-stats/:campaignId', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const partner = (req as any).partner;
  
  if (!user || !partner) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { campaignId } = req.params;

  // Participant ma'lumotlarini olish
  const participant = await db
    .select()
    .from(referralCampaignParticipants)
    .where(and(
      eq(referralCampaignParticipants.campaignId, campaignId),
      eq(referralCampaignParticipants.referrerPartnerId, partner.id)
    ))
    .limit(1);

  if (participant.length === 0) {
    return res.status(404).json({ message: 'Siz bu konkursga qo\'shilmagansiz' });
  }

  // Konkurs ma'lumotlarini olish
  const campaign = await db
    .select()
    .from(referralCampaigns)
    .where(eq(referralCampaigns.id, campaignId))
    .limit(1);

  if (campaign.length === 0) {
    return res.status(404).json({ message: 'Konkurs topilmadi' });
  }

  // Konkurs muddati ichida qilingan referral'larni hisoblash
  const campaignData = campaign[0];
  const validReferrals = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(referralFirstPurchases)
    .where(and(
      eq(referralFirstPurchases.referrerPartnerId, partner.id),
      eq(referralFirstPurchases.status, 'paid'),
      gte(referralFirstPurchases.paidAt, campaignData.startDate),
      lte(referralFirstPurchases.paidAt, campaignData.endDate),
      sql`${referralFirstPurchases.tierId} >= ${campaignData.minTier}`,
      sql`${referralFirstPurchases.subscriptionMonths} >= ${campaignData.minSubscriptionMonths}`
    ));

  const referralsCount = Number(validReferrals[0]?.count) || 0;
  const progress = (referralsCount / campaignData.targetReferrals) * 100;
  const isWinner = referralsCount >= campaignData.targetReferrals;

  res.json({
    participant: participant[0],
    campaign: campaignData,
    stats: {
      referralsCount,
      targetReferrals: campaignData.targetReferrals,
      progress: Math.min(100, progress),
      remaining: Math.max(0, campaignData.targetReferrals - referralsCount),
      isWinner,
      bonusAmount: isWinner ? campaignData.bonusAmount : 0
    }
  });
}));

// Admin: Konkurs natijalarini yangilash (cron job uchun)
router.post('/update-results/:campaignId', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }

  const { campaignId } = req.params;

  const campaign = await db
    .select()
    .from(referralCampaigns)
    .where(eq(referralCampaigns.id, campaignId))
    .limit(1);

  if (campaign.length === 0) {
    return res.status(404).json({ message: 'Konkurs topilmadi' });
  }

  const campaignData = campaign[0];
  const now = new Date();

  // Konkurs tugaganmi?
  if (now > new Date(campaignData.endDate)) {
    // Barcha participant'larni tekshirish
    const participants = await db
      .select()
      .from(referralCampaignParticipants)
      .where(eq(referralCampaignParticipants.campaignId, campaignId));

    let winnersCount = 0;

    for (const participant of participants) {
      const validReferrals = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(referralFirstPurchases)
        .where(and(
          eq(referralFirstPurchases.referrerPartnerId, participant.referrerPartnerId),
          eq(referralFirstPurchases.status, 'paid'),
          gte(referralFirstPurchases.paidAt, campaignData.startDate),
          lte(referralFirstPurchases.paidAt, campaignData.endDate),
          sql`${referralFirstPurchases.tierId} >= ${campaignData.minTier}`,
          sql`${referralFirstPurchases.subscriptionMonths} >= ${campaignData.minSubscriptionMonths}`
        ));

      const referralsCount = Number(validReferrals[0]?.count) || 0;
      const isWinner = referralsCount >= campaignData.targetReferrals;

      if (isWinner) {
        winnersCount++;
        await db.update(referralCampaignParticipants)
          .set({
            referralsCount,
            bonusEarned: campaignData.bonusAmount,
            status: 'winner',
            completedAt: new Date()
          })
          .where(eq(referralCampaignParticipants.id, participant.id));
      }
    }

    // Konkurs status'ni yangilash
    await db.update(referralCampaigns)
      .set({
        status: 'completed',
        winners: winnersCount
      })
      .where(eq(referralCampaigns.id, campaignId));

    res.json({
      success: true,
      winnersCount,
      message: 'Konkurs natijalari yangilandi'
    });
  } else {
    res.json({
      success: true,
      message: 'Konkurs hali davom etmoqda'
    });
  }
}));

export default router;

