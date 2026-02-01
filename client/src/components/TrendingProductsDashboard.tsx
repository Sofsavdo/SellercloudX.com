// Admin Panel Trending Products Dashboard
// Uses same API as Partner Dashboard Trend Hunter

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, Lightbulb, Target, RefreshCw, 
  DollarSign, Package, Star, Clock, ArrowUp,
  Truck, BarChart3, Zap, Globe, Users
} from 'lucide-react';

interface TrendProduct {
  id: string;
  name: string;
  category: string;
  categoryUz: string;
  trend: string;
  growthPercent: number;
  demandScore: number;
  rating: number;
  sourcePrice: number;
  sourcePriceUzs: number;
  shippingCost: number;
  customsCost: number;
  totalCost: number;
  recommendedPrice: number;
  profitMargin: number;
  monthlyProfit: number;
  competition: string;
  source: string;
  deliveryDays: string;
  minOrder: number;
}

export function TrendingProductsDashboard() {
  const { toast } = useToast();
  const [trends, setTrends] = useState<TrendProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('all');
  const [usdRate, setUsdRate] = useState(12800);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [category]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/trends/hunter?category=${category}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTrends(data.data || []);
        setUsdRate(data.usdRate || 12800);
        setLastUpdated(data.lastUpdated || null);
        toast({
          title: "Ma'lumotlar yangilandi",
          description: `${data.data?.length || 0} ta trend mahsulot topildi`
        });
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
      toast({
        title: "Xatolik",
        description: "Ma'lumotlarni yuklashda xatolik",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
  };

  const formatUSD = (amount: number) => {
    return '$' + amount.toFixed(2);
  };

  const getTrendBadge = (trend: string, growth: number) => {
    if (trend === 'rising') {
      return <Badge className="bg-green-500 text-white"><ArrowUp className="w-3 h-3 mr-1" />+{growth}%</Badge>;
    }
    return <Badge className="bg-blue-500 text-white">Barqaror</Badge>;
  };

  const getCompetitionBadge = (level: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    const labels: Record<string, string> = {
      high: 'Yuqori raqobat',
      medium: "O'rta raqobat",
      low: 'Past raqobat'
    };
    return <Badge className={`${colors[level]} text-white`}>{labels[level]}</Badge>;
  };

  const categories = [
    { value: 'all', label: 'Barcha kategoriyalar' },
    { value: 'electronics', label: 'Elektronika' },
    { value: 'clothing', label: 'Kiyim' },
    { value: 'home', label: 'Uy jihozlari' },
    { value: 'beauty', label: "Go'zallik" },
    { value: 'sports', label: 'Sport' }
  ];

  // Calculate totals
  const totalPotentialProfit = trends.reduce((sum, t) => sum + t.monthlyProfit, 0);
  const avgMargin = trends.length > 0 
    ? Math.round(trends.reduce((sum, t) => sum + t.profitMargin, 0) / trends.length) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            Trend Mahsulotlar Tahlili
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Xitoydan import qilinadigan eng foydali mahsulotlar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kategoriya" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yangilash
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{trends.length}</p>
                <p className="text-xs text-muted-foreground">Trend mahsulotlar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgMargin}%</p>
                <p className="text-xs text-muted-foreground">O'rtacha margin</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Globe className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatUSD(usdRate)}</p>
                <p className="text-xs text-muted-foreground">USD kursi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">15-25</p>
                <p className="text-xs text-muted-foreground">Yetkazish (kun)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
                <Zap className="w-5 h-5 text-purple-700 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                  {formatCurrency(totalPotentialProfit)}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Potensial oylik foyda</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Mahsulotlar ro'yxati
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Yuklanmoqda...</p>
            </div>
          ) : trends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Mahsulotlar topilmadi
            </div>
          ) : (
            <div className="space-y-3">
              {trends.map((product, index) => (
                <div 
                  key={product.id} 
                  className={`p-4 rounded-lg border ${index === 0 ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200' : 'bg-background'}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Rank & Product Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-amber-500 text-white' : index < 3 ? 'bg-purple-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{product.name}</h3>
                          {getTrendBadge(product.trend, product.growthPercent)}
                          {getCompetitionBadge(product.competition)}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {product.categoryUz}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400" />
                            {product.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Talab: {product.demandScore}%
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {product.deliveryDays}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Grid */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                        <p className="text-[10px] text-muted-foreground">Xitoy</p>
                        <p className="font-bold text-sm text-blue-600">{formatUSD(product.sourcePrice)}</p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded p-2">
                        <p className="text-[10px] text-muted-foreground">Xarajat</p>
                        <p className="font-bold text-sm text-orange-600">{formatCurrency(product.totalCost)}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                        <p className="text-[10px] text-muted-foreground">Sotish</p>
                        <p className="font-bold text-sm text-green-600">{formatCurrency(product.recommendedPrice)}</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                        <p className="text-[10px] text-muted-foreground">Oylik foyda</p>
                        <p className="font-bold text-sm text-purple-600">{formatCurrency(product.monthlyProfit)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">Admin uchun tavsiyalar</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <li>• Hamkorlarga trend mahsulotlarni tavsiya qiling</li>
                <li>• Raqobat past bo'lgan mahsulotlarga e'tibor bering</li>
                <li>• Import xarajatlarini (shipping + customs = ~27%) doimo hisobga oling</li>
                <li>• Minimum buyurtma miqdori va yetkazish vaqtini tekshiring</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
