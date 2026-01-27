# SellerCloudX - Product Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS for Uzbekistan sellers. The platform helps partners automate sales on Yandex Market (primary focus) with AI-driven product recognition, card generation, and analytics.

## Live Environment
- **Production URL**: https://sellercloudx.com
- **Preview URL**: https://vendorai.preview.emergentagent.com

## Architecture
```
/app
├── backend/            # Python/FastAPI: AI tasks, Yandex API (port 8001)
├── client/             # React/Vite Web Frontend (port 3000)
├── mobile/             # React Native/Expo Mobile App
├── server/             # Node.js/Express: Auth, Business Logic
├── shared/             # Drizzle schema
├── migrations/         # SQL Migrations
```

## Completed Features (Jan 27, 2026)

### 1. Yandex Market Full API Integration ✅
- **API Connection**: OAuth token authentication
- **6 Campaigns**: 80 mahsulot, 76 sotuvga tayyor (95%)
- **Product Creation**: Full API automation (FULL_API type)
- **Credentials**:
  - API Token: ACMA:OIjjTDFMnmBe7XOs7EqaWqdoXUS772aKqwqjXj6C:245e5a96
  - Campaign ID: 148650502
  - Business ID: 197529861

### 2. Real-Time Status Tracking ✅ NEW
- **Dashboard API**: `/api/yandex/dashboard/status`
  - Total: 80 mahsulot
  - Ready: 76 (95%)
  - Moderation: 0
  - Rejected: 0
- **Offer Status**: `/api/yandex/offer/{offer_id}/status`
  - ✅ Sotuvga tayyor
  - ⏳ Moderatsiyada
  - 📝 Kontent kerak
  - ❌ Rad etildi
- **Partner Dashboard**: `/api/yandex/partner/dashboard`
  - Multi-tenant support
  - Custom OAuth tokens
- **Frontend**: `/yandex-dashboard` sahifasi

### 3. Nano Banana Infographic Generator ✅ NEW
- **Model**: Gemini 3 Pro Image Preview
- **Endpoint**: `/api/ai/generate-infographics`
- **Features**:
  - 6 ta professional rasm generatsiyasi
  - ~17 sekund per rasm
  - ImgBB ga yuklash (permanent URLs)
  - Marketplace-ready infographics
- **Sample**: https://i.ibb.co/d4ysg7Wr/2fdb71bf8bfb.jpg

### 4. MXIK/IKPU Code Integration ✅
- **250+ codes** from tasnif.soliq.uz
- **17-digit format** for tax compliance
- **API Endpoints**:
  - `GET /api/mxik/status`
  - `GET /api/mxik/search?q=&lang=uz|ru`
  - `GET /api/mxik/best-match?q=&category=`

### 5. AI Card Generator ✅
- SEO-optimized product names
- Full descriptions (6000 chars max)
- Keywords and specifications
- SEO Score: 85+

### 6. Price Calculator ✅
- Commission rates by category (8-15%)
- Payout fees (1.3%-5.5%)
- Logistics costs (FBS/FBY/DBS)
- Net profit calculation

### 7. 2026 Premium Pricing Model ✅
- **Premium**: $699 setup + $499/month + 4% revenue share
- **Individual**: Custom pricing
- **Partner Dashboard**: "To'lovlar" section

## Test Results (Jan 27, 2026)
- **Backend**: 100% (10/10 tests passed)
- **MXIK API**: All working
- **Yandex API**: All working
- **Nano Banana**: Working (~17s/image)
- **Real-time Status**: Working

## API Endpoints Summary

### Yandex Market
- `POST /api/yandex-market/test-connection`
- `POST /api/yandex-market/full-process`
- `POST /api/yandex-market/create-product`
- `GET /api/yandex/dashboard/status` ← NEW
- `GET /api/yandex/offer/{offer_id}/status` ← NEW
- `POST /api/yandex/partner/dashboard` ← NEW

### AI Services
- `POST /api/ai/generate-infographics` ← NEW (Nano Banana)
- `POST /api/ai/scanner/recognize`
- `GET /api/ai/status`

### MXIK
- `GET /api/mxik/status`
- `GET /api/mxik/search?q=&lang=uz|ru`
- `GET /api/mxik/best-match?q=&category=`

## Yandex Market Statistics
| Metric | Value |
|--------|-------|
| Jami mahsulotlar | 80 |
| Sotuvga tayyor | 76 (95%) |
| Moderatsiyada | 0 |
| Kontent kerak | 0 |
| Rad etildi | 0 |
| Kampaniyalar | 6 |

## Upcoming Tasks (P1)

### Revenue Share Automation
- [ ] Oylik savdo sinxronizatsiyasi (cron job)
- [ ] Revenue share hisoblash
- [ ] Avtomatik bloklash (overdue payments)

### Video Generation
- [ ] Sora 2 integration
- [ ] 8 soniyalik mahsulot videosi

### Mobile App Update
- [ ] Yangi API bilan integratsiya
- [ ] Real-time status dashboard

## Future Tasks (P2-P4)

### P2
- [ ] Uzum Market integratsiyasi
- [ ] Push notifications

### P3
- [ ] Wildberries/Ozon integration
- [ ] Advanced analytics

### P4
- [ ] CI/CD pipeline
- [ ] API documentation (Swagger)

## Last Updated
January 27, 2026 - Real-time Status + Nano Banana Integration Complete

## Contact
- Telegram: @sellercloudx_support
- Email: sales@sellercloudx.com
