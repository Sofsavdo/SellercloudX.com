// MRR/ARR Revenue Analytics - Premium Fintech Dashboard Component
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Users, ArrowUpRight,
  ArrowDownRight, Download, RefreshCw, Sparkles, ChevronRight,
  Calendar, Target, Activity
} from 'lucide-react';

// Mock data - TODO: Replace with real API data
const generateMockData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  return months.slice(0, currentMonth + 1).map((month, idx) => {
    const base = 50000 + idx * 8000;
    const randomVariation = Math.random() * 5000 - 2500;
    const mrr = base + randomVariation;
    const newMrr = mrr * (0.15 + Math.random() * 0.1);
    const expansion = mrr * (0.05 + Math.random() * 0.05);
    const churn = mrr * (0.02 + Math.random() * 0.03);
    
    return {
      month,
      mrr: Math.round(mrr),
      arr: Math.round(mrr * 12),
      newMrr: Math.round(newMrr),
      expansion: Math.round(expansion),
      churn: Math.round(churn),
      netMrr: Math.round(newMrr + expansion - churn),
      predicted: idx >= currentMonth - 1,
    };
  });
};

// Animated counter hook
const useAnimatedNumber = (value: number, duration = 1000) => {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const current = startValue + (value - startValue) * eased;
      setDisplayValue(Math.round(current));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    previousValue.current = value;
  }, [value, duration]);

  return displayValue;
};

// Format currency with animation
const AnimatedCurrency = ({ value, className = '' }: { value: number; className?: string }) => {
  const animatedValue = useAnimatedNumber(value);
  return (
    <span className={className}>
      ${animatedValue.toLocaleString()}
    </span>
  );
};

// Sparkline mini chart
const Sparkline = ({ data, color = 'hsl(var(--primary))' }: { data: number[]; color?: string }) => (
  <ResponsiveContainer width={80} height={32}>
    <AreaChart data={data.map((v, i) => ({ value: v, i }))}>
      <defs>
        <linearGradient id={`sparklineGradient-${color.replace(/[^a-z]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area
        type="monotone"
        dataKey="value"
        stroke={color}
        strokeWidth={1.5}
        fill={`url(#sparklineGradient-${color.replace(/[^a-z]/g, '')})`}
      />
    </AreaChart>
  </ResponsiveContainer>
);

// Metric Card Component
const MetricCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  sparklineData,
  color,
  delay = 0,
}: {
  title: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down';
  icon: React.ElementType;
  sparklineData?: number[];
  color: string;
  delay?: number;
}) => {
  const isPositive = trend === 'up' || (change && change > 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
    >
      <Card className="relative overflow-hidden border-border/50 hover:border-border hover:shadow-lg transition-all duration-300 group bg-card">
        {/* Gradient accent */}
        <div 
          className="absolute top-0 left-0 right-0 h-1 opacity-80"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }}
        />
        
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: `${color}20` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            {sparklineData && <Sparkline data={sparklineData} color={color} />}
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <AnimatedCurrency value={value} className="text-2xl font-bold text-foreground font-mono" />
              {change !== undefined && (
                <Badge 
                  variant="outline"
                  className={`text-xs font-medium ${
                    isPositive 
                      ? 'bg-success/10 text-success border-success/20' 
                      : 'bg-destructive/10 text-destructive border-destructive/20'
                  }`}
                >
                  {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                  {Math.abs(change)}%
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Custom Tooltip for Charts
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-mono font-semibold text-foreground">
              ${entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueAnalytics() {
  const [viewMode, setViewMode] = useState<'mrr' | 'arr'>('mrr');
  const [predictionRange, setPredictionRange] = useState<30 | 60 | 90>(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const data = generateMockData();
  
  // Calculate metrics
  const currentMRR = data[data.length - 1]?.mrr || 0;
  const previousMRR = data[data.length - 2]?.mrr || currentMRR;
  const mrrGrowth = previousMRR ? ((currentMRR - previousMRR) / previousMRR * 100) : 0;
  
  const totalNewMRR = data.slice(-3).reduce((sum, d) => sum + d.newMrr, 0);
  const totalExpansion = data.slice(-3).reduce((sum, d) => sum + d.expansion, 0);
  const totalChurn = data.slice(-3).reduce((sum, d) => sum + d.churn, 0);
  const netMRR = totalNewMRR + totalExpansion - totalChurn;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    const csvContent = [
      'Month,MRR,ARR,New MRR,Expansion,Churn,Net MRR',
      ...data.map(d => `${d.month},${d.mrr},${d.arr},${d.newMrr},${d.expansion},${d.churn},${d.netMrr}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'revenue-analytics.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Revenue Analytics
          </h2>
          <p className="text-muted-foreground mt-1">Track your recurring revenue metrics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'mrr' | 'arr')}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="mrr" className="text-xs">MRR</TabsTrigger>
              <TabsTrigger value="arr" className="text-xs">ARR</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleRefresh}
                  className="h-9 w-9"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh data</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={viewMode === 'mrr' ? 'Current MRR' : 'Current ARR'}
          value={viewMode === 'mrr' ? currentMRR : currentMRR * 12}
          change={mrrGrowth}
          trend={mrrGrowth >= 0 ? 'up' : 'down'}
          icon={DollarSign}
          sparklineData={data.map(d => d.mrr)}
          color="hsl(var(--primary))"
          delay={0}
        />
        <MetricCard
          title="New MRR (Q)"
          value={totalNewMRR}
          change={12}
          trend="up"
          icon={Users}
          sparklineData={data.map(d => d.newMrr)}
          color="hsl(var(--success))"
          delay={50}
        />
        <MetricCard
          title="Expansion"
          value={totalExpansion}
          change={8}
          trend="up"
          icon={TrendingUp}
          sparklineData={data.map(d => d.expansion)}
          color="hsl(var(--info))"
          delay={100}
        />
        <MetricCard
          title="Churn"
          value={totalChurn}
          change={-3}
          trend="down"
          icon={TrendingDown}
          sparklineData={data.map(d => d.churn)}
          color="hsl(var(--destructive))"
          delay={150}
        />
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Revenue Trend
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Historical data with {predictionRange}-day prediction
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Tabs 
                  value={predictionRange.toString()} 
                  onValueChange={(v) => setPredictionRange(parseInt(v) as 30 | 60 | 90)}
                >
                  <TabsList className="bg-muted/50 h-8">
                    <TabsTrigger value="30" className="text-xs px-3">30D</TabsTrigger>
                    <TabsTrigger value="60" className="text-xs px-3">60D</TabsTrigger>
                    <TabsTrigger value="90" className="text-xs px-3">90D</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(var(--border))" 
                    vertical={false}
                  />
                  
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  
                  <RechartsTooltip content={<CustomChartTooltip />} />
                  
                  <Area
                    type="monotone"
                    dataKey={viewMode}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#mrrGradient)"
                    name={viewMode.toUpperCase()}
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="netMrr"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Net MRR"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">{viewMode.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 border-t-2 border-dashed border-success" />
                <span className="text-sm text-muted-foreground">Net MRR</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent/50" />
                <span className="text-sm text-muted-foreground">Prediction</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <Badge className="bg-success/20 text-success border-success/30">+{(totalNewMRR / currentMRR * 100).toFixed(1)}%</Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground">New Revenue</p>
              <p className="text-2xl font-bold text-foreground font-mono mt-1">
                ${totalNewMRR.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Last 90 days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Card className="border-info/20 bg-gradient-to-br from-info/5 to-info/10">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-info" />
                </div>
                <Badge className="bg-info/20 text-info border-info/30">Expansion</Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Upgrade Revenue</p>
              <p className="text-2xl font-bold text-foreground font-mono mt-1">
                ${totalExpansion.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-2">From tier upgrades</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30">Net</Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Net New MRR</p>
              <p className="text-2xl font-bold text-foreground font-mono mt-1">
                ${netMRR.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-2">After churn deduction</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
