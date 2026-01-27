# SellerCloudX - Product Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS. 4 ta marketplace (Yandex, Uzum, Wildberries, Ozon) uchun to'liq avtomatizatsiya.

## Live URLs
- **Preview**: https://ezmktplace.preview.emergentagent.com
- **Mobile API**: https://ezmktplace.preview.emergentagent.com/api

## Mobile App v1.0.4 (Jan 27, 2026)

### Oxirgi APK (v1.0.3):
- https://expo.dev/artifacts/eas/4tX4Wy5CP5vjmMYVDPdZHq.apk

### v1.0.4 yangilanishlar (Build limiti tugagani uchun hali build qilinmagan):
1. ✅ **Fintech Splash Screen** - Professional animatsiya bilan
2. ✅ **Dark Header Design** - HomeScreen uchun gradient header
3. ✅ **Account Activation System** - isActive tekshiruvi
4. ✅ **$699 setup fee olib tashlandi** - PricingScreen da endi ko'rsatilmaydi
5. ✅ **"7 kunlik bepul sinov" olib tashlandi**
6. ✅ **Admin Activation Endpoint** - `/api/admin/partners/:id/activate`
7. ✅ **4 Marketplace Support UI** - Yandex, Uzum, Wildberries, Ozon

### EAS Build Limit:
- Bu oy uchun bepul build limiti tugadi
- Yangi build: Feb 1, 2026 dan keyin
- Yoki: expo.dev/accounts/medik2244s-organization/settings/billing orqali plan upgrade

## Architecture
```
/app
├── backend/            # Python/FastAPI (port 8001)
├── client/             # React/Vite (port 3000)  
├── mobile/             # React Native/Expo
├── server/             # Node.js/Express
└── migrations/         # SQL Migrations
```

## 2026 Pricing Model
```
Premium Tariff:
├── Oylik to'lov: $499/month
├── Revenue Share: 4%
└── Cheksiz AI karta, mahsulot

Individual Tariff:
├── Kelishuv asosida
└── 2% minimum revenue share
```

## Admin Panel Features
- `/api/admin/partners` - Hamkorlar ro'yxati
- `/api/admin/partners/:id/activate` - Hamkorni faollashtirish (to'lovsiz)
- `/api/admin/partners/:id/approve` - Hamkorni tasdiqlash
- `/api/admin/partners/:id/block` - Hamkorni bloklash

## API Endpoints

### Admin (Node.js)
- `PUT /api/admin/partners/:id/activate` - Manual activation
- `GET /api/admin/partners` - List all partners

### Mobile Scanner (Python)
- `POST /api/unified-scanner/analyze-base64`
- `POST /api/unified-scanner/full-process`

### Partner
- `GET /api/partner/marketplace-integrations`
- `PUT /api/partners/me`

## Test Credentials
- **Expo**: rasmiydorixona@gmail.com / Medik9298
- **Yandex**: token: ACMA:OIjjTDFMnmBe7XOs7EqaWqdoXUS772aKqwqjXj6C:245e5a96

## Files Modified (v1.0.4)

### New Files:
- `/app/mobile/src/screens/SplashScreen.tsx` - Fintech animation

### Modified Files:
- `/app/mobile/App.tsx` - Custom splash integration
- `/app/mobile/src/screens/HomeScreen.tsx` - Full redesign with dark header
- `/app/mobile/src/screens/PricingScreen.tsx` - No setup fee, no free trial
- `/app/mobile/src/utils/constants.ts` - 4 marketplaces, new colors
- `/app/server/routes.ts` - Admin activate endpoint
- `/app/backend/server.py` - Admin endpoints (Python)

## Known Issues

### P1 - EAS Build Limit
- Build limit tugadi, Feb 1 dan keyin yangi build
- Hozirgi APK (v1.0.3) ishlaydi

### P1 - Node.js Drizzle ORM
- Production DB schema mismatch
- Workaround applied

## Backlog

### P0 (Done in v1.0.4 code)
- [x] Fintech splash screen
- [x] Account activation system
- [x] Remove $699 setup fee display
- [x] Remove 7-day free trial
- [x] Admin manual activation

### P1 (Pending Build)
- [ ] Build APK v1.0.4
- [ ] Test account activation flow
- [ ] Test kartochka yaratish

### P2
- [ ] Uzum Market integration
- [ ] Wildberries integration
- [ ] Full dark mode
