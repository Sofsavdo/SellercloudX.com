import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Lightbulb, Target, Sparkles, RefreshCw } from 'lucide-react';

export default function TrendHunterDashboard() {
  const [trends, setTrends] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch trends
      const trendsRes = await fetch('/api/smart-ai/trends', {
        credentials: 'include'
      });
      if (trendsRes.ok) {
        const data = await trendsRes.json();
        setTrends(data.data || []);
      }

      // Fetch opportunities
      const oppsRes = await fetch('/api/smart-ai/opportunities', {
        credentials: 'include'
      });
      if (oppsRes.ok) {
        const data = await oppsRes.json();
        setOpportunities(data.data || []);
      }

      // Fetch recommendations
      const recsRes = await fetch('/api/smart-ai/recommendations', {
        credentials: 'include'
      });
      if (recsRes.ok) {
        const data = await recsRes.json();
        setRecommendations(data.data || null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTrendColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getOpportunityColor = (level: string) => {
    if (level === 'high') return 'bg-green-500';
    if (level === 'medium') return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Trend Hunter
          </h1>
          <p className="text-gray-600 mt-1">AI-powered market intelligence</p>
        </div>
        <Button
          onClick={fetchData}
          disabled={loading}
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Yangilash
        </Button>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trendlar
          </TabsTrigger>
          <TabsTrigger value="opportunities">
            <Lightbulb className="w-4 h-4 mr-2" />
            Imkoniyatlar
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Target className="w-4 h-4 mr-2" />
            Tavsiyalar
          </TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          {trends.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Trendlar yuklanmoqda...</p>
              </CardContent>
            </Card>
          ) : (
            trends.map((trend, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{trend.productName}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{trend.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getTrendColor(trend.trendScore)}`} />
                      <span className="font-bold text-lg">{trend.trendScore}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-gray-600">O'sish</p>
                      <p className="text-lg font-bold text-green-600">+{trend.growthRate}%</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Qidiruv</p>
                      <p className="text-lg font-bold text-blue-600">{trend.searchVolume.toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Raqobat</p>
                      <p className="text-lg font-bold text-purple-600 capitalize">{trend.competition}</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Mavsumiylik</p>
                      <p className="text-sm font-semibold text-orange-600">{trend.seasonality}</p>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-semibold mb-2">Narx Oralig'i:</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{formatCurrency(trend.priceRange.min)}</span>
                      <div className="flex-1 mx-4 h-2 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full" />
                      <span className="text-sm">{formatCurrency(trend.priceRange.max)}</span>
                    </div>
                    <p className="text-center text-sm font-bold mt-2">
                      O'rtacha: {formatCurrency(trend.priceRange.average)}
                    </p>
                  </div>

                  {/* Marketplaces */}
                  <div>
                    <p className="text-sm font-semibold mb-2">Eng Yaxshi Marketplace'lar:</p>
                    <div className="flex gap-2">
                      {trend.topMarketplaces.map((mp: string) => (
                        <Badge key={mp} variant="outline" className="capitalize">
                          {mp}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {trend.recommendations && trend.recommendations.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-semibold mb-2">💡 Tavsiyalar:</p>
                      <ul className="text-sm space-y-1">
                        {trend.recommendations.map((rec: string, i: number) => (
                          <li key={i}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          {opportunities.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Lightbulb className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Imkoniyatlar yuklanmoqda...</p>
              </CardContent>
            </Card>
          ) : (
            opportunities.map((opp, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{opp.niche}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{opp.reason}</p>
                    </div>
                    <Badge className={`${getOpportunityColor(opp.opportunity)} text-white`}>
                      {opp.opportunity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Daromad</p>
                      <p className="text-sm font-bold text-green-600">
                        {formatCurrency(opp.estimatedRevenue)}
                      </p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Qiyinlik</p>
                      <p className="text-sm font-bold text-orange-600 capitalize">{opp.difficulty}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Vaqt</p>
                      <p className="text-sm font-bold text-blue-600">{opp.timeToMarket}</p>
                    </div>
                  </div>

                  {/* Investment */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm font-semibold">Kerakli Investitsiya:</p>
                    <p className="text-xl font-bold text-purple-600">
                      {formatCurrency(opp.requiredInvestment)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {!recommendations ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Tavsiyalar yuklanmoqda...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Top Trending */}
              <Card>
                <CardHeader>
                  <CardTitle>🔥 Top Trending Mahsulotlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.trending?.map((trend: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{trend.productName}</p>
                        <p className="text-sm text-gray-600">{trend.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{trend.trendScore}</p>
                        <p className="text-xs text-gray-600">Trend Score</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Top Opportunities */}
              <Card>
                <CardHeader>
                  <CardTitle>💡 Top Imkoniyatlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.opportunities?.map((opp: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">{opp.niche}</p>
                        <Badge className={`${getOpportunityColor(opp.opportunity)} text-white`}>
                          {opp.opportunity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{opp.reason}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Shaxsiy Tavsiyalar</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {recommendations.suggestions?.map((suggestion: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
