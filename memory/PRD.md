# SellerCloudX - Production Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS for Yandex Market, Uzum, Wildberries, Ozon.

## Live URLs
- **Preview**: https://sellercloudx.preview.emergentagent.com
- **Production**: https://sellercloudx.com (Railway)

## Production Status: ✅ WEB + MOBILE UNIFIED (31-01-2026)

### P0 Critical Fixes Applied (31-01-2026 - Session 2)
1. ✅ **Partner User Seeding** - `database.py` ga partner user seed qo'shildi (partner/partner123)
2. ✅ **Delete Endpoint Bug** - `get_pool()` sync/async muammosi tuzatildi
3. ✅ **Mobile + Web Unified** - Ikkalasi bir xil API endpoint ishlatadi

### P0 Critical Fixes Applied (31-01-2026 - Session 1)
1. ✅ **AI Scanner Tuzatildi** - Yagona `DashboardAIScanner` komponenti, `API_BASE` to'g'rilandi
2. ✅ **Marketplace Integration** - Direct API endpoints qo'shildi (POST, TEST, DELETE)
3. ✅ **Trend Hunter Yaxshilandi** - "1688 da qidirish", "Alibaba", "Mahalliy narx" tugmalari

### Previous P0 Fixes
1. ✅ **Chat System Schema Fix** - PostgreSQL `chat_rooms` jadvalida `partner_id` ustuni yo'q edi
2. ✅ **Invalid Date Fix** - `utc_now()` helper funksiyasi yaratildi
3. ✅ **get_pool() Function** - Server.py da pool'ga to'g'ri kirish uchun funksiya qo'shildi
4. ✅ **Blog/Referrals Endpoints** - 404 xatolar hal qilindi

### P1 Yandex Integration ✅ COMPLETE
1. ✅ **Real API Validation** - `/api/partner/marketplaces/connect` endi haqiqiy Yandex API bilan test qiladi
2. ✅ **6 Do'kon Ulangan** - Premium Shop, Tashkent City Mall, Parfyum, Assalom, Tashkent City Mall 2
3. ✅ **To'liq Avtomatlashtirish** - scan → detect → price calc → AI card → upload to Yandex
4. ✅ **Mahsulot Yaratish** - REAL API orqali mahsulot Yandex Market'da yaratiladi (FULL_API automation)
5. ✅ **AI Scanner** - Ikkala format (`image` va `image_base64`) qo'llab-quvvatlanadi

## Test Results (31-01-2026): ✅ 100% PASS
- **Backend**: 15/15 tests passed
- **Frontend**: 7/7 features verified
- **Credentials**: admin/admin123, partner/partner123

### Working Features (Tested 100%)
- ✅ **Authentication** - Login/Register (Admin & Partner)
- ✅ **Admin Panel** - Partners list, statistics, approve/activate
- ✅ **Partner Dashboard** - Full dashboard with all metrics
- ✅ **Chat System** - Chat rooms and messaging (P0 fixed)
- ✅ **Referrals Dashboard** - Partner referral system
- ✅ **Blog System** - Blog posts CRUD
- ✅ **Analytics** - General and partner analytics
- ✅ **Trend Hunter** - Trending products + action buttons (1688, Alibaba, Mahalliy narx)
- ✅ **Business Metrics** - Admin dashboard metrics
- ✅ **Yandex Market Integration** - REAL API, product creation, full chain
- ✅ **Lead Management** - Full lead capture system for /seller page

### Mobile + Web Unified API
Both mobile (React Native) and web (React/Vite) use the same endpoints:
- `POST /api/unified-scanner/analyze-base64` - AI Scanner (Kamera/Yuklash)
- `POST /api/partner/marketplace-integrations` - Marketplace ulash
- `GET /api/trends/hunter` - Trend Hunter

### NEW Marketplace Integration Endpoints (31-01-2026)
- `POST /api/partner/marketplace-integrations` ✅ - Create/Update integration
- `POST /api/partner/marketplace-integrations/{mp}/test` ✅ - Test connection
- `DELETE /api/partner/marketplace-integrations/{mp}` ✅ - Delete integration

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

## Mobile App v1.1.0 (28-01-2026)

### Yangiliklar
- ✅ To'liq Yandex Market zanjiri (scan → detect → AI card → upload)
- ✅ Real-time yuklash progressi
- ✅ Marketplace ulanish holati tekshiruvi
- ✅ Muvaffaqiyatli yuklash notification'lari

### APK Yuklab olish
- **Download:** https://expo.dev/accounts/medik3636s-organization/projects/sellercloudx-app/builds
- **Source:** `/app/mobile/sellercloudx_v1.1.0.zip`

### Mobile API Endpoints
- `POST /api/unified-scanner/analyze-base64` - AI skanerlash
- `POST /api/unified-scanner/full-process` - To'liq zanjir
- `GET /api/partner/marketplace-integrations` - Ulangan marketplace'lar

## Test Reports
- `/app/test_reports/iteration_17.json` - 100% pass rate (19/19 tests) - P0 fixes
- `/app/test_reports/iteration_18.json` - 100% pass rate (14/14 tests) - Yandex integration
- `/app/test_reports/iteration_19.json` - 100% pass rate (4/4 tests) - Seller landing + Invalid Date fix
- `/app/test_reports/iteration_20.json` - 100% pass rate (15/15 tests) - Seller landing v2 + Leads Management
- `/app/test_reports/iteration_21.json` - 100% pass rate (13/13 backend + 4/4 frontend) - Partner login, AI Scanner, Lead form

---

## Backlog (P2-P3)

### P2 - Medium Priority
- [x] Trend Hunter - real import xarajatlari hisoblash (shipping, customs) ✅
- [ ] Uzum Market integration (assisted automation - no full API)
- [ ] Video generation for product cards
- [ ] Full Node.js to Python migration

### P3 - Low Priority
- [x] Referrals - API va UI tayyor ✅
- [x] Blog - Admin CRUD tayyor ✅
- [ ] API documentation (Swagger)
- [ ] Unit/Integration tests coverage
- [ ] Wildberries/Ozon integrations

---

## Changelog

### 29-01-2026 - Seller Landing v2 + Leads Management System
- Completely redesigned `/seller` landing page for premium segment:
  - Hook questions: "Marketplace'larda savdo qilasiz, lekin natija yo'qmi?"
  - "Qimmat kurslar va hodimlar kerak emas!" messaging
  - Changed "34 hodim" to "3-4 professional hodim" (more realistic)
  - Replaced foreign images with more regionally appropriate visuals
  - Fixed white background text visibility issues
- Lead capture form modal instead of direct registration
  - Collects: Name, Phone, Region, Sales Volume, Business Type, Message
  - Submits to `/api/leads` endpoint
- Admin Panel Leads Management:
  - New "Leadlar" tab with PhoneCall icon
  - 8 stats cards: Jami, Yangi, Bog'lanildi, Kvalifikatsiya, Hamkor, Yo'qotildi, Bugun, Hafta
  - Search and filter by status
  - Lead details modal with status update and notes
  - Call button integration
- Backend Leads API:
  - `POST /api/leads` - Create lead (public)
  - `GET /api/admin/leads` - Get all leads (admin)
  - `GET /api/admin/leads/stats` - Get statistics (admin)
  - `PUT /api/admin/leads/{id}` - Update lead (admin)
- PostgreSQL `leads` table created
- Node.js proxy `/api/leads` qo'shildi
- Mobile app texts updated to premium philosophy:
  - SplashScreen: "AI bilan savdoni avtomatlashtiring", "3-4 hodim o'rniga • 1 AI Manager"
  - LoginScreen: "3-4 hodim o'rniga 1 AI Manager"
  - HomeScreen: "2 daqiqada kartochka yarating"
  - PricingScreen: Individual tarif "$30,000+ oylik savdo hajmi uchun", telefon +998900082244

### 29-01-2026 - Premium Seller Landing Page + Bug Fixes
- Created new `/seller` landing page for Instagram ads (premium segment)
- FOMO elements: countdown timer, limited spots counter (7 ta)
- Premium pricing: $699 o'rnatish (BEPUL aksiya) + $499/oy + 4%
- Individual plan: $30,000+ savdo hajmi uchun maxsus kelishiladi
- Fixed "Invalid Date" bug in Admin Panel with formatDate() helper
- All 4 frontend tests passing (100%)

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
