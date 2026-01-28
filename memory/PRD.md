# SellerCloudX - Production Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS for Yandex Market, Uzum, Wildberries, Ozon.

## Live URLs
- **Preview**: https://cloudmarket-4.preview.emergentagent.com
- **Production**: https://sellercloudx.com (Railway)

## Production Status: ✅ YANDEX INTEGRATION COMPLETE (28-01-2026)

### P0 Critical Fixes Applied
1. ✅ **Chat System Schema Fix** - PostgreSQL `chat_rooms` jadvalida `partner_id` ustuni yo'q edi. `participants` (jsonb) va `name` field orqali ishlashga o'tkazildi
2. ✅ **Invalid Date Fix** - `utc_now()` helper funksiyasi yaratildi - PostgreSQL uchun naive datetime qaytaradi
3. ✅ **get_pool() Function** - Server.py da pool'ga to'g'ri kirish uchun funksiya qo'shildi
4. ✅ **Blog/Referrals Endpoints** - 404 xatolar hal qilindi - yangi endpoint'lar qo'shildi

### P1 Yandex Integration ✅ COMPLETE
1. ✅ **Real API Validation** - `/api/partner/marketplaces/connect` endi haqiqiy Yandex API bilan test qiladi
2. ✅ **6 Do'kon Ulangan** - Premium Shop, Tashkent City Mall, Parfyum, Assalom, Tashkent City Mall 2
3. ✅ **To'liq Avtomatlashtirish** - scan → detect → price calc → AI card → upload to Yandex
4. ✅ **Mahsulot Yaratish** - REAL API orqali mahsulot Yandex Market'da yaratiladi (FULL_API automation)
5. ✅ **AI Scanner** - Ikkala format (`image` va `image_base64`) qo'llab-quvvatlanadi

### Working Features (Tested 100%)
- ✅ **Authentication** - Login/Register (Admin & Partner)
- ✅ **Admin Panel** - Partners list, statistics, approve/activate
- ✅ **Partner Dashboard** - Full dashboard with all metrics
- ✅ **Chat System** - Chat rooms and messaging (P0 fixed)
- ✅ **Referrals Dashboard** - Partner referral system
- ✅ **Blog System** - Blog posts CRUD
- ✅ **Analytics** - General and partner analytics
- ✅ **Trend Hunter** - Real trending products from API
- ✅ **Business Metrics** - Admin dashboard metrics
- ✅ **Yandex Market Integration** - REAL API, product creation, full chain

### Yandex Market API Endpoints (VERIFIED)

#### Marketplace Connection
- `POST /api/partner/marketplaces/connect` ✅ (REAL validation)
- `GET /api/partner/marketplaces` ✅

#### Yandex Market
- `POST /api/yandex-market/test-connection` ✅
- `POST /api/yandex-market/get-campaigns` ✅ (6 campaigns)
- `POST /api/yandex-market/full-process` ✅ (full chain)
- `POST /api/yandex-market/create-product` ✅ (REAL API)
- `GET /api/yandex-market/rules` ✅
- `POST /api/yandex-market/calculate-price` ✅

#### Unified Scanner
- `POST /api/unified-scanner/analyze-base64` ✅ (dual format)
- `POST /api/unified-scanner/full-process` ✅
- `POST /api/unified-scanner/scan-image` ✅

## Database Configuration
- **Production (Railway)**: PostgreSQL via `DATABASE_URL`
- **Auto-detection**: database.py automatically uses PostgreSQL when DATABASE_URL set

### PostgreSQL Schema Notes
- `chat_rooms`: Uses `participants` (jsonb) and `name` fields instead of `partner_id`
- `chat_messages`: Has `partner_id`, `role`, `content`, `metadata`, `created_at`
- `marketplace_integrations`: Uses `api_credentials` (jsonb) for storing credentials
- DateTime: Use `utc_now()` helper for naive datetime (PostgreSQL compatibility)

## Architecture
```
/app
├── backend/            # Python/FastAPI (port 8001) - PRIMARY
│   ├── server.py       # 6500+ lines - All API endpoints
│   ├── database.py     # PostgreSQL dual mode with utc_now() helper
│   ├── yandex_service.py # YandexMarketAPI class
│   └── tests/          # Pytest tests
├── client/             # React/Vite - Web Frontend
├── server/             # Node.js - Proxy to Python backend
└── mobile/             # React Native/Expo
```

## Yandex Market Integration Details
- **API Base:** https://api.partner.market.yandex.ru
- **Auth:** Api-Key header (NOT OAuth prefix)
- **Business ID:** 197529861
- **Connected Shops:** 6 (Premium Shop, Tashkent City Mall, Parfyum, Assalom, Tashkent City Mall 2)
- **Automation Type:** FULL_API (product created via API, not manual)

## 2026 Pricing Model
```
Premium: $699 setup + $499/month + 4% revenue share + 60-day guarantee
Individual: Custom pricing + 2% from + Personal manager
```

## Test Credentials
- **Admin**: admin / admin123
- **Partner**: partner / partner123
- **Yandex API Key:** ACMA:rHqOiebT6JY1JlkEN0rdYdZn2SkO6iC2V6HvLE22:1806b892

## Mobile App v1.0.7
**APK**: https://expo.dev/artifacts/eas/xcgPHV3rXDKUu7f8R1guP.apk

## Test Reports
- `/app/test_reports/iteration_17.json` - 100% pass rate (19/19 tests) - P0 fixes
- `/app/test_reports/iteration_18.json` - 100% pass rate (14/14 tests) - Yandex integration

---

## Backlog (P2-P3)

### P2 - Medium Priority
- [ ] Uzum Market integration (assisted automation - no full API)
- [ ] Video generation for product cards
- [ ] 1688.com API for China products
- [ ] Full Node.js to Python migration

### P3 - Low Priority
- [ ] API documentation (Swagger)
- [ ] Unit/Integration tests coverage
- [ ] Wildberries/Ozon integrations

---

## Changelog

### 28-01-2026 - Yandex Integration Complete
- Added REAL Yandex API validation to marketplace connect
- Connected 6 shops via API (Premium Shop, Tashkent City Mall, etc.)
- Product creation via FULL_API automation working
- Full chain verified: scan → detect → price calc → AI card → upload
- Fixed marketplace_integrations to use api_credentials field
- AI Scanner supports both image and image_base64 formats
- All 14 Yandex integration tests passing (100%)

### 28-01-2026 - P0 Fixes
- Fixed chat_rooms PostgreSQL schema compatibility
- Added utc_now() helper for naive datetime
- Added get_pool() function for server.py pool access
- Added /api/partner/referrals/dashboard endpoint
- Added /api/analytics endpoint
- Added /api/blog/posts endpoints
- All 19 backend tests passing (100%)
