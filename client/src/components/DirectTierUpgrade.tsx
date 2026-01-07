// Direct Tier Upgrade - To'lov qilib avtomatik tarif almashish
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { CheckCircle, Crown, Sparkles, Zap, CreditCard, Loader2, ArrowRight, Bot } from 'lucide-react';
import { PRICING_TIERS, getTierById } from '@/constants/pricing';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currency';

interface DirectTierUpgradeProps {
  currentTier: string;
  partnerId?: string;
  aiCardsUsed?: number;
}

const PAYMENT_METHODS = [
  { id: 'click', name: 'Click', logo: '💳' },
  { id: 'payme', name: 'Payme', logo: '📱' },
  { id: 'uzcard', name: 'UzCard', logo: '💳' },
];

export function DirectTierUpgrade({ currentTier, partnerId, aiCardsUsed = 0 }: DirectTierUpgradeProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('click');
  const [showPayment, setShowPayment] = useState(false);

  const currentTierData = getTierById(currentTier);
  const currentIndex = PRICING_TIERS.findIndex(t => t.id === currentTierData?.id);

  // Free tarif uchun AI limit - 10 ta kartochka
  const FREE_AI_LIMIT = 10;
  const showAIUpgradePrompt = currentTierData?.id === 'free' && aiCardsUsed >= FREE_AI_LIMIT;

  // Process payment and upgrade tier
  const upgradeMutation = useMutation({
    mutationFn: async (data: { targetTier: string; paymentMethod: string }) => {
      const response = await apiRequest('POST', '/api/subscriptions/direct-upgrade', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Muvaffaqiyatli!',
        description: `Tarifingiz ${getTierById(data.newTier)?.name} ga yangilandi!`,
      });
      setSelectedTier(null);
      setShowPayment(false);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
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

  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId);
    setShowPayment(true);
  };

  const handlePayment = () => {
    if (!selectedTier) return;
    upgradeMutation.mutate({
      targetTier: selectedTier,
      paymentMethod,
    });
  };

  const selectedTierData = selectedTier ? getTierById(selectedTier) : null;

  return (
    <div className="space-y-6">
      {/* AI Upgrade Prompt for Free Users */}
      {showAIUpgradePrompt && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">AI limitingiz tugadi!</h3>
                <p className="text-muted-foreground mb-4">
                  Siz {FREE_AI_LIMIT} ta bepul AI kartochkangizni ishlatdingiz. 
                  AI dan davom etish uchun tarifni yangilang.
                </p>
                <Button onClick={() => handleSelectTier('basic')} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Tarifni yangilash
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          {currentTierData?.id === 'free' && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <Bot className="w-4 h-4 inline mr-1" />
                AI kartochka: <strong>{aiCardsUsed}/{FREE_AI_LIMIT}</strong> ishlatildi
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PRICING_TIERS.map((tier, index) => {
          const isCurrent = tier.id === currentTierData?.id;
          const isLower = index < currentIndex;
          const isHigher = index > currentIndex;
          const Icon = tier.popular ? Sparkles : tier.id === 'professional' ? Crown : Zap;
          const hasAI = tier.id !== 'free';

          return (
            <Card
              key={tier.id}
              className={`
                ${isCurrent ? 'border-primary card-premium' : ''}
                ${tier.popular ? 'border-primary ring-2 ring-primary/20' : ''}
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
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={tier.badgeColor}>{tier.badge}</Badge>
                      {hasAI && (
                        <Badge variant="outline" className="text-xs">
                          <Bot className="w-3 h-3 mr-1" />
                          AI faol
                        </Badge>
                      )}
                    </div>
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
                        className="w-full gap-2"
                        variant={tier.popular ? 'default' : 'outline'}
                        onClick={() => handleSelectTier(tier.id)}
                      >
                        <CreditCard className="w-4 h-4" />
                        {tier.cta}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Modal */}
      {showPayment && selectedTierData && (
        <Card className="border-primary card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              To'lov - {selectedTierData.name} tarifiga o'tish
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span>Tarif</span>
                <span className="font-semibold">{selectedTierData.name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Narxi</span>
                <span className="font-semibold">{selectedTierData.priceSom}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold">Jami to'lov</span>
                <span className="text-xl font-bold text-primary">{selectedTierData.priceSom}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">To'lov usulini tanlang</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {PAYMENT_METHODS.map((method) => (
                  <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer flex-1">
                      <span className="text-xl">{method.logo}</span>
                      <span>{method.name}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={handlePayment} 
                disabled={upgradeMutation.isPending}
                className="flex-1 gap-2"
              >
                {upgradeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                To'lovni amalga oshirish
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPayment(false);
                  setSelectedTier(null);
                }}
              >
                Bekor qilish
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              To'lov muvaffaqiyatli bo'lgach, tarif avtomatik yangilanadi. Admin tasdig'i talab qilinmaydi.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
