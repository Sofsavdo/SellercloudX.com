// Upload Product Screen - Marketplace ga yuklash (HAQIQIY API)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, MARKETPLACES, SCREENS } from '../utils/constants';
import { formatPrice, calculateSuggestedPrice, calculateProfitMargin } from '../utils/helpers';
import { scannerApi, partnerApi } from '../services/api';
import { offlineQueue } from '../services/offlineQueue';
import { useAuthStore } from '../store/authStore';
import NetInfo from '@react-native-community/netinfo';

interface RouteParams {
  scanResult: {
    brand: string;
    model: string;
    category: string;
    categoryRu: string;
    features: string[];
    suggestedPrice?: number;
    confidence: number;
  };
  imageUri: string;
}

export default function UploadProductScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { scanResult, imageUri } = route.params as RouteParams;
  
  // State
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Computed values
  const costPriceNum = parseInt(costPrice.replace(/\D/g, '')) || 0;
  const sellingPriceNum = parseInt(sellingPrice.replace(/\D/g, '')) || 0;
  const profit = sellingPriceNum - costPriceNum;
  const profitMargin = calculateProfitMargin(costPriceNum, sellingPriceNum);
  
  // Auto-calculate selling price when cost price changes
  const handleCostPriceChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    setCostPrice(cleanValue);
    
    if (cleanValue) {
      const suggested = calculateSuggestedPrice(parseInt(cleanValue));
      setSellingPrice(suggested.toString());
    }
  };
  
  // Format price input
  const formatPriceInput = (value: string) => {
    const num = parseInt(value.replace(/\D/g, '')) || 0;
    return num.toLocaleString('uz-UZ');
  };
  
  // Upload to marketplace
  const handleUpload = async () => {
    if (!costPriceNum) {
      Alert.alert(t('common.error'), 'Tan narxini kiriting');
      return;
    }
    
    if (!selectedMarketplace) {
      Alert.alert(t('common.error'), t('product.selectMarketplace'));
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check internet connection
      const netInfo = await NetInfo.fetch();
      
      // Convert image to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      });
      
      const uploadData = {
        image_base64: base64Image,
        cost_price: costPriceNum,
        selling_price: sellingPriceNum,
        product_info: scanResult,
      };
      
      if (netInfo.isConnected) {
        // Online - darhol yuklash
        if (selectedMarketplace === 'yandex') {
          const result = await yandexApi.autoCreate(uploadData);
          
          if (result.success) {
            Alert.alert(
              t('product.uploadSuccess'),
              `SKU: ${result.sku}\n${result.infographics?.length || 0} ta rasm yaratildi`,
              [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate(SCREENS.HOME),
                },
              ]
            );
          } else {
            throw new Error(result.error || t('product.uploadFailed'));
          }
        }
      } else {
        // Offline - queue ga qo'shish
        await offlineQueue.addToQueue(
          selectedMarketplace === 'yandex' ? 'yandex_upload' : 'uzum_upload',
          uploadData
        );
        
        Alert.alert(
          t('product.uploadQueued'),
          t('product.willUploadWhenOnline'),
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate(SCREENS.HOME),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert(t('common.error'), error.message || t('product.uploadFailed'));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Product Image */}
      <Image source={{ uri: imageUri }} style={styles.productImage} />
      
      {/* Product Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mahsulot ma'lumotlari</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('product.brand')}</Text>
          <Text style={styles.infoValue}>{scanResult.brand}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('product.model')}</Text>
          <Text style={styles.infoValue}>{scanResult.model}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('product.category')}</Text>
          <Text style={styles.infoValue}>{scanResult.categoryRu || scanResult.category}</Text>
        </View>
      </View>
      
      {/* Pricing */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Narxlash</Text>
        
        {/* Cost Price */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('product.costPrice')} *</Text>
          <View style={styles.priceInputContainer}>
            <TextInput
              style={styles.priceInput}
              value={formatPriceInput(costPrice)}
              onChangeText={handleCostPriceChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={COLORS.textLight}
            />
            <Text style={styles.currencyLabel}>UZS</Text>
          </View>
        </View>
        
        {/* Selling Price */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('product.sellingPrice')}</Text>
          <View style={styles.priceInputContainer}>
            <TextInput
              style={styles.priceInput}
              value={formatPriceInput(sellingPrice)}
              onChangeText={(v) => setSellingPrice(v.replace(/\D/g, ''))}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={COLORS.textLight}
            />
            <Text style={styles.currencyLabel}>UZS</Text>
          </View>
        </View>
        
        {/* Profit Preview */}
        {costPriceNum > 0 && sellingPriceNum > 0 && (
          <View style={styles.profitPreview}>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>{t('product.profit')}</Text>
              <Text style={[styles.profitValue, profit < 0 && styles.profitNegative]}>
                {formatPrice(profit)}
              </Text>
            </View>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>{t('product.profitMargin')}</Text>
              <Text style={[styles.profitValue, profit < 0 && styles.profitNegative]}>
                {profitMargin}%
              </Text>
            </View>
          </View>
        )}
      </View>
      
      {/* Marketplace Selection */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('product.marketplace')}</Text>
        
        <View style={styles.marketplaceGrid}>
          {MARKETPLACES.map((mp) => (
            <TouchableOpacity
              key={mp.id}
              style={[
                styles.marketplaceButton,
                selectedMarketplace === mp.id && styles.marketplaceButtonActive,
              ]}
              onPress={() => setSelectedMarketplace(mp.id)}
            >
              <Text style={styles.marketplaceIcon}>{mp.icon}</Text>
              <Text
                style={[
                  styles.marketplaceName,
                  selectedMarketplace === mp.id && styles.marketplaceNameActive,
                ]}
              >
                {mp.name}
              </Text>
              {selectedMarketplace === mp.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.primary}
                  style={styles.marketplaceCheck}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Upload Button */}
      <TouchableOpacity
        style={[
          styles.uploadButton,
          (!costPriceNum || !selectedMarketplace || isLoading) && styles.uploadButtonDisabled,
        ]}
        onPress={handleUpload}
        disabled={!costPriceNum || !selectedMarketplace || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <Ionicons name="cloud-upload" size={24} color={COLORS.white} />
            <Text style={styles.uploadButtonText}>{t('product.uploadToMarketplace')}</Text>
          </>
        )}
      </TouchableOpacity>
      
      {/* Info note */}
      <View style={styles.infoNote}>
        <Ionicons name="information-circle" size={20} color={COLORS.textSecondary} />
        <Text style={styles.infoNoteText}>
          AI avtomatik ravishda 6 ta professional rasm va SEO-optimallashtirilgan tavsif yaratadi.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  card: {
    backgroundColor: COLORS.white,
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  
  // Pricing
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    padding: 14,
  },
  currencyLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    paddingRight: 14,
  },
  profitPreview: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  profitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  profitLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  profitValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  profitNegative: {
    color: COLORS.danger,
  },
  
  // Marketplace
  marketplaceGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  marketplaceButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
  },
  marketplaceButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  marketplaceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  marketplaceName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  marketplaceNameActive: {
    color: COLORS.primary,
  },
  marketplaceCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  
  // Upload Button
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  
  // Info note
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 8,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
