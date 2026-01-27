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

## Completed Features (Jan 27, 2026)

### 1. Full Automation ✅ 
**One-click product creation from image to Yandex Market**

**Web Endpoint**: `POST /api/ai/full-automation`
**Mobile Endpoint**: `POST /api/unified-scanner/full-process`

6-step flow:
1. **Scan** - AI product recognition
2. **MXIK** - Tax code assignment
3. **AI Card** - SEO-optimized Russian card
4. **Pricing** - Competitive price calculation
5. **Infographics** - 6 images @ 1080x1440
6. **Yandex** - Real API upload

### 2. Revenue Share Billing ✅ NEW
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

### 3. Mobile App Integration ✅ UPDATED
**Real API - No Mock Data**

**Files:**
- `/app/mobile/src/services/api.ts`
- `/app/mobile/src/utils/constants.ts`

**Endpoints used by mobile:**
- `/api/unified-scanner/full-process` - Full automation
- `/api/ai/scan-from-url` - URL scan
- `/api/billing/summary` - Partner billing

**Flow:**
Camera → AI Scan → MXIK → Price → Card → Yandex Upload

### 4. Yandex Market API ✅
**84 Products | 77 Ready (92%)**

**Endpoints:**
- `GET /api/yandex/dashboard/status` - Real-time stats
- `GET /api/yandex/offer/{id}/status` - Product status
- `POST /api/yandex-market/create-product` - Create product

**Credentials:**
- Business ID: 197529861
- 6 Campaigns active

### 5. Nano Banana Infographics ✅
**1080x1440 pixels | 3:4 portrait**

6 types per product:
1. Hero with floating ingredients
2. Benefits with icons
3. Composition
4. Usage instructions
5. Purity badges
6. Lifestyle

### 6. MXIK/IKPU Codes ✅
**250+ codes from tasnif.soliq.uz**

Common codes:
- 10890000 - Food/Snacks
- 20420100 - Cosmetics/Perfume
- 26121900 - Electronics
- 14130000 - Clothing

## Test Results (Jan 27, 2026)
- **Backend**: 100% (14/14 passed)
- **Revenue Share**: Working
- **Mobile Flow**: Working
- **Yandex API**: Working

## API Endpoints Summary

### Full Automation
- `POST /api/ai/full-automation` - Web
- `POST /api/unified-scanner/full-process` - Mobile
- `POST /api/ai/scan-from-url` - URL scan

### Billing (NEW)
- `GET /api/billing/calculate`
- `POST /api/billing/summary`
- `POST /api/billing/invoice`

### Yandex Market
- `GET /api/yandex/dashboard/status`
- `GET /api/yandex/offer/{id}/status`
- `POST /api/yandex-market/create-product`

### AI Services
- `POST /api/ai/generate-infographics`

## Revenue Share Model
```
Premium Tariff:
├── Setup: $699 (one-time)
├── Monthly: $499/month
└── Revenue Share: 4% of sales

Individual Tariff:
├── Custom contract
└── Minimum 2% share
```

## Yandex Statistics
| Metric | Value |
|--------|-------|
| Total Products | 84 |
| Ready | 77 (92%) |
| Campaigns | 6 |
| New Today | 5 |

## Upcoming Tasks (P1)

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

## Last Updated
January 27, 2026 - Revenue Share & Mobile Integration Complete

## Contact
- Telegram: @sellercloudx_support
- Email: sales@sellercloudx.com
