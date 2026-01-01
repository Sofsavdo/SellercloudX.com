// Partner Dashboard - Premium Fintech Style
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardSidebar, partnerNavItems } from '@/components/layout/DashboardSidebar';
import { DashboardHeader, QuickStatsHeader } from '@/components/ui/dashboard-header';
import { PremiumStatCard } from '@/components/ui/premium-stat-card';
import { DataCard, MiniCard } from '@/components/ui/data-card';
import { LoginForm } from '@/components/LoginForm';
import { PartnerStats } from '@/components/PartnerStats';
import { SimpleProductForm } from '@/components/SimpleProductForm';
import { ProfitDashboard } from '@/components/ProfitDashboard';
import { TrendingProductsDashboard } from '@/components/TrendingProductsDashboard';
import { TierUpgradeRequestForm } from '@/components/TierUpgradeRequestForm';
import { PartnerTierInfo } from '@/components/PartnerTierInfo';
import { ComprehensiveAnalytics } from '@/components/ComprehensiveAnalytics';
import PartnerVerificationSection from '@/components/PartnerVerificationSection';
import { InventoryManagement } from '@/components/InventoryManagement';
import { OrderManagement } from '@/components/OrderManagement';
import { MarketplaceIntegrationManager } from '@/components/MarketplaceIntegrationManager';
import { ChatSystem } from '@/components/ChatSystem';
import { EnhancedReferralDashboard } from '@/components/EnhancedReferralDashboard';
import { PartnerReferralCampaigns } from '@/components/PartnerReferralCampaigns';
import { ViralShareButton } from '@/components/ViralShareButton';
import { AchievementSystem } from '@/components/AchievementSystem';
import { useAuth } from '@/hooks/useAuth';
import { useTierAccess } from '@/hooks/useTierAccess';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currency';
import { apiRequest } from '@/lib/queryClient';
import { SAAS_PRICING_TIERS, AI_MANAGER_PLANS } from '@/lib/pricingConfig';
import {
  Package, TrendingUp, Settings, Crown, BarChart3, DollarSign, Target, Zap,
  CheckCircle, Clock, AlertTriangle, Globe, Brain, MessageCircle, Gift,
  LayoutDashboard, Sparkles, ShoppingCart, Wallet, ArrowRight
} from 'lucide-react';

interface Product { id: string; name: string; category: string; price: string; costPrice: string; sku: string; isActive: boolean; createdAt: string; }
interface Analytics { id: string; date: string; revenue: string; orders: number; profit: string; }

export default function PartnerDashboard() {
  const { user, partner, isLoading: authLoading } = useAuth();
  const tierAccess = useTierAccess();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showTierModal, setShowTierModal] = useState(false);
  const isPartner = !!user && user.role === 'partner';

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => { const res = await apiRequest('GET', '/api/products'); return res.json(); },
    enabled: isPartner,
  });

  const { data: analytics = [] } = useQuery<Analytics[]>({
    queryKey: ['/api/analytics'],
    queryFn: async () => { const res = await apiRequest('GET', '/api/analytics'); return res.json(); },
    enabled: isPartner,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) setLocation('/login');
    else if (user.role !== 'partner') setLocation('/');
  }, [user, authLoading, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'partner') {
    return <div className="min-h-screen bg-background flex items-center justify-center"><LoginForm /></div>;
  }

  const stats = {
    totalRevenue: analytics.reduce((sum, item) => sum + parseFloat(item.revenue || '0'), 0),
    totalOrders: analytics.reduce((sum, item) => sum + (item.orders || 0), 0),
    totalProfit: analytics.reduce((sum, item) => sum + parseFloat(item.profit || '0'), 0),
    activeProducts: products.filter(p => p.isActive).length,
  };

  const getTierName = (tier: string) => {
    const names: Record<string, string> = {
      free_starter: 'Free', starter_pro: 'Starter Pro', business_standard: 'Business',
      professional_plus: 'Professional', enterprise_elite: 'Enterprise'
    };
    return names[tier] || tier;
  };

  return (
    <div className="dashboard-layout flex">
      <DashboardSidebar
        items={partnerNavItems}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
        userRole="partner"
        userName={user.firstName || user.username}
        userPlan={getTierName(partner?.pricingTier || 'free_starter')}
      />

      <main className="dashboard-main lg:ml-[280px]">
        <div className="dashboard-content">
          <QuickStatsHeader
            stats={[
              { label: 'Aylanma', value: formatCurrency(stats.totalRevenue), change: 12 },
              { label: 'Buyurtmalar', value: stats.totalOrders, change: 8 },
              { label: 'Foyda', value: formatCurrency(stats.totalProfit), change: 15 },
              { label: 'Mahsulotlar', value: stats.activeProducts },
            ]}
          />

          {/* Verification Notice */}
          {partner && !partner.approved && (
            <Card className="mt-6 border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Tasdiqlanish kutilmoqda</p>
                  <p className="text-sm text-amber-700">Arizangiz ko'rib chiqilmoqda</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overview */}
          {selectedTab === 'overview' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader
                title="Dashboard"
                subtitle={`Salom, ${user.firstName || user.username}!`}
                icon={LayoutDashboard}
                actions={
                  <Button onClick={() => setShowTierModal(true)} variant="outline" size="sm">
                    <Crown className="w-4 h-4 mr-2" /> Tarifni O'zgartirish
                  </Button>
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <PremiumStatCard title="Mahsulotlar" value={products.length} icon={Package} delay={0} />
                <PremiumStatCard title="Aylanma" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} change={{ value: 12, type: 'increase' }} delay={50} />
                <PremiumStatCard title="Buyurtmalar" value={stats.totalOrders} icon={ShoppingCart} change={{ value: 8, type: 'increase' }} delay={100} />
                <PremiumStatCard title="Foyda" value={formatCurrency(stats.totalProfit)} icon={Target} variant="gradient" delay={150} />
              </div>

              {partner && !partner.approved && (
                <PartnerVerificationSection partner={partner} onUpdate={() => queryClient.invalidateQueries({ queryKey: ['/api/user'] })} />
              )}
            </div>
          )}

          {/* Products */}
          {selectedTab === 'products' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader title="Mahsulotlar" subtitle="Mahsulotlarni boshqarish" icon={Package} />
              <SimpleProductForm />
              <InventoryManagement />
            </div>
          )}

          {/* Orders */}
          {selectedTab === 'orders' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader title="Buyurtmalar" subtitle="Buyurtmalarni kuzatish" icon={ShoppingCart} />
              <OrderManagement />
            </div>
          )}

          {/* AI Manager */}
          {selectedTab === 'ai-manager' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader title="AI Manager" subtitle="AI yordamchi xizmatlari" icon={Brain} badge={{ text: 'Premium', icon: Sparkles }} />
              {(partner as any)?.aiEnabled ? (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-8 text-center">
                    <Brain className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <h3 className="text-2xl font-bold mb-2">AI Manager Faol</h3>
                    <p className="text-muted-foreground mb-6">AI 24/7 biznesingiz uchun ishlayapti</p>
                    <Button onClick={() => setLocation('/partner-ai-dashboard')} size="lg">
                      <Brain className="w-5 h-5 mr-2" /> Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-amber-500/20 bg-amber-500/5">
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-amber-600" />
                    <h3 className="text-2xl font-bold mb-2">AI Manager Faol Emas</h3>
                    <p className="text-muted-foreground mb-6">Faollashtirish uchun admin tasdiqi kerak</p>
                    <Button size="lg" onClick={async () => {
                      try {
                        await fetch('/api/partners/ai-toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ enabled: true }) });
                        toast({ title: "So'rov yuborildi" });
                        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
                      } catch { toast({ title: "Xatolik", variant: "destructive" }); }
                    }}>
                      <Zap className="w-5 h-5 mr-2" /> Faollashtirish
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Analytics */}
          {selectedTab === 'analytics' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader title="Tahlillar" subtitle="Batafsil statistika" icon={BarChart3} />
              <ProfitDashboard />
              <ComprehensiveAnalytics data={analytics} />
            </div>
          )}

          {/* Wallet */}
          {selectedTab === 'wallet' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader title="Hamyon" subtitle="Moliyaviy hisobotlar" icon={Wallet} />
              <PartnerTierInfo />
            </div>
          )}

          {/* Referrals */}
          {selectedTab === 'referrals' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader title="Referrallar" subtitle="Taklif dasturi" icon={Gift} />
              <EnhancedReferralDashboard />
              <PartnerReferralCampaigns />
              <AchievementSystem />
            </div>
          )}

          {/* Chat */}
          {selectedTab === 'chat' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader title="Yordam" subtitle="Support bilan aloqa" icon={MessageCircle} />
              <Card className="h-[600px]"><ChatSystem partnerId={partner?.id} /></Card>
            </div>
          )}

          {/* Settings */}
          {selectedTab === 'settings' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader title="Sozlamalar" subtitle="Profil va sozlamalar" icon={Settings} />
              <MarketplaceIntegrationManager isPartnerView={true} />
            </div>
          )}
        </div>
      </main>

      <TierUpgradeRequestForm
        isOpen={showTierModal}
        onClose={() => setShowTierModal(false)}
        onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['/api/partners/me'] }); setShowTierModal(false); }}
        currentTier={partner?.pricingTier || 'free_starter'}
      />
    </div>
  );
}
