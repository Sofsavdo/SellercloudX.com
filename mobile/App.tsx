// SellerCloudX Mobile App - Entry Point
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';

// i18n
import './src/i18n';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Store
import { useAuthStore } from './src/store/authStore';

// Keep splash screen visible
SplashScreen.preventAutoHideAsync();

// Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function AppContent() {
  const { checkAuth, isLoading } = useAuthStore();
  
  useEffect(() => {
    // Check authentication on app start
    checkAuth().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);
  
  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
