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

// Tarif darajalari
type TierLevel = 'free' | 'start' | 'business' | 'enterprise' | 'admin';

// Funksiya uchun kerakli minimal tarif
const FEATURE_TIERS: Record<string, TierLevel> = {
  // Bepul funksiyalar
  'partner-dashboard': 'free',
  'blog': 'free',
  
  // Start tarif
  'ai-scanner': 'start',
  'product-scanner': 'start',
  'uzum-scanner': 'start',
  
  // Business tarif
  'uzum-market': 'business',
  'yandex-market': 'business',
  'yandex-scanner': 'business',
  'yandex-quick': 'business',
  'yandex-tez': 'business',
  'create-product': 'business',
  'ai-product-creator': 'business',
  'infographic': 'business',
  'infographic-generator': 'business',
  
  // Enterprise tarif
  'ai-manager': 'enterprise',
  'trend-hunter': 'enterprise',
  'enhanced-ai-dashboard': 'enterprise',
  'remote-access': 'enterprise',
  
  // Admin
  'admin-panel': 'admin',
};

// Tarif darajasi qiymatlari (taqqoslash uchun)
const TIER_VALUES: Record<TierLevel, number> = {
  'free': 0,
  'start': 1,
  'business': 2,
  'enterprise': 3,
  'admin': 99,
};

// Tarif nomlari
const TIER_NAMES: Record<TierLevel, string> = {
  'free': 'Bepul',
  'start': 'Start',
  'business': 'Business',
  'enterprise': 'Enterprise',
  'admin': 'Admin',
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
              <ul className="text-sm text-muted-foreground space-y-1">
                {featureTier === 'start' && (
                  <>
                    <li>✓ AI Scanner - mahsulot aniqlash</li>
                    <li>✓ 100 ta mahsulot/oy</li>
                  </>
                )}
                {featureTier === 'business' && (
                  <>
                    <li>✓ Uzum & Yandex Market integratsiya</li>
                    <li>✓ AI infografika yaratish</li>
                    <li>✓ Avtomatik mahsulot yaratish</li>
                    <li>✓ 1000 ta mahsulot/oy</li>
                  </>
                )}
                {featureTier === 'enterprise' && (
                  <>
                    <li>✓ AI Manager - to'liq avtomatlashtirish</li>
                    <li>✓ Trend Hunter</li>
                    <li>✓ Cheksiz mahsulotlar</li>
                    <li>✓ Priority support</li>
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
