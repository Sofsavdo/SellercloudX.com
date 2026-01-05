// Frontend-only Query Client for Lovable
// Backend mavjud emas, barcha so'rovlar demo data qaytaradi
import { QueryClient } from "@tanstack/react-query";
import * as DemoData from './demoData';

// Mock API response generator
function getMockData(url: string): any {
  // Auth endpoints
  if (url.includes('/api/auth/me')) {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const savedPartner = localStorage.getItem('auth_partner');
      return { 
        user, 
        partner: savedPartner ? JSON.parse(savedPartner) : null 
      };
    }
    return null;
  }
  
  // Partner endpoints
  if (url.includes('/api/partners/me')) {
    const savedPartner = localStorage.getItem('auth_partner');
    return savedPartner ? JSON.parse(savedPartner) : DemoData.DEMO_PARTNER;
  }
  if (url.includes('/api/partners')) {
    return DemoData.DEMO_PARTNERS_LIST;
  }
  
  // Products
  if (url.includes('/api/products')) {
    return DemoData.DEMO_PRODUCTS;
  }
  
  // Orders
  if (url.includes('/api/orders')) {
    return DemoData.DEMO_ORDERS;
  }
  
  // Analytics
  if (url.includes('/api/analytics')) {
    return DemoData.DEMO_ANALYTICS;
  }
  
  // Stats
  if (url.includes('/api/stats') || url.includes('/api/dashboard/stats')) {
    return DemoData.DEMO_STATS;
  }
  
  // AI Stats
  if (url.includes('/api/ai')) {
    return DemoData.DEMO_AI_STATS;
  }
  
  // Wallet
  if (url.includes('/api/wallet')) {
    return DemoData.DEMO_WALLET;
  }
  
  // Notifications
  if (url.includes('/api/notifications')) {
    return DemoData.DEMO_NOTIFICATIONS;
  }
  
  // Admin endpoints
  if (url.includes('/api/admin/stats') || url.includes('/api/admin/dashboard')) {
    return DemoData.DEMO_ADMIN_STATS;
  }
  if (url.includes('/api/admin/tier-requests')) {
    return DemoData.DEMO_TIER_REQUESTS;
  }
  
  // Payments
  if (url.includes('/api/payments/create-payment')) {
    return { 
      success: true, 
      url: 'https://my.click.uz/demo-payment',
      transactionId: 'TXN_' + Date.now()
    };
  }
  if (url.includes('/api/payments/history')) {
    return { success: true, data: [] };
  }
  
  // Legal entities
  if (url.includes('/api/legal-entities')) {
    return null;
  }
  
  // Default
  return null;
}

// Simple API request function for demo mode
export async function apiRequest(
  method: string,
  url: string,
  data?: any,
  options?: RequestInit
): Promise<Response> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const mockData = getMockData(url);
  
  if (mockData !== null) {
    return new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Return empty success for mutations
  if (method !== 'GET') {
    return new Response(JSON.stringify({ success: true, ...data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Return empty array for unknown GET requests
  return new Response(JSON.stringify([]), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        if (typeof queryKey[0] === 'string') {
          const url = queryKey[0] as string;
          const response = await apiRequest('GET', url);
          return response.json();
        }
        return null;
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: false,
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      retry: false,
    },
  },
});
