import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  Wallet,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PremiumPaymentModalProps {
  open: boolean;
  onClose: () => void;
  featureName: string;
  featureDescription: string;
  amount: number;
  featureId: string;
  onSuccess?: () => void;
}

type PaymentProvider = 'click' | 'payme' | 'uzcard';

interface PaymentStatus {
  status: 'idle' | 'processing' | 'success' | 'failed';
  message: string;
  paymentUrl?: string;
}

export default function PremiumPaymentModal({
  open,
  onClose,
  featureName,
  featureDescription,
  amount,
  featureId,
  onSuccess
}: PremiumPaymentModalProps) {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('click');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'idle',
    message: ''
  });

  const paymentProviders = [
    {
      id: 'click' as PaymentProvider,
      name: 'Click',
      icon: '💳',
      description: 'Visa, Mastercard, Humo, Uzcard'
    },
    {
      id: 'payme' as PaymentProvider,
      name: 'Payme',
      icon: '💰',
      description: 'Payme wallet'
    },
    {
      id: 'uzcard' as PaymentProvider,
      name: 'Uzcard',
      icon: '🏦',
      description: 'Uzcard cards'
    }
  ];

  const handlePayment = async () => {
    try {
      setPaymentStatus({
        status: 'processing',
        message: 'Creating payment...'
      });

      const response = await fetch('/api/premium/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          featureId,
          amount,
          provider: selectedProvider,
          description: `${featureName} - ${featureDescription}`
        })
      });

      if (!response.ok) {
        throw new Error('Payment creation failed');
      }

      const result = await response.json();

      if (result.success && result.paymentUrl) {
        setPaymentStatus({
          status: 'success',
          message: 'Redirecting to payment...',
          paymentUrl: result.paymentUrl
        });

        // Redirect to payment page
        window.open(result.paymentUrl, '_blank');

        // Start polling for payment status
        const checkPayment = setInterval(async () => {
          const statusResponse = await fetch(`/api/premium/payment/status/${result.transactionId}`);
          const statusData = await statusResponse.json();

          if (statusData.status === 'completed') {
            clearInterval(checkPayment);
            toast({
              title: 'Payment successful!',
              description: 'Your premium feature is now active'
            });
            onSuccess?.();
            onClose();
          } else if (statusData.status === 'failed') {
            clearInterval(checkPayment);
            throw new Error('Payment failed');
          }
        }, 3000);

        // Stop polling after 5 minutes
        setTimeout(() => {
          clearInterval(checkPayment);
        }, 300000);

      } else {
        throw new Error(result.error || 'Payment creation failed');
      }

    } catch (error: any) {
      setPaymentStatus({
        status: 'error',
        message: error.message || 'Payment failed'
      });
      toast({
        title: 'Payment failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const resetPayment = () => {
    setPaymentStatus({
      status: 'idle',
      message: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Premium Feature Payment</DialogTitle>
          <DialogDescription>
            Complete payment to unlock this feature
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feature Info */}
          <div className="p-4 bg-primary/5 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold">{featureName}</h4>
                <p className="text-sm text-muted-foreground">{featureDescription}</p>
              </div>
              <Badge variant="secondary" className="text-lg">
                ${amount.toFixed(2)}
              </Badge>
            </div>
          </div>

          {paymentStatus.status === 'idle' && (
            <>
              {/* Payment Provider Selection */}
              <div className="space-y-3">
                <Label>Select Payment Method</Label>
                <RadioGroup
                  value={selectedProvider}
                  onValueChange={(value) => setSelectedProvider(value as PaymentProvider)}
                >
                  {paymentProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent"
                      onClick={() => setSelectedProvider(provider.id)}
                    >
                      <RadioGroupItem value={provider.id} id={provider.id} />
                      <Label
                        htmlFor={provider.id}
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        <span className="text-2xl">{provider.icon}</span>
                        <div>
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {provider.description}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Payment Summary */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing fee:</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handlePayment}
                  className="flex-1"
                  size="lg"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Pay ${amount.toFixed(2)}
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}

          {paymentStatus.status === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <h4 className="font-semibold mb-2">{paymentStatus.message}</h4>
              <p className="text-sm text-muted-foreground">
                Please wait while we process your payment...
              </p>
            </div>
          )}

          {paymentStatus.status === 'success' && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h4 className="font-semibold mb-2">{paymentStatus.message}</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Complete the payment in the opened window
              </p>
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          )}

          {paymentStatus.status === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h4 className="font-semibold mb-2">Payment Failed</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {paymentStatus.message}
              </p>
              <div className="flex gap-2">
                <Button onClick={resetPayment} className="flex-1">
                  Try Again
                </Button>
                <Button onClick={onClose} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="text-xs text-muted-foreground text-center">
            🔒 Secure payment powered by {selectedProvider.toUpperCase()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
