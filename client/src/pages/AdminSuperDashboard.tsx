import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Activity,
  Zap,
  Globe,
  MessageSquare,
  Video,
  Target
} from 'lucide-react';

interface DashboardMetrics {
  overview: {
    totalRevenue: number;
    totalPartners: number;
    totalOrders: number;
    activeUsers: number;
    growthRate: number;
  };
  payments: {
    totalTransactions: number;
    successRate: number;
    totalAmount: number;
    byProvider: Record<string, number>;
  };
  messaging: {
    whatsappSent: number;
    telegramMessages: number;
    smsSent: number;
    deliveryRate: number;
  };
  ai: {
    videosGenerated: number;
    productCardsCreated: number;
    competitorAnalyses: number;
    totalCost: number;
  };
  affiliate: {
    totalAffiliates: number;
    totalReferrals: number;
    totalCommissions: number;
    conversionRate: number;
  };
}

export default function AdminSuperDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      // Mock data - replace with real API calls
      setMetrics({
        overview: {
          totalRevenue: 45000000,
          totalPartners: 156,
          totalOrders: 2847,
          activeUsers: 423,
          growthRate: 23.5
        },
        payments: {
          totalTransactions: 1234,
          successRate: 98.5,
          totalAmount: 45000000,
          byProvider: {
            click: 45,
            payme: 35,
            uzcard: 15,
            stripe: 5
          }
        },
        messaging: {
          whatsappSent: 5678,
          telegramMessages: 3456,
          smsSent: 2345,
          deliveryRate: 99.2
        },
        ai: {
          videosGenerated: 234,
          productCardsCreated: 1567,
          competitorAnalyses: 456,
          totalCost: 1250000
        },
        affiliate: {
          totalAffiliates: 89,
          totalReferrals: 234,
          totalCommissions: 5600000,
          conversionRate: 34.5
        }
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Super Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Real-time platform analytics and insights</p>
          </div>
          <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
            <Activity className="w-5 h-5 text-green-600 animate-pulse" />
            <span className="text-green-700 font-semibold">Live</span>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Total Revenue
                <DollarSign className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.overview.totalRevenue)}</div>
              <p className="text-xs text-blue-100 mt-1">
                +{metrics.overview.growthRate}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Total Partners
                <Users className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.overview.totalPartners}</div>
              <p className="text-xs text-purple-100 mt-1">
                {metrics.overview.activeUsers} active now
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Total Orders
                <ShoppingCart className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.overview.totalOrders.toLocaleString()}</div>
              <p className="text-xs text-green-100 mt-1">
                Across all partners
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Active Users
                <Activity className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.overview.activeUsers}</div>
              <p className="text-xs text-orange-100 mt-1">
                Online right now
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Growth Rate
                <TrendingUp className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{metrics.overview.growthRate}%</div>
              <p className="text-xs text-pink-100 mt-1">
                Month over month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="payments">💳 Payments</TabsTrigger>
            <TabsTrigger value="messaging">📱 Messaging</TabsTrigger>
            <TabsTrigger value="ai">🤖 AI Services</TabsTrigger>
            <TabsTrigger value="affiliate">🤝 Affiliate</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
          </TabsList>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics.payments.totalTransactions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{metrics.payments.successRate}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.payments.totalAmount)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Avg Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics.payments.totalAmount / metrics.payments.totalTransactions)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment Providers Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(metrics.payments.byProvider).map(([provider, percentage]) => (
                    <div key={provider}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">{provider}</span>
                        <span className="text-sm text-gray-600">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messaging Tab */}
          <TabsContent value="messaging" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
                    WhatsApp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{metrics.messaging.whatsappSent}</div>
                  <p className="text-xs text-gray-600 mt-1">Messages sent</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-blue-600" />
                    Telegram
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{metrics.messaging.telegramMessages}</div>
                  <p className="text-xs text-gray-600 mt-1">Messages sent</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-purple-600" />
                    SMS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{metrics.messaging.smsSent}</div>
                  <p className="text-xs text-gray-600 mt-1">Messages sent</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-sm">Delivery Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{metrics.messaging.deliveryRate}%</div>
                  <p className="text-xs text-gray-600 mt-1">Overall success</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Services Tab */}
          <TabsContent value="ai" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-pink-200 bg-pink-50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Video className="w-4 h-4 mr-2 text-pink-600" />
                    Videos Generated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-pink-600">{metrics.ai.videosGenerated}</div>
                  <p className="text-xs text-gray-600 mt-1">Total videos</p>
                </CardContent>
              </Card>

              <Card className="border-indigo-200 bg-indigo-50">
                <CardHeader>
                  <CardTitle className="text-sm">Product Cards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-indigo-600">{metrics.ai.productCardsCreated}</div>
                  <p className="text-xs text-gray-600 mt-1">AI generated</p>
                </CardContent>
              </Card>

              <Card className="border-cyan-200 bg-cyan-50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Target className="w-4 h-4 mr-2 text-cyan-600" />
                    Competitor Analyses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-cyan-600">{metrics.ai.competitorAnalyses}</div>
                  <p className="text-xs text-gray-600 mt-1">Market insights</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-sm">Total AI Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(metrics.ai.totalCost)}</div>
                  <p className="text-xs text-gray-600 mt-1">This month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Affiliate Tab */}
          <TabsContent value="affiliate" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Affiliates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics.affiliate.totalAffiliates}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics.affiliate.totalReferrals}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Commissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.affiliate.totalCommissions)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{metrics.affiliate.conversionRate}%</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-600">Advanced analytics charts coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
