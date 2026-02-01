// Home Screen - Professional Fintech Dashboard
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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SCREENS, MARKETPLACES, MARKETPLACE_LOGOS } from '../utils/constants';
import { formatShortPrice } from '../utils/helpers';
import { useAuthStore } from '../store/authStore';
import { useProductsStore } from '../store/productsStore';
import { offlineQueue } from '../services/offlineQueue';
import { partnerApi } from '../services/api';

const { width } = Dimensions.get('window');

interface MarketplaceStatus {
  yandex: boolean;
  uzum: boolean;
  loading: boolean;
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, partner, refreshPartner } = useAuthStore();
  const { products, fetchProducts } = useProductsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [queueStats, setQueueStats] = useState({ pending: 0, total: 0 });
  const [marketplaceStatus, setMarketplaceStatus] = useState<MarketplaceStatus>({
    yandex: false,
    uzum: false,
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
      setMarketplaceStatus({
        yandex: response.yandex?.connected || false,
        uzum: response.uzum?.connected || false,
        loading: false,
      });
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
  
  const isAccountActive = partner?.isActive !== false;
  const hasAnyMarketplace = marketplaceStatus.yandex || marketplaceStatus.uzum;
  const activeProducts = products.filter(p => p.status === 'active').length;
  
  // Inactive account screen
  if (!isAccountActive) {
    return (
      <View style={styles.inactiveContainer}>
        <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
        <View style={styles.inactiveContent}>
          <View style={styles.inactiveIcon}>
            <Ionicons name="lock-closed" size={48} color="#F59E0B" />
          </View>
          <Text style={styles.inactiveTitle}>Akkaunt faol emas</Text>
          <Text style={styles.inactiveText}>
            Ilovadan foydalanish uchun akkauntingizni faollashtiring
          </Text>
          <View style={styles.inactiveActions}>
            <TouchableOpacity style={styles.activateBtn} onPress={() => navigation.navigate(SCREENS.PRICING)}>
              <Ionicons name="card" size={20} color="#FFF" />
              <Text style={styles.activateBtnText}>Obunani faollashtirish</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactBtn} onPress={() => Alert.alert('Admin', 'Telegram: @sellercloudx')}>
              <Ionicons name="chatbubble" size={20} color="#3B82F6" />
              <Text style={styles.contactBtnText}>Admin bilan bog'lanish</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Dark Header */}
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Salom,</Text>
            <Text style={styles.username} numberOfLines={1}>
              {partner?.businessName || user?.username || 'Hamkor'}
            </Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate(SCREENS.SETTINGS)}>
            <Ionicons name="settings-outline" size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Warning if no marketplace */}
        {!hasAnyMarketplace && (
          <TouchableOpacity style={styles.warningCard} onPress={() => navigation.navigate(SCREENS.SETTINGS)}>
            <Ionicons name="warning" size={24} color="#F59E0B" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Marketplace ulanmagan</Text>
              <Text style={styles.warningText}>API kalitlarini ulang</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>
        )}
        
        {/* AI Scanner CTA */}
        <TouchableOpacity style={styles.scannerCard} onPress={() => navigation.navigate(SCREENS.SCANNER)} activeOpacity={0.9}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.scannerGradient}>
            <View style={styles.scannerIconBox}>
              <Ionicons name="scan" size={28} color="#FFF" />
            </View>
            <View style={styles.scannerText}>
              <Text style={styles.scannerTitle}>AI Skaner</Text>
              <Text style={styles.scannerSubtitle}>2 daqiqada kartochka yarating</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>
        
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#3B82F610' }]}>
              <Ionicons name="cube" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{products.length}</Text>
            <Text style={styles.statLabel}>Mahsulot</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#10B98110' }]}>
              <Ionicons name="checkmark-done" size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{activeProducts}</Text>
            <Text style={styles.statLabel}>Faol</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#F59E0B10' }]}>
              <Ionicons name="time" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{queueStats.pending}</Text>
            <Text style={styles.statLabel}>Navbat</Text>
          </View>
        </View>
        
        {/* Marketplaces - Professional 2x2 Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marketplacelar</Text>
          <View style={styles.mpGrid}>
            {MARKETPLACES.map(mp => (
              <View key={mp.id} style={[styles.mpCard, !mp.active && styles.mpCardDim]}>
                <Image source={{ uri: mp.logo }} style={styles.mpLogo} resizeMode="cover" />
                <View style={styles.mpInfo}>
                  <Text style={styles.mpName}>{mp.name}</Text>
                  {mp.active ? (
                    <View style={styles.mpActiveBadge}>
                      <Text style={styles.mpActiveBadgeText}>Faol</Text>
                    </View>
                  ) : (
                    <View style={styles.mpComingBadge}>
                      <Text style={styles.mpComingBadgeText}>Tez kunda</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {/* Recent Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Oxirgi mahsulotlar</Text>
            <TouchableOpacity onPress={() => navigation.navigate(SCREENS.PRODUCTS)}>
              <Text style={styles.viewAllText}>Hammasi</Text>
            </TouchableOpacity>
          </View>
          
          {products.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={40} color="#64748B" />
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
                      <Ionicons name="image-outline" size={24} color="#64748B" />
                    </View>
                  )}
                  <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                  <Text style={styles.productPrice}>{formatShortPrice(product.price)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
        
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Inactive
  inactiveContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inactiveContent: { alignItems: 'center', paddingHorizontal: 40 },
  inactiveIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F59E0B20', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  inactiveTitle: { fontSize: 22, fontWeight: '700', color: '#FFF', marginBottom: 12 },
  inactiveText: { fontSize: 15, color: '#94A3B8', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  inactiveActions: { width: '100%', gap: 12 },
  activateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 12, gap: 10 },
  activateBtnText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  contactBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', paddingVertical: 16, borderRadius: 12, gap: 10, borderWidth: 1, borderColor: '#334155' },
  contactBtnText: { fontSize: 16, fontWeight: '600', color: '#3B82F6' },
  
  // Header
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 14, color: '#64748B' },
  username: { fontSize: 20, fontWeight: '700', color: '#FFF', marginTop: 2 },
  settingsBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  
  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 16 },
  
  // Warning
  warningCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 14, borderRadius: 12, marginBottom: 16, gap: 12 },
  warningContent: { flex: 1 },
  warningTitle: { fontSize: 14, fontWeight: '600', color: '#92400E' },
  warningText: { fontSize: 12, color: '#B45309', marginTop: 2 },
  
  // Scanner
  scannerCard: { marginBottom: 20, borderRadius: 16, overflow: 'hidden' },
  scannerGradient: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  scannerIconBox: { width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  scannerText: { flex: 1, marginLeft: 14 },
  scannerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  scannerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  
  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 14, padding: 14, alignItems: 'center' },
  statIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '700', color: '#0F172A' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 2 },
  
  // Section
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 12 },
  viewAllText: { fontSize: 13, color: '#3B82F6', fontWeight: '500' },
  
  // Marketplace Grid - Professional 2x2
  mpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mpCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mpCardDim: {
    opacity: 0.7,
  },
  mpLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  mpInfo: {
    flex: 1,
  },
  mpName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  mpActiveBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  mpActiveBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
  },
  mpComingBadge: {
    backgroundColor: '#64748B20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  mpComingBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
  },
  
  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#FFF', borderRadius: 14 },
  emptyText: { fontSize: 15, fontWeight: '500', color: '#0F172A', marginTop: 10 },
  emptySubtext: { fontSize: 13, color: '#64748B', marginTop: 4 },
  
  // Product
  productCard: { width: 130, marginRight: 12, backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden' },
  productImage: { width: '100%', height: 100, resizeMode: 'cover' },
  productImagePlaceholder: { backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  productName: { fontSize: 13, fontWeight: '500', color: '#0F172A', paddingHorizontal: 10, paddingTop: 8 },
  productPrice: { fontSize: 13, fontWeight: '600', color: '#3B82F6', paddingHorizontal: 10, paddingVertical: 8 },
});
