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
        description: \"Iltimos, o'zgartirish sababini kiriting\",
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
    <div className=\"space-y-6\">\n      {/* Current Tier */}\n      <Card className=\"card-premium border-primary\">\n        <CardHeader>\n          <CardTitle className=\"flex items-center gap-2\">\n            <Crown className=\"w-5 h-5 text-primary\" />\n            Joriy Tarifingiz: {currentTierData?.name}\n          </CardTitle>\n        </CardHeader>\n        <CardContent>\n          <div className=\"flex items-center justify-between\">\n            <div>\n              <p className=\"text-3xl font-bold\">{currentTierData?.priceSom}</p>\n              <p className=\"text-sm text-muted-foreground mt-1\">{currentTierData?.commission}</p>\n            </div>\n            <Badge className={currentTierData?.badgeColor}>{currentTierData?.badge}</Badge>\n          </div>\n        </CardContent>\n      </Card>\n\n      {/* Available Tiers */}\n      <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">\n        {PRICING_TIERS.map((tier, index) => {\n          const isCurrent = tier.id === currentTierData?.id;\n          const isLower = index < currentIndex;\n          const isHigher = index > currentIndex;\n          const Icon = tier.popular ? Sparkles : tier.id === 'professional' ? Crown : Zap;\n\n          return (\n            <Card\n              key={tier.id}\n              className={`\n                ${isCurrent ? 'border-primary card-premium' : ''}\n                ${tier.popular ? 'border-primary' : ''}\n                ${isLower ? 'opacity-60' : ''}\n                transition-all hover:shadow-lg\n              `}\n            >\n              <CardContent className=\"p-6\">\n                <div className=\"space-y-4\">\n                  {/* Header */}\n                  <div className=\"flex items-start justify-between\">\n                    <div>\n                      <h3 className=\"text-xl font-bold flex items-center gap-2\">\n                        <Icon className=\"w-5 h-5\" />\n                        {tier.name}\n                      </h3>\n                      <p className=\"text-sm text-muted-foreground\">{tier.description}</p>\n                    </div>\n                    <Badge className={tier.badgeColor}>{tier.badge}</Badge>\n                  </div>\n\n                  {/* Price */}\n                  <div>\n                    <p className=\"text-3xl font-bold\">{tier.priceSom}</p>\n                    <p className=\"text-sm text-muted-foreground\">{tier.commission}</p>\n                  </div>\n\n                  {/* Limits */}\n                  <div className=\"space-y-2\">\n                    {tier.limits.slice(0, 4).map((limit, i) => {\n                      const LimitIcon = limit.icon;\n                      return (\n                        <div key={i} className=\"flex items-center gap-2 text-sm\">\n                          <LimitIcon className=\"w-4 h-4 text-primary\" />\n                          <span>{limit.text}</span>\n                        </div>\n                      );\n                    })}\n                  </div>\n\n                  {/* Action Button */}\n                  <div>\n                    {isCurrent ? (\n                      <Button className=\"w-full\" disabled>\n                        <CheckCircle className=\"w-4 h-4 mr-2\" />\n                        Joriy Tarif\n                      </Button>\n                    ) : isLower ? (\n                      <Button className=\"w-full\" variant=\"outline\" disabled>\n                        Pastroq Tarif\n                      </Button>\n                    ) : (\n                      <Button\n                        className=\"w-full\"\n                        variant={tier.ctaVariant}\n                        onClick={() => setSelectedTier(tier.id)}\n                      >\n                        {tier.cta}\n                      </Button>\n                    )}\n                  </div>\n                </div>\n              </CardContent>\n            </Card>\n          );\n        })}\n      </div>\n\n      {/* Upgrade Request Modal */}\n      {selectedTier && (\n        <Card className=\"border-primary\">\n          <CardHeader>\n            <CardTitle>\n              {getTierById(selectedTier)?.name} tarifiga o'tish\n            </CardTitle>\n          </CardHeader>\n          <CardContent className=\"space-y-4\">\n            <div>\n              <label className=\"text-sm font-medium\">O'zgartirish sababi</label>\n              <Textarea\n                value={reason}\n                onChange={(e) => setReason(e.target.value)}\n                placeholder=\"Nima uchun ushbu tarifga o'tmoqchisiz?\"\n                rows={4}\n              />\n            </div>\n            <div className=\"flex gap-2\">\n              <Button\n                onClick={() => handleRequestUpgrade(selectedTier)}\n                disabled={requestUpgradeMutation.isPending}\n              >\n                {requestUpgradeMutation.isPending ? \"Yuborilmoqda...\" : \"So'rov Yuborish\"}\n              </Button>\n              <Button variant=\"outline\" onClick={() => setSelectedTier(null)}>\n                Bekor qilish\n              </Button>\n            </div>\n          </CardContent>\n        </Card>\n      )}\n    </div>\n  );\n}\n