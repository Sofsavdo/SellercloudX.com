import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { CheckCircle, Crown, Sparkles, Zap } from 'lucide-react';
import { PRICING_TIERS, getTierById } from '@/constants/pricing';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currency';

interface ImprovedTierUpgradeProps {
  currentTier: string;
  partnerId?: string;
}

export function ImprovedTierUpgrade({ currentTier, partnerId }: ImprovedTierUpgradeProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const currentTierData = getTierById(currentTier);
  const currentIndex = PRICING_TIERS.findIndex(t => t.id === currentTierData?.id);

  const requestUpgradeMutation = useMutation({
    mutationFn: async (data: { targetTier: string; reason: string }) => {
      const response = await apiRequest('POST', '/api/subscriptions/tier-upgrade-request', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "So'rov yuborildi",
        description: "Tarif yangilash so'rovingiz ko'rib chiqilmoqda",
      });
      setSelectedTier(null);
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['/api/partner/me'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleRequestUpgrade = (tierId: string) => {
    if (!reason.trim()) {
      toast({
        title: 'Xatolik',
        description: "Iltimos, o'zgartirish sababini kiriting",
        variant: 'destructive',
      });
      return;
    }

    requestUpgradeMutation.mutate({
      targetTier: tierId,
      reason,
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Tier */}
      <Card className="card-premium border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Joriy Tarifingiz: {currentTierData?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{currentTierData?.priceSom}</p>
              <p className="text-sm text-muted-foreground mt-1">{currentTierData?.commission}</p>
            </div>
            <Badge className={currentTierData?.badgeColor}>{currentTierData?.badge}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Available Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PRICING_TIERS.map((tier, index) => {
          const isCurrent = tier.id === currentTierData?.id;
          const isLower = index < currentIndex;
          const isHigher = index > currentIndex;
          const Icon = tier.popular ? Sparkles : tier.id === 'professional' ? Crown : Zap;

          return (
            <Card
              key={tier.id}
              className={`
                ${isCurrent ? 'border-primary card-premium' : ''}
                ${tier.popular ? 'border-primary' : ''}
                ${isLower ? 'opacity-60' : ''}
                transition-all hover:shadow-lg
              `}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        {tier.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{tier.description}</p>
                    </div>
                    <Badge className={tier.badgeColor}>{tier.badge}</Badge>
                  </div>

                  {/* Price */}
                  <div>
                    <p className="text-3xl font-bold">{tier.priceSom}</p>
                    <p className="text-sm text-muted-foreground">{tier.commission}</p>
                  </div>

                  {/* Limits */}
                  <div className="space-y-2">
                    {tier.limits.slice(0, 4).map((limit, i) => {
                      const LimitIcon = limit.icon;
                      return (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <LimitIcon className="w-4 h-4 text-primary" />
                          <span>{limit.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Button */}
                  <div>
                    {isCurrent ? (
                      <Button className="w-full" disabled>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Joriy Tarif
                      </Button>
                    ) : isLower ? (
                      <Button className="w-full" variant="outline" disabled>
                        Pastroq Tarif
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant={tier.ctaVariant}
                        onClick={() => setSelectedTier(tier.id)}
                      >
                        {tier.cta}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upgrade Request Modal */}
      {selectedTier && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>
              {getTierById(selectedTier)?.name} tarifiga o'tish
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">O'zgartirish sababi</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nima uchun ushbu tarifga o'tmoqchisiz?"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleRequestUpgrade(selectedTier)}
                disabled={requestUpgradeMutation.isPending}
              >
                {requestUpgradeMutation.isPending ? "Yuborilmoqda..." : "So'rov Yuborish"}
              </Button>
              <Button variant="outline" onClick={() => setSelectedTier(null)}>
                Bekor qilish
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
