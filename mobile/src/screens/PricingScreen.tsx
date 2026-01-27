// Pricing Screen - 2026 Revenue Share Model
import React, { useState } from 'react';
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
import { useAuthStore } from '../store/authStore';

// 2026 MODEL - $699 setup + $499/oy + 4% savdodan
const PRICING_2026 = {
  premium: {
    id: 'premium_2026',
    name: 'Premium Tarif',
    icon: '💎',
    setupFee: 699, // USD
    monthlyFee: 499, // USD
    revenueShare: 4, // %
    features: [
      '♾️ Cheksiz AI karta generatsiya',
      '♾️ Cheksiz mahsulot',
      '🎨 Professional infografikalar',
      '🤖 To\'liq avtomatizatsiya',
      '📊 Real-time Yandex statistika',
      '💰 Avtomatik narxlash',
      '📱 Mobil ilova',
      '🎯 AI Trend Hunter',
      '⚡ Priority qo\'llab-quvvatlash',
      '🔑 API kirish',
    ],
    popular: true,
  },
  individual: {
    id: 'individual_2026',
    name: 'Individual Tarif',
    icon: '🏢',
    setupFee: null, // Kelishuv bo'yicha
    monthlyFee: null,
    revenueShare: 2, // Minimum 2%
    features: [
      'Premium tarifning barcha imkoniyatlari',
      '🤝 Shaxsiy shartnoma',
      '👔 Shaxsiy menejer',
      '24/7 Qo\'llab-quvvatlash',
      '🏷️ White-label imkoniyati',
      '📈 Maxsus integratsiyalar',
    ],
    popular: false,
  },
};

// USD to UZS rate
const USD_RATE = 12600;

export default function PricingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { partner } = useAuthStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  // Handle payment
  const handleSubscribe = async (planId: string) => {
    if (planId === 'individual_2026') {
      // Individual tarif uchun aloqa
      Alert.alert(
        'Individual Tarif',
        'Individual tarif uchun biz bilan bog\'laning:\n\n📞 +998 90 123 45 67\n📧 sales@sellercloudx.com\n💬 Telegram: @sellercloudx',
        [
          { text: 'OK' },
          { 
            text: 'Telegram', 
            onPress: () => Linking.openURL('https://t.me/sellercloudx') 
          },
        ]
      );
      return;
    }
    
    setSelectedPlan(planId);
    setIsProcessing(true);
    
    try {
      // Premium tarif uchun to'lov
      const plan = PRICING_2026.premium;
      const totalSetup = plan.setupFee * USD_RATE;
      
      Alert.alert(
        '💎 Premium Tarifga O\'tish',
        `\n📋 To'lov tafsilotlari:\n\n` +
        `• Setup: $${plan.setupFee} (${formatPrice(totalSetup)})\n` +
        `• Oylik: $${plan.monthlyFee}/oy\n` +
        `• Savdodan: ${plan.revenueShare}%\n\n` +
        `🎁 7 kunlik BEPUL sinov davri\n` +
        `✅ 60 kunlik kafolat`,
        [
          { text: 'Bekor qilish', style: 'cancel' },
          { 
            text: 'To\'lovga o\'tish', 
            onPress: () => {
              // To'lov sahifasiga yo'naltirish
              Alert.alert(
                'To\'lov',
                'Click to\'lov tizimi orqali to\'lov qiling. Menejerimiz siz bilan bog\'lanadi.',
                [{ text: 'OK' }]
              );
            }
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Xato', error.message || 'Xatolik yuz berdi');
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>2026 Premium Model</Text>
        <Text style={styles.subtitle}>
          To'liq avtomatizatsiya + Revenue Share
        </Text>
      </View>
      
      {/* Model Info Banner */}
      <View style={styles.modelBanner}>
        <Text style={styles.modelTitle}>🚀 Yangi Biznes Model</Text>
        <Text style={styles.modelDescription}>
          Setup + Oylik + Savdodan % = Hamkorlik
        </Text>
      </View>
      
      {/* Premium Plan */}
      <View style={[styles.planCard, styles.planCardPremium]}>
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>⭐ TAVSIYA ETILADI</Text>
        </View>
        
        <View style={styles.planHeader}>
          <Text style={styles.planIcon}>{PRICING_2026.premium.icon}</Text>
          <Text style={styles.planName}>{PRICING_2026.premium.name}</Text>
        </View>
        
        {/* Pricing */}
        <View style={styles.pricingSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Setup (bir martalik)</Text>
            <Text style={styles.priceValue}>${PRICING_2026.premium.setupFee}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Oylik to'lov</Text>
            <Text style={styles.priceValue}>${PRICING_2026.premium.monthlyFee}/oy</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Savdodan ulush</Text>
            <Text style={[styles.priceValue, styles.revenueShare]}>
              {PRICING_2026.premium.revenueShare}%
            </Text>
          </View>
        </View>
        
        {/* Bonuses */}
        <View style={styles.bonusSection}>
          <View style={styles.bonusItem}>
            <Ionicons name="gift" size={18} color={COLORS.secondary} />
            <Text style={styles.bonusText}>7 kunlik BEPUL sinov</Text>
          </View>
          <View style={styles.bonusItem}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.secondary} />
            <Text style={styles.bonusText}>60 kunlik kafolat</Text>
          </View>
        </View>
        
        {/* Features */}
        <View style={styles.featuresContainer}>
          {PRICING_2026.premium.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        
        {/* Action Button */}
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={() => handleSubscribe('premium_2026')}
          disabled={isProcessing && selectedPlan === 'premium_2026'}
        >
          {isProcessing && selectedPlan === 'premium_2026' ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.subscribeButtonText}>Boshlash</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Individual Plan */}
      <View style={styles.planCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planIcon}>{PRICING_2026.individual.icon}</Text>
          <Text style={styles.planName}>{PRICING_2026.individual.name}</Text>
        </View>
        
        {/* Custom Pricing */}
        <View style={styles.pricingSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Narx</Text>
            <Text style={styles.priceValue}>Kelishuv bo'yicha</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Min. Revenue Share</Text>
            <Text style={[styles.priceValue, styles.revenueShare]}>
              {PRICING_2026.individual.revenueShare}%+
            </Text>
          </View>
        </View>
        
        {/* Features */}
        <View style={styles.featuresContainer}>
          {PRICING_2026.individual.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        
        {/* Contact Button */}
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => handleSubscribe('individual_2026')}
        >
          <Ionicons name="chatbubbles" size={20} color={COLORS.primary} />
          <Text style={styles.contactButtonText}>Bog'lanish</Text>
        </TouchableOpacity>
      </View>
      
      {/* Calculator Example */}
      <View style={styles.calculatorCard}>
        <Text style={styles.calculatorTitle}>💰 Hisob-kitob misoli</Text>
        <Text style={styles.calculatorSubtitle}>Agar oylik savdo 10,000,000 so'm bo'lsa:</Text>
        
        <View style={styles.calcRow}>
          <Text style={styles.calcLabel}>Oylik to'lov ($499)</Text>
          <Text style={styles.calcValue}>{formatPrice(499 * USD_RATE)}</Text>
        </View>
        <View style={styles.calcRow}>
          <Text style={styles.calcLabel}>4% revenue share</Text>
          <Text style={styles.calcValue}>{formatPrice(10000000 * 0.04)}</Text>
        </View>
        <View style={[styles.calcRow, styles.calcTotal]}>
          <Text style={styles.calcTotalLabel}>Jami</Text>
          <Text style={styles.calcTotalValue}>
            {formatPrice(499 * USD_RATE + 10000000 * 0.04)}
          </Text>
        </View>
      </View>
      
      {/* FAQ */}
      <View style={styles.faqSection}>
        <Text style={styles.faqTitle}>Tez-tez so'raladigan savollar</Text>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Revenue share qachon hisoblanadi?</Text>
          <Text style={styles.faqAnswer}>
            Har oy oxirida Yandex Market'dagi sotuvlaringiz asosida avtomatik hisoblanadi.
          </Text>
        </View>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>7 kunlik sinov qanday ishlaydi?</Text>
          <Text style={styles.faqAnswer}>
            To'liq funksionallikdan foydalaning. Agar yoqmasa - bekor qiling, hech narsa to'lamaysiz.
          </Text>
        </View>
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
  
  // Header
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  
  // Model Banner
  modelBanner: {
    backgroundColor: COLORS.accent,
    padding: 16,
    alignItems: 'center',
  },
  modelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  modelDescription: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  
  // Plan Card
  planCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  planCardPremium: {
    borderColor: COLORS.primary,
  },
  
  // Popular Badge
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  
  // Plan Header
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  
  // Pricing Section
  pricingSection: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  revenueShare: {
    color: COLORS.primary,
  },
  
  // Bonus Section
  bonusSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.secondary + '15',
    borderRadius: 8,
  },
  bonusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bonusText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
    marginLeft: 6,
  },
  
  // Features
  featuresContainer: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 10,
    flex: 1,
  },
  
  // Subscribe Button
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginRight: 8,
  },
  
  // Contact Button
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  
  // Calculator
  calculatorCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
  },
  calculatorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  calculatorSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  calcLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  calcValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  calcTotal: {
    borderBottomWidth: 0,
    paddingTop: 12,
  },
  calcTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  calcTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  
  // FAQ
  faqSection: {
    padding: 16,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  
  footer: {
    height: 40,
  },
});
