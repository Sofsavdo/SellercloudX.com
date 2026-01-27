// Home Screen - Dashboard (HAQIQIY API)
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SCREENS, TIERS } from '../utils/constants';
import { formatPrice, formatShortPrice } from '../utils/helpers';
import { useAuthStore } from '../store/authStore';
import { useProductsStore } from '../store/productsStore';
import { offlineQueue, QueueItem } from '../services/offlineQueue';
import { partnerApi } from '../services/api';

// Marketplace ulanish holati
interface MarketplaceConnectionStatus {
  yandex: boolean;
  uzum: boolean;
  loading: boolean;
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user, partner, refreshPartner } = useAuthStore();
  const { products, fetchProducts, isLoading } = useProductsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [queueStats, setQueueStats] = useState({ pending: 0, total: 0 });
  const [marketplaceStatus, setMarketplaceStatus] = useState<MarketplaceConnectionStatus>({
    yandex: false,
    uzum: false,
    loading: true,
  });
  
  // Load data on mount
  useEffect(() => {
    fetchProducts();
    loadQueueStats();
    checkMarketplaceConnections();
  }, []);
  
  // Refresh partner data when screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshPartner();
      loadQueueStats();
      checkMarketplaceConnections();
    }, [])
  );
  
  // Marketplace ulanishlarini tekshirish
  const checkMarketplaceConnections = async () => {
    try {
      const response = await partnerApi.getMarketplaceStatus();
      if (response.success) {
        setMarketplaceStatus({
          yandex: response.yandex?.connected || false,
          uzum: response.uzum?.connected || false,
          loading: false,
        });
      } else {
        setMarketplaceStatus({
          yandex: false,
          uzum: false,
          loading: false,
        });
      }
    } catch (error) {
      console.log('Marketplace status check error:', error);
      setMarketplaceStatus({
        yandex: false,
        uzum: false,
        loading: false,
      });
    }
  };
  
  const loadQueueStats = async () => {
    const stats = await offlineQueue.getStats();
    setQueueStats(stats);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchProducts(),
      refreshPartner(),
      loadQueueStats(),
      checkMarketplaceConnections(),
    ]);
    setRefreshing(false);
  };
  
  // Stats - haqiqiy ma'lumotlar asosida
  const activeProducts = products.filter(p => p.status === 'active').length;
  const tierLimits = TIERS[partner?.pricingTier as keyof typeof TIERS] || TIERS.free_starter;
  const aiCardsLimit = tierLimits.aiCards;
  const aiCardsUsed = partner?.aiCardsThisMonth || partner?.aiCardsUsed || 0;
  const aiCardsLeft = aiCardsLimit === -1 ? '♾️' : Math.max(0, aiCardsLimit - aiCardsUsed);
  
  // Birorta marketplace ulangan mi?
  const hasAnyMarketplace = marketplaceStatus.yandex || marketplaceStatus.uzum;
  
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('home.welcome')},</Text>
          <Text style={styles.username}>{user?.username || partner?.businessName}</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate(SCREENS.SETTINGS)}
        >
          <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          {queueStats.pending > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{queueStats.pending}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Quick Scan Button */}
      <TouchableOpacity
        style={styles.quickScanButton}
        onPress={() => navigation.navigate(SCREENS.SCANNER)}
      >
        <View style={styles.quickScanContent}>
          <View style={styles.quickScanIcon}>
            <Ionicons name="camera" size={32} color={COLORS.white} />
          </View>
          <View style={styles.quickScanText}>
            <Text style={styles.quickScanTitle}>{t('home.quickScan')}</Text>
            <Text style={styles.quickScanSubtitle}>
              Mahsulotni kameraga tutib, bir bosishda marketplace ga qo'shing
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
      </TouchableOpacity>
      
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="cube-outline" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>{products.length}</Text>
          <Text style={styles.statLabel}>{t('home.totalProducts')}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.secondary} />
          <Text style={styles.statValue}>{activeProducts}</Text>
          <Text style={styles.statLabel}>{t('home.activeProducts')}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="cloud-upload-outline" size={24} color={COLORS.accent} />
          <Text style={styles.statValue}>{queueStats.pending}</Text>
          <Text style={styles.statLabel}>{t('home.pendingUploads')}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="sparkles-outline" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>{aiCardsLeft}</Text>
          <Text style={styles.statLabel}>{t('home.aiCardsLeft')}</Text>
        </View>
      </View>
      
      {/* Tier Info */}
      {partner && (
        <View style={styles.tierCard}>
          <View style={styles.tierHeader}>
            <Text style={styles.tierLabel}>{t('settings.currentTier')}</Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => navigation.navigate(SCREENS.PRICING)}
            >
              <Text style={styles.upgradeButtonText}>{t('settings.upgradeTier')}</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.tierName}>
            {partner.pricingTier === 'free_starter' && '🆓 Free Starter'}
            {partner.pricingTier === 'starter_pro' && '⭐ Starter Pro'}
            {partner.pricingTier === 'professional_plus' && '💎 Professional Plus'}
            {partner.pricingTier === 'enterprise_elite' && '🏆 Enterprise Elite'}
          </Text>
        </View>
      )}
      
      {/* Recent Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.recentProducts')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate(SCREENS.PRODUCTS)}>
            <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
          </TouchableOpacity>
        </View>
        
        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyStateText}>{t('product.noProducts')}</Text>
            <Text style={styles.emptyStateSubtext}>{t('product.startScanning')}</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {products.slice(0, 5).map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => navigation.navigate(SCREENS.PRODUCT_DETAIL, { product })}
              >
                {product.images?.[0] ? (
                  <Image source={{ uri: product.images[0] }} style={styles.productImage} />
                ) : (
                  <View style={[styles.productImage, styles.productImagePlaceholder]}>
                    <Ionicons name="image-outline" size={24} color={COLORS.textLight} />
                  </View>
                )}
                <Text style={styles.productName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.productPrice}>
                  {formatShortPrice(product.price)} UZS
                </Text>
                <View style={styles.productStatus}>
                  <View
                    style={[
                      styles.statusDot,
                      product.status === 'active' && styles.statusActive,
                      product.status === 'pending' && styles.statusPending,
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {product.status === 'active' && 'Faol'}
                    {product.status === 'pending' && 'Kutilmoqda'}
                    {product.status === 'draft' && 'Qoralama'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  
  // Quick Scan
  quickScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
  },
  quickScanContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickScanIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickScanText: {
    flex: 1,
  },
  quickScanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  quickScanSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  
  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  statCardInner: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  
  // Tier
  tierCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tierName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    marginRight: 4,
  },
  
  // Section
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  
  // Product card
  productCard: {
    width: 150,
    marginRight: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    paddingHorizontal: 10,
    paddingTop: 4,
  },
  productStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textLight,
    marginRight: 6,
  },
  statusActive: {
    backgroundColor: COLORS.secondary,
  },
  statusPending: {
    backgroundColor: COLORS.accent,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
