// Profile Screen - Shaxsiy ma'lumotlar
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../utils/constants';
import { useAuthStore } from '../store/authStore';
import { partnerApi } from '../services/api';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, partner, updatePartner } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: partner?.businessName || '',
    phone: partner?.phone || user?.phone || '',
    email: user?.email || '',
  });
  
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const result = await partnerApi.update({
        businessName: formData.businessName,
        phone: formData.phone,
      });
      
      if (result.partner) {
        updatePartner(result.partner);
      }
      
      Alert.alert('Muvaffaqiyat', 'Ma\'lumotlar saqlandi');
      navigation.goBack();
    } catch (error: any) {
      console.log('Profile save error:', error);
      // 404 xatosi - backend endpoint yo'q bo'lishi mumkin
      if (error.response?.status === 404) {
        Alert.alert('Ma\'lumot', 'Profil serverda saqlanmadi. Local saqlandi.');
        updatePartner({ businessName: formData.businessName, phone: formData.phone });
        navigation.goBack();
      } else {
        Alert.alert('Xato', error.message || 'Saqlashda xatolik yuz berdi');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const getTierName = () => {
    if (partner?.pricingTier === 'premium_2026') return '💎 Premium 2026';
    if (partner?.pricingTier === 'enterprise_elite') return '🏆 Enterprise';
    if (partner?.pricingTier === 'professional_plus') return '💎 Professional';
    if (partner?.pricingTier === 'starter_pro') return '⭐ Starter';
    return '📦 Sinov';
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(formData.businessName || user?.username || 'U')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.tierText}>{getTierName()}</Text>
      </View>
      
      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Biznes nomi</Text>
          <TextInput
            style={styles.input}
            value={formData.businessName}
            onChangeText={(text) => setFormData({ ...formData, businessName: text })}
            placeholder="Biznes nomini kiriting"
            placeholderTextColor={COLORS.textLight}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Telefon</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="+998 90 123 45 67"
            placeholderTextColor={COLORS.textLight}
            keyboardType="phone-pad"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={formData.email}
            editable={false}
            placeholderTextColor={COLORS.textLight}
          />
          <Text style={styles.inputHint}>Email o'zgartirib bo'lmaydi</Text>
        </View>
        
        {/* INN */}
        {partner?.inn && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>INN / STIR</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={partner.inn}
              editable={false}
            />
            <Text style={styles.inputHint}>Tasdiqlangan biznes ID</Text>
          </View>
        )}
      </View>
      
      {/* Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Statistika</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="cube-outline" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{partner?.productsCount || 0}</Text>
            <Text style={styles.statLabel}>Mahsulotlar</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="sparkles-outline" size={24} color={COLORS.accent} />
            <Text style={styles.statValue}>{partner?.aiCardsUsed || 0}</Text>
            <Text style={styles.statLabel}>AI kartalar</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={24} color={COLORS.secondary} />
            <Text style={styles.statValue}>{partner?.aiCardsThisMonth || 0}</Text>
            <Text style={styles.statLabel}>Bu oy</Text>
          </View>
        </View>
      </View>
      
      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <Ionicons name="checkmark" size={20} color={COLORS.white} />
            <Text style={styles.saveButtonText}>Saqlash</Text>
          </>
        )}
      </TouchableOpacity>
      
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 32,
  },
  
  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  tierText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  
  // Form
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  inputDisabled: {
    backgroundColor: COLORS.surfaceAlt,
    color: COLORS.textSecondary,
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  
  // Stats
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
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
  },
  
  // Save Button
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  
  footer: {
    height: 40,
  },
});
