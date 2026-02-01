import { Package, Globe, Bot, Target, DollarSign, Crown, Shield, Users } from 'lucide-react';

export interface PricingTier {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  extraBadge?: string;
  price: string;
  priceNum: number;
  period: string;
  priceSom: string;
  setupFee?: string;
  setupFeeNum?: number;
  revenueShare?: string;
  revenueSharePercent?: number;
  commission: string;
  commissionColor: string;
  description: string;
  cta: string;
  ctaVariant: 'default' | 'outline';
  limits: Array<{ icon: any; text: string }>;
  features: string[];
  excluded: string[];
  popular: boolean;
  guarantee?: string;
}

// 2026 REVENUE SHARE MODEL
export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'premium',
    name: 'Premium',
    badge: 'TAVSIYA',
    badgeColor: 'bg-accent text-accent-foreground badge-pulse',
    extraBadge: '60-kun kafolat',
    price: '$499',
    priceNum: 499,
    period: '/oy',
    priceSom: "6,300,000 so'm/oy",
    setupFee: '$699',
    setupFeeNum: 699,
    revenueShare: '4% savdodan',
    revenueSharePercent: 4,
    commission: '4% revenue share',
    commissionColor: 'bg-accent/10 text-accent',
    description: "To'liq AI avtomatizatsiya",
    cta: 'Hoziroq Boshlash',
    ctaVariant: 'default',
    limits: [
      { icon: Package, text: 'Cheksiz mahsulotlar' },
      { icon: Globe, text: '4 marketplace' },
      { icon: Bot, text: 'Cheksiz AI kartochka' },
      { icon: Target, text: 'Cheksiz Trend Hunter' },
      { icon: DollarSign, text: 'Cheksiz savdo' },
      { icon: Shield, text: '60-kun kafolat' },
    ],
    features: [
      '60-kun savdo o\'sishi kafolati',
      'Cheksiz AI kartochka yaratish',
      'Barcha marketplace integratsiya',
      'Trend Hunter FULL access',
      'Sof foyda analitikasi',
      '24/7 support',
      'API access',
      '3 tilda tarjima',
      'SEO optimizatsiya',
      'Narx monitoring',
      'Nano Banana infografika',
      'MXIK kod avtomatik',
    ],
    excluded: [],
    popular: true,
    guarantee: '60 kunlik savdo o\'sishi kafolati',
  },
  {
    id: 'individual',
    name: 'Individual',
    badge: 'VIP',
    badgeColor: 'bg-primary text-primary-foreground',
    extraBadge: 'Katta sotuvchilar',
    price: 'Kelishiladi',
    priceNum: 0,
    period: '',
    priceSom: "Shaxsiy taklif",
    setupFee: '$1599+',
    setupFeeNum: 1599,
    revenueShare: '2% dan',
    revenueSharePercent: 2,
    commission: '2% dan revenue share',
    commissionColor: 'bg-primary/10 text-primary',
    description: 'Katta sotuvchilar uchun',
    cta: 'Taklif Olish',
    ctaVariant: 'outline',
    limits: [
      { icon: Package, text: 'Cheksiz mahsulotlar' },
      { icon: Globe, text: 'Barcha marketplace' },
      { icon: Bot, text: 'Cheksiz AI kartochka' },
      { icon: Target, text: 'Cheksiz Trend Hunter' },
      { icon: DollarSign, text: 'Cheksiz savdo' },
      { icon: Users, text: 'Dedicated team' },
    ],
    features: [
      'Premium ning barcha imkoniyatlari',
      'Pastroq % ulush (2% dan)',
      'Shaxsiy menejer',
      'Custom integrations',
      'SLA kafolati',
      'Enterprise analytics',
      'White-label branding',
      'API priority',
      'On-site training',
      'Multi-brand support',
    ],
    excluded: [],
    popular: false,
  },
];

// Tier name to ID mapping for database compatibility
export const TIER_NAME_TO_ID: Record<string, string> = {
  'Premium': 'premium',
  'premium': 'premium',
  'Individual': 'individual',
  'individual': 'individual',
  // Legacy mappings for backward compatibility
  'Free Starter': 'premium',
  'free': 'premium',
  'free_starter': 'premium',
  'Basic': 'premium',
  'basic': 'premium',
  'Starter Pro': 'premium',
  'starter_pro': 'premium',
  'Professional': 'individual',
  'professional': 'individual',
};

// Helper function to get tier by ID or name
export function getTierById(idOrName: string): PricingTier | undefined {
  const id = TIER_NAME_TO_ID[idOrName] || idOrName;
  return PRICING_TIERS.find(tier => tier.id === id);
}

// Helper function to get tier display name
export function getTierDisplayName(idOrName: string): string {
  const tier = getTierById(idOrName);
  return tier?.name || idOrName;
}

// 2026 Pricing Constants
export const USD_TO_UZS = 12600;
export const PREMIUM_MONTHLY_USD = 499;
export const PREMIUM_SETUP_USD = 699;
export const PREMIUM_REVENUE_SHARE = 0.04; // 4%
export const INDIVIDUAL_MIN_SETUP_USD = 1599;
export const INDIVIDUAL_MIN_REVENUE_SHARE = 0.02; // 2%
