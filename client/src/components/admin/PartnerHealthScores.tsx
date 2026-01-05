// Partner Health Score Dashboard - Premium Analytics Component
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertTriangle, TrendingUp, TrendingDown, Search,
  Filter, ChevronRight, Flame, Shield, User, DollarSign,
  Clock, BarChart2, RefreshCw, Eye
} from 'lucide-react';

interface PartnerHealth {
  id: string;
  name: string;
  avatar: string;
  tier: string;
  healthScore: number;
  trend: 'up' | 'down' | 'stable';
  lastActive: string;
  monthlyRevenue: number;
  orderCount: number;
  riskFactors: string[];
  metrics: {
    engagement: number;
    revenue: number;
    growth: number;
    retention: number;
  };
}

// Mock data - TODO: Replace with real API
const generateMockPartners = (): PartnerHealth[] => {
  const names = [
    'Tech Solutions LLC', 'Fashion Hub', 'Electronics Plus', 'Home Essentials',
    'Beauty Corner', 'Sports World', 'Gadget Store', 'Kids Paradise',
    'Office Supplies Co', 'Organic Foods', 'Pet Care Shop', 'Auto Parts Pro'
  ];
  
  const tiers = ['starter_pro', 'business_standard', 'professional_plus', 'enterprise_elite'];
  
  return names.map((name, idx) => {
    const healthScore = Math.floor(30 + Math.random() * 70);
    const trend = healthScore > 60 ? 'up' : healthScore > 40 ? 'stable' : 'down';
    
    const riskFactors: string[] = [];
    if (healthScore < 40) riskFactors.push('Low activity');
    if (Math.random() > 0.7) riskFactors.push('Declining revenue');
    if (Math.random() > 0.8) riskFactors.push('Support tickets pending');
    if (Math.random() > 0.85) riskFactors.push('Payment overdue');
    
    return {
      id: `partner-${idx}`,
      name,
      avatar: name.charAt(0),
      tier: tiers[Math.floor(Math.random() * tiers.length)],
      healthScore,
      trend,
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      monthlyRevenue: Math.floor(1000 + Math.random() * 50000),
      orderCount: Math.floor(10 + Math.random() * 500),
      riskFactors,
      metrics: {
        engagement: Math.floor(20 + Math.random() * 80),
        revenue: Math.floor(20 + Math.random() * 80),
        growth: Math.floor(20 + Math.random() * 80),
        retention: Math.floor(20 + Math.random() * 80),
      }
    };
  });
};

// Health Score Gauge Component
const HealthGauge = ({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) => {
  const radius = size === 'sm' ? 24 : size === 'md' ? 36 : 48;
  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 6 : 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = () => {
    if (score >= 70) return 'hsl(var(--success))';
    if (score >= 40) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };
  
  const getGradientId = `gauge-gradient-${score}`;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg 
        width={(radius + strokeWidth) * 2} 
        height={(radius + strokeWidth) * 2}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id={getGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={getColor()} stopOpacity={0.8} />
            <stop offset="100%" stopColor={getColor()} stopOpacity={1} />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke={`url(#${getGradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold font-mono ${
          size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-2xl'
        } text-foreground`}>
          {score}
        </span>
      </div>
    </div>
  );
};

// Partner Card Component
const PartnerHealthCard = ({ partner, onClick }: { partner: PartnerHealth; onClick: () => void }) => {
  const getStatusIcon = () => {
    if (partner.healthScore >= 70) return <TrendingUp className="w-4 h-4 text-success" />;
    if (partner.healthScore >= 40) return <Activity className="w-4 h-4 text-warning" />;
    return <AlertTriangle className="w-4 h-4 text-destructive" />;
  };
  
  const getStatusLabel = () => {
    if (partner.healthScore >= 70) return { text: 'Healthy', class: 'bg-success/10 text-success border-success/20' };
    if (partner.healthScore >= 40) return { text: 'At Risk', class: 'bg-warning/10 text-warning border-warning/20' };
    return { text: 'Critical', class: 'bg-destructive/10 text-destructive border-destructive/20' };
  };
  
  const getTierName = (tier: string) => {
    const names: Record<string, string> = {
      starter_pro: 'Starter', business_standard: 'Business',
      professional_plus: 'Pro+', enterprise_elite: 'Enterprise'
    };
    return names[tier] || tier;
  };
  
  const status = getStatusLabel();
  const daysAgo = Math.floor((Date.now() - new Date(partner.lastActive).getTime()) / (24 * 60 * 60 * 1000));
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`
          relative overflow-hidden cursor-pointer group
          border-border/50 hover:border-border hover:shadow-lg
          transition-all duration-300
          ${partner.healthScore < 40 ? 'bg-destructive/5' : ''}
        `}
        onClick={onClick}
      >
        {/* Risk indicator bar */}
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: partner.healthScore >= 70 
              ? 'linear-gradient(90deg, hsl(var(--success)), hsl(var(--success) / 0.5))'
              : partner.healthScore >= 40
              ? 'linear-gradient(90deg, hsl(var(--warning)), hsl(var(--warning) / 0.5))'
              : 'linear-gradient(90deg, hsl(var(--destructive)), hsl(var(--destructive) / 0.5))'
          }}
        />
        
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Avatar & Score */}
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-lg">
                {partner.avatar}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center">
                {getStatusIcon()}
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {partner.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {getTierName(partner.tier)}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${status.class}`}>
                      {status.text}
                    </Badge>
                  </div>
                </div>
                
                <HealthGauge score={partner.healthScore} size="sm" />
              </div>
              
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="flex items-center gap-1.5 text-sm">
                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-mono font-medium text-foreground">
                    ${partner.monthlyRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Active:</span>
                  <span className="font-medium text-foreground">
                    {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                  </span>
                </div>
              </div>
              
              {/* Risk Factors */}
              {partner.riskFactors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {partner.riskFactors.slice(0, 2).map((risk, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="text-xs bg-destructive/5 text-destructive border-destructive/20"
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {risk}
                    </Badge>
                  ))}
                  {partner.riskFactors.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{partner.riskFactors.length - 2} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Hover Arrow */}
          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function PartnerHealthScores() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('score');
  const [selectedPartner, setSelectedPartner] = useState<PartnerHealth | null>(null);
  
  const partners = useMemo(() => generateMockPartners(), []);
  
  // Filter and sort
  const filteredPartners = useMemo(() => {
    let result = [...partners];
    
    // Search
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Score filter
    if (filterScore === 'critical') result = result.filter(p => p.healthScore < 40);
    else if (filterScore === 'at-risk') result = result.filter(p => p.healthScore >= 40 && p.healthScore < 70);
    else if (filterScore === 'healthy') result = result.filter(p => p.healthScore >= 70);
    
    // Tier filter
    if (filterTier !== 'all') result = result.filter(p => p.tier === filterTier);
    
    // Sort
    if (sortBy === 'score') result.sort((a, b) => a.healthScore - b.healthScore);
    else if (sortBy === 'score-desc') result.sort((a, b) => b.healthScore - a.healthScore);
    else if (sortBy === 'revenue') result.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);
    else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    
    return result;
  }, [partners, searchTerm, filterScore, filterTier, sortBy]);
  
  // Stats
  const stats = {
    total: partners.length,
    healthy: partners.filter(p => p.healthScore >= 70).length,
    atRisk: partners.filter(p => p.healthScore >= 40 && p.healthScore < 70).length,
    critical: partners.filter(p => p.healthScore < 40).length,
    avgScore: Math.round(partners.reduce((sum, p) => sum + p.healthScore, 0) / partners.length)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Partner Health Scores
          </h2>
          <p className="text-muted-foreground mt-1">Monitor partner engagement and risk</p>
        </div>
        
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-foreground font-mono">{stats.avgScore}</div>
              <p className="text-sm text-muted-foreground">Avg Score</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-foreground font-mono">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-success/20 bg-success/5">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-success font-mono">{stats.healthy}</div>
              <p className="text-sm text-muted-foreground">Healthy</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-warning font-mono">{stats.atRisk}</div>
              <p className="text-sm text-muted-foreground">At Risk</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-destructive font-mono">{stats.critical}</div>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Flame className="w-4 h-4" /> Critical
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            
            <Select value={filterScore} onValueChange={setFilterScore}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="All Scores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="critical">🔥 Critical (&lt;40)</SelectItem>
                <SelectItem value="at-risk">⚠️ At Risk (40-70)</SelectItem>
                <SelectItem value="healthy">📈 Healthy (70+)</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="starter_pro">Starter Pro</SelectItem>
                <SelectItem value="business_standard">Business</SelectItem>
                <SelectItem value="professional_plus">Professional+</SelectItem>
                <SelectItem value="enterprise_elite">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Score (Low first)</SelectItem>
                <SelectItem value="score-desc">Score (High first)</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Partner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredPartners.map((partner, idx) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: idx * 0.02 }}
            >
              <PartnerHealthCard 
                partner={partner} 
                onClick={() => setSelectedPartner(partner)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredPartners.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No partners found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
