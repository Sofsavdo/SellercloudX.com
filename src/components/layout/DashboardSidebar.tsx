// Premium Dashboard Sidebar - Fintech Style
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Brain,
  Share2,
  Globe,
  BarChart3,
  Users,
  TrendingUp,
  Settings,
  MessageSquare,
  Gift,
  Package,
  ShoppingCart,
  Wallet,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: any;
  badge?: number | string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'destructive';
  isNew?: boolean;
  isPremium?: boolean;
}

interface DashboardSidebarProps {
  items: SidebarNavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole?: 'admin' | 'partner';
  userName?: string;
  userPlan?: string;
}

export function DashboardSidebar({
  items,
  activeTab,
  onTabChange,
  userRole = 'partner',
  userName = 'User',
  userPlan = 'Free',
}: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { logout } = useAuth();

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBadgeColor = (variant: string = 'default') => {
    const colors = {
      default: 'bg-primary/20 text-primary',
      success: 'bg-emerald-500/20 text-emerald-400',
      warning: 'bg-amber-500/20 text-amber-400',
      destructive: 'bg-red-500/20 text-red-400',
    };
    return colors[variant as keyof typeof colors] || colors.default;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ease-out',
          'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950',
          'border-r border-white/5',
          isCollapsed ? 'w-[72px]' : 'w-[280px]'
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">SellerCloudX</h1>
                <p className="text-xs text-slate-400">
                  {userRole === 'admin' ? 'Admin Console' : 'Partner Portal'}
                </p>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'text-slate-400 hover:text-white hover:bg-white/10 transition-colors',
              isCollapsed && 'absolute -right-3 top-5 bg-slate-800 border border-white/10 shadow-lg w-6 h-6'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-primary/50"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-2 px-3 space-y-1">
          {filteredItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'hover:bg-white/10',
                  isActive && 'bg-gradient-to-r from-primary/20 to-primary/5 text-white',
                  !isActive && 'text-slate-400 hover:text-white',
                  'animate-fade-in',
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}

                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-lg transition-all',
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'text-slate-400 group-hover:text-white'
                  )}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </div>

                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium text-left">{item.label}</span>
                    
                    <div className="flex items-center gap-1.5">
                      {item.isNew && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-500/20 text-emerald-400">
                          New
                        </span>
                      )}
                      {item.isPremium && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-500/20 text-amber-400">
                          Pro
                        </span>
                      )}
                      {item.badge && (
                        <span
                          className={cn(
                            'px-2 py-0.5 text-xs font-semibold rounded-full min-w-[20px] text-center',
                            getBadgeColor(item.badgeVariant)
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </>
                )}

                {isCollapsed && item.badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-white/5 p-4 space-y-3">
          {!isCollapsed && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center text-white font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-slate-400">{userPlan}</p>
              </div>
              <Bell className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          )}

          <Button
            variant="ghost"
            onClick={logout}
            className={cn(
              'w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all',
              isCollapsed ? 'justify-center px-0' : 'justify-start'
            )}
          >
            <LogOut className={cn('w-4 h-4', !isCollapsed && 'mr-2')} />
            {!isCollapsed && <span>Chiqish</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}

// Admin sidebar navigation items
export const adminNavItems: SidebarNavItem[] = [
  { id: 'overview', label: 'Umumiy', icon: LayoutDashboard },
  { id: 'ai-manager', label: 'AI Manager', icon: Brain, isPremium: true },
  { id: 'smm', label: 'SMM & Marketing', icon: Share2, isNew: true },
  { id: 'marketplace', label: 'Marketplace', icon: Globe },
  { id: 'analytics', label: 'Tahlillar', icon: BarChart3 },
  { id: 'partners', label: 'Hamkorlar', icon: Users },
  { id: 'trends', label: 'Trendlar', icon: TrendingUp },
  { id: 'chat', label: 'Support', icon: MessageSquare },
  { id: 'referrals', label: 'Referrallar', icon: Gift },
  { id: 'settings', label: 'Sozlamalar', icon: Settings },
];

// Partner sidebar navigation items
export const partnerNavItems: SidebarNavItem[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Mahsulotlar', icon: Package },
  { id: 'orders', label: 'Buyurtmalar', icon: ShoppingCart },
  { id: 'ai-manager', label: 'AI Manager', icon: Brain, isPremium: true },
  { id: 'analytics', label: 'Tahlillar', icon: BarChart3 },
  { id: 'wallet', label: 'Hamyon', icon: Wallet },
  { id: 'referrals', label: 'Referrallar', icon: Gift },
  { id: 'chat', label: 'Yordam', icon: MessageSquare },
  { id: 'settings', label: 'Sozlamalar', icon: Settings },
];
