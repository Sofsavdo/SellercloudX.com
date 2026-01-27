// SellerCloudX Mobile - Asosiy Konstantalar
// Production API - Preview or Railway
export const API_BASE_URL = 'https://ezmktplace.preview.emergentagent.com/api';

// Ranglar - Zamonaviy Professional Palette
export const COLORS = {
  primary: '#2563EB',      // Royal Blue - professional
  primaryDark: '#1D4ED8',
  secondary: '#059669',    // Emerald - success
  accent: '#F59E0B',       // Amber - warnings
  danger: '#DC2626',       // Red
  error: '#DC2626',        // Red (alias)
  
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  
  text: '#0F172A',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  
  border: '#E2E8F0',
  borderDark: '#CBD5E1',
  
  white: '#FFFFFF',
  black: '#000000',
  
  // Marketplace colors
  yandex: '#FFCC00',
  uzum: '#7C3AED',
  wildberries: '#CB11AB',
  ozon: '#005BFF',
};

// 2026 MODEL - Yangi tarif tizimi (Revenue Share)
export const PRICING_2026 = {
  premium: {
    id: 'premium_2026',
    name: 'Premium',
    setupFee: 699,      // USD
    monthlyFee: 499,    // USD
    revenueShare: 4,    // %
    aiCards: -1,        // Cheksiz
    products: -1,       // Cheksiz
  }
};

// Eski tariflar (legacy - faqat mavjud foydalanuvchilar uchun)
export const TIERS = {
  free_starter: {
    name: "Sinov",
    monthlyPrice: 0,
    aiCards: 5,
    products: 10,
    legacy: true,
  },
  starter_pro: {
    name: "Starter",
    monthlyPrice: 828000,
    aiCards: 50,
    products: 200,
    legacy: true,
  },
  professional_plus: {
    name: "Professional",
    monthlyPrice: 4188000,
    aiCards: 500,
    products: 2000,
    legacy: true,
  },
  enterprise_elite: {
    name: "Enterprise",
    monthlyPrice: 10788000,
    aiCards: -1,
    products: -1,
    legacy: true,
  },
  premium_2026: {
    name: "Premium 2026",
    monthlyPrice: 499,
    aiCards: -1,
    products: -1,
    legacy: false,
  },
};

// 4 ta Marketplace - Hozir va kelajak
export const MARKETPLACES = [
  { id: 'yandex', name: 'Yandex Market', icon: '🟡', color: '#FFCC00', active: true },
  { id: 'uzum', name: 'Uzum Market', icon: '🟣', color: '#7C3AED', active: false, coming: true },
  { id: 'wildberries', name: 'Wildberries', icon: '🟣', color: '#CB11AB', active: false, coming: true },
  { id: 'ozon', name: 'Ozon', icon: '🔵', color: '#005BFF', active: false, coming: true },
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
  DARK_MODE: 'dark_mode',
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
