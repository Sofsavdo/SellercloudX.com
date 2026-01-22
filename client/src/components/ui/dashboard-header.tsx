// Dashboard Header Component - Premium Fintech Style
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LucideIcon, Bell, Search, Plus } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    icon?: LucideIcon;
  };
  actions?: ReactNode;
  showSearch?: boolean;
  showNotifications?: boolean;
  className?: string;
}

export function DashboardHeader({
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
  showSearch = false,
  showNotifications = false,
  className,
}: DashboardHeaderProps) {
  const BadgeIcon = badge?.icon;

  return (
    <header
      className={cn(
        'flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6',
        'border-b border-border/50',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
            {badge && (
              <Badge
                variant={badge.variant || 'secondary'}
                className="font-medium bg-gradient-to-r from-[hsl(45,93%,47%)]/15 to-[hsl(38,92%,55%)]/15 text-[hsl(45,93%,35%)] border border-[hsl(45,93%,47%)]/20"
              >
                {BadgeIcon && <BadgeIcon className="w-3 h-3 mr-1" />}
                {badge.text}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {showSearch && (
          <Button variant="outline" size="icon" className="hidden md:flex">
            <Search className="w-4 h-4" />
          </Button>
        )}
        
        {showNotifications && (
          <Button variant="outline" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full" />
          </Button>
        )}

        {actions}
      </div>
    </header>
  );
}

// Quick Stats Header variant
interface QuickStatsHeaderProps {
  stats: {
    label: string;
    value: string | number;
    change?: number;
  }[];
  className?: string;
}

export function QuickStatsHeader({ stats, className }: QuickStatsHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-6 p-4 rounded-xl bg-card border border-border overflow-x-auto shadow-card',
        className
      )}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center gap-4 pr-6',
            index !== stats.length - 1 && 'border-r border-border'
          )}
        >
          <div className="space-y-0.5 whitespace-nowrap">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-foreground">{stat.value}</span>
              {stat.change !== undefined && (
                <span
                  className={cn(
                    'text-xs font-semibold px-1.5 py-0.5 rounded',
                    stat.change >= 0 
                      ? 'text-[hsl(152,76%,35%)] bg-success/10' 
                      : 'text-destructive bg-destructive/10'
                  )}
                >
                  {stat.change >= 0 ? '+' : ''}{stat.change}%
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
