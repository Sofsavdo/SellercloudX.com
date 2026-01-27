# SellerCloudX - Product Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS for Uzbekistan sellers. The platform helps partners automate sales on Yandex Market (primary focus) with AI-driven product recognition, card generation, and analytics.

## Live Environment
- **Production URL**: https://sellercloudx.com
- **Preview URL**: https://marketbot-30.preview.emergentagent.com
- **Repository**: https://github.com/Sofsavdo/SellercloudX.com

## Architecture
```
/app
├── backend/            # Python/FastAPI: AI tasks (port 8001)
├── client/             # React/Vite Web Frontend (port 3000)
├── mobile/             # React Native/Expo Mobile App
├── server/             # Node.js/Express: Main API, Auth, Business Logic
│   ├── routes/
│   ├── services/
│   └── middleware/
├── shared/             # Drizzle schema (schema.ts)
├── migrations/         # SQL Migrations
└── railway.json        # Railway deployment config
```

## Completed Features (Jan 27, 2026)

### 1. 2026 Premium Pricing Model ✅
- **Premium**: $699 setup + $499/month + 4% revenue share
- **Individual**: Custom pricing ($1,599+ setup, 2%+ share)
- **Pricing Page**: `/pricing` with calculator and FAQ
- **Partner Dashboard**: "To'lovlar" section with debt tracking

### 2. MXIK Code Integration ✅ NEW
- **Service**: `/app/server/services/mxikService.ts`
- **API Routes**: `/api/mxik/*`
- **Features**:
  - Fuzzy search using Levenshtein distance
  - 23 built-in common codes for marketplace products
  - Best match finder for product names
  - Code validation (8-digit format)
- **Endpoints**:
  - `GET /api/mxik/status` - Database status
  - `GET /api/mxik/search?q=&lang=uz|ru` - Search codes
  - `GET /api/mxik/best-match?q=&category=` - Best match
  - `GET /api/mxik/validate/:code` - Validate format
  - `GET /api/mxik/code/:code` - Get code details

### 3. Yandex Sales Sync Service ✅ NEW
- **Service**: `/app/server/services/salesSyncService.ts`
- **Features**:
  - Daily sales sync from Yandex Market API
  - Monthly sales tracking per partner
  - Automatic revenue share calculation
  - Debt check and partner blocking
  - Trial expiration checking
- **Endpoints**:
  - `POST /api/admin/sales-sync/run` - Manual sync trigger
  - `GET /api/admin/sales-sync/status` - Sync status
  - `POST /api/admin/sales-sync/partner/:id` - Sync single partner

### 4. Yandex Market Service Extended ✅ NEW
- **Service**: `/app/server/services/yandexMarketService.ts`
- **New Methods**:
  - `getSalesStats(dateFrom, dateTo)` - Order statistics
  - `getMonthlySales(year, month)` - Monthly summary
  - `getCampaigns()` - List all campaigns
  - `getCommissionRates(categoryId)` - Commission rates

### 5. Login Redirect Fix ✅
- Admin → `/admin-panel`
- Partner → `/partner-dashboard`
- Uses `window.location.href` for full page reload

### 6. AI Scanner ✅
- **Endpoint**: `POST /api/unified-scanner/analyze-base64`
- Camera and file upload support

### 7. Trend Hunter ✅
- **Endpoint**: `GET /api/trends/opportunities`
- RapidAPI AliExpress DataHub integration

### 8. Click Payment ✅
- SERVICE_ID: 92585
- MERCHANT_ID: 54318
- Webhook endpoints configured

## Test Results (Jan 27, 2026)
- **Backend**: 100% (19/19 tests passed)
- **Frontend**: 100% (all pages working)
- **MXIK API**: All endpoints working
- **Sales Sync**: Ready for cron job

## MXIK Built-in Codes (23 codes)
```
26101100 - Mobil telefonlar
26201000 - Kompyuterlar va aksessuarlar
26301000 - Audio va video uskunalar
27401000 - Maishiy elektr jihozlari
14101000 - Erkaklar kiyimlari
14102000 - Ayollar kiyimlari
14103000 - Bolalar kiyimlari
15201000 - Poyabzallar
31001000 - Mebel
32201000 - O'yinchoqlar
27501000 - Oshxona jihozlari
20421000 - Parfyumeriya
20422000 - Kosmetika
10101000 - Go'sht mahsulotlari
10201000 - Baliq mahsulotlari
10501000 - Sut mahsulotlari
32301000 - Sport jihozlari
32401000 - Dam olish uchun mahsulotlar
29101000 - Avtomobil ehtiyot qismlari
29201000 - Avtomobil aksessuarlari
23101000 - Qurilish materiallari
27101000 - Elektr jihozlari
47190000 - Boshqa chakana savdo (default)
```

## Database Schema (2026 Updates)

### Partners Table - New Columns
```sql
tariff_type TEXT DEFAULT 'trial'
setup_paid INTEGER DEFAULT 0
setup_fee_usd INTEGER DEFAULT 699
monthly_fee_usd INTEGER DEFAULT 499
revenue_share_percent REAL DEFAULT 0.04
total_debt_uzs INTEGER DEFAULT 0
blocked_until INTEGER
block_reason TEXT
trial_start_date INTEGER
trial_end_date INTEGER
guarantee_start_date INTEGER
sales_before_us INTEGER DEFAULT 0
```

### New Tables
- `monthly_sales_tracking`
- `revenue_share_payments`

## API Endpoints Summary

### MXIK (NEW)
- `GET /api/mxik/status`
- `GET /api/mxik/search?q=&lang=uz|ru`
- `GET /api/mxik/best-match?q=&category=`
- `GET /api/mxik/validate/:code`
- `GET /api/mxik/code/:code`

### Billing (2026)
- `GET /api/billing/revenue-share/summary`
- `POST /api/billing/revenue-share/start-trial`
- `POST /api/billing/revenue-share/record-payment`

### Admin (NEW)
- `POST /api/admin/sales-sync/run`
- `GET /api/admin/sales-sync/status`
- `POST /api/admin/sales-sync/partner/:id`
- `POST /api/admin/revenue-share/confirm-payment`
- `POST /api/admin/revenue-share/activate-premium`
- `POST /api/admin/revenue-share/unblock-partner`

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

### Click Payment
- `GET /api/click/tiers`
- `POST /api/click/create-payment`

## Upcoming Tasks (P0-P2)

### P0 - Critical
- [ ] Set up cron job for daily sales sync
- [ ] Full MXIK database from tasnif.soliq.uz Excel
- [ ] Yandex API OAuth integration
- [ ] 100% quality index card generation

### P1 - High Priority
- [ ] Mobile app update with new API
- [ ] Email verification
- [ ] Push notifications

### P2 - Medium Priority
- [ ] Real-time chat
- [ ] Video generation for cards
- [ ] Infographic generation

## Future Tasks (P3-P4)

### P3
- [ ] Uzum Market integration
- [ ] Biometric login
- [ ] Barcode scanning

### P4
- [ ] Wildberries/Ozon integration
- [ ] Advanced analytics

## Audit Notes (Secondary Priority)
- Merge dual backends (Node.js primary)
- Unify to PostgreSQL only
- Refactor large files (routes.ts 2499 lines)
- Add strict TypeScript
- Improve test coverage to 70%
- Add CI/CD pipeline

## Last Updated
January 27, 2026

## Contact
- Support Telegram: @sellercloudx_support
- Email: sales@sellercloudx.com
