/**
 * Avtomatik Aktivatsiya Tizimi
 * 
 * - Free Starter: Darhol aktiv
 * - Basic/Starter Pro: To'lovdan keyin avtomatik
 * - Professional: Admin tasdiqlash kerak
 */

import { db, getDbType } from '../db';
import { partners, subscriptions, auditLogs } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Universal timestamp formatter
function formatTimestamp(): any {
  const dbType = getDbType();
  return dbType === 'sqlite' ? Math.floor(Date.now() / 1000) : new Date();
}

// Tariflar bo'yicha aktivatsiya qoidalari
export const ACTIVATION_RULES = {
  free_starter: {
    autoActivate: true,
    requirePayment: false,
    requireAdminApproval: false
  },
  basic: {
    autoActivate: true, // To'lovdan keyin
    requirePayment: true,
    requireAdminApproval: false
  },
  starter_pro: {
    autoActivate: true, // To'lovdan keyin
    requirePayment: true,
    requireAdminApproval: false
  },
  professional: {
    autoActivate: false,
    requirePayment: true,
    requireAdminApproval: true // Shartnoma kerak
  }
};

// Yangi hamkorni aktivatsiya qilish
export async function activateNewPartner(partnerId: string, tier: string = 'free_starter') {
  try {
    const rules = ACTIVATION_RULES[tier as keyof typeof ACTIVATION_RULES] || ACTIVATION_RULES.free_starter;
    
    // Free Starter - darhol aktivatsiya
    if (tier === 'free_starter' || !rules.requirePayment) {
      await db.update(partners)
        .set({
          approved: true,
          isActive: true,
          pricingTier: tier,
          aiEnabled: true, // Free da ham AI bor (10 ta limit bilan)
          activatedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(partners.id, partnerId));
      
      // Audit log
      await db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        userId: partnerId,
        action: 'PARTNER_AUTO_ACTIVATED',
        entityType: 'partner',
        entityId: partnerId,
        payload: JSON.stringify({ tier, method: 'auto' }),
        createdAt: formatTimestamp()
      });
      
      return { success: true, activated: true, tier };
    }
    
    // To'lov kerak bo'lgan tariflar - kutish holatida
    await db.update(partners)
      .set({
        approved: false,
        isActive: false,
        pricingTier: tier,
        aiEnabled: false,
        updatedAt: new Date()
      })
      .where(eq(partners.id, partnerId));
    
    return { 
      success: true, 
      activated: false, 
      tier,
      message: 'To\'lov kutilmoqda'
    };
    
  } catch (error) {
    console.error('Error activating partner:', error);
    return { success: false, error: String(error) };
  }
}

// To'lovdan keyin aktivatsiya
export async function activateAfterPayment(partnerId: string, paymentId: string, tier: string) {
  try {
    const rules = ACTIVATION_RULES[tier as keyof typeof ACTIVATION_RULES];
    
    if (!rules) {
      return { success: false, error: 'Noto\'g\'ri tarif' };
    }
    
    // Professional - admin tasdiqlashi kerak
    if (rules.requireAdminApproval) {
      await db.update(partners)
        .set({
          approved: false, // Admin tasdiqlashi kerak
          isActive: false,
          pricingTier: tier,
          paymentVerified: true,
          updatedAt: new Date()
        })
        .where(eq(partners.id, partnerId));
      
      // Audit log
      await db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        userId: partnerId,
        action: 'PARTNER_PAYMENT_VERIFIED',
        entityType: 'partner',
        entityId: partnerId,
        payload: JSON.stringify({ tier, paymentId, awaitingAdminApproval: true }),
        createdAt: formatTimestamp()
      });
      
      return {
        success: true,
        activated: false,
        tier,
        message: 'To\'lov qabul qilindi. Admin tasdiqlashi kutilmoqda.'
      };
    }
    
    // Boshqa tariflar - avtomatik aktivatsiya
    await db.update(partners)
      .set({
        approved: true,
        isActive: true,
        pricingTier: tier,
        aiEnabled: true,
        paymentVerified: true,
        activatedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(partners.id, partnerId));
    
    // Subscription yaratish
    const subscriptionId = crypto.randomUUID();
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1); // 1 oylik
    
    await db.insert(subscriptions).values({
      id: subscriptionId,
      partnerId,
      tierId: tier,
      status: 'active',
      startDate: now,
      endDate,
      autoRenew: true,
      paymentMethod: 'online',
      createdAt: now,
      updatedAt: now
    });
    
    // Audit log
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId: partnerId,
      action: 'PARTNER_ACTIVATED_AFTER_PAYMENT',
      entityType: 'partner',
      entityId: partnerId,
      payload: JSON.stringify({ tier, paymentId, subscriptionId }),
      createdAt: formatTimestamp()
    });
    
    return {
      success: true,
      activated: true,
      tier,
      subscriptionId,
      message: 'Muvaffaqiyatli aktivatsiya qilindi!'
    };
    
  } catch (error) {
    console.error('Error activating after payment:', error);
    return { success: false, error: String(error) };
  }
}

// Subscription tugashi - avtomatik downgrade
export async function handleSubscriptionExpiry(partnerId: string) {
  try {
    // Free Starter ga tushirish
    await db.update(partners)
      .set({
        pricingTier: 'free_starter',
        isActive: true, // Free da ham aktiv
        aiEnabled: true, // Free da ham AI bor (limit bilan)
        updatedAt: new Date()
      })
      .where(eq(partners.id, partnerId));
    
    // Audit log
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId: partnerId,
      action: 'SUBSCRIPTION_EXPIRED_DOWNGRADE',
      entityType: 'partner',
      entityId: partnerId,
      payload: JSON.stringify({ newTier: 'free_starter', reason: 'subscription_expired' }),
      createdAt: formatTimestamp()
    });
    
    return { success: true, newTier: 'free_starter' };
    
  } catch (error) {
    console.error('Error handling subscription expiry:', error);
    return { success: false, error: String(error) };
  }
}

// Admin tasdiqlash (faqat Professional uchun)
export async function adminApprovePartner(partnerId: string, adminId: string) {
  try {
    const [partner] = await db.select().from(partners).where(eq(partners.id, partnerId));
    
    if (!partner) {
      return { success: false, error: 'Hamkor topilmadi' };
    }
    
    // Faqat Professional va to'lov qilingan
    if (partner.pricingTier !== 'professional') {
      return { success: false, error: 'Faqat Professional tarif admin tasdiqlashini talab qiladi' };
    }
    
    if (!partner.paymentVerified) {
      return { success: false, error: 'To\'lov hali tasdiqlanmagan' };
    }
    
    await db.update(partners)
      .set({
        approved: true,
        isActive: true,
        aiEnabled: true,
        approvedBy: adminId,
        activatedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(partners.id, partnerId));
    
    // Audit log
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId: adminId,
      action: 'ADMIN_APPROVED_PARTNER',
      entityType: 'partner',
      entityId: partnerId,
      payload: JSON.stringify({ tier: 'professional', approvedBy: adminId }),
      createdAt: formatTimestamp()
    });
    
    return { success: true, message: 'Hamkor muvaffaqiyatli tasdiqlandi' };
    
  } catch (error) {
    console.error('Error admin approving partner:', error);
    return { success: false, error: String(error) };
  }
}

export default {
  ACTIVATION_RULES,
  activateNewPartner,
  activateAfterPayment,
  handleSubscriptionExpiry,
  adminApprovePartner
};
