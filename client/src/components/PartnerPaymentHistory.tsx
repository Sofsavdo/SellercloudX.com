import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, CheckCircle, Clock, XCircle, Download } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/currency';

interface Payment {
  id: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
  createdAt: string;
  completedAt?: string;
}

export function PartnerPaymentHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/partner/payment-history'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/partner/payment-history');
      return response.json();
    },
  });

  const payments: Payment[] = data?.payments || [];
  const grouped = data?.grouped || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success"><CheckCircle className="w-3 h-3 mr-1" />To'landi</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Kutilmoqda</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Bekor</Badge>;
      case 'refunded':
        return <Badge variant="outline">Qaytarildi</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    const methods: Record<string, { label: string; color: string }> = {
      click: { label: 'Click', color: 'bg-blue-500' },
      payme: { label: 'Payme', color: 'bg-purple-500' },
      uzcard: { label: 'Uzcard', color: 'bg-green-500' },
      stripe: { label: 'Stripe', color: 'bg-indigo-500' },
      bank_transfer: { label: 'Bank', color: 'bg-slate-500' },
    };
    const m = methods[method] || { label: method, color: 'bg-slate-500' };
    return <Badge className={m.color}>{m.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-premium">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Jami To'lovlar</p>
            <h3 className="text-2xl font-bold">
              {payments.filter(p => p.status === 'completed').length}
            </h3>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Jami Summa</p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(
                payments
                  .filter(p => p.status === 'completed')
                  .reduce((sum, p) => sum + parseFloat(p.amount), 0)
                  .toString()
              )}
            </h3>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Kutilmoqda</p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(
                payments
                  .filter(p => p.status === 'pending')
                  .reduce((sum, p) => sum + parseFloat(p.amount), 0)
                  .toString()
              )}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>To'lovlar Tarixi</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">To'lovlar yo'q</h3>
              <p className="text-muted-foreground">Hali hech qanday to'lov amalga oshirilmagan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{payment.description || "To'lov"}</h4>
                      {getPaymentMethodBadge(payment.paymentMethod)}
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(payment.createdAt).toLocaleDateString('uz-UZ')}
                      </span>
                      {payment.transactionId && (
                        <span className="font-mono text-xs">ID: {payment.transactionId}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-muted-foreground">{payment.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
