// Upload Product Screen - Background Upload + Marketplace Check
import React, { useState, useEffect } from 'react';
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
    name?: string;
    category: string;
    categoryRu: string;
    features: string[];
    suggestedPrice?: number;
    confidence: number;
  };
  imageUri: string;
}

// Marketplace ulanish holati
interface MarketplaceStatus {
  yandex: boolean;
  uzum: boolean;
  loading: boolean;
}

export default function UploadProductScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { scanResult, imageUri } = route.params as RouteParams;
  const { partner, updatePartner } = useAuthStore();
  
  // State
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
  // Marketplace connection status
  const [marketplaceStatus, setMarketplaceStatus] = useState<MarketplaceStatus>({
    yandex: false,
    uzum: false,
    loading: true,
  });
  
  // Check marketplace connections on mount
  useEffect(() => {
    checkMarketplaceConnections();
  }, []);
  
  const checkMarketplaceConnections = async () => {
    try {
      // API orqali marketplace ulanishlarini tekshirish
      const response = await partnerApi.getMarketplaceStatus();
      
      if (response.success) {
        setMarketplaceStatus({
          yandex: response.yandex?.connected || false,
          uzum: response.uzum?.connected || false,
          loading: false,
        });
      } else {
        // Fallback - partner ma'lumotlaridan tekshirish
        setMarketplaceStatus({
          yandex: !!partner?.yandexApiKey || !!partner?.yandexConnected,
          uzum: !!partner?.uzumApiKey || !!partner?.uzumConnected,
          loading: false,
        });
      }
    } catch (error) {
      console.log('Marketplace status check error:', error);
      // Fallback
      setMarketplaceStatus({
        yandex: false,
        uzum: false,
        loading: false,
      });
    }
  };
  
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
  
  // Marketplace tanlash
  const handleMarketplaceSelect = (marketplace: string) => {
    const isConnected = marketplace === 'yandex' 
      ? marketplaceStatus.yandex 
      : marketplaceStatus.uzum;
    
    if (!isConnected) {
      Alert.alert(
        '⚠️ Marketplace Ulanmagan',
        `${marketplace === 'yandex' ? 'Yandex Market' : 'Uzum Market'} API kalitlari ulanmagan.\n\nAvval web panel orqali marketplace'ni ulang.`,
        [
          { text: 'OK' },
          { 
            text: 'Sozlamalarga o\'tish', 
            onPress: () => navigation.navigate(SCREENS.SETTINGS) 
          },
        ]
      );
      return;
    }
    
    setSelectedMarketplace(marketplace);
  };
  
  // BACKGROUND UPLOAD - Fonga o'tkazish
  const handleBackgroundUpload = async () => {
    if (!costPriceNum) {
      Alert.alert(t('common.error'), 'Tan narxini kiriting');
      return;
    }
    
    if (!selectedMarketplace) {
      Alert.alert(t('common.error'), t('product.selectMarketplace'));
      return;
    }
    
    if (!partner?.id) {
      Alert.alert(t('common.error'), 'Partner ma\'lumotlari topilmadi');
      return;
    }
    
    // Marketplace ulanganmi tekshirish
    const isConnected = selectedMarketplace === 'yandex' 
      ? marketplaceStatus.yandex 
      : marketplaceStatus.uzum;
    
    if (!isConnected) {
      Alert.alert(
        '⚠️ Marketplace Ulanmagan',
        'Avval marketplace API kalitlarini ulang.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Qisqa loading - faqat rasm tayyorlash uchun
    setIsLoading(true);
    setUploadProgress('Rasm tayyorlanmoqda...');
    
    try {
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
        partner_id: partner.id,
        marketplace: selectedMarketplace,
      };
      
      // QUEUE GA QO'SHISH - Darhol qaytish
      await offlineQueue.addToQueue(
        selectedMarketplace === 'yandex' ? 'yandex_upload' : 'uzum_upload',
        uploadData
      );
      
      // Loading ni o'chirish - foydalanuvchi darhol davom eta oladi
      setIsLoading(false);
      setUploadProgress('');
      
      // Darhol scanner'ga qaytish
      Alert.alert(
        '✅ Navbatga qo\'shildi!',
        `Mahsulot kartochkasi fonda yaratilmoqda.\n\n` +
        `Siz davom etib boshqa mahsulotlarni skanerlashingiz mumkin.\n\n` +
        `📊 Holat: Bosh sahifadagi "Kutilmoqda" bo'limida ko'ring.`,
        [
          {
            text: '📸 Yangi skan',
            onPress: () => navigation.navigate(SCREENS.SCANNER),
          },
          {
            text: '🏠 Bosh sahifa',
            onPress: () => navigation.navigate(SCREENS.HOME),
            style: 'cancel',
          },
        ]
      );
      
      // Fonda yuklashni boshlash (UI blokirovka qilmaydi)
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        // Fire and forget - UI kutmaydi
        scannerApi.fullProcess({
          imageBase64: base64Image,
          costPrice: costPriceNum,
          marketplace: selectedMarketplace as 'yandex' | 'uzum',
          partnerId: partner.id,
        }).then(result => {
          if (result.success) {
            console.log('✅ Background upload completed:', result.sku || result.offer_id);
            // Navbatdan o'chirish
            offlineQueue.removeCompleted(uploadData);
            // AI karta ishlatilganini qayd qilish
            partnerApi.recordAiCardUsage().catch(e => console.log('AI card usage error:', e));
          } else {
            console.log('❌ Background upload failed:', result.error);
          }
        }).catch(err => {
          console.log('❌ Background upload error:', err.message);
        });
      }
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setIsLoading(false);
      setUploadProgress('');
      Alert.alert(t('common.error'), error.message || t('product.uploadFailed'));
    }
  };
  
  // Check if any marketplace is connected
  const hasConnectedMarketplace = marketplaceStatus.yandex || marketplaceStatus.uzum;
  
  return (
    <ScrollView style={styles.container}>
      {/* Product Image */}
      <Image source={{ uri: imageUri }} style={styles.productImage} />
      
      {/* Marketplace Status Banner */}
      {!marketplaceStatus.loading && !hasConnectedMarketplace && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={24} color={COLORS.white} />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Marketplace Ulanmagan</Text>
            <Text style={styles.warningText}>
              Mahsulot yuklash uchun avval Yandex yoki Uzum Market API kalitlarini ulang.
            </Text>
          </View>
        </View>
      )}
      
      {/* Product Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mahsulot ma'lumotlari</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('product.brand')}</Text>
          <Text style={styles.infoValue}>{scanResult.brand}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('product.model')}</Text>
          <Text style={styles.infoValue}>{scanResult.model || scanResult.name}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('product.category')}</Text>
          <Text style={styles.infoValue}>{scanResult.categoryRu || scanResult.category}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>AI Ishonchi</Text>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>{scanResult.confidence}%</Text>
          </View>
        </View>
      </View>
      
      {/* Price Input */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Narxlar</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tan narxi (UZS)</Text>
          <TextInput
            style={styles.input}
            value={costPrice ? formatPriceInput(costPrice) : ''}
            onChangeText={handleCostPriceChange}
            placeholder="100 000"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Sotuv narxi (UZS)</Text>
          <TextInput
            style={styles.input}
            value={sellingPrice ? formatPriceInput(sellingPrice) : ''}
            onChangeText={(v) => setSellingPrice(v.replace(/\D/g, ''))}
            placeholder="150 000"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric"
          />
        </View>
        
        {costPriceNum > 0 && sellingPriceNum > 0 && (
          <View style={styles.profitInfo}>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>Foyda</Text>
              <Text style={[styles.profitValue, profit < 0 && styles.profitNegative]}>
                {formatPrice(profit)} UZS
              </Text>
            </View>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>Marja</Text>
              <Text style={[styles.profitValue, profitMargin < 20 && styles.profitNegative]}>
                {profitMargin.toFixed(1)}%
              </Text>
            </View>
          </View>
        )}
      </View>
      
      {/* Marketplace Selection */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Marketplace tanlang</Text>
        
        {marketplaceStatus.loading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <View style={styles.marketplaceGrid}>
            {/* Yandex Market */}
            <TouchableOpacity
              style={[
                styles.marketplaceOption,
                selectedMarketplace === 'yandex' && styles.marketplaceSelected,
                !marketplaceStatus.yandex && styles.marketplaceDisabled,
              ]}
              onPress={() => handleMarketplaceSelect('yandex')}
            >
              <Text style={styles.marketplaceLogo}>🟡</Text>
              <Text style={styles.marketplaceName}>Yandex Market</Text>
              {marketplaceStatus.yandex ? (
                <View style={styles.connectedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
                  <Text style={styles.connectedText}>Ulangan</Text>
                </View>
              ) : (
                <View style={styles.disconnectedBadge}>
                  <Ionicons name="close-circle" size={16} color={COLORS.error} />
                  <Text style={styles.disconnectedText}>Ulanmagan</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {/* Uzum Market */}
            <TouchableOpacity
              style={[
                styles.marketplaceOption,
                selectedMarketplace === 'uzum' && styles.marketplaceSelected,
                !marketplaceStatus.uzum && styles.marketplaceDisabled,
              ]}
              onPress={() => handleMarketplaceSelect('uzum')}
            >
              <Text style={styles.marketplaceLogo}>🟣</Text>
              <Text style={styles.marketplaceName}>Uzum Market</Text>
              {marketplaceStatus.uzum ? (
                <View style={styles.connectedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
                  <Text style={styles.connectedText}>Ulangan</Text>
                </View>
              ) : (
                <View style={styles.disconnectedBadge}>
                  <Ionicons name="close-circle" size={16} color={COLORS.error} />
                  <Text style={styles.disconnectedText}>Ulanmagan</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* Upload Button */}
      <TouchableOpacity
        style={[
          styles.uploadButton,
          (!selectedMarketplace || isLoading) && styles.uploadButtonDisabled,
        ]}
        onPress={handleBackgroundUpload}
        disabled={!selectedMarketplace || isLoading}
      >
        {isLoading ? (
          <View style={styles.uploadingContent}>
            <ActivityIndicator color={COLORS.white} />
            <Text style={styles.uploadingText}>{uploadProgress}</Text>
          </View>
        ) : (
          <>
            <Ionicons name="cloud-upload" size={24} color={COLORS.white} />
            <Text style={styles.uploadButtonText}>
              Fonga Yuklash
            </Text>
          </>
        )}
      </TouchableOpacity>
      
      {/* Info */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color={COLORS.primary} />
        <Text style={styles.infoText}>
          "Fonga Yuklash" tugmasini bosganingizda, mahsulot kartochkasi fonda yaratiladi 
          va siz davom etib boshqa mahsulotlarni skanerlashingiz mumkin.
        </Text>
      </View>
      
      <View style={styles.footer} />
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
    height: 250,
    resizeMode: 'cover',
  },
  
  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    padding: 16,
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  warningText: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  
  // Card
  card: {
    backgroundColor: COLORS.white,
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  
  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontWeight: '600',
    color: COLORS.text,
  },
  confidenceBadge: {
    backgroundColor: COLORS.secondary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  
  // Input
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  
  // Profit Info
  profitInfo: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 8,
    padding: 12,
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
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  profitNegative: {
    color: COLORS.error,
  },
  
  // Marketplace
  marketplaceGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  marketplaceOption: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  marketplaceSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  marketplaceDisabled: {
    opacity: 0.6,
  },
  marketplaceLogo: {
    fontSize: 32,
    marginBottom: 8,
  },
  marketplaceName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedText: {
    fontSize: 12,
    color: COLORS.secondary,
    marginLeft: 4,
  },
  disconnectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disconnectedText: {
    fontSize: 12,
    color: COLORS.error,
    marginLeft: 4,
  },
  
  // Upload Button
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  uploadButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  uploadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  uploadingText: {
    fontSize: 14,
    color: COLORS.white,
  },
  
  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  
  footer: {
    height: 40,
  },
});
