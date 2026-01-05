// Cohort Analysis Heatmap - Premium Analytics Component
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { Grid3X3, Filter, Download, Info, TrendingUp, Users, Calendar } from 'lucide-react';

interface CohortData {
  month: string;
  partners: number;
  retention: number[];
}

// Generate mock cohort data - TODO: Replace with real API
const generateCohortData = (): CohortData[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  return months.slice(0, currentMonth + 1).map((month, idx) => {
    const partners = Math.floor(20 + Math.random() * 30);
    const retention: number[] = [];
    
    // Generate retention rates (decreasing over time)
    for (let i = 0; i <= Math.min(12, currentMonth - idx); i++) {
      if (i === 0) {
        retention.push(100);
      } else {
        const prevRate = retention[i - 1];
        const decay = 5 + Math.random() * 10;
        retention.push(Math.max(0, Math.round(prevRate - decay)));
      }
    }
    
    return { month, partners, retention };
  });
};

// Get color based on retention rate
const getRetentionColor = (rate: number): string => {
  if (rate >= 80) return 'bg-success/80 text-success-foreground';
  if (rate >= 60) return 'bg-success/50 text-foreground';
  if (rate >= 40) return 'bg-warning/50 text-foreground';
  if (rate >= 20) return 'bg-warning/30 text-foreground';
  return 'bg-destructive/30 text-foreground';
};

const getRetentionBorderColor = (rate: number): string => {
  if (rate >= 80) return 'border-success/50';
  if (rate >= 60) return 'border-success/30';
  if (rate >= 40) return 'border-warning/30';
  if (rate >= 20) return 'border-warning/20';
  return 'border-destructive/20';
};

// Cohort Cell Component
const CohortCell = ({ 
  rate, 
  partners, 
  month, 
  monthIndex 
}: { 
  rate: number; 
  partners: number; 
  month: string;
  monthIndex: number;
}) => {
  const activePartners = Math.round(partners * rate / 100);
  
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: monthIndex * 0.02 }}
            className={`
              w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center
              font-mono text-sm font-semibold cursor-pointer
              transition-all duration-200 hover:scale-110 hover:z-10
              border ${getRetentionBorderColor(rate)} ${getRetentionColor(rate)}
            `}
          >
            {rate}%
          </motion.div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="bg-popover/95 backdrop-blur-sm border-border p-3"
        >
          <div className="space-y-1.5">
            <p className="font-semibold text-foreground">{month} Cohort - Month {monthIndex}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Retention:</span>
              <Badge className={getRetentionColor(rate)}>{rate}%</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Active:</span>
              <span className="font-mono font-semibold text-foreground">{activePartners} / {partners}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function CohortAnalysis() {
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  
  const cohortData = useMemo(() => generateCohortData(), []);
  const maxMonths = Math.max(...cohortData.map(c => c.retention.length));
  
  // Calculate averages
  const avgRetention = cohortData.reduce((sum, c) => {
    const lastRetention = c.retention[c.retention.length - 1] || 0;
    return sum + lastRetention;
  }, 0) / cohortData.length;
  
  const totalPartners = cohortData.reduce((sum, c) => sum + c.partners, 0);
  const month3Retention = cohortData
    .filter(c => c.retention.length > 3)
    .reduce((sum, c) => sum + c.retention[3], 0) / cohortData.filter(c => c.retention.length > 3).length || 0;

  const handleExport = () => {
    const headers = ['Cohort', 'Partners', ...Array.from({ length: maxMonths }, (_, i) => `Month ${i}`)];
    const rows = cohortData.map(c => [
      c.month,
      c.partners,
      ...c.retention.map(r => `${r}%`),
      ...Array(maxMonths - c.retention.length).fill('')
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cohort-analysis.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Grid3X3 className="w-6 h-6 text-primary" />
            Cohort Analysis
          </h2>
          <p className="text-muted-foreground mt-1">Partner retention by signup month</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Partners</p>
                  <p className="text-2xl font-bold text-foreground font-mono">{totalPartners}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">3-Month Retention</p>
                  <p className="text-2xl font-bold text-foreground font-mono">{month3Retention.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg LTV Retention</p>
                  <p className="text-2xl font-bold text-foreground font-mono">{avgRetention.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3">
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="starter">Starter Pro</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="home">Home & Garden</SelectItem>
                <SelectItem value="food">Food & Beverage</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="tashkent">Tashkent</SelectItem>
                <SelectItem value="samarkand">Samarkand</SelectItem>
                <SelectItem value="bukhara">Bukhara</SelectItem>
                <SelectItem value="fergana">Fergana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Retention Heatmap</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rows represent signup cohorts, columns show months since signup</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Legend */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Low</span>
                <div className="flex gap-0.5">
                  <div className="w-4 h-4 rounded bg-destructive/30" />
                  <div className="w-4 h-4 rounded bg-warning/30" />
                  <div className="w-4 h-4 rounded bg-warning/50" />
                  <div className="w-4 h-4 rounded bg-success/50" />
                  <div className="w-4 h-4 rounded bg-success/80" />
                </div>
                <span className="text-muted-foreground">High</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-max">
                {/* Column Headers */}
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-20 text-sm font-medium text-muted-foreground">Cohort</div>
                  <div className="w-16 text-sm font-medium text-muted-foreground text-center">Users</div>
                  {Array.from({ length: maxMonths }, (_, i) => (
                    <div 
                      key={i} 
                      className="w-12 sm:w-14 text-xs font-medium text-muted-foreground text-center"
                    >
                      M{i}
                    </div>
                  ))}
                </div>
                
                {/* Rows */}
                <div className="space-y-1">
                  {cohortData.map((cohort, rowIdx) => (
                    <div key={cohort.month} className="flex items-center gap-1">
                      <div className="w-20 text-sm font-medium text-foreground">{cohort.month}</div>
                      <div className="w-16 text-sm text-muted-foreground text-center font-mono">
                        {cohort.partners}
                      </div>
                      {cohort.retention.map((rate, colIdx) => (
                        <CohortCell
                          key={`${cohort.month}-${colIdx}`}
                          rate={rate}
                          partners={cohort.partners}
                          month={cohort.month}
                          monthIndex={colIdx}
                        />
                      ))}
                      {/* Empty cells for alignment */}
                      {Array.from({ length: maxMonths - cohort.retention.length }, (_, i) => (
                        <div 
                          key={`empty-${i}`} 
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-muted/20 border border-dashed border-border/50"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
