// Subscription Management Component
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle 
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { SAAS_PRICING_TIERS } from '@/lib/pricingConfig';

interface Subscription {
  id: string;
  tierId: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export function SubscriptionManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Fetch subscription
  const { data: subscription, isLoading } = useQuery<Subscription>({
    queryKey: ['/api/subscription/current'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/subscription/current');
      return response.json();
    },
  });

  // Cancel subscription
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/subscription/cancel');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Obuna bekor qilindi",
        description: "Obunangiz keyingi to'lov sanasida tugaydi",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/current'] });
    },
  });

  // Toggle auto-renew
  const toggleAutoRenewMutation = useMutation({
    mutationFn: async (autoRenew: boolean) => {
      const response = await apiRequest('PUT', '/api/subscription/auto-renew', { autoRenew });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sozlamalar saqlandi",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/current'] });
    },
  });

  if (isLoading) {
    return <div>Yuklanmoqda...</div>;
  }

  if (!subscription) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Obuna topilmadi. Iltimos, tarif tanlang.
        </AlertDescription>
      </Alert>
    );
  }

  const tier = SAAS_PRICING_TIERS[subscription.tierId as keyof typeof SAAS_PRICING_TIERS];
  const nextPaymentDate = new Date(subscription.endDate);
  const daysUntilPayment = Math.ceil((nextPaymentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Obuna Ma'lumotlari
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Tier */}
          <div>
            <div className="text-sm text-gray-600 mb-1">Joriy Tarif</div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold">{tier?.name || subscription.tierId}</div>
              <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                {subscription.status === 'active' ? 'Faol' : subscription.status}
              </Badge>
            </div>
            <div className="text-lg text-gray-600 mt-1">
              ${tier?.monthlyFeeUSD || 0}/oy
            </div>
          </div>

          {/* Next Payment */}
          <div>
            <div className="text-sm text-gray-600 mb-1">Keyingi To'lov</div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-lg font-semibold">
                {nextPaymentDate.toLocaleDateString('uz-UZ')}
              </span>
              <span className="text-sm text-gray-600">
                ({daysUntilPayment} kun qoldi)
              </span>
            </div>
          </div>

          {/* Auto Renew */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-semibold">Avtomatik Yangilanish</div>
              <div className="text-sm text-gray-600">
                Obuna avtomatik ravishda yangilanadi
              </div>
            </div>
            <Button
              variant={subscription.autoRenew ? "default" : "outline"}
              onClick={() => toggleAutoRenewMutation.mutate(!subscription.autoRenew)}
              disabled={toggleAutoRenewMutation.isPending}
            >
              {subscription.autoRenew ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Yoqilgan
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  O'chirilgan
                </>
              )}
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={() => setShowUpgrade(true)}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Tarifni Oshirish
            </Button>
            
            {subscription.status === 'active' && (
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm('Obunani bekor qilmoqchimisiz?')) {
                    cancelMutation.mutate();
                  }
                }}
                disabled={cancelMutation.isPending}
              >
                Bekor Qilish
              </Button>
            )}
          </div>

          {/* Warning for cancelled */}
          {subscription.status === 'cancelled' && (
            <Alert variant="warning">
              <AlertCircle className="h-4 h-4" />
              <AlertDescription>
                Obunangiz {nextPaymentDate.toLocaleDateString('uz-UZ')} sanasida tugaydi.
                Davom ettirish uchun tarifni qayta faollashtiring.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Modal would go here */}
    </div>
  );
}
