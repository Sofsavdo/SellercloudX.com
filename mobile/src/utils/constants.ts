// SellerCloudX Mobile - Asosiy Konstantalar
export const API_BASE_URL = 'https://sellercloudx.com/api';

// Ranglar
export const COLORS = {
  primary: '#4F46E5',      // Indigo
  primaryDark: '#4338CA',
  secondary: '#10B981',    // Emerald (success)
  accent: '#F59E0B',       // Amber
  danger: '#EF4444',       // Red
  
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F4F6',
  
  text: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  
  border: '#E5E7EB',
  borderDark: '#D1D5DB',
  
  white: '#FFFFFF',
  black: '#000000',
};

// Tariflar
export const TIERS = {
  free_starter: {
    name: "Free Starter",
    monthlyPrice: 0,
    aiCards: 10,
    products: 50,
  },
  starter_pro: {
    name: "Starter Pro",
    monthlyPrice: 828000,
    aiCards: 100,
    products: 500,
  },
  professional_plus: {
    name: "Professional Plus",
    monthlyPrice: 4188000,
    aiCards: 1000,
    products: 5000,
  },
  enterprise_elite: {
    name: "Enterprise Elite",
    monthlyPrice: 10788000,
    aiCards: -1, // Unlimited
    products: -1,
  },
};

// Marketplacelar
export const MARKETPLACES = [
  { id: 'yandex', name: 'Yandex Market', icon: '🛒', color: '#FFCC00' },
  { id: 'uzum', name: 'Uzum Market', icon: '🛍️', color: '#7C3AED' },
];

// Offline Queue statuslari
export const QUEUE_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// Storage kalitlari
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  PARTNER_DATA: 'partner_data',
  OFFLINE_QUEUE: 'offline_queue',
  LANGUAGE: 'language',
};

// Ekran nomlari
export const SCREENS = {
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',
  
  // Main
  HOME: 'Home',
  SCANNER: 'Scanner',
  PRODUCTS: 'Products',
  STATS: 'Stats',
  SETTINGS: 'Settings',
  
  // Nested
  PRODUCT_DETAIL: 'ProductDetail',
  SCAN_RESULT: 'ScanResult',
  UPLOAD_PRODUCT: 'UploadProduct',
  PRICING: 'Pricing',
  PROFILE: 'Profile',
};
