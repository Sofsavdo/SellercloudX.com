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

## Core Features Implemented

### 1. User Authentication & Registration ✅
- Partner registration with INN/STIR (business verification)
- Admin login at `/admin-login`
- Partner login at `/login`
- Session-based authentication

### 2. Click Payment Integration ✅ (Jan 2026)
- **Credentials Configured**:
  - SERVICE_ID: 92585
  - MERCHANT_ID: 54318
  - SECRET_KEY: aCcSOJk2t0uHNui
  - MERCHANT_USER_ID: 74886
- **Endpoints**:
  - `GET /api/click/tiers` - Get pricing tiers
  - `POST /api/click/create-payment` - Create payment link
  - `POST /api/click/webhook/prepare` - Click prepare webhook
  - `POST /api/click/webhook/complete` - Click complete webhook
- **Pricing Tiers (UZS)**:
  - Free Starter: 0 UZS
  - Starter Pro: 828,000 UZS/month (20% discount annual)
  - Professional Plus: 4,188,000 UZS/month
  - Enterprise Elite: 10,788,000 UZS/month

### 3. AI Scanner ✅ (Jan 2026)
- **Web Component**: `DashboardAIScanner.tsx`
- **Mobile Component**: `ScannerScreen.tsx`
- **Endpoint**: `POST /api/unified-scanner/analyze-base64`
- Features:
  - Camera capture support
  - File upload support
  - Product recognition via Google Vision API
  - Competitor price analysis
  - Cost price input and profit calculation

### 4. Trend Hunter ✅ (Jan 2026)
- **Endpoint**: `GET /api/trends/opportunities`
- **Service**: RapidAPI AliExpress DataHub
- **API Key**: Configured in .env
- Features:
  - Trending products from China/USA markets
  - Profit margin calculation
  - Competition analysis
  - Opportunity scoring

### 5. Partner Dashboard ✅
- Overview with key metrics
- AI Scanner tab
- Trend Hunter tab
- Analytics tab
- Products management

## Mobile Application
- **Platform**: React Native + Expo
- **API Base URL**: https://marketbot-30.preview.emergentagent.com/api
- **Features**:
  - Login/Register
  - AI Scanner with camera
  - Products list
  - Stats dashboard
  - Settings

## API Endpoints Summary

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Partner registration
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### AI Scanner
- `POST /api/unified-scanner/analyze-base64` - Public image analysis
- `POST /api/unified-scanner/full-process` - Full product creation

### Trends
- `GET /api/trends/opportunities` - Get trending products (auth required)

### Payments
- `GET /api/click/tiers` - Get pricing tiers
- `POST /api/click/create-payment` - Create payment

## Environment Variables

### Backend (.env)
```
CLICK_SERVICE_ID=92585
CLICK_MERCHANT_ID=54318
CLICK_SECRET_KEY=aCcSOJk2t0uHNui
CLICK_MERCHANT_USER_ID=74886
RAPIDAPI_KEY=ccd3ae6c91msh55b7206e9ec60a0p12da13jsncb260a5f7642
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://marketbot-30.preview.emergentagent.com
```

## Test Results (Jan 2026)
- Backend Tests: 100% (15/15 passed)
- Frontend Tests: 100% (all pages load correctly)
- Click Payment: ✅ Working
- AI Scanner: ✅ Working
- Trend Hunter: ✅ Working

## Upcoming Tasks (P0-P2)

### P0 - Critical
- [ ] Complete Yandex Market API integration
- [ ] MXIK code auto-fill from tasnif.soliq.uz

### P1 - High Priority
- [ ] Mobile app production build (APK/iOS)
- [ ] Push notifications
- [ ] Real-time chat implementation

### P2 - Medium Priority
- [ ] Video generation for product cards
- [ ] Infographic generation (6 sales-boosting images)
- [ ] Uzum Market integration

## Future Tasks (P3-P4)

### P3
- [ ] Biometric login (Face ID / Touch ID)
- [ ] Barcode scanning
- [ ] Wildberries integration

### P4
- [ ] Ozon integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support expansion

## Known Issues
- None currently (all critical issues resolved)

## Last Updated
January 23, 2026

## Contact
- Admin credentials: admin / admin123
- Support: support@sellercloudx.com
