// Simple Referral Dashboard - Oddiy va ishonchli
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Gift, Copy, Users, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export function SimpleReferralDashboard() {
  const { toast } = useToast();
  const [referralLink, setReferralLink] = useState('');

  // Get referral stats
  const { data: stats, isLoading } = useQuery({
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
          referralCode: ''
        };
      }
    },
  });

  // Generate referral link
  const generateLink = async () => {
    try {
      const response = await apiRequest('POST', '/api/referrals/generate-code');
      const data = await response.json();
      const link = `${window.location.origin}/register?ref=${data.referralCode}`;
      setReferralLink(link);
      toast({
        title: '✅ Havola yaratildi',
        description: 'Havolani nusxalang va ulashing'
      });
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

  return (
    <div className="space-y-4">
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-purple-600" />
            Referral Dasturi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Do'stlaringizni taklif qiling va bonus oling!
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
                <div className="text-xs text-muted-foreground">Jami</div>
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
                <Gift className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">${stats?.totalEarned || 0}</div>
                <div className="text-xs text-muted-foreground">Daromad</div>
              </CardContent>
            </Card>
          </div>

          {/* Referral Link */}
          {stats?.referralCode && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Sizning referral kodingiz:</label>
              <div className="flex gap-2">
                <Input
                  value={stats.referralCode}
                  readOnly
                  className="font-mono"
                />
                <Button
                  onClick={() => copyToClipboard(stats.referralCode)}
                  variant="outline"
                  size="icon"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Generate Link */}
          {referralLink ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Referral havola:</label>
              <div className="flex gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="text-xs"
                />
                <Button
                  onClick={() => copyToClipboard(referralLink)}
                  variant="outline"
                  size="icon"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={generateLink} className="w-full">
              Referral Havola Yaratish
            </Button>
          )}

          {/* Info */}
          <div className="p-3 bg-blue-50 rounded-lg text-sm">
            <p className="font-medium text-blue-900 mb-1">Qanday ishlaydi?</p>
            <ul className="text-blue-700 space-y-1 text-xs">
              <li>• Havolangiz orqali do'stingiz ro'yxatdan o'tadi</li>
              <li>• Do'stingiz birinchi to'lovni amalga oshiradi</li>
              <li>• Siz bonus olasiz!</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
