/**
 * Protected Route Component
 * 
 * Himoyalangan route - faqat login qilgan hamkorlar uchun
 * Tarif tekshiruvi bilan
 */

import { ReactNode } from 'react';
import { Redirect, useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { Loader2, Lock, Crown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

// Tarif darajalari - HAQIQIY TARIFLAR
type TierLevel = 'free_starter' | 'basic' | 'starter_pro' | 'professional' | 'admin';

// Funksiya uchun kerakli minimal tarif
const FEATURE_TIERS: Record<string, TierLevel> = {
  // Bepul funksiyalar
  'partner-dashboard': 'free_starter',
  'blog': 'free_starter',
  'partner-credentials': 'free_starter',
  
  // Free Starter - cheklangan
  'ai-scanner': 'free_starter', // 10 ta limit bilan
  'product-scanner': 'free_starter',
  'uzum-scanner': 'free_starter',
  
  // Basic tarif
  'ai-dashboard': 'basic',
  'partner-ai-dashboard': 'basic',
  
  // Starter Pro tarif
  'uzum-market': 'starter_pro',
  'yandex-market': 'starter_pro',
  'yandex-scanner': 'starter_pro',
  'yandex-quick': 'starter_pro',
  'yandex-tez': 'starter_pro',
  'create-product': 'starter_pro',
  'ai-product-creator': 'starter_pro',
  'infographic': 'starter_pro',
  'infographic-generator': 'starter_pro',
  
  // Professional tarif
  'ai-manager': 'professional',
  'trend-hunter': 'professional',
  'enhanced-ai-dashboard': 'professional',
  'remote-access': 'professional',
  
  // Admin
  'admin-panel': 'admin',
};

// Tarif darajasi qiymatlari (taqqoslash uchun)
const TIER_VALUES: Record<TierLevel, number> = {
  'free_starter': 0,
  'basic': 1,
  'starter_pro': 2,
  'professional': 3,
  'admin': 99,
};

// Tarif nomlari
const TIER_NAMES: Record<TierLevel, string> = {
  'free_starter': 'Free Starter',
  'basic': 'Basic',
  'starter_pro': 'Starter Pro',
  'professional': 'Professional',
  'admin': 'Admin',
};

// Tarif narxlari
const TIER_PRICES: Record<TierLevel, string> = {
  'free_starter': 'Bepul',
  'basic': '828,000 so\'m/oy',
  'starter_pro': '4,188,000 so\'m/oy',
  'professional': '10,788,000 so\'m/oy',
  'admin': '-',
};

interface ProtectedRouteProps {
  children: ReactNode;
  requiredTier?: TierLevel;
}

export function ProtectedRoute({ children, requiredTier }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Yuklanmoqda
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }
  
  // Login qilinmagan
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  // Route nomidan kerakli tarifni aniqlash
  const routeName = location.split('/')[1] || '';
  const featureTier = requiredTier || FEATURE_TIERS[routeName] || 'free';
  
  // Foydalanuvchi tarifi
  const userTier = (user.tier || user.pricingTier || 'free') as TierLevel;
  const isAdmin = user.role === 'admin' || user.role === 'superadmin';
  
  // Admin har qanday sahifaga kira oladi
  if (isAdmin) {
    return <>{children}</>;
  }
  
  // Tarif tekshiruvi
  const userTierValue = TIER_VALUES[userTier] || 0;
  const requiredTierValue = TIER_VALUES[featureTier] || 0;
  
  if (userTierValue < requiredTierValue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-xl">Tarif yangilash kerak</CardTitle>
            <CardDescription>
              Bu funksiya <strong>{TIER_NAMES[featureTier]}</strong> tarifida mavjud.
              <br />
              Sizning tarifingiz: <strong>{TIER_NAMES[userTier]}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">{TIER_NAMES[featureTier]} tarifida:</h4>
              <p className="text-sm text-muted-foreground mb-2">{TIER_PRICES[featureTier]}</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {featureTier === 'basic' && (
                  <>
                    <li>✓ 69 ta mahsulot</li>
                    <li>✓ 69 ta AI kartochka</li>
                    <li>✓ Foyda tahlili</li>
                    <li>✓ Telegram bildirishnomalar</li>
                  </>
                )}
                {featureTier === 'starter_pro' && (
                  <>
                    <li>✓ 400 ta mahsulot</li>
                    <li>✓ Cheksiz AI kartochka</li>
                    <li>✓ Uzum & Yandex Market</li>
                    <li>✓ SEO optimallashtirish</li>
                    <li>✓ Narx monitoring</li>
                  </>
                )}
                {featureTier === 'professional' && (
                  <>
                    <li>✓ Cheksiz mahsulotlar</li>
                    <li>✓ Barcha marketplace'lar</li>
                    <li>✓ AI Manager</li>
                    <li>✓ Trend Hunter</li>
                    <li>✓ Shaxsiy menejer</li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.location.href = '/partner-dashboard'}
              >
                Orqaga
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500"
                onClick={() => window.location.href = '/partner-dashboard?upgrade=true'}
              >
                <Crown className="w-4 h-4 mr-2" />
                Yangilash
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return <>{children}</>;
}

export default ProtectedRoute;
