// SellerCloudX Mobile App - Entry Point
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import * as ExpoSplashScreen from 'expo-splash-screen';

// i18n
import './src/i18n';

// Custom Splash Screen
import SplashScreen from './src/screens/SplashScreen';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Store
import { useAuthStore } from './src/store/authStore';

// Keep expo splash screen visible initially
ExpoSplashScreen.preventAutoHideAsync();

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
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Hide expo splash immediately to show our custom one
    ExpoSplashScreen.hideAsync();
    
    // Check authentication in background
    checkAuth().finally(() => {
      setIsReady(true);
    });
  }, []);
  
  // Show custom splash until animation completes AND auth is ready
  if (showCustomSplash) {
    return (
      <SplashScreen 
        onFinish={() => {
          if (isReady) {
            setShowCustomSplash(false);
          } else {
            // Wait for auth to be ready
            const checkReady = setInterval(() => {
              if (isReady) {
                clearInterval(checkReady);
                setShowCustomSplash(false);
              }
            }, 100);
          }
        }} 
      />
    );
  }
  
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
