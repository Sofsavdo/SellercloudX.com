// Real Backend Auth Hook for SellerCloudX
// Token-based authentication with Python backend
import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode, useEffect } from 'react';
import { apiRequest, setAuthToken, getAuthToken } from '@/lib/queryClient';

interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'partner' | 'customer';
  isActive?: boolean;
  is_active?: boolean;
}

interface Partner {
  id: string;
  userId?: string;
  user_id?: string;
  businessName?: string;
  business_name?: string;
  businessCategory?: string;
  business_category?: string;
  pricingTier?: string;
  tariff_type?: string;
  isApproved?: boolean;
  approved?: boolean;
  is_active?: boolean;
  monthlyRevenue?: string;
  commissionRate?: string;
  telegramConnected?: boolean;
  marketplaces?: string[];
  aiEnabled?: boolean;
  ai_enabled?: boolean;
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

// Normalize user data from Python backend (snake_case to camelCase)
function normalizeUser(data: any): User | null {
  if (!data) return null;
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    firstName: data.firstName || data.first_name,
    lastName: data.lastName || data.last_name,
    role: data.role,
    isActive: data.isActive ?? data.is_active ?? true,
  };
}

// Normalize partner data from Python backend
function normalizePartner(data: any): Partner | null {
  if (!data) return null;
  return {
    id: data.id,
    userId: data.userId || data.user_id,
    businessName: data.businessName || data.business_name,
    businessCategory: data.businessCategory || data.business_category,
    pricingTier: data.pricingTier || data.tariff_type || 'trial',
    isApproved: data.isApproved ?? data.approved ?? false,
    monthlyRevenue: data.monthlyRevenue || data.monthly_revenue,
    aiEnabled: data.aiEnabled ?? data.ai_enabled ?? false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Token-based login
  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log('🔐 Attempting login:', { username });
      
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      
      console.log('📡 Login response:', { status: response.status, ok: response.ok });
      
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
        hasToken: !!data.token
      });
      
      // Save token
      if (data.token) {
        setAuthToken(data.token);
      }
      
      const normalizedUser = normalizeUser(data.user);
      const normalizedPartner = normalizePartner(data.partner);
      
      setUser(normalizedUser);
      setPartner(normalizedPartner);
      setIsLoading(false);
      
      return { user: normalizedUser!, partner: normalizedPartner };
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
      await apiRequest('POST', '/api/auth/logout');
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
    setAuthToken(null);
    setUser(null);
    setPartner(null);
    setIsLoading(false);
  }, []);

  const refetch = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setPartner(null);
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('🔄 Refetching auth state...');
      const response = await apiRequest('GET', '/api/auth/me');
      
      console.log('📡 Auth check response:', { status: response.status, ok: response.ok });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Auth state loaded:', { 
          userId: data.user?.id, 
          role: data.user?.role,
          hasPartner: !!data.partner
        });
        setUser(normalizeUser(data.user));
        setPartner(normalizePartner(data.partner));
      } else {
        console.log('⚠️ Not authenticated');
        setAuthToken(null);
        setUser(null);
        setPartner(null);
      }
    } catch (error) {
      console.error('❌ Refetch error:', error);
      setAuthToken(null);
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
