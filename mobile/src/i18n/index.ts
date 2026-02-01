import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import uz from './uz';
import ru from './ru';

const LANGUAGE_KEY = 'app_language';

// Tilni olish
export async function getStoredLanguage(): Promise<string> {
  try {
    const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
    return lang || 'uz';
  } catch {
    return 'uz';
  }
}

// Tilni saqlash
export async function setStoredLanguage(lang: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    await i18n.changeLanguage(lang);
  } catch (error) {
    console.error('Failed to save language:', error);
  }
}

// i18n konfiguratsiya
i18n
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: uz },
      ru: { translation: ru },
    },
    lng: 'uz', // Default til
    fallbackLng: 'uz',
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  });

// Saqlangan tilni yuklash
getStoredLanguage().then((lang) => {
  i18n.changeLanguage(lang);
});

export default i18n;
