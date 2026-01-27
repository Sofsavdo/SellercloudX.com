// Stats Screen - Statistika (HAQIQIY API)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../utils/constants';
import { formatPrice, formatShortPrice } from '../utils/helpers';
import { useProductsStore } from '../store/productsStore';
import { analyticsApi, AnalyticsData } from '../services/api';

type Period = 'today' | 'week' | 'month' | 'all';

export default function StatsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { products, fetchProducts } = useProductsStore();
  
  const [period, setPeriod] = useState<Period>('month');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Load analytics
  useEffect(() => {
    loadAnalytics();
  }, [period]);
  
  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await analyticsApi.getDashboard(period);
      setAnalytics(data);
    } catch (error) {
      console.error('Analytics yuklashda xato:', error);
      // Set default values on error
      setAnalytics({
        revenue: 0,
        profit: 0,
        orders: 0,
        views: 0,
        conversionRate: 0,
        topProducts: [],
        marketplaceBreakdown: [],
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadAnalytics(), fetchProducts()]);
    setRefreshing(false);
  };
  
  const periods = [
    { id: 'today', label: 'Bugun' },
    { id: 'week', label: 'Hafta' },
    { id: 'month', label: 'Oy' },
    { id: 'all', label: 'Hammasi' },
  ];
  
  if (isLoading && !analytics) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Statistika yuklanmoqda...</Text>
      </View>
    );
  }
  
  // Fallback values
  const stats = analytics || {
    revenue: 0,
    profit: 0,
    orders: 0,
    views: 0,
    conversionRate: 0,
    topProducts: [],
    marketplaceBreakdown: [],
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Statistika</Text>
      </View>
      
      {/* Period Selector - Fixed position */}
      <View style={styles.periodWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.periodContainer}
        >
          {periods.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.periodButton,
                period === p.id && styles.periodButtonActive,
              ]}
              onPress={() => setPeriod(p.id as Period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  period === p.id && styles.periodButtonTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      
      {/* Main Stats */}
      <View style={styles.mainStats}>
        {/* Revenue */}
        <View style={[styles.mainStatCard, styles.revenueCard]}>
          <View style={styles.mainStatHeader}>
            <Ionicons name="cash-outline" size={24} color={COLORS.white} />
            <Text style={styles.mainStatLabel}>{t('stats.revenue')}</Text>
          </View>
          <Text style={styles.mainStatValue}>{formatPrice(stats.revenue)}</Text>
          {stats.revenue > 0 && (
            <View style={styles.mainStatChange}>
              <Ionicons name="trending-up" size={16} color={COLORS.white} />
              <Text style={styles.mainStatChangeText}>Faol</Text>
            </View>
          )}
        </View>
        
        {/* Profit */}
        <View style={[styles.mainStatCard, styles.profitCard]}>
          <View style={styles.mainStatHeader}>
            <Ionicons name="wallet-outline" size={24} color={COLORS.white} />
            <Text style={styles.mainStatLabel}>{t('stats.profit')}</Text>
          </View>
          <Text style={styles.mainStatValue}>{formatPrice(stats.profit)}</Text>
          {stats.profit > 0 && (
            <View style={styles.mainStatChange}>
              <Ionicons name="trending-up" size={16} color={COLORS.white} />
              <Text style={styles.mainStatChangeText}>
                {stats.revenue > 0 ? `${Math.round((stats.profit / stats.revenue) * 100)}%` : '0%'}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Secondary Stats */}
      <View style={styles.secondaryStats}>
        <View style={styles.secondaryStatCard}>
          <Ionicons name="cart-outline" size={24} color={COLORS.primary} />
          <Text style={styles.secondaryStatValue}>{stats.orders}</Text>
          <Text style={styles.secondaryStatLabel}>{t('stats.orders')}</Text>
        </View>
        
        <View style={styles.secondaryStatCard}>
          <Ionicons name="eye-outline" size={24} color={COLORS.accent} />
          <Text style={styles.secondaryStatValue}>{stats.views}</Text>
          <Text style={styles.secondaryStatLabel}>{t('stats.views')}</Text>
        </View>
        
        <View style={styles.secondaryStatCard}>
          <Ionicons name="cube-outline" size={24} color={COLORS.secondary} />
          <Text style={styles.secondaryStatValue}>{products.length}</Text>
          <Text style={styles.secondaryStatLabel}>Mahsulotlar</Text>
        </View>
      </View>
      
      {/* Marketplace Breakdown */}
      {stats.marketplaceBreakdown && stats.marketplaceBreakdown.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('stats.byMarketplace')}</Text>
          
          {stats.marketplaceBreakdown.map((mp) => (
            <View key={mp.marketplace} style={styles.marketplaceCard}>
              <View style={[
                styles.marketplaceIcon,
                { backgroundColor: mp.marketplace === 'yandex' ? '#FFCC00' : '#7C3AED' }
              ]}>
                <Text style={styles.marketplaceIconText}>
                  {mp.marketplace === 'yandex' ? '🛒' : '🛍️'}
                </Text>
              </View>
              
              <View style={styles.marketplaceInfo}>
                <Text style={styles.marketplaceName}>
                  {mp.marketplace === 'yandex' ? 'Yandex Market' : 'Uzum Market'}
                </Text>
                <Text style={styles.marketplaceOrders}>{mp.orders} buyurtma</Text>
              </View>
              
              <View style={styles.marketplaceRevenue}>
                <Text style={styles.marketplaceRevenueValue}>
                  {formatShortPrice(mp.revenue)}
                </Text>
                <Text style={styles.marketplaceRevenueLabel}>UZS</Text>
              </View>
            </View>
          ))}
        </View>
      )}
      
      {/* Top Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('stats.topProducts')}</Text>
        
        {stats.topProducts && stats.topProducts.length > 0 ? (
          stats.topProducts.map((product, index) => (
            <View key={product.id} style={styles.topProductCard}>
              <View style={styles.topProductRank}>
                <Text style={styles.topProductRankText}>#{index + 1}</Text>
              </View>
              
              <View style={styles.topProductInfo}>
                <Text style={styles.topProductName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.topProductSales}>
                  {product.sales} ta sotildi
                </Text>
              </View>
              
              <Text style={styles.topProductRevenue}>
                {formatShortPrice(product.revenue)} UZS
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyStateText}>Hali sotuvlar yo'q</Text>
            <Text style={styles.emptyStateSubtext}>
              Mahsulotlarni marketplace'ga yuklang
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  
  // Period
  periodWrapper: {
    backgroundColor: COLORS.white,
    paddingBottom: 8,
  },
  periodContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  periodButtonTextActive: {
    color: COLORS.white,
  },
  
  // Main Stats
  mainStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  mainStatCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  revenueCard: {
    backgroundColor: COLORS.primary,
  },
  profitCard: {
    backgroundColor: COLORS.secondary,
  },
  mainStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mainStatLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
  },
  mainStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  mainStatChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainStatChangeText: {
    fontSize: 12,
    color: COLORS.white,
    marginLeft: 4,
  },
  
  // Secondary Stats
  secondaryStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  secondaryStatCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  secondaryStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 6,
  },
  secondaryStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  
  // Section
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  
  // Marketplace
  marketplaceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  marketplaceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marketplaceIconText: {
    fontSize: 20,
  },
  marketplaceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  marketplaceName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  marketplaceOrders: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  marketplaceRevenue: {
    alignItems: 'flex-end',
  },
  marketplaceRevenueValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  marketplaceRevenueLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  
  // Top Products
  topProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  topProductRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topProductRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  topProductInfo: {
    flex: 1,
    marginLeft: 12,
  },
  topProductName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  topProductSales: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  topProductRevenue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  
  // Empty
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  
  footer: {
    height: 20,
  },
});
