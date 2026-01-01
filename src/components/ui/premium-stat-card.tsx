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
        variant === 'default' && 'bg-card border-border',
        variant === 'gradient' && 'bg-gradient-to-br from-primary to-primary/80 border-primary/20 text-white',
        variant === 'outline' && 'bg-transparent border-2 border-dashed border-border',
        sizeClasses[size],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background decoration */}
      {variant === 'default' && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <p
            className={cn(
              'text-sm font-medium',
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
              <div className={cn('flex items-center gap-1 text-sm font-medium', getTrendColor())}>
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
              ? 'bg-white/20 text-white'
              : 'bg-primary/10 text-primary'
          )}
        >
          <Icon className={cn(size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6')} />
        </div>
      </div>

      {/* Progress indicator (optional decoration) */}
      {variant === 'gradient' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div className="h-full w-3/4 bg-white/30 rounded-r-full" />
        </div>
      )}
    </div>
  );
}
