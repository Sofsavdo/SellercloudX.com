import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Gift, Users, DollarSign, TrendingUp, Copy, CheckCircle, Share2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

export function PartnerReferralSystem() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['/api/partner/referrals/dashboard'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/partner/referrals/dashboard');
      return response.json();
    },
  });

  const stats = data?.stats || {};
  const referralLink = data?.referralLink || '';
  const referralCode = data?.referralCode || '';
  const referrals = data?.referrals || [];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: 'Nusxalandi!', description: 'Referral link nusxalandi' });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'SellerCloudX - E-commerce Automation',
        text: "Mening tavsiyam bilan SellerCloudX'ga qo'shiling!",
        url: referralLink,
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-slate-200 rounded"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-premium">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Jami Referrallar</p>
                <h3 className="text-3xl font-bold">{stats.totalReferrals || 0}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Faol</p>
                <h3 className="text-3xl font-bold">{stats.activeReferrals || 0}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Jami Daromad</p>
                <h3 className="text-2xl font-bold">{formatCurrency(stats.totalEarnings || '0')}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Konversiya</p>
                <h3 className="text-3xl font-bold">{stats.conversionRate || '0'}%</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link Card */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Sizning Referral Linkingiz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="font-mono text-sm" />
            <Button onClick={copyToClipboard} variant="outline" size="icon">
              {copied ? <CheckCircle className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button onClick={shareLink} variant="outline" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono">Kod: {referralCode}</Badge>
            <p className="text-sm text-muted-foreground">
              Bu linkni do'stlaringiz bilan ulashing va har bir ro'yxatdan o'tgan foydalanuvchi uchun komissiya oling!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Referrallar Ro'yxati</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Hali referrallar yo'q</h3>
              <p className="text-muted-foreground">Linkingizni ulashing va birinchi referrallaringizni qo'shing!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((ref: any) => (
                <div key={ref.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-semibold">{ref.referredUsername || 'Foydalanuvchi'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ref.createdAt).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>
                  <Badge variant={ref.status === 'active' ? 'default' : 'secondary'}>
                    {ref.status === 'active' ? 'Faol' : ref.status === 'pending' ? 'Kutilmoqda' : 'Nofaol'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
