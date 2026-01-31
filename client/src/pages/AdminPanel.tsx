// Admin Panel - Premium Fintech Style Dashboard
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DashboardSidebar, adminNavItems } from '@/components/layout/DashboardSidebar';
import { DashboardHeader, QuickStatsHeader } from '@/components/ui/dashboard-header';
import { PremiumStatCard } from '@/components/ui/premium-stat-card';
import { DataCard, MiniCard, ActionCard } from '@/components/ui/data-card';
import { LoginForm } from '@/components/LoginForm';
import { TrendingProducts } from '@/components/TrendingProducts';
import { TrendingProductsDashboard } from '@/components/TrendingProductsDashboard';
import { MarketplaceApiConfig } from '@/components/MarketplaceApiConfig';
import { ComprehensiveAnalytics } from '@/components/ComprehensiveAnalytics';
import { 
  RevenueChart, 
  OrdersChart, 
  GrowthChart, 
  MultiMetricChart,
  DistributionChart,
  ChartCard,
  FINTECH_COLORS 
} from '@/components/ui/fintech-charts';
import { DataExportButton } from '@/components/DataExportButton';
import { ScheduledReports } from '@/components/ScheduledReports';
import { AdminMarketplaceIntegration } from '@/components/AdminMarketplaceIntegration';
import { AdminPartnersManagement } from '@/components/AdminPartnersManagement';
import { AIManagerDashboard } from '@/components/AIManagerDashboard';
import { AdvancedPartnerAnalytics } from '@/components/AdvancedPartnerAnalytics';
import { AIManagerLiveMonitor } from '@/components/AIManagerLiveMonitor';
import { AICommandCenter } from '@/components/AICommandCenter';
import { ChatSystem } from '@/components/ChatSystem';
import { AdminReferralManagement } from '@/components/AdminReferralManagement';
import { AdminReferralCampaignManager } from '@/components/AdminReferralCampaignManager';
import { AdminAIManagement } from '@/components/AdminAIManagement';
import { AdminRemoteAccess } from '@/components/AdminRemoteAccess';
import { AdminSMM } from '@/components/AdminSMM';
import { AdminBlogManagement } from '@/components/AdminBlogManagement';
import { AdminLeadsManagement } from '@/components/AdminLeadsManagement';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currency';
import { AdminBusinessAnalytics } from '@/components/AdminBusinessAnalytics';
import { SuperAdminManagement } from '@/components/SuperAdminManagement';
import {
  Users, Package, TrendingUp, Settings, CheckCircle, XCircle, Clock, Crown, Shield,
  BarChart3, DollarSign, Target, Zap, Globe, Database, FileText, Eye, AlertCircle,
  RefreshCw, Brain, MessageCircle, Gift, Monitor, ArrowUpRight, Activity, Sparkles,
  LayoutDashboard, Download, PhoneCall
} from 'lucide-react';

interface Partner {
  id: string;
  userId: string;
  user_id?: string;
  businessName: string;
  business_name?: string;
  businessCategory: string;
  business_category?: string;
  monthlyRevenue: string;
  monthly_revenue?: string;
  pricingTier: string;
  tariff_type?: string;
  commissionRate: string;
  approved: boolean;
  approvedAt: string | null;
  approved_at?: string | null;
  approvedBy: string | null;
  approved_by?: string | null;
  notes: string | null;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
  is_active?: boolean;
  ai_enabled?: boolean;
  userData?: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    phone: string;
    role: string;
    isActive?: boolean;
    is_active?: boolean;
  };
}

interface TierUpgradeRequest {
  id: string;
  partnerId: string;
  currentTier: string;
  requestedTier: string;
  reason: string | null;
  status: string;
  requestedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  adminNotes: string | null;
}

// Normalize partner data from Python backend (snake_case to camelCase)
function normalizePartner(p: any): Partner {
  return {
    id: p.id,
    userId: p.userId || p.user_id,
    businessName: p.businessName || p.business_name || 'N/A',
    businessCategory: p.businessCategory || p.business_category || 'general',
    monthlyRevenue: p.monthlyRevenue || p.monthly_revenue || '0',
    pricingTier: p.pricingTier || p.tariff_type || 'trial',
    commissionRate: p.commissionRate || p.commission_rate || '0.04',
    approved: p.approved ?? false,
    approvedAt: p.approvedAt || p.approved_at,
    approvedBy: p.approvedBy || p.approved_by,
    notes: p.notes || null,
    createdAt: p.createdAt || p.created_at || new Date().toISOString(),
    updatedAt: p.updatedAt || p.updated_at || new Date().toISOString(),
    is_active: p.is_active,
    ai_enabled: p.ai_enabled,
    userData: p.userData ? {
      id: p.userData.id,
      username: p.userData.username,
      email: p.userData.email,
      firstName: p.userData.firstName || p.userData.first_name || '',
      lastName: p.userData.lastName || p.userData.last_name || '',
      phone: p.userData.phone || '',
      role: p.userData.role,
      isActive: p.userData.isActive ?? p.userData.is_active ?? true,
    } : undefined,
  };
}

function AdminPanel() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRemotePartner, setSelectedRemotePartner] = useState<Partner | null>(null);
  const isAdmin = !!user && user.role === 'admin';

  // Data queries
  const { data: partners = [], isLoading: partnersLoading } = useQuery<Partner[]>({
    queryKey: ['/api/admin/partners'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/partners');
        if (!response.ok) {
          console.error('Admin partners API error:', response.status);
          return [];
        }
        const json = await response.json();
        // Handle both {success, data} and direct array formats
        const data = json.data || json;
        const arr = Array.isArray(data) ? data : [];
        // Normalize snake_case to camelCase
        return arr.map(normalizePartner);
      } catch (err) {
        console.error('Admin partners fetch error:', err);
        return [];
      }
    },
    enabled: isAdmin,
  });

  const { data: tierUpgradeRequests = [], isLoading: tierRequestsLoading } = useQuery<TierUpgradeRequest[]>({
    queryKey: ['/api/admin/tier-upgrade-requests'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/tier-upgrade-requests');
        if (!response.ok) {
          console.error('Tier requests API error:', response.status);
          return [];
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('Tier requests fetch error:', err);
        return [];
      }
    },
    enabled: isAdmin,
  });

  // Mutations
  const approvePartnerMutation = useMutation({
    mutationFn: async (partnerId: string) => {
      const response = await apiRequest('PUT', `/api/admin/partners/${partnerId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Hamkor tasdiqlandi", description: "Hamkor muvaffaqiyatli tasdiqlandi" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/partners'] });
    },
    onError: (error: Error) => {
      toast({ title: "Xatolik", description: error.message, variant: "destructive" });
    },
  });

  const updateTierRequestMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) => {
      const response = await apiRequest('PUT', `/api/admin/tier-upgrade-requests/${id}`, { status, adminNotes });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Tarif so'rovi yangilandi", description: "Tarif yangilash so'rovi ko'rib chiqildi" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tier-upgrade-requests'] });
    },
    onError: (error: Error) => {
      toast({ title: "Xatolik", description: error.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) setLocation('/login');
    else if (user.role !== 'admin') setLocation('/');
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

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoginForm isAdmin={true} />
      </div>
    );
  }

  // Helper functions
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Kutilmoqda', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
      approved: { label: 'Tasdiqlangan', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
      rejected: { label: 'Rad etilgan', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
      completed: { label: 'Yakunlangan', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
      in_progress: { label: 'Jarayonda', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const getTierName = (tier: string) => {
    const tierNames: Record<string, string> = {
      starter_pro: 'Starter Pro', business_standard: 'Business Standard',
      professional_plus: 'Professional Plus', enterprise_elite: 'Enterprise Elite'
    };
    return tierNames[tier] || tier;
  };

  // Statistics - ensure arrays are safe
  const safePartners = Array.isArray(partners) ? partners : [];
  const safeTierRequests = Array.isArray(tierUpgradeRequests) ? tierUpgradeRequests : [];
  
  const stats = {
    totalPartners: safePartners.length,
    approvedPartners: safePartners.filter(p => p?.approved).length,
    pendingPartners: safePartners.filter(p => !p?.approved).length,
    totalRevenue: safePartners.reduce((sum, p) => sum + parseFloat(p?.monthlyRevenue || '0'), 0),
    pendingTierRequests: safeTierRequests.filter(r => r?.status === 'pending').length
  };

  return (
    <div className="dashboard-layout flex w-full">
      <DashboardSidebar
        items={adminNavItems}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
        userRole="admin"
        userName={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}
        userPlan="Admin"
      />

      <main className="dashboard-main lg:ml-[280px] flex-1">
        <div className="dashboard-content">
          {/* Quick Stats Bar */}
          <QuickStatsHeader
            stats={[
              { label: 'Jami Hamkorlar', value: stats.totalPartners, change: 12 },
              { label: 'Faol', value: stats.approvedPartners, change: 8 },
              { label: 'Kutilmoqda', value: stats.pendingPartners },
              { label: 'Oylik Aylanma', value: formatCurrency(stats.totalRevenue), change: 15 },
            ]}
            className="animate-fade-in"
          />

          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader
                title="Umumiy Ko'rinish"
                subtitle="Platform statistikasi va real-time monitoring"
                icon={LayoutDashboard}
                badge={{ text: 'Admin', icon: Shield }}
              />

              {/* Business Analytics */}
              <AdminBusinessAnalytics />

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <PremiumStatCard
                  title="Jami Hamkorlar"
                  value={stats.totalPartners}
                  icon={Users}
                  change={{ value: 12, type: 'increase', period: 'Oxirgi oy' }}
                  delay={0}
                />
                <PremiumStatCard
                  title="Tasdiqlangan"
                  value={stats.approvedPartners}
                  icon={CheckCircle}
                  change={{ value: 8, type: 'increase', period: 'Faol hamkorlar' }}
                  delay={50}
                />
                <PremiumStatCard
                  title="Kutilayotgan"
                  value={stats.pendingPartners}
                  icon={Clock}
                  subtitle="Tasdiqlash kutilmoqda"
                  delay={100}
                />
                <PremiumStatCard
                  title="Oylik Aylanma"
                  value={formatCurrency(stats.totalRevenue)}
                  icon={DollarSign}
                  change={{ value: 15, type: 'increase', period: 'Oxirgi oy' }}
                  variant="gradient"
                  delay={150}
                />
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Partners */}
                <DataCard
                  title="So'nggi Hamkorlar"
                  subtitle="Yangi ro'yxatdan o'tganlar"
                  icon={Users}
                >
                  <div className="space-y-3">
                    {partners.slice(0, 5).map((partner, idx) => (
                      <div
                        key={partner.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold text-sm">
                          {partner.businessName?.charAt(0) || 'P'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{partner.businessName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(partner.createdAt).toLocaleDateString('uz-UZ')}
                          </p>
                        </div>
                        {getStatusBadge(partner.approved ? 'approved' : 'pending')}
                      </div>
                    ))}
                  </div>
                </DataCard>

                {/* Top Partners */}
                <DataCard
                  title="Top Hamkorlar"
                  subtitle="Eng yuqori aylanma"
                  icon={Crown}
                >
                  <div className="space-y-3">
                    {partners
                      .sort((a, b) => parseFloat(b.monthlyRevenue || '0') - parseFloat(a.monthlyRevenue || '0'))
                      .slice(0, 5)
                      .map((partner, idx) => (
                        <div
                          key={partner.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/10"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{partner.businessName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(parseFloat(partner.monthlyRevenue || '0'))}
                            </p>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        </div>
                      ))}
                  </div>
                </DataCard>

                {/* Quick Actions */}
                <DataCard
                  title="Tezkor Amallar"
                  subtitle="Asosiy funksiyalar"
                  icon={Zap}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <MiniCard
                      title="Hamkorlar"
                      value={stats.totalPartners}
                      icon={Users}
                      onClick={() => setSelectedTab('partners')}
                    />
                    <MiniCard
                      title="Tariflar"
                      value={stats.pendingTierRequests}
                      icon={Crown}
                      onClick={() => setSelectedTab('partners')}
                    />
                    <MiniCard
                      title="Marketplace"
                      value="Faol"
                      icon={Globe}
                      onClick={() => setSelectedTab('marketplace')}
                    />
                    <MiniCard
                      title="Tahlil"
                      value="Ko'rish"
                      icon={BarChart3}
                      onClick={() => setSelectedTab('analytics')}
                    />
                  </div>
                </DataCard>
              </div>

              {/* Pending Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DataCard
                  title="Kutilayotgan Amallar"
                  subtitle="Diqqat talab qiluvchi vazifalar"
                  icon={AlertCircle}
                >
                  <div className="space-y-3">
                    <div
                      className="flex items-center justify-between p-4 rounded-lg bg-amber-500/5 border border-amber-500/10 cursor-pointer hover:bg-amber-500/10 transition-colors"
                      onClick={() => setSelectedTab('partners')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Yangi Hamkorlar</p>
                          <p className="text-xs text-muted-foreground">Tasdiqlash kutmoqda</p>
                        </div>
                      </div>
                      <Badge className="bg-amber-500 text-white">{stats.pendingPartners}</Badge>
                    </div>

                    <div
                      className="flex items-center justify-between p-4 rounded-lg bg-violet-500/5 border border-violet-500/10 cursor-pointer hover:bg-violet-500/10 transition-colors"
                      onClick={() => setSelectedTab('partners')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                          <Crown className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Tarif So'rovlari</p>
                          <p className="text-xs text-muted-foreground">Yangi tarifga o'tish</p>
                        </div>
                      </div>
                      <Badge className="bg-violet-500 text-white">{stats.pendingTierRequests}</Badge>
                    </div>
                  </div>
                </DataCard>

                <DataCard
                  title="Oylik Trend"
                  subtitle="Aylanma statistikasi"
                  icon={TrendingUp}
                >
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Jami Aylanma</p>
                          <p className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(stats.totalRevenue)}
                          </p>
                        </div>
                        <Activity className="w-10 h-10 text-emerald-500/50" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">O'rtacha</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(stats.totalRevenue / (stats.totalPartners || 1))}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Faol</p>
                        <p className="text-lg font-semibold">{stats.approvedPartners}</p>
                      </div>
                    </div>
                  </div>
                </DataCard>
              </div>
            </div>
          )}

          {/* AI Manager Tab */}
          {selectedTab === 'ai-manager' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader
                title="AI Manager"
                subtitle="AI xizmatlarini boshqarish va monitoring"
                icon={Brain}
                badge={{ text: 'Premium', icon: Sparkles }}
              />

              <Tabs defaultValue="monitor" className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                  <TabsTrigger value="monitor">Live Monitor</TabsTrigger>
                  <TabsTrigger value="commands">Buyruqlar</TabsTrigger>
                  <TabsTrigger value="statistics">Statistika</TabsTrigger>
                  <TabsTrigger value="management">Boshqaruv</TabsTrigger>
                </TabsList>

                <TabsContent value="monitor"><AIManagerLiveMonitor /></TabsContent>
                <TabsContent value="commands"><AICommandCenter /></TabsContent>
                <TabsContent value="statistics"><AIManagerDashboard /></TabsContent>
                <TabsContent value="management"><AdminAIManagement /></TabsContent>
              </Tabs>
            </div>
          )}

          {/* SMM Tab */}
          {selectedTab === 'smm' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader
                title="SMM & Marketing"
                subtitle="Ijtimoiy tarmoqlar va kontent boshqaruvi"
                icon={Globe}
                badge={{ text: 'New', variant: 'secondary' }}
              />
              <AdminSMM />
            </div>
          )}

          {/* Marketplace Tab */}
          {selectedTab === 'marketplace' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader
                title="Marketplace"
                subtitle="Marketplace integratsiyalari va sozlamalar"
                icon={Globe}
              />
              <AdminMarketplaceIntegration />
            </div>
          )}

          {/* Analytics Tab - Fintech Charts */}
          {selectedTab === 'analytics' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader
                title="Tahlillar"
                subtitle="Platform statistikasi va grafiklar"
                icon={BarChart3}
                actions={
                  <DataExportButton data={partners} filename="platform-analytics" type="analytics" />
                }
              />
              
              {/* Main Charts Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ChartCard
                  title="Platform Daromadi"
                  subtitle="Oylik trend"
                  icon={DollarSign}
                  value={formatCurrency(stats.totalRevenue)}
                  change={15}
                >
                  <RevenueChart 
                    data={[
                      { name: 'Yan', value: stats.totalRevenue * 0.5 },
                      { name: 'Fev', value: stats.totalRevenue * 0.55 },
                      { name: 'Mar', value: stats.totalRevenue * 0.6 },
                      { name: 'Apr', value: stats.totalRevenue * 0.65 },
                      { name: 'May', value: stats.totalRevenue * 0.7 },
                      { name: 'Iyn', value: stats.totalRevenue * 0.75 },
                      { name: 'Iyl', value: stats.totalRevenue * 0.8 },
                      { name: 'Avg', value: stats.totalRevenue * 0.85 },
                      { name: 'Sen', value: stats.totalRevenue * 0.9 },
                      { name: 'Okt', value: stats.totalRevenue * 0.95 },
                      { name: 'Noy', value: stats.totalRevenue * 0.98 },
                      { name: 'Dek', value: stats.totalRevenue },
                    ]} 
                    height={300} 
                  />
                </ChartCard>

                <ChartCard
                  title="Hamkorlar O'sishi"
                  subtitle="Oylik dinamika"
                  icon={Users}
                  value={stats.totalPartners}
                  change={12}
                >
                  <OrdersChart 
                    data={[
                      { name: 'Yan', value: Math.floor(stats.totalPartners * 0.3) },
                      { name: 'Fev', value: Math.floor(stats.totalPartners * 0.35) },
                      { name: 'Mar', value: Math.floor(stats.totalPartners * 0.4) },
                      { name: 'Apr', value: Math.floor(stats.totalPartners * 0.5) },
                      { name: 'May', value: Math.floor(stats.totalPartners * 0.6) },
                      { name: 'Iyn', value: Math.floor(stats.totalPartners * 0.7) },
                      { name: 'Iyl', value: Math.floor(stats.totalPartners * 0.75) },
                      { name: 'Avg', value: Math.floor(stats.totalPartners * 0.8) },
                      { name: 'Sen', value: Math.floor(stats.totalPartners * 0.85) },
                      { name: 'Okt', value: Math.floor(stats.totalPartners * 0.9) },
                      { name: 'Noy', value: Math.floor(stats.totalPartners * 0.95) },
                      { name: 'Dek', value: stats.totalPartners },
                    ]} 
                    height={300} 
                  />
                </ChartCard>
              </div>

              {/* Secondary Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <ChartCard
                  title="Kvartallik O'sish"
                  subtitle="Yillik trend"
                  icon={TrendingUp}
                  value="+24%"
                  change={8}
                >
                  <GrowthChart 
                    data={[
                      { name: 'Q1', value: 12 },
                      { name: 'Q2', value: 18 },
                      { name: 'Q3', value: 15 },
                      { name: 'Q4', value: 24 },
                    ]} 
                    height={200} 
                  />
                </ChartCard>

                <ChartCard
                  title="Tarif Taqsimoti"
                  subtitle="Hamkorlar bo'yicha"
                  icon={Crown}
                >
                  <DistributionChart 
                    data={[
                      { name: 'Enterprise', value: 15 },
                      { name: 'Professional', value: 25 },
                      { name: 'Business', value: 35 },
                      { name: 'Starter', value: 25 },
                    ]} 
                    height={200}
                    innerRadius={45}
                  />
                </ChartCard>

                <ChartCard
                  title="Ko'p Metrikali"
                  subtitle="Daromad vs Hamkorlar"
                  icon={ArrowUpRight}
                >
                  <MultiMetricChart
                    data={[
                      { name: 'Yan', revenue: 50, partners: 30 },
                      { name: 'Fev', revenue: 55, partners: 35 },
                      { name: 'Mar', revenue: 60, partners: 40 },
                      { name: 'Apr', revenue: 70, partners: 50 },
                      { name: 'May', revenue: 80, partners: 60 },
                      { name: 'Iyn', revenue: 90, partners: 70 },
                    ]}
                    metrics={[
                      { key: 'revenue', name: 'Daromad', color: FINTECH_COLORS.primary },
                      { key: 'partners', name: 'Hamkorlar', color: FINTECH_COLORS.gold },
                    ]}
                    height={200}
                  />
                </ChartCard>
              </div>

              {/* Legacy Analytics */}
              <AdvancedPartnerAnalytics />
              <ComprehensiveAnalytics />
              <ScheduledReports />
            </div>
          )}

          {/* Partners Tab */}
          {selectedTab === 'partners' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader
                title="Hamkorlar"
                subtitle="Hamkorlarni boshqarish va tasdiqlash"
                icon={Users}
              />

              <Tabs defaultValue="list" className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> Ro'yxat
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> To'lovlar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list"><AdminPartnersManagement /></TabsContent>
                <TabsContent value="payments">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        To'lovlar Boshqaruvi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-green-50 border-green-200">
                          <CardContent className="p-4 text-center">
                            <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                            <p className="text-2xl font-bold text-green-700">0</p>
                            <p className="text-sm text-green-600">Muvaffaqiyatli</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-yellow-50 border-yellow-200">
                          <CardContent className="p-4 text-center">
                            <Clock className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                            <p className="text-2xl font-bold text-yellow-700">0</p>
                            <p className="text-sm text-yellow-600">Kutilmoqda</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="p-4 text-center">
                            <DollarSign className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                            <p className="text-2xl font-bold text-blue-700">0 so'm</p>
                            <p className="text-sm text-blue-600">Jami aylanma</p>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="text-center py-8 text-muted-foreground">
                        <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>To'lovlar self-service tizimida avtomatik qayta ishlanadi.</p>
                        <p className="text-sm mt-2">Hamkorlar o'zlari tarif tanlab, to'lov qiladilar.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Trends Tab */}
          {selectedTab === 'trends' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader
                title="Trendlar"
                subtitle="Trend mahsulotlar va bozor tahlili"
                icon={TrendingUp}
              />
              <TrendingProductsDashboard />
            </div>
          )}

          {/* Chat Tab */}
          {selectedTab === 'chat' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader
                title="Support"
                subtitle="Hamkorlar bilan aloqa va yordam"
                icon={MessageCircle}
              />

              <Tabs defaultValue="chat" className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="remote">Remote Access</TabsTrigger>
                </TabsList>

                <TabsContent value="chat">
                  <Card className="h-[700px]">
                    <ChatSystem isAdmin />
                  </Card>
                </TabsContent>

                <TabsContent value="remote">
                  <div className="space-y-4">
                    {partners.map((partner) => (
                      <Card key={partner.id} className="hover-lift">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Monitor className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{partner.businessName}</p>
                              <p className="text-sm text-muted-foreground">{partner.userData?.email}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRemotePartner(partner)}
                          >
                            <Monitor className="w-4 h-4 mr-2" /> Kirish
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {selectedRemotePartner && (
                    <AdminRemoteAccess
                      partnerId={selectedRemotePartner.id}
                      partnerName={selectedRemotePartner.businessName}
                      isOpen={!!selectedRemotePartner}
                      onClose={() => setSelectedRemotePartner(null)}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Referrals Tab */}
          {selectedTab === 'referrals' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader
                title="Referrallar"
                subtitle="Referral tizimi va kampaniyalar"
                icon={Gift}
              />

              <Tabs defaultValue="management" className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                  <TabsTrigger value="management">Boshqaruv</TabsTrigger>
                  <TabsTrigger value="campaigns">Kampaniyalar</TabsTrigger>
                </TabsList>

                <TabsContent value="management"><AdminReferralManagement /></TabsContent>
                <TabsContent value="campaigns"><AdminReferralCampaignManager /></TabsContent>
              </Tabs>
            </div>
          )}

          {/* Blog Tab */}
          {selectedTab === 'blog' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader
                title="Blog Boshqaruvi"
                subtitle="Maqolalar, yangiliklar va SEO kontentni boshqaring"
                icon={FileText}
              />
              <AdminBlogManagement />
            </div>
          )}

          {/* Leads Tab */}
          {selectedTab === 'leads' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader
                title="Leadlar"
                subtitle="Reklamadan kelgan potensial hamkorlar"
                icon={PhoneCall}
                badge={{ text: 'Yangi', icon: AlertCircle }}
              />
              <AdminLeadsManagement />
            </div>
          )}

          {/* Settings Tab */}
          {selectedTab === 'settings' && (
            <div className="space-y-6 mt-6">
              <DashboardHeader
                title="Sozlamalar"
                subtitle="Platforma sozlamalari va konfiguratsiya"
                icon={Settings}
              />

              {/* Super Admin Management */}
              <SuperAdminManagement />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" /> Marketplace API
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MarketplaceApiConfig />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ActionCard
                  title="Ma'lumotlar Bazasi"
                  description="Database sozlamalari va backup"
                  icon={Database}
                  action={{ label: "Sozlash", onClick: () => toast({ title: "Database", description: "Ma'lumotlar bazasi sozlamalari tez orada qo'shiladi" }) }}
                />
                <ActionCard
                  title="Hisobotlar"
                  description="Jadval va hisobot sozlamalari"
                  icon={FileText}
                  action={{ label: "Sozlash", onClick: () => toast({ title: "Hisobotlar", description: "Hisobot sozlamalari tez orada qo'shiladi" }) }}
                  variant="primary"
                />
                <ActionCard
                  title="API Dokumentatsiya"
                  description="Developer uchun API ma'lumotlari"
                  icon={Target}
                  action={{ label: "Ko'rish", onClick: () => window.open('/api/docs', '_blank') }}
                  variant="accent"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminPanel;
