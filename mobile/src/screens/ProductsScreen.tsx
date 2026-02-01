// Products Screen
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SCREENS } from '../utils/constants';
import { formatPrice } from '../utils/helpers';
import { useProductsStore } from '../store/productsStore';
import { Product } from '../services/api';

const STATUS_FILTERS = [
  { id: 'all', label: 'Hammasi' },
  { id: 'active', label: 'Faol' },
  { id: 'pending', label: 'Kutilmoqda' },
  { id: 'draft', label: 'Qoralama' },
];

export default function ProductsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const {
    fetchProducts,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    getFilteredProducts,
  } = useProductsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };
  
  const filteredProducts = getFilteredProducts();
  
  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate(SCREENS.PRODUCT_DETAIL, { product: item })}
    >
      {item.images?.[0] ? (
        <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, styles.productImagePlaceholder]}>
          <Ionicons name="image-outline" size={32} color={COLORS.textLight} />
        </View>
      )}
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        
        {item.brand && (
          <Text style={styles.productBrand}>{item.brand}</Text>
        )}
        
        <View style={styles.productPriceRow}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          {item.costPrice && (
            <Text style={styles.productProfit}>
              +{formatPrice(item.price - item.costPrice)}
            </Text>
          )}
        </View>
        
        <View style={styles.productMeta}>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                item.status === 'active' && styles.statusActive,
                item.status === 'pending' && styles.statusPending,
              ]}
            />
            <Text style={styles.statusText}>
              {item.status === 'active' && 'Faol'}
              {item.status === 'pending' && 'Kutilmoqda'}
              {item.status === 'draft' && 'Qoralama'}
              {item.status === 'sold' && 'Sotildi'}
            </Text>
          </View>
          
          {item.marketplace && (
            <View style={styles.marketplaceBadge}>
              <Text style={styles.marketplaceText}>
                {item.marketplace === 'yandex' ? '🛒 Yandex' : '🛍️ Uzum'}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search')}
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
        {STATUS_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              statusFilter === filter.id && styles.filterButtonActive,
            ]}
            onPress={() => setStatusFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === filter.id && styles.filterButtonTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyStateText}>{t('product.noProducts')}</Text>
            <Text style={styles.emptyStateSubtext}>{t('product.startScanning')}</Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate(SCREENS.SCANNER)}
            >
              <Ionicons name="camera" size={20} color={COLORS.white} />
              <Text style={styles.emptyStateButtonText}>Skaner ochish</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate(SCREENS.SCANNER)}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 50,
  },
  
  // Search
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  
  // Filters
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  
  // List
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  
  // Product card
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  productProfit: {
    fontSize: 12,
    color: COLORS.secondary,
    marginLeft: 8,
  },
  productMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textLight,
    marginRight: 4,
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
  marketplaceBadge: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  marketplaceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  
  // FAB
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
