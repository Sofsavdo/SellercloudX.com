import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Package,
  Video,
  Target,
  Users,
  Zap,
  Crown,
  Gift
} from 'lucide-react';

export default function PartnerPremiumDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Mock data
      setStats({
        overview: {
          totalRevenue: 15000000,
          totalOrders: 234,
          totalProducts: 45,
          growthRate: 18.5
        },
        predictions: {
          nextMonthRevenue: 17500000,
          confidence: 85,
          trend: 'up'
        },
        affiliate: {
          totalReferrals: 12,
          totalEarnings: 2400000,
          tier: 'Silver',
          nextTierProgress: 60
        },
        ai: {
          videosGenerated: 15,
          productCardsCreated: 45,
          competitorAnalyses: 8,
          creditsRemaining: 85
        },
        premium: {
          plan: 'Professional Plus',
          features: [
            'AI Video Generation',
            'Competitor Intelligence',
            'Advanced Analytics',
            'Priority Support'
          ],
          expiresAt: '2025-02-15'
        }
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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

  if (!stats) return null;

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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Premium Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Your business insights and AI tools</p>
          </div>
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2">
            <Crown className="w-4 h-4 mr-2" />
            {stats.premium.plan}
          </Badge>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Revenue
                <DollarSign className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.overview.totalRevenue)}</div>
              <p className="text-xs text-blue-100 mt-1">
                +{stats.overview.growthRate}% this month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Orders
                <ShoppingCart className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalOrders}</div>
              <p className="text-xs text-green-100 mt-1">
                Total orders
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Products
                <Package className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalProducts}</div>
              <p className="text-xs text-purple-100 mt-1">
                Active products
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Growth
                <TrendingUp className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.overview.growthRate}%</div>
              <p className="text-xs text-orange-100 mt-1">
                Month over month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Predictions */}
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-purple-600" />
              AI Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Next Month Revenue</p>
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(stats.predictions.nextMonthRevenue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Confidence</p>
                <p className="text-3xl font-bold text-green-600">{stats.predictions.confidence}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Trend</p>
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <span className="text-2xl font-bold text-green-600 ml-2">Upward</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Video className="w-5 h-5 mr-2 text-pink-600" />
                  AI Services
                </span>
                <Badge variant="outline">{stats.ai.creditsRemaining} credits left</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                <div>
                  <p className="font-semibold">Videos Generated</p>
                  <p className="text-sm text-gray-600">AI-powered product videos</p>
                </div>
                <div className="text-2xl font-bold text-pink-600">{stats.ai.videosGenerated}</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-semibold">Product Cards</p>
                  <p className="text-sm text-gray-600">AI-generated descriptions</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">{stats.ai.productCardsCreated}</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-semibold">Competitor Analyses</p>
                  <p className="text-sm text-gray-600">Market intelligence</p>
                </div>
                <div className="text-2xl font-bold text-purple-600">{stats.ai.competitorAnalyses}</div>
              </div>

              <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600">
                <Zap className="w-4 h-4 mr-2" />
                Buy More Credits
              </Button>
            </CardContent>
          </Card>

          {/* Affiliate Program */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-600" />
                  Affiliate Program
                </span>
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">
                  {stats.affiliate.tier}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Referrals</p>
                  <p className="text-2xl font-bold text-green-600">{stats.affiliate.totalReferrals}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(stats.affiliate.totalEarnings)}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress to Gold</span>
                  <span className="text-sm text-gray-600">{stats.affiliate.nextTierProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all"
                    style={{ width: `${stats.affiliate.nextTierProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">3 more referrals to reach Gold tier</p>
              </div>

              <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600">
                <Gift className="w-4 h-4 mr-2" />
                Get Referral Link
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Premium Features */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="w-5 h-5 mr-2 text-purple-600" />
              Your Premium Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.premium.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Your premium subscription expires on <strong>{stats.premium.expiresAt}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="h-20 bg-gradient-to-r from-pink-600 to-purple-600 text-lg">
            <Video className="w-6 h-6 mr-2" />
            Generate Video
          </Button>
          <Button className="h-20 bg-gradient-to-r from-blue-600 to-cyan-600 text-lg">
            <Target className="w-6 h-6 mr-2" />
            Analyze Competitors
          </Button>
          <Button className="h-20 bg-gradient-to-r from-green-600 to-teal-600 text-lg">
            <Zap className="w-6 h-6 mr-2" />
            AI Product Card
          </Button>
        </div>
      </div>
    </div>
  );
}
