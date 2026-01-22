// Pricing Screen - Tarif tanlash va Click to'lov
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../utils/constants';
import { formatPrice } from '../utils/helpers';
import { paymentApi, PaymentTier } from '../services/api';
import { useAuthStore } from '../store/authStore';

const TIER_FEATURES: Record<string, string[]> = {
  free_starter: [
    '10 ta AI karta/oy',
    '50 ta mahsulot',
    '1 ta marketplace',
    'Asosiy statistika',
  ],
  starter_pro: [
    '100 ta AI karta/oy',
    '500 ta mahsulot',
    '2 ta marketplace',
    'Kengaytirilgan statistika',
    'Email qo\'llab-quvvatlash',
  ],
  professional_plus: [
    '1000 ta AI karta/oy',
    '5000 ta mahsulot',
    'Barcha marketplace\'lar',
    'AI Trend Hunter',
    'Priority qo\'llab-quvvatlash',
    'API kirish',
  ],
  enterprise_elite: [
    '♾️ Cheksiz AI karta',
    '♾️ Cheksiz mahsulot',
    'Barcha marketplace\'lar',
    'Shaxsiy menejer',
    '24/7 qo\'llab-quvvatlash',
    'White-label imkoniyati',
  ],
};

const TIER_ICONS: Record<string, string> = {
  free_starter: '🆓',
  starter_pro: '⭐',
  professional_plus: '💎',
  enterprise_elite: '🏆',
};

export default function PricingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { partner, updatePartner } = useAuthStore();
  
  const [tiers, setTiers] = useState<PaymentTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Load tiers
  useEffect(() => {
    loadTiers();
  }, []);
  
  const loadTiers = async () => {
    try {
      const response = await paymentApi.getTiers();
      if (response.success) {
        setTiers(response.tiers);
      }
    } catch (error) {
      console.error('Failed to load tiers:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle payment
  const handlePayment = async (tierId: string) => {
    if (tierId === 'free_starter') {
      Alert.alert('', 'Siz allaqachon bepul tarifdasiz');
      return;
    }
    
    if (tierId === partner?.pricingTier) {
      Alert.alert('', 'Siz allaqachon bu tarifdasiz');
      return;
    }
    
    setSelectedTier(tierId);
    setIsProcessing(true);
    
    try {
      const response = await paymentApi.createPayment(tierId, billingPeriod);
      
      if (response.success && response.paymentUrl) {
        // Open Click payment page
        const canOpen = await Linking.canOpenURL(response.paymentUrl);
        if (canOpen) {
          await Linking.openURL(response.paymentUrl);
          
          Alert.alert(
            'To\'lov sahifasi ochildi',
            'Click sahifasida to\'lovni yakunlang. To\'lov muvaffaqiyatli bo\'lgandan so\'ng, tarifingiz avtomatik yangilanadi.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(t('common.error'), 'To\'lov sahifasini ochib bo\'lmadi');
        }
      } else {
        Alert.alert(t('common.error'), response.error || 'To\'lov yaratishda xatolik');
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'To\'lov yaratishda xatolik');
    } finally {
      setIsProcessing(false);
      setSelectedTier(null);
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tariflar</Text>
        <Text style={styles.subtitle}>
          O'zingizga mos tarifni tanlang
        </Text>
      </View>
      
      {/* Billing Toggle */}
      <View style={styles.billingToggle}>
        <TouchableOpacity
          style={[
            styles.billingOption,
            billingPeriod === 'monthly' && styles.billingOptionActive,
          ]}
          onPress={() => setBillingPeriod('monthly')}
        >
          <Text
            style={[
              styles.billingOptionText,
              billingPeriod === 'monthly' && styles.billingOptionTextActive,
            ]}
          >
            Oylik
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.billingOption,
            billingPeriod === 'annual' && styles.billingOptionActive,
          ]}
          onPress={() => setBillingPeriod('annual')}
        >
          <Text
            style={[
              styles.billingOptionText,
              billingPeriod === 'annual' && styles.billingOptionTextActive,
            ]}
          >
            Yillik
          </Text>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-20%</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Tier Cards */}
      {tiers.map((tier) => {
        const isCurrentTier = partner?.pricingTier === tier.id;
        const isFree = tier.monthlyPrice === 0;
        const price = billingPeriod === 'annual' ? tier.annualPrice : tier.monthlyPrice;
        const monthlyEquivalent = billingPeriod === 'annual' 
          ? Math.round(tier.annualPrice / 12) 
          : tier.monthlyPrice;
        
        return (
          <View
            key={tier.id}
            style={[
              styles.tierCard,
              isCurrentTier && styles.tierCardCurrent,
              tier.id === 'professional_plus' && styles.tierCardPopular,
            ]}
          >
            {/* Popular Badge */}
            {tier.id === 'professional_plus' && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Ommabop</Text>
              </View>
            )}
            
            {/* Current Badge */}
            {isCurrentTier && (
              <View style={styles.currentBadge}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} />
                <Text style={styles.currentText}>Joriy tarif</Text>
              </View>
            )}
            
            {/* Tier Header */}
            <View style={styles.tierHeader}>
              <Text style={styles.tierIcon}>{TIER_ICONS[tier.id]}</Text>
              <Text style={styles.tierName}>{tier.name}</Text>
            </View>
            
            {/* Price */}
            <View style={styles.priceContainer}>
              {isFree ? (
                <Text style={styles.priceText}>Bepul</Text>
              ) : (
                <>
                  <Text style={styles.priceText}>
                    {formatPrice(monthlyEquivalent)}
                  </Text>
                  <Text style={styles.pricePeriod}>/oy</Text>
                </>
              )}
            </View>
            
            {/* Annual total */}
            {billingPeriod === 'annual' && !isFree && (
              <Text style={styles.annualTotal}>
                Yillik: {formatPrice(price)}
              </Text>
            )}
            
            {/* Features */}
            <View style={styles.featuresContainer}>
              {TIER_FEATURES[tier.id]?.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={COLORS.secondary}
                  />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            
            {/* Action Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                isCurrentTier && styles.actionButtonDisabled,
                isFree && styles.actionButtonFree,
              ]}
              onPress={() => handlePayment(tier.id)}
              disabled={isCurrentTier || (isProcessing && selectedTier === tier.id)}
            >
              {isProcessing && selectedTier === tier.id ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text
                  style={[
                    styles.actionButtonText,
                    isFree && styles.actionButtonTextFree,
                  ]}
                >
                  {isCurrentTier
                    ? 'Joriy tarif'
                    : isFree
                    ? 'Bepul boshlash'
                    : 'Sotib olish'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        );
      })}
      
      {/* Payment Info */}
      <View style={styles.paymentInfo}>
        <View style={styles.paymentMethod}>
          <Text style={styles.paymentMethodTitle}>To'lov usullari</Text>
          <View style={styles.paymentIcons}>
            <View style={styles.paymentIcon}>
              <Text style={styles.paymentIconText}>💳</Text>
              <Text style={styles.paymentIconLabel}>Click</Text>
            </View>
            <View style={styles.paymentIcon}>
              <Text style={styles.paymentIconText}>💳</Text>
              <Text style={styles.paymentIconLabel}>UzCard</Text>
            </View>
            <View style={styles.paymentIcon}>
              <Text style={styles.paymentIconText}>💳</Text>
              <Text style={styles.paymentIconLabel}>Humo</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.securityText}>
          🔒 Barcha to'lovlar xavfsiz Click tizimi orqali amalga oshiriladi
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Header
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  
  // Billing Toggle
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
  },
  billingOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  billingOptionActive: {
    backgroundColor: COLORS.primary,
  },
  billingOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  billingOptionTextActive: {
    color: COLORS.white,
  },
  discountBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  discountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  
  // Tier Card
  tierCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  tierCardCurrent: {
    borderColor: COLORS.secondary,
  },
  tierCardPopular: {
    borderColor: COLORS.primary,
  },
  
  // Badges
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.secondary,
    marginLeft: 4,
  },
  
  // Tier Header
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  tierName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  
  // Price
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  pricePeriod: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  annualTotal: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  
  // Features
  featuresContainer: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 10,
  },
  
  // Action Button
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: COLORS.surfaceAlt,
  },
  actionButtonFree: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  actionButtonTextFree: {
    color: COLORS.primary,
  },
  
  // Payment Info
  paymentInfo: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
  },
  paymentMethod: {
    marginBottom: 16,
  },
  paymentMethodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  paymentIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  paymentIcon: {
    alignItems: 'center',
  },
  paymentIconText: {
    fontSize: 24,
  },
  paymentIconLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  securityText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  
  footer: {
    height: 40,
  },
});
