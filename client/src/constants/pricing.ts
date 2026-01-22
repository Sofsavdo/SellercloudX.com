import { Package, Globe, Bot, Target, DollarSign } from 'lucide-react';

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
  commission: string;
  commissionColor: string;
  description: string;
  cta: string;
  ctaVariant: 'default' | 'outline';
  limits: Array<{ icon: any; text: string }>;
  features: string[];
  excluded: string[];
  popular: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free Starter',
    badge: 'BEPUL',
    badgeColor: 'bg-success text-success-foreground',
    price: '$0',
    priceNum: 0,
    period: '/oy',
    priceSom: "0 so'm/oy",
    commission: '2% komissiya',
    commissionColor: 'bg-success/10 text-success',
    description: "Sinab ko'rish uchun",
    cta: 'Bepul boshlash',
    ctaVariant: 'outline',
    limits: [
      { icon: Package, text: '10 ta mahsulot' },
      { icon: Globe, text: '1 marketplace (Yandex Market)' },
      { icon: Bot, text: '10 AI kartochka' },
      { icon: Target, text: '10 marta/oy Trend Hunter' },
      { icon: DollarSign, text: "15M so'm oylik limit" },
      { icon: Globe, text: '3 tilda tarjima' },
    ],
    features: [
      '10 ta mahsulot',
      '1 marketplace (Yandex Market)',
      'AI kartochka yaratish (10 ta)',
      'Trend Hunter (10 marta/oy)',
      '3 tilda tarjima',
      'Asosiy savdo statistikasi',
      'Ombor monitoring',
      'Admin chat yordam',
      'Email yordam',
    ],
    excluded: [
      'Sof foyda tahlili',
      'Narx monitoring',
      'SEO optimizatsiya',
      "Ko'p marketplace",
      'Telegram xabarnomalar',
    ],
    popular: false,
  },
  {
    id: 'basic',
    name: 'Basic',
    badge: 'Arzon',
    badgeColor: 'bg-warning text-warning-foreground',
    price: '$69',
    priceNum: 69,
    period: '/oy',
    priceSom: "828,000 so'm/oy",
    commission: '1.8% komissiya',
    commissionColor: 'bg-warning/10 text-warning',
    description: 'Kichik biznes uchun',
    cta: 'Basic rejasini tanlash',
    ctaVariant: 'outline',
    limits: [
      { icon: Package, text: '69 ta mahsulot' },
      { icon: Globe, text: '1 marketplace (Yandex Market)' },
      { icon: Bot, text: '69 AI kartochka' },
      { icon: Target, text: '69 marta/oy Trend Hunter' },
      { icon: DollarSign, text: "69M so'm oylik limit" },
      { icon: Globe, text: '3 tilda tarjima' },
    ],
    features: [
      '69 ta mahsulot',
      '1 marketplace (Yandex Market)',
      'AI kartochka yaratish (69 ta)',
      'Trend Hunter (69 marta/oy)',
      '3 tilda tarjima',
      '✨ Sof foyda tahlili',
      "To'liq savdo statistikasi",
      'Ombor boshqaruvi',
      'Telegram xabarnomalar',
      'Email yordam',
    ],
    excluded: [
      "Ko'p marketplace",
      'SEO optimizatsiya',
      'Narx monitoring',
      'Ommaviy operatsiyalar',
    ],
    popular: false,
  },
  {
    id: 'starter_pro',
    name: 'Starter Pro',
    badge: 'MASHHUR',
    badgeColor: 'bg-primary text-primary-foreground badge-pulse',
    extraBadge: "Eng ko'p tanlangan",
    price: '$349',
    priceNum: 349,
    period: '/oy',
    priceSom: "4,188,000 so'm/oy",
    commission: '1.5% komissiya',
    commissionColor: 'bg-primary/10 text-primary',
    description: "O'sib borayotgan biznes",
    cta: 'Starter Pro rejasini tanlash',
    ctaVariant: 'default',
    limits: [
      { icon: Package, text: '400 ta mahsulot (100/marketplace)' },
      { icon: Globe, text: '4 marketplace (Uzum, Yandex, WB, Ozon)' },
      { icon: Bot, text: 'Cheksiz AI kartochka' },
      { icon: Target, text: 'Cheksiz Trend Hunter' },
      { icon: DollarSign, text: "200M so'm oylik limit" },
      { icon: Globe, text: '3 tilda tarjima' },
    ],
    features: [
      '400 ta mahsulot (100 har bir marketplace)',
      '4 marketplace (Uzum, Yandex, Wildberries, Ozon)',
      'Cheksiz AI kartochka yaratish',
      'Cheksiz Trend Hunter',
      '3 tilda professional tarjima',
      '🎯 SEO optimizatsiya',
      '📊 Narx monitoring',
      '💰 Sof foyda tahlili',
      "📈 To'liq savdo tahlili",
      '🏪 Ombor boshqaruvi',
      '🔄 Ommaviy operatsiyalar',
      '📱 Telegram xabarnomalar',
      '⏰ 24/7 monitoring',
      '📧 Email yordam',
    ],
    excluded: [],
    popular: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    badge: 'Premium',
    badgeColor: 'bg-accent text-accent-foreground',
    extraBadge: 'Enterprise',
    price: '$899',
    priceNum: 899,
    period: '/oy',
    priceSom: "10,788,000 so'm/oy",
    commission: '1% komissiya',
    commissionColor: 'bg-accent/10 text-accent',
    description: 'Enterprise biznes',
    cta: 'Professional rejasini tanlash',
    ctaVariant: 'outline',
    limits: [
      { icon: Package, text: 'Cheksiz mahsulotlar' },
      { icon: Globe, text: 'Barcha mavjud marketplacelar' },
      { icon: Bot, text: 'Cheksiz AI kartochka' },
      { icon: Target, text: 'Cheksiz Trend Hunter' },
      { icon: DollarSign, text: 'Cheksiz oylik savdo' },
      { icon: Globe, text: '3 tilda tarjima' },
    ],
    features: [
      'Cheksiz mahsulotlar',
      '4+ marketplace (barcha mavjud)',
      'Cheksiz AI kartochka',
      'Cheksiz Trend Hunter',
      '3 tilda professional tarjima',
      'SEO optimizatsiya',
      'Narx monitoring',
      'Sof foyda tahlili',
      '🧠 Kengaytirilgan AI tahlil',
      '⚡ Tezkor yordam (1 soat)',
      '👨‍💼 Shaxsiy menejer',
      '🔌 API kirish',
      '🎨 White-label branding',
      '🔗 Maxsus integratsiyalar',
      '🧪 A/B testing',
      '🌍 Xalqaro kengayish',
    ],
    excluded: [],
    popular: false,
  },
];

// Tier name to ID mapping for database compatibility
export const TIER_NAME_TO_ID: Record<string, string> = {
  'Free Starter': 'free',
  'free': 'free',
  'Basic': 'basic',
  'basic': 'basic',
  'Starter Pro': 'starter_pro',
  'starter_pro': 'starter_pro',
  'Professional': 'professional',
  'professional': 'professional',
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
