// client/src/pages/AdminPanel.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sidebar, adminSidebarItems } from '@/components/Sidebar';
import { LoginForm } from '@/components/LoginForm';
import { TrendingProducts } from '@/components/TrendingProducts';
import { TrendingProductsDashboard } from '@/components/TrendingProductsDashboard';
import { MarketplaceApiConfig } from '@/components/MarketplaceApiConfig';
import { ComprehensiveAnalytics } from '@/components/ComprehensiveAnalytics';
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
import AdminManagement from '@/pages/AdminManagement';
import { StatCard } from '@/components/ui/StatCard';
import { ModernButton } from '@/components/ui/ModernButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/currency';
import {
  Users,
  Package,
  TrendingUp,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  Shield,
  BarChart3,
  DollarSign,
  Target,
  Zap,
  Globe,
  Database,
  FileText,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  AlertCircle,
  RefreshCw,
  Brain,
  MessageCircle,
  Gift,
  Monitor
} from 'lucide-react';



interface Partner {
  id: string;
  userId: string;
  businessName: string;
  businessCategory: string;
  monthlyRevenue: string;
  pricingTier: string;
  commissionRate: string;
  approved: boolean;
  approvedAt: string | null;
  approvedBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  userData?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    isActive: boolean;
  };
}

// FULFILLMENT FEATURE - Hidden for SaaS-only mode
// Uncomment when fulfillment services are ready
/*
interface FulfillmentRequest {
  id: string;
  partnerId: string;
  productId: string | null;
  requestType: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  estimatedCost: string | null;
  actualCost: string | null;
  assignedTo: string | null;
  dueDate: string | null;
  completedAt: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}
*/

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

export default function AdminPanel() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRemotePartner, setSelectedRemotePartner] = useState<Partner | null>(null);
  const isAdmin = !!user && user.role === 'admin';

  // Data queries (must be declared before any early returns)
  const { data: partners = [], isLoading: partnersLoading } = useQuery<Partner[]>({
    queryKey: ['/api/admin/partners'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/partners');
      return response.json();
    },
    enabled: isAdmin,
  });

  // FULFILLMENT FEATURE - Hidden for SaaS-only mode
  // Uncomment when fulfillment services are ready
  /*
  const { data: fulfillmentRequests = [], isLoading: requestsLoading } = useQuery<FulfillmentRequest[]>({
    queryKey: ['/api/fulfillment-requests'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/fulfillment-requests');
      return response.json();
    },
    enabled: isAdmin,
  });
  */
  const fulfillmentRequests: any[] = [];
  const requestsLoading = false;

  const { data: tierUpgradeRequests = [], isLoading: tierRequestsLoading } = useQuery<TierUpgradeRequest[]>({
    queryKey: ['/api/admin/tier-upgrade-requests'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/tier-upgrade-requests');
      return response.json();
    },
    enabled: isAdmin,
  });

  // Mutations (also must be declared before any early returns)
  const approvePartnerMutation = useMutation({
    mutationFn: async (partnerId: string) => {
      const response = await apiRequest('PUT', `/api/admin/partners/${partnerId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Hamkor tasdiqlandi",
        description: "Hamkor muvaffaqiyatli tasdiqlandi",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/partners'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTierRequestMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) => {
      const response = await apiRequest('PUT', `/api/admin/tier-upgrade-requests/${id}`, {
        status,
        adminNotes
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tarif so'rovi yangilandi",
        description: "Tarif yangilash so'rovi ko'rib chiqildi",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tier-upgrade-requests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auth tekshiruvi + redirect
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLocation('/login');
    } else if (user.role !== 'admin') {
      setLocation('/');
    }
  }, [user, authLoading, setLocation]);

  // Loading holati - Modern Design
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" text="Admin panel yuklanmoqda..." />
        </div>
      </div>
    );
  }

  // Ruxsat yo'q
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
      pending: { label: 'Kutilmoqda', variant: 'secondary' as const, icon: Clock },
      approved: { label: 'Tasdiqlangan', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Rad etilgan', variant: 'destructive' as const, icon: XCircle },
      completed: { label: 'Yakunlangan', variant: 'default' as const, icon: CheckCircle },
      in_progress: { label: 'Jarayonda', variant: 'secondary' as const, icon: RefreshCw }
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

  const getTierName = (tier: string) => {
    const tierNames = {
      starter_pro: 'Starter Pro',
      business_standard: 'Business Standard',
      professional_plus: 'Professional Plus',
      enterprise_elite: 'Enterprise Elite'
    };
    return tierNames[tier as keyof typeof tierNames] || tier;
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

  // Filter data
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = !searchTerm ||
      partner.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.userData?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.userData?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
   
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'approved' && partner.approved) ||
      (filterStatus === 'pending' && !partner.approved);
   
    return matchesSearch && matchesStatus;
  });

  const filteredRequests = fulfillmentRequests.filter(request => {
    const matchesSearch = !searchTerm ||
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
   
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
   
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    totalPartners: partners.length,
    approvedPartners: partners.filter(p => p.approved).length,
    pendingPartners: partners.filter(p => !p.approved).length,
    totalRequests: fulfillmentRequests.length,
    pendingRequests: fulfillmentRequests.filter(r => r.status === 'pending').length,
    completedRequests: fulfillmentRequests.filter(r => r.status === 'completed').length,
    tierUpgradeRequests: tierUpgradeRequests.filter(r => r.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Sidebar 
        items={adminSidebarItems} 
        userRole="admin" 
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />
     
      <div className="flex-1 lg:ml-64 transition-all duration-300 min-h-screen">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gradient-business">Admin Panel</h1>
                <p className="text-muted-foreground mt-2">
                  Platform boshqaruvi va hamkorlar nazorati
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
                <Badge variant="secondary">
                  {user.firstName} {user.lastName}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Overview - Modern Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Jami Hamkorlar"
              value={stats.totalPartners}
              icon={Users}
              trend={{ value: 12, isPositive: true }}
              subtitle="Oxirgi oyda"
              delay={0}
            />
            <StatCard
              title="Tasdiqlangan"
              value={stats.approvedPartners}
              icon={CheckCircle}
              trend={{ value: 8, isPositive: true }}
              subtitle="Faol hamkorlar"
              delay={100}
            />
            <StatCard
              title="Kutilayotgan"
              value={stats.pendingPartners}
              icon={Clock}
              subtitle="Tasdiqlash kutilmoqda"
              delay={200}
            />
            <StatCard
              title="So'rovlar"
              value={stats.totalRequests}
              icon={Package}
              trend={{ value: 15, isPositive: true }}
              subtitle="Jami so'rovlar"
              delay={300}
              gradient={true}
            />
          </div>

          {/* Main Content - Professional Finance Style */}
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {selectedTab === 'overview' && 'Umumiy Ko\'rinish'}
                    {selectedTab === 'ai-manager' && 'AI Manager'}
                    {selectedTab === 'smm' && 'Social Media Management'}
                    {selectedTab === 'marketplace' && 'Marketplace'}
                    {selectedTab === 'analytics' && 'Tahlil'}
                    {selectedTab === 'partners' && 'Hamkorlar'}
                    {selectedTab === 'trends' && 'Trendlar'}
                    {selectedTab === 'settings' && 'Sozlamalar'}
                    {selectedTab === 'chat' && 'Support Chat'}
                    {selectedTab === 'referrals' && 'Referrallar'}
                    {selectedTab === 'admin-management' && 'Admin Boshqaruv'}
                  </h1>
                  <p className="text-slate-600 mt-1">
                    {selectedTab === 'overview' && 'Platforma statistikasi va umumiy ko\'rinish'}
                    {selectedTab === 'ai-manager' && 'AI xizmatlarini boshqarish va monitoring'}
                    {selectedTab === 'smm' && 'Ijtimoiy tarmoqlarni boshqarish va kontent yaratish'}
                    {selectedTab === 'marketplace' && 'Marketplace integratsiyalari'}
                    {selectedTab === 'analytics' && 'Batafsil tahlil va hisobotlar'}
                    {selectedTab === 'partners' && 'Hamkorlarni boshqarish'}
                    {selectedTab === 'trends' && 'Trend mahsulotlar va bozor tahlili'}
                    {selectedTab === 'settings' && 'Platforma sozlamalari'}
                    {selectedTab === 'chat' && 'Yordam va qo\'llab-quvvatlash'}
                    {selectedTab === 'referrals' && 'Referral tizimi boshqaruvi'}
                    {selectedTab === 'admin-management' && 'Adminlarni yaratish, tahrirlash va boshqarish'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                  <Badge variant="secondary">
                    {user.firstName} {user.lastName}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-6">
            {/* Overview Tab */}
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      So'nggi Faoliyat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {partners.slice(0, 5).map((partner) => (
                        <div key={partner.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <div>
                            <p className="font-medium text-sm">{partner.businessName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(partner.createdAt).toLocaleDateString('uz-UZ')}
                            </p>
                          </div>
                          {getStatusBadge(partner.approved ? 'approved' : 'pending')}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Partners */}
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-500" />
                      Top Hamkorlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {partners
                        .sort((a, b) => (parseFloat(b.monthlyRevenue || '0') - parseFloat(a.monthlyRevenue || '0')))
                        .slice(0, 5)
                        .map((partner, idx) => (
                          <div key={partner.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{partner.businessName}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(parseFloat(partner.monthlyRevenue || '0'))}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Tezkor Amallar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button onClick={() => setSelectedTab('partners')} variant="outline" className="w-full justify-start" size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        Hamkorlarni boshqarish
                      </Button>
                      <Button onClick={() => setSelectedTab('requests')} variant="outline" className="w-full justify-start" size="sm">
                        <Package className="w-4 h-4 mr-2" />
                        So'rovlarni ko'rish
                      </Button>
                      <Button onClick={() => setSelectedTab('tiers')} variant="outline" className="w-full justify-start" size="sm">
                        <Crown className="w-4 h-4 mr-2" />
                        Tarif so'rovlari
                      </Button>
                      <Button onClick={() => setSelectedTab('marketplace')} variant="outline" className="w-full justify-start" size="sm">
                        <Globe className="w-4 h-4 mr-2" />
                        Marketplace
                      </Button>
                      <Button onClick={() => setSelectedTab('analytics')} variant="outline" className="w-full justify-start" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Tahlil
                      </Button>
                      <Button onClick={() => setSelectedTab('reports')} variant="outline" className="w-full justify-start" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Hisobotlar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                </div>

                {/* Additional Overview Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trend */}
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Oylik Aylanma Trendi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <div>
                          <p className="text-sm text-muted-foreground">Jami Aylanma</p>
                          <p className="text-2xl font-bold text-green-700">
                            {formatCurrency(partners.reduce((sum, p) => sum + parseFloat(p.monthlyRevenue || '0'), 0))}
                          </p>
                        </div>
                        <TrendingUp className="w-12 h-12 text-green-500 opacity-50" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs text-muted-foreground">O'rtacha</p>
                          <p className="text-lg font-bold text-blue-700">
                            {formatCurrency(partners.length > 0 ? partners.reduce((sum, p) => sum + parseFloat(p.monthlyRevenue || '0'), 0) / partners.length : 0)}
                          </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <p className="text-xs text-muted-foreground">Faol Hamkorlar</p>
                          <p className="text-lg font-bold text-purple-700">
                            {partners.filter(p => p.approved).length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Actions */}
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      Kutilayotgan Amallar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors cursor-pointer" onClick={() => setSelectedTab('partners')}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Yangi Hamkorlar</p>
                            <p className="text-xs text-muted-foreground">Tasdiqlash kutmoqda</p>
                          </div>
                        </div>
                        <Badge className="bg-orange-500">{partners.filter(p => !p.approved).length}</Badge>
                      </div>
                      
                      {/* FULFILLMENT FEATURE - Hidden for SaaS-only mode */}
                      {false && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer" onClick={() => setSelectedTab('requests')}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Fulfillment So'rovlar</p>
                            <p className="text-xs text-muted-foreground">Ko'rib chiqish kerak</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-500">{fulfillmentRequests.filter(r => r.status === 'pending').length}</Badge>
                      </div>
                      )}

                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors cursor-pointer" onClick={() => setSelectedTab('tiers')}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                            <Crown className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Tarif So'rovlari</p>
                            <p className="text-xs text-muted-foreground">Yangi tarifga o'tish</p>
                          </div>
                        </div>
                        <Badge className="bg-purple-500">{tierUpgradeRequests.filter(r => r.status === 'pending').length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </div>
              </div>
            )}

            {/* Support Chat Tab */}
            {selectedTab === 'chat' && (
              <div className="space-y-4">
                <Tabs defaultValue="chat" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="remote-access">Remote Access</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="chat">
                  <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-indigo-900">
                        <MessageCircle className="w-5 h-5" />
                        Support Chat
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600">
                        Hamkorlar bilan real-time yozishma, fayl almashinuvi va statuslarni shu yerda boshqaring.
                      </p>
                    </CardContent>
                  </Card>
                  <div className="rounded-xl border bg-white shadow-soft h-[720px]">
                    <ChatSystem isAdmin />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="remote-access">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                      <Monitor className="h-8 w-8 text-indigo-600" />
                      Remote Access
                    </h2>
                    <p className="text-slate-600">
                      Hamkor kabinetlariga masofadan kirish va sozlash
                    </p>
                  </div>
                  <div className="space-y-4">
                    {partners.length > 0 ? (
                      partners.map((partner) => (
                        <Card key={partner.id} className="shadow-elegant hover-lift">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>{partner.businessName}</span>
                              <Badge variant={partner.approved ? "default" : "secondary"}>
                                {partner.approved ? 'Tasdiqlangan' : 'Kutilmoqda'}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {partner.businessCategory} • {partner.userData?.email || 'Email yo\'q'}
                                </p>
                              </div>
                              <Button
                                onClick={() => setSelectedRemotePartner(partner)}
                                variant="outline"
                                size="sm"
                              >
                                <Monitor className="w-4 h-4 mr-2" />
                                Remote Access
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Monitor className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-muted-foreground">Hozircha hamkorlar yo'q</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  {/* Remote Access Modal */}
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

            {/* Referrals Management Tab - Includes Campaigns */}
            {selectedTab === 'referrals' && (
              <div className="space-y-6">
                <Tabs defaultValue="management" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="management">Referral Boshqaruvi</TabsTrigger>
                    <TabsTrigger value="campaigns">Konkurslar</TabsTrigger>
                  </TabsList>
                  <TabsContent value="management">
                    <AdminReferralManagement />
                  </TabsContent>
                  <TabsContent value="campaigns">
                    <AdminReferralCampaignManager />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* SMM Tab */}
            {selectedTab === 'smm' && (
              <div className="space-y-6">
                <AdminSMM />
              </div>
            )}

            {/* AI MANAGER TAB - ENHANCED with AI Management */}
            {selectedTab === 'ai-manager' && (
              <div className="space-y-6">
              <Tabs defaultValue="monitor" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="monitor">Live Monitor</TabsTrigger>
                  <TabsTrigger value="commands">Buyruqlar</TabsTrigger>
                  <TabsTrigger value="statistics">Statistika</TabsTrigger>
                  <TabsTrigger value="management">AI Boshqaruv</TabsTrigger>
                </TabsList>
                
                <TabsContent value="monitor">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                      <Brain className="h-8 w-8 text-purple-600" />
                      AI Manager Live Monitor
                    </h2>
                    <p className="text-slate-600">
                      AI Manager'ni real-time kuzating
                    </p>
                  </div>
                  <AIManagerLiveMonitor />
                </TabsContent>

                <TabsContent value="commands">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                      <Brain className="h-8 w-8 text-purple-600" />
                      AI Command Center
                    </h2>
                    <p className="text-slate-600">
                      AI Manager'ga buyruqlar bering va sozlang
                    </p>
                  </div>
                  <AICommandCenter />
                </TabsContent>

                <TabsContent value="statistics">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                      <Brain className="h-8 w-8 text-purple-600" />
                      AI Manager Statistics
                    </h2>
                    <p className="text-slate-600">
                      AI Manager statistikasi va ko'rsatkichlari
                    </p>
                  </div>
                  <AIManagerDashboard />
                </TabsContent>

                <TabsContent value="management">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                      <Brain className="h-8 w-8 text-purple-600" />
                      AI Boshqaruv
                    </h2>
                    <p className="text-slate-600">
                      AI xizmatlarini boshqarish, xarajatlarni kuzatish va sozlash
                    </p>
                  </div>
                  <AdminAIManagement />
                </TabsContent>
              </Tabs>
            </div>
            )}

            {/* Marketplace Integration Tab */}
            {selectedTab === 'marketplace' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Marketplace Integratsiyasi Boshqaruvi</h2>
                  <p className="text-muted-foreground mb-6">
                    Hamkorlardan kelgan marketplace ulanish so'rovlarini ko'rib chiqing va tasdiqlang
                  </p>
                </div>
                <AdminMarketplaceIntegration />
              </div>
            )}

            {/* Partners Tab - YANGI MUKAMMAL with Mini Menu */}
            {selectedTab === 'partners' && (
              <div className="space-y-6">
                <Tabs defaultValue="list" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="list">
                      <Users className="w-4 h-4 mr-2" />
                      Hamkorlar Ro'yxati
                    </TabsTrigger>
                    <TabsTrigger value="tiers">
                      <Crown className="w-4 h-4 mr-2" />
                      Tariflar
                    </TabsTrigger>
                    {/* FULFILLMENT FEATURE - Hidden for SaaS-only mode */}
                    {false && (
                      <TabsTrigger value="requests">
                        <Package className="w-4 h-4 mr-2" />
                        So'rovlar
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="list">
                    <AdminPartnersManagement />
                  </TabsContent>

                  <TabsContent value="tiers">
                    {/* Tier Upgrade Requests */}
                    <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">Tarif Yangilash So'rovlari</h3>
                        <p className="text-muted-foreground">Hamkorlardan kelgan tarif yangilash so'rovlari</p>
                      </div>
                      <Badge variant="secondary">
                        {tierUpgradeRequests.length} ta so'rov
                      </Badge>
                    </div>
                    <div className="grid gap-4">
                      {tierUpgradeRequests.length === 0 ? (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <Crown className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-muted-foreground">Hozircha tarif yangilash so'rovlari yo'q</p>
                          </CardContent>
                        </Card>
                      ) : (
                        tierUpgradeRequests.map((request) => (
                          <Card key={request.id} className="shadow-elegant hover-lift">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <Crown className="w-6 h-6 text-primary" />
                                    <div>
                                      <h4 className="text-lg font-semibold">
                                        {getTierName(request.currentTier)} → {getTierName(request.requestedTier)}
                                      </h4>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(request.requestedAt).toLocaleDateString('uz-UZ')}
                                      </p>
                                    </div>
                                  </div>
                                  {request.reason && (
                                    <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                                      <p className="text-sm text-muted-foreground mb-1">Sabab:</p>
                                      <p className="text-sm">{request.reason}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(request.status)}
                                </div>
                              </div>
                              {request.status === 'pending' && (
                                <div className="space-y-4">
                                  <Textarea
                                    placeholder="Admin izohi..."
                                    className="min-h-[80px]"
                                    id={`admin-notes-${request.id}`}
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => {
                                        const textarea = document.getElementById(`admin-notes-${request.id}`) as HTMLTextAreaElement;
                                        updateTierRequestMutation.mutate({
                                          id: request.id,
                                          status: 'approved',
                                          adminNotes: textarea?.value || ''
                                        });
                                      }}
                                      disabled={updateTierRequestMutation.isPending}
                                      className="bg-green-600 hover:bg-green-700"
                                      size="sm"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Tasdiqlash
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        const textarea = document.getElementById(`admin-notes-${request.id}`) as HTMLTextAreaElement;
                                        updateTierRequestMutation.mutate({
                                          id: request.id,
                                          status: 'rejected',
                                          adminNotes: textarea?.value || ''
                                        });
                                      }}
                                      disabled={updateTierRequestMutation.isPending}
                                      variant="destructive"
                                      size="sm"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Rad etish
                                    </Button>
                                  </div>
                                </div>
                              )}
                              {request.adminNotes && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <p className="text-sm text-blue-600 font-medium mb-1">Admin izohi:</p>
                                  <p className="text-sm text-blue-800">{request.adminNotes}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                  </TabsContent>

                  {/* FULFILLMENT FEATURE - Hidden for SaaS-only mode */}
                  {false && (
                    <TabsContent value="requests">
                      {/* Fulfillment Requests */}
                      <div className="space-y-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold">Fulfillment So'rovlari</h3>
                            <p className="text-muted-foreground">Hamkorlardan kelgan so'rovlarni boshqarish</p>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="So'rov qidirish..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-64"
                            />
                            <select
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                              className="px-3 py-2 border rounded-md"
                            >
                              <option value="all">Barchasi</option>
                              <option value="pending">Kutilmoqda</option>
                              <option value="in_progress">Jarayonda</option>
                              <option value="completed">Bajarildi</option>
                              <option value="rejected">Rad etildi</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid gap-4">
                          {fulfillmentRequests.length === 0 ? (
                            <Card>
                              <CardContent className="p-8 text-center">
                                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-muted-foreground">Hozircha so'rovlar yo'q</p>
                              </CardContent>
                            </Card>
                          ) : (
                            fulfillmentRequests
                              .filter(req => {
                                const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    req.description.toLowerCase().includes(searchTerm.toLowerCase());
                                const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
                                return matchesSearch && matchesStatus;
                              })
                              .map((request) => (
                                <Card key={request.id} className="shadow-elegant hover-lift">
                                  <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                          <Package className="w-5 h-5 text-primary" />
                                          <h4 className="text-lg font-semibold">{request.title}</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">{request.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                          <span>Turi: {request.requestType}</span>
                                          <span>Muhimlik: {request.priority || 'medium'}</span>
                                          <span>{new Date(request.createdAt).toLocaleDateString('uz-UZ')}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {getStatusBadge(request.status)}
                                      </div>
                                    </div>
                                    {request.status === 'pending' && (
                                      <div className="flex gap-2 mt-4">
                                        <Button
                                          onClick={() => acceptRequestMutation.mutate(request.id)}
                                          disabled={acceptRequestMutation.isPending}
                                          className="bg-green-600 hover:bg-green-700"
                                          size="sm"
                                        >
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Qabul qilish
                                        </Button>
                                        <Button
                                          onClick={() => rejectRequestMutation.mutate(request.id)}
                                          disabled={rejectRequestMutation.isPending}
                                          variant="destructive"
                                          size="sm"
                                        >
                                          <XCircle className="w-4 h-4 mr-2" />
                                          Rad etish
                                        </Button>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            )}


            {/* Trending Products Tab - ADVANCED VERSION */}
            {selectedTab === 'trends' && (
              <div className="space-y-6">
                <TrendingProductsDashboard />
              </div>
            )}

            {/* Analytics Tab */}
            {selectedTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <BarChart3 className="w-7 h-7 text-purple-600" />
                  Platformaning to'liq tahlili
                  </h2>
                  <p className="text-muted-foreground mb-6">Hamkorlar bo'yicha foyda breakdown, AI usage, marketplace statistika</p>
                </div>

                {/* ADVANCED PARTNER ANALYTICS - NEW! */}
                <AdvancedPartnerAnalytics />

                {/* Comprehensive Analytics */}
                <div className="grid gap-6 mt-6">
                  <ComprehensiveAnalytics />
                </div>

                {/* Reports Export */}
                <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Hisobotlarni Yuklab Olish
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <DataExportButton 
                      data={partners} 
                      filename="platform-analytics"
                      type="analytics"
                    />
                    <ScheduledReports />
                  </div>
                </CardContent>
                </Card>
              </div>
            )}

            {/* Admin Management Tab */}
            {selectedTab === 'admin-management' && (
              <div className="space-y-6">
                <AdminManagement />
              </div>
            )}

            {/* Settings Tab */}
            {selectedTab === 'settings' && (
              <div className="space-y-6">
                {/* Marketplace API - Full Width */}
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Marketplace API Sozlamalari
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      Marketplace platformalari bilan integratsiya uchun API kalitlarini sozlang
                    </p>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <MarketplaceApiConfig />
                  </CardContent>
                </Card>

                {/* System Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="shadow-elegant hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Ma'lumotlar Bazasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Database sozlamalari va backup
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Jami yozuvlar:</span>
                        <span className="font-semibold">{partners.length + fulfillmentRequests.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Hamkorlar:</span>
                        <span className="font-semibold">{partners.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>So'rovlar:</span>
                        <span className="font-semibold">{fulfillmentRequests.length}</span>
                      </div>
                    </div>
                  </CardContent>
                  </Card>

                  <Card className="shadow-elegant hover-lift">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Xavfsizlik
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Tizim xavfsizligi va ruxsatlar
                      </p>
                      <div className="space-y-2">
                        <Badge variant="default" className="w-full justify-center">
                          SSL Faol
                        </Badge>
                        <Badge variant="default" className="w-full justify-center">
                          2FA Yoqilgan
                        </Badge>
                        <Badge variant="default" className="w-full justify-center">
                          Session Secure
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-elegant hover-lift">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Tizim
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Umumiy tizim sozlamalari
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Versiya:</span>
                          <span className="font-semibold">2.0.1</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Node:</span>
                          <span className="font-semibold">v20.x</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Database:</span>
                          <span className="font-semibold">SQLite</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
