// Partner Dashboard - Premium Fintech Style
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardSidebar, partnerNavItems } from '@/components/layout/DashboardSidebar';
import { DashboardHeader, QuickStatsHeader } from '@/components/ui/dashboard-header';
import { PremiumStatCard } from '@/components/ui/premium-stat-card';
import { DataCard } from '@/components/ui/data-card';
import { LoginForm } from '@/components/LoginForm';
import { SimpleProductForm } from '@/components/SimpleProductForm';
import { ProfitDashboard } from '@/components/ProfitDashboard';
import { SelfServiceTierUpgrade } from '@/components/SelfServiceTierUpgrade';
import { PartnerTierInfo } from '@/components/PartnerTierInfo';
import { ComprehensiveAnalytics } from '@/components/ComprehensiveAnalytics';
import { 
  RevenueChart, 
  OrdersChart, 
  GrowthChart, 
  DistributionChart,
  ChartCard,
  FINTECH_COLORS 
} from '@/components/ui/fintech-charts';
import PartnerVerificationSection from '@/components/PartnerVerificationSection';
import { InventoryManagement } from '@/components/InventoryManagement';
import { OrderManagement } from '@/components/OrderManagement';
import { MarketplaceIntegrationManager } from '@/components/MarketplaceIntegrationManager';
import { ChatSystem } from '@/components/ChatSystem';
import { PartnerWallet } from '@/components/PartnerWallet';
import { PartnerPaymentHistory } from '@/components/PartnerPaymentHistory';
import { PartnerPromoCodeSystem } from '@/components/PartnerPromoCodeSystem';
import { DirectTierUpgrade } from '@/components/DirectTierUpgrade';
import { PartnerMarketplaceSetup } from '@/components/PartnerMarketplaceSetup';
import { ImpersonationBanner } from '@/components/ImpersonationButton';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currency';
import { apiRequest } from '@/lib/queryClient';
import {
  Package, Settings, Crown, BarChart3, DollarSign, Target, Zap,
  Clock, AlertTriangle, Brain, MessageCircle, Gift,
  LayoutDashboard, Sparkles, ShoppingCart, Wallet, ArrowRight,
  TrendingUp, CheckCircle, Building, XCircle, Globe, Scan, CreditCard, Camera
} from 'lucide-react';
import TrendHunterDashboard from './TrendHunterDashboard';
import PartnerPaymentsDashboard from '../components/PartnerPaymentsDashboard';

interface Product { id: string; name: string; category: string; price: string; costPrice: string; sku: string; isActive: boolean; createdAt: string; }
interface Analytics { id: string; date: string; revenue: string; orders: number; profit: string; }

export default function PartnerDashboard() {
  const { user, partner, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showTierModal, setShowTierModal] = useState(false);
  const isPartner = !!user && user.role === 'partner';

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => { 
      try {
        const res = await apiRequest('GET', '/api/products'); 
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
    enabled: isPartner,
  });

  const { data: analytics = [] } = useQuery<Analytics[]>({
    queryKey: ['/api/analytics'],
    queryFn: async () => { 
      try {
        const res = await apiRequest('GET', '/api/analytics'); 
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
    enabled: isPartner,
  });

  // Fetch Yandex Market dashboard data (real statistics)
  const { data: yandexDashboard } = useQuery({
    queryKey: ['/api/partner/yandex/dashboard'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/partner/yandex/dashboard');
        const data = await res.json();
        return data.success ? data.data : null;
      } catch {
        return null;
      }
    },
    enabled: isPartner,
    refetchInterval: 60000, // Refresh every minute
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
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center animate-pulse shadow-glow">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-lg font-semibold text-foreground">Yuklanmoqda...</p>
            <p className="text-sm text-muted-foreground">Iltimos kuting</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'partner') {
    return <div className="min-h-screen bg-background flex items-center justify-center"><LoginForm /></div>;
  }

  // Ensure arrays are valid before reduce operations
  const safeProducts = Array.isArray(products) ? products : [];
  const safeAnalytics = Array.isArray(analytics) ? analytics : [];
  
  // Merge Yandex real data with local analytics
  const yandexRevenue = yandexDashboard?.revenue?.total || 0;
  const yandexOrders = yandexDashboard?.orders?.total || 0;
  const yandexProducts = yandexDashboard?.products?.active || 0;
  
  const stats = {
    totalRevenue: yandexRevenue || safeAnalytics.reduce((sum, item) => sum + parseFloat(item?.revenue || '0'), 0),
    totalOrders: yandexOrders || safeAnalytics.reduce((sum, item) => sum + (item?.orders || 0), 0),
    totalProfit: safeAnalytics.reduce((sum, item) => sum + parseFloat(item?.profit || '0'), 0),
    activeProducts: yandexProducts || safeProducts.filter(p => p?.isActive).length,
    yandexConnected: yandexDashboard?.connection_status === 'active',
  };

  const getTierName = (tier: string) => {
    const names: Record<string, string> = {
      free_starter: 'Free', starter_pro: 'Starter Pro', business_standard: 'Business',
      professional_plus: 'Professional', enterprise_elite: 'Enterprise'
    };
    return names[tier] || tier;
  };

  return (
    <div className="dashboard-layout flex w-full">
      {/* Impersonation Banner */}
      <ImpersonationBanner />
      
      <DashboardSidebar
        items={partnerNavItems}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
        userRole="partner"
        userName={user.firstName || user.username}
        userPlan={getTierName(partner?.pricingTier || 'free_starter')}
      />

      <main className="dashboard-main lg:ml-[280px] flex-1">
        <div className="dashboard-content">
          {/* Quick Stats Bar */}
          <QuickStatsHeader
            stats={[
              { label: 'Aylanma', value: formatCurrency(stats.totalRevenue), change: 12 },
              { label: 'Buyurtmalar', value: stats.totalOrders, change: 8 },
              { label: 'Foyda', value: formatCurrency(stats.totalProfit), change: 15 },
              { label: 'Mahsulotlar', value: stats.activeProducts },
            ]}
            className="animate-fade-in"
          />

          {/* Verification Notice */}
          {partner && !partner.approved && (
            <Card className="mt-6 border-warning/30 bg-warning/5 animate-fade-in-up">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Tasdiqlanish kutilmoqda</p>
                  <p className="text-sm text-muted-foreground">Arizangiz ko'rib chiqilmoqda. Tez orada javob beramiz.</p>
                </div>
                <Badge className="bg-warning/20 text-warning border-warning/30">Kutilmoqda</Badge>
              </CardContent>
            </Card>
          )}

          {/* Overview */}
          {selectedTab === 'overview' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader
                title="Dashboard"
                subtitle={`Xush kelibsiz, ${user.firstName || user.username}!`}
                icon={LayoutDashboard}
                actions={
                  <Button onClick={() => setShowTierModal(true)} variant="outline" size="sm" className="gap-2">
                    <Crown className="w-4 h-4" /> Tarifni O'zgartirish
                  </Button>
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <PremiumStatCard title="Mahsulotlar" value={products.length} icon={Package} delay={0} />
                <PremiumStatCard title="Aylanma" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} change={{ value: 12, type: 'increase' }} delay={50} />
                <PremiumStatCard title="Buyurtmalar" value={stats.totalOrders} icon={ShoppingCart} change={{ value: 8, type: 'increase' }} delay={100} />
                <PremiumStatCard title="Foyda" value={formatCurrency(stats.totalProfit)} icon={Target} variant="gradient" delay={150} />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DataCard title="Tezkor Amallar" subtitle="Asosiy funksiyalar" icon={Zap}>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => setSelectedTab('products')}>
                      <Package className="w-4 h-4" /> Mahsulotlar
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => setSelectedTab('orders')}>
                      <ShoppingCart className="w-4 h-4" /> Buyurtmalar
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => setSelectedTab('analytics')}>
                      <BarChart3 className="w-4 h-4" /> Tahlillar
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => setSelectedTab('ai-manager')}>
                      <Brain className="w-4 h-4" /> AI Manager
                    </Button>
                  </div>
                </DataCard>

                <DataCard title="Oxirgi Yangiliklar" subtitle="Bugungi statistika" icon={TrendingUp}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-success" />
                        <span className="text-sm font-medium">Yangi buyurtmalar</span>
                      </div>
                      <Badge className="bg-success/20 text-success">+{stats.totalOrders}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Kunlik daromad</span>
                      </div>
                      <Badge className="bg-primary/20 text-primary">{formatCurrency(stats.totalRevenue / 30)}</Badge>
                    </div>
                  </div>
                </DataCard>

                <DataCard title="Yordam" subtitle="Tez yordam olish" icon={MessageCircle}>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setSelectedTab('chat')}>
                      <MessageCircle className="w-4 h-4" /> Support bilan aloqa
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setSelectedTab('referrals')}>
                      <Gift className="w-4 h-4" /> Referral dasturi
                    </Button>
                  </div>
                </DataCard>
              </div>

              {partner && !partner.approved && (
                <PartnerVerificationSection partner={partner} onUpdate={() => queryClient.invalidateQueries({ queryKey: ['/api/user'] })} />
              )}
            </div>
          )}

          {/* Products - AI Scanner Only */}
          {selectedTab === 'products' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader title="AI Scanner" subtitle="Kameradan mahsulot skaner qilish" icon={Camera} />
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
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center shadow-glow">
                      <Brain className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">AI Manager Faol</h3>
                    <p className="text-muted-foreground mb-6">AI 24/7 biznesingiz uchun ishlayapti</p>
                    <Button onClick={() => setLocation('/partner-ai-dashboard')} size="lg" className="gap-2">
                      <Brain className="w-5 h-5" /> Dashboard <ArrowRight className="w-5 h-5" />
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-warning/20 mx-auto mb-6 flex items-center justify-center">
                      <AlertTriangle className="w-10 h-10 text-warning" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">AI Manager Faol Emas</h3>
                    <p className="text-muted-foreground mb-6">Faollashtirish uchun admin tasdiqi kerak</p>
                    <Button size="lg" className="gap-2" onClick={async () => {
                      try {
                        await fetch('/api/partners/ai-toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ enabled: true }) });
                        toast({ title: "So'rov yuborildi" });
                        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
                      } catch { toast({ title: "Xatolik", variant: "destructive" }); }
                    }}>
                      <Zap className="w-5 h-5" /> Faollashtirish
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}


          {/* Trend Hunter */}
          {selectedTab === 'trend-hunter' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader 
                title="Trend Hunter" 
                subtitle="Xitoy va Amerika bozoridan trending mahsulotlar" 
                icon={TrendingUp} 
                badge={{ text: 'NEW', icon: Sparkles }} 
              />
              <TrendHunterDashboard />
            </div>
          )}

          {/* Analytics - Fintech Charts */}
          {selectedTab === 'analytics' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader title="Tahlillar" subtitle="Batafsil statistika va grafiklar" icon={BarChart3} />
              
              {/* Main Charts Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ChartCard
                  title="Daromad Dinamikasi"
                  subtitle="Oxirgi 12 oy"
                  icon={DollarSign}
                  value={formatCurrency(stats.totalRevenue)}
                  change={12}
                >
                  <RevenueChart 
                    data={[
                      { name: 'Yan', value: stats.totalRevenue * 0.6 },
                      { name: 'Fev', value: stats.totalRevenue * 0.7 },
                      { name: 'Mar', value: stats.totalRevenue * 0.65 },
                      { name: 'Apr', value: stats.totalRevenue * 0.8 },
                      { name: 'May', value: stats.totalRevenue * 0.85 },
                      { name: 'Iyn', value: stats.totalRevenue * 0.9 },
                      { name: 'Iyl', value: stats.totalRevenue * 0.95 },
                      { name: 'Avg', value: stats.totalRevenue },
                    ]} 
                    height={280} 
                  />
                </ChartCard>

                <ChartCard
                  title="Buyurtmalar"
                  subtitle="Haftalik"
                  icon={ShoppingCart}
                  value={stats.totalOrders}
                  change={8}
                >
                  <OrdersChart 
                    data={[
                      { name: 'Dush', value: Math.floor(stats.totalOrders / 7) },
                      { name: 'Sesh', value: Math.floor(stats.totalOrders / 6) },
                      { name: 'Chor', value: Math.floor(stats.totalOrders / 7.5) },
                      { name: 'Pay', value: Math.floor(stats.totalOrders / 5) },
                      { name: 'Jum', value: Math.floor(stats.totalOrders / 4.5) },
                      { name: 'Shan', value: Math.floor(stats.totalOrders / 4) },
                      { name: 'Yak', value: Math.floor(stats.totalOrders / 6) },
                    ]} 
                    height={280} 
                  />
                </ChartCard>
              </div>

              {/* Secondary Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <ChartCard
                  title="O'sish Dinamikasi"
                  subtitle="Kvartallar bo'yicha"
                  icon={TrendingUp}
                  value="+15%"
                  change={5}
                >
                  <GrowthChart 
                    data={[
                      { name: 'Q1', value: 8 },
                      { name: 'Q2', value: 12 },
                      { name: 'Q3', value: 10 },
                      { name: 'Q4', value: 15 },
                    ]} 
                    height={200} 
                  />
                </ChartCard>

                <ChartCard
                  title="Mahsulot Kategoriyalari"
                  subtitle="Savdo ulushi"
                  icon={Package}
                >
                  <DistributionChart 
                    data={[
                      { name: 'Elektronika', value: 35 },
                      { name: 'Kiyim', value: 28 },
                      { name: 'Uy-ro\'zg\'or', value: 22 },
                      { name: 'Boshqa', value: 15 },
                    ]} 
                    height={200}
                    innerRadius={45}
                  />
                </ChartCard>

                <ChartCard
                  title="Foyda Marjasi"
                  subtitle="Oylik trend"
                  icon={Target}
                  value={formatCurrency(stats.totalProfit)}
                  change={18}
                >
                  <GrowthChart 
                    data={[
                      { name: 'Yan', value: 12 },
                      { name: 'Fev', value: 15 },
                      { name: 'Mar', value: 14 },
                      { name: 'Apr', value: 18 },
                      { name: 'May', value: 22 },
                      { name: 'Iyn', value: 25 },
                    ]} 
                    height={200}
                    showDots={false}
                  />
                </ChartCard>
              </div>

              {/* Legacy Analytics */}
              <ProfitDashboard />
              <ComprehensiveAnalytics data={analytics} />
            </div>
          )}

          {/* Wallet */}
          {selectedTab === 'wallet' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader title="Hamyon" subtitle="Moliyaviy hisobotlar" icon={Wallet} />
              <PartnerWallet />
            </div>
          )}

          {/* Payments - 2026 Revenue Share Model */}
          {selectedTab === 'payments' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader 
                title="To'lovlar va Qarz" 
                subtitle="Revenue share, oylik to'lov va savdo taqqoslash" 
                icon={CreditCard}
                badge={{ text: 'YANGI', icon: Sparkles }}
              />
              <PartnerPaymentsDashboard partner={partner} />
            </div>
          )}

          {/* Referrals - Promo Code System */}
          {selectedTab === 'referrals' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader title="Referrallar" subtitle="Promo kod bilan taklif qiling" icon={Gift} />
              <PartnerPromoCodeSystem />
            </div>
          )}

          {/* Chat */}
          {selectedTab === 'chat' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader title="Yordam" subtitle="Support bilan aloqa" icon={MessageCircle} />
              <Card className="h-[600px] overflow-hidden"><ChatSystem partnerId={partner?.id} /></Card>
            </div>
          )}

          {/* Settings - Marketplace Setup */}
          {selectedTab === 'settings' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader title="Sozlamalar" subtitle="Profil va sozlamalar" icon={Settings} />
              
              <Tabs defaultValue="marketplace" className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                  <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                  <TabsTrigger value="tier">Tarif</TabsTrigger>
                  <TabsTrigger value="legal">Yuridik ma'lumotlar</TabsTrigger>
                  <TabsTrigger value="payments">To'lov tarixi</TabsTrigger>
                </TabsList>
                
                <TabsContent value="marketplace">
                  <PartnerMarketplaceSetup />
                </TabsContent>

                <TabsContent value="tier">
                  <DirectTierUpgrade 
                    currentTier={partner?.pricingTier || 'free'} 
                    partnerId={partner?.id}
                    aiCardsUsed={(partner as any)?.aiCardsUsed || 0}
                  />
                </TabsContent>
                
                <TabsContent value="legal">
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Building className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                      <h3 className="text-xl font-semibold mb-2">Yuridik Ma'lumotlar</h3>
                      <p className="text-slate-600">Tez orada qo'shiladi...</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="payments">
                  <PartnerPaymentHistory />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>

      {/* Tier Upgrade Modal - Direct Payment */}
      {showTierModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Tarifni O'zgartirish</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowTierModal(false)}>
                <XCircle className="w-6 h-6" />
              </Button>
            </div>
            <DirectTierUpgrade 
              currentTier={partner?.pricingTier || 'free'} 
              partnerId={partner?.id}
              aiCardsUsed={(partner as any)?.aiCardsUsed || 0}
            />
          </div>
        </div>
      )}
    </div>
  );
}
