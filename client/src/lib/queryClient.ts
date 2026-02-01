// Real Backend Query Client for SellerCloudX
// All API requests go to Python backend (port 8001)
import { QueryClient } from "@tanstack/react-query";

// Python backend URL (same host, different port via nginx/ingress)
const API_BASE = import.meta.env.VITE_API_URL || '';

// Token storage
let authToken: string | null = localStorage.getItem('auth_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken(): string | null {
  return authToken || localStorage.getItem('auth_token');
}

// Real API request function
export async function apiRequest(
  method: string,
  url: string,
  data?: any,
  options?: RequestInit
): Promise<Response> {
  const token = getAuthToken();
  
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    // Don't include credentials for cross-origin, use token instead
    ...options,
  };

  if (data && method !== 'GET') {
    fetchOptions.body = JSON.stringify(data);
  }

  // Always use relative URL for API calls (works with both localhost and production)
  const response = await fetch(url, fetchOptions);
  
  // Handle 401 - clear token and redirect to login
  if (response.status === 401) {
    setAuthToken(null);
  }
  
  return response;
}

// Typed API helper for JSON responses
export async function apiJson<T>(
  method: string,
  url: string,
  data?: any
): Promise<T> {
  const response = await apiRequest(method, url, data);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API Error' }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }
  
  return response.json();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        if (typeof queryKey[0] === 'string') {
          const url = queryKey[0] as string;
          const response = await apiRequest('GET', url);
          
          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
          }
          
          return response.json();
        }
        return null;
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      retry: false,
    },
  },
});
