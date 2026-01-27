# SellerCloudX - Product Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS. 4 ta marketplace (Yandex, Uzum, Wildberries, Ozon) uchun to'liq avtomatizatsiya.

## Live URLs
- **Preview**: https://ezmktplace.preview.emergentagent.com
- **Mobile API**: https://ezmktplace.preview.emergentagent.com/api

## Mobile App v1.0.5 (Jan 27, 2026)

### 📱 APK Download:
**https://expo.dev/artifacts/eas/nFn95tydsEA7qG1LjTmLZs.apk**

### Yangiliklar (v1.0.5):
1. ✅ **Real Logolar** - Yandex, Uzum, Wildberries, Ozon haqiqiy logolari
2. ✅ **SellerCloudX Logo** - Raketa va O'zbekiston bayrog'i
3. ✅ **SplashScreen Tuzatildi** - To'g'ri animatsiya bilan ishlaydi
4. ✅ **HomeScreen Real Logolar** - Marketplace grid da real logolar
5. ✅ **SettingsScreen Real Logolar** - Sozlamalar sahifasida real logolar

### v1.0.4 dan:
- Fintech Splash Screen
- Dark Theme Header
- Account Activation System
- $699 setup fee olib tashlandi
- "7 kunlik bepul sinov" olib tashlandi
- Admin Activation Endpoint

## Real Marketplace Logos
```
Yandex: https://customer-assets.emergentagent.com/job_ezmktplace/artifacts/s5t4wghe_market.png
Uzum: https://customer-assets.emergentagent.com/job_ezmktplace/artifacts/fn5a7tjm_images.png
Wildberries: https://customer-assets.emergentagent.com/job_ezmktplace/artifacts/5bdfsh1w_6f50bf7b-9f31-41a5-b13b-332697a792c1.jpg
Ozon: https://customer-assets.emergentagent.com/job_ezmktplace/artifacts/rttfl7ms_ozon-icon-logo.png
SellerCloudX: https://customer-assets.emergentagent.com/job_ezmktplace/artifacts/4ztx60fi_-76rizc_edit_75534802065091.jpg
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

## Files Modified (v1.0.5)
- `/app/mobile/src/screens/SplashScreen.tsx` - Real logos, fixed animation
- `/app/mobile/src/screens/HomeScreen.tsx` - Real marketplace logos
- `/app/mobile/src/screens/SettingsScreen.tsx` - Real logos
- `/app/mobile/src/utils/constants.ts` - MARKETPLACE_LOGOS object
- `/app/mobile/App.tsx` - Simplified splash logic

## Test Credentials
- **Yandex**: token: ACMA:OIjjTDFMnmBe7XOs7EqaWqdoXUS772aKqwqjXj6C:245e5a96

## Backlog

### P1 (Test)
- [ ] Test kartochka yaratish flow
- [ ] Test account activation

### P2
- [ ] Uzum Market integration
- [ ] Wildberries integration
- [ ] Full dark mode
