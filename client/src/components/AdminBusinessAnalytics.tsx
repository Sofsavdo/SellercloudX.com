import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  UserCheck, 
  UserX,
  Percent,
  BarChart3,
  Calendar
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/currency';

interface BusinessMetrics {
  totalPartners: number;
  activePartners: number;
  payingPartners: number;
  churnedPartners: number;
  freePartners: number;
  mrr: string;
  arr: string;
  totalRevenue: string;
  totalCosts: string;
  profitMargin: string;
  churnRate: string;
  growth: {
    partners: string;
    mrr: string;
    revenue: string;
  };
  tierDistribution: {
    free: number;
    basic: number;
    starter_pro: number;
    professional: number;
  };
}

export function AdminBusinessAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/business-metrics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/business-metrics');
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const metrics: BusinessMetrics = data?.metrics || {
    totalPartners: 0,
    activePartners: 0,
    payingPartners: 0,
    churnedPartners: 0,
    freePartners: 0,
    mrr: '0',
    arr: '0',
    totalRevenue: '0',
    totalCosts: '0',
    profitMargin: '0',
    churnRate: '0',
    growth: { partners: '0', mrr: '0', revenue: '0' },
    tierDistribution: { free: 0, basic: 0, starter_pro: 0, professional: 0 }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                  <div className="h-8 bg-slate-200 rounded w-32"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getTrendIcon = (value: string) => {
    const num = parseFloat(value);
    if (num > 0) return <TrendingUp className="w-4 h-4 text-success" />;
    if (num < 0) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return null;
  };

  const getTrendColor = (value: string) => {
    const num = parseFloat(value);
    if (num > 0) return 'text-success';
    if (num < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* MRR */}
        <Card className="card-premium">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Monthly Recurring Revenue</p>
                <h3 className="text-3xl font-bold">{formatCurrency(metrics.mrr)}</h3>
                <div className="flex items-center gap-2 mt-2">
                  {getTrendIcon(metrics.growth.mrr)}
                  <span className={`text-sm font-medium ${getTrendColor(metrics.growth.mrr)}`}>
                    {metrics.growth.mrr}% vs last month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ARR */}
        <Card className="card-premium">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Annual Recurring Revenue</p>
                <h3 className="text-3xl font-bold">{formatCurrency(metrics.arr)}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  MRR × 12 = {formatCurrency(metrics.arr)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Partners */}
        <Card className="card-premium">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Jami Hamkorlar</p>
                <h3 className="text-3xl font-bold">{metrics.totalPartners}</h3>
                <div className="flex items-center gap-2 mt-2">
                  {getTrendIcon(metrics.growth.partners)}
                  <span className={`text-sm font-medium ${getTrendColor(metrics.growth.partners)}`}>
                    {metrics.growth.partners}% growth
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Churn Rate */}
        <Card className="card-premium">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Churn Rate</p>
                <h3 className="text-3xl font-bold">{metrics.churnRate}%</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {metrics.churnedPartners} churned hamkorlar
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <UserX className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active vs Paying */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hamkorlar Tahlili</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-success" />
                <span className="text-sm">Faol Hamkorlar</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{metrics.activePartners}</span>
                <Badge variant="outline" className="bg-success/10 text-success">
                  {((metrics.activePartners / metrics.totalPartners) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm">Pulli Tarifda</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{metrics.payingPartners}</span>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {((metrics.payingPartners / metrics.totalPartners) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Bepul Tarifda</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{metrics.freePartners}</span>
                <Badge variant="outline">
                  {((metrics.freePartners / metrics.totalPartners) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue & Profit */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Moliyaviy Tahlil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Jami Daromad</span>
              <span className="text-xl font-bold text-success">
                {formatCurrency(metrics.totalRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Jami Xarajat</span>
              <span className="text-xl font-bold text-destructive">
                {formatCurrency(metrics.totalCosts)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-sm font-medium">Foyda Margin</span>
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-primary" />
                <span className="text-2xl font-bold text-primary">
                  {metrics.profitMargin}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tarif Taqsimoti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Free Starter</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{metrics.tierDistribution.free}</span>
                <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-500 rounded-full"
                    style={{ width: `${(metrics.tierDistribution.free / metrics.totalPartners) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Basic</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{metrics.tierDistribution.basic}</span>
                <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-warning rounded-full"
                    style={{ width: `${(metrics.tierDistribution.basic / metrics.totalPartners) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Starter Pro</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{metrics.tierDistribution.starter_pro}</span>
                <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(metrics.tierDistribution.starter_pro / metrics.totalPartners) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Professional</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{metrics.tierDistribution.professional}</span>
                <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${(metrics.tierDistribution.professional / metrics.totalPartners) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
