// Premium Fintech Charts - Revenue, Orders, Growth
import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

// Fintech color palette
const FINTECH_COLORS = {
  primary: 'hsl(220, 70%, 50%)',
  primaryLight: 'hsl(220, 70%, 60%)',
  secondary: 'hsl(250, 84%, 54%)',
  gold: 'hsl(45, 93%, 47%)',
  goldLight: 'hsl(45, 93%, 55%)',
  success: 'hsl(152, 76%, 36%)',
  successLight: 'hsl(152, 76%, 45%)',
  info: 'hsl(199, 89%, 48%)',
  warning: 'hsl(38, 92%, 50%)',
  muted: 'hsl(220, 10%, 46%)',
  border: 'hsl(220, 13%, 90%)',
  background: 'hsl(220, 20%, 97%)',
};

// Gradient definitions for charts
const GRADIENTS = {
  revenue: ['#1e40af', '#6366f1'],
  orders: ['#059669', '#34d399'],
  growth: ['#d97706', '#fbbf24'],
  users: ['#7c3aed', '#a78bfa'],
};

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label, valuePrefix = '', valueSuffix = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {valuePrefix}{entry.value?.toLocaleString()}{valueSuffix}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ============ REVENUE AREA CHART ============
interface RevenueChartProps {
  data: ChartData[];
  height?: number;
  showGrid?: boolean;
  animated?: boolean;
  className?: string;
}

export function RevenueChart({
  data,
  height = 300,
  showGrid = true,
  animated = true,
  className,
}: RevenueChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={FINTECH_COLORS.primary} stopOpacity={0.4} />
              <stop offset="50%" stopColor={FINTECH_COLORS.primary} stopOpacity={0.15} />
              <stop offset="100%" stopColor={FINTECH_COLORS.primary} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="revenueStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={FINTECH_COLORS.primary} />
              <stop offset="100%" stopColor={FINTECH_COLORS.secondary} />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={FINTECH_COLORS.border}
              vertical={false}
            />
          )}
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: FINTECH_COLORS.muted }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: FINTECH_COLORS.muted }}
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip valuePrefix="" valueSuffix=" so'm" />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="url(#revenueStroke)"
            strokeWidth={3}
            fill="url(#revenueGradient)"
            isAnimationActive={animated}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============ ORDERS BAR CHART ============
interface OrdersChartProps {
  data: ChartData[];
  height?: number;
  showGrid?: boolean;
  animated?: boolean;
  className?: string;
}

export function OrdersChart({
  data,
  height = 300,
  showGrid = true,
  animated = true,
  className,
}: OrdersChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={FINTECH_COLORS.success} stopOpacity={1} />
              <stop offset="100%" stopColor={FINTECH_COLORS.successLight} stopOpacity={0.8} />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={FINTECH_COLORS.border}
              vertical={false}
            />
          )}
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: FINTECH_COLORS.muted }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: FINTECH_COLORS.muted }}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip valueSuffix=" ta" />} />
          <Bar
            dataKey="value"
            fill="url(#ordersGradient)"
            radius={[6, 6, 0, 0]}
            isAnimationActive={animated}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============ GROWTH LINE CHART ============
interface GrowthChartProps {
  data: ChartData[];
  height?: number;
  showGrid?: boolean;
  animated?: boolean;
  showDots?: boolean;
  className?: string;
}

export function GrowthChart({
  data,
  height = 300,
  showGrid = true,
  animated = true,
  showDots = true,
  className,
}: GrowthChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="growthGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={FINTECH_COLORS.gold} />
              <stop offset="100%" stopColor={FINTECH_COLORS.goldLight} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={FINTECH_COLORS.border}
              vertical={false}
            />
          )}
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: FINTECH_COLORS.muted }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: FINTECH_COLORS.muted }}
            tickFormatter={(value) => `${value}%`}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip valueSuffix="%" />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="url(#growthGradient)"
            strokeWidth={3}
            dot={showDots ? {
              fill: FINTECH_COLORS.gold,
              stroke: '#fff',
              strokeWidth: 2,
              r: 5,
            } : false}
            activeDot={{
              fill: FINTECH_COLORS.gold,
              stroke: '#fff',
              strokeWidth: 3,
              r: 8,
              filter: 'url(#glow)',
            }}
            isAnimationActive={animated}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============ MULTI-METRIC LINE CHART ============
interface MultiMetricChartProps {
  data: any[];
  metrics: {
    key: string;
    name: string;
    color: string;
  }[];
  height?: number;
  showGrid?: boolean;
  animated?: boolean;
  className?: string;
}

export function MultiMetricChart({
  data,
  metrics,
  height = 300,
  showGrid = true,
  animated = true,
  className,
}: MultiMetricChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={FINTECH_COLORS.border}
              vertical={false}
            />
          )}
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: FINTECH_COLORS.muted }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: FINTECH_COLORS.muted }}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 20 }}
            iconType="circle"
            iconSize={8}
          />
          {metrics.map((metric, index) => (
            <Line
              key={metric.key}
              type="monotone"
              dataKey={metric.key}
              name={metric.name}
              stroke={metric.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: metric.color, stroke: '#fff', strokeWidth: 2 }}
              isAnimationActive={animated}
              animationDuration={1200 + index * 300}
              animationEasing="ease-out"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============ DISTRIBUTION PIE CHART ============
interface DistributionChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  animated?: boolean;
  showLabels?: boolean;
  innerRadius?: number;
  className?: string;
}

const PIE_COLORS = [
  FINTECH_COLORS.primary,
  FINTECH_COLORS.gold,
  FINTECH_COLORS.success,
  FINTECH_COLORS.secondary,
  FINTECH_COLORS.info,
  FINTECH_COLORS.warning,
];

export function DistributionChart({
  data,
  height = 300,
  animated = true,
  showLabels = true,
  innerRadius = 60,
  className,
}: DistributionChartProps) {
  const dataWithColors = useMemo(() => 
    data.map((item, index) => ({
      ...item,
      color: item.color || PIE_COLORS[index % PIE_COLORS.length],
    })),
    [data]
  );

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={dataWithColors}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={innerRadius + 40}
            paddingAngle={2}
            dataKey="value"
            isAnimationActive={animated}
            animationDuration={1200}
            animationEasing="ease-out"
          >
            {dataWithColors.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLabels && (
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              iconSize={10}
              formatter={(value) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============ MINI SPARKLINE CHART ============
interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  showArea?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  color = FINTECH_COLORS.primary,
  height = 40,
  width = 100,
  showArea = true,
  className,
}: SparklineProps) {
  const chartData = useMemo(() => 
    data.map((value, index) => ({ name: index, value })),
    [data]
  );

  const gradientId = useMemo(() => `sparkline-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <div className={cn('inline-block', className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={showArea ? `url(#${gradientId})` : 'transparent'}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============ CHART CARD WRAPPER ============
interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  value?: string | number;
  change?: number;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  icon: Icon,
  value,
  change,
  children,
  className,
}: ChartCardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-border bg-card p-6',
      'shadow-card hover:shadow-card-hover transition-all duration-300',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center border border-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        
        {(value !== undefined || change !== undefined) && (
          <div className="text-right">
            {value !== undefined && (
              <p className="text-2xl font-bold text-foreground">{value}</p>
            )}
            {change !== undefined && (
              <div className={cn(
                'flex items-center gap-1 text-sm font-medium',
                change >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {change >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{change >= 0 ? '+' : ''}{change}%</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Chart */}
      {children}
    </div>
  );
}

// Export colors for external use
export { FINTECH_COLORS, GRADIENTS };
