// Settings Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SCREENS } from '../utils/constants';
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
  
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  
  const handleLanguageChange = () => {
    Alert.alert(
      'Til / Язык',
      'Tilni tanlang / Выберите язык',
      [
        {
          text: "O'zbek",
          onPress: () => {
            setStoredLanguage('uz');
          },
        },
        {
          text: 'Русский',
          onPress: () => {
            setStoredLanguage('ru');
          },
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
        {
          text: 'Chiqish',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };
  
  const openProfile = () => {
    try {
      navigation.navigate('Profile');
    } catch (e) {
      Alert.alert('Xato', 'Profil sahifasi ochilmadi');
    }
  };
  
  const openPricing = () => {
    try {
      navigation.navigate('Pricing');
    } catch (e) {
      Alert.alert('Xato', 'Tariflar sahifasi ochilmadi');
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {(user?.username || partner?.businessName || 'U')[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {partner?.businessName || user?.username || 'Foydalanuvchi'}
          </Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={styles.tierBadge}>
            <Text style={styles.tierBadgeText}>
              {partner?.pricingTier === 'free_starter' && '🆓 Free Starter'}
              {partner?.pricingTier === 'starter_pro' && '⭐ Starter Pro'}
              {partner?.pricingTier === 'professional_plus' && '💎 Professional'}
              {partner?.pricingTier === 'enterprise_elite' && '🏆 Enterprise'}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
        
        <View style={styles.sectionContent}>
          <SettingsItem
            icon="person-outline"
            iconColor={COLORS.primary}
            title="Profil"
            subtitle="Shaxsiy ma'lumotlarni tahrirlash"
            onPress={openProfile}
          />
          
          <SettingsItem
            icon="card-outline"
            iconColor={COLORS.secondary}
            title="Obuna"
            value={partner?.pricingTier || 'Free'}
            onPress={openPricing}
          />
          
          <SettingsItem
            icon="key-outline"
            iconColor={COLORS.accent}
            title={t('settings.apiKeys')}
            subtitle="Yandex, Uzum API kalitlari"
            onPress={() => Alert.alert(
              'API Kalitlari',
              'API kalitlarini sozlash uchun web versiyaga kiring:\n\nsellercloudx.com/settings',
              [
                { text: 'OK' },
                { 
                  text: 'Ochish', 
                  onPress: () => Linking.openURL('https://sellercloudx.com/settings')
                }
              ]
            )}
          />
        </View>
      </View>
      
      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ilova sozlamalari</Text>
        
        <View style={styles.sectionContent}>
          <SettingsItem
            icon="language-outline"
            iconColor={COLORS.primary}
            title={t('settings.language')}
            value={i18n.language === 'uz' ? "O'zbek" : 'Русский'}
            onPress={handleLanguageChange}
          />
          
          <SettingsItem
            icon="moon-outline"
            iconColor="#6366F1"
            title={t('settings.darkMode')}
            showChevron={false}
            showSwitch
            switchValue={darkMode}
            onSwitchChange={setDarkMode}
          />
          
          <SettingsItem
            icon="notifications-outline"
            iconColor={COLORS.accent}
            title={t('settings.notifications')}
            showChevron={false}
            showSwitch
            switchValue={notifications}
            onSwitchChange={setNotifications}
          />
        </View>
      </View>
      
      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.help')}</Text>
        
        <View style={styles.sectionContent}>
          <SettingsItem
            icon="help-circle-outline"
            iconColor={COLORS.primary}
            title={t('settings.support')}
            subtitle="Telegram: @sellercloudx"
            onPress={() => Linking.openURL('https://t.me/sellercloudx')}
          />
          
          <SettingsItem
            icon="star-outline"
            iconColor={COLORS.accent}
            title={t('settings.rateApp')}
            onPress={() => Alert.alert(
              'Baholash',
              'Ilovani yoqtirsangiz, Google Play da baholang! ⭐⭐⭐⭐⭐',
              [{ text: 'OK' }]
            )}
          />
          
          <SettingsItem
            icon="document-text-outline"
            iconColor={COLORS.textSecondary}
            title={t('settings.privacyPolicy')}
            onPress={() => Linking.openURL('https://sellercloudx.com/privacy')}
          />
        </View>
      </View>
      
      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        
        <View style={styles.sectionContent}>
          <SettingsItem
            icon="information-circle-outline"
            iconColor={COLORS.textSecondary}
            title={t('settings.version')}
            value="1.0.0"
            showChevron={false}
          />
        </View>
      </View>
      
      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        <Text style={styles.logoutText}>{t('auth.logout')}</Text>
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
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tierBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
  },
  
  // Section
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
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
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingsTitle: {
    fontSize: 16,
    color: COLORS.text,
  },
  settingsSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  settingsValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  
  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger + '10',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.danger,
  },
  
  footer: {
    height: 40,
  },
});
