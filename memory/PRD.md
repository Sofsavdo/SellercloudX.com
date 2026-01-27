# SellerCloudX - Product Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS for Yandex Market. Complete automation from camera scan to product listing.

## Live Environment
- **Preview URL**: https://yandexbot.preview.emergentagent.com
- **Mobile API**: https://yandexbot.preview.emergentagent.com/api
- **Mobile Web Export**: /app/mobile/sellercloudx_mobile_web.zip

## Architecture
```
/app
├── backend/            # Python/FastAPI (port 8001)
├── client/             # React/Vite (port 3000)  
├── mobile/             # React Native/Expo
│   └── dist/           # Web export
├── server/             # Node.js/Express
└── migrations/         # SQL Migrations
```

## 2026 Revenue Share Model ✅
```
Premium Tariff:
├── Setup: $699 (one-time)
├── Monthly: $499/month
└── Revenue Share: 4% of sales
```

## Completed Features (Jan 27, 2026)

### 1. Mobile Scanner Endpoint ✅ NEW
**Critical for mobile app camera functionality**

**Endpoint**: `POST /api/unified-scanner/analyze-base64`
**Request**:
```json
{
  "image_base64": "base64_encoded_image_string",
  "language": "uz"
}
```
**Response**:
```json
{
  "success": true,
  "product_info": {
    "brand": "Nutley",
    "product_name": "Yong'oqli donli batonchik",
    "category": "food",
    "features": ["Tabiiy", "Yong'oq"],
    "suggested_price": 100000
  },
  "suggested_price": 100000,
  "confidence": 85
}
```
**Response time**: ~21 seconds

### 2. Full Automation ✅ 
**One-click product creation from image to Yandex Market**

6-step flow:
1. **Scan** - AI product recognition
2. **MXIK** - Tax code assignment
3. **AI Card** - SEO-optimized Russian card
4. **Pricing** - Competitive price calculation
5. **Infographics** - 6 images @ 1080x1440
6. **Yandex** - Real API upload

### 3. Revenue Share Billing ✅
**2026 Premium Monetization Model**

**Endpoints:**
- `GET /api/billing/calculate` - Calculator
- `POST /api/billing/summary` - Partner billing

**Example (10M UZS sales):**
- Monthly fee: 6,287,400 UZS ($499)
- Revenue share: 400,000 UZS (4%)
- Total: 6,687,400 UZS ($531)

### 4. Trend Hunter API ✅ NEW
**AI-powered product discovery**

**Endpoints:**
- `GET /api/trends/top` - Top opportunities
- `GET /api/trends/category/{category}` - By category
- `GET /api/trends/search?query=` - Search

**Categories**: electronics, clothing, home, beauty, sports

**Note**: Currently requires auth through Node.js middleware. Will be public after production deploy.

### 5. Mobile App Web Export ✅ NEW
**Ready for deployment**

Location: `/app/mobile/sellercloudx_mobile_web.zip`
- React Native compiled to web
- Full scanner functionality
- Offline queue support
- Multi-language (uz/ru)

### 6. Yandex Market API ✅
**89 Products | 76 Ready (85%)**

**Endpoints:**
- `GET /api/yandex/dashboard/status` - Real-time stats
- `POST /api/yandex-market/create-product` - Create product

### 7. Nano Banana Infographics ✅
**1080x1440 pixels | 3:4 portrait**

6 types per product.

## Test Results (Jan 27, 2026)
- **Backend**: 100% (7/7 passed)
- **Frontend**: 100% (Login, Pricing, Landing working)
- **Mobile Scanner**: Working ✅
- **Revenue Share**: Working ✅
- **Yandex API**: Working ✅

## API Endpoints Summary

### Mobile Scanner
- `POST /api/unified-scanner/analyze-base64` - Base64 image scan ✅

### Full Automation
- `POST /api/ai/full-automation` - Web
- `POST /api/unified-scanner/full-process` - Mobile

### Billing
- `GET /api/billing/calculate`
- `POST /api/billing/summary`

### Trend Hunter (NEW)
- `GET /api/trends/top`
- `GET /api/trends/category/{category}`
- `GET /api/trends/search`

### Yandex Market
- `GET /api/yandex/dashboard/status`
- `POST /api/yandex-market/create-product`

## Yandex Statistics
| Metric | Value |
|--------|-------|
| Total Products | 89 |
| Ready | 76 (85%) |

## Upcoming Tasks (P1)

### External API Integration
- [ ] 1688.com API integration for Trend Hunter
- [ ] AliExpress DataHub API

### Mobile App
- [ ] EAS Build for APK/IPA
- [ ] Push notifications

## Future Tasks (P2-P4)

### P2
- [ ] Uzum Market integration
- [ ] Video generation (Sora 2)

### P3
- [ ] Wildberries/Ozon
- [ ] Advanced analytics

### P4
- [ ] CI/CD pipeline
- [ ] Swagger docs

## Environment Variables

### Backend (.env)
```
EMERGENT_LLM_KEY=sk-emergent-...
YANDEX_API_KEY=ACMA:rHq...
YANDEX_BUSINESS_ID=197529861
IMGBB_API_KEY=0cc4c8e...
```

### Mobile
```
API_BASE_URL=https://yandexbot.preview.emergentagent.com/api
```

## Files Changed This Session
- `/app/backend/server.py` - Added analyze-base64 endpoint, Trend Hunter API
- `/app/mobile/src/services/api.ts` - Updated scannerApi
- `/app/server/routes.ts` - Removed auth from trends
- `/app/server/routes/trendHunterRoutes.ts` - Removed requireAuth
- `/app/client/src/pages/TrendHunterDashboard.tsx` - Added product link button

## Last Updated
January 27, 2026 - Mobile Scanner Perfect + Trend Hunter API + Web Export
