// Navigation - App Navigator
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, SCREENS } from '../utils/constants';
import { useAuthStore } from '../store/authStore';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ScannerScreen from '../screens/ScannerScreen';
import ProductsScreen from '../screens/ProductsScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import UploadProductScreen from '../screens/UploadProductScreen';
import PricingScreen from '../screens/PricingScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
function MainTabs() {
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name={SCREENS.HOME}
        component={HomeScreen}
        options={{
          tabBarLabel: t('home.title'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name={SCREENS.SCANNER}
        component={ScannerScreen}
        options={{
          tabBarLabel: t('scanner.title'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name="scan"
              size={focused ? 28 : 24}
              color={focused ? COLORS.primary : color}
            />
          ),
          tabBarIconStyle: {
            marginTop: -4,
          },
        }}
      />
      
      <Tab.Screen
        name={SCREENS.PRODUCTS}
        component={ProductsScreen}
        options={{
          tabBarLabel: t('product.products'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name={SCREENS.STATS}
        component={StatsScreen}
        options={{
          tabBarLabel: t('stats.title'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name={SCREENS.SETTINGS}
        component={SettingsScreen}
        options={{
          tabBarLabel: t('settings.title'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name={SCREENS.LOGIN} component={LoginScreen} />
      <Stack.Screen name={SCREENS.REGISTER} component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Main Stack (after login)
function MainStack() {
  const { t } = useTranslation();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen
        name={SCREENS.UPLOAD_PRODUCT}
        component={UploadProductScreen}
        options={{
          title: 'Mahsulot yuklash',
          headerBackTitle: 'Orqaga',
        }}
      />
      
      <Stack.Screen
        name={SCREENS.PRICING}
        component={PricingScreen}
        options={{
          title: 'Tariflar',
          headerBackTitle: 'Orqaga',
        }}
      />
      
      <Stack.Screen
        name={SCREENS.PROFILE}
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

// Root Navigator
export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  // Show loading while checking auth
  if (isLoading) {
    return null; // Or a splash screen
  }
  
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
