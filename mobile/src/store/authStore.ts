// Auth Store - Zustand bilan global state management (HAQIQIY API)
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { authApi, partnerApi, LoginRequest, RegisterRequest } from '../services/api';

interface User {
  id: string;
  username: string;
  email?: string;
  role: string;
  phone?: string;
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
  approved?: boolean;
  isActive?: boolean;
  // Marketplace connections
  yandexApiKey?: string;
  yandexConnected?: boolean;
  uzumApiKey?: string;
  uzumConnected?: boolean;
  // Additional info
  phone?: string;
  inn?: string;
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
  setPartner: (partner: Partner) => void;
  refreshPartner: () => Promise<void>;
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
      
      // User ma'lumotlarini saqlash
      if (response.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      }
      
      if (response.partner) {
        await AsyncStorage.setItem(STORAGE_KEYS.PARTNER_DATA, JSON.stringify(response.partner));
      }
      
      set({
        user: response.user,
        partner: response.partner || null,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return true;
    } catch (error: any) {
      console.error('Login xatolik:', error);
      const message = error.response?.data?.message || 
                     error.response?.data?.error ||
                     'Login yoki parol noto\'g\'ri';
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
        // Ro'yxatdan o'tgandan keyin avtomatik login
        if (response.user) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
          
          set({
            user: response.user,
            partner: response.partner || null,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
        }
        return true;
      } else {
        set({ 
          error: response.message || 'Ro\'yxatdan o\'tishda xatolik', 
          isLoading: false 
        });
        return false;
      }
    } catch (error: any) {
      console.error('Register xatolik:', error);
      const message = error.response?.data?.message || 
                     error.response?.data?.error ||
                     'Ro\'yxatdan o\'tishda xatolik';
      set({ error: message, isLoading: false });
      return false;
    }
  },
  
  // Logout
  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout errors
      console.log('Logout error (ignorlandi):', error);
    }
    
    // Local storage'ni tozalash
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    await AsyncStorage.removeItem(STORAGE_KEYS.PARTNER_DATA);
    
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
      // Server'dan auth holatini tekshirish
      const response = await authApi.getMe();
      
      if (response.user) {
        // Cache qilish
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
        if (response.partner) {
          await AsyncStorage.setItem(STORAGE_KEYS.PARTNER_DATA, JSON.stringify(response.partner));
        }
        
        set({
          user: response.user,
          partner: response.partner || null,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // Session yo'q - local cache'ni tekshirish
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        const partnerData = await AsyncStorage.getItem(STORAGE_KEYS.PARTNER_DATA);
        
        if (userData) {
          set({
            user: JSON.parse(userData),
            partner: partnerData ? JSON.parse(partnerData) : null,
            isAuthenticated: false, // Session tugagan
            isLoading: false,
          });
        } else {
          set({
            user: null,
            partner: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    } catch (error) {
      console.log('Auth check xatolik (session tugagan):', error);
      
      // Session tugagan - local cache'ni o'qish
      try {
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (userData) {
          set({
            user: JSON.parse(userData),
            partner: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }
      } catch (e) {
        // Ignore
      }
      
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
  
  // Set partner directly
  setPartner: (partner: Partner) => {
    set({ partner });
    AsyncStorage.setItem(STORAGE_KEYS.PARTNER_DATA, JSON.stringify(partner));
  },
  
  // Update partner data locally
  updatePartner: (data: Partial<Partner>) => {
    const current = get().partner;
    if (current) {
      const updated = { ...current, ...data };
      set({ partner: updated });
      AsyncStorage.setItem(STORAGE_KEYS.PARTNER_DATA, JSON.stringify(updated));
    }
  },
  
  // Refresh partner data from server
  refreshPartner: async () => {
    try {
      const response = await partnerApi.getMe();
      if (response.partner || response) {
        const partnerData = response.partner || response;
        set({ partner: partnerData });
        await AsyncStorage.setItem(STORAGE_KEYS.PARTNER_DATA, JSON.stringify(partnerData));
      }
    } catch (error) {
      console.error('Partner refresh xatolik:', error);
    }
  },
}));
