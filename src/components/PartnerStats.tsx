import { StatCard } from '@/components/ui/StatCard';
import { TrendingUp, Package, DollarSign, Target } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/currency';

interface PartnerStatsProps {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalProfit: number;
    activeProducts: number;
  };
}

export function PartnerStats({ stats }: PartnerStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Umumiy Aylanma"
        value={formatCurrency(stats.totalRevenue)}
        icon={TrendingUp}
        trend={{ value: 15, isPositive: true }}
        subtitle="Oxirgi oyda"
        delay={0}
      />
      <StatCard
        title="Umumiy Buyurtmalar"
        value={formatNumber(stats.totalOrders)}
        icon={Package}
        trend={{ value: 8, isPositive: true }}
        subtitle="Jami buyurtmalar"
        delay={100}
      />
      <StatCard
        title="Umumiy Foyda"
        value={formatCurrency(stats.totalProfit)}
        icon={DollarSign}
        trend={{ value: 20, isPositive: true }}
        subtitle="Sof foyda"
        delay={200}
      />
      <StatCard
        title="Faol Mahsulotlar"
        value={formatNumber(stats.activeProducts)}
        icon={Target}
        subtitle="Marketplace'da faol"
        delay={300}
        gradient={true}
      />
    </div>
  );
}
