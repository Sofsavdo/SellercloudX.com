import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { DEMO_PRODUCTS, DEMO_ANALYTICS, DEMO_STATS, DEMO_USER, DEMO_PARTNER, getDemoMode, setDemoMode } from './demoData';

// Demo mode için mock responses
function getMockResponse(url: string, method: string): any {
  if (getDemoMode()) {
    if (url.includes('/api/auth/me')) {
      return { user: DEMO_USER, partner: DEMO_PARTNER };
    }
    if (url.includes('/api/products')) {
      return DEMO_PRODUCTS;
    }
    if (url.includes('/api/analytics')) {
      return DEMO_ANALYTICS;
    }
    if (url.includes('/api/stats')) {
      return DEMO_STATS;
    }
    if (url.includes('/api/auth/login')) {
      return { user: DEMO_USER, partner: DEMO_PARTNER };
    }
  }
  return null;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: any,
  options?: RequestInit
): Promise<Response> {
  // Check for demo mode first
  const mockData = getMockResponse(url, method);
  if (mockData) {
    return new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Development uchun local server, production uchun remote server
  let baseUrl = import.meta.env.VITE_API_URL || '';
  
  // Agar Replit development muhitida bo'lsak, local server ishlatamiz
  if (window.location.hostname.includes('replit.dev') || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      import.meta.env.DEV) {
    baseUrl = `${window.location.protocol}//${window.location.host}`;
  } else if (!baseUrl) {
    // Production uchun fallback - same origin
    baseUrl = `${window.location.protocol}//${window.location.host}`;
  }
  
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...options?.headers,
  };

  if (!isFormData) {
    (headers as any)['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include', // Important for session cookies
    mode: 'cors',
    ...options,
  };

  if (data && method !== 'GET') {
    config.body = isFormData ? data : JSON.stringify(data);
  }

  try {
    const response = await fetch(fullUrl, config);
    
    if (!response.ok) {
      // If we get a network error, enable demo mode for landing page
      if (response.status >= 500 || response.status === 0) {
        console.log('Backend unavailable, continuing with frontend-only mode');
        // Don't throw for landing page access
        if (url.includes('/api/auth/me')) {
          return new Response(JSON.stringify(null), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    // Network error - allow frontend to work without backend
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.log('Network error - frontend-only mode');
      if (url.includes('/api/auth/me')) {
        return new Response(JSON.stringify(null), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network connection failed');
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        // If queryKey is a string URL, use it directly
        if (typeof queryKey[0] === 'string' && queryKey[0].startsWith('/api')) {
          const url = queryKey[0] as string;
          const response = await apiRequest('GET', url);
          return response.json();
        }
        // Fallback to default behavior (cast to any to satisfy TS)
        const fallback = getQueryFn({ on401: "returnNull" }) as any;
        return fallback({ queryKey });
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.message?.includes('401') || error?.message?.includes('Avtorizatsiya')) {
          return false;
        }
        return failureCount < 2; // Retry up to 2 times for other errors
      },
      gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    },
    mutations: {
      retry: false,
    },
  },
});
