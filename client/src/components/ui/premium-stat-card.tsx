// Premium Stat Card - Fintech Style
import { ReactNode } from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  subtitle?: string;
  variant?: 'default' | 'gradient' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  delay?: number;
}

export function PremiumStatCard({
  title,
  value,
  icon: Icon,
  change,
  subtitle,
  variant = 'default',
  size = 'md',
  className,
  delay = 0,
}: PremiumStatCardProps) {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const valueSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const getTrendIcon = () => {
    if (!change) return null;
    if (change.type === 'increase') return TrendingUp;
    if (change.type === 'decrease') return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (!change) return '';
    if (change.type === 'increase') return 'text-emerald-500';
    if (change.type === 'decrease') return 'text-red-500';
    return 'text-slate-500';
  };

  const TrendIcon = getTrendIcon();

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border transition-all duration-300',
        'animate-fade-in hover-lift',
        variant === 'default' && 'bg-card border-border shadow-card',
        variant === 'gradient' && 'bg-gradient-to-br from-[hsl(220,70%,45%)] via-[hsl(235,70%,50%)] to-[hsl(250,84%,50%)] border-transparent text-white shadow-lg shadow-primary/20',
        variant === 'outline' && 'bg-transparent border-2 border-dashed border-border',
        sizeClasses[size],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Premium background decoration */}
      {variant === 'default' && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-[hsl(45,93%,47%)]/5 to-transparent rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
        </>
      )}
      
      {variant === 'gradient' && (
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <p
            className={cn(
              'text-sm font-medium tracking-wide',
              variant === 'gradient' ? 'text-white/80' : 'text-muted-foreground'
            )}
          >
            {title}
          </p>

          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              className={cn(
                'font-bold tracking-tight',
                valueSizes[size],
                variant === 'gradient' ? 'text-white' : 'text-foreground'
              )}
            >
              {value}
            </span>

            {change && TrendIcon && (
              <div className={cn(
                'flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full',
                change.type === 'increase' && 'bg-[hsl(152,76%,36%)]/15 text-[hsl(152,76%,45%)]',
                change.type === 'decrease' && 'bg-destructive/15 text-destructive',
                change.type === 'neutral' && 'bg-muted text-muted-foreground'
              )}>
                <TrendIcon className="w-3.5 h-3.5" />
                <span>{Math.abs(change.value)}%</span>
              </div>
            )}
          </div>

          {(subtitle || change?.period) && (
            <p
              className={cn(
                'text-xs',
                variant === 'gradient' ? 'text-white/60' : 'text-muted-foreground'
              )}
            >
              {subtitle || change?.period}
            </p>
          )}
        </div>

        <div
          className={cn(
            'flex items-center justify-center rounded-xl transition-transform',
            iconSizes[size],
            variant === 'gradient'
              ? 'bg-white/15 text-white backdrop-blur-sm'
              : 'bg-gradient-to-br from-primary/15 to-primary/5 text-primary'
          )}
        >
          <Icon className={cn(size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6')} />
        </div>
      </div>

      {/* Progress indicator with gold accent */}
      {variant === 'gradient' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div className="h-full w-3/4 bg-gradient-to-r from-white/40 via-[hsl(45,93%,60%)]/50 to-white/20 rounded-r-full" />
        </div>
      )}
    </div>
  );
}
