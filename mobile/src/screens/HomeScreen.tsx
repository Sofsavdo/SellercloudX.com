// Home Screen - Dashboard (2026 MODEL)
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SCREENS, MARKETPLACES, PRICING_2026 } from '../utils/constants';
import { formatPrice, formatShortPrice } from '../utils/helpers';
import { useAuthStore } from '../store/authStore';
import { useProductsStore } from '../store/productsStore';
import { offlineQueue } from '../services/offlineQueue';
import { partnerApi } from '../services/api';

const { width } = Dimensions.get('window');

interface MarketplaceStatus {
  yandex: boolean;
  uzum: boolean;
  wildberries: boolean;
  ozon: boolean;
  loading: boolean;
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user, partner, refreshPartner } = useAuthStore();
  const { products, fetchProducts, isLoading } = useProductsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [queueStats, setQueueStats] = useState({ pending: 0, total: 0 });
  const [marketplaceStatus, setMarketplaceStatus] = useState<MarketplaceStatus>({
    yandex: false,
    uzum: false,
    wildberries: false,
    ozon: false,
    loading: true,
  });
  
  useEffect(() => {
    fetchProducts();
    loadQueueStats();
    checkMarketplaceConnections();
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      refreshPartner();
      loadQueueStats();
      checkMarketplaceConnections();
    }, [])
  );
  
  const checkMarketplaceConnections = async () => {
    try {
      const response = await partnerApi.getMarketplaceStatus();
      if (response.success) {
        setMarketplaceStatus({
          yandex: response.yandex?.connected || false,
          uzum: response.uzum?.connected || false,
          wildberries: false,
          ozon: false,
          loading: false,
        });
      } else {
        setMarketplaceStatus(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      setMarketplaceStatus(prev => ({ ...prev, loading: false }));
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
  
  const activeProducts = products.filter(p => p.status === 'active').length;
  const hasAnyMarketplace = marketplaceStatus.yandex || marketplaceStatus.uzum;
  
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Salom,</Text>
          <Text style={styles.username} numberOfLines={1}>
            {partner?.businessName || user?.username || 'Foydalanuvchi'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate(SCREENS.SETTINGS)}
        >
          <Ionicons name="settings-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      
      {/* Marketplace Status Banner */}
      {!marketplaceStatus.loading && !hasAnyMarketplace && (
        <TouchableOpacity
          style={styles.warningBanner}
          onPress={() => navigation.navigate(SCREENS.SETTINGS)}
        >
          <View style={styles.warningIconBox}>
            <Ionicons name="warning" size={20} color={COLORS.white} />
          </View>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Marketplace ulanmagan</Text>
            <Text style={styles.warningText}>API kalitlarini ulang</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
      )}
      
      {/* Connected Marketplaces */}
      {!marketplaceStatus.loading && hasAnyMarketplace && (
        <View style={styles.connectedBar}>
          {MARKETPLACES.filter(m => m.active && marketplaceStatus[m.id as keyof MarketplaceStatus]).map(mp => (
            <View key={mp.id} style={styles.connectedItem}>
              <Text style={styles.connectedIcon}>{mp.icon}</Text>
              <Text style={styles.connectedName}>{mp.name.split(' ')[0]}</Text>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.secondary} />
            </View>
          ))}
        </View>
      )}
      
      {/* Quick Scan - Main CTA */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate(SCREENS.SCANNER)}
        activeOpacity={0.85}
      >
        <View style={styles.scanIconBox}>
          <Ionicons name="scan" size={28} color={COLORS.white} />
        </View>
        <View style={styles.scanTextBox}>
          <Text style={styles.scanTitle}>AI Skaner</Text>
          <Text style={styles.scanSubtitle}>Mahsulotni skanerlang</Text>
        </View>
        <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>
      
      {/* Stats Grid - 2x2 */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: COLORS.primary + '15' }]}>
            <Ionicons name="cube" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>{products.length}</Text>
          <Text style={styles.statLabel}>Mahsulot</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: COLORS.secondary + '15' }]}>
            <Ionicons name="checkmark-done" size={20} color={COLORS.secondary} />
          </View>
          <Text style={styles.statValue}>{activeProducts}</Text>
          <Text style={styles.statLabel}>Faol</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: COLORS.accent + '15' }]}>
            <Ionicons name="time" size={20} color={COLORS.accent} />
          </View>
          <Text style={styles.statValue}>{queueStats.pending}</Text>
          <Text style={styles.statLabel}>Navbatda</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: '#8B5CF6' + '15' }]}>
            <Ionicons name="sparkles" size={20} color="#8B5CF6" />
          </View>
          <Text style={styles.statValue}>∞</Text>
          <Text style={styles.statLabel}>AI Karta</Text>
        </View>
      </View>
      
      {/* 2026 Model Info */}
      <TouchableOpacity
        style={styles.pricingCard}
        onPress={() => navigation.navigate(SCREENS.PRICING)}
      >
        <View style={styles.pricingHeader}>
          <Text style={styles.pricingBadge}>2026 MODEL</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.pricingTitle}>Premium Tarif</Text>
        <Text style={styles.pricingDesc}>
          $699 boshlang'ich + $499/oy + 4% revenue share
        </Text>
        <View style={styles.pricingFeatures}>
          <View style={styles.pricingFeature}>
            <Ionicons name="infinite" size={14} color={COLORS.secondary} />
            <Text style={styles.pricingFeatureText}>Cheksiz AI karta</Text>
          </View>
          <View style={styles.pricingFeature}>
            <Ionicons name="infinite" size={14} color={COLORS.secondary} />
            <Text style={styles.pricingFeatureText}>Cheksiz mahsulot</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      {/* 4 Marketplace Support */}
      <View style={styles.marketplacesSection}>
        <Text style={styles.sectionTitle}>Qo'llab-quvvatlanadigan Marketplacelar</Text>
        <View style={styles.marketplacesGrid}>
          {MARKETPLACES.map(mp => (
            <View 
              key={mp.id} 
              style={[
                styles.marketplaceItem,
                !mp.active && styles.marketplaceItemDisabled
              ]}
            >
              <Text style={styles.marketplaceIcon}>{mp.icon}</Text>
              <Text style={styles.marketplaceName}>{mp.name.split(' ')[0]}</Text>
              {mp.active ? (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Faol</Text>
                </View>
              ) : (
                <View style={styles.comingBadge}>
                  <Text style={styles.comingBadgeText}>Tez kunda</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
      
      {/* Recent Products */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Oxirgi mahsulotlar</Text>
          <TouchableOpacity onPress={() => navigation.navigate(SCREENS.PRODUCTS)}>
            <Text style={styles.viewAllText}>Hammasi</Text>
          </TouchableOpacity>
        </View>
        
        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={40} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Mahsulot yo'q</Text>
            <Text style={styles.emptySubtext}>AI Skaner orqali qo'shing</Text>
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
                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.productPrice}>{formatShortPrice(product.price)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
      
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingTop: 50,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
  },
  warningIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  warningText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  
  // Connected Bar
  connectedBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    gap: 16,
  },
  connectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  connectedIcon: {
    fontSize: 16,
  },
  connectedName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  
  // Scan Button
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
  },
  scanIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanTextBox: {
    flex: 1,
    marginLeft: 14,
  },
  scanTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
  scanSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: COLORS.white,
    margin: 6,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  
  // Pricing Card
  pricingCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pricingBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  pricingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  pricingDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  pricingFeatures: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  pricingFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pricingFeatureText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  
  // Marketplaces Section
  marketplacesSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  marketplacesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  marketplaceItem: {
    width: (width - 50) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  marketplaceItemDisabled: {
    opacity: 0.6,
  },
  marketplaceIcon: {
    fontSize: 18,
  },
  marketplaceName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  activeBadge: {
    backgroundColor: COLORS.secondary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  comingBadge: {
    backgroundColor: COLORS.textLight + '30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  comingBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  
  // Recent Section
  recentSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.white,
    borderRadius: 14,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  
  // Product Card
  productCard: {
    width: 130,
    marginRight: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  
  bottomPadding: {
    height: 30,
  },
});
