# SellerCloudX - Product Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS. 4 ta marketplace (Yandex, Uzum, Wildberries, Ozon) uchun to'liq avtomatizatsiya.

## Live URLs
- **Preview**: https://autotrader-110.preview.emergentagent.com
- **Mobile API**: https://autotrader-110.preview.emergentagent.com/api

## 2026 Pricing Model (UPDATED Jan 28, 2026)
```
Premium Tariff:
├── Oylik to'lov: $499/month
├── Revenue Share: 4% savdodan
├── 60-kun kafolat
└── Cheksiz AI karta, mahsulot

Individual Tariff:
├── Oylik to'lov: Kelishiladi
├── Revenue Share: 2% dan
├── Shaxsiy menejer
└── Maxsus integratsiyalar
```

## Mobile App v1.0.7 (Building - Jan 28, 2026)

### Build Status:
**Building on EAS**: https://expo.dev/accounts/medik3636s-organization/projects/sellercloudx-app/builds/045b0105-1a94-485c-8e84-982152bf4193

### v1.0.7 O'zgarishlar:
- Splash screen startup muammosi tuzatildi
- App.tsx mantiq yangilandi
- expo-splash-screen plugin qo'shildi

### Oldingi APK (v1.0.6):
**https://expo.dev/artifacts/eas/fJDsj6HUFC9nx7vwoKwey4.apk**

## Expo Credentials
- **Email**: Dubaymall.beauty@gmail.com
- **Username**: medik3636
- **Password**: Medik9298

## Architecture
```
/app
├── backend/            # Python/FastAPI (port 8001)
├── client/             # React/Vite (port 3000)  
├── mobile/             # React Native/Expo
├── server/             # Node.js/Express (Production only)
└── migrations/         # SQL Migrations
```

## Recent Changes (Jan 28, 2026)

### Web Frontend Updated:
1. ✅ LandingNew.tsx - 2026 narx modeli yangilandi
2. ✅ Premium: $499/oy + 4% savdodan
3. ✅ Individual: Kelishiladi + 2% dan
4. ✅ 60-kun kafolat badge
5. ✅ "7-kun bepul" va "setup fee" olib tashlandi
6. ✅ BlogPage.tsx - API error handling tuzatildi
7. ✅ Pricing kartalar kompakt qilindi

### Mobile App v1.0.7:
1. ✅ App.tsx splash screen mantiq tuzatildi
2. ✅ expo-splash-screen plugin qo'shildi
3. ✅ "Kichik kvadrat" muammosi hal qilindi
4. ⏳ APK yaratilmoqda...

### Working Features:
- ✅ Landing page 2026 pricing
- ✅ Trend Hunter API (real AliExpress data)
- ✅ Navigation (Imkoniyatlar, Narxlar, Blog)
- ✅ Registration flow
- ✅ Login dropdown (Hamkor/Admin)

## Test Results (iteration_16.json)
- **Success Rate**: 90% (7/8 features)
- **All 2026 pricing verified working**
- **Trend Hunter API returns real data**

## Backlog

### P0 (Critical)
- [x] Web Frontend 2026 narx modeli - DONE
- [ ] Node.js Backend Drizzle ORM xatolarini tuzatish (Production env)
- [⏳] Mobile App v1.0.7 startup muammosi - BUILDING

### P1 (High)
- [ ] Mahsulot kartalari uchun video generatsiyasi
- [ ] Trend Hunter uchun 1688.com API
- [ ] Admin panel hamkorni faollashtirish UI

### P2 (Medium)
- [ ] Python va Node.js backend'larni birlashtirish
- [ ] To'liq test coverage
- [ ] Uzum Market avtomatizatsiyasi

### P3 (Low)
- [ ] API hujjatlari (Swagger)
- [ ] Blog maqolalari qo'shish

## Key API Endpoints
- `GET /api/trends/top` - Trend Hunter (real AliExpress data)
- `POST /api/admin/partners/activate-manual` - Manual partner activation
- `POST /api/scanner/analyze-base64` - Mobile scanner

## Files Modified (Jan 28, 2026)
- `/app/client/src/pages/LandingNew.tsx` - 2026 pricing update
- `/app/client/src/pages/BlogPage.tsx` - Error handling fix
- `/app/mobile/App.tsx` - Splash screen logic fix
- `/app/mobile/app.json` - expo-splash-screen plugin, v1.0.7
- `/app/mobile/src/screens/SplashScreen.tsx` - v1.0.7
