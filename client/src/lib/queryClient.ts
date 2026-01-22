// Real Backend Query Client for SellerCloudX
import { QueryClient } from "@tanstack/react-query";

// Real API request function
export async function apiRequest(
  method: string,
  url: string,
  data?: any,
  options?: RequestInit
): Promise<Response> {
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
    ...options,
  };

  if (data && method !== 'GET') {
    fetchOptions.body = JSON.stringify(data);
  }

  return fetch(url, fetchOptions);
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
