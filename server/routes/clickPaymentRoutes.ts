/**
 * Click Payment Routes
 * O'zbekiston Click to'lov tizimi API endpointlari
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../errorHandler';
import { storage } from '../storage';
import { 
  createClickPaymentLink, 
  handleClickPrepare, 
  handleClickComplete,
  checkPaymentStatus,
  TIER_PRICES 
} from '../services/payment/clickPayment';

const router = Router();

/**
 * GET /api/click/tiers
 * Barcha tariflar va narxlarini olish
 */
router.get('/tiers', asyncHandler(async (req: Request, res: Response) => {
  const tiers = Object.entries(TIER_PRICES).map(([id, tier]) => ({
    id,
    name: tier.name,
    monthlyPrice: tier.monthly,
    annualPrice: tier.annual,
    monthlySavings: Math.round((tier.monthly * 12 - tier.annual) / 1000) * 1000, // Yillik chegirma
    currency: 'UZS',
  }));
  
  res.json({ success: true, tiers });
}));

/**
 * POST /api/click/create-payment
 * To'lov havolasini yaratish
 */
router.post('/create-payment', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ success: false, error: 'Avtorizatsiya kerak' });
  }
  
  const partner = await storage.getPartnerByUserId(user.id);
  if (!partner) {
    return res.status(404).json({ success: false, error: 'Hamkor topilmadi' });
  }
  
  const { tier, billingPeriod = 'monthly', returnUrl } = req.body;
  
  if (!tier) {
    return res.status(400).json({ success: false, error: 'Tarif tanlanmagan' });
  }
  
  if (!TIER_PRICES[tier]) {
    return res.status(400).json({ success: false, error: 'Noto\'g\'ri tarif' });
  }
  
  if (TIER_PRICES[tier].monthly === 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'Bepul tarif uchun to\'lov kerak emas. Avtomatik aktivatsiya qilingan.' 
    });
  }
  
  const result = await createClickPaymentLink({
    partnerId: partner.id,
    tier,
    billingPeriod: billingPeriod as 'monthly' | 'annual',
    returnUrl,
  });
  
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error });
  }
  
  res.json({
    success: true,
    paymentUrl: result.paymentUrl,
    transactionId: result.transactionId,
    tier,
    amount: billingPeriod === 'annual' ? TIER_PRICES[tier].annual : TIER_PRICES[tier].monthly,
    currency: 'UZS',
    billingPeriod,
  });
}));

/**
 * GET /api/click/payment-status
 * To'lov holatini tekshirish
 */
router.get('/payment-status', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ success: false, error: 'Avtorizatsiya kerak' });
  }
  
  const partner = await storage.getPartnerByUserId(user.id);
  if (!partner) {
    return res.status(404).json({ success: false, error: 'Hamkor topilmadi' });
  }
  
  const status = await checkPaymentStatus(partner.id);
  
  res.json({
    success: true,
    ...status,
    currentTier: partner.pricingTier,
    isActive: partner.isActive,
  });
}));

/**
 * POST /api/click/webhook/prepare
 * Click Prepare webhook - To'lovni tayyorlash
 */
router.post('/webhook/prepare', asyncHandler(async (req: Request, res: Response) => {
  console.log('📥 Click Prepare webhook:', req.body);
  
  const {
    click_trans_id,
    service_id,
    click_paydoc_id,
    merchant_trans_id,
    amount,
    action,
    sign_time,
    sign_string,
  } = req.body;
  
  const result = await handleClickPrepare({
    clickTransId: click_trans_id,
    serviceId: service_id,
    clickPaydocId: click_paydoc_id,
    merchantTransId: merchant_trans_id,
    amount,
    action,
    signTime: sign_time,
    signString: sign_string,
  });
  
  console.log('📤 Click Prepare javob:', result);
  res.json(result);
}));

/**
 * POST /api/click/webhook/complete
 * Click Complete webhook - To'lov yakunlangan
 */
router.post('/webhook/complete', asyncHandler(async (req: Request, res: Response) => {
  console.log('📥 Click Complete webhook:', req.body);
  
  const {
    click_trans_id,
    service_id,
    click_paydoc_id,
    merchant_trans_id,
    merchant_prepare_id,
    amount,
    action,
    error,
    error_note,
    sign_time,
    sign_string,
  } = req.body;
  
  const result = await handleClickComplete({
    clickTransId: click_trans_id,
    serviceId: service_id,
    clickPaydocId: click_paydoc_id,
    merchantTransId: merchant_trans_id,
    merchantPrepareId: merchant_prepare_id,
    amount,
    action,
    error,
    errorNote: error_note,
    signTime: sign_time,
    signString: sign_string,
  });
  
  console.log('📤 Click Complete javob:', result);
  res.json(result);
}));

/**
 * POST /api/click/simulate-payment (FAQAT TEST UCHUN)
 * Test muhitida to'lovni simulatsiya qilish
 */
router.post('/simulate-payment', asyncHandler(async (req: Request, res: Response) => {
  // Faqat development muhitida ishlaydi
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      success: false, 
      error: 'Bu endpoint faqat test muhitida ishlaydi' 
    });
  }
  
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ success: false, error: 'Avtorizatsiya kerak' });
  }
  
  const partner = await storage.getPartnerByUserId(user.id);
  if (!partner) {
    return res.status(404).json({ success: false, error: 'Hamkor topilmadi' });
  }
  
  const { tier, billingPeriod = 'monthly' } = req.body;
  
  if (!tier || !TIER_PRICES[tier]) {
    return res.status(400).json({ success: false, error: 'Noto\'g\'ri tarif' });
  }
  
  const amount = billingPeriod === 'annual' ? TIER_PRICES[tier].annual : TIER_PRICES[tier].monthly;
  
  // Import functions
  const { activateAfterPayment } = await import('../services/autoActivation');
  const { processReferralBonusOnPayment } = await import('../services/referralBonus');
  const { db } = await import('../db');
  const { partners } = await import('@shared/schema');
  const { eq } = await import('drizzle-orm');
  
  // Simulate successful payment
  await activateAfterPayment(partner.id, tier, amount);
  
  // Update partner
  await db.update(partners).set({
    pricingTier: tier,
    billingPeriod,
    approved: true,
    isActive: true,
    aiEnabled: true,
    lastPaymentId: `SIM_${Date.now()}`,
    lastPaymentAmount: amount,
    lastPaymentDate: new Date(),
    lastPaymentStatus: 'completed',
    updatedAt: new Date(),
  }).where(eq(partners.id, partner.id));
  
  // Process referral bonus
  await processReferralBonusOnPayment(partner.id, amount, tier);
  
  res.json({
    success: true,
    message: 'To\'lov simulatsiya qilindi (FAQAT TEST)',
    newTier: tier,
    amount,
    currency: 'UZS',
  });
}));

export default router;
