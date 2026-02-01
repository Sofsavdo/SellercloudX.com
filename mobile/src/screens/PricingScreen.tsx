// Pricing Screen - 2026 Model (Without Setup Fee Display)
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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../utils/constants';
import { formatPrice } from '../utils/helpers';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');

// USD to UZS rate
const USD_RATE = 12600;

export default function PricingScreen() {
  const navigation = useNavigation();
  const { partner, updatePartner } = useAuthStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubscribe = () => {
    Alert.alert(
      '💎 Premium Tarifga O\'tish',
      'Obunani faollashtirish uchun bog\'laning:\n\n📞 +998 90 008 22 44\n💬 Telegram: @sellercloudx\n📧 sales@sellercloudx.com\n\n✅ Bepul o\'rnatish (cheklangan aksiya!)',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        { text: 'Telegram', onPress: () => Linking.openURL('https://t.me/sellercloudx') },
      ]
    );
  };
  
  const handleEnterprise = () => {
    Alert.alert(
      '🏢 Individual Tarif',
      '$30,000+ oylik savdo hajmi uchun maxsus shartnoma:\n\n• Shaxsiy account menejer\n• 24/7 prioritet qo\'llab-quvvatlash\n• Maxsus API integratsiyalar\n• Narx individual kelishiladi\n\n📞 +998 90 008 22 44\n💬 Telegram: @sellercloudx',
      [
        { text: 'OK' },
        { text: 'Bog\'lanish', onPress: () => Linking.openURL('https://t.me/sellercloudx') },
      ]
    );
  };
  
  // Check if already subscribed
  const isSubscribed = partner?.pricingTier === 'premium_2026' || partner?.isActive === true;
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tariflar</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {/* Premium Plan */}
      <View style={styles.planCard}>
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>TAVSIYA ETILADI</Text>
        </View>
        
        <View style={styles.planHeader}>
          <Text style={styles.planIcon}>💎</Text>
          <Text style={styles.planName}>Premium Tarif</Text>
        </View>
        
        {/* Pricing */}
        <View style={styles.pricingBox}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Oylik to'lov</Text>
            <Text style={styles.priceValue}>$499/oy</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Savdodan ulush</Text>
            <Text style={styles.priceValue}>4%</Text>
          </View>
        </View>
        
        {/* Features */}
        <View style={styles.featuresBox}>
          <FeatureItem icon="infinite" text="Cheksiz AI karta" />
          <FeatureItem icon="infinite" text="Cheksiz mahsulot" />
          <FeatureItem icon="color-palette" text="Professional infografikalar" />
          <FeatureItem icon="hardware-chip" text="To'liq avtomatizatsiya" />
          <FeatureItem icon="bar-chart" text="Real-time statistika" />
          <FeatureItem icon="cash" text="Avtomatik narxlash" />
          <FeatureItem icon="phone-portrait" text="Mobil ilova" />
          <FeatureItem icon="trending-up" text="AI Trend Hunter" />
          <FeatureItem icon="flash" text="Priority qo'llab-quvvatlash" />
        </View>
        
        {/* CTA */}
        <TouchableOpacity
          style={[styles.subscribeBtn, isSubscribed && styles.subscribedBtn]}
          onPress={handleSubscribe}
          disabled={isSubscribed}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFF" />
          ) : isSubscribed ? (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.subscribeBtnText}>Faol</Text>
            </>
          ) : (
            <>
              <Ionicons name="card" size={20} color="#FFF" />
              <Text style={styles.subscribeBtnText}>Obunani faollashtirish</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Calculation Example */}
      <View style={styles.exampleCard}>
        <View style={styles.exampleHeader}>
          <Ionicons name="calculator" size={24} color="#F59E0B" />
          <Text style={styles.exampleTitle}>Hisob-kitob misoli</Text>
        </View>
        
        <Text style={styles.exampleDesc}>
          Agar oylik savdo 10,000,000 so'm bo'lsa:
        </Text>
        
        <View style={styles.exampleRow}>
          <Text style={styles.exampleLabel}>Oylik to'lov ($499)</Text>
          <Text style={styles.exampleValue}>{formatPrice(499 * USD_RATE)}</Text>
        </View>
        
        <View style={styles.exampleRow}>
          <Text style={styles.exampleLabel}>4% revenue share</Text>
          <Text style={styles.exampleValue}>{formatPrice(10000000 * 0.04)}</Text>
        </View>
        
        <View style={[styles.exampleRow, styles.exampleTotal]}>
          <Text style={styles.exampleLabelBold}>Jami</Text>
          <Text style={styles.exampleValueBold}>
            {formatPrice((499 * USD_RATE) + (10000000 * 0.04))}
          </Text>
        </View>
      </View>
      
      {/* Enterprise/Individual Option - Full Details */}
      <View style={styles.enterpriseCard}>
        <View style={styles.enterpriseCardHeader}>
          <Text style={styles.enterpriseIcon}>🏢</Text>
          <View>
            <Text style={styles.enterpriseName}>Individual Tarif</Text>
            <Text style={styles.enterpriseDesc}>$30,000+ oylik savdo hajmi uchun</Text>
          </View>
        </View>
        
        {/* Pricing */}
        <View style={styles.enterprisePricing}>
          <View style={styles.enterprisePriceRow}>
            <Text style={styles.enterprisePriceLabel}>Oylik to'lov</Text>
            <Text style={styles.enterprisePriceValue}>Kelishiladi</Text>
          </View>
          <View style={styles.enterprisePriceRow}>
            <Text style={styles.enterprisePriceLabel}>Revenue share</Text>
            <Text style={styles.enterprisePriceValue}>Individual</Text>
          </View>
        </View>
        
        {/* Features */}
        <View style={styles.enterpriseFeatures}>
          <View style={styles.enterpriseFeatureRow}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.enterpriseFeatureText}>Shaxsiy menejer</Text>
          </View>
          <View style={styles.enterpriseFeatureRow}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.enterpriseFeatureText}>24/7 qo'llab-quvvatlash</Text>
          </View>
          <View style={styles.enterpriseFeatureRow}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.enterpriseFeatureText}>Maxsus integratsiyalar</Text>
          </View>
          <View style={styles.enterpriseFeatureRow}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.enterpriseFeatureText}>API prioritet kirish</Text>
          </View>
          <View style={styles.enterpriseFeatureRow}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.enterpriseFeatureText}>SLA kafolati</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.enterpriseBtn} onPress={handleEnterprise}>
          <Text style={styles.enterpriseBtnText}>Bog'lanish</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      {/* Contact */}
      <TouchableOpacity 
        style={styles.contactBtn}
        onPress={() => Linking.openURL('https://t.me/sellercloudx')}
      >
        <Ionicons name="chatbubble-ellipses" size={20} color="#3B82F6" />
        <Text style={styles.contactBtnText}>Bog'lanish</Text>
      </TouchableOpacity>
      
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
          <Text style={styles.faqQuestion}>Qanday to'lash mumkin?</Text>
          <Text style={styles.faqAnswer}>
            Bank o'tkazmasi, Click, Payme yoki boshqa qulay usullar orqali.
          </Text>
        </View>
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon as any} size={16} color="#3B82F6" />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  
  // Plan Card
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  planIcon: {
    fontSize: 28,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  
  // Pricing
  pricingBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  
  // Features
  featuresBox: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#3B82F610',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  
  // Subscribe Button
  subscribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  subscribedBtn: {
    backgroundColor: '#10B981',
  },
  subscribeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  
  // Example Card
  exampleCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  exampleDesc: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  exampleTotal: {
    borderBottomWidth: 0,
    paddingTop: 12,
  },
  exampleLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  exampleValue: {
    fontSize: 14,
    color: '#334155',
  },
  exampleLabelBold: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  exampleValueBold: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  
  // Enterprise Card - Full
  enterpriseCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  enterpriseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  enterpriseIcon: {
    fontSize: 28,
  },
  enterpriseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  enterpriseDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  enterprisePricing: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  enterprisePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  enterprisePriceLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  enterprisePriceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  enterpriseFeatures: {
    marginBottom: 16,
  },
  enterpriseFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  enterpriseFeatureText: {
    fontSize: 14,
    color: '#334155',
  },
  enterpriseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  enterpriseBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  
  // Contact Button
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  contactBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  
  // FAQ
  faqSection: {
    marginBottom: 20,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },
});
