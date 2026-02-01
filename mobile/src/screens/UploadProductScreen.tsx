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
import { scannerApi, partnerApi, yandexApi } from '../services/api';
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
  yandexApiKey?: string;
  yandexBusinessId?: string;
}

// Upload progress
type UploadStage = 
  | 'idle' 
  | 'preparing' 
  | 'analyzing' 
  | 'generating_card' 
  | 'uploading_images' 
  | 'creating_product' 
  | 'completed' 
  | 'error';

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
  const [uploadStage, setUploadStage] = useState<UploadStage>('idle');
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    offerId?: string;
    sku?: string;
    error?: string;
  } | null>(null);
  
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
        
        // Agar yandex ulangan bo'lsa, avtomatik tanlash
        if (response.yandex?.connected) {
          setSelectedMarketplace('yandex');
        }
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
  
  // TO'LIQ YANDEX ZANJIRI - Mahsulot yaratish
  const handleFullChainUpload = async () => {
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
    
    setIsLoading(true);
    setUploadStage('preparing');
    setUploadProgress('Rasm tayyorlanmoqda...');
    setUploadResult(null);
    
    try {
      // 1. Rasmni base64 ga o'tkazish
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
      
      setUploadStage('analyzing');
      setUploadProgress('AI mahsulotni tahlil qilmoqda...');
      
      // 2. To'liq zanjirni ishga tushirish
      setUploadStage('generating_card');
      setUploadProgress('Kartochka yaratilmoqda...');
      
      const result = await yandexApi.fullChainUpload({
        imageBase64: base64Image,
        costPrice: costPriceNum,
        partnerId: partner.id,
        productName: scanResult.name || scanResult.model || `${scanResult.brand} ${scanResult.category}`,
        brand: scanResult.brand,
        category: scanResult.category,
        description: scanResult.features?.join('. ') || '',
        autoInfographics: true,
      });
      
      if (result.success) {
        setUploadStage('completed');
        setUploadProgress('✅ Muvaffaqiyatli yaratildi!');
        setUploadResult({
          success: true,
          offerId: result.offer_id,
          sku: result.sku,
        });
        
        // AI karta ishlatilganini qayd qilish
        partnerApi.recordAiCardUsage().catch(e => console.log('AI card usage error:', e));
        
        // Success alert
        Alert.alert(
          '✅ Mahsulot Yaratildi!',
          `Mahsulot Yandex Market'ga muvaffaqiyatli yuklandi!\n\n` +
          `📦 SKU: ${result.sku || 'N/A'}\n` +
          `🔗 Offer ID: ${result.offer_id || 'N/A'}\n\n` +
          `Mahsulot Yandex Market seller kabinetingizda ko'rinadi.`,
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
      } else {
        setUploadStage('error');
        setUploadProgress('');
        setUploadResult({
          success: false,
          error: result.error,
        });
        
        Alert.alert(
          '❌ Xatolik',
          result.error || 'Mahsulot yaratishda xatolik yuz berdi',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error: any) {
      console.error('Full chain upload error:', error);
      setUploadStage('error');
      setUploadProgress('');
      setUploadResult({
        success: false,
        error: error.message,
      });
      
      Alert.alert(
        t('common.error'), 
        error.message || t('product.uploadFailed')
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if any marketplace is connected
  const hasConnectedMarketplace = marketplaceStatus.yandex || marketplaceStatus.uzum;
  
  // Upload stage icon and color
  const getStageInfo = () => {
    switch (uploadStage) {
      case 'preparing':
        return { icon: 'image', color: COLORS.primary };
      case 'analyzing':
        return { icon: 'scan', color: COLORS.primary };
      case 'generating_card':
        return { icon: 'create', color: COLORS.accent };
      case 'uploading_images':
        return { icon: 'cloud-upload', color: COLORS.primary };
      case 'creating_product':
        return { icon: 'checkmark-circle', color: COLORS.secondary };
      case 'completed':
        return { icon: 'checkmark-done', color: COLORS.secondary };
      case 'error':
        return { icon: 'close-circle', color: COLORS.error };
      default:
        return { icon: 'hourglass', color: COLORS.textSecondary };
    }
  };
  
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
      
      {/* Success Banner */}
      {uploadResult?.success && (
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
          <View style={styles.successContent}>
            <Text style={styles.successTitle}>Muvaffaqiyatli Yuklandi!</Text>
            <Text style={styles.successText}>
              Offer ID: {uploadResult.offerId || 'N/A'}
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
            editable={!isLoading}
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
            editable={!isLoading}
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
              disabled={isLoading}
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
              {selectedMarketplace === 'yandex' && marketplaceStatus.yandex && (
                <Text style={styles.apiLabel}>✨ To'liq avtomatik</Text>
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
              disabled={isLoading}
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
      
      {/* Upload Progress */}
      {isLoading && (
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Ionicons 
              name={getStageInfo().icon as any} 
              size={24} 
              color={getStageInfo().color} 
            />
            <Text style={styles.progressTitle}>{uploadProgress}</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: uploadStage === 'preparing' ? '20%' :
                         uploadStage === 'analyzing' ? '40%' :
                         uploadStage === 'generating_card' ? '60%' :
                         uploadStage === 'uploading_images' ? '80%' :
                         uploadStage === 'creating_product' ? '90%' :
                         uploadStage === 'completed' ? '100%' : '0%'
                }
              ]} 
            />
          </View>
          <Text style={styles.progressHint}>
            {uploadStage === 'preparing' && 'Rasm yuklanmoqda...'}
            {uploadStage === 'analyzing' && 'AI mahsulotni aniqlayapti...'}
            {uploadStage === 'generating_card' && 'SEO-optimallashtirilgan kartochka yaratilmoqda...'}
            {uploadStage === 'uploading_images' && 'Rasmlar yuklanmoqda...'}
            {uploadStage === 'creating_product' && 'Yandex Market\'ga yuborilmoqda...'}
            {uploadStage === 'completed' && 'Tayyor!'}
          </Text>
        </View>
      )}
      
      {/* Upload Button */}
      <TouchableOpacity
        style={[
          styles.uploadButton,
          (!selectedMarketplace || isLoading || uploadResult?.success) && styles.uploadButtonDisabled,
        ]}
        onPress={handleFullChainUpload}
        disabled={!selectedMarketplace || isLoading || uploadResult?.success}
      >
        {isLoading ? (
          <View style={styles.uploadingContent}>
            <ActivityIndicator color={COLORS.white} />
            <Text style={styles.uploadingText}>Yuklanmoqda...</Text>
          </View>
        ) : uploadResult?.success ? (
          <>
            <Ionicons name="checkmark-done" size={24} color={COLORS.white} />
            <Text style={styles.uploadButtonText}>Yuklandi ✓</Text>
          </>
        ) : (
          <>
            <Ionicons name="rocket" size={24} color={COLORS.white} />
            <Text style={styles.uploadButtonText}>
              Yandex'ga Yuklash
            </Text>
          </>
        )}
      </TouchableOpacity>
      
      {/* Info */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color={COLORS.primary} />
        <Text style={styles.infoText}>
          {selectedMarketplace === 'yandex' 
            ? 'Yandex Market uchun to\'liq avtomatlashtirilgan: AI kartochka + infografika + narx kalkulyatsiyasi + IKPU + API orqali yuklash.'
            : 'Marketplace tanlang va mahsulotni avtomatik yarating.'}
        </Text>
      </View>
      
      {/* Retry Button if Error */}
      {uploadResult?.success === false && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setUploadResult(null);
            setUploadStage('idle');
          }}
        >
          <Ionicons name="refresh" size={20} color={COLORS.primary} />
          <Text style={styles.retryButtonText}>Qayta urinish</Text>
        </TouchableOpacity>
      )}
      
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
  
  // Success Banner
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    padding: 16,
    gap: 12,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  successText: {
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
  apiLabel: {
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 6,
    fontWeight: '600',
  },
  
  // Progress Card
  progressCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
  
  // Retry Button
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  
  footer: {
    height: 40,
  },
});
