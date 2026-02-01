// Settings Screen - 2026 MODEL
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SCREENS, STORAGE_KEYS, MARKETPLACES } from '../utils/constants';
import { useAuthStore } from '../store/authStore';
import { setStoredLanguage } from '../i18n';

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value?: string;
  showChevron?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onPress?: () => void;
  onSwitchChange?: (value: boolean) => void;
}

function SettingsItem({
  icon,
  iconColor = COLORS.textSecondary,
  title,
  subtitle,
  value,
  showChevron = true,
  showSwitch = false,
  switchValue,
  onPress,
  onSwitchChange,
}: SettingsItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress && !showSwitch}
    >
      <View style={[styles.settingsIcon, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      
      <View style={styles.settingsContent}>
        <Text style={styles.settingsTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      
      {value && <Text style={styles.settingsValue}>{value}</Text>}
      
      {showSwitch && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor={COLORS.white}
        />
      )}
      
      {showChevron && !showSwitch && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const { user, partner, logout } = useAuthStore();
  
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  // Dark mode holatini yuklash
  useEffect(() => {
    loadDarkMode();
  }, []);
  
  const loadDarkMode = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (stored !== null) {
        setDarkMode(stored === 'true');
      }
    } catch (e) {
      // Ignore
    }
  };
  
  const handleDarkModeChange = async (value: boolean) => {
    setDarkMode(value);
    await AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE, String(value));
    // TODO: Implement actual theme switching
    Alert.alert(
      'Tungi rejim',
      value ? 'Tungi rejim yoqildi (keyingi versiyada to\'liq ishlaydi)' : 'Kunduzgi rejim',
      [{ text: 'OK' }]
    );
  };
  
  const handleLanguageChange = () => {
    Alert.alert(
      'Til / Язык',
      'Tilni tanlang',
      [
        {
          text: "O'zbek",
          onPress: () => setStoredLanguage('uz'),
        },
        {
          text: 'Русский',
          onPress: () => setStoredLanguage('ru'),
        },
        { text: 'Bekor qilish', style: 'cancel' },
      ]
    );
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Chiqish',
      'Hisobdan chiqishni xohlaysizmi?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        { text: 'Chiqish', style: 'destructive', onPress: logout },
      ]
    );
  };
  
  const getTierDisplayName = () => {
    if (partner?.pricingTier === 'premium_2026') return 'Premium 2026';
    if (partner?.pricingTier === 'enterprise_elite') return 'Enterprise';
    if (partner?.pricingTier === 'professional_plus') return 'Professional';
    if (partner?.pricingTier === 'starter_pro') return 'Starter';
    return 'Sinov';
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {(partner?.businessName || user?.username || 'U')[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {partner?.businessName || user?.username || 'Foydalanuvchi'}
          </Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={styles.tierBadge}>
            <Text style={styles.tierBadgeText}>{getTierDisplayName()}</Text>
          </View>
        </View>
      </View>
      
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AKKAUNT</Text>
        
        <View style={styles.sectionContent}>
          <SettingsItem
            icon="person-outline"
            iconColor={COLORS.primary}
            title="Profil"
            subtitle="Shaxsiy ma'lumotlar"
            onPress={() => navigation.navigate(SCREENS.PROFILE)}
          />
          
          <SettingsItem
            icon="card-outline"
            iconColor={COLORS.secondary}
            title="Tarif"
            value={getTierDisplayName()}
            onPress={() => navigation.navigate(SCREENS.PRICING)}
          />
          
          <SettingsItem
            icon="key-outline"
            iconColor={COLORS.accent}
            title="API kalitlari"
            subtitle="Marketplace ulash"
            onPress={() => Alert.alert(
              'API Kalitlari',
              'Yandex Market API kalitlarini web versiyada sozlang:\n\nsellercloudx.com/settings',
              [
                { text: 'OK' },
                { text: 'Ochish', onPress: () => Linking.openURL('https://sellercloudx.com/settings') }
              ]
            )}
          />
        </View>
      </View>
      
      {/* Connected Marketplaces */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MARKETPLACELAR</Text>
        
        <View style={styles.sectionContent}>
          {MARKETPLACES.map(mp => (
            <View key={mp.id} style={styles.marketplaceRow}>
              <Image 
                source={{ uri: mp.logo }} 
                style={styles.marketplaceLogo}
                resizeMode="contain"
              />
              <Text style={styles.marketplaceName}>{mp.name}</Text>
              {mp.active ? (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>Faol</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, styles.statusComingSoon]}>
                  <Text style={styles.statusComingText}>Tez kunda</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
      
      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ILOVA SOZLAMALARI</Text>
        
        <View style={styles.sectionContent}>
          <SettingsItem
            icon="language-outline"
            iconColor={COLORS.primary}
            title="Til"
            value={i18n.language === 'uz' ? "O'zbek" : 'Русский'}
            onPress={handleLanguageChange}
          />
          
          <SettingsItem
            icon="moon-outline"
            iconColor="#6366F1"
            title="Tungi rejim"
            showChevron={false}
            showSwitch
            switchValue={darkMode}
            onSwitchChange={handleDarkModeChange}
          />
          
          <SettingsItem
            icon="notifications-outline"
            iconColor={COLORS.accent}
            title="Bildirishnomalar"
            showChevron={false}
            showSwitch
            switchValue={notifications}
            onSwitchChange={setNotifications}
          />
        </View>
      </View>
      
      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>YORDAM</Text>
        
        <View style={styles.sectionContent}>
          <SettingsItem
            icon="help-circle-outline"
            iconColor={COLORS.primary}
            title="Qo'llab-quvvatlash"
            subtitle="Telegram: @sellercloudx"
            onPress={() => Linking.openURL('https://t.me/sellercloudx')}
          />
          
          <SettingsItem
            icon="document-text-outline"
            iconColor={COLORS.textSecondary}
            title="Maxfiylik siyosati"
            onPress={() => Linking.openURL('https://sellercloudx.com/privacy')}
          />
          
          <SettingsItem
            icon="information-circle-outline"
            iconColor={COLORS.textSecondary}
            title="Versiya"
            value="1.0.2"
            showChevron={false}
          />
        </View>
      </View>
      
      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        <Text style={styles.logoutText}>Chiqish</Text>
      </TouchableOpacity>
      
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Profile
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginTop: 50,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  profileInfo: {
    marginLeft: 14,
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  profileEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tierBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  
  // Section
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
  },
  
  // Settings item
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingsIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingsTitle: {
    fontSize: 15,
    color: COLORS.text,
  },
  settingsSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  settingsValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  
  // Marketplace Row
  marketplaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  marketplaceLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  marketplaceName: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  statusBadge: {
    backgroundColor: COLORS.secondary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  statusComingSoon: {
    backgroundColor: COLORS.textLight + '30',
  },
  statusComingText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  
  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger + '10',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.danger,
  },
  
  footer: {
    height: 40,
  },
});
