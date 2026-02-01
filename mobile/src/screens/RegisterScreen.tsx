// Register Screen - Ro'yxatdan o'tish
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { COLORS, SCREENS } from '../utils/constants';
import { useAuthStore } from '../store/authStore';
import { validateINN } from '../utils/helpers';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('yatt');
  const [inn, setInn] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [innError, setInnError] = useState('');
  
  // Validate INN on change
  const handleInnChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 9);
    setInn(cleanValue);
    
    if (cleanValue.length === 9) {
      const result = validateINN(cleanValue);
      if (!result.valid) {
        setInnError(result.error || '');
      } else {
        setInnError('');
      }
    } else {
      setInnError('');
    }
  };
  
  // Handle register
  const handleRegister = async () => {
    // Validation
    if (!name || !email || !phone || !password || !inn) {
      Alert.alert(t('common.error'), 'Barcha maydonlarni to\'ldiring');
      return;
    }
    
    if (inn.length !== 9) {
      Alert.alert(t('common.error'), 'INN 9 ta raqamdan iborat bo\'lishi kerak');
      return;
    }
    
    const innValidation = validateINN(inn);
    if (!innValidation.valid) {
      Alert.alert(t('common.error'), innValidation.error);
      return;
    }
    
    if (password.length < 6) {
      Alert.alert(t('common.error'), 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }
    
    clearError();
    const success = await register({
      name,
      email,
      phone,
      password,
      inn,
      businessType,
    });
    
    if (success) {
      Alert.alert(
        t('auth.registerSuccess'),
        'Hisobingiz yaratildi. Endi tizimga kirishingiz mumkin.',
        [{ text: 'OK', onPress: () => navigation.navigate(SCREENS.LOGIN) }]
      );
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('auth.register')}</Text>
        </View>
        
        {/* Form */}
        <View style={styles.formContainer}>
          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          {/* Name */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.firstName') + ' ' + t('auth.lastName')}
              placeholderTextColor={COLORS.textLight}
              value={name}
              onChangeText={setName}
            />
          </View>
          
          {/* Email */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.email')}
              placeholderTextColor={COLORS.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          {/* Phone */}
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.phone')}
              placeholderTextColor={COLORS.textLight}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
          
          {/* Password */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.password')}
              placeholderTextColor={COLORS.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
          
          {/* Business Name */}
          <View style={styles.inputContainer}>
            <Ionicons name="business-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.businessName')}
              placeholderTextColor={COLORS.textLight}
              value={businessName}
              onChangeText={setBusinessName}
            />
          </View>
          
          {/* Business Type */}
          <View style={styles.pickerContainer}>
            <Ionicons name="briefcase-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={businessType}
                onValueChange={setBusinessType}
                style={styles.picker}
              >
                <Picker.Item label={t('auth.businessTypes.yatt')} value="yatt" />
                <Picker.Item label={t('auth.businessTypes.ooo')} value="ooo" />
                <Picker.Item label={t('auth.businessTypes.individual')} value="individual" />
              </Picker>
            </View>
          </View>
          
          {/* INN */}
          <View style={[styles.inputContainer, innError ? styles.inputError : undefined]}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder={t('auth.inn')}
              placeholderTextColor={COLORS.textLight}
              value={inn}
              onChangeText={handleInnChange}
              keyboardType="numeric"
              maxLength={9}
            />
            {inn.length === 9 && !innError && (
              <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
            )}
          </View>
          
          {/* INN Hint */}
          <Text style={[styles.hint, innError ? styles.hintError : undefined]}>
            {innError || t('auth.innHint')}
          </Text>
          
          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Bitta INN faqat bitta akkaunt uchun ishlatilishi mumkin. 
              Bu bepul tarifdan suiiste'mol qilishning oldini oladi.
            </Text>
          </View>
          
          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.registerButtonText}>{t('auth.register')}</Text>
            )}
          </TouchableOpacity>
          
          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{t('auth.hasAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate(SCREENS.LOGIN)}>
              <Text style={styles.loginLink}>{t('auth.login')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  
  // Form
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger + '15',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  
  // Picker
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    paddingLeft: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerWrapper: {
    flex: 1,
  },
  picker: {
    height: 50,
  },
  
  // Hint
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginLeft: 4,
  },
  hintError: {
    color: COLORS.danger,
  },
  
  // Info box
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 8,
    lineHeight: 18,
  },
  
  // Register button
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  registerButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  
  // Login
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
