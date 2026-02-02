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
  FileText,
  CreditCard,
  Target,
  PhoneCall,
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
          'bg-gradient-to-b from-[hsl(220,70%,8%)] via-[hsl(220,65%,10%)] to-[hsl(220,70%,6%)]',
          'border-r border-white/[0.06]',
          isCollapsed ? 'w-[72px]' : 'w-[280px]'
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.06]">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(220,70%,50%)] to-[hsl(250,84%,54%)] flex items-center justify-center shadow-lg shadow-primary/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[hsl(152,76%,42%)] rounded-full border-2 border-[hsl(220,70%,8%)]" />
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(220,70%,50%)] to-[hsl(250,84%,54%)] flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'text-slate-400 hover:text-white hover:bg-white/10 transition-colors',
              isCollapsed && 'absolute -right-3 top-5 bg-[hsl(220,65%,12%)] border border-white/10 shadow-lg w-6 h-6 rounded-full'
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
                  'group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                  'hover:bg-white/[0.08]',
                  isActive && 'bg-gradient-to-r from-[hsl(220,70%,50%)]/20 via-[hsl(220,70%,50%)]/10 to-transparent text-white',
                  !isActive && 'text-slate-400 hover:text-white',
                  'animate-fade-in',
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Active indicator - Gold accent */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-[hsl(45,93%,47%)] to-[hsl(38,92%,55%)] rounded-r-full shadow-[0_0_8px_hsl(45,93%,47%,0.5)]" />
                )}

                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-lg transition-all',
                    isActive
                      ? 'bg-gradient-to-br from-[hsl(220,70%,50%)]/30 to-[hsl(250,84%,54%)]/20 text-white'
                      : 'text-slate-400 group-hover:text-white group-hover:bg-white/[0.06]'
                  )}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </div>

                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium text-left">{item.label}</span>
                    
                    <div className="flex items-center gap-1.5">
                      {item.isNew && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-[hsl(152,76%,36%)]/20 text-[hsl(152,76%,50%)]">
                          New
                        </span>
                      )}
                      {item.isPremium && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-gradient-to-r from-[hsl(45,93%,47%)]/20 to-[hsl(38,92%,55%)]/20 text-[hsl(45,93%,55%)]">
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
        <div className="border-t border-white/[0.06] p-4 space-y-3">
          {!isCollapsed && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-white/[0.06] to-transparent border border-white/[0.04]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(220,70%,50%)] to-[hsl(45,93%,47%)] flex items-center justify-center text-white font-semibold shadow-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-[hsl(45,93%,55%)]">{userPlan}</p>
              </div>
              <div className="relative">
                <Bell className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer transition-colors" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[hsl(45,93%,47%)] rounded-full" />
              </div>
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
  { id: 'leads', label: 'Leadlar', icon: PhoneCall, isNew: true },
  { id: 'marketplace', label: 'Marketplace', icon: Globe },
  { id: 'analytics', label: 'Tahlillar', icon: BarChart3 },
  { id: 'partners', label: 'Hamkorlar', icon: Users },
  { id: 'blog', label: 'Blog', icon: FileText, isNew: true },
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
  { id: 'trend-hunter', label: 'Trend Hunter', icon: TrendingUp, isNew: true, isPremium: true },
  { id: 'analytics', label: 'Tahlillar', icon: BarChart3 },
  { id: 'payments', label: 'To\'lovlar', icon: CreditCard, isNew: true },
  { id: 'wallet', label: 'Hamyon', icon: Wallet },
  { id: 'referrals', label: 'Referrallar', icon: Gift },
  { id: 'chat', label: 'Yordam', icon: MessageSquare },
  { id: 'settings', label: 'Sozlamalar', icon: Settings },
];
