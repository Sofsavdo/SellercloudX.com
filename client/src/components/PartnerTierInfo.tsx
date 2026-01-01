import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  TrendingUp, 
  DollarSign, 
  Package,
  ArrowRight,
  CheckCircle,
  Info
} from "lucide-react";
// SAAS MODEL: Use new SaaS-only pricing
import { SAAS_PRICING_TIERS as NEW_PRICING_TIERS } from '../../../SAAS_PRICING_CONFIG';

interface TierConfig {
  id: string;
  name: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  monthlyFee: number;
  monthlyFeeUSD: number;
  commissionRate: number;
  description: string;
  limits: {
    sku: number;
    monthlySalesLimit: number;
    marketplaces: number;
    aiCards: number;
    trendHunter: number;
    languages: number;
  };
  features: string[];
  excluded: string[];
  popular: boolean;
  color: string;
  badge: string;
}

interface PartnerTierInfoProps {
  currentTier: string;
  monthlyFee: number;
  profitShareRate: number;
  monthlyRevenue?: number;
  onUpgradeClick?: () => void;
}

export function PartnerTierInfo({ 
  currentTier, 
  monthlyFee = 0, 
  profitShareRate = 0,
  monthlyRevenue = 0,
  onUpgradeClick 
}: PartnerTierInfoProps) {
  const tierConfig = NEW_PRICING_TIERS[currentTier as keyof typeof NEW_PRICING_TIERS] as TierConfig | undefined;
  
  if (!tierConfig) {
    return null;
  }

  const formatSom = (amount: number): string => {
    return new Intl.NumberFormat('uz-UZ').format(Math.round(amount)) + ' so\'m';
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'starter_pro': return 'bg-blue-500';
      case 'business_standard': return 'bg-green-500';
      case 'professional_plus': return 'bg-purple-500';
      case 'enterprise_elite': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'enterprise_elite': return Crown;
      case 'professional_plus': return TrendingUp;
      case 'business_standard': return Package;
      default: return DollarSign;
    }
  };

  const TierIcon = getTierIcon(currentTier);

  return (
    <div className="space-y-4">
      {/* Current Tier Card */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${getTierBadgeColor(currentTier)} rounded-xl flex items-center justify-center shadow-lg`}>
                <TierIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{tierConfig.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{tierConfig.description}</p>
              </div>
            </div>
            <Badge className={`${getTierBadgeColor(currentTier)} text-white text-base px-4 py-2`}>
              Sizning Tarifingiz
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Payment Structure */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                To'lov Tuzilmasi
              </h4>
              
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-600">Oylik Abonent:</span>
                    <span className="font-bold text-blue-600 text-lg">{formatSom(monthlyFee)}</span>
                  </div>
                  <p className="text-xs text-slate-500">Fixed oylik to'lov</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-600">Komissiya:</span>
                    <span className="font-bold text-green-600 text-lg">{(profitShareRate * 100).toFixed(1)}%</span>
                  </div>
                  <p className="text-xs text-slate-500">Savdolardan</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3">
                  <div className="flex items-center gap-2 justify-center">
                    <Info className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">
                      Savdo bo'lmasa, faqat abonent to'lanadi!
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Limits & Features */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Xizmatlar
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{tierConfig.limits.marketplaces === -1 ? 'Barcha' : tierConfig.limits.marketplaces} marketplace</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{tierConfig.limits.sku === -1 ? 'Cheksiz' : tierConfig.limits.sku} mahsulot</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{tierConfig.limits.aiCards === -1 ? 'Cheksiz' : tierConfig.limits.aiCards} AI kartochka</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{tierConfig.limits.languages} tilda tarjima</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Range */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Oylik savdo limiti:</p>
                <p className="font-bold text-lg">
                  {tierConfig.limits.monthlySalesLimit === -1 ? 'Cheksiz' : formatSom(tierConfig.limits.monthlySalesLimit)}
                </p>
              </div>
              {monthlyRevenue > 0 && (
                <Badge variant="outline" className="text-base px-3 py-1">
                  Sizniki: {formatSom(monthlyRevenue)}
                </Badge>
              )}
            </div>
          </div>

          {/* Upgrade Button */}
          {onUpgradeClick && (
            <div className="mt-6">
              <Button 
                onClick={onUpgradeClick}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                Tarifni Oshirish
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
