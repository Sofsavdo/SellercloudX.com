// SellerCloudX Mobile App - Entry Point
import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
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

// Keep expo splash visible while we load
ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

// Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function AppContent() {
  const { checkAuth } = useAuthStore();
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    prepareApp();
  }, []);
  
  const prepareApp = async () => {
    try {
      // Check authentication
      await checkAuth();
    } catch (error) {
      console.log('Auth check error:', error);
    } finally {
      // App is ready, hide expo splash
      await ExpoSplashScreen.hideAsync().catch(() => {});
      setIsReady(true);
    }
  };
  
  const handleSplashFinish = useCallback(() => {
    setShowCustomSplash(false);
  }, []);
  
  // Wait until app is ready
  if (!isReady) {
    return null;
  }
  
  // Show custom splash screen with animation
  if (showCustomSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }
  
  // Main app
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
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
