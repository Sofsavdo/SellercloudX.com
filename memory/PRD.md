# SellerCloudX - Product Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS for Uzbekistan sellers. The platform helps partners automate sales on Yandex Market (primary focus) with AI-driven product recognition, card generation, and analytics.

## Live Environment
- **Production URL**: https://sellercloudx.com
- **Preview URL**: https://vendorai.preview.emergentagent.com
- **Repository**: https://github.com/Sofsavdo/SellercloudX.com

## Architecture
```
/app
├── backend/            # Python/FastAPI: AI tasks, Yandex API (port 8001)
├── client/             # React/Vite Web Frontend (port 3000)
├── mobile/             # React Native/Expo Mobile App
├── server/             # Node.js/Express: Auth, Business Logic (not active)
├── shared/             # Drizzle schema (schema.ts)
├── migrations/         # SQL Migrations
└── railway.json        # Railway deployment config
```

## Completed Features (Jan 27, 2026)

### 1. Yandex Market Full API Integration ✅ NEW
- **API Connection**: OAuth token authentication working
- **6 Campaigns**: Premium Shop, Tashkent City Mall, Parfyum, Assalom, etc.
- **Product Creation**: Full API automation (FULL_API type)
- **Endpoints**:
  - `POST /api/yandex-market/test-connection` - API connection test
  - `POST /api/yandex-market/full-process` - AI card + price calculation
  - `POST /api/yandex-market/create-product` - Real product creation
  - `POST /api/yandex-market/get-campaigns` - List campaigns
- **Credentials**:
  - API Token: ACMA:OIjjTDFMnmBe7XOs7EqaWqdoXUS772aKqwqjXj6C:245e5a96
  - Campaign ID: 148650502
  - Business ID: 197529861

### 2. MXIK/IKPU Code Integration ✅ UPDATED
- **Service**: `/app/backend/ikpu_service.py`
- **250+ codes** from tasnif.soliq.uz
- **17-digit format** IKPU codes for Uzbekistan tax compliance
- **API Endpoints**:
  - `GET /api/mxik/status` - Database status
  - `GET /api/mxik/search?q=&lang=uz|ru` - Search codes
  - `GET /api/mxik/best-match?q=&category=` - Best match finder
  - `GET /api/mxik/validate/:code` - Code validation
- **Auto-detection** for products like smartphones, perfumes, etc.

### 3. AI Card Generator ✅ 
- **Service**: `/app/backend/yandex_service.py` - YandexCardGenerator
- **Features**:
  - SEO-optimized product names (Russian)
  - Full descriptions (6000 chars max)
  - Keywords and bullet points
  - Vendor codes and specifications
  - SEO Score calculation (85+)
- **Uses**: Emergent LLM Key (GPT-4o)

### 4. Price Calculator ✅
- **Automatic calculation** of:
  - Commission rates by category (8-15%)
  - Payout fees (1.3%-5.5% based on frequency)
  - Logistics costs (FBS/FBY/DBS)
  - Net profit and margin
- **Output**: min_price, optimal_price, max_price

### 5. 2026 Premium Pricing Model ✅
- **Premium**: $699 setup + $499/month + 4% revenue share
- **Individual**: Custom pricing ($1,599+ setup, 2%+ share)
- **Pricing Page**: `/pricing` with calculator and FAQ
- **Partner Dashboard**: "To'lovlar" section with debt tracking

### 6. AI Scanner ✅
- **Endpoint**: `POST /api/ai/scanner/recognize`
- Camera and file upload support
- Product recognition with Gemini

### 7. Trend Hunter ✅
- **Endpoint**: `GET /api/trends/opportunities`
- RapidAPI AliExpress DataHub integration

### 8. Click Payment ✅
- SERVICE_ID: 92585
- MERCHANT_ID: 54318
- Webhook endpoints configured

## Test Results (Jan 27, 2026)
- **Backend**: 100% (16/16 tests passed)
- **MXIK API**: All endpoints working
- **Yandex API**: Connection, creation, campaigns - all working
- **AI Service**: Enabled with Emergent LLM

## API Endpoints Summary

### Yandex Market (NEW)
- `POST /api/yandex-market/test-connection` - Test API connection
- `POST /api/yandex-market/full-process` - Full AI processing
- `POST /api/yandex-market/create-product` - Create real product
- `POST /api/yandex-market/get-campaigns` - List campaigns
- `GET /api/yandex/products` - Get products

### MXIK (UPDATED)
- `GET /api/mxik/status` - Database status (250 codes)
- `GET /api/mxik/search?q=&lang=uz|ru` - Search codes
- `GET /api/mxik/best-match?q=&category=` - Best match
- `GET /api/mxik/validate/:code` - Validate format

### Billing (2026)
- `GET /api/billing/revenue-share/summary`
- `POST /api/billing/revenue-share/start-trial`
- `POST /api/billing/revenue-share/record-payment`

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

## Yandex Campaigns
| ID | Domain | Type |
|----|--------|------|
| 148650502 | Premium Shop | FBS |
| 148880375 | Tashkent City Mall | FBS |
| 148880379 | Parfyum | FBS |
| 148880384 | Assalom | FBS |
| 148908360 | Tashkent City Mall 2 | FBY |
| 148961478 | Tashkent City Mall 3 | FBS |

## MXIK Built-in Codes (Common Categories)
```
26121900 - Smartfonlar (Samsung: 26121900200000000)
26201100 - Noutbuklar
26401100 - Quloqchinlar
20420100 - Atirlar/Parfyumeriya
14130000 - Kiyim-kechak
27521100 - Muzlatgichlar
27511100 - Kir yuvish mashinalari
47190000 - Boshqa chakana savdo (default)
```

## Upcoming Tasks (P0-P2)

### P0 - Critical ✅ DONE
- [x] Yandex Market API integration
- [x] MXIK code integration from tasnif.soliq.uz
- [x] AI card generation with Emergent LLM
- [x] Full product creation via API

### P1 - High Priority
- [ ] Nano Banana infographic generation (6 images)
- [ ] Video generation for product cards (8 seconds)
- [ ] Revenue share calculation automation
- [ ] Partner blocking for overdue payments

### P2 - Medium Priority
- [ ] Uzum Market integration
- [ ] Mobile app update with new API
- [ ] Push notifications
- [ ] Real-time chat

## Future Tasks (P3-P4)

### P3
- [ ] Wildberries/Ozon integration
- [ ] Biometric login
- [ ] Barcode scanning

### P4
- [ ] Advanced analytics
- [ ] CI/CD pipeline
- [ ] API documentation (Swagger)

## Technical Notes

### Yandex API Requirements
- Images: 1-30 required
- Dimensions: length, width, height (cm) - required
- Weight: in kg - required
- Price: Integer only (no decimals)
- Description: Max 6000 chars

### IKPU Code Format
- 17 digits total
- Format: GGCCCPPPSSSBBBAAT
  - GG: Group (sector)
  - CCC: Class
  - PPP: Position
  - SSS: Sub-position
  - BBB: Brand
  - AAT: Attributes

## Last Updated
January 27, 2026 - Yandex Market Full Integration Complete

## Contact
- Support Telegram: @sellercloudx_support
- Email: sales@sellercloudx.com
