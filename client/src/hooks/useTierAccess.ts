import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { TIER_PRICING } from '@/config/tiers';

export interface TierAccess {
  tier: 'free_starter' | 'basic' | 'starter_pro' | 'professional';
  tierName: string;
  commission: number;
  
  // Feature access
  hasProfitDashboard: boolean;
  hasTrendHunter: boolean;
  hasAIManager: boolean;
  hasBulkUpload: boolean;
  hasAPIAccess: boolean;
  hasWhiteLabel: boolean;
  hasPrioritySupport: boolean;
  canViewFullAnalytics: boolean;
  
  // Limits
  maxProducts: number;
  maxOrders: number;
  aiTasks: number;
  marketplaces: number;
  
  // Helper functions
  canAccess: (feature: FeatureType) => boolean;
  requireUpgrade: (feature: FeatureType) => string | null;
}

export type FeatureType = 
  | 'profit_dashboard'
  | 'trend_hunter'
  | 'ai_manager'
  | 'bulk_upload'
  | 'api_access'
  | 'white_label'
  | 'priority_support'
  | 'full_analytics';

const FEATURE_REQUIREMENTS: Record<FeatureType, string[]> = {
  profit_dashboard: ['basic', 'starter_pro', 'professional'],
  trend_hunter: ['starter_pro', 'professional'],
  ai_manager: ['basic', 'starter_pro', 'professional'],
  bulk_upload: ['starter_pro', 'professional'],
  api_access: ['professional'],
  white_label: ['professional'],
  priority_support: ['starter_pro', 'professional'],
  full_analytics: ['starter_pro', 'professional'],
};

const FEATURE_MIN_TIER: Record<FeatureType, string> = {
  profit_dashboard: 'basic',
  trend_hunter: 'starter_pro',
  ai_manager: 'basic',
  bulk_upload: 'starter_pro',
  api_access: 'professional',
  white_label: 'professional',
  priority_support: 'starter_pro',
  full_analytics: 'starter_pro',
};

export function useTierAccess(): TierAccess {
  const { data: partner } = useQuery({
    queryKey: ['/api/partners/me'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/partners/me');
      return response.json();
    },
    retry: false,
  });

  const currentTier = (partner as any)?.pricingTier || 'free_starter';
  const tierConfig = TIER_PRICING[currentTier] || TIER_PRICING.free_starter;

  const canAccess = (feature: FeatureType): boolean => {
    const allowedTiers = FEATURE_REQUIREMENTS[feature];
    return allowedTiers.includes(currentTier);
  };

  const requireUpgrade = (feature: FeatureType): string | null => {
    if (canAccess(feature)) return null;
    return FEATURE_MIN_TIER[feature];
  };

  const access: TierAccess = {
    tier: currentTier as TierAccess['tier'],
    tierName: tierConfig.name,
    commission: tierConfig.commission,
    
    // Feature access
    hasProfitDashboard: canAccess('profit_dashboard'),
    hasTrendHunter: canAccess('trend_hunter'),
    hasAIManager: canAccess('ai_manager'),
    hasBulkUpload: canAccess('bulk_upload'),
    hasAPIAccess: canAccess('api_access'),
    hasWhiteLabel: canAccess('white_label'),
    hasPrioritySupport: canAccess('priority_support'),
    canViewFullAnalytics: canAccess('full_analytics'),
    
    // Limits
    maxProducts: tierConfig.limits.maxProducts,
    maxOrders: tierConfig.limits.maxOrders,
    aiTasks: tierConfig.limits.aiTasks,
    marketplaces: tierConfig.limits.marketplaces,
    
    // Helper functions
    canAccess,
    requireUpgrade,
  };

  return access;
}

export function getTierName(tier: string): string {
  return TIER_PRICING[tier]?.name || tier;
}

export function getRequiredTierForFeature(feature: FeatureType): string {
  return FEATURE_MIN_TIER[feature] || 'free_starter';
}
