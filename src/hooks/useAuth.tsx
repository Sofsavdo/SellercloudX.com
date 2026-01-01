// Frontend-only Auth Hook for Lovable
// Backend mavjud emas, shuning uchun demo mode ishlatiladi
import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import { DEMO_USER, DEMO_ADMIN, DEMO_PARTNER } from '@/lib/demoData';

interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'partner' | 'customer';
  isActive?: boolean;
}

interface Partner {
  id: string;
  userId: string;
  businessName?: string;
  businessCategory: string;
  pricingTier: string;
  isApproved: boolean;
  monthlyRevenue?: string;
  commissionRate?: string;
  telegramConnected?: boolean;
  marketplaces?: string[];
  aiEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  partner: Partner | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ user: User; partner?: Partner }>;
  logout: () => Promise<void>;
  refetch: () => void;
  permissions: Record<string, boolean> | null;
  isAdmin: boolean;
  isPartner: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Demo login - faqat frontend uchun
  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Admin login
    if (username === 'admin' || username.includes('admin')) {
      setUser(DEMO_ADMIN);
      setPartner(null);
      setIsLoading(false);
      // Save to localStorage for persistence
      localStorage.setItem('auth_user', JSON.stringify(DEMO_ADMIN));
      localStorage.removeItem('auth_partner');
      return { user: DEMO_ADMIN };
    }
    
    // Partner login
    setUser(DEMO_USER);
    setPartner(DEMO_PARTNER as Partner);
    setIsLoading(false);
    localStorage.setItem('auth_user', JSON.stringify(DEMO_USER));
    localStorage.setItem('auth_partner', JSON.stringify(DEMO_PARTNER));
    return { user: DEMO_USER, partner: DEMO_PARTNER as Partner };
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setUser(null);
    setPartner(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_partner');
    setIsLoading(false);
  }, []);

  const refetch = useCallback(() => {
    // Check localStorage for persisted auth
    const savedUser = localStorage.getItem('auth_user');
    const savedPartner = localStorage.getItem('auth_partner');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      if (savedPartner) {
        setPartner(JSON.parse(savedPartner));
      }
    }
  }, []);

  // Load saved auth on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    const savedPartner = localStorage.getItem('auth_partner');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      if (savedPartner) {
        setPartner(JSON.parse(savedPartner));
      }
    }
  }, []);

  const contextValue: AuthContextType = useMemo(() => ({
    user,
    partner,
    isLoading,
    login,
    logout,
    refetch,
    permissions: null,
    isAdmin: user?.role === 'admin',
    isPartner: user?.role === 'partner',
  }), [user, partner, isLoading, login, logout, refetch]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
