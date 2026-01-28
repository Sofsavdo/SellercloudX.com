# SellerCloudX - Production Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS for Yandex Market, Uzum, Wildberries, Ozon.

## Live URLs
- **Preview**: https://cloudmarket-4.preview.emergentagent.com
- **Production**: https://sellercloudx.com (Railway)

## Production Status: ✅ P0 FIXES COMPLETED (28-01-2026)

### P0 Critical Fixes Applied
1. ✅ **Chat System Schema Fix** - PostgreSQL `chat_rooms` jadvalida `partner_id` ustuni yo'q edi. `participants` (jsonb) va `name` field orqali ishlashga o'tkazildi
2. ✅ **Invalid Date Fix** - `utc_now()` helper funksiyasi yaratildi - PostgreSQL uchun naive datetime qaytaradi
3. ✅ **get_pool() Function** - Server.py da pool'ga to'g'ri kirish uchun funksiya qo'shildi
4. ✅ **Blog/Referrals Endpoints** - 404 xatolar hal qilindi - yangi endpoint'lar qo'shildi
5. ✅ **Blog is_active Column** - Fallback query qo'shildi

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

### API Endpoints (Python Backend)

#### Authentication
- `POST /api/auth/login` ✅
- `POST /api/auth/register` ✅
- `GET /api/auth/me` ✅
- `POST /api/auth/logout` ✅

#### Admin
- `GET /api/admin/partners` ✅
- `PUT /api/admin/partners/:id/approve` ✅
- `POST /api/admin/partners/:id/activate` ✅
- `GET /api/admin/business-metrics` ✅
- `GET /api/admin/tier-upgrade-requests` ✅
- `GET /api/admin/blog/posts` ✅

#### Partner
- `GET /api/partner/profile` ✅
- `PUT /api/partner/profile` ✅
- `GET /api/partner/tariff` ✅
- `POST /api/partner/marketplaces/connect` ✅
- `GET /api/partner/products` ✅
- `GET /api/partner/referrals/dashboard` ✅ (NEW)
- `GET /api/partner/referrals` ✅ (NEW)

#### Chat (P0 Fixed)
- `GET /api/chat/room` ✅
- `GET /api/chat/rooms` ✅
- `GET /api/chat/messages` ✅
- `POST /api/chat/send` ✅

#### Blog (NEW)
- `GET /api/blog/posts` ✅
- `GET /api/blog/posts/:id` ✅
- `POST /api/admin/blog/posts` ✅

#### Trends & Analytics
- `GET /api/trends/hunter` ✅
- `GET /api/trends/top` ✅
- `GET /api/trends/opportunities` ✅
- `GET /api/trends/forecasts` ✅
- `GET /api/analytics` ✅ (NEW)
- `GET /api/analytics/overview` ✅ (NEW)
- `GET /api/analytics/partner/:id` ✅

## Database Configuration
- **Production (Railway)**: PostgreSQL via `DATABASE_URL`
- **Preview/Development**: PostgreSQL (same DATABASE_URL)
- **Auto-detection**: database.py automatically uses PostgreSQL when DATABASE_URL set

### PostgreSQL Schema Notes
- `chat_rooms`: Uses `participants` (jsonb) and `name` fields instead of `partner_id`
- `chat_messages`: Has `partner_id`, `role`, `content`, `metadata`, `created_at`
- DateTime: Use `utc_now()` helper for naive datetime (PostgreSQL compatibility)

## Architecture
```
/app
├── backend/            # Python/FastAPI (port 8001) - PRIMARY
│   ├── server.py       # 6300+ lines - All API endpoints
│   ├── database.py     # PostgreSQL dual mode with utc_now() helper
│   └── tests/          # Pytest tests
├── client/             # React/Vite - Web Frontend
├── server/             # Node.js - Proxy to Python backend
└── mobile/             # React Native/Expo
```

## 2026 Pricing Model
```
Premium: $699 setup + $499/month + 4% revenue share + 60-day guarantee
Individual: Custom pricing + 2% from + Personal manager
```

## Test Credentials
- **Admin**: admin / admin123
- **Partner**: partner / partner123

## Mobile App v1.0.7
**APK**: https://expo.dev/artifacts/eas/xcgPHV3rXDKUu7f8R1guP.apk

## Key Files Modified (P0 Fixes)
1. `/app/backend/server.py` - Blog endpoints, blog is_active fallback
2. `/app/backend/database.py` - utc_now() helper, get_pool(), chat_rooms schema fix

## Test Reports
- `/app/test_reports/iteration_17.json` - 100% pass rate (19/19 tests)

---

## Backlog (P1-P3)

### P1 - High Priority
- [ ] AI Scanner - Real API integration (currently uses mock)
- [ ] Marketplace Integration - Real validation (test API calls)
- [ ] OpenAI API Key - EMERGENT_LLM_KEY integration for Trend Hunter AI

### P2 - Medium Priority
- [ ] 1688.com API for China products
- [ ] Video generation for product cards
- [ ] Full Node.js to Python migration

### P3 - Low Priority
- [ ] API documentation (Swagger)
- [ ] Unit/Integration tests coverage
- [ ] Uzum Market full automation

---

## Changelog

### 28-01-2026 - P0 Fixes
- Fixed chat_rooms PostgreSQL schema compatibility
- Added utc_now() helper for naive datetime
- Added get_pool() function for server.py pool access
- Added /api/partner/referrals/dashboard endpoint
- Added /api/analytics endpoint
- Added /api/blog/posts endpoints
- Fixed blog is_active column fallback
- All 19 backend tests passing (100%)
