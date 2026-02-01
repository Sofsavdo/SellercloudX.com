# SellerCloudX Mobil Ilova - APK Build Ko'rsatmalari

## 1. EAS Build (Tavsiya etiladi)

### Talab:
- Expo account (expo.dev)
- EAS CLI o'rnatilgan

### Qadamlar:
\`\`\`bash
cd /app/mobile
npx eas login
npx eas build --platform android --profile preview
\`\`\`

Build tugagandan keyin APK linkini olasiz.

## 2. Local Build (Java + Android SDK kerak)

### Talab:
- Java 17
- Android SDK
- NDK

### Qadamlar:
\`\`\`bash
cd /app/mobile
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
\`\`\`

APK joylashuvi: \`android/app/build/outputs/apk/release/app-release.apk\`

## 3. Expo Go orqali Test

Tezkor test uchun:
\`\`\`bash
cd /app/mobile
npx expo start
\`\`\`

Keyin Expo Go ilovasida QR kodni skanerlang.

## API URL
\`\`\`
https://sellercloudx.preview.emergentagent.com/api
\`\`\`

## Web Versiya
Web export tayyor: \`/app/mobile/sellercloudx_mobile_web.zip\`

