# SellerCloudX Mobile v1.1.0 - APK Yaratish

## Versiya: 1.1.0 (28-01-2026)

### Yangiliklar:
- ✅ To'liq Yandex Market zanjiri (scan → detect → AI card → upload)
- ✅ Real-time yuklash progressi
- ✅ Marketplace ulanish holati tekshiruvi
- ✅ Muvaffaqiyatli yuklash notification'lari

## APK Yaratish Usullari

### 1. EAS Build (Tavsiya etiladi)
```bash
cd /app/mobile
npx eas-cli build --platform android --profile preview
```

### 2. Expo Go orqali test
```bash
cd /app/mobile
npx expo start
```

### 3. Development build
```bash
cd /app/mobile
npx expo run:android
```

## APK Yuklab Olish

So'nggi APK: https://expo.dev/accounts/medik3636s-organization/projects/sellercloudx-app/builds

## API Ulanish

Ilova quyidagi API ga ulanadi:
- Production: https://sellercloudx.preview.emergentagent.com/api

## Test Credentials
- Partner: partner / partner123
