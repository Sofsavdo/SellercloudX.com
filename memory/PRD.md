# SellerCloudX - Product Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS. Complete automation from camera scan to Yandex Market listing with real API integration.

## Live Environment
- **Preview URL**: https://yandexbot.preview.emergentagent.com
- **Mobile API**: https://yandexbot.preview.emergentagent.com/api

## Architecture
```
/app
├── backend/            # Python/FastAPI (port 8001)
├── client/             # React/Vite (port 3000)  
├── mobile/             # React Native/Expo
├── server/             # Node.js/Express
└── migrations/         # SQL Migrations
```

## 2026 Revenue Share Model
```
Premium Tariff:
├── Setup: $699 (one-time)
├── Monthly: $499/month
└── Revenue Share: 4% of sales

Individual Tariff:
├── Custom contract
└── Minimum 2% share
```

## Completed Features (Jan 27, 2026)

### 1. Full Automation ✅ 
**One-click product creation from image to Yandex Market**

**Web Endpoint**: `POST /api/ai/full-automation`
**Mobile Endpoint**: `POST /api/unified-scanner/full-process`
**Mobile Scanner**: `POST /api/unified-scanner/analyze-base64` ✅ NEW

6-step flow:
1. **Scan** - AI product recognition
2. **MXIK** - Tax code assignment
3. **AI Card** - SEO-optimized Russian card
4. **Pricing** - Competitive price calculation
5. **Infographics** - 6 images @ 1080x1440
6. **Yandex** - Real API upload

### 2. Mobile Scanner Endpoint ✅ NEW (Jan 27, 2026)
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
    "model": "Yong'oqli batonchik",
    "product_name": "Yong'oqli donli batonchik",
    "category": "food",
    "features": ["Tabiiy", "Yong'oq", "Protein"],
    "suggested_price": 100000
  },
  "suggested_price": 100000,
  "confidence": 85
}
```

### 3. Revenue Share Billing ✅
**2026 Premium Monetization Model**

**Pricing:**
- Setup: $699 (one-time)
- Monthly: $499/month
- Revenue Share: 4% of sales

**Endpoints:**
- `GET /api/billing/calculate` - Calculator
- `POST /api/billing/summary` - Partner billing with Yandex sales
- `POST /api/billing/invoice` - Invoice generation

**Features:**
- USD to UZS conversion (rate: 12,600)
- 7-day grace period
- Auto-blocking for overdue
- Click/Bank transfer payments

**Example (10M UZS sales):**
- Monthly fee: 6,287,400 UZS ($499)
- Revenue share: 400,000 UZS ($32)
- Total: 6,687,400 UZS ($531)

### 4. Mobile App Integration ✅ UPDATED
**Real API - No Mock Data**

**Files:**
- `/app/mobile/src/services/api.ts`
- `/app/mobile/src/utils/constants.ts`
- `/app/mobile/src/screens/ScannerScreen.tsx`

**Endpoints used by mobile:**
- `/api/unified-scanner/analyze-base64` - Image scan (NEW)
- `/api/unified-scanner/full-process` - Full automation
- `/api/ai/scan-from-url` - URL scan
- `/api/billing/summary` - Partner billing

**Flow:**
Camera → AI Scan → MXIK → Price → Card → Yandex Upload

### 5. Yandex Market API ✅
**89 Products | 76 Ready (85%)**

**Endpoints:**
- `GET /api/yandex/dashboard/status` - Real-time stats
- `GET /api/yandex/offer/{id}/status` - Product status
- `POST /api/yandex-market/create-product` - Create product

**Credentials:**
- Business ID: 197529861
- Token: ACMA:rHqOiebT6JY1JlkEN0rdYdZn2SkO6iC2V6HvLE22:1806b892

### 6. Nano Banana Infographics ✅
**1080x1440 pixels | 3:4 portrait**

6 types per product:
1. Hero with floating ingredients
2. Benefits with icons
3. Composition
4. Usage instructions
5. Purity badges
6. Lifestyle

### 7. MXIK/IKPU Codes ✅
**250+ codes from tasnif.soliq.uz**

Common codes:
- 10890000 - Food/Snacks
- 20420100 - Cosmetics/Perfume
- 26121900 - Electronics
- 14130000 - Clothing

## Test Results (Jan 27, 2026)
- **Backend**: 100% (9/9 passed)
- **Mobile Scanner**: Working ✅
- **Revenue Share**: Working ✅
- **Yandex API**: Working ✅

## API Endpoints Summary

### Mobile Scanner (NEW)
- `POST /api/unified-scanner/analyze-base64` - Base64 image scan

### Full Automation
- `POST /api/ai/full-automation` - Web
- `POST /api/unified-scanner/full-process` - Mobile
- `POST /api/ai/scan-from-url` - URL scan

### Billing
- `GET /api/billing/calculate`
- `POST /api/billing/summary`
- `POST /api/billing/invoice`

### Yandex Market
- `GET /api/yandex/dashboard/status`
- `GET /api/yandex/offer/{id}/status`
- `POST /api/yandex-market/create-product`

### AI Services
- `GET /api/ai/status`
- `POST /api/ai/generate-infographics`

## Yandex Statistics
| Metric | Value |
|--------|-------|
| Total Products | 89 |
| Ready | 76 (85%) |
| Campaigns | 6 |

## Upcoming Tasks (P1)

### Trend Hunter Enhancement
- [ ] Fix AliExpress API integration
- [ ] Add direct product links
- [ ] 1688.com integration (user requested)

### Video Generation
- [ ] Sora 2 integration
- [ ] 8-second product videos

### Cron Jobs
- [ ] Monthly sales sync
- [ ] Auto-billing generation
- [ ] Overdue blocking

## Future Tasks (P2-P4)

### P2
- [ ] Uzum Market integration
- [ ] Push notifications

### P3
- [ ] Wildberries/Ozon
- [ ] Advanced analytics

### P4
- [ ] CI/CD pipeline
- [ ] Swagger docs

## Technical Notes

### Image Specs
- Resolution: 1080x1440 pixels
- Aspect: 3:4 portrait
- Max: 10 per product

### Revenue Calculation
```python
monthly_fee_uzs = 499 * 12600  # $499 at rate 12,600
revenue_share = total_sales * 0.04  # 4%
total_debt = monthly_fee_uzs + revenue_share
```

### Mobile API Base
```
https://yandexbot.preview.emergentagent.com/api
```

### Environment Variables (Backend)
```
EMERGENT_LLM_KEY=sk-emergent-...
YANDEX_API_KEY=ACMA:rHq...
YANDEX_BUSINESS_ID=197529861
IMGBB_API_KEY=0cc4c8e...
```

## Last Updated
January 27, 2026 - Mobile Scanner Endpoint Added & Tested

## Contact
- Telegram: @sellercloudx_support
- Email: sales@sellercloudx.com
