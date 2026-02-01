// Direct Tier Upgrade - 2026 Revenue Share Model
// Premium: $499/oy + $699 setup + 4% savdodan
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  CheckCircle, Crown, Sparkles, Shield, CreditCard, Loader2, 
  ArrowRight, Phone, MessageCircle, Users, DollarSign, Percent
} from 'lucide-react';
import { 
  PRICING_TIERS, getTierById, 
  USD_TO_UZS, PREMIUM_MONTHLY_USD, PREMIUM_SETUP_USD, PREMIUM_REVENUE_SHARE 
} from '@/constants/pricing';
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

export function DirectTierUpgrade({ currentTier, partnerId }: DirectTierUpgradeProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('click');
  const [paymentType, setPaymentType] = useState<'setup' | 'monthly'>('setup');

  const currentTierData = getTierById(currentTier);
  const isPremium = currentTierData?.id === 'premium';

  // Process payment
  const upgradeMutation = useMutation({
    mutationFn: async (data: { paymentType: string; paymentMethod: string }) => {
      const response = await apiRequest('POST', '/api/billing/revenue-share/payment', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Muvaffaqiyatli!',
        description: 'To\'lov qabul qilindi!',
      });
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

  const handlePayment = () => {
    upgradeMutation.mutate({
      paymentType,
      paymentMethod,
    });
  };

  const formatUzs = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  return (
    <div className="space-y-6">
      {/* 2026 Revenue Share Model Info */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              2026 Premium Model
            </CardTitle>
            <Badge className="bg-accent text-accent-foreground">
              <Shield className="w-3 h-3 mr-1" />
              60-kun kafolat
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pricing Breakdown */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Bir martalik sozlash</p>
              <p className="text-xl font-bold text-foreground">${PREMIUM_SETUP_USD}</p>
              <p className="text-xs text-muted-foreground">{formatUzs(PREMIUM_SETUP_USD * USD_TO_UZS)}</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-sm text-muted-foreground">Oylik to'lov</p>
              <p className="text-xl font-bold text-foreground">${PREMIUM_MONTHLY_USD}</p>
              <p className="text-xs text-muted-foreground">{formatUzs(PREMIUM_MONTHLY_USD * USD_TO_UZS)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Savdodan ulush</p>
              <p className="text-xl font-bold text-accent">{PREMIUM_REVENUE_SHARE * 100}%</p>
              <p className="text-xs text-muted-foreground">Har oyning oxirida</p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-2">
            {[
              'Cheksiz AI kartochka',
              'Barcha marketplace',
              '60-kun kafolat',
              'Sof foyda analitikasi',
              'Trend Hunter FULL',
              '24/7 support',
              'Nano Banana infografika',
              'MXIK avtomatik',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Guarantee Badge */}
          <div className="p-3 bg-success/10 rounded-lg border border-success/30 flex items-center gap-3">
            <Shield className="w-6 h-6 text-success" />
            <div>
              <p className="font-semibold text-success">60-KUN KAFOLAT</p>
              <p className="text-xs text-muted-foreground">
                Savdo o'smasa, oylik to'lovning bir qismini qaytaramiz
              </p>
            </div>
          </div>

          {/* Payment Buttons */}
          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-gradient-to-r from-primary to-accent"
              onClick={() => {
                setPaymentType('setup');
                setShowPayment(true);
              }}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Setup To'lash (${PREMIUM_SETUP_USD})
            </Button>
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => {
                setPaymentType('monthly');
                setShowPayment(true);
              }}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Oylik To'lash (${PREMIUM_MONTHLY_USD})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Individual Tariff - for large sellers */}
      <Card className="border border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Individual Tarif</h3>
                <p className="text-sm text-muted-foreground">Katta sotuvchilar uchun maxsus</p>
              </div>
            </div>
            <Badge variant="outline" className="border-primary text-primary">
              VIP
            </Badge>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Setup:</span>
              <span className="font-bold">$1599+ (kelishiladi)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Revenue Share:</span>
              <span className="font-bold text-primary">2% dan</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Oylik savdo $50,000+ bo'lgan sotuvchilar uchun maxsus shartlar, 
            shaxsiy menejer va SLA kafolati.
          </p>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.open('https://t.me/sellercloudx_support', '_blank')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Telegram
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.open('tel:+998901234567', '_blank')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Qo'ng'iroq
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {paymentType === 'setup' ? 'Setup To\'lov' : 'Oylik To\'lov'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Amount */}
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">To'lov summasi</p>
              <p className="text-3xl font-bold">
                ${paymentType === 'setup' ? PREMIUM_SETUP_USD : PREMIUM_MONTHLY_USD}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatUzs((paymentType === 'setup' ? PREMIUM_SETUP_USD : PREMIUM_MONTHLY_USD) * USD_TO_UZS)}
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <Label className="text-sm font-medium mb-2 block">To'lov usuli</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <div key={method.id}>
                    <RadioGroupItem value={method.id} id={method.id} className="peer sr-only" />
                    <Label
                      htmlFor={method.id}
                      className="flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                    >
                      <span className="text-2xl">{method.logo}</span>
                      <span className="text-xs mt-1">{method.name}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Pay Button */}
            <Button 
              className="w-full" 
              size="lg"
              onClick={handlePayment}
              disabled={upgradeMutation.isPending}
            >
              {upgradeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  To'lov jarayonida...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  To'lash
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
