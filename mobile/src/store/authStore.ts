// Auth Store - Zustand bilan global state management
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../utils/constants';
import { authApi, LoginRequest, RegisterRequest } from '../services/api';

interface User {
  id: string;
  username: string;
  email?: string;
  role: string;
}

interface Partner {
  id: string;
  businessName: string;
  pricingTier: string;
  aiEnabled: boolean;
  aiCardsUsed: number;
  aiCardsThisMonth?: number;
  productsCount?: number;
  promoCode?: string;
}

interface AuthState {
  // State
  user: User | null;
  partner: Partner | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (data: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updatePartner: (data: Partial<Partner>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  partner: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  
  // Login
  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.login(data);
      
      // Token saqlash (agar backend qaytarsa)
      // await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, response.token);
      
      set({
        user: response.user,
        partner: response.partner || null,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login xatoligi';
      set({ error: message, isLoading: false });
      return false;
    }
  },
  
  // Register
  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.register(data);
      
      if (response.success) {
        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } else {
        set({ error: response.message || 'Ro\'yxatdan o\'tishda xatolik', isLoading: false });
        return false;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Ro\'yxatdan o\'tishda xatolik';
      set({ error: message, isLoading: false });
      return false;
    }
  },
  
  // Logout
  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    }
    
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    
    set({
      user: null,
      partner: null,
      isAuthenticated: false,
      error: null,
    });
  },
  
  // Check auth status
  checkAuth: async () => {
    set({ isLoading: true });
    
    try {
      const response = await authApi.getMe();
      
      set({
        user: response.user,
        partner: response.partner || null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        partner: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
  
  // Clear error
  clearError: () => {
    set({ error: null });
  },
  
  // Update partner data
  updatePartner: (data: Partial<Partner>) => {
    const current = get().partner;
    if (current) {
      set({ partner: { ...current, ...data } });
    }
  },
}));
