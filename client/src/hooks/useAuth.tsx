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
  const [isLoading, setIsLoading] = useState(true); // Start with true for initial auth check

  // Real backend login with enhanced error handling
  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('🔐 Attempting login:', { username });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // Critical for cookies
        body: JSON.stringify({ username, password })
      });
      
      console.log('📡 Login response:', { 
        status: response.status, 
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Login failed:', error);
        throw new Error(error.message || 'Login failed');
      }
      
      const data = await response.json();
      console.log('✅ Login successful:', { 
        userId: data.user?.id, 
        role: data.user?.role,
        hasPartner: !!data.partner,
        sessionId: data.sessionId
      });
      
      setUser(data.user);
      setPartner(data.partner || null);
      setIsLoading(false);
      
      return { user: data.user, partner: data.partner };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('👋 Logging out...');
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
    setUser(null);
    setPartner(null);
    setIsLoading(false);
  }, []);

  const refetch = useCallback(async () => {
    try {
      console.log('🔄 Refetching auth state...');
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('📡 Auth check response:', { 
        status: response.status, 
        ok: response.ok 
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Auth state loaded:', { 
          userId: data.user?.id, 
          role: data.user?.role,
          hasPartner: !!data.partner
        });
        setUser(data.user);
        setPartner(data.partner || null);
      } else {
        console.log('⚠️ Not authenticated');
        setUser(null);
        setPartner(null);
      }
    } catch (error) {
      console.error('❌ Refetch error:', error);
      setUser(null);
      setPartner(null);
    } finally {
      setIsLoading(false);
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
