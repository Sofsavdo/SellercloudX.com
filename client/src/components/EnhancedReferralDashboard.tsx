// Enhanced Referral Dashboard - Mukammal foyda tahlili va ko'rsatkichlar
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Gift, Copy, Users, CheckCircle, TrendingUp, DollarSign, Target, Info, Share2, ExternalLink } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function EnhancedReferralDashboard() {
  const { toast } = useToast();
  const [referralLink, setReferralLink] = useState('');

  // Get referral stats
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/referrals/stats');
        return response.json();
      } catch (error) {
        return {
          totalReferrals: 0,
          activeReferrals: 0,
          totalEarned: 0,
          referralCode: '',
          tier: 'bronze',
          tierName: 'Bronze',
          tierIcon: '🥉',
          tierProgress: { current: 0, next: 10, percentage: 0, remaining: 10 },
          available: 0,
          canWithdraw: false,
          commission: 10,
          nextTierBonus: 0,
          benefits: {
            forNewUser: { discount: 5, message: 'Ro\'yxatdan o\'tganingizda $5 chegirma' },
            forReferrer: { commission: 2.90, message: 'Har bir taklif qilingan hamkor uchun har oy $2.90 bonus' }
          },
          howItWorks: []
        };
      }
    },
  });

  // Generate referral link
  const generateLink = async () => {
    try {
      const response = await apiRequest('POST', '/api/referrals/generate-code');
      const data = await response.json();
      const link = `${window.location.origin}/partner-registration?ref=${data.promoCode}`;
      setReferralLink(link);
      toast({
        title: '✅ Havola yaratildi',
        description: 'Havolani nusxalang va ulashing'
      });
      refetch();
    } catch (error) {
      toast({
        title: '❌ Xatolik',
        description: 'Havola yaratishda xatolik',
        variant: 'destructive'
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: '✅ Nusxalandi',
      description: 'Havola nusxalandi'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Yuklanmoqda...</p>
        </CardContent>
      </Card>
    );
  }

  const promoCode = stats?.promoCode || stats?.referralCode || '';
  const shareUrl = promoCode ? `${window.location.origin}/partner-registration?ref=${promoCode}` : '';

  return (
    <div className="space-y-6">
      {/* Main Stats Card */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-purple-600" />
            Referral Dasturi
            <Badge variant="outline" className="ml-auto">
              {stats?.commissionRate || 10}% Komissiya
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
                <div className="text-xs text-muted-foreground">Jami Taklif</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{stats?.activeReferrals || 0}</div>
                <div className="text-xs text-muted-foreground">Aktiv</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">${stats?.totalEarned?.toFixed(2) || '0.00'}</div>
                <div className="text-xs text-muted-foreground">Jami Daromad</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">${stats?.available?.toFixed(2) || '0.00'}</div>
                <div className="text-xs text-muted-foreground">Mavjud</div>
              </CardContent>
            </Card>
          </div>

          {/* Commission Info */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-bold">Komissiya Tizimi</span>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Har bir taklif qilingan hamkor uchun <strong>oylik to'lovning 10%</strong> komissiya olasiz!
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded">
                  <div className="font-semibold text-gray-600">Basic ($69/oy)</div>
                  <div className="text-green-600 font-bold">$6.90/oy</div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="font-semibold text-gray-600">Starter Pro ($349/oy)</div>
                  <div className="text-green-600 font-bold">$34.90/oy</div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="font-semibold text-gray-600">Professional ($899/oy)</div>
                  <div className="text-green-600 font-bold">$89.90/oy</div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="font-semibold text-gray-600">O'rtacha</div>
                  <div className="text-blue-600 font-bold">${stats?.avgCommissionPerReferral || '0.00'}/oy</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Promo Code Section */}
          {promoCode ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Sizning promo kodingiz:</label>
              <div className="flex gap-2">
                <Input
                  value={promoCode}
                  readOnly
                  className="font-mono text-lg font-bold"
                />
                <Button
                  onClick={() => copyToClipboard(promoCode)}
                  variant="outline"
                  size="icon"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Share URL */}
              {shareUrl && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Havola:</label>
                  <div className="flex gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      onClick={() => copyToClipboard(shareUrl)}
                      variant="outline"
                      size="icon"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('SellerCloudX bilan qo\'shiling va $5 chegirma oling!')}`, '_blank')}
                      variant="outline"
                      size="icon"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button onClick={generateLink} className="w-full" size="lg">
              <Gift className="w-5 h-5 mr-2" />
              Promo Kod Yaratish
            </Button>
          )}

          {/* Benefits Section */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Gift className="w-4 h-4 text-green-600" />
                  Ro'yxatdan O'tuvchiga Foyda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">${stats?.benefits?.forNewUser?.discount || 5} chegirma</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">3 kunlik bepul trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Barcha funksiyalar bilan</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  Sizga Foyda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">
                    Har oy ${stats?.benefits?.forReferrer?.commission?.toFixed(2) || '2.90'} komissiya
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">
                    {stats?.commissionRate || 10}% komissiya darajasi
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">
                    O'rtacha: ${stats?.avgCommissionPerReferral || '0.00'}/oy har bir taklif uchun
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          {stats?.howItWorks && stats.howItWorks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Qanday Ishlaydi?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm">
                  {stats.howItWorks.map((step: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="font-bold text-purple-600">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Withdrawal Button */}
          {stats?.canWithdraw && (
            <Button 
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              size="lg"
              onClick={() => {
                toast({
                  title: '💰 Pul Yechish',
                  description: `Mavjud balans: $${stats.available.toFixed(2)}. Admin panel orqali so'rov yuboring.`
                });
              }}
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Pul Yechish (${stats.available.toFixed(2)})
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

