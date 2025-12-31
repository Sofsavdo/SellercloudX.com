// client/src/pages/PartnerDashboard.tsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sidebar, partnerSidebarItems } from '@/components/Sidebar';
import { PartnerStats } from '@/components/PartnerStats';
import { ProductForm } from '@/components/ProductForm';
import { SimpleProductForm } from '@/components/SimpleProductForm';
// FULFILLMENT FEATURE - Hidden for SaaS-only mode
// import { FulfillmentRequestForm } from '@/components/FulfillmentRequestForm';
import { ProfitDashboard } from '@/components/ProfitDashboard';
import { TrendingProducts } from '@/components/TrendingProducts';
import { TrendingProductsDashboard } from '@/components/TrendingProductsDashboard';
import { TierUpgradeRequestForm } from '@/components/TierUpgradeRequestForm';
import { PartnerTierInfo } from '@/components/PartnerTierInfo';
import { AIUsageTracker } from '@/components/AIUsageTracker';
import { DataExportButton } from '@/components/DataExportButton';
import { ComprehensiveAnalytics } from '@/components/ComprehensiveAnalytics';
import PartnerVerificationSection from '@/components/PartnerVerificationSection';
import { InventoryManagement } from '@/components/InventoryManagement';
import { OrderManagement } from '@/components/OrderManagement';
import { StockAlerts } from '@/components/StockAlerts';
import { InventoryTracker } from '@/components/InventoryTracker';
import { MarketplaceIntegrationManager } from '@/components/MarketplaceIntegrationManager';
import { useAuth } from '@/hooks/useAuth';
import { useTierAccess } from '@/hooks/useTierAccess';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currency';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
// SAAS MODEL: Use new SaaS-only pricing (no fulfillment)
import { SAAS_PRICING_TIERS as NEW_PRICING_TIERS, AI_MANAGER_PLANS } from '../../../SAAS_PRICING_CONFIG';
import { ChatSystem } from '@/components/ChatSystem';
import { SimpleReferralDashboard } from '@/components/SimpleReferralDashboard';
import { EnhancedReferralDashboard } from '@/components/EnhancedReferralDashboard';
import { PartnerReferralCampaigns } from '@/components/PartnerReferralCampaigns';
import { ViralShareButton } from '@/components/ViralShareButton';
import { AchievementSystem } from '@/components/AchievementSystem';
import { StatCard } from '@/components/ui/StatCard';
import { ModernButton } from '@/components/ui/ModernButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Package, TrendingUp, Settings, Crown, BarChart3, DollarSign,
  Target, Zap, CheckCircle, Clock, AlertTriangle, User, Building, CreditCard,
  Globe, Truck, Star, ArrowRight, Plus, Eye, Edit, Trash2, Download, Upload, RefreshCw,
  FileSpreadsheet, TrendingDown, MessageCircle, Brain, Gift
} from 'lucide-react';

interface Product { id: string; name: string; category: string; description: string; price: string; costPrice: string; sku: string; barcode: string; weight: string; isActive: boolean; createdAt: string; }
// FULFILLMENT FEATURE - Hidden for SaaS-only mode
// interface FulfillmentRequest { id: string; title: string; description: string; status: string; priority: string; estimatedCost: string; actualCost: string; createdAt: string; }
interface Analytics { id: string; date: string; revenue: string; orders: number; profit: string; commissionPaid: string; marketplace: string; category: string; }

export default function PartnerDashboard() {
  const { user, partner, isLoading: authLoading } = useAuth();
  const tierAccess = useTierAccess();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showTierModal, setShowTierModal] = useState(false);
  const isPartner = !!user && user.role === 'partner';

  // Data queries (must be declared before any early returns)
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/products');
      return response.json();
    },
    enabled: isPartner,
  });

  // FULFILLMENT FEATURE - Hidden for SaaS-only mode
  /*
  const { data: fulfillmentRequests = [], isLoading: requestsLoading } = useQuery<FulfillmentRequest[]>({
    queryKey: ['/api/fulfillment-requests'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/fulfillment-requests');
      return response.json();
    },
    enabled: isPartner,
  });
  */
  const fulfillmentRequests: any[] = [];
  const requestsLoading = false;

  const { data: analytics = [], isLoading: analyticsLoading } = useQuery<Analytics[]>({
    queryKey: ['/api/analytics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/analytics');
      return response.json();
    },
    enabled: isPartner,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLocation('/login');
    } else if (user.role !== 'partner') {
      setLocation('/');
    }
  }, [user, authLoading, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" text="Dashboard yuklanmoqda..." />
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'partner') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoginForm />
      </div>
    );
  }

  const stats = {
    totalRevenue: analytics.reduce((sum, item) => sum + parseFloat(item.revenue || '0'), 0),
    totalOrders: analytics.reduce((sum, item) => sum + (item.orders || 0), 0),
    totalProfit: analytics.reduce((sum, item) => sum + parseFloat(item.profit || '0'), 0),
    activeProducts: products.filter(p => p.isActive).length,
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Kutilmoqda', variant: 'secondary' as const, icon: Clock },
      approved: { label: 'Tasdiqlangan', variant: 'default' as const, icon: CheckCircle },
      in_progress: { label: 'Jarayonda', variant: 'secondary' as const, icon: RefreshCw },
      completed: { label: 'Yakunlangan', variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: 'Bekor qilingan', variant: 'destructive' as const, icon: AlertTriangle }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getTierName = (tier: string) => {
    const tierNames = {
      free_starter: 'Free Starter',
      basic: 'Basic',
      starter: 'Starter',
      professional: 'Professional',
      starter_pro: 'Starter Pro',
      business_standard: 'Business Standard',
      professional_plus: 'Professional Plus',
      enterprise_elite: 'Enterprise Elite'
    };
    return tierNames[tier as keyof typeof tierNames] || tier;
  };

  const getPlanTypeLabel = (planType?: string) => {
    if (!planType || planType === 'local_full_service') return 'Local Full-service';
    if (planType === 'remote_ai_saas') return 'Remote AI Manager SaaS';
    return planType;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex">
      <Sidebar 
        items={partnerSidebarItems} 
        userRole="partner" 
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />
     
      <div className="flex-1 ml-64 transition-all duration-300 min-h-screen">
        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Partner Dashboard</h1>
                <p className="text-slate-600 mt-1">
                  Salom, {user.firstName || user.username}! Biznesingizni boshqaring.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Crown className="w-3 h-3 mr-1" />
                  {getTierName(partner?.pricingTier || 'free_starter')}
                </Badge>
                <Button onClick={() => setShowTierModal(true)} variant="premium" size="sm" className="hover-lift">
                  <Crown className="w-4 h-4 mr-2" />
                  Tarifni O'zgartirish
                </Button>
              </div>
            </div>
          </div>

          {partner && !partner.approved && (
            <Card className="mb-8 border-orange-200 bg-orange-50 animate-slide-up">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-orange-800">Tasdiqlanish kutilmoqda</h3>
                    <p className="text-orange-700">
                      Sizning hamkorlik arizangiz admin tomonidan ko'rib chiqilmoqda.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {partner && partner.approved && (
            <Card className="mb-8 border-green-200 bg-green-50 animate-slide-up">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Tasdiqlangan</h3>
                    <p className="text-green-700">
                      Sizning hamkorlik arizangiz tasdiqlangan. Platformaning barcha imkoniyatlaridan foydalanishingiz mumkin.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mb-8">
            <PartnerStats stats={stats} />
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            {/* Overview Tab */}
            {selectedTab === 'overview' && (
              <div className="space-y-6">
              <TabsTrigger value="trends" className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Trendlar</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Support</span>
              </TabsTrigger>
            </TabsList>

            {/* AI MANAGER TAB - NEW! */}
            {/* AI Manager Tab */}
            {selectedTab === 'ai-manager' && (
              <div className="space-y-6">
              <Card className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 border-2 border-purple-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold">
                        AI Manager - Cost Optimized
                      </span>
                      <p className="text-sm text-muted-foreground font-normal mt-1">
                        90% arzon | Template-based | Real-time tracking
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
              </Card>

              {(partner as any)?.aiEnabled ? (
                <>
                  {/* AI Dashboard Link */}
                  <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                    <CardContent className="p-12 text-center">
                      <div className="max-w-2xl mx-auto">
                        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Brain className="w-12 h-12 text-purple-600" />
                        </div>
                        <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          AI Manager Dashboard
                        </h3>
                        <p className="text-gray-600 mb-8 text-lg">
                          AI 24/7 sizning biznesingiz uchun ishlayapti. Real-time natijalarni ko'ring.
                        </p>
                        <Button
                          size="lg"
                          onClick={() => setLocation('/partner-ai-dashboard')}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg"
                        >
                          <Brain className="w-5 h-5 mr-2" />
                          AI Dashboard ni Ochish
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="border-2 border-orange-300 bg-orange-50">
                  <CardContent className="p-12 text-center">
                    <div className="max-w-2xl mx-auto">
                      <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-12 h-12 text-orange-600" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-orange-900">AI Manager Faol Emas</h3>
                      <p className="text-orange-700 mb-6 text-lg">
                        AI Manager xizmatidan foydalanish uchun admin tomonidan tasdiq olishingiz kerak.
                      </p>
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/partners/ai-toggle', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({ enabled: true }),
                            });
                            const data = await response.json();
                            if (data.success) {
                              toast({
                                title: "✅ So'rov Yuborildi",
                                description: "AI Manager faollashtirish so'rovingiz adminga yuborildi",
                                duration: 5000,
                              });
                              queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
                            }
                          } catch (error) {
                            toast({
                              title: "Xatolik",
                              description: "So'rov yuborishda xatolik",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        AI Manager ni Faollashtirish
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            )}

            {/* REFERRAL TAB - NEW! */}
            {/* Referral Tab */}
            {selectedTab === 'referrals' && (
              <div className="space-y-6">
                <EnhancedReferralDashboard />
                
                {/* Active Campaigns */}
                <div className="mt-6">
                  <PartnerReferralCampaigns />
                </div>
                
                <AchievementSystem />
                
                {/* Viral Share Section */}
                <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-blue-50">
                  <CardContent className="p-8 text-center">
                    <h3 className="text-2xl font-bold mb-4">Muvaffaqiyatingizni Ulashing!</h3>
                    <p className="text-gray-600 mb-6">
                      Har bir taklif qilingan hamkor uchun birinchi haridaning 10% komissiya olasiz!
                    </p>
                    <ViralShareButton 
                      data={{
                        earnings: 24,
                        growthPercent: 180,
                        partnerName: user?.username || 'partner'
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            )}


            {/* Overview Tab Content */}
            {selectedTab === 'overview' && (
              <div className="space-y-6">
              {/* Partner Verification Section */}
              {partner && !partner.approved && (
                <PartnerVerificationSection 
                  partner={partner} 
                  onUpdate={() => queryClient.invalidateQueries({ queryKey: ['/api/user'] })}
                />
              )}

              {/* Partner Tier / Plan Info Card */}
              {partner && (() => {
                const planType = (partner as any).planType || 'local_full_service';

                if (planType === 'remote_ai_saas') {
                  const aiPlanCode = (partner as any).aiPlanCode;
                  const plan = aiPlanCode
                    ? AI_MANAGER_PLANS[aiPlanCode as keyof typeof AI_MANAGER_PLANS]
                    : null;

                  return (
                    <Card className="border-2 border-primary/30 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                        <CardTitle className="flex items-center justify-between">
                          <span>AI Manager Rejasi</span>
                          {plan && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                              {plan.name}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Reja turi: {getPlanTypeLabel(planType)}
                        </p>
                        {plan ? (
                          <>
                            <p className="text-sm">
                              Oylik to'lov: <span className="font-semibold">${plan.monthlyFee ?? 0}/oy</span>
                            </p>
                            <p className="text-sm">
                              Komissiya: <span className="font-semibold">{((plan.revenueCommissionRate ?? 0) * 100).toFixed(2)}% savdodan</span>
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            AI Manager rejangiz hali tanlanmagan. Admin bilan bog'laning.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                }

                const tierKey = partner.pricingTier || 'free_starter';
                const tierConfig = NEW_PRICING_TIERS[tierKey as keyof typeof NEW_PRICING_TIERS];

                return (
                  <PartnerTierInfo
                    currentTier={tierKey}
                    monthlyFee={parseFloat((partner as any).monthlyFee || tierConfig?.monthlyFee?.toString() || '0')}
                    profitShareRate={parseFloat((partner as any).profitShareRate || (tierConfig?.profitShareRate || tierConfig?.commissionRate)?.toString() || '0')}
                    monthlyRevenue={stats.totalRevenue}
                    onUpgradeClick={() => setShowTierModal(true)}
                  />
                );
              })()}
              {/* AI Usage Tracker */}
              {partner && (
                <AIUsageTracker
                  monthlyRevenue={stats.totalRevenue}
                  pricingTier={partner.pricingTier}
                  aiEnabled={(partner as any).aiEnabled || false}
                  onToggleAI={async (enabled) => {
                    try {
                      const response = await apiRequest('POST', '/api/partners/ai-toggle', { enabled });
                      const data = await response.json();
                      
                      if (data.success) {
                        toast({
                          title: enabled ? "AI So'rov Yuborildi" : "AI O'chirildi",
                          description: data.message,
                          duration: 5000,
                        });
                        
                        // Refresh partner data
                        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
                      }
                    } catch (error) {
                      toast({
                        title: "Xatolik",
                        description: "AI sozlamalarini o'zgartirishda xatolik yuz berdi",
                        variant: "destructive",
                        duration: 3000,
                      });
                    }
                  }}
                />
              )}
              
              <StockAlerts />
              <div className="equal-grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2"><Package className="w-5 h-5" />So'nggi Mahsulotlar</span>
                      <Button onClick={() => setSelectedTab('products')} variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-2" />Barchasini ko'rish
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {products.slice(0, 5).map((p) => (
                        <div key={p.id} className="flex justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-sm text-muted-foreground">{formatCurrency(parseFloat(p.price))}</p>
                          </div>
                          <Badge variant={p.isActive ? 'default' : 'secondary'}>{p.isActive ? 'Faol' : 'Nofaol'}</Badge>
                        </div>
                      ))}
                      {products.length === 0 && <p className="text-center py-8 text-muted-foreground">Mahsulot yo‘q</p>}
                    </div>
                  </CardContent>
                </Card>
                {/* So'rovlar kartasi ham xuddi shunday */}
              </div>
            </TabsContent>

            {/* Marketplace Tab with Sub-tabs */}
            {/* Marketplace Tab */}
            {selectedTab === 'marketplace' && (
              <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-6 h-6 text-blue-600" />
                    Marketplace Boshqaruvi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="integrations" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="integrations">Integratsiyalar</TabsTrigger>
                      <TabsTrigger value="tracking">Kuzatish</TabsTrigger>
                      <TabsTrigger value="orders">Buyurtmalar</TabsTrigger>
                      <TabsTrigger value="analytics">Tahlil</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="integrations">
                      <MarketplaceIntegrationManager isPartnerView={true} />
                    </TabsContent>
                    
                    <TabsContent value="tracking">
                      <InventoryTracker />
                    </TabsContent>
                    
                    <TabsContent value="orders">
                      <OrderManagement />
                    </TabsContent>
                    
                    <TabsContent value="analytics">
                      <ComprehensiveAnalytics data={analytics} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory (Ombor) Tab with Sub-tabs */}
            {/* Inventory Tab */}
            {selectedTab === 'inventory' && (
              <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-6 h-6 text-purple-600" />
                    Ombor Boshqaruvi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="stock" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="stock">Stock Boshqaruvi</TabsTrigger>
                      <TabsTrigger value="products">Mahsulotlar</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="stock">
                      <InventoryManagement />
                    </TabsContent>
                    
                    <TabsContent value="products">
                      {/* Products content here */}
                      <div className="space-y-4">
                        {products.slice(0, 10).map((product) => (
                          <Card key={product.id} className="shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg">{product.name}</h4>
                                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                                    <div>
                                      <p className="text-gray-600">SKU</p>
                                      <p className="font-medium">{product.sku}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Kategoriya</p>
                                      <p className="font-medium">{product.category}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Narx</p>
                                      <p className="font-medium text-green-600">{formatCurrency(parseFloat(product.price))}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            )}

            {/* Profit Tab */}
            {selectedTab === 'profit' && (
              <div className="space-y-6">
                <ProfitDashboard />
              </div>
            )}

            {/* Trends Tab - ADVANCED VERSION */}
            {selectedTab === 'trends' && (
              <div className="space-y-6">
                <TrendingProductsDashboard />
              </div>
            )}

            {/* Support Chat Tab */}
            {selectedTab === 'chat' && (
              <div className="space-y-4">
                <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                      <MessageCircle className="w-5 h-5" />
                      Support bilan chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">
                      Admin jamoasi bilan real-time yozishmalarda savollarga javob oling, fayl yuboring va holatingizni kuzating.
                    </p>
                  </CardContent>
                </Card>
                <div className="rounded-xl border bg-white shadow-soft h-[640px]">
                  <ChatSystem partnerId={partner?.id} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <TierUpgradeRequestForm
        isOpen={showTierModal}
        onClose={() => setShowTierModal(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/partners/me'] });
          setShowTierModal(false);
        }}
        currentTier={partner?.pricingTier || 'free_starter'}
      />
    </div>
  );
}
