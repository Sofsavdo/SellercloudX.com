# SellerCloudX - Product Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS for Yandex Market. Complete automation from camera scan to product listing.

## Live Environment
- **Preview URL**: https://yandexbot.preview.emergentagent.com
- **Mobile API**: https://yandexbot.preview.emergentagent.com/api

## Mobile App Downloads
- **Web Export**: `/app/mobile/sellercloudx_mobile_web.zip`
- **Full Package (with Android source)**: `/app/mobile/sellercloudx_mobile_full_package.zip`
- **APK Build Instructions**: `/app/mobile/BUILD_APK_INSTRUCTIONS.md`

## Architecture
```
/app
├── backend/            # Python/FastAPI (port 8001)
├── client/             # React/Vite (port 3000)  
├── mobile/             # React Native/Expo
│   ├── dist/           # Web export
│   ├── android/        # Android native code
│   └── build_package/  # Complete build package
├── server/             # Node.js/Express
└── migrations/         # SQL Migrations
```

## 2026 Revenue Share Model ✅
```
Premium Tariff:
├── Setup: $699 (one-time)
├── Monthly: $499/month
└── Revenue Share: 4% of sales

Example (10M UZS sales):
├── Monthly fee: 6,287,400 UZS ($499)
├── Revenue share: 400,000 UZS (4%)
└── Total: 6,687,400 UZS ($531)
```

## Completed Features (Jan 27, 2026)

### 1. Mobile Scanner Endpoint ✅
**Critical for mobile app camera functionality**

**Endpoint**: `POST /api/unified-scanner/analyze-base64`
```json
Request: {"image_base64": "...", "language": "uz"}
Response: {
  "success": true,
  "product_info": {...},
  "suggested_price": 100000,
  "confidence": 85
}
```

### 2. Full Automation ✅ 
6-step flow: Scan → MXIK → AI Card → Pricing → Infographics → Yandex

### 3. Trend Hunter API ✅
- `GET /api/trends/top` - Top opportunities
- `GET /api/trends/category/{category}` - By category
- Categories: electronics, clothing, home, beauty, sports

### 4. Revenue Share Billing ✅
- `GET /api/billing/calculate`
- `POST /api/billing/summary`

### 5. Yandex Market API ✅
- 89 Products | 76 Ready (85%)
- Real-time dashboard
- Product creation

### 6. Drizzle ORM Fixes ✅
Fixed all `select()` queries to use specific columns:
- `autonomousAIManager.ts`
- `marketplaceAIManager.ts`
- `autonomousProductManager.ts`

## Test Results (Jan 27, 2026)
| Feature | Status |
|---------|--------|
| Mobile Scanner | ✅ Working |
| Billing API | ✅ Working |
| Yandex Dashboard | ✅ 89 products |
| Backend Health | ✅ Healthy |
| Drizzle Errors | ✅ Fixed |

## API Endpoints Summary

### Mobile
- `POST /api/unified-scanner/analyze-base64`
- `POST /api/unified-scanner/full-process`

### Billing
- `GET /api/billing/calculate`
- `POST /api/billing/summary`

### Trends
- `GET /api/trends/top`
- `GET /api/trends/category/{category}`

### Yandex
- `GET /api/yandex/dashboard/status`
- `POST /api/yandex-market/create-product`

## Mobile App Build Options

### 1. EAS Cloud Build (Recommended)
```bash
cd /app/mobile
npx eas login
npx eas build --platform android --profile preview
```

### 2. Local Build
Requires: Java 17, Android SDK, NDK
```bash
cd /app/mobile/android
./gradlew assembleRelease
```

### 3. Expo Go (Testing)
```bash
cd /app/mobile
npx expo start
```

## Files Changed This Session
- `/app/backend/server.py` - analyze-base64, Trend Hunter API
- `/app/server/services/autonomousAIManager.ts` - Fixed select queries
- `/app/server/services/marketplaceAIManager.ts` - Fixed select queries
- `/app/server/services/autonomousProductManager.ts` - Fixed select queries
- `/app/mobile/BUILD_APK_INSTRUCTIONS.md` - New
- `/app/mobile/sellercloudx_mobile_full_package.zip` - New

## Upcoming Tasks

### P1
- [ ] EAS Cloud APK build
- [ ] 1688.com API integration

### P2
- [ ] Push notifications
- [ ] Video generation (Sora 2)

### P3
- [ ] Uzum Market integration
- [ ] Wildberries/Ozon

## Last Updated
January 27, 2026 - Drizzle Fixes + Mobile Build Package
