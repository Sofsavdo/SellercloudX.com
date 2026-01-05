// Modern Statistics Card Component with Animations
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedCard } from './AnimatedCard';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  className?: string;
  delay?: number;
  gradient?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  className,
  delay = 0,
  gradient = false
}: StatCardProps) {
  return (
    <AnimatedCard
      delay={delay}
      hover={true}
      gradient={gradient}
      className={cn('relative overflow-hidden', className)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
            {trend && (
              <span
                className={cn(
                  'text-sm font-semibold flex items-center gap-1',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            'p-3 rounded-xl transition-all duration-300',
            gradient
              ? 'bg-white/20 text-white'
              : 'bg-primary/10 text-primary'
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {/* Decorative gradient overlay */}
      {gradient && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -z-10" />
      )}
    </AnimatedCard>
  );
}

