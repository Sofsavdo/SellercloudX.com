// Referral First Purchase Service
// Birinchi haridaga nisbatan referral bonus hisoblash

import { db } from '../db';
import { referrals, partners, referralFirstPurchases, subscriptions, invoices, payments } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { SAAS_PRICING_TIERS } from '../../SAAS_PRICING_CONFIG';

const REFERRAL_COMMISSION_RATE = 0.10; // 10%

interface FirstPurchaseData {
  referredPartnerId: string;
  subscriptionId: string;
  invoiceId: string;
  paymentId: string;
  tierId: string;
  subscriptionMonths: number; // 1, 3, 6, 12
}

/**
 * Birinchi haridani kuzatish va referral bonus hisoblash
 */
export async function processFirstPurchase(data: FirstPurchaseData): Promise<void> {
  try {
    console.log('[REFERRAL FIRST PURCHASE] Processing:', data);

    // 1. Referred partner'ning referral relationship'ini topish
    const referral = await db
      .select()
      .from(referrals)
      .where(and(
        eq(referrals.referredPartnerId, data.referredPartnerId),
        sql`${referrals.status} IN ('registered', 'invited')` // Faqat yangi referral'lar
      ))
      .limit(1);

    if (referral.length === 0) {
      console.log('[REFERRAL FIRST PURCHASE] No referral found for partner:', data.referredPartnerId);
      return; // Referral yo'q, bonus yo'q
    }

    const referralRecord = referral[0];

    // 2. Bu birinchi haridami tekshirish (oldin bonus berilganmi?)
    const existingPurchase = await db
      .select()
      .from(referralFirstPurchases)
      .where(eq(referralFirstPurchases.referredPartnerId, data.referredPartnerId))
      .limit(1);

    if (existingPurchase.length > 0) {
      console.log('[REFERRAL FIRST PURCHASE] Already processed first purchase for partner:', data.referredPartnerId);
      return; // Birinchi harida allaqachon qayta ishlangan
    }

    // 3. Tarif narxini olish
    const tier = SAAS_PRICING_TIERS[data.tierId as keyof typeof SAAS_PRICING_TIERS];
    if (!tier) {
      console.error('[REFERRAL FIRST PURCHASE] Invalid tier:', data.tierId);
      return;
    }

    const monthlyFee = tier.monthlyFeeUSD || 0;
    if (monthlyFee === 0) {
      console.log('[REFERRAL FIRST PURCHASE] Free tier, no commission');
      return; // Free tier uchun komissiya yo'q
    }

    // 4. Komissiya hisoblash
    // Komissiya = (Oylik to'lov × Oylar soni) × 10%
    const totalAmount = monthlyFee * data.subscriptionMonths;
    const commissionAmount = totalAmount * REFERRAL_COMMISSION_RATE;

    // 5. Birinchi haridani saqlash
    const firstPurchaseId = nanoid();
    await db.insert(referralFirstPurchases).values({
      id: firstPurchaseId,
      referralId: referralRecord.id,
      referrerPartnerId: referralRecord.referrerPartnerId,
      referredPartnerId: data.referredPartnerId,
      subscriptionId: data.subscriptionId,
      invoiceId: data.invoiceId,
      paymentId: data.paymentId,
      tierId: data.tierId,
      monthlyFee: monthlyFee,
      subscriptionMonths: data.subscriptionMonths,
      totalAmount: totalAmount,
      commissionRate: REFERRAL_COMMISSION_RATE,
      commissionAmount: commissionAmount,
      status: 'paid',
      paidAt: new Date(),
      createdAt: new Date()
    });

    // 6. Referral status'ni yangilash
    await db.update(referrals)
      .set({
        status: 'active',
        activatedAt: new Date(),
        bonusEarned: commissionAmount
      })
      .where(eq(referrals.id, referralRecord.id));

    // 7. Referral earnings'ga qo'shish
    const { referralEarnings } = await import('@shared/schema');
    await db.insert(referralEarnings).values({
      id: nanoid(),
      referralId: referralRecord.id,
      referrerPartnerId: referralRecord.referrerPartnerId,
      amount: commissionAmount,
      monthNumber: 1, // Birinchi oy
      platformProfit: totalAmount,
      bonusRate: REFERRAL_COMMISSION_RATE,
      tierMultiplier: 1.0, // Tier bonus yo'q
      status: 'pending',
      createdAt: new Date()
    });

    console.log('[REFERRAL FIRST PURCHASE] ✅ Success:', {
      referrerPartnerId: referralRecord.referrerPartnerId,
      referredPartnerId: data.referredPartnerId,
      commissionAmount,
      subscriptionMonths: data.subscriptionMonths
    });

  } catch (error: any) {
    console.error('[REFERRAL FIRST PURCHASE] ❌ Error:', error);
    throw error;
  }
}

/**
 * Birinchi haridani tekshirish (subscription yoki payment yaratilganda)
 */
export async function checkAndProcessFirstPurchase(
  partnerId: string,
  subscriptionId?: string,
  invoiceId?: string,
  paymentId?: string
): Promise<void> {
  try {
    // Subscription ma'lumotlarini olish
    if (subscriptionId) {
      const subscription = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, subscriptionId))
        .limit(1);

      if (subscription.length > 0) {
        const sub = subscription[0];
        
        // Subscription muddatini hisoblash
        const startDate = new Date(sub.startDate);
        const endDate = sub.endDate ? new Date(sub.endDate) : null;
        const subscriptionMonths = endDate 
          ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
          : 1;

        await processFirstPurchase({
          referredPartnerId: partnerId,
          subscriptionId: subscriptionId,
          invoiceId: invoiceId || '',
          paymentId: paymentId || '',
          tierId: sub.tierId,
          subscriptionMonths: subscriptionMonths || 1
        });
      }
    }
  } catch (error: any) {
    console.error('[REFERRAL FIRST PURCHASE] Check error:', error);
  }
}

