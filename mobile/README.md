# SellerCloudX Mobile App 📱

AI-powered marketplace automation mobile ilova

## 🚀 Asosiy xususiyatlar

- **📸 AI Skaner** - Mahsulotni rasmga oling, AI avtomatik aniqlaydi
- **💰 Bir bosishda Marketplace'ga yuklash** - Yandex Market, Uzum Market
- **📴 Offline rejim** - Internet bo'lmaganda ham ishlaydi, keyin avtomatik yuklaydi
- **🌐 Ikki til** - O'zbek va Rus tillarida
- **🔔 Push bildirishnomalar** - Sotuvlar haqida xabar

## 📋 Talablar

- Node.js 18+
- Expo CLI
- iOS: Xcode 14+ (Mac uchun)
- Android: Android Studio

## 🛠️ O'rnatish

```bash
# Dependencylarni o'rnatish
cd mobile
yarn install

# iOS uchun (faqat Mac)
cd ios && pod install && cd ..

# Development serverni ishga tushirish
yarn start
```

## 📱 Ishga tushirish

```bash
# Expo Go ilovasida
yarn start

# iOS simulyatorda
yarn ios

# Android emulyatorda
yarn android
```

## 🏗️ Build qilish

```bash
# Production build
npx eas build --platform all

# APK (Android)
npx eas build --platform android --profile preview

# iOS (TestFlight)
npx eas build --platform ios --profile production
```

## 📂 Fayl strukturasi

```
mobile/
├── App.tsx                 # Entry point
├── app.json               # Expo config
├── src/
│   ├── screens/           # Ekranlar
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ScannerScreen.tsx    # AI Kamera
│   │   ├── ProductsScreen.tsx
│   │   ├── UploadProductScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/        # UI komponentlar
│   ├── services/          # API va servislar
│   │   ├── api.ts         # Backend API
│   │   └── offlineQueue.ts # Offline navbat
│   ├── store/             # Zustand state
│   ├── navigation/        # React Navigation
│   ├── i18n/              # Tarjimalar (uz, ru)
│   └── utils/             # Yordamchi funksiyalar
└── assets/                # Rasmlar, ikonkalar
```

## 🔧 Konfiguratsiya

### API URL
`src/utils/constants.ts` da backend URL ni o'zgartiring:
```typescript
export const API_BASE_URL = 'https://your-api.com/api';
```

### Til qo'shish
`src/i18n/` papkasiga yangi til fayli qo'shing.

## 🎨 Dizayn

- **Ranglar:** Indigo (primary), Emerald (success), Amber (accent)
- **Shrift:** System default
- **Ikonkalar:** @expo/vector-icons (Ionicons)

## 📄 Litsenziya

© 2025 SellerCloudX. Barcha huquqlar himoyalangan.
