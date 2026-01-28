# SellerCloudX - Product Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS. 4 ta marketplace (Yandex, Uzum, Wildberries, Ozon) uchun to'liq avtomatizatsiya.

## Live URLs
- **Preview**: https://autotrader-110.preview.emergentagent.com
- **Production**: https://sellercloudx.com (Railway)
- **Mobile API**: /api

## 2026 Pricing Model
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

## Mobile App v1.0.7 (READY - Jan 28, 2026)

### APK Download:
**https://expo.dev/artifacts/eas/xcgPHV3rXDKUu7f8R1guP.apk**

### v1.0.7 O'zgarishlar:
- ✅ Splash screen startup muammosi tuzatildi
- ✅ App.tsx mantiq yangilandi  
- ✅ expo-splash-screen plugin qo'shildi

## Expo Credentials
- **Email**: Dubaymall.beauty@gmail.com
- **Username**: medik3636
- **Password**: Medik9298

## Architecture
```
/app
├── backend/            # Python/FastAPI (port 8001) - Preview
├── client/             # React/Vite (port 3000) - Preview
├── mobile/             # React Native/Expo
├── server/             # Node.js/Express - Production (Railway)
└── migrations/         # SQL Migrations
```

## Production Issues (Node.js - Railway)

### Identified Issues:
1. **`column "partner_id" does not exist`** - PostgreSQL table `chat_rooms` da `partner_id` ustuni yo'q yoki nomi boshqacha
2. **`google-vision-credentials.json` not found** - ✅ FIXED: Gemini'ga o'tkazildi
3. **`createdAt: Invalid Date`** - Timestamp formatting muammosi

### Code Fixes Applied:
1. ✅ `/app/server/services/imageSearchService.ts` - Google Vision o'rniga Gemini ishlatadi
2. ✅ `/app/server/routes/chatRoutes.ts` - Error handling yaxshilandi

### Remaining Production Fixes Needed:
1. PostgreSQL'da `chat_rooms` jadvali `partner_id` ustunini qo'shish (Migration kerak)
2. `partners` jadvalidagi timestamp formatini to'g'rilash

## Recent Changes (Jan 28, 2026)

### Web Frontend:
- ✅ LandingNew.tsx - 2026 narx modeli ($499/oy + 4%)
- ✅ BlogPage.tsx - API error handling
- ✅ "7-kun bepul" va "setup fee" olib tashlandi

### Node.js Server:
- ✅ imageSearchService.ts - Gemini integration (Google Vision o'rniga)
- ✅ chatRoutes.ts - Error handling improvements

### Mobile App:
- ✅ App.tsx - Splash screen logic fix
- ✅ APK v1.0.7 built successfully

## Test Results
- **Frontend**: 90% success (iteration_16.json)
- **Trend Hunter API**: Working (real AliExpress data)
- **Mobile APK v1.0.7**: Built successfully

## Backlog

### P0 (Critical - Production)
- [ ] PostgreSQL migration: Add missing columns to `chat_rooms`, fix timestamps
- [ ] Deploy Node.js fixes to Railway

### P1 (High)
- [ ] Admin panel partner approval - test after DB fix
- [ ] Chat system - test after DB fix
- [ ] AI Scanner - test after Gemini fix deployed

### P2 (Medium)
- [ ] Mahsulot kartalari uchun video generatsiyasi
- [ ] Trend Hunter uchun 1688.com API
- [ ] Python va Node.js backend'larni birlashtirish

## Key API Endpoints
- `GET /api/trends/top` - Trend Hunter (real AliExpress data)
- `PUT /api/admin/partners/:id/approve` - Admin approve partner
- `GET /api/chat/messages` - Chat messages (needs DB fix)
- `POST /api/unified-scanner/analyze-base64` - AI Scanner

## Files Modified Today
- `/app/client/src/pages/LandingNew.tsx` - 2026 pricing
- `/app/client/src/pages/BlogPage.tsx` - Error handling
- `/app/server/services/imageSearchService.ts` - Gemini integration
- `/app/server/routes/chatRoutes.ts` - Error handling
- `/app/mobile/App.tsx` - Splash screen fix
- `/app/mobile/app.json` - v1.0.7, expo-splash-screen plugin
