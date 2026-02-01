// Uzum Market Dashboard - Real Integration
// Complete marketplace management with AI features

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  TrendingUp, 
  DollarSign,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  BarChart3,
  Boxes,
  Loader2,
  Zap,
  ExternalLink
} from 'lucide-react';

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || '';

interface UzumStock {
  skuId: number;
  skuTitle: string;
  productTitle: string;
  barcode: string;
  amount: number;
  fbsAllowed: boolean;
  dbsAllowed: boolean;
  fbsLinked: boolean;
  dbsLinked: boolean;
  sellerSkuCode: string | null;
}

interface UzumStocksResponse {
  success: boolean;
  data?: {
    payload: {
      skuAmountList: UzumStock[];
    };
    timestamp: string;
  };
  error?: string;
}

export default function UzumMarketDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch stocks - always enabled
  const { data: stocksData, isLoading: isLoadingStocks, refetch: refetchStocks } = useQuery<UzumStocksResponse>({
    queryKey: ['uzum-stocks'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/uzum-market/stocks`);
      return response.json();
    },
  });

  // Fetch orders
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['uzum-orders'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/uzum-market/orders?limit=50`);
      return response.json();
    },
  });

  // Check if API is connected based on stocks data
  const isApiConnected = stocksData?.success === true;

  const stocks = stocksData?.data?.payload?.skuAmountList || [];
  const filteredStocks = stocks.filter((stock: UzumStock) => 
    stock.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.skuTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalProducts = stocks.length;
  const inStock = stocks.filter((s: UzumStock) => s.amount > 0).length;
  const outOfStock = stocks.filter((s: UzumStock) => s.amount === 0).length;
  const fbsEnabled = stocks.filter((s: UzumStock) => s.fbsAllowed).length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-4xl">🍇</span>
            Uzum Market Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real vaqtda marketplace boshqaruvi
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isApiConnected ? (
            <Badge className="bg-green-500 text-white px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              API Ulangan ✅
            </Badge>
          ) : isLoadingStocks ? (
            <Badge variant="outline" className="px-4 py-2">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Tekshirilmoqda...
            </Badge>
          ) : (
            <Badge variant="destructive" className="px-4 py-2">
              <XCircle className="w-4 h-4 mr-2" />
              API Ulanmagan
            </Badge>
          )}
          <Button 
            variant="outline" 
            onClick={() => {
              refetchStocks();
            }}
            disabled={isLoadingStocks}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingStocks ? 'animate-spin' : ''}`} />
            Yangilash
          </Button>
        </div>
      </div>

      {/* Connection Error */}
      {!isApiConnected && !isLoadingStocks && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            Uzum Market API'ga ulanib bo'lmadi. API kalitni tekshiring.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Jami Mahsulotlar</p>
                <p className="text-3xl font-bold text-purple-900">{totalProducts}</p>
              </div>
              <Package className="w-10 h-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Zaxirada Bor</p>
                <p className="text-3xl font-bold text-green-900">{inStock}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Tugagan</p>
                <p className="text-3xl font-bold text-red-900">{outOfStock}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">FBS Faol</p>
                <p className="text-3xl font-bold text-blue-900">{fbsEnabled}</p>
              </div>
              <Boxes className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="overview">Umumiy</TabsTrigger>
          <TabsTrigger value="products">Mahsulotlar</TabsTrigger>
          <TabsTrigger value="analytics">Analitika</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Tezkor Amallar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <a href="/ai-scanner">
                    <Search className="w-6 h-6" />
                    <span>AI Scanner</span>
                  </a>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <a href="/ai-manager">
                    <Package className="w-6 h-6" />
                    <span>Mahsulot Qo'shish</span>
                  </a>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <TrendingUp className="w-6 h-6" />
                  <span>Trend Tahlil</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <DollarSign className="w-6 h-6" />
                  <span>Narx Optimallashtirish</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Products */}
          <Card>
            <CardHeader>
              <CardTitle>So'nggi Mahsulotlar</CardTitle>
              <CardDescription>Sizning Uzum Market mahsulotlaringiz</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStocks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
              ) : (
                <div className="space-y-3">
                  {stocks.slice(0, 5).map((stock: UzumStock) => (
                    <div 
                      key={stock.skuId} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{stock.productTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {stock.skuTitle} • Barcode: {stock.barcode}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-bold ${stock.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.amount} dona
                          </p>
                        </div>
                        <Badge variant={stock.fbsAllowed ? 'default' : 'secondary'}>
                          {stock.fbsAllowed ? 'FBS' : 'DBS'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Mahsulot qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Eksport
            </Button>
          </div>

          {/* Products List */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">Mahsulot</th>
                      <th className="text-left p-4 font-medium">SKU</th>
                      <th className="text-left p-4 font-medium">Barcode</th>
                      <th className="text-center p-4 font-medium">Zaxira</th>
                      <th className="text-center p-4 font-medium">FBS</th>
                      <th className="text-center p-4 font-medium">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStocks.map((stock: UzumStock) => (
                      <tr key={stock.skuId} className="border-b hover:bg-slate-50">
                        <td className="p-4">
                          <p className="font-medium text-sm">{stock.productTitle}</p>
                        </td>
                        <td className="p-4">
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                            {stock.skuTitle}
                          </code>
                        </td>
                        <td className="p-4">
                          <code className="text-xs">{stock.barcode}</code>
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant={stock.amount > 0 ? 'default' : 'destructive'}>
                            {stock.amount}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          {stock.fbsAllowed ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stock Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Zaxira Holati</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Zaxirada bor</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${(inStock / totalProducts) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{inStock}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tugagan</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500" 
                          style={{ width: `${(outOfStock / totalProducts) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{outOfStock}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Kategoriyalar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Group by SKU prefix */}
                  {Object.entries(
                    stocks.reduce((acc: any, stock: UzumStock) => {
                      const prefix = stock.skuTitle.split('-')[0];
                      acc[prefix] = (acc[prefix] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([prefix, count]: [string, any]) => (
                    <div key={prefix} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="font-medium">{prefix}</span>
                      <Badge>{count} ta</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Out of Stock Alert */}
          {outOfStock > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>{outOfStock} ta mahsulot</strong> zaxiradan tugagan! 
                Iltimos, zaxirani to'ldiring.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
