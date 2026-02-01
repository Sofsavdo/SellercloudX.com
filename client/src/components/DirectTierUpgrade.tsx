// Direct Tier Upgrade - To'lov qilib avtomatik tarif almashish
// Kompakt bir ekranga sig'adigan dizayn
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { CheckCircle, Crown, Sparkles, Zap, CreditCard, Loader2, ArrowRight, Bot, X } from 'lucide-react';
import { PRICING_TIERS, getTierById } from '@/constants/pricing';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
    <div className="space-y-4">
      {/* AI Upgrade Prompt for Free Users */}
      {showAIUpgradePrompt && (
        <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg flex items-center gap-3">
          <Bot className="w-5 h-5 text-warning flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">AI limitingiz tugadi! ({aiCardsUsed}/{FREE_AI_LIMIT})</p>
          </div>
          <Button size="sm" onClick={() => handleSelectTier('basic')} className="gap-1">
            <Sparkles className="w-3 h-3" /> Yangilash
          </Button>
        </div>
      )}

      {/* Current Tier - Compact */}
      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-primary" />
          <span className="font-medium">Joriy: {currentTierData?.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{currentTierData?.priceSom}</span>
          <Badge variant="outline" className="text-xs">{currentTierData?.badge}</Badge>
        </div>
      </div>

      {/* Available Tiers - 2x2 Compact Grid */}
      <div className="grid grid-cols-2 gap-3">
        {PRICING_TIERS.map((tier, index) => {
          const isCurrent = tier.id === currentTierData?.id;
          const isLower = index < currentIndex;
          const Icon = tier.popular ? Sparkles : tier.id === 'professional' ? Crown : Zap;

          return (
            <div
              key={tier.id}
              className={`
                p-3 rounded-lg border transition-all
                ${isCurrent ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                ${tier.popular ? 'ring-1 ring-primary/30' : ''}
                ${isLower ? 'opacity-50' : ''}
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">{tier.name}</span>
                </div>
                {tier.popular && <Badge className="text-[10px] px-1.5 py-0">MASHHUR</Badge>}
              </div>
              
              <p className="text-lg font-bold mb-1">{tier.priceSom}</p>
              <p className="text-[10px] text-muted-foreground mb-2">{tier.commission}</p>
              
              <div className="text-[10px] text-muted-foreground space-y-0.5 mb-2">
                {tier.limits.slice(0, 2).map((limit, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <CheckCircle className="w-2.5 h-2.5 text-primary" />
                    <span>{limit.text}</span>
                  </div>
                ))}
              </div>

              {isCurrent ? (
                <Button size="sm" className="w-full h-7 text-xs" disabled>
                  <CheckCircle className="w-3 h-3 mr-1" /> Joriy
                </Button>
              ) : isLower ? (
                <Button size="sm" variant="ghost" className="w-full h-7 text-xs" disabled>
                  Pastroq
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant={tier.popular ? 'default' : 'outline'}
                  className="w-full h-7 text-xs"
                  onClick={() => handleSelectTier(tier.id)}
                >
                  Tanlash <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment Modal - Compact Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <CreditCard className="w-4 h-4" />
              {selectedTierData?.name} tarifiga o'tish
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Tarif</span>
                <span className="font-medium">{selectedTierData?.name}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Jami</span>
                <span className="text-lg font-bold text-primary">{selectedTierData?.priceSom}</span>
              </div>
            </div>

            {/* Payment Methods - Horizontal */}
            <div>
              <Label className="text-xs font-medium mb-2 block">To'lov usuli</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="flex gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <div 
                    key={method.id} 
                    className={`flex-1 flex items-center justify-center gap-1.5 p-2 border rounded cursor-pointer transition-colors
                      ${paymentMethod === method.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}
                    `}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                    <span>{method.logo}</span>
                    <span className="text-xs font-medium">{method.name}</span>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={handlePayment} 
                disabled={upgradeMutation.isPending}
                className="flex-1 gap-1.5"
                size="sm"
              >
                {upgradeMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CreditCard className="w-3 h-3" />
                )}
                To'lov qilish
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowPayment(false);
                  setSelectedTier(null);
                }}
              >
                Bekor
              </Button>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              To'lov muvaffaqiyatli bo'lgach tarif avtomatik yangilanadi
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
