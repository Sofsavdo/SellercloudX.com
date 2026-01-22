// Data Card Component - Premium Fintech Style
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, MoreHorizontal, TrendingUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  actions?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: 'default' | 'destructive';
  }[];
  headerAction?: ReactNode;
  footer?: ReactNode;
  className?: string;
  noPadding?: boolean;
  isLoading?: boolean;
}

export function DataCard({
  title,
  subtitle,
  icon: Icon,
  children,
  actions,
  headerAction,
  footer,
  className,
  noPadding = false,
  isLoading = false,
}: DataCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card overflow-hidden',
        'shadow-card transition-all duration-300',
        'hover:shadow-card-hover hover:border-primary/20',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center border border-primary/10">
              <Icon className="w-4 h-4 text-primary" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {headerAction}
          
          {actions && actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, index) => {
                  const ActionIcon = action.icon;
                  return (
                    <DropdownMenuItem
                      key={index}
                      onClick={action.onClick}
                      className={cn(
                        action.variant === 'destructive' && 'text-destructive focus:text-destructive'
                      )}
                    >
                      {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={cn(!noPadding && 'p-4', isLoading && 'animate-pulse')}>
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-4 py-3 border-t border-border/50 bg-muted/30">
          {footer}
        </div>
      )}
    </div>
  );
}

// Mini Card variant
interface MiniCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  onClick?: () => void;
  className?: string;
}

export function MiniCard({ title, value, icon: Icon, trend, onClick, className }: MiniCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl border border-border bg-card',
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:border-primary/50 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        {trend !== undefined && (
          <span
            className={cn(
              'text-xs font-medium flex items-center gap-1',
              trend >= 0 ? 'text-emerald-500' : 'text-red-500'
            )}
          >
            <TrendingUp className={cn('w-3 h-3', trend < 0 && 'rotate-180')} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{title}</p>
    </div>
  );
}

// Action Card variant
interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'primary' | 'accent';
  className?: string;
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  action,
  variant = 'default',
  className,
}: ActionCardProps) {
  const bgColors = {
    default: 'bg-card',
    primary: 'bg-gradient-to-br from-primary/10 to-primary/5',
    accent: 'bg-gradient-to-br from-accent/10 to-accent/5',
  };

  const iconColors = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/20 text-primary',
    accent: 'bg-accent/20 text-accent',
  };

  return (
    <div
      className={cn(
        'p-5 rounded-xl border border-border',
        'transition-all duration-300 hover:shadow-md',
        bgColors[variant],
        className
      )}
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', iconColors[variant])}>
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="text-base font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Button
        variant={variant === 'default' ? 'outline' : 'default'}
        size="sm"
        onClick={action.onClick}
        className="group"
      >
        {action.label}
        <ExternalLink className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
      </Button>
    </div>
  );
}
