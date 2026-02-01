# SellerCloudX Mobile App v1.2.0 - APK Build Ko'rsatmalari

## 📱 Ilova haqida
- **Versiya**: 1.2.0
- **API**: https://sellercloudx.com/api
- **Platform**: Android (APK)

## 🚀 APK Build qilish (2 usul)

### 1-Usul: Expo Go orqali sinash (Tez)

```bash
# 1. ZIP ni oching va papkaga kiring
unzip sellercloudx_v1.2.0.zip -d sellercloudx
cd sellercloudx

# 2. Dependencies o'rnating
npm install
# yoki
yarn install

# 3. Expo serverini ishga tushiring
npx expo start

# 4. Telefonda Expo Go ilovasini oching va QR kodni skanerlang
```

### 2-Usul: APK Build (Production)

#### Talab qilinadigan dasturlar:
- Node.js 18+
- npm yoki yarn
- EAS CLI (`npm install -g eas-cli`)
- Expo account (https://expo.dev)

```bash
# 1. ZIP ni oching
unzip sellercloudx_v1.2.0.zip -d sellercloudx
cd sellercloudx

# 2. Dependencies o'rnating
yarn install

# 3. Expo'ga login qiling
eas login

# 4. APK build qiling (cloud'da)
eas build --platform android --profile preview

# 5. Build tugagach APK havolasini olasiz
```

## 📂 Loyiha strukturasi

```
sellercloudx/
├── App.tsx                 # Entry point
├── app.json               # Expo konfiguratsiyasi
├── package.json           # Dependencies
├── eas.json               # EAS Build konfiguratsiyasi
├── assets/                # Icon va splash rasmlar
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
└── src/
    ├── screens/           # Barcha sahifalar
    │   ├── LoginScreen.tsx
    │   ├── HomeScreen.tsx
    │   ├── ScannerScreen.tsx
    │   ├── UploadProductScreen.tsx
    │   ├── ProductsScreen.tsx
    │   ├── StatsScreen.tsx
    │   └── SettingsScreen.tsx
    ├── services/
    │   ├── api.ts         # Backend API chaqiruvlari
    │   └── offlineQueue.ts
    ├── store/
    │   └── authStore.ts   # Zustand state management
    ├── navigation/
    │   └── AppNavigator.tsx
    ├── i18n/              # Tillar (uz, ru)
    └── utils/
        └── constants.ts   # API URL va ranglar
```

## 🔑 Test Credentials

```
Username: partner
Password: partner123
```

## ✨ Asosiy Funksiyalar

1. **AI Scanner** - Kamera yoki galereya orqali mahsulotni skanerlash
2. **Yandex Market** - Mahsulotni to'g'ridan-to'g'ri Yandex'ga yuklash
3. **Mahsulotlar** - Barcha mahsulotlarni ko'rish va boshqarish
4. **Statistika** - Sotuv va foyda tahlili
5. **Trend Hunter** - Bozordagi trend mahsulotlarni topish

## 🔧 Muammolar bo'lsa

### "Network Error" xatosi:
- Internet ulanishini tekshiring
- API URL to'g'riligini tekshiring (`src/utils/constants.ts`)

### Kamera ishlamayapti:
- Telefon sozlamalaridan kamera ruxsatini bering

### Login ishlamayapti:
- `partner / partner123` credentials to'g'riligini tekshiring
- Backend ishlayotganini tekshiring: https://sellercloudx.com/api/health

## 📞 Yordam

Muammolar bo'lsa, admin bilan bog'laning.
