export interface TierConfig {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  commission: number;
  features: string[];
  limits: {
    maxProducts: number;
    maxOrders: number;
    aiTasks: number;
    marketplaces: number;
  };
  color: string;
  popular?: boolean;
}

export const TIER_PRICING: Record<string, TierConfig> = {
  free_starter: {
    id: 'free_starter',
    name: 'Free Starter',
    price: 0,
    yearlyPrice: 0,
    commission: 15,
    features: [
      '50 ta mahsulot',
      '20 ta buyurtma/oy',
      '1 ta marketplace',
      'Asosiy statistika',
      'Telegram support',
    ],
    limits: {
      maxProducts: 50,
      maxOrders: 20,
      aiTasks: 5,
      marketplaces: 1,
    },
    color: 'gray',
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 199000,
    yearlyPrice: 1990000,
    commission: 12,
    features: [
      '200 ta mahsulot',
      '100 ta buyurtma/oy',
      '2 ta marketplace',
      "Foyda Dashboard",
      'AI yordamchi (50 so\'rov)',
      'Telegram support',
    ],
    limits: {
      maxProducts: 200,
      maxOrders: 100,
      aiTasks: 50,
      marketplaces: 2,
    },
    color: 'blue',
  },
  starter_pro: {
    id: 'starter_pro',
    name: 'Starter Pro',
    price: 499000,
    yearlyPrice: 4990000,
    commission: 10,
    popular: true,
    features: [
      '1000 ta mahsulot',
      '500 ta buyurtma/oy',
      '5 ta marketplace',
      "Foyda Dashboard",
      'Trend Hunter',
      'AI Manager (200 so\'rov)',
      'Bulk upload',
      'Priority support',
    ],
    limits: {
      maxProducts: 1000,
      maxOrders: 500,
      aiTasks: 200,
      marketplaces: 5,
    },
    color: 'purple',
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 999000,
    yearlyPrice: 9990000,
    commission: 7,
    features: [
      'Cheksiz mahsulotlar',
      'Cheksiz buyurtmalar',
      '10+ marketplace',
      "To'liq Analytics",
      'Trend Hunter Pro',
      'AI Manager (1000 so\'rov)',
      'API Access',
      'White-label',
      'Shaxsiy menejer',
    ],
    limits: {
      maxProducts: 999999,
      maxOrders: 999999,
      aiTasks: 1000,
      marketplaces: 10,
    },
    color: 'gold',
  },
};

export const TIER_ORDER = ['free_starter', 'basic', 'starter_pro', 'professional'];

export function getUpgradeableTiers(currentTier: string): TierConfig[] {
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  return TIER_ORDER
    .slice(currentIndex + 1)
    .map(id => TIER_PRICING[id]);
}

export function canUpgradeTo(currentTier: string, targetTier: string): boolean {
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  const targetIndex = TIER_ORDER.indexOf(targetTier);
  return targetIndex > currentIndex;
}
