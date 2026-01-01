// Demo data for frontend-only mode (when backend is unavailable)

export const DEMO_USER = {
  id: 'demo-user-1',
  username: 'demo',
  email: 'demo@sellercloudx.com',
  firstName: 'Demo',
  lastName: 'User',
  role: 'partner' as const,
  isActive: true,
};

export const DEMO_ADMIN = {
  id: 'admin-1',
  username: 'admin',
  email: 'admin@sellercloudx.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin' as const,
  isActive: true,
};

export const DEMO_PARTNER = {
  id: 'demo-partner-1',
  userId: 'demo-user-1',
  businessName: 'Demo Business',
  businessCategory: 'Elektronika',
  pricingTier: 'professional',
  isApproved: true,
  monthlyRevenue: '50000000',
  commissionRate: '5',
};

export const DEMO_PRODUCTS = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    category: 'Elektronika',
    description: 'Eng so\'nggi Apple smartfoni',
    price: '18500000',
    costPrice: '16000000',
    sku: 'IP15PM-001',
    barcode: '123456789',
    weight: '221',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Elektronika',
    description: 'Premium Android smartfon',
    price: '16500000',
    costPrice: '14000000',
    sku: 'SGS24U-001',
    barcode: '987654321',
    weight: '233',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'MacBook Air M3',
    category: 'Kompyuter',
    description: 'Yengil va kuchli noutbuk',
    price: '22000000',
    costPrice: '19000000',
    sku: 'MBA-M3-001',
    barcode: '456789123',
    weight: '1240',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const DEMO_ANALYTICS = [
  {
    id: '1',
    date: new Date().toISOString(),
    revenue: '125000000',
    orders: 47,
    profit: '25000000',
    commissionPaid: '6250000',
    marketplace: 'Uzum',
    category: 'Elektronika',
  },
  {
    id: '2',
    date: new Date(Date.now() - 86400000).toISOString(),
    revenue: '98000000',
    orders: 35,
    profit: '19600000',
    commissionPaid: '4900000',
    marketplace: 'Wildberries',
    category: 'Elektronika',
  },
];

export const DEMO_STATS = {
  totalRevenue: '223000000',
  totalOrders: 82,
  totalProfit: '44600000',
  totalProducts: 3,
  activeProducts: 3,
  pendingOrders: 5,
  completedOrders: 77,
  averageOrderValue: '2720000',
};

// Check if we're in demo mode (no backend available)
export function isDemoMode(): boolean {
  // Always return false initially, let the app try to connect to API first
  return false;
}

export function setDemoMode(enabled: boolean): void {
  if (typeof window !== 'undefined') {
    if (enabled) {
      localStorage.setItem('demoMode', 'true');
    } else {
      localStorage.removeItem('demoMode');
    }
  }
}

export function getDemoMode(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('demoMode') === 'true';
  }
  return false;
}
