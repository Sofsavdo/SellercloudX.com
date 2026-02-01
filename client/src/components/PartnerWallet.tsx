import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Wallet, ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/currency';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'commission' | 'withdrawal';
  amount: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export function PartnerWallet() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const { data: walletData, isLoading } = useQuery({
    queryKey: ['/api/partner/wallet'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/partner/wallet');
      return response.json();
    },
  });

  const balance = walletData?.balance || '0';
  const pending = walletData?.pending || '0';
  const earned = walletData?.totalEarned || '0';
  const transactions: Transaction[] = walletData?.transactions || [];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income': return <ArrowUpRight className="w-4 h-4 text-success" />;
      case 'commission': return <TrendingUp className="w-4 h-4 text-primary" />;
      case 'expense': return <ArrowDownRight className="w-4 h-4 text-destructive" />;
      case 'withdrawal': return <ArrowDownRight className="w-4 h-4 text-warning" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default" className="bg-success">To'landi</Badge>;
      case 'pending': return <Badge variant="secondary">Kutilmoqda</Badge>;
      case 'failed': return <Badge variant="destructive">Bekor</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-24 bg-slate-200 rounded"></div>
              <div className="h-24 bg-slate-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-premium">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Mavjud Balans</p>
                <h3 className="text-3xl font-bold">{formatCurrency(balance)}</h3>
                <p className="text-xs text-muted-foreground mt-2">Yechib olish mumkin</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
            <Button className="w-full mt-4" size="sm">Yechib olish</Button>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Kutilayotgan</p>
                <h3 className="text-3xl font-bold">{formatCurrency(pending)}</h3>
                <p className="text-xs text-muted-foreground mt-2">Jarayonda</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Jami Daromad</p>
                <h3 className="text-3xl font-bold">{formatCurrency(earned)}</h3>
                <p className="text-xs text-success mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Umumiy
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Tranzaksiyalar Tarixi</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Tranzaksiyalar yo'q</h3>
              <p className="text-muted-foreground">Hali hech qanday tranzaksiya yo'q</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      tx.type === 'income' || tx.type === 'commission' ? 'text-success' : 'text-destructive'
                    }`}>
                      {tx.type === 'income' || tx.type === 'commission' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    {getStatusBadge(tx.status)}
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
