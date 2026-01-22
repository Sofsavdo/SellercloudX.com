/**
 * Biznes Verifikatsiya Tizimi
 * 
 * - INN (STIR) bo'yicha yagona akkaunt
 * - Bitta firma = Bitta akkaunt
 * - Dublikat oldini olish
 */

import { db } from '../db';
import { partners } from '@shared/schema';
import { eq, or, and } from 'drizzle-orm';

// INN (STIR) formati tekshirish
// O'zbekistonda: 9 raqam
export function validateINN(inn: string): { valid: boolean; error?: string } {
  if (!inn) {
    return { valid: false, error: 'INN (STIR) kiritilmagan' };
  }
  
  // Faqat raqamlar
  const cleanINN = inn.replace(/\D/g, '');
  
  // 9 raqam bo'lishi kerak
  if (cleanINN.length !== 9) {
    return { valid: false, error: 'INN 9 ta raqamdan iborat bo\'lishi kerak' };
  }
  
  // Birinchi raqam 0 bo'lmasligi kerak
  if (cleanINN.startsWith('0')) {
    return { valid: false, error: 'Noto\'g\'ri INN formati' };
  }
  
  return { valid: true };
}

// Telefon raqamini normalizatsiya qilish
export function normalizePhone(phone: string): string {
  // Faqat raqamlarni olish
  const digits = phone.replace(/\D/g, '');
  
  // +998 bilan boshlash
  if (digits.startsWith('998')) {
    return '+' + digits;
  } else if (digits.startsWith('9') && digits.length === 9) {
    return '+998' + digits;
  } else if (digits.length === 9) {
    return '+998' + digits;
  }
  
  return '+998' + digits.slice(-9);
}

// Biznes mavjudligini tekshirish
export async function checkBusinessExists(
  inn: string,
  phone?: string,
  email?: string
): Promise<{ exists: boolean; reason?: string; existingPartnerId?: string }> {
  
  try {
    const cleanINN = inn.replace(/\D/g, '');
    
    // INN bo'yicha tekshirish
    const existingByINN = await db.select()
      .from(partners)
      .where(eq(partners.inn, cleanINN));
    
    if (existingByINN.length > 0) {
      return {
        exists: true,
        reason: `Bu INN (${cleanINN}) bilan akkaunt allaqachon mavjud. Agar bu sizning akkkauntingiz bo'lsa, tizimga kiring.`,
        existingPartnerId: existingByINN[0].id
      };
    }
    
    // Telefon bo'yicha ham tekshirish (qo'shimcha himoya)
    if (phone) {
      const normalizedPhone = normalizePhone(phone);
      const existingByPhone = await db.select()
        .from(partners)
        .where(eq(partners.phone, normalizedPhone));
      
      if (existingByPhone.length > 0) {
        // Agar telefon bor, lekin INN boshqa bo'lsa - bu boshqa firma bo'lishi mumkin
        // Faqat ogohlantirish
        console.log(`⚠️ Telefon ${normalizedPhone} boshqa akkauntda mavjud`);
      }
    }
    
    return { exists: false };
    
  } catch (error) {
    console.error('Error checking business exists:', error);
    return { exists: false };
  }
}

// Marketplace akkauntni firma bilan bog'lash
export async function linkMarketplaceAccount(
  partnerId: string,
  marketplace: 'yandex' | 'uzum' | 'ozon' | 'wildberries',
  credentials: {
    apiKey?: string;
    businessId?: string;
    shopId?: string;
    shopName?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  
  try {
    const [partner] = await db.select().from(partners).where(eq(partners.id, partnerId));
    
    if (!partner) {
      return { success: false, error: 'Hamkor topilmadi' };
    }
    
    // Mavjud marketplace integratsiyalarini olish
    const existingIntegrations = partner.marketplaceIntegrations 
      ? JSON.parse(partner.marketplaceIntegrations as string)
      : {};
    
    // Yangi marketplace qo'shish
    existingIntegrations[marketplace] = {
      ...credentials,
      linkedAt: new Date().toISOString(),
      verified: false
    };
    
    // Yangilash
    await db.update(partners)
      .set({
        marketplaceIntegrations: JSON.stringify(existingIntegrations),
        updatedAt: new Date()
      })
      .where(eq(partners.id, partnerId));
    
    return { success: true };
    
  } catch (error) {
    console.error('Error linking marketplace account:', error);
    return { success: false, error: String(error) };
  }
}

// Biznes limitlarini tekshirish (oy bo'yicha)
export async function checkMonthlyUsageByINN(inn: string): Promise<{
  totalCards: number;
  totalProducts: number;
  accounts: number;
}> {
  
  try {
    const cleanINN = inn.replace(/\D/g, '');
    
    // Bu INN bilan bog'liq barcha akkauntlarni topish
    const accounts = await db.select()
      .from(partners)
      .where(eq(partners.inn, cleanINN));
    
    let totalCards = 0;
    let totalProducts = 0;
    
    for (const account of accounts) {
      totalCards += account.aiCardsThisMonth || 0;
      totalProducts += account.productsCount || 0;
    }
    
    return {
      totalCards,
      totalProducts,
      accounts: accounts.length
    };
    
  } catch (error) {
    console.error('Error checking monthly usage by INN:', error);
    return { totalCards: 0, totalProducts: 0, accounts: 0 };
  }
}

// Biznes ma'lumotlarini yaratish
export interface BusinessInfo {
  inn: string;
  businessName: string;
  businessType: 'yatt' | 'ooo' | 'individual';
  ownerName: string;
  phone: string;
  email: string;
  address?: string;
}

// Biznesni ro'yxatdan o'tkazish
export async function registerBusiness(
  businessInfo: BusinessInfo
): Promise<{ success: boolean; error?: string; partnerId?: string }> {
  
  // INN validatsiya
  const innValidation = validateINN(businessInfo.inn);
  if (!innValidation.valid) {
    return { success: false, error: innValidation.error };
  }
  
  // Mavjudligini tekshirish
  const existsCheck = await checkBusinessExists(
    businessInfo.inn,
    businessInfo.phone,
    businessInfo.email
  );
  
  if (existsCheck.exists) {
    return { success: false, error: existsCheck.reason };
  }
  
  // Hammasi yaxshi - ro'yxatdan o'tkazish mumkin
  return { success: true };
}

export default {
  validateINN,
  normalizePhone,
  checkBusinessExists,
  linkMarketplaceAccount,
  checkMonthlyUsageByINN,
  registerBusiness
};
