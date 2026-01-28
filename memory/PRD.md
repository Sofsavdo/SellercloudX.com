# SellerCloudX - Product Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS. 4 ta marketplace (Yandex, Uzum, Wildberries, Ozon) uchun to'liq avtomatizatsiya.

## Live URLs
- **Preview**: https://selltech-1.preview.emergentagent.com
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

## Recent Fixes (Jan 28, 2026)

### 1. Google Lens API Integration (NEW)
- ✅ Created `/app/server/services/googleLensService.ts` - RapidAPI orqali Google Lens integratsiyasi
- ✅ Updated `/app/server/services/imageSearchService.ts` - Google Lens va Gemini qo'shildi
- ✅ RapidAPI Key: `ccd3ae6c91msh55b7206e9ec60a0p12da13jsncb260a5f7642`

### 2. Database Schema Fixes
- ✅ `/app/server/services/advancedAnalyticsService.ts` - PostgreSQL/SQLite compatible qilindi
  - `db.all()` va `db.run()` o'rniga Drizzle ORM ishlatildi
  - Safe date handling qo'shildi
- ✅ `/app/server/routes/chatRoutes.ts` - Sana formati tuzatildi
  - Error handling yaxshilandi
  - Safe date creation qo'shildi
- ✅ `/app/server/services/autonomousAIManager.ts` - Schema fields tuzatildi
  - `partners.name` → `partners.businessName`
  - `partners.email` → `partners.phone`

### 3. Web Frontend Status
- ✅ Landing page - 2026 narx modeli ($499/oy + 4%)
- ✅ Blog sahifasi - Error handling
- ⚠️ Admin Panel - Backend (Node.js) production'da test kerak
- ⚠️ Chat System - Backend (Node.js) production'da test kerak
- ⚠️ AI Scanner - Backend (Node.js) production'da test kerak

## Production Issues (Node.js - Railway) - STATUS

### Fixed in Code:
1. ✅ Google Vision API → Google Lens API (RapidAPI)
2. ✅ Database schema mismatch - Drizzle ORM queries tuzatildi
3. ✅ `createdAt: Invalid Date` - Safe date handling qo'shildi
4. ✅ `Cannot convert undefined or null to object` - Field names tuzatildi

### Needs Production Deploy:
- Node.js kodidagi barcha tuzatishlar production'ga deploy qilinishi kerak
- Deploy qilgandan keyin Admin Panel, Chat, AI Scanner test qilish kerak

## Test Results
- **Web Frontend**: Landing page ishlayapti ✅
- **Python Backend**: Health check OK ✅
- **Mobile APK v1.0.7**: Built, user verification pending

## API Endpoints

### Working (Python Backend):
- `GET /api/health` - Health check ✅
- `GET /api/trends/top` - Trend Hunter ✅

### Needs Production Deploy (Node.js):
- `PUT /api/admin/partners/:id/approve` - Admin approve partner
- `GET /api/chat/messages` - Chat messages
- `POST /api/unified-scanner/analyze-base64` - AI Scanner

## Backlog

### P0 (Critical - Production)
- [ ] Deploy Node.js tuzatishlarni Railway'ga
- [ ] Production'da Admin Panel, Chat, AI Scanner test qilish

### P1 (High)
- [ ] Mobile App v1.0.7 ni foydalanuvchi tekshirishi
- [ ] Trend Hunter uchun 1688.com API integratsiyasi

### P2 (Medium)
- [ ] Mahsulot kartalari uchun video generatsiyasi
- [ ] Python va Node.js backend'larni birlashtirish

### P3 (Low)
- [ ] API hujjatlarini (Swagger) yaratish
- [ ] Unit/Integration testlar yozish

## Key Files Modified (Jan 28, 2026)
- `/app/server/services/googleLensService.ts` - NEW
- `/app/server/services/imageSearchService.ts` - Updated
- `/app/server/services/advancedAnalyticsService.ts` - Rewritten
- `/app/server/routes/chatRoutes.ts` - Fixed
- `/app/server/services/autonomousAIManager.ts` - Fixed

## RapidAPI Keys Available
```
RAPIDAPI_KEY=ccd3ae6c91msh55b7206e9ec60a0p12da13jsncb260a5f7642

Services:
- google-lens-image-search1 (Product recognition)
- 1688-product2 (Trending products)
- amazon-online-data-api (Price comparison)
- seo-keyword-research (SEO optimization)
```

## 3rd Party Integrations
- **Yandex Market Partner API**: Working ✅
- **Expo Application Services (EAS)**: Working ✅
- **Gemini (Emergent)**: Working ✅
- **Google Lens (RapidAPI)**: Integrated ✅
- **Drizzle ORM**: PostgreSQL/SQLite compatible ✅
