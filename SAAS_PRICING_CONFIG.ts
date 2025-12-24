// SAAS PRICING CONFIGURATION
// Updated: December 2024
// Version: 5.0.0 - Pure SaaS Model (No Fulfillment)

export const SAAS_PRICING_TIERS = {
  free_starter: {
    id: 'free_starter',
    name: 'Free Starter',
    nameUz: 'Free Starter',
    nameRu: 'Free Starter',
    nameEn: 'Free Starter',
    
    // Pricing
    monthlyFee: 0, // $0
    monthlyFeeUSD: 0,
    commissionRate: 0.02, // 2%
    
    // Limits
    limits: {
      sku: 10,
      monthlySalesLimit: 15000000, // 15M so'm
      marketplaces: 1, // Yandex Market only
      aiCards: 10,
      trendHunter: 10,
      languages: 3,
    },
    
    // Features
    features: [
      '10 ta mahsulot',
      '1 marketplace (Yandex Market)',
      'AI kartochka (10 ta)',
      'Trend Hunter (10 marta/oy)',
      '3 tilda tarjima',
      'Asosiy savdo statistikasi',
      'Ombor monitoring',
      'Admin chat',
      'Email yordam'
    ],
    
    excluded: [
      'Sof foyda tahlili',
      'Narx monitoring',
      'SEO optimizatsiya',
      'Ko\'p marketplace',
      'Telegram xabarnomalar'
    ],
    
    description: 'Sinab ko\'rish uchun',
    popular: false,
    color: 'green',
    badge: 'BEPUL'
  },
  
  basic: {
    id: 'basic',
    name: 'Basic',
    nameUz: 'Basic',
    nameRu: 'Basic',
    nameEn: 'Basic',
    
    // Pricing
    monthlyFee: 828000, // $69 * 12000
    monthlyFeeUSD: 69,
    commissionRate: 0.018, // 1.8%
    
    // Limits
    limits: {
      sku: 69,
      monthlySalesLimit: 69000000, // 69M so'm
      marketplaces: 1, // Yandex Market only
      aiCards: 69,
      trendHunter: 69,
      languages: 3,
    },
    
    // Features
    features: [
      '69 ta mahsulot',
      '1 marketplace (Yandex Market)',
      'AI kartochka (69 ta)',
      'Trend Hunter (69 marta/oy)',
      '3 tilda tarjima',
      '✨ Sof foyda tahlili',
      'To\'liq savdo statistikasi',
      'Ombor boshqaruvi',
      'Telegram xabarnomalar',
      'Email yordam'
    ],
    
    excluded: [
      'Ko\'p marketplace',
      'SEO optimizatsiya',
      'Narx monitoring',
      'Ommaviy operatsiyalar'
    ],
    
    description: 'Kichik biznes',
    popular: false,
    color: 'orange',
    badge: 'Arzon'
  },
  
  starter: {
    id: 'starter',
    name: 'Starter',
    nameUz: 'Starter',
    nameRu: 'Starter',
    nameEn: 'Starter',
    
    // Pricing
    monthlyFee: 4188000, // $349 * 12000
    monthlyFeeUSD: 349,
    commissionRate: 0.015, // 1.5%
    
    // Limits
    limits: {
      sku: 400,
      monthlySalesLimit: 200000000, // 200M so'm
      marketplaces: 4, // Uzum, Yandex, Wildberries, Ozon
      aiCards: -1, // unlimited
      trendHunter: -1, // unlimited
      languages: 3,
    },
    
    // Features
    features: [
      '400 ta mahsulot (100/marketplace)',
      '4 marketplace (Uzum, Yandex, Wildberries, Ozon)',
      'Cheksiz AI kartochka',
      'Cheksiz Trend Hunter',
      '3 tilda tarjima',
      'SEO optimizatsiya',
      'Narx monitoring',
      'Sof foyda tahlili',
      'To\'liq savdo tahlili',
      'Ombor boshqaruvi',
      'Ommaviy operatsiyalar',
      'Telegram xabarnomalar',
      '24/7 monitoring',
      'Email yordam'
    ],
    
    excluded: [],
    
    description: 'O\'sish uchun',
    popular: true,
    color: 'blue',
    badge: 'Mashhur'
  },
  
  professional: {
    id: 'professional',
    name: 'Professional',
    nameUz: 'Professional',
    nameRu: 'Professional',
    nameEn: 'Professional',
    
    // Pricing
    monthlyFee: 10788000, // $899 * 12000
    monthlyFeeUSD: 899,
    commissionRate: 0.01, // 1%
    
    // Limits
    limits: {
      sku: -1, // unlimited
      monthlySalesLimit: -1, // unlimited
      marketplaces: -1, // all available
      aiCards: -1, // unlimited
      trendHunter: -1, // unlimited
      languages: 3,
    },
    
    // Features
    features: [
      '♾️ Cheksiz mahsulotlar',
      '4+ marketplace (barcha mavjud)',
      'Cheksiz AI kartochka',
      'Cheksiz Trend Hunter',
      '3 tilda tarjima',
      'SEO optimizatsiya',
      'Narx monitoring',
      'Sof foyda tahlili',
      'Kengaytirilgan AI tahlil',
      'Tezkor yordam (1 soat)',
      'Shaxsiy menejer',
      'API kirish',
      'White-label branding',
      'Maxsus integratsiyalar',
      'A/B testing',
      'Xalqaro kengayish'
    ],
    
    excluded: [],
    
    description: 'Enterprise',
    popular: false,
    color: 'purple',
    badge: 'Premium'
  }
};

// AI Manager Plans (SaaS only - no fulfillment)
export const AI_MANAGER_PLANS = {
  basic: {
    id: 'basic',
    name: 'AI Manager Basic',
    monthlyFee: 0, // Included in tier
    revenueCommissionRate: 0.02, // 2%
    features: [
      'AI kartochka yaratish',
      'Asosiy tarjima',
      'Trend tahlili'
    ]
  },
  advanced: {
    id: 'advanced',
    name: 'AI Manager Advanced',
    monthlyFee: 0, // Included in tier
    revenueCommissionRate: 0.018, // 1.8%
    features: [
      'AI kartochka yaratish',
      'Professional tarjima',
      'Trend tahlili',
      'SEO optimizatsiya',
      'Narx tavsiyalari'
    ]
  },
  premium: {
    id: 'premium',
    name: 'AI Manager Premium',
    monthlyFee: 0, // Included in tier
    revenueCommissionRate: 0.015, // 1.5%
    features: [
      'Barcha Advanced features',
      'Custom AI models',
      'API access',
      'Priority processing'
    ]
  }
};

// Helper functions
export function getTierByRevenue(monthlyRevenue: number): string {
  if (monthlyRevenue < 15000000) return 'free_starter';
  if (monthlyRevenue < 69000000) return 'basic';
  if (monthlyRevenue < 200000000) return 'starter';
  return 'professional';
}

export function getTierName(tierId: string): string {
  const tier = SAAS_PRICING_TIERS[tierId as keyof typeof SAAS_PRICING_TIERS];
  return tier ? tier.nameUz : tierId;
}

export function getTierColor(tierId: string): string {
  const tier = SAAS_PRICING_TIERS[tierId as keyof typeof SAAS_PRICING_TIERS];
  return tier ? tier.color : 'gray';
}

export function canUpgradeTier(currentTier: string, targetTier: string): boolean {
  const tiers = ['free_starter', 'basic', 'starter', 'professional'];
  const currentIndex = tiers.indexOf(currentTier);
  const targetIndex = tiers.indexOf(targetTier);
  return targetIndex > currentIndex;
}
