// Analytics Dashboard - Premium Fintech Charts Demo
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RevenueChart,
  OrdersChart,
  GrowthChart,
  MultiMetricChart,
  DistributionChart,
  Sparkline,
  ChartCard,
  FINTECH_COLORS,
} from '@/components/ui/fintech-charts';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Sample data generators
const generateRevenueData = () => [
  { name: 'Yan', value: 12500000 },
  { name: 'Fev', value: 18200000 },
  { name: 'Mar', value: 15800000 },
  { name: 'Apr', value: 22100000 },
  { name: 'May', value: 28500000 },
  { name: 'Iyn', value: 25800000 },
  { name: 'Iyl', value: 32100000 },
  { name: 'Avg', value: 35400000 },
  { name: 'Sen', value: 38900000 },
  { name: 'Okt', value: 42500000 },
  { name: 'Noy', value: 48200000 },
  { name: 'Dek', value: 52800000 },
];

const generateOrdersData = () => [
  { name: 'Dush', value: 145 },
  { name: 'Sesh', value: 189 },
  { name: 'Chor', value: 167 },
  { name: 'Pay', value: 234 },
  { name: 'Jum', value: 278 },
  { name: 'Shan', value: 312 },
  { name: 'Yak', value: 198 },
];

const generateGrowthData = () => [
  { name: 'Q1', value: 12 },
  { name: 'Q2', value: 18 },
  { name: 'Q3', value: 24 },
  { name: 'Q4', value: 35 },
];

const generateMultiMetricData = () => [
  { name: 'Yan', revenue: 125, orders: 45, users: 320 },
  { name: 'Fev', revenue: 182, orders: 62, users: 380 },
  { name: 'Mar', revenue: 158, orders: 54, users: 420 },
  { name: 'Apr', revenue: 221, orders: 78, users: 480 },
  { name: 'May', revenue: 285, orders: 95, users: 550 },
  { name: 'Iyn', revenue: 258, orders: 88, users: 620 },
];

const generateDistributionData = () => [
  { name: 'Uzum', value: 35 },
  { name: 'Sello', value: 28 },
  { name: 'KorzinkaGo', value: 22 },
  { name: 'Bozor.uz', value: 15 },
];

const sparklineData = [12, 18, 15, 22, 28, 25, 32, 35, 38, 42, 48, 52];

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tahlillar</h1>
          <p className="text-sm text-muted-foreground">Biznes ko'rsatkichlarini real-time kuzating</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            {(['week', 'month', 'year'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={cn(
                  'px-4',
                  timeRange === range && 'bg-primary text-primary-foreground shadow-sm'
                )}
              >
                {range === 'week' ? 'Hafta' : range === 'month' ? 'Oy' : 'Yil'}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="w-4 h-4" />
            Tanlash
          </Button>
        </div>
      </div>

      {/* Quick Stats with Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { 
            title: 'Jami Daromad', 
            value: '528.4M', 
            change: 12.5, 
            icon: DollarSign,
            color: FINTECH_COLORS.primary,
            sparkline: sparklineData,
          },
          { 
            title: 'Buyurtmalar', 
            value: '1,523', 
            change: 8.2, 
            icon: ShoppingCart,
            color: FINTECH_COLORS.success,
            sparkline: [45, 62, 54, 78, 95, 88, 102, 115, 98, 125, 142, 158],
          },
          { 
            title: "O'sish", 
            value: '+35%', 
            change: 5.8, 
            icon: TrendingUp,
            color: FINTECH_COLORS.gold,
            sparkline: [12, 18, 15, 24, 28, 32, 35, 38, 42, 45, 48, 52],
          },
          { 
            title: 'Faol Mijozlar', 
            value: '892', 
            change: -2.3, 
            icon: Users,
            color: FINTECH_COLORS.secondary,
            sparkline: [320, 380, 420, 480, 550, 620, 680, 720, 780, 820, 860, 892],
          },
        ].map((stat, index) => (
          <Card key={index} className="card-fintech">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
                <Badge 
                  className={cn(
                    'text-xs font-semibold',
                    stat.change >= 0 
                      ? 'bg-success/10 text-success border-success/20' 
                      : 'bg-destructive/10 text-destructive border-destructive/20'
                  )}
                  variant="outline"
                >
                  {stat.change >= 0 ? '+' : ''}{stat.change}%
                </Badge>
              </div>
              <Sparkline 
                data={stat.sparkline} 
                color={stat.color} 
                height={40} 
                width={280}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard
          title="Daromad Dinamikasi"
          subtitle="Oxirgi 12 oy"
          icon={DollarSign}
          value="528.4M so'm"
          change={12.5}
        >
          <RevenueChart data={generateRevenueData()} height={280} />
        </ChartCard>

        <ChartCard
          title="Haftalik Buyurtmalar"
          subtitle="Joriy hafta"
          icon={ShoppingCart}
          value="1,523"
          change={8.2}
        >
          <OrdersChart data={generateOrdersData()} height={280} />
        </ChartCard>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ChartCard
          title="O'sish Dinamikasi"
          subtitle="Kvartallar bo'yicha"
          icon={TrendingUp}
          value="+35%"
          change={5.8}
        >
          <GrowthChart data={generateGrowthData()} height={220} />
        </ChartCard>

        <ChartCard
          title="Marketplace Ulushi"
          subtitle="Savdo taqsimoti"
          icon={Package}
        >
          <DistributionChart 
            data={generateDistributionData()} 
            height={220} 
            innerRadius={50}
          />
        </ChartCard>

        <ChartCard
          title="Ko'p Metrikali Tahlil"
          subtitle="Daromad, Buyurtma, Foydalanuvchi"
          icon={ArrowUpRight}
        >
          <MultiMetricChart
            data={generateMultiMetricData()}
            metrics={[
              { key: 'revenue', name: 'Daromad', color: FINTECH_COLORS.primary },
              { key: 'orders', name: 'Buyurtma', color: FINTECH_COLORS.success },
              { key: 'users', name: 'Foydalanuvchi', color: FINTECH_COLORS.gold },
            ]}
            height={220}
          />
        </ChartCard>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
