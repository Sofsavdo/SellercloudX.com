import { Crown, Headphones, DollarSign, Package, BarChart3, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const roleConfig: Record<string, {
  label: string;
  colors: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  super_admin: {
    label: 'Super Admin',
    colors: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
    icon: Crown,
  },
  support_admin: {
    label: 'Support Admin',
    colors: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    icon: Headphones,
  },
  finance_admin: {
    label: 'Finance Admin',
    colors: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
    icon: DollarSign,
  },
  content_admin: {
    label: 'Content Admin',
    colors: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
    icon: Package,
  },
  analytics_admin: {
    label: 'Analytics Admin',
    colors: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700',
    icon: BarChart3,
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function RoleBadge({ role, size = 'md', showIcon = true }: RoleBadgeProps) {
  const config = roleConfig[role] || {
    label: role,
    colors: 'bg-muted text-muted-foreground border-border',
    icon: Shield,
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        config.colors,
        sizeClasses[size]
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
}

export function getRoleLabel(role: string): string {
  return roleConfig[role]?.label || role;
}

export function getRoleIcon(role: string) {
  return roleConfig[role]?.icon || Shield;
}

