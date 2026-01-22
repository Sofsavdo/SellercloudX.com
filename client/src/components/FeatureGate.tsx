import { ReactNode } from 'react';
import { useTierAccess, FeatureType, getRequiredTierForFeature } from '@/hooks/useTierAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Sparkles, Zap, ArrowRight } from 'lucide-react';

interface FeatureGateProps {
  feature: FeatureType;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  onUpgradeClick?: () => void;
}

const FEATURE_NAMES: Record<FeatureType, string> = {
  profit_dashboard: 'Foyda Dashboard',
  trend_hunter: 'Trend Hunter',
  ai_manager: 'AI Manager',
  bulk_upload: 'Bulk Upload',
  api_access: 'API Access',
  white_label: 'White Label',
  priority_support: 'Priority Support',
  full_analytics: 'To\'liq Analytics',
};

const TIER_NAMES: Record<string, string> = {
  free_starter: 'Free Starter',
  basic: 'Basic',
  starter_pro: 'Starter Pro',
  professional: 'Professional',
};

const TIER_ICONS: Record<string, typeof Zap> = {
  basic: Zap,
  starter_pro: Sparkles,
  professional: Crown,
};

export function FeatureGate({ 
  feature, 
  children, 
  fallback, 
  showUpgradePrompt = true,
  onUpgradeClick 
}: FeatureGateProps) {
  const { canAccess } = useTierAccess();
  
  if (canAccess(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const requiredTier = getRequiredTierForFeature(feature);
  const TierIcon = TIER_ICONS[requiredTier] || Zap;

  return (
    <Card className="border-2 border-dashed border-muted-foreground/30 bg-muted/30">
      <CardHeader className="text-center pb-2">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-lg">
          {FEATURE_NAMES[feature]} - Premium Xususiyat
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          Bu funksiya faqat <Badge variant="secondary" className="mx-1">
            <TierIcon className="w-3 h-3 mr-1" />
            {TIER_NAMES[requiredTier]}
          </Badge> tarifdan boshlab mavjud.
        </p>
        {onUpgradeClick && (
          <Button onClick={onUpgradeClick} className="gap-2">
            Tarifni O'zgartirish
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// HOC version for wrapping components
export function withFeatureGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: FeatureType
) {
  return function WithFeatureGate(props: P & { onUpgradeClick?: () => void }) {
    const { onUpgradeClick, ...rest } = props;
    return (
      <FeatureGate feature={feature} onUpgradeClick={onUpgradeClick}>
        <WrappedComponent {...(rest as P)} />
      </FeatureGate>
    );
  };
}

// Hook for checking access programmatically
export function useFeatureAccess(feature: FeatureType) {
  const { canAccess, requireUpgrade } = useTierAccess();
  
  return {
    hasAccess: canAccess(feature),
    requiredTier: requireUpgrade(feature),
    featureName: FEATURE_NAMES[feature],
  };
}
