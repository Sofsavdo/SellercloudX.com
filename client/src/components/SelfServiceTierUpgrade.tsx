import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn, formatSom } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { TIER_PRICING, getUpgradeableTiers, type TierConfig } from '@/config/tiers';
import {
  CreditCard,
  Building2,
  QrCode,
  CheckCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  Shield,
  Zap,
  Crown,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentTier: string;
  onUpgradeComplete?: () => void;
}

type PaymentMethod = 'click' | 'payme' | 'bank' | 'qr';
type BillingPeriod = 'monthly' | 'yearly';

const PAYMENT_METHODS = [
  { 
    id: 'click' as PaymentMethod, 
    name: 'Click', 
    icon: CreditCard,
    description: 'Karta orqali tez to\'lov',
    color: 'bg-blue-500',
  },
  { 
    id: 'payme' as PaymentMethod, 
    name: 'Payme', 
    icon: CreditCard,
    description: 'Payme ilovasi orqali',
    color: 'bg-cyan-500',
  },
  { 
    id: 'bank' as PaymentMethod, 
    name: 'Bank o\'tkazmasi', 
    icon: Building2,
    description: 'Hisob raqamiga o\'tkazma',
    color: 'bg-green-500',
  },
  { 
    id: 'qr' as PaymentMethod, 
    name: 'QR kod', 
    icon: QrCode,
    description: 'QR kod skanerlash',
    color: 'bg-purple-500',
  },
];

const TIER_ICONS = {
  basic: Zap,
  starter_pro: Sparkles,
  professional: Crown,
};

export function SelfServiceTierUpgrade({ 
  isOpen, 
  onClose, 
  currentTier, 
  onUpgradeComplete 
}: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('click');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const availableTiers = getUpgradeableTiers(currentTier);

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const tierConfig = TIER_PRICING[selectedTier!];
      const amount = billingPeriod === 'yearly' ? tierConfig.yearlyPrice : tierConfig.price;
      
      const response = await apiRequest('POST', '/api/payments/create-payment', {
        amount,
        pricingTier: selectedTier,
        billingPeriod,
        provider: paymentMethod,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.url) {
        // Redirect to payment gateway
        window.location.href = data.url;
      } else if (data.success && data.bankDetails) {
        // Show bank transfer details
        setStep(3);
      } else if (data.success && data.qrUrl) {
        // Show QR code
        setStep(3);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Xatolik",
        description: error.message || "To'lov yaratishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId);
    setStep(2);
  };

  const handlePayment = () => {
    if (!selectedTier) return;
    createPaymentMutation.mutate();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedTier(null);
    setPaymentMethod('click');
    setBillingPeriod('monthly');
    onClose();
  };

  const getSelectedTierConfig = (): TierConfig | null => {
    return selectedTier ? TIER_PRICING[selectedTier] : null;
  };

  const getPrice = (): number => {
    const tierConfig = getSelectedTierConfig();
    if (!tierConfig) return 0;
    return billingPeriod === 'yearly' ? tierConfig.yearlyPrice : tierConfig.price;
  };

  const getSavings = (): number => {
    const tierConfig = getSelectedTierConfig();
    if (!tierConfig || billingPeriod !== 'yearly') return 0;
    return (tierConfig.price * 12) - tierConfig.yearlyPrice;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary" />
            Tarifni O'zgartirish
          </DialogTitle>
          <DialogDescription>
            Yangi tarifni tanlang va to'lovni amalga oshiring. 
            To'lov tasdiqlanishi bilan tarif avtomatik o'zgaradi.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    "w-12 h-0.5 mx-1",
                    step > s ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Choose Tier */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">1. Tarifni tanlang</h3>
                <div className="flex gap-2">
                  <Button
                    variant={billingPeriod === 'monthly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBillingPeriod('monthly')}
                  >
                    Oylik
                  </Button>
                  <Button
                    variant={billingPeriod === 'yearly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBillingPeriod('yearly')}
                  >
                    Yillik
                    <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                      -17%
                    </Badge>
                  </Button>
                </div>
              </div>

              {availableTiers.length === 0 ? (
                <Card className="p-8 text-center">
                  <Crown className="w-12 h-12 mx-auto text-primary mb-4" />
                  <h3 className="text-lg font-semibold">Siz eng yuqori tarifdasiz!</h3>
                  <p className="text-muted-foreground mt-2">
                    Professional tarifda barcha imkoniyatlar mavjud.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availableTiers.map((tier) => {
                    const TierIcon = TIER_ICONS[tier.id as keyof typeof TIER_ICONS] || Zap;
                    const price = billingPeriod === 'yearly' ? tier.yearlyPrice : tier.price;
                    
                    return (
                      <Card
                        key={tier.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-lg relative overflow-hidden",
                          selectedTier === tier.id && "ring-2 ring-primary",
                          tier.popular && "border-primary"
                        )}
                        onClick={() => handleSelectTier(tier.id)}
                      >
                        {tier.popular && (
                          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg">
                            Mashhur
                          </div>
                        )}
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <TierIcon className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg">{tier.name}</CardTitle>
                          </div>
                          <div className="mt-2">
                            <span className="text-3xl font-bold">
                              {formatSom(price)}
                            </span>
                            <span className="text-muted-foreground">
                              /{billingPeriod === 'yearly' ? 'yil' : 'oy'}
                            </span>
                          </div>
                          {billingPeriod === 'yearly' && (
                            <p className="text-sm text-green-600">
                              {formatSom((tier.price * 12) - tier.yearlyPrice)} tejaysiz
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {tier.commission}% komissiya
                          </p>
                        </CardHeader>
                        <CardContent>
                          <Separator className="my-3" />
                          <ul className="space-y-2">
                            {tier.features.map((feature, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Choose Payment Method */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">2. To'lov usulini tanlang</h3>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  Orqaga
                </Button>
              </div>

              {/* Selected Tier Summary */}
              {selectedTier && (
                <Card className="bg-muted/50">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Tanlangan tarif:</p>
                        <p className="text-2xl font-bold text-primary">
                          {TIER_PRICING[selectedTier].name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Narx:</p>
                        <p className="text-2xl font-bold">{formatSom(getPrice())}</p>
                        {billingPeriod === 'yearly' && getSavings() > 0 && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {formatSom(getSavings())} tejash
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {PAYMENT_METHODS.map((method) => (
                  <Label
                    key={method.id}
                    htmlFor={method.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      paymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                    <div className={cn("p-3 rounded-lg", method.color)}>
                      <method.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    {paymentMethod === method.id && (
                      <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                    )}
                  </Label>
                ))}
              </RadioGroup>

              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <Shield className="w-5 h-5 text-green-500" />
                <p className="text-sm text-muted-foreground">
                  Barcha to'lovlar xavfsiz va shifrlangan. Ma'lumotlaringiz himoyalangan.
                </p>
              </div>

              <Button
                onClick={handlePayment}
                disabled={createPaymentMutation.isPending}
                size="lg"
                className="w-full"
              >
                {createPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Yuklanmoqda...
                  </>
                ) : (
                  <>
                    To'lovga O'tish
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Step 3: Payment Details (Bank/QR) */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">3. To'lov ma'lumotlari</h3>
                <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                  Orqaga
                </Button>
              </div>

              {paymentMethod === 'bank' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Bank rekvizitlari
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Korxona nomi</Label>
                        <p className="font-medium">SellerCloudX LLC</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Hisob raqami</Label>
                        <p className="font-mono font-medium">20208000000000000001</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Bank nomi</Label>
                        <p className="font-medium">Agrobank</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">MFO</Label>
                        <p className="font-mono font-medium">00873</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">INN</Label>
                        <p className="font-mono font-medium">123456789</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">To'lov maqsadi</Label>
                        <p className="font-medium">Tarif to'lovi - {TIER_PRICING[selectedTier!]?.name}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Muhim:</strong> To'lov maqsadida o'z ID raqamingizni ko'rsating. 
                        To'lov 24 soat ichida tasdiqlanadi.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {paymentMethod === 'qr' && (
                <Card className="text-center">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2">
                      <QrCode className="w-5 h-5" />
                      QR kod orqali to'lov
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="w-48 h-48 bg-muted mx-auto rounded-lg flex items-center justify-center">
                      <QrCode className="w-24 h-24 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Payme yoki Click ilovasini oching va QR kodni skanerlang
                    </p>
                    <p className="text-2xl font-bold">{formatSom(getPrice())}</p>
                  </CardContent>
                </Card>
              )}

              <Button onClick={handleClose} variant="outline" className="w-full">
                Yopish
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
