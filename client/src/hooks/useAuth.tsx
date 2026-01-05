// Real Backend Auth Hook for SellerCloudX
import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

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

  // Real backend login
  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const data = await response.json();
      setUser(data.user);
      setPartner(data.partner || null);
      setIsLoading(false);
      
      return { user: data.user, partner: data.partner };
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setPartner(null);
    setIsLoading(false);
  }, []);

  const refetch = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setPartner(data.partner || null);
      }
    } catch (error) {
      console.error('Refetch error:', error);
    }
  }, []);

  // Load auth on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

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
