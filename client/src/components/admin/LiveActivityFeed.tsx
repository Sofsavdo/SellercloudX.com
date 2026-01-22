// Live Activity Feed - Real-time Sales & Activity Component
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, DollarSign, Package, User, AlertTriangle, Trophy,
  Pause, Play, Volume2, VolumeX, Filter, Sparkles, ShoppingCart,
  TrendingUp, RefreshCw, RotateCcw, ChevronRight
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'sale' | 'order' | 'partner' | 'refund' | 'milestone';
  partnerName: string;
  partnerAvatar: string;
  marketplace?: string;
  productName?: string;
  amount?: number;
  message: string;
  timestamp: Date;
}

// Generate mock activity - TODO: Replace with WebSocket/real-time API
const generateMockActivity = (): ActivityItem => {
  const types: ActivityItem['type'][] = ['sale', 'sale', 'sale', 'order', 'partner', 'refund', 'milestone'];
  const type = types[Math.floor(Math.random() * types.length)];
  const names = ['Tech Solutions', 'Fashion Hub', 'Electronics Plus', 'Home Essentials', 'Beauty Corner', 'Sports World'];
  const products = ['iPhone Case', 'Wireless Earbuds', 'Smart Watch', 'Laptop Stand', 'USB-C Hub', 'Power Bank'];
  const marketplaces = ['Uzum', 'Asaxiy', 'Alibaba', 'Amazon'];
  
  const partnerName = names[Math.floor(Math.random() * names.length)];
  const productName = products[Math.floor(Math.random() * products.length)];
  const marketplace = marketplaces[Math.floor(Math.random() * marketplaces.length)];
  const amount = Math.floor(10 + Math.random() * 200);
  
  let message = '';
  switch (type) {
    case 'sale':
      message = `sold ${productName} on ${marketplace}`;
      break;
    case 'order':
      message = `received new order on ${marketplace}`;
      break;
    case 'partner':
      message = 'joined the platform';
      break;
    case 'refund':
      message = `processed a refund for ${productName}`;
      break;
    case 'milestone':
      message = `hit $${(Math.floor(Math.random() * 10) + 1) * 1000} monthly revenue!`;
      break;
  }
  
  return {
    id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    partnerName,
    partnerAvatar: partnerName.charAt(0),
    marketplace,
    productName,
    amount: type === 'sale' || type === 'refund' ? amount : undefined,
    message,
    timestamp: new Date()
  };
};

// Activity Item Component
const ActivityItemCard = ({ item, index }: { item: ActivityItem; index: number }) => {
  const getTypeConfig = () => {
    switch (item.type) {
      case 'sale':
        return {
          icon: DollarSign,
          gradient: 'from-success/20 to-success/5',
          border: 'border-success/30',
          iconBg: 'bg-success/20',
          iconColor: 'text-success',
          amountColor: 'text-success'
        };
      case 'order':
        return {
          icon: ShoppingCart,
          gradient: 'from-info/20 to-info/5',
          border: 'border-info/30',
          iconBg: 'bg-info/20',
          iconColor: 'text-info',
          amountColor: 'text-info'
        };
      case 'partner':
        return {
          icon: User,
          gradient: 'from-primary/20 to-primary/5',
          border: 'border-primary/30',
          iconBg: 'bg-primary/20',
          iconColor: 'text-primary',
          amountColor: 'text-primary'
        };
      case 'refund':
        return {
          icon: AlertTriangle,
          gradient: 'from-destructive/20 to-destructive/5',
          border: 'border-destructive/30',
          iconBg: 'bg-destructive/20',
          iconColor: 'text-destructive',
          amountColor: 'text-destructive'
        };
      case 'milestone':
        return {
          icon: Trophy,
          gradient: 'from-warning/20 to-warning/5',
          border: 'border-warning/30',
          iconBg: 'bg-warning/20',
          iconColor: 'text-warning',
          amountColor: 'text-warning'
        };
    }
  };
  
  const config = getTypeConfig();
  const Icon = config.icon;
  
  const formatTime = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index === 0 ? 0 : 0.05,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      <div 
        className={`
          p-4 rounded-xl bg-gradient-to-r ${config.gradient}
          border ${config.border} hover:shadow-md
          transition-all duration-200 group
        `}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xs font-bold">
                {item.partnerAvatar}
              </div>
              <span className="font-semibold text-foreground text-sm truncate">
                {item.partnerName}
              </span>
              <span className="text-muted-foreground text-sm truncate">
                {item.message}
              </span>
            </div>
          </div>
          
          {/* Amount & Time */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {item.amount !== undefined && (
              <span className={`font-mono font-bold ${config.amountColor}`}>
                {item.type === 'refund' ? '-' : '+'}${item.amount.toFixed(2)}
              </span>
            )}
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTime(item.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Simulate real-time activity
  useEffect(() => {
    // Initial activities
    const initial = Array.from({ length: 8 }, () => {
      const activity = generateMockActivity();
      activity.timestamp = new Date(Date.now() - Math.random() * 300000);
      return activity;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setActivities(initial);
    
    // Add new activities periodically
    const interval = setInterval(() => {
      if (!isPaused && !isHovered) {
        setActivities(prev => {
          const newActivity = generateMockActivity();
          const updated = [newActivity, ...prev].slice(0, 50); // Keep last 50
          
          // Play sound if enabled
          if (soundEnabled && newActivity.type === 'sale') {
            // TODO: Play notification sound
            // new Audio('/notification.mp3').play();
          }
          
          return updated;
        });
      }
    }, 3000 + Math.random() * 4000); // Random interval 3-7 seconds
    
    return () => clearInterval(interval);
  }, [isPaused, isHovered, soundEnabled]);
  
  // Filter activities
  const filteredActivities = filterType === 'all' 
    ? activities 
    : activities.filter(a => a.type === filterType);
  
  // Stats
  const stats = {
    totalSales: activities.filter(a => a.type === 'sale').reduce((sum, a) => sum + (a.amount || 0), 0),
    salesCount: activities.filter(a => a.type === 'sale').length,
    newPartners: activities.filter(a => a.type === 'partner').length,
  };

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className="w-5 h-5 text-primary" />
              {!isPaused && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">Live Activity</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Real-time platform events
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="sale">💰 Sales</SelectItem>
                <SelectItem value="order">📦 Orders</SelectItem>
                <SelectItem value="partner">👤 Partners</SelectItem>
                <SelectItem value="refund">⚠️ Refunds</SelectItem>
                <SelectItem value="milestone">🏆 Milestones</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Sound Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-primary" />
              ) : (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
            
            {/* Pause/Play */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? (
                <Play className="w-4 h-4 text-success" />
              ) : (
                <Pause className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Today</p>
              <p className="font-mono font-semibold text-foreground">${stats.totalSales.toFixed(0)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sales</p>
              <p className="font-mono font-semibold text-foreground">{stats.salesCount}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">New</p>
              <p className="font-mono font-semibold text-foreground">{stats.newPartners}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ScrollArea 
          className="h-[400px] pr-4"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {filteredActivities.map((activity, index) => (
                <ActivityItemCard 
                  key={activity.id} 
                  item={activity} 
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
          
          {filteredActivities.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <Activity className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No activity yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Events will appear here in real-time
              </p>
            </div>
          )}
        </ScrollArea>
        
        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {isPaused ? (
              <span className="flex items-center gap-1">
                <Pause className="w-3 h-3" /> Paused
              </span>
            ) : isHovered ? (
              <span className="flex items-center gap-1">
                <Pause className="w-3 h-3" /> Paused (hover)
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                Live updates
              </span>
            )}
          </p>
          
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            View All Activity
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
