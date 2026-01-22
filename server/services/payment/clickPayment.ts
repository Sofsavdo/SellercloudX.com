/**
 * Click Payment Gateway Integration
 * O'zbekiston Click to'lov tizimi
 * 
 * @description
 * - Subscription to'lovlari uchun
 * - Webhook orqali avtomatik tier upgrade
 * - UZS valyutasi
 */

import crypto from 'crypto';
import { db } from '../../db';
import { partners } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { activateAfterPayment } from '../autoActivation';
import { processReferralBonusOnPayment } from '../referralBonus';

// Click API konfiguratsiyasi
const CLICK_CONFIG = {
  serviceId: process.env.CLICK_SERVICE_ID || '',
  merchantId: process.env.CLICK_MERCHANT_ID || '',
  merchantUserId: process.env.CLICK_MERCHANT_USER_ID || '',
  secretKey: process.env.CLICK_SECRET_KEY || '',
  webhookSecret: process.env.CLICK_WEBHOOK_SECRET || '',
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://my.click.uz/services/pay' 
    : 'https://my.click.uz/services/pay', // Test uchun ham bir xil
};

// Tarif narxlari (UZS)
export const TIER_PRICES: Record<string, { monthly: number; annual: number; name: string }> = {
  'free_starter': { monthly: 0, annual: 0, name: 'Free Starter' },
  'starter_pro': { monthly: 828000, annual: 7948800, name: 'Starter Pro' }, // 20% chegirma annual
  'professional_plus': { monthly: 4188000, annual: 40204800, name: 'Professional Plus' },
  'enterprise_elite': { monthly: 10788000, annual: 103564800, name: 'Enterprise Elite' },
};

// To'lov holatlari
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// To'lov yozuvi interfeysi
export interface PaymentRecord {
  id: string;
  partnerId: string;
  tier: string;
  amount: number;
  currency: string;
  billingPeriod: 'monthly' | 'annual';
  status: PaymentStatus;
  clickTransactionId?: string;
  merchantTransactionId: string;
  createdAt: Date;
  completedAt?: Date;
  webhookVerified: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Click to'lov havolasini yaratish
 */
export async function createClickPaymentLink(params: {
  partnerId: string;
  tier: string;
  billingPeriod: 'monthly' | 'annual';
  returnUrl?: string;
}): Promise<{ success: boolean; paymentUrl?: string; transactionId?: string; error?: string }> {
  try {
    const { partnerId, tier, billingPeriod, returnUrl } = params;
    
    // Tarif narxini olish
    const tierPrice = TIER_PRICES[tier];
    if (!tierPrice) {
      return { success: false, error: 'Noto\'g\'ri tarif' };
    }
    
    // Narx hisoblash
    const amount = billingPeriod === 'annual' ? tierPrice.annual : tierPrice.monthly;
    
    if (amount === 0) {
      return { success: false, error: 'Bepul tarif uchun to\'lov kerak emas' };
    }
    
    // Unikal transaction ID yaratish
    const merchantTransactionId = `SCX_${partnerId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    // Click URL parametrlari
    const clickParams = new URLSearchParams({
      service_id: CLICK_CONFIG.serviceId,
      merchant_id: CLICK_CONFIG.merchantId,
      amount: amount.toString(),
      transaction_param: merchantTransactionId,
      return_url: returnUrl || `${process.env.FRONTEND_URL || 'https://sellercloudx.com'}/payment/success`,
      card_type: 'uzcard,humo', // Uzcard va Humo kartalarini qo'llab-quvvatlash
    });
    
    // Click to'lov URL
    const paymentUrl = `${CLICK_CONFIG.baseUrl}?${clickParams.toString()}`;
    
    // To'lov yozuvini saqlash (database ga)
    // Hozircha partners jadvalida payment ma'lumotlarini saqlaymiz
    await db.update(partners).set({
      pendingPaymentId: merchantTransactionId,
      pendingPaymentTier: tier,
      pendingPaymentAmount: amount,
      pendingPaymentBillingPeriod: billingPeriod,
      pendingPaymentCreatedAt: new Date(),
    }).where(eq(partners.id, partnerId));
    
    console.log(`✅ Click to'lov havolasi yaratildi: ${merchantTransactionId}`);
    
    return {
      success: true,
      paymentUrl,
      transactionId: merchantTransactionId,
    };
    
  } catch (error: any) {
    console.error('❌ Click to\'lov yaratishda xato:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Click Webhook imzosini tekshirish
 */
export function verifyClickWebhookSignature(params: {
  clickTransId: string;
  serviceId: string;
  merchantTransId: string;
  amount: string;
  action: string;
  signTime: string;
  signString: string;
}): boolean {
  try {
    const { clickTransId, serviceId, merchantTransId, amount, action, signTime, signString } = params;
    
    // Click imzo algoritmi: MD5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + amount + action + sign_time)
    const dataToSign = `${clickTransId}${serviceId}${CLICK_CONFIG.secretKey}${merchantTransId}${amount}${action}${signTime}`;
    const expectedSignature = crypto.createHash('md5').update(dataToSign).digest('hex');
    
    return signString === expectedSignature;
    
  } catch (error) {
    console.error('❌ Webhook imzo tekshirishda xato:', error);
    return false;
  }
}

/**
 * Click Prepare webhook handler
 * Click birinchi so'rov - to'lov tayyorlash
 */
export async function handleClickPrepare(params: {
  clickTransId: string;
  serviceId: string;
  clickPaydocId: string;
  merchantTransId: string;
  amount: string;
  action: string;
  signTime: string;
  signString: string;
}): Promise<{ error: number; error_note: string; click_trans_id: string; merchant_trans_id: string; merchant_prepare_id?: string }> {
  const { clickTransId, serviceId, merchantTransId, amount, signString, signTime, action } = params;
  
  // Imzoni tekshirish
  const isValid = verifyClickWebhookSignature({
    clickTransId,
    serviceId,
    merchantTransId,
    amount,
    action,
    signTime,
    signString,
  });
  
  if (!isValid) {
    console.error('❌ Click Prepare: Noto\'g\'ri imzo');
    return {
      error: -1,
      error_note: 'SIGN CHECK FAILED',
      click_trans_id: clickTransId,
      merchant_trans_id: merchantTransId,
    };
  }
  
  // Transaction mavjudligini tekshirish
  const [partner] = await db.select().from(partners).where(eq(partners.pendingPaymentId, merchantTransId));
  
  if (!partner) {
    console.error('❌ Click Prepare: Transaction topilmadi:', merchantTransId);
    return {
      error: -5,
      error_note: 'Transaction not found',
      click_trans_id: clickTransId,
      merchant_trans_id: merchantTransId,
    };
  }
  
  // Summani tekshirish
  const expectedAmount = partner.pendingPaymentAmount || 0;
  if (Math.abs(parseFloat(amount) - expectedAmount) > 1) {
    console.error('❌ Click Prepare: Summa mos kelmayapti:', amount, 'vs', expectedAmount);
    return {
      error: -2,
      error_note: 'Incorrect amount',
      click_trans_id: clickTransId,
      merchant_trans_id: merchantTransId,
    };
  }
  
  console.log(`✅ Click Prepare muvaffaqiyatli: ${merchantTransId}`);
  
  return {
    error: 0,
    error_note: 'Success',
    click_trans_id: clickTransId,
    merchant_trans_id: merchantTransId,
    merchant_prepare_id: partner.id,
  };
}

/**
 * Click Complete webhook handler
 * To'lov muvaffaqiyatli yakunlanganda
 */
export async function handleClickComplete(params: {
  clickTransId: string;
  serviceId: string;
  clickPaydocId: string;
  merchantTransId: string;
  merchantPrepareId: string;
  amount: string;
  action: string;
  error: string;
  errorNote: string;
  signTime: string;
  signString: string;
}): Promise<{ error: number; error_note: string; click_trans_id: string; merchant_trans_id: string; merchant_confirm_id?: string }> {
  const { clickTransId, serviceId, merchantTransId, merchantPrepareId, amount, signString, signTime, action, error: clickError, errorNote } = params;
  
  // Imzoni tekshirish
  const isValid = verifyClickWebhookSignature({
    clickTransId,
    serviceId,
    merchantTransId,
    amount,
    action,
    signTime,
    signString,
  });
  
  if (!isValid) {
    console.error('❌ Click Complete: Noto\'g\'ri imzo');
    return {
      error: -1,
      error_note: 'SIGN CHECK FAILED',
      click_trans_id: clickTransId,
      merchant_trans_id: merchantTransId,
    };
  }
  
  // Click xatolik qaytarganmi?
  if (clickError !== '0') {
    console.error('❌ Click xatolik qaytardi:', clickError, errorNote);
    return {
      error: parseInt(clickError),
      error_note: errorNote,
      click_trans_id: clickTransId,
      merchant_trans_id: merchantTransId,
    };
  }
  
  // Partner ma'lumotlarini olish
  const [partner] = await db.select().from(partners).where(eq(partners.id, merchantPrepareId));
  
  if (!partner) {
    console.error('❌ Click Complete: Partner topilmadi:', merchantPrepareId);
    return {
      error: -5,
      error_note: 'User not found',
      click_trans_id: clickTransId,
      merchant_trans_id: merchantTransId,
    };
  }
  
  // Transaction allaqachon qayta ishlangan bo'lsa
  if (partner.lastPaymentId === merchantTransId && partner.lastPaymentStatus === 'completed') {
    console.log('⚠️ Transaction allaqachon qayta ishlangan:', merchantTransId);
    return {
      error: 0,
      error_note: 'Already processed',
      click_trans_id: clickTransId,
      merchant_trans_id: merchantTransId,
      merchant_confirm_id: merchantPrepareId,
    };
  }
  
  // ========== TO'LOV MUVAFFAQIYATLI - TIER UPGRADE ==========
  const newTier = partner.pendingPaymentTier || 'starter_pro';
  const billingPeriod = partner.pendingPaymentBillingPeriod || 'monthly';
  
  try {
    // 1. Partner tarifini yangilash
    await activateAfterPayment(partner.id, newTier, parseFloat(amount));
    
    // 2. To'lov ma'lumotlarini saqlash
    await db.update(partners).set({
      pricingTier: newTier,
      billingPeriod: billingPeriod,
      approved: true,
      isActive: true,
      aiEnabled: true,
      lastPaymentId: merchantTransId,
      lastPaymentAmount: parseFloat(amount),
      lastPaymentDate: new Date(),
      lastPaymentStatus: 'completed',
      clickTransactionId: clickTransId,
      // Pending ma'lumotlarini tozalash
      pendingPaymentId: null,
      pendingPaymentTier: null,
      pendingPaymentAmount: null,
      pendingPaymentBillingPeriod: null,
      pendingPaymentCreatedAt: null,
      updatedAt: new Date(),
    }).where(eq(partners.id, partner.id));
    
    // 3. Referal bonus hisoblash (agar referrer bo'lsa)
    await processReferralBonusOnPayment(partner.id, parseFloat(amount), newTier);
    
    console.log(`🎉 To'lov muvaffaqiyatli! Partner ${partner.id} endi ${newTier} tarifida`);
    
    return {
      error: 0,
      error_note: 'Success',
      click_trans_id: clickTransId,
      merchant_trans_id: merchantTransId,
      merchant_confirm_id: merchantPrepareId,
    };
    
  } catch (error: any) {
    console.error('❌ Tier upgrade xatolik:', error);
    return {
      error: -9,
      error_note: 'Internal server error',
      click_trans_id: clickTransId,
      merchant_trans_id: merchantTransId,
    };
  }
}

/**
 * To'lov holatini tekshirish
 */
export async function checkPaymentStatus(partnerId: string): Promise<{
  hasPendingPayment: boolean;
  lastPayment?: {
    transactionId: string;
    amount: number;
    status: string;
    date: Date;
    tier: string;
  };
}> {
  const [partner] = await db.select().from(partners).where(eq(partners.id, partnerId));
  
  if (!partner) {
    return { hasPendingPayment: false };
  }
  
  const hasPendingPayment = !!partner.pendingPaymentId;
  
  return {
    hasPendingPayment,
    lastPayment: partner.lastPaymentId ? {
      transactionId: partner.lastPaymentId,
      amount: partner.lastPaymentAmount || 0,
      status: partner.lastPaymentStatus || 'unknown',
      date: partner.lastPaymentDate || new Date(),
      tier: partner.pricingTier || 'free_starter',
    } : undefined,
  };
}

export default {
  createClickPaymentLink,
  verifyClickWebhookSignature,
  handleClickPrepare,
  handleClickComplete,
  checkPaymentStatus,
  TIER_PRICES,
};
