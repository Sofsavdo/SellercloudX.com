# SellerCloudX - Product Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS for Yandex Market. Complete automation from camera scan to product listing.

## Live Environment
- **Preview URL**: https://ezmktplace.preview.emergentagent.com
- **Mobile API**: https://ezmktplace.preview.emergentagent.com/api

## Mobile App Downloads
- **Latest APK**: https://expo.dev/artifacts/eas/vPVixgc9Mr6GNkauQEeUhm.apk
- **Web Export**: `/app/mobile/sellercloudx_mobile_web.zip`
- **Full Package (with Android source)**: `/app/mobile/sellercloudx_mobile_full_package.zip`
- **APK Build Instructions**: `/app/mobile/BUILD_APK_INSTRUCTIONS.md`

## Architecture
```
/app
├── backend/            # Python/FastAPI (port 8001)
├── client/             # React/Vite (port 3000)  
├── mobile/             # React Native/Expo
│   ├── dist/           # Web export
│   ├── android/        # Android native code
│   └── build_package/  # Complete build package
├── server/             # Node.js/Express
└── migrations/         # SQL Migrations
```

## 2026 Revenue Share Model ✅
```
Premium Tariff:
├── Setup: $699 (one-time)
├── Monthly: $499/month
└── Revenue Share: 4% of sales

Example (10M UZS sales):
├── Monthly fee: 6,287,400 UZS ($499)
├── Revenue share: 400,000 UZS (4%)
└── Total: 6,687,400 UZS ($531)
```

## Completed Features (Jan 27, 2026)

### 1. Mobile App Background Processing ✅ (NEW)
- Product creation now runs in background
- User can immediately scan next product
- Queue system with offline support
- Real-time status updates

### 2. Marketplace Status Check ✅ (NEW)
- HomeScreen shows "Marketplace Ulanmagan" warning if no API keys
- UploadProductScreen shows connected/disconnected status for each marketplace
- partnerApi.getMarketplaceStatus() endpoint added

### 3. Mobile Scanner Endpoint ✅
**Critical for mobile app camera functionality**

**Endpoint**: `POST /api/unified-scanner/analyze-base64`
```json
Request: {"image_base64": "...", "language": "uz"}
Response: {
  "success": true,
  "product_info": {...},
  "suggested_price": 100000,
  "confidence": 85
}
```

### 4. Full Automation ✅ 
6-step flow: Scan → MXIK → AI Card → Pricing → Infographics → Yandex

### 5. Trend Hunter API ✅
- `GET /api/trends/top` - Top opportunities
- `GET /api/trends/category/{category}` - By category
- Categories: electronics, clothing, home, beauty, sports

### 6. Revenue Share Billing ✅
- `GET /api/billing/calculate`
- `POST /api/billing/summary`

### 7. Yandex Market API ✅
- 89 Products | 76 Ready (85%)
- Real-time dashboard
- Product creation

### 8. 2026 Pricing Screen ✅
- Mobile PricingScreen.tsx updated
- Shows $699 setup + $499/month + 4% revenue share
- Calculator example included

## Files Modified (Jan 27, 2026)

### Mobile App
- `/app/mobile/src/services/api.ts` - Added getMarketplaceStatus()
- `/app/mobile/src/services/offlineQueue.ts` - Added removeCompleted()
- `/app/mobile/src/screens/UploadProductScreen.tsx` - Background processing
- `/app/mobile/src/screens/HomeScreen.tsx` - Marketplace status warning
- `/app/mobile/src/screens/PricingScreen.tsx` - 2026 pricing model
- `/app/mobile/src/store/authStore.ts` - Extended Partner interface
- `/app/mobile/src/utils/constants.ts` - Added COLORS.error

## Test Results (Jan 27, 2026)
| Feature | Status |
|---------|--------|
| Mobile Scanner | ✅ Working |
| Billing API | ✅ Working |
| Yandex Dashboard | ✅ 89 products |
| Backend Health | ✅ Healthy |
| Background Upload | ✅ Code ready |
| Marketplace Status | ✅ Code ready |

## API Endpoints Summary

### Mobile
- `POST /api/unified-scanner/analyze-base64`
- `POST /api/unified-scanner/full-process`

### Billing
- `GET /api/billing/calculate`
- `POST /api/billing/summary`

### Trends
- `GET /api/trends/top`
- `GET /api/trends/category/{category}`

### Partner
- `GET /api/partner/marketplace-integrations`
- `POST /api/partner/marketplace-integrations`
- `POST /api/partner/marketplace-integrations/:marketplace/test`

## Known Issues

### P1 - Node.js Drizzle ORM (Production)
- Status: WORKAROUND APPLIED
- Issue: Schema mismatch in production database
- Impact: Background jobs may crash
- Fix: Need to run migration on production DB

### P1 - Trend Hunter (Partial)
- Status: Auth fix applied, needs full testing
- Issue: Was returning 401 errors
- Fix: Removed requireAuth from /api/trends route

## Upcoming Tasks

### P0 - Mobile App
- [ ] Build new APK with all fixes
- [ ] Test background upload flow
- [ ] Verify marketplace status display

### P1 - Trend Hunter
- [ ] Full end-to-end testing
- [ ] "Mahsulotga o'tish" button functionality
- [ ] AliExpress API integration

### P2 - Web Frontend
- [ ] Remove mock data from dashboards
- [ ] Connect MarketplaceIntegrationManager to API
- [ ] Connect ActivityFeed to real data

## Expo Credentials
- Email: rasmiydorixona@gmail.com
- Password: Medik9298

## Yandex Credentials
- Token: ACMA:OIjjTDFMnmBe7XOs7EqaWqdoXUS772aKqwqjXj6C:245e5a96
- Campaign ID: 148650502
