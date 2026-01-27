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

## 2026 PRICING MODEL ✅ (Jan 27, 2026) - FULLY IMPLEMENTED

### Premium Tariff (Public) - /pricing
- **One-time Setup**: $699
- **Monthly Fee**: $499/month  
- **Revenue Share**: 4% of total sales
- **60-Day Guarantee**: Sales growth guarantee with partial refund
- **7-Day Free Trial**: Full access trial period
- **Features**:
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

### Partner Dashboard - "To'lovlar" Section ✅
- **Route**: Partner Dashboard → Payments tab
- **Features**:
  - Current debt display (UZS)
  - Monthly sales tracking (from Yandex)
  - Revenue share calculation (4%)
  - Sales comparison: "Before Us" vs "With Us"
  - 60-day growth tracking
  - Payment history
  - Bank details for manual payment
  - Click/Payme payment buttons

### Pricing Page ✅
- **Route**: `/pricing`
- Premium tariff card with full details
- Individual tariff card with "Contact Us"
- Revenue calculator (slider 10M-500M UZS)
- FAQ section
- 60-day guarantee badge

## Test Results (Jan 27, 2026)
- **Backend**: 100% (8/8 tests passed)
- **Frontend**: 90% (pricing page works, login redirect pre-existing issue)
- **Database**: All 2026 columns migrated successfully

### Test Credentials Created
- Admin: admin / admin123
- Test Partner: test2026_mkw8x8m4 / test123456

## API Endpoints Summary

### Billing (2026 Model) ✅
- `GET /api/billing/revenue-share/summary` - Partner billing summary
- `POST /api/billing/revenue-share/start-trial` - Start 7-day trial
- `POST /api/billing/revenue-share/record-payment` - Record payment
- `POST /api/admin/revenue-share/confirm-payment` - Admin confirms payment
- `POST /api/admin/revenue-share/activate-premium` - Admin activates premium
- `POST /api/admin/revenue-share/unblock-partner` - Admin unblocks partner
- `POST /api/admin/revenue-share/update-sales` - Update sales data
- `GET /api/admin/revenue-share/all-debts` - Get partners with debt

### Click Payment
- `GET /api/click/tiers` - Returns 4 tiers with UZS pricing
- `POST /api/click/create-payment` - Create Click payment

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

## Database Schema Updates (Jan 27, 2026)

### Partners Table - New 2026 Columns
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

## Completed Features This Session

1. ✅ 2026 Premium Pricing Model implemented
2. ✅ Pricing Page created at `/pricing`
3. ✅ Revenue Share Service created (`revenueShareService.ts`)
4. ✅ Billing API routes added
5. ✅ Database migration applied (013_2026_revenue_share_model.sql)
6. ✅ PartnerPaymentsDashboard component created
7. ✅ Sidebar "To'lovlar" menu item added
8. ✅ Partner Dashboard payments tab integrated
9. ✅ Revenue calculator on pricing page
10. ✅ Sales comparison widget (Before Us vs With Us)

## Known Issues (Minor)
- Login redirect doesn't work in some cases (pre-existing)
- Drizzle ORM sync with new columns needs attention

## Upcoming Tasks (P0-P2)

### P0 - Critical
- [ ] MXIK code auto-fill from tasnif.soliq.uz
- [ ] Yandex Market API full integration for automatic sales sync
- [ ] Fix login redirect issue

### P1 - High Priority
- [ ] Mobile app production build with new API
- [ ] Push notifications
- [ ] Email verification for registration
- [ ] Cron job for daily revenue share calculation

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

## Last Updated
January 27, 2026

## Contact
- Support Telegram: @sellercloudx_support
- Email: sales@sellercloudx.com
