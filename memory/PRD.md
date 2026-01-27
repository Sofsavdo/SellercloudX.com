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

## 2026 PRICING MODEL ✅ (Jan 27, 2026)

### Premium Tariff (Public)
- **One-time Setup**: $699
- **Monthly Fee**: $499/month
- **Revenue Share**: 4% of total sales
- **Features**:
  - 7-day FREE trial
  - 60-day sales growth guarantee
  - Unlimited AI card creation
  - All marketplace integrations
  - Trend Hunter FULL access
  - Profit analytics
  - Priority 24/7 support
  - API access

### Individual Tariff (Custom, not public)
- **Setup**: $1,599+
- **Revenue Share**: 2% or lower (negotiable)
- **For**: High-volume sellers ($50,000+ monthly sales)
- **Features**:
  - All Premium features
  - Dedicated account manager
  - Custom integrations
  - SLA guarantee
  - On-site training

### Pricing Page
- New route: `/pricing`
- Shows Premium tariff in detail
- Individual tariff with "Contact us" button
- Revenue calculator
- FAQ section

## Core Features Implemented

### 1. User Authentication & Registration ✅
- Partner registration with INN/STIR (business verification)
- Admin login at `/admin-login`
- Partner login at `/login`
- Session-based authentication

### 2. Payment Integrations ✅

#### Click Payment (Jan 2026)
- SERVICE_ID: 92585
- MERCHANT_ID: 54318
- SECRET_KEY: aCcSOJk2t0uHNui
- Endpoints: `/api/click/*`

#### Revenue Share Billing (Jan 27, 2026) ✅ NEW
- **Service**: `/app/server/services/revenueShareService.ts`
- **Routes**: `/app/server/routes/billingRoutes.ts`
- **Features**:
  - Monthly sales tracking per marketplace
  - 4% revenue share calculation
  - Debt tracking and management
  - Account blocking for overdue payments (7+ days)
  - Admin manual payment confirmation
  - Trial period management (7 days)
  - 60-day guarantee tracking

### 3. AI Scanner ✅
- **Web Component**: `DashboardAIScanner.tsx`
- **Mobile Component**: `ScannerScreen.tsx`
- **Endpoint**: `POST /api/unified-scanner/analyze-base64`

### 4. Trend Hunter ✅
- **Endpoint**: `GET /api/trends/opportunities`
- **Service**: RapidAPI AliExpress DataHub

### 5. Partner Dashboard ✅
- Overview with key metrics
- AI Scanner tab
- Trend Hunter tab
- Analytics tab
- Products management
- **NEW**: Payments & Debt section component ready

## Database Schema Updates (Jan 27, 2026)

### Partners Table - New Columns
```sql
tariff_type TEXT DEFAULT 'trial'  -- trial, premium, individual
setup_paid INTEGER DEFAULT 0
setup_fee_usd INTEGER DEFAULT 699
monthly_fee_usd INTEGER DEFAULT 499
revenue_share_percent REAL DEFAULT 0.04
total_debt_uzs INTEGER DEFAULT 0
last_debt_calculated_at INTEGER
blocked_until INTEGER
block_reason TEXT
trial_start_date INTEGER
trial_end_date INTEGER
guarantee_start_date INTEGER
sales_before_us INTEGER DEFAULT 0
```

### New Tables
- `monthly_sales_tracking` - Monthly sales per marketplace
- `revenue_share_payments` - Payment history

## API Endpoints Summary

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

### Billing (2026 Model)
- `GET /api/billing/revenue-share/summary` - Partner billing summary
- `POST /api/billing/revenue-share/start-trial` - Start 7-day trial
- `POST /api/billing/revenue-share/record-payment` - Record payment
- `POST /api/admin/revenue-share/confirm-payment` - Admin confirms manual payment
- `POST /api/admin/revenue-share/activate-premium` - Admin activates premium
- `POST /api/admin/revenue-share/unblock-partner` - Admin unblocks partner
- `POST /api/admin/revenue-share/update-sales` - Update sales data
- `GET /api/admin/revenue-share/all-debts` - Get all partners with debt

### Products
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### AI Scanner
- `POST /api/unified-scanner/analyze-base64`

### Trends
- `GET /api/trends/opportunities`

### Payments (Click)
- `GET /api/click/tiers`
- `POST /api/click/create-payment`

## Mobile Application
- **Platform**: React Native + Expo
- **API Base URL**: https://marketbot-30.preview.emergentagent.com/api

## Test Results (Jan 27, 2026)
- Backend Tests: 100% passed
- Frontend Tests: All pages load correctly
- Pricing Page: ✅ Working
- Revenue Share API: ✅ Working
- Database Migration: ✅ Completed

## Upcoming Tasks (P0-P2)

### P0 - Critical
- [ ] Complete Partner Dashboard "To'lovlar" section integration
- [ ] MXIK code auto-fill from tasnif.soliq.uz
- [ ] Yandex Market API full integration

### P1 - High Priority
- [ ] Mobile app production build with new API
- [ ] Push notifications
- [ ] Email verification for registration

### P2 - Medium Priority
- [ ] Real-time chat implementation
- [ ] Video generation for product cards
- [ ] Infographic generation

## Future Tasks (P3-P4)

### P3
- [ ] Biometric login (Face ID / Touch ID)
- [ ] Barcode scanning
- [ ] Uzum Market integration

### P4
- [ ] Wildberries integration
- [ ] Ozon integration
- [ ] Advanced analytics dashboard

## Known Issues
- None currently (all critical issues resolved)

## Last Updated
January 27, 2026

## Contact
- Admin credentials: admin / admin123
- Support Telegram: @sellercloudx_support
- Email: sales@sellercloudx.com
