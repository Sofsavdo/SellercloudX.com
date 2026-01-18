import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, DollarSign, Target, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

interface TrendingProduct {
  productName: string;
  category: string;
  imageUrl: string;
  sourceMarket: 'china' | 'usa' | 'global';
  sourcePrice: number;
  sourceCurrency: string;
  salesVolume: number;
  salesGrowth: number;
  avgRating: number;
}

interface ProfitOpportunity {
  product: TrendingProduct;
  totalCost: number;
  localCompetitors: number;
  localAvgPrice: number;
  recommendedPrice: number;
  profitMargin: number;
  monthlyProfitEstimate: number;
  roi: number;
  breakEvenUnits: number;
  opportunityScore: number;
  strengths: string[];
  risks: string[];
  recommendation: string;
}

export default function TrendHunterDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch top opportunities
  const { data: opportunities, isLoading, refetch } = useQuery<{ success: boolean; data: ProfitOpportunity[] }>({
    queryKey: ['trendOpportunities', selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === 'all' 
        ? '/api/trends/top?limit=20'
        : `/api/trends/category/${selectedCategory}`;
      const response = await axios.get(url);
      return response.data;
    },
  });

  const categories = [
    { value: 'all', label: 'Barchasi' },
    { value: 'electronics', label: 'Elektronika' },
    { value: 'clothing', label: 'Kiyim' },
    { value: 'home', label: 'Uy-joy' },
    { value: 'beauty', label: 'Go\'zallik' },
    { value: 'sports', label: 'Sport' },
  ];

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-600">⭐ Excellent</Badge>;
    if (score >= 65) return <Badge className="bg-blue-600">✅ Good</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-600">⚠️ Moderate</Badge>;
    return <Badge variant="destructive">❌ Low</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Trend Hunter
          </h1>
          <p className="text-muted-foreground mt-2">
            Xitoy va Amerika bozoridan trending va foydali mahsulotlarni aniqlang
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <Sparkles className="w-4 h-4 mr-2" />
          Yangilash
        </Button>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          {categories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4">Trend mahsulotlar yuklanmoqda...</p>
        </div>
      )}

      {/* Opportunities Grid */}
      {!isLoading && opportunities?.data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunities.data.map((opportunity, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {opportunity.product.productName}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {opportunity.product.sourceMarket === 'china' ? '🇨🇳 Xitoy' : '🇺🇸 Amerika'} bozoridan
                    </CardDescription>
                  </div>
                  {getScoreBadge(opportunity.opportunityScore)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Foyda Marjasi</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {opportunity.profitMargin.toFixed(0)}%
                    </p>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Oylik Foyda</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatPrice(opportunity.monthlyProfitEstimate)}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Raqobatchilar</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {opportunity.localCompetitors}
                    </p>
                  </div>

                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">ROI</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {opportunity.roi.toFixed(0)}%
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Xarid narxi:</span>
                    <span className="font-medium">
                      ${opportunity.product.sourcePrice} ({opportunity.product.sourceCurrency})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Umumiy xarajat:</span>
                    <span className="font-medium">{formatPrice(opportunity.totalCost)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Tavsiya qilingan narx:</span>
                    <span className="font-bold text-green-600">
                      {formatPrice(opportunity.recommendedPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Break-even:</span>
                    <span className="font-medium">{opportunity.breakEvenUnits} dona</span>
                  </div>
                </div>

                {/* Strengths */}
                {opportunity.strengths.length > 0 && (
                  <div className="space-y-1">
                    {opportunity.strengths.map((strength, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-green-700">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{strength}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Risks */}
                {opportunity.risks.length > 0 && (
                  <div className="space-y-1">
                    {opportunity.risks.map((risk, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-orange-700">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{risk}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendation */}
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm font-medium">{opportunity.recommendation}</p>
                </div>

                {/* Action Button */}
                <Button className="w-full" variant="default">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Mahsulot Yaratish
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && opportunities?.data?.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Trend mahsulotlar topilmadi</h3>
          <p className="text-muted-foreground">
            Boshqa kategoriyani tanlang yoki keyinroq qayta urinib ko'ring
          </p>
        </div>
      )}
    </div>
  );
}
