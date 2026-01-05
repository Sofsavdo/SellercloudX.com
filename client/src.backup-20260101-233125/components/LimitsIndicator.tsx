// Limits Indicator Component
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle,
  AlertCircle,
  ArrowUp,
  CheckCircle
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useLocation } from 'wouter';

interface SalesLimit {
  id: string;
  tierId: string;
  month: number;
  totalSales: number;
  salesLimit: number;
  skuCount: number;
  skuLimit: number;
  status: string;
}

export function LimitsIndicator() {
  const [, setLocation] = useLocation();

  // Fetch current limits
  const { data: limits, isLoading } = useQuery<SalesLimit>({
    queryKey: ['/api/limits/current'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/limits/current');
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Yuklanmoqda...</div>;
  }

  if (!limits) {
    return null;
  }

  const skuPercentage = limits.skuLimit > 0 
    ? (limits.skuCount / limits.skuLimit) * 100 
    : 0;
    
  const salesPercentage = limits.salesLimit > 0 
    ? (limits.totalSales / limits.salesLimit) * 100 
    : 0;

  const isSkuWarning = skuPercentage >= 80;
  const isSkuExceeded = skuPercentage >= 100;
  const isSalesWarning = salesPercentage >= 80;
  const isSalesExceeded = salesPercentage >= 100;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-orange-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-600';
    if (percentage >= 80) return 'bg-orange-600';
    return 'bg-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {(isSkuExceeded || isSalesExceeded) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>Limit to'ldi!</strong> Platformangiz bloklangan. Tarifni oshiring.
            </span>
            <Button 
              size="sm" 
              variant="default"
              onClick={() => setLocation('/partner-dashboard?tab=subscription')}
            >
              <ArrowUp className="w-4 h-4 mr-2" />
              Tarifni Oshirish
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Warning Alerts */}
      {(isSkuWarning && !isSkuExceeded) && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Ogohlantirish:</strong> SKU limitingiz 80% to'ldi. Tez orada tarif oshiring.
          </AlertDescription>
        </Alert>
      )}

      {(isSalesWarning && !isSalesExceeded) && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Ogohlantirish:</strong> Oylik savdo limitingiz 80% to'ldi. Tez orada tarif oshiring.
          </AlertDescription>
        </Alert>
      )}

      {/* Limits Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Limitlar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* SKU Limit */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="font-semibold">Mahsulotlar (SKU)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getStatusColor(skuPercentage)}`}>
                  {limits.skuCount}
                </span>
                <span className="text-gray-500">/</span>
                <span className="text-lg font-bold text-gray-700">
                  {limits.skuLimit === -1 ? '∞' : limits.skuLimit}
                </span>
              </div>
            </div>
            
            {limits.skuLimit > 0 && (
              <>
                <Progress 
                  value={Math.min(skuPercentage, 100)} 
                  className="h-3"
                  indicatorClassName={getProgressColor(skuPercentage)}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-600">
                    {skuPercentage.toFixed(1)}% ishlatilgan
                  </span>
                  <span className="text-xs text-gray-600">
                    {limits.skuLimit - limits.skuCount} ta qoldi
                  </span>
                </div>
              </>
            )}

            {limits.skuLimit === -1 && (
              <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                <CheckCircle className="w-4 h-4" />
                <span>Cheksiz mahsulotlar</span>
              </div>
            )}
          </div>

          {/* Sales Limit */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="font-semibold">Oylik Savdo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getStatusColor(salesPercentage)}`}>
                  {formatCurrency(limits.totalSales)}
                </span>
                <span className="text-gray-500">/</span>
                <span className="text-lg font-bold text-gray-700">
                  {limits.salesLimit === -1 ? '∞' : formatCurrency(limits.salesLimit)}
                </span>
                <span className="text-sm text-gray-600">so'm</span>
              </div>
            </div>
            
            {limits.salesLimit > 0 && (
              <>
                <Progress 
                  value={Math.min(salesPercentage, 100)} 
                  className="h-3"
                  indicatorClassName={getProgressColor(salesPercentage)}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-600">
                    {salesPercentage.toFixed(1)}% ishlatilgan
                  </span>
                  <span className="text-xs text-gray-600">
                    {formatCurrency(limits.salesLimit - limits.totalSales)} so'm qoldi
                  </span>
                </div>
              </>
            )}

            {limits.salesLimit === -1 && (
              <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                <CheckCircle className="w-4 h-4" />
                <span>Cheksiz savdo</span>
              </div>
            )}
          </div>

          {/* Status Summary */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Umumiy Holat</div>
                <div className="flex items-center gap-2 mt-1">
                  {limits.status === 'ok' && (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-600">Yaxshi</span>
                    </>
                  )}
                  {limits.status === 'warning' && (
                    <>
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <span className="font-semibold text-orange-600">Ogohlantirish</span>
                    </>
                  )}
                  {limits.status === 'exceeded' && (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-600">Limit to'ldi</span>
                    </>
                  )}
                </div>
              </div>

              {(limits.status === 'warning' || limits.status === 'exceeded') && (
                <Button 
                  onClick={() => setLocation('/partner-dashboard?tab=subscription')}
                  variant={limits.status === 'exceeded' ? 'default' : 'outline'}
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Tarifni Oshirish
                </Button>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-900">
              <strong>Eslatma:</strong> Limitlar har oy 1-sanada qayta tiklanadi. 
              Limit to'lganda platformangiz bloklanadi va yangi mahsulot qo'sha olmaysiz.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
