# SellerCloudX - Product Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS. 4 ta marketplace (Yandex, Uzum, Wildberries, Ozon) uchun to'liq avtomatizatsiya.

## Live URLs
- **Preview**: https://ezmktplace.preview.emergentagent.com
- **Mobile API**: https://ezmktplace.preview.emergentagent.com/api

## Mobile App v1.0.6 (Jan 28, 2026)

### 📱 APK Download:
**https://expo.dev/artifacts/eas/fJDsj6HUFC9nx7vwoKwey4.apk**

### Yangiliklar (v1.0.6):
1. ✅ **Logo almashish tuzatildi** - Yandex va Uzum to'g'ri joylarda
2. ✅ **Professional Marketplace Grid** - 2x2 layout, nomlar to'g'ri
3. ✅ **Splash Screen yaxshilandi** - Ketma-ket logo animatsiya
4. ✅ **Dumaloq burchaklar** - Logolarda borderRadius: 14
5. ✅ **Individual Tarif to'liq** - Barcha imkoniyatlar ko'rsatiladi:
   - Shaxsiy menejer
   - 24/7 qo'llab-quvvatlash
   - Maxsus integratsiyalar
   - API prioritet kirish
   - SLA kafolati
6. ✅ **Kvadrat yo'qotildi** - Splash to'g'ridan-to'g'ri boshlanadi

## Real Marketplace Logos (TO'G'RILANGAN)
```
Yandex: fn5a7tjm_images.png (megamarket style)
Uzum: s5t4wghe_market.png (purple M)
Wildberries: 5bdfsh1w...jpg
Ozon: ozon-icon-logo.png
SellerCloudX: 4ztx60fi...jpg (rocket with UZ flag)
```

## Expo Credentials
- **Email**: Dubaymall.beauty@gmail.com
- **Username**: medik3636
- **Password**: Medik9298

## 2026 Pricing Model
```
Premium Tariff:
├── Oylik to'lov: $499/month
├── Revenue Share: 4%
└── Cheksiz AI karta, mahsulot

Individual Tariff:
├── Oylik to'lov: Kelishiladi
├── Revenue Share: 2% dan boshlab
├── Shaxsiy menejer
├── 24/7 qo'llab-quvvatlash
├── Maxsus integratsiyalar
└── SLA kafolati
```

## Admin Panel Endpoints
- `PUT /api/admin/partners/:id/activate` - Manual activation
- `GET /api/admin/partners` - List all partners

## Architecture
```
/app
├── backend/            # Python/FastAPI (port 8001)
├── client/             # React/Vite (port 3000)  
├── mobile/             # React Native/Expo
├── server/             # Node.js/Express
└── migrations/         # SQL Migrations
```

## Files Modified (v1.0.6)
- `/app/mobile/src/screens/SplashScreen.tsx` - Sequential animation
- `/app/mobile/src/screens/HomeScreen.tsx` - Professional 2x2 grid
- `/app/mobile/src/screens/PricingScreen.tsx` - Individual tarif full
- `/app/mobile/src/utils/constants.ts` - Fixed logo URLs

## Backlog

### P1 (Test)
- [ ] Test kartochka yaratish flow
- [ ] Test account activation

### P2
- [ ] Uzum Market integration
- [ ] Wildberries integration
- [ ] Full dark mode
