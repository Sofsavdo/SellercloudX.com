import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  pricingTier: string;
  billingPeriod: string;
  onSuccess?: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  pricingTier,
  billingPeriod,
  onSuccess
}: PaymentModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('click');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const paymentProviders = [
    {
      id: 'click',
      name: 'Click',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Barcha kartalar (Uzcard, Humo, Visa, Mastercard)'
    },
    {
      id: 'payme',
      name: 'Payme',
      icon: <Wallet className="w-6 h-6" />,
      description: 'Payme orqali to\'lov'
    },
    {
      id: 'uzcard',
      name: 'Uzcard',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Uzcard va Humo kartalari'
    }
  ];

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Click API endpoint
      const response = await fetch('/api/click/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          tier: pricingTier,
          billingPeriod,
          returnUrl: window.location.origin + '/payment/success'
        })
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        // Redirect to Click payment gateway
        window.location.href = data.paymentUrl;
      } else {
        toast({
          title: 'Xatolik',
          description: data.error || 'To\'lov yaratishda xatolik',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Xatolik',
        description: 'To\'lov tizimiga ulanishda xatolik',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">To'lov qilish</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tarif:</span>
                <span className="font-semibold">{pricingTier}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Muddat:</span>
                <span className="font-semibold">{billingPeriod}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Jami:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatAmount(amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">To'lov usulini tanlang:</Label>
            <RadioGroup value={selectedProvider} onValueChange={setSelectedProvider}>
              {paymentProviders.map((provider) => (
                <div
                  key={provider.id}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedProvider === provider.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <RadioGroupItem value={provider.id} id={provider.id} />
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="text-blue-600">{provider.icon}</div>
                    <div className="flex-1">
                      <Label
                        htmlFor={provider.id}
                        className="font-semibold cursor-pointer"
                      >
                        {provider.name}
                      </Label>
                      <p className="text-sm text-gray-500">{provider.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800">
                  Xavfsiz to'lov
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Barcha to'lovlar shifrlangan kanal orqali amalga oshiriladi. Sizning
                  karta ma'lumotlaringiz xavfsiz saqlanadi.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Kutilmoqda...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  To'lovga o'tish
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
