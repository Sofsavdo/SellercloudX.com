import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface TierAccess {
  tier: 'free_starter' | 'basic' | 'starter_pro' | 'professional';
  hasProfitDashboard: boolean;
  hasTrendHunter: boolean;
  canViewFullAnalytics: boolean;
  canAccessPremiumFeatures: boolean;
}

export function useTierAccess() {
  const { data: partner } = useQuery({
    queryKey: ['/api/partners/me'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/partners/me');
      return response.json();
    },
    retry: false,
  });

  const currentTier = (partner as any)?.pricingTier || 'free_starter';

  const access: TierAccess = {
    tier: currentTier,
    hasProfitDashboard: ['basic', 'starter_pro', 'professional'].includes(currentTier),
    hasTrendHunter: ['free_starter', 'basic', 'starter_pro', 'professional'].includes(currentTier), // All tiers have access
    canViewFullAnalytics: ['starter_pro', 'professional'].includes(currentTier),
    canAccessPremiumFeatures: ['professional'].includes(currentTier),
  };

  return access;
}

export function getTierName(tier: string): string {
  const tierNames: Record<string, string> = {
    free_starter: 'Free Starter',
    basic: 'Basic',
    starter_pro: 'Starter Pro',
    professional: 'Professional',
  };
  return tierNames[tier] || tier;
}

export function getRequiredTierForFeature(feature: 'profit' | 'trends'): string {
  if (feature === 'profit') return 'basic';
  if (feature === 'trends') return 'free_starter'; // All tiers
  return 'free_starter';
}
