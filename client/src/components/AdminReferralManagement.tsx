// Admin Referral Management Component
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Gift, Users, DollarSign, Settings, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function AdminReferralManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bonusRates, setBonusRates] = useState({
    tier: 'basic',
    commissionRate: 5,
    bonus: 10000
  });

  // Get referral stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-referral-stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/referrals/stats');
      return response.json();
    }
  });

  // Get earnings
  const { data: earningsData } = useQuery({
    queryKey: ['admin-referral-earnings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/referrals/earnings');
      return response.json();
    }
  });

  // Update bonus rates
  const updateBonusRatesMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', '/api/admin/referrals/bonus-rates', data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Bonus rates yangilandi' });
      queryClient.invalidateQueries({ queryKey: ['admin-referral-stats'] });
    },
    onError: (error: Error) => {
      toast({ title: '❌ Xatolik', description: error.message, variant: 'destructive' });
    }
  });

  // Approve payment
  const approvePaymentMutation = useMutation({
    mutationFn: async (earningId: string) => {
      const response = await apiRequest('POST', `/api/admin/referrals/approve-payment/${earningId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: '✅ To\'lov tasdiqlandi' });
      queryClient.invalidateQueries({ queryKey: ['admin-referral-earnings'] });
    },
    onError: (error: Error) => {
      toast({ title: '❌ Xatolik', description: error.message, variant: 'destructive' });
    }
  });

  const handleUpdateBonusRates = () => {
    updateBonusRatesMutation.mutate(bonusRates);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Yuklanmoqda...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jami Referrallar</p>
                <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktiv Referrallar</p>
                <p className="text-2xl font-bold">{stats?.activeReferrals || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jami Bonuslar</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.totalEarnings || 0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Referrerlar</p>
                <p className="text-2xl font-bold">{stats?.topReferrers?.length || 0}</p>
              </div>
              <Gift className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bonus Rates Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Bonus Rates Sozlash
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tier">Tarif</Label>
              <select
                id="tier"
                value={bonusRates.tier}
                onChange={(e) => setBonusRates({ ...bonusRates, tier: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="free_starter">Free Starter</option>
                <option value="basic">Basic</option>
                <option value="starter_pro">Starter Pro</option>
                <option value="professional">Professional</option>
                <option value="enterprise_elite">Enterprise Elite</option>
              </select>
            </div>
            <div>
              <Label htmlFor="commissionRate">Komissiya %</Label>
              <Input
                id="commissionRate"
                type="number"
                value={bonusRates.commissionRate}
                onChange={(e) => setBonusRates({ ...bonusRates, commissionRate: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="bonus">Bonus (so'm)</Label>
              <Input
                id="bonus"
                type="number"
                value={bonusRates.bonus}
                onChange={(e) => setBonusRates({ ...bonusRates, bonus: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <Button 
            onClick={handleUpdateBonusRates}
            disabled={updateBonusRatesMutation.isPending}
          >
            {updateBonusRatesMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saqlanmoqda...
              </>
            ) : (
              'Saqlash'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Top Referrers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Referrerlar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>O'rin</TableHead>
                <TableHead>Hamkor</TableHead>
                <TableHead>Referrallar</TableHead>
                <TableHead>Jami Bonus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.topReferrers?.map((referrer: any, index: number) => (
                <TableRow key={referrer.partnerId}>
                  <TableCell>#{index + 1}</TableCell>
                  <TableCell>{referrer.businessName}</TableCell>
                  <TableCell>{referrer.referralCount}</TableCell>
                  <TableCell>{formatCurrency(referrer.totalEarnings)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Earnings Management */}
      <Card>
        <CardHeader>
          <CardTitle>Bonus To'lovlari</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referrer</TableHead>
                <TableHead>Referred</TableHead>
                <TableHead>Miqdor</TableHead>
                <TableHead>Holat</TableHead>
                <TableHead>Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earningsData?.earnings?.map((earning: any) => (
                <TableRow key={earning.id}>
                  <TableCell>{earning.referrer_name}</TableCell>
                  <TableCell>{earning.referred_name}</TableCell>
                  <TableCell>{formatCurrency(earning.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={earning.status === 'paid' ? 'default' : 'secondary'}>
                      {earning.status === 'paid' ? 'To\'langan' : 'Kutilmoqda'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {earning.status !== 'paid' && (
                      <Button
                        size="sm"
                        onClick={() => approvePaymentMutation.mutate(earning.id)}
                        disabled={approvePaymentMutation.isPending}
                      >
                        {approvePaymentMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0
  }).format(amount);
}

