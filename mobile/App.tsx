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

// Prevent auto-hiding expo splash
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
  const [appState, setAppState] = useState<'splash' | 'loading' | 'ready'>('splash');
  
  useEffect(() => {
    // Hide expo splash immediately
    ExpoSplashScreen.hideAsync().catch(() => {});
    
    // Start auth check
    initializeApp();
  }, []);
  
  const initializeApp = async () => {
    try {
      await checkAuth();
    } catch (error) {
      console.log('Auth check error:', error);
    }
  };
  
  const handleSplashFinish = useCallback(() => {
    setAppState('ready');
  }, []);
  
  // Show custom splash screen
  if (appState === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }
  
  // Show loading if needed
  if (appState === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
});
