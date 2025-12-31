// Professional Sidebar Component - Collapsible, Modern Design
import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Brain,
  Share2,
  Globe,
  FileText,
  Users,
  TrendingUp,
  Settings,
  MessageCircle,
  Gift,
  Home,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  badge?: number;
  gradient?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  userRole?: 'admin' | 'partner';
  selectedTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Sidebar({ items, userRole = 'partner', selectedTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location] = useLocation();
  const { logout } = useAuth();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={cn(
        'fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 transition-all duration-300 z-50 shadow-2xl',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">SellerCloudX</div>
              <div className="text-xs text-slate-400">
                {userRole === 'admin' ? 'Admin Panel' : 'Partner Dashboard'}
              </div>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto">
            <Brain className="w-5 h-5 text-white" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-white hover:bg-slate-700/50"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = selectedTab ? selectedTab === item.id : (location === item.path || location.startsWith(item.path + '/'));
          
          const handleClick = () => {
            if (onTabChange) {
              onTabChange(item.id);
            }
          };
          
          return (
            <div
              key={item.id}
              onClick={handleClick}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer',
                isActive
                  ? item.gradient || 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border-l-2 border-blue-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
              )}
            >
                <Icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0 transition-transform',
                    isActive && 'text-blue-400',
                    !isCollapsed && 'group-hover:scale-110'
                  )}
                />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
                )}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700/50 p-4 space-y-2">
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-700/30">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {userRole === 'admin' ? 'Admin' : 'Partner'}
              </div>
              <div className="text-xs text-slate-400 truncate">Online</div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            'w-full justify-start text-slate-400 hover:text-white hover:bg-red-500/20',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut className={cn('w-4 h-4', !isCollapsed && 'mr-2')} />
          {!isCollapsed && <span>Chiqish</span>}
        </Button>
      </div>
    </div>
  );
}

// Admin Sidebar Items
export const adminSidebarItems: SidebarItem[] = [
  {
    id: 'overview',
    label: 'Umumiy',
    icon: BarChart3,
    path: '/admin',
  },
  {
    id: 'ai-manager',
    label: 'AI Manager',
    icon: Brain,
    path: '/admin',
    gradient: 'bg-gradient-to-r from-purple-500/20 to-blue-500/20',
  },
  {
    id: 'smm',
    label: 'SMM',
    icon: Share2,
    path: '/admin',
    gradient: 'bg-gradient-to-r from-pink-500/20 to-rose-500/20',
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: Globe,
    path: '/admin',
  },
  {
    id: 'analytics',
    label: 'Tahlil',
    icon: FileText,
    path: '/admin',
  },
  {
    id: 'partners',
    label: 'Hamkorlar',
    icon: Users,
    path: '/admin',
  },
  {
    id: 'trends',
    label: 'Trendlar',
    icon: TrendingUp,
    path: '/admin',
  },
  {
    id: 'settings',
    label: 'Sozlamalar',
    icon: Settings,
    path: '/admin',
  },
  {
    id: 'chat',
    label: 'Support Chat',
    icon: MessageCircle,
    path: '/admin',
  },
  {
    id: 'referrals',
    label: 'Referrallar',
    icon: Gift,
    path: '/admin',
  },
];

// Partner Sidebar Items
export const partnerSidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard',
  },
  {
    id: 'products',
    label: 'Mahsulotlar',
    icon: Package,
    path: '/dashboard',
  },
  {
    id: 'analytics',
    label: 'Tahlil',
    icon: TrendingUp,
    path: '/dashboard',
  },
  {
    id: 'referrals',
    label: 'Referrallar',
    icon: Gift,
    path: '/dashboard',
  },
  {
    id: 'chat',
    label: 'Yordam',
    icon: MessageCircle,
    path: '/dashboard',
  },
];

