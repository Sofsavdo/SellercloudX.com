// ADVANCED TREND HUNTER - Real Market Intelligence System
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/currency';
import { 
  TrendingUp, TrendingDown, Lightbulb, Target, Sparkles, RefreshCw,
  DollarSign, BarChart3, PieChart, Flame, Clock, Users, Package,
  Globe, Award, Zap, Brain, ArrowUpRight, ArrowDownRight, Star
} from 'lucide-react';

interface TrendData {
  id: string;
  productName: string;
  category: string;
  trendScore: number;
  growthRate: number;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  seasonality: string;
  priceRange: { min: number; max: number; average: number };
  profitMargin: number;
  topMarketplaces: string[];
  weeklyChange: number;
  monthlyChange: number;
  predictedGrowth: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface MarketOpportunity {
  niche: string;
  reason: string;
  opportunity: 'high' | 'medium' | 'low';
  estimatedRevenue: number;
  difficulty: string;
  timeToMarket: string;
  requiredInvestment: number;
  roi: number;
  marketSize: number;
  growthPotential: number;
}

interface FinancialForecast {
  period: string;
  revenue: number;
  costs: number;
  profit: number;
  growth: number;
  riskAdjustedProfit: number;
}

export function AdvancedTrendHunter() {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [opportunities, setOpportunities] = useState<MarketOpportunity[]>([]);
  const [forecasts, setForecasts] = useState<FinancialForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch trends from Python backend
      const trendsRes = await fetch('/api/trends/hunter?category=' + selectedCategory);
      if (trendsRes.ok) {
        const data = await trendsRes.json();
        setTrends(data.data || []);
      } else {
        setTrends([]);
      }

      // Fetch opportunities
      const oppsRes = await fetch('/api/trends/opportunities');
      if (oppsRes.ok) {
        const data = await oppsRes.json();
        setOpportunities(data.data || []);
      } else {
        setOpportunities([]);
      }

      // Fetch forecasts
      const forecastsRes = await fetch('/api/trends/forecasts');
      if (forecastsRes.ok) {
        const data = await forecastsRes.json();
        setForecasts(data.data || []);
      } else {
        setForecasts([]);
      }
    } catch (error) {
      console.error('Error fetching trend data:', error);
      setTrends([]);
      setOpportunities([]);
      setForecasts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fallback generators removed - using real API data only
  const generateMockTrends = (): TrendData[] => [];
    {
      id: '1',
      productName: 'Smart Watch Ultra Pro',
      category: 'Elektronika',
      trendScore: 94,
      growthRate: 47,
      searchVolume: 125000,
      competition: 'medium',
      seasonality: 'Barcha mavsumlar',
      priceRange: { min: 150000, max: 450000, average: 280000 },
      profitMargin: 35,
      topMarketplaces: ['Uzum', 'Wildberries', 'Ozon'],
      weeklyChange: 12,
      monthlyChange: 47,
      predictedGrowth: 65,
      riskLevel: 'low',
      recommendations: ['Yangi yil oldidan zaxira oshiring', 'Premium segment ga kirishni o\'ylab ko\'ring']
    },
    {
      id: '2',
      productName: 'Organic Skincare Set',
      category: 'Go\'zallik',
      trendScore: 89,
      growthRate: 38,
      searchVolume: 89000,
      competition: 'low',
      seasonality: 'Qish-Bahor',
      priceRange: { min: 80000, max: 250000, average: 145000 },
      profitMargin: 45,
      topMarketplaces: ['Wildberries', 'Uzum'],
      weeklyChange: 8,
      monthlyChange: 38,
      predictedGrowth: 52,
      riskLevel: 'low',
      recommendations: ['Natural ingredientlarni ta\'kidlang', 'Video contentga sarflang']
    },
    {
      id: '3',
      productName: 'Gaming Keyboard RGB',
      category: 'Gaming',
      trendScore: 86,
      growthRate: 32,
      searchVolume: 67000,
      competition: 'high',
      seasonality: 'Yil davomida',
      priceRange: { min: 120000, max: 350000, average: 210000 },
      profitMargin: 28,
      topMarketplaces: ['Ozon', 'Uzum', 'Wildberries'],
      weeklyChange: 5,
      monthlyChange: 32,
      predictedGrowth: 40,
      riskLevel: 'medium',
      recommendations: ['E-sports hamkorliklarini o\'rganing', 'Stream bilan birgalikda marketing']
    },
    {
      id: '4',
      productName: 'Yoga Mat Premium',
      category: 'Sport',
      trendScore: 82,
      growthRate: 28,
      searchVolume: 45000,
      competition: 'low',
      seasonality: 'Yanvar-Mart',
      priceRange: { min: 50000, max: 180000, average: 95000 },
      profitMargin: 42,
      topMarketplaces: ['Uzum', 'Wildberries'],
      weeklyChange: 15,
      monthlyChange: 28,
      predictedGrowth: 35,
      riskLevel: 'low',
      recommendations: ['Yangi yil rezolutionlaridan foydalaning', 'Fitness influencer bilan ishlang']
    }
  ];

  const generateMockOpportunities = (): MarketOpportunity[] => [
    {
      niche: 'Smart Home Devices',
      reason: 'O\'zbekistonda aqlli uy qurilmalari bozori 150% o\'sgan',
      opportunity: 'high',
      estimatedRevenue: 250000000,
      difficulty: 'O\'rta',
      timeToMarket: '2-3 oy',
      requiredInvestment: 15000000,
      roi: 340,
      marketSize: 5000000000,
      growthPotential: 85
    },
    {
      niche: 'Organic Baby Products',
      reason: 'Ota-onalar tabiiy mahsulotlarga o\'tayotgani kuzatilmoqda',
      opportunity: 'high',
      estimatedRevenue: 180000000,
      difficulty: 'Past',
      timeToMarket: '1-2 oy',
      requiredInvestment: 8000000,
      roi: 420,
      marketSize: 3000000000,
      growthPotential: 72
    },
    {
      niche: 'Pet Accessories Premium',
      reason: 'Uy hayvonlari soni va ularga sarflanadigan pul oshmoqda',
      opportunity: 'medium',
      estimatedRevenue: 120000000,
      difficulty: 'Past',
      timeToMarket: '1 oy',
      requiredInvestment: 5000000,
      roi: 380,
      marketSize: 2000000000,
      growthPotential: 58
    }
  ];

  const generateMockForecasts = (): FinancialForecast[] => [
    { period: 'Yanvar 2025', revenue: 85000000, costs: 52000000, profit: 33000000, growth: 15, riskAdjustedProfit: 28000000 },
    { period: 'Fevral 2025', revenue: 92000000, costs: 55000000, profit: 37000000, growth: 18, riskAdjustedProfit: 31000000 },
    { period: 'Mart 2025', revenue: 110000000, costs: 62000000, profit: 48000000, growth: 24, riskAdjustedProfit: 40000000 },
    { period: 'Aprel 2025', revenue: 125000000, costs: 68000000, profit: 57000000, growth: 28, riskAdjustedProfit: 48000000 },
    { period: 'May 2025', revenue: 140000000, costs: 75000000, profit: 65000000, growth: 32, riskAdjustedProfit: 55000000 },
    { period: 'Iyun 2025', revenue: 155000000, costs: 82000000, profit: 73000000, growth: 35, riskAdjustedProfit: 62000000 }
  ];

  const getTrendColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getCompetitionBadge = (level: string) => {
    if (level === 'low') return 'bg-success/10 text-success border-success/20';
    if (level === 'medium') return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  };

  const getRiskBadge = (level: string) => {
    if (level === 'low') return 'bg-success text-success-foreground';
    if (level === 'medium') return 'bg-warning text-warning-foreground';
    return 'bg-destructive text-destructive-foreground';
  };

  const totalPredictedRevenue = forecasts.reduce((sum, f) => sum + f.revenue, 0);
  const totalPredictedProfit = forecasts.reduce((sum, f) => sum + f.profit, 0);
  const avgGrowthRate = Math.round(forecasts.reduce((sum, f) => sum + f.growth, 0) / forecasts.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <span className="text-gradient-primary">Trend Hunter Pro</span>
          </h1>
          <p className="text-muted-foreground mt-2">AI-powered bozor tahlili va moliyaviy prognozlar</p>
        </div>
        <Button
          onClick={fetchData}
          disabled={loading}
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Ma'lumotlarni Yangilash
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-fintech">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Eng yuqori trend</p>
                <p className="text-2xl font-bold text-foreground">{trends[0]?.trendScore || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-fintech">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prognoz daromad</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPredictedRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-fintech">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[hsl(45,93%,47%)]/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-[hsl(45,93%,47%)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prognoz foyda</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPredictedProfit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-fintech">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">O'rtacha o'sish</p>
                <p className="text-2xl font-bold text-foreground">+{avgGrowthRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-muted/30">
          <TabsTrigger value="trends" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trendlar
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Lightbulb className="w-4 h-4 mr-2" />
            Imkoniyatlar
          </TabsTrigger>
          <TabsTrigger value="forecasts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <PieChart className="w-4 h-4 mr-2" />
            Prognozlar
          </TabsTrigger>
          <TabsTrigger value="profit" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <DollarSign className="w-4 h-4 mr-2" />
            Foyda Tahlili
          </TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          {trends.map((trend) => (
            <Card key={trend.id} className="card-fintech card-fintech-active">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl text-foreground">{trend.productName}</CardTitle>
                      <Badge variant="outline">{trend.category}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${getTrendColor(trend.trendScore)}`}>{trend.trendScore}</p>
                      <p className="text-xs text-muted-foreground">Trend Score</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3 bg-success/10 rounded-xl border border-success/20">
                    <p className="text-xs text-muted-foreground">Haftalik o'sish</p>
                    <p className="text-lg font-bold text-success flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" />
                      +{trend.weeklyChange}%
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <p className="text-xs text-muted-foreground">Oylik o'sish</p>
                    <p className="text-lg font-bold text-primary flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" />
                      +{trend.monthlyChange}%
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground">Qidiruv hajmi</p>
                    <p className="text-lg font-bold text-foreground">{(trend.searchVolume / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground">Foyda %</p>
                    <p className="text-lg font-bold text-foreground">{trend.profitMargin}%</p>
                  </div>
                  <div className="p-3 bg-[hsl(45,93%,47%)]/10 rounded-xl border border-[hsl(45,93%,47%)]/20">
                    <p className="text-xs text-muted-foreground">Prognoz o'sish</p>
                    <p className="text-lg font-bold text-[hsl(45,93%,40%)]">+{trend.predictedGrowth}%</p>
                  </div>
                </div>

                {/* Price and Competition */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-xl border border-border">
                    <p className="text-sm font-semibold mb-2 text-foreground">Narx Oralig'i</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{formatCurrency(trend.priceRange.min)}</span>
                      <Progress value={50} className="flex-1 mx-3 h-2" />
                      <span className="text-muted-foreground">{formatCurrency(trend.priceRange.max)}</span>
                    </div>
                    <p className="text-center text-sm font-bold mt-2 text-primary">
                      O'rtacha: {formatCurrency(trend.priceRange.average)}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl border border-border">
                    <p className="text-sm font-semibold mb-2 text-foreground">Raqobat va Risk</p>
                    <div className="flex items-center gap-3">
                      <Badge className={getCompetitionBadge(trend.competition)}>
                        Raqobat: {trend.competition === 'low' ? 'Past' : trend.competition === 'medium' ? 'O\'rta' : 'Yuqori'}
                      </Badge>
                      <Badge className={getRiskBadge(trend.riskLevel)}>
                        Risk: {trend.riskLevel === 'low' ? 'Past' : trend.riskLevel === 'medium' ? 'O\'rta' : 'Yuqori'}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {trend.topMarketplaces.map(mp => (
                        <Badge key={mp} variant="outline" className="text-xs">{mp}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {trend.recommendations.length > 0 && (
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2 text-primary">
                      <Brain className="w-4 h-4" />
                      AI Tavsiyalari
                    </p>
                    <ul className="space-y-1">
                      {trend.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          {opportunities.map((opp, index) => (
            <Card key={index} className="card-fintech card-fintech-active">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-foreground">{opp.niche}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{opp.reason}</p>
                  </div>
                  <Badge className={opp.opportunity === 'high' ? 'bg-success text-success-foreground' : opp.opportunity === 'medium' ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'}>
                    {opp.opportunity === 'high' ? 'Yuqori' : opp.opportunity === 'medium' ? 'O\'rta' : 'Past'} imkoniyat
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 bg-success/10 rounded-xl border border-success/20">
                    <p className="text-xs text-muted-foreground">Taxminiy daromad</p>
                    <p className="text-lg font-bold text-success">{formatCurrency(opp.estimatedRevenue)}</p>
                  </div>
                  <div className="p-3 bg-[hsl(45,93%,47%)]/10 rounded-xl border border-[hsl(45,93%,47%)]/20">
                    <p className="text-xs text-muted-foreground">ROI</p>
                    <p className="text-lg font-bold text-[hsl(45,93%,40%)]">{opp.roi}%</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <p className="text-xs text-muted-foreground">Investitsiya</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(opp.requiredInvestment)}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground">Vaqt</p>
                    <p className="text-lg font-bold text-foreground">{opp.timeToMarket}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">O'sish potensiali</span>
                      <span className="text-sm font-bold text-foreground">{opp.growthPotential}%</span>
                    </div>
                    <Progress value={opp.growthPotential} className="h-2" />
                  </div>
                  <div className="p-3 bg-muted/30 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Bozor hajmi</span>
                      <span className="text-sm font-bold text-foreground">{formatCurrency(opp.marketSize)}</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Forecasts Tab */}
        <TabsContent value="forecasts" className="space-y-4">
          <Card className="card-fintech">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                6 Oylik Moliyaviy Prognoz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecasts.map((forecast, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-foreground">{forecast.period}</span>
                      <Badge className="bg-success/10 text-success border-success/20">
                        +{forecast.growth}% o'sish
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Daromad</p>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(forecast.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Xarajatlar</p>
                        <p className="text-lg font-bold text-destructive">{formatCurrency(forecast.costs)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sof foyda</p>
                        <p className="text-lg font-bold text-success">{formatCurrency(forecast.profit)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Risk-adjusted</p>
                        <p className="text-lg font-bold text-primary">{formatCurrency(forecast.riskAdjustedProfit)}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Foyda foizi</span>
                        <span>{Math.round((forecast.profit / forecast.revenue) * 100)}%</span>
                      </div>
                      <Progress value={Math.round((forecast.profit / forecast.revenue) * 100)} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit Analysis Tab */}
        <TabsContent value="profit" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="card-fintech bg-success/5 border-success/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <TrendingUp className="w-5 h-5" />
                  Jami Prognoz Foyda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-success mb-4">{formatCurrency(totalPredictedProfit)}</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                    <span className="text-muted-foreground">Jami daromad</span>
                    <span className="font-bold text-foreground">{formatCurrency(totalPredictedRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                    <span className="text-muted-foreground">Jami xarajat</span>
                    <span className="font-bold text-destructive">{formatCurrency(totalPredictedRevenue - totalPredictedProfit)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-xl">
                    <span className="text-muted-foreground">Foyda foizi</span>
                    <span className="font-bold text-success">{Math.round((totalPredictedProfit / totalPredictedRevenue) * 100)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-fintech">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Optimallashtirish Tavsiyalari
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { title: 'Narx optimizatsiya', desc: 'Dinamik narxlash bilan +15% foyda', icon: DollarSign, color: 'text-success' },
                    { title: 'Xarajat kamaytirish', desc: 'Logistika optimallashtirish -8%', icon: TrendingDown, color: 'text-primary' },
                    { title: 'Trend mahsulotlar', desc: 'Yuqori marginli tovarlar +20%', icon: Flame, color: 'text-[hsl(45,93%,47%)]' },
                    { title: 'Multi-marketplace', desc: 'Paralel savdo +25% daromad', icon: Globe, color: 'text-secondary' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                      <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
