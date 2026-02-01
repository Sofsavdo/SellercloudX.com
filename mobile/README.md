# SellerCloudX Mobile App 📱

AI-powered marketplace automation mobil ilova - **TO'LIQ FUNKTSIONAL**

## 🚀 Asosiy xususiyatlar

| Xususiyat | Holat | Tavsif |
|-----------|-------|--------|
| 📸 AI Skaner | ✅ Real API | Gemini AI bilan mahsulot aniqlash |
| 📤 Marketplace Upload | ✅ Real API | Yandex/Uzum ga yuklash |
| 📴 Offline Queue | ✅ Ishlaydi | Internetsiz navbatga qo'shish |
| 🔐 Auth | ✅ Real API | Login/Register (INN bilan) |
| 💰 Click To'lov | ✅ Real API | Tarif sotib olish |
| 📊 Statistika | ✅ Real API | Daromad, foyda, buyurtmalar |
| 🌐 Ikki til | ✅ Ishlaydi | O'zbek va Rus |

## 📋 Talablar

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go ilova (telefonda)
- iOS: Xcode 14+ (Mac uchun)
- Android: Android Studio

## 🛠️ O'rnatish

```bash
# Papkaga o'tish
cd /app/mobile

# Dependencylarni o'rnatish
yarn install

# Development serverni ishga tushirish
yarn start
```

## 📱 Ishga tushirish

```bash
# Expo Go ilovasida QR code skanerlash
yarn start

# iOS simulyatorda (faqat Mac)
yarn ios

# Android emulyatorda
yarn android
```

## 🔧 Konfiguratsiya

### API URL (`src/utils/constants.ts`)
```typescript
export const API_BASE_URL = 'https://sellercloudx.preview.emergentagent.com/api';
```

Production uchun o'zgartiring:
```typescript
export const API_BASE_URL = 'https://sellercloudx.com/api';
```

## 📂 Fayl strukturasi

```
mobile/
├── App.tsx                      # Entry point
├── app.json                     # Expo config
├── package.json
├── src/
│   ├── screens/                 # Ekranlar
│   │   ├── LoginScreen.tsx      # Kirish
│   │   ├── RegisterScreen.tsx   # Ro'yxatdan o'tish (INN)
│   │   ├── HomeScreen.tsx       # Dashboard
│   │   ├── ScannerScreen.tsx    # 📸 AI Kamera (ASOSIY)
│   │   ├── UploadProductScreen.tsx # Marketplace yuklash
│   │   ├── ProductsScreen.tsx   # Mahsulotlar ro'yxati
│   │   ├── StatsScreen.tsx      # 📊 Statistika
│   │   ├── PricingScreen.tsx    # 💰 Tariflar
│   │   └── SettingsScreen.tsx   # ⚙️ Sozlamalar
│   │
│   ├── services/                # API servislar
│   │   ├── api.ts               # Haqiqiy backend API
│   │   └── offlineQueue.ts      # Offline navbat
│   │
│   ├── store/                   # Zustand state
│   │   ├── authStore.ts         # Auth state
│   │   └── productsStore.ts     # Products state
│   │
│   ├── navigation/              # React Navigation
│   │   └── AppNavigator.tsx
│   │
│   ├── i18n/                    # Tarjimalar
│   │   ├── index.ts
│   │   ├── uz.ts                # O'zbek tili
│   │   └── ru.ts                # Rus tili
│   │
│   └── utils/
│       ├── constants.ts         # Konstantalar
│       └── helpers.ts           # Yordamchi funksiyalar
│
└── assets/                      # Rasmlar, ikonkalar
```

## 🔌 API Endpoints (Backend)

| Endpoint | Method | Tavsif |
|----------|--------|--------|
| `/api/auth/login` | POST | Kirish |
| `/api/auth/register` | POST | Ro'yxatdan o'tish |
| `/api/auth/me` | GET | Joriy user |
| `/api/ai/scan-product` | POST | AI skan |
| `/api/unified-scanner/full-process` | POST | To'liq yuklash |
| `/api/products` | GET/POST | Mahsulotlar |
| `/api/analytics` | GET | Statistika |
| `/api/click/tiers` | GET | Tariflar |
| `/api/click/create-payment` | POST | To'lov yaratish |
| `/api/partners/me` | GET | Partner ma'lumotlari |

## 🎨 Dizayn

- **Primary:** #4F46E5 (Indigo)
- **Secondary:** #10B981 (Emerald)
- **Accent:** #F59E0B (Amber)
- **Danger:** #EF4444 (Red)

## 🏗️ Build qilish

### APK (Android)
```bash
# EAS CLI o'rnatish
npm install -g eas-cli

# Login
eas login

# Build
eas build --platform android --profile preview
```

### iOS (TestFlight)
```bash
eas build --platform ios --profile production
```

## 📄 Litsenziya

© 2025 SellerCloudX. Barcha huquqlar himoyalangan.
