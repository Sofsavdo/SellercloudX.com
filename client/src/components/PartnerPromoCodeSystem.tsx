// Enhanced Referral System with Promo Codes
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Gift, Users, DollarSign, TrendingUp, Copy, CheckCircle, 
  Share2, Ticket, RefreshCw, Sparkles
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

export function PartnerPromoCodeSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['/api/partner/referrals/dashboard'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/partner/referrals/dashboard');
      return response.json();
    },
  });

  // Generate new promo code
  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/partner/referrals/generate-promo-code');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Muvaffaqiyatli!', description: 'Yangi promo kod yaratildi' });
      queryClient.invalidateQueries({ queryKey: ['/api/partner/referrals/dashboard'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Xatolik', description: error.message, variant: 'destructive' });
    },
  });

  const stats = data?.stats || {};
  const referralLink = data?.referralLink || '';
  const promoCode = data?.promoCode || '';
  const referrals = data?.referrals || [];

  const copyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopiedCode(true);
    toast({ title: 'Nusxalandi!', description: 'Promo kod nusxalandi' });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast({ title: 'Nusxalandi!', description: 'Referral link nusxalandi' });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const sharePromo = () => {
    const text = `🎁 SellerCloudX'ga qo'shiling va maxsus chegirmadan foydalaning!\n\nPromo kod: ${promoCode}\n\nYoki link: ${referralLink}\n\nAI yordamida e-commerce biznesingizni avtomatlashtiring!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'SellerCloudX - Maxsus Taklif',
        text,
        url: referralLink,
      });
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: 'Nusxalandi!', description: 'Taklif matni nusxalandi' });
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

      {/* Promo Code Card - MAIN FEATURE */}
      <Card className="card-premium border-primary bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" />
            Sizning Promo Kodingiz
          </CardTitle>
          <CardDescription>
            Bu kodni do'stlaringizga bering. Ular ro'yxatdan o'tishda kiritadilar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Promo Code Display */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Input 
                value={promoCode} 
                readOnly 
                className="text-2xl font-bold text-center tracking-wider h-16 bg-background"
              />
              <Badge className="absolute -top-2 -right-2 bg-primary">
                <Sparkles className="w-3 h-3 mr-1" />
                Promo Kod
              </Badge>
            </div>
            <Button 
              size="lg" 
              onClick={copyCode}
              className="h-16 px-6"
            >
              {copiedCode ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>

          {/* Generate New Code */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-semibold">Yangi kod yaratish</p>
              <p className="text-sm text-muted-foreground">Kodingizni yangilashingiz mumkin</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => generateCodeMutation.mutate()}
              disabled={generateCodeMutation.isPending}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${generateCodeMutation.isPending ? 'animate-spin' : ''}`} />
              Yangi kod
            </Button>
          </div>

          {/* Share Button */}
          <Button onClick={sharePromo} className="w-full h-12 gap-2" variant="default">
            <Share2 className="w-5 h-5" />
            Taklif yuborish
          </Button>
        </CardContent>
      </Card>

      {/* Referral Link (Secondary) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Referral Link
          </CardTitle>
          <CardDescription>
            Link orqali ham taklif qilishingiz mumkin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="font-mono text-sm" />
            <Button onClick={copyLink} variant="outline" size="icon">
              {copiedLink ? <CheckCircle className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>Qanday ishlaydi?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h4 className="font-semibold mb-2">Promo kod ulashing</h4>
              <p className="text-sm text-muted-foreground">
                Do'stlaringizga promo kodingizni yuboring
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h4 className="font-semibold mb-2">Ro'yxatdan o'tish</h4>
              <p className="text-sm text-muted-foreground">
                Ular promo kodni kiritib ro'yxatdan o'tadilar
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h4 className="font-semibold mb-2">Bonus oling</h4>
              <p className="text-sm text-muted-foreground">
                Har bir to'lov qilgan referral uchun 10% bonus
              </p>
            </div>
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
              <p className="text-muted-foreground mb-4">
                Promo kodingizni ulashing va birinchi referrallaringizni qo'shing!
              </p>
              <Button onClick={sharePromo} className="gap-2">
                <Share2 className="w-4 h-4" />
                Hozir ulashish
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((ref: any) => (
                <div key={ref.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-semibold">{ref.referredUsername || 'Foydalanuvchi'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ref.createdAt).toLocaleDateString('uz-UZ')}
                      {ref.promoCode && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Kod: {ref.promoCode}
                        </Badge>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {ref.bonusEarned > 0 && (
                      <span className="text-success font-semibold">
                        +{formatCurrency(ref.bonusEarned)}
                      </span>
                    )}
                    <Badge variant={ref.status === 'active' ? 'default' : 'secondary'}>
                      {ref.status === 'active' ? 'Faol' : ref.status === 'pending' ? 'Kutilmoqda' : 'Nofaol'}
                    </Badge>
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
