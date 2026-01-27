# SellerCloudX - Product Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS. 4 ta marketplace (Yandex, Uzum, Wildberries, Ozon) uchun to'liq avtomatizatsiya.

## Live URLs
- **Preview**: https://ezmktplace.preview.emergentagent.com
- **Mobile API**: https://ezmktplace.preview.emergentagent.com/api

## Mobile App v1.0.4 (Jan 27, 2026)

### 📱 APK Download:
**https://expo.dev/artifacts/eas/9xsHKc7iMKeApRSC1pLsFG.apk**

### Yangiliklar (v1.0.4):
1. ✅ **Fintech Splash Screen** - Professional animatsiya (4 marketplace logolari)
2. ✅ **Dark Theme Header** - HomeScreen uchun gradient header
3. ✅ **Account Activation System** - isActive=false bo'lsa ilova bloklaydi
4. ✅ **$699 setup fee OLIB TASHLANDI** - Endi faqat $499/oy ko'rsatadi
5. ✅ **"7 kunlik bepul sinov" OLIB TASHLANDI**
6. ✅ **Admin Activation Endpoint** - PUT /api/admin/partners/:id/activate
7. ✅ **4 Marketplace UI** - Yandex(faol), Uzum/Wildberries/Ozon(tez kunda)
8. ✅ **Raqobatchi narx tahlili** - AI Scanner

## Expo Credentials (Yangi akkaunt)
- **Email**: Dubaymall.beauty@gmail.com
- **Username**: medik3636
- **Password**: Medik9298

## 2026 Pricing Model
```
Premium Tariff:
├── Oylik to'lov: $499/month
├── Revenue Share: 4%
└── Cheksiz AI karta, mahsulot
```

## Admin Panel Endpoints
- `PUT /api/admin/partners/:id/activate` - Manual activation (to'lovsiz)
- `GET /api/admin/partners` - List all partners
- `PUT /api/admin/partners/:id/approve` - Approve partner
- `PUT /api/admin/partners/:id/block` - Block partner

## Architecture
```
/app
├── backend/            # Python/FastAPI (port 8001)
├── client/             # React/Vite (port 3000)  
├── mobile/             # React Native/Expo
├── server/             # Node.js/Express
└── migrations/         # SQL Migrations
```

## Files Modified (v1.0.4)

### New Files:
- `/app/mobile/src/screens/SplashScreen.tsx` - Fintech animation

### Modified Files:
- `/app/mobile/App.tsx` - Custom splash integration
- `/app/mobile/src/screens/HomeScreen.tsx` - Dark header, activation check
- `/app/mobile/src/screens/PricingScreen.tsx` - No setup fee, no free trial
- `/app/mobile/src/utils/constants.ts` - 4 marketplaces, new colors
- `/app/server/routes.ts` - Admin activate endpoint
- `/app/backend/server.py` - Admin endpoints (Python)

## Test Credentials
- **Yandex**: token: ACMA:OIjjTDFMnmBe7XOs7EqaWqdoXUS772aKqwqjXj6C:245e5a96

## Known Issues
- Node.js Drizzle ORM production schema mismatch (workaround applied)

## Backlog

### P1 (Pending Test)
- [ ] Test kartochka yaratish flow
- [ ] Test account activation

### P2
- [ ] Uzum Market integration
- [ ] Wildberries integration
- [ ] Full dark mode
