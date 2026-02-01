import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, Lightbulb, Target, Sparkles, RefreshCw, 
  DollarSign, Package, Star, Clock, Users, ArrowUp, ArrowRight,
  Truck, Calculator, BarChart3, Zap, Search, ExternalLink
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

export default function TrendHunterDashboard() {
  const [trends, setTrends] = useState<TrendProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('all');
  const [usdRate, setUsdRate] = useState(12800);

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
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
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
      high: 'Yuqori',
      medium: "O'rta",
      low: 'Past'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Trend Hunter
          </h1>
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
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{trends.length}</p>
                <p className="text-xs text-muted-foreground">Trend mahsulotlar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{formatUSD(usdRate)}</p>
                <p className="text-xs text-muted-foreground">USD kursi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">35-45%</p>
                <p className="text-xs text-muted-foreground">O'rtacha margin</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">15-25</p>
                <p className="text-xs text-muted-foreground">Yetkazib berish (kun)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Eng foydali mahsulotlar
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Yuklanmoqda...</p>
          </div>
        ) : trends.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Mahsulotlar topilmadi
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {trends.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.categoryUz}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendBadge(product.trend, product.growthPercent)}
                          {getCompetitionBadge(product.competition)}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400" />
                          {product.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Talab: {product.demandScore}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          Min: {product.minOrder} dona
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {product.deliveryDays}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(product.name + ' buy wholesale 1688')}`, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          1688 da qidirish
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => window.open(`https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(product.name)}`, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Alibaba
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs"
                          onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(product.name + ' O\'zbekiston narxi')}`, '_blank')}
                        >
                          <Search className="w-3 h-3 mr-1" />
                          Mahalliy narx
                        </Button>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Xitoy narxi</p>
                        <p className="font-bold text-blue-600">{formatUSD(product.sourcePrice)}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(product.sourcePriceUzs)}</p>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Umumiy xarajat</p>
                        <p className="font-bold text-orange-600">{formatCurrency(product.totalCost)}</p>
                        <p className="text-xs text-muted-foreground">+yetkazish, bojxona</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Tavsiya narx</p>
                        <p className="font-bold text-green-600">{formatCurrency(product.recommendedPrice)}</p>
                        <p className="text-xs text-green-600">+{product.profitMargin}% margin</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Oylik foyda</p>
                        <p className="font-bold text-purple-600">{formatCurrency(product.monthlyProfit)}</p>
                        <p className="text-xs text-muted-foreground">100 dona sotganda</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-800 dark:text-purple-200">Import bo'yicha maslahat</h3>
              <ul className="text-sm text-purple-700 dark:text-purple-300 mt-2 space-y-1">
                <li>• Birinchi buyurtmada kichik partiyadan (10-20 dona) boshlang</li>
                <li>• Yetkazib berish vaqtini hisobga oling (15-25 kun)</li>
                <li>• Bojxona xarajatlarini narxga qo'shing (12-15%)</li>
                <li>• Sifatni tekshirish uchun namuna buyurtma qiling</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
