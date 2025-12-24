// Referral Dashboard Component
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  Copy, 
  Check,
  TrendingUp,
  Gift,
  Share2,
  Award
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  referralCode: string;
  referralLink: string;
}

interface ReferralEarning {
  id: string;
  earningType: string;
  amount: number;
  status: string;
  createdAt: string;
  referredPartner?: {
    businessName: string;
    tier: string;
  };
}

export function ReferralDashboardNew() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Fetch referral stats
  const { data: stats, isLoading: statsLoading } = useQuery<ReferralStats>({
    queryKey: ['/api/referrals/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/referrals/stats');
      return response.json();
    },
  });

  // Fetch earnings
  const { data: earnings = [], isLoading: earningsLoading } = useQuery<ReferralEarning[]>({
    queryKey: ['/api/referrals/earnings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/referrals/earnings');
      return response.json();
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Nusxalandi!",
      description: "Referral link nusxalandi",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocial = (platform: string) => {
    const text = `SellerCloudX bilan marketplace'da savdo qiling! Mening referral linkimdan ro'yxatdan o'ting: ${stats?.referralLink}`;
    const urls: Record<string, string> = {
      telegram: `https://t.me/share/url?url=${encodeURIComponent(stats?.referralLink || '')}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(stats?.referralLink || '')}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
  };

  const getEarningTypeBadge = (type: string) => {
    const types: Record<string, { text: string; color: string }> = {
      signup_bonus: { text: 'Ro\'yxat Bonusi', color: 'bg-green-100 text-green-700' },
      commission_share: { text: 'Komissiya Ulushi', color: 'bg-blue-100 text-blue-700' },
      milestone: { text: 'Milestone Bonus', color: 'bg-purple-100 text-purple-700' },
    };

    const config = types[type] || { text: type, color: 'bg-gray-100 text-gray-700' };
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { text: string; variant: any }> = {
      pending: { text: 'Kutilmoqda', variant: 'secondary' },
      approved: { text: 'Tasdiqlandi', variant: 'default' },
      paid: { text: 'To\'landi', variant: 'default' },
      cancelled: { text: 'Bekor qilindi', variant: 'outline' },
    };

    const config = statuses[status] || statuses.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  if (statsLoading || earningsLoading) {
    return <div>Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Jami Referrallar</div>
                <div className="text-3xl font-bold">{stats?.totalReferrals || 0}</div>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Faol Referrallar</div>
                <div className="text-3xl font-bold">{stats?.activeReferrals || 0}</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Jami Daromad</div>
                <div className="text-3xl font-bold">${stats?.totalEarnings || 0}</div>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Kutilayotgan</div>
                <div className="text-3xl font-bold">${stats?.pendingEarnings || 0}</div>
              </div>
              <Gift className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Sizning Referral Kodingiz
            </label>
            <div className="flex gap-2">
              <Input
                value={stats?.referralCode || ''}
                readOnly
                className="font-mono text-lg"
              />
              <Button
                onClick={() => copyToClipboard(stats?.referralCode || '')}
                variant="outline"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Referral Link
            </label>
            <div className="flex gap-2">
              <Input
                value={stats?.referralLink || ''}
                readOnly
                className="text-sm"
              />
              <Button
                onClick={() => copyToClipboard(stats?.referralLink || '')}
                variant="outline"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => shareOnSocial('telegram')}
              variant="outline"
              className="flex-1"
            >
              Telegram
            </Button>
            <Button
              onClick={() => shareOnSocial('whatsapp')}
              variant="outline"
              className="flex-1"
            >
              WhatsApp
            </Button>
            <Button
              onClick={() => shareOnSocial('facebook')}
              variant="outline"
              className="flex-1"
            >
              Facebook
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bonus Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Bonus Tuzilmasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Ro'yxat Bonuslari</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-sm text-gray-600">Free</div>
                  <div className="text-lg font-bold">$0</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <div className="text-sm text-gray-600">Basic</div>
                  <div className="text-lg font-bold text-orange-600">$10</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-sm text-gray-600">Starter</div>
                  <div className="text-lg font-bold text-blue-600">$50</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <div className="text-sm text-gray-600">Professional</div>
                  <div className="text-lg font-bold text-purple-600">$100</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Komissiya Ulushi</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Level 1 (To'g'ridan-to'g'ri)</div>
                  <div className="text-lg font-bold text-green-600">10%</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Level 2 (Bilvosita)</div>
                  <div className="text-lg font-bold text-green-600">5%</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Milestone Bonuslari</h4>
              <div className="space-y-2">
                {[
                  { count: 5, bonus: 50 },
                  { count: 10, bonus: 150 },
                  { count: 25, bonus: 500 },
                  { count: 50, bonus: 1500 },
                  { count: 100, bonus: 5000 },
                ].map((milestone) => (
                  <div key={milestone.count} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                    <span className="text-sm">{milestone.count} ta referral</span>
                    <span className="text-lg font-bold text-purple-600">${milestone.bonus}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earnings History */}
      <Card>
        <CardHeader>
          <CardTitle>Daromad Tarixi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {earnings.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Hali daromad yo'q. Referral linkingizni ulashing!
              </div>
            ) : (
              earnings.map((earning) => (
                <div key={earning.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      {getEarningTypeBadge(earning.earningType)}
                      {earning.referredPartner && (
                        <div className="text-sm text-gray-600 mt-1">
                          {earning.referredPartner.businessName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      +${earning.amount}
                    </div>
                    <div className="text-sm">
                      {getStatusBadge(earning.status)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
