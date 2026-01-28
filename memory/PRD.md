# SellerCloudX - Product Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS for Yandex Market, Uzum, Wildberries, Ozon.

## Live URLs
- **Preview**: https://selltech-1.preview.emergentagent.com
- **Production**: https://sellercloudx.com (Railway)

## 2026 Pricing Model
```
Premium Tariff:
├── Oylik to'lov: $499/month
├── Revenue Share: 4% savdodan
├── 60-kun kafolat
└── Cheksiz AI karta, mahsulot

Individual Tariff:
├── Oylik to'lov: Kelishiladi
├── Revenue Share: 2% dan
├── Shaxsiy menejer
└── Maxsus integratsiyalar
```

## Mobile App v1.0.7
**APK**: https://expo.dev/artifacts/eas/xcgPHV3rXDKUu7f8R1guP.apk

## Architecture
```
/app
├── backend/            # Python/FastAPI (port 8001) - PRIMARY BACKEND
│   └── database.py     # PostgreSQL (Railway) / MongoDB (dev) - DUAL MODE
├── client/             # React/Vite (port 3000) - Web Frontend
├── mobile/             # React Native/Expo
├── server/             # Node.js/Express - Proxy to Python backend
└── shared/             # Drizzle schema (Node.js only)
```

## Database Configuration
- **Production (Railway)**: PostgreSQL via `DATABASE_URL` environment variable
- **Preview/Development**: MongoDB via `MONGO_URL` environment variable
- **Auto-detection**: `database.py` automatically detects which DB to use

## FIXED - January 28, 2026

### Critical Architecture Fix
Node.js server now proxies ALL API requests to Python backend:
- `/api/auth/*` → Python backend (MongoDB)
- `/api/admin/*` → Python backend (MongoDB)
- `/api/partner/*` → Python backend (MongoDB)
- `/api/chat/*` → Python backend (MongoDB)
- `/api/ai-manager/*` → Python backend (MongoDB)

### Files Modified
1. **`/app/backend/database.py`** - NEW: MongoDB service with Motor
   - User authentication (bcrypt)
   - Session management (token-based)
   - Partner management
   - Chat rooms & messages
   - Products & marketplaces

2. **`/app/backend/server.py`** - MAJOR UPDATE
   - Added 30+ new API endpoints
   - Token-based authentication
   - Admin/Partner/Chat routes
   - AI Manager routes
   - Marketplace integration routes

3. **`/app/server/routes.ts`** - Updated proxy routes
   - All `/api/auth`, `/api/admin`, `/api/partner`, `/api/chat` go to Python

4. **`/app/server/routes/pythonBackendProxy.ts`** - Fixed Authorization header forwarding

5. **`/app/client/src/lib/queryClient.ts`** - Token-based auth
   - Removed credentials:include (CORS fix)
   - Added token storage in localStorage

6. **`/app/client/src/hooks/useAuth.tsx`** - Token-based auth
   - Normalized snake_case/camelCase data

7. **`/app/client/src/pages/AdminPanel.tsx`** - Data normalization
   - Handle Python backend response format
   - snake_case to camelCase conversion

## Working Features ✅

### Authentication
- ✅ Login (admin/partner)
- ✅ Register
- ✅ Token-based sessions
- ✅ Role-based access

### Admin Panel
- ✅ Partners list with statistics
- ✅ Partner approval
- ✅ Partner activation (manual, without payment)
- ✅ Partner deactivation
- ✅ Dashboard with metrics

### Partner Dashboard
- ✅ Login as partner
- ✅ Dashboard with statistics
- ✅ Menu navigation
- ✅ Tariff management
- ✅ Marketplace connections
- ✅ AI Manager access (PRO)
- ✅ AI Scanner access (PRO)
- ✅ Trend Hunter access (PRO)

### Chat System
- ✅ Chat room creation
- ✅ Message sending
- ✅ Admin/Partner communication

## Test Credentials
- **Admin**: admin / admin123
- **Partner**: testpartner / test123

## API Endpoints (Python Backend)

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Current user
- `POST /api/auth/logout` - Logout

### Admin
- `GET /api/admin/partners` - List partners
- `PUT /api/admin/partners/:id/approve` - Approve partner
- `POST /api/admin/partners/:id/activate` - Activate (manual)
- `PUT /api/admin/partners/:id/deactivate` - Deactivate

### Partner
- `GET /api/partner/profile` - Get profile
- `PUT /api/partner/profile` - Update profile
- `GET /api/partner/tariff` - Get tariff
- `POST /api/partner/marketplaces/connect` - Connect marketplace
- `GET /api/partner/products` - Get products

### Chat
- `GET /api/chat/room` - Get/create chat room
- `GET /api/chat/rooms` - List rooms (admin)
- `GET /api/chat/messages` - Get messages
- `POST /api/chat/send` - Send message

### AI Manager
- `GET /api/ai-manager/status` - AI status
- `GET /api/ai-manager/tasks` - Get tasks
- `POST /api/ai-manager/tasks` - Create task

## Backlog

### P0 - Critical
- [ ] Deploy fixes to Railway production
- [ ] Test all features on production

### P1 - High
- [ ] Mobile App v1.0.7 verification
- [ ] Trend Hunter 1688.com API integration
- [ ] AI Scanner with real image analysis

### P2 - Medium
- [ ] Video generation for product cards
- [ ] Consolidate Python and Node.js backends

### P3 - Low
- [ ] API documentation (Swagger)
- [ ] Unit/Integration tests

## 3rd Party Integrations
- ✅ MongoDB (database)
- ✅ Yandex Market Partner API
- ✅ Expo Application Services
- ✅ Gemini (Emergent LLM)
- ✅ Google Lens API (RapidAPI)

## RapidAPI Keys
```
RAPIDAPI_KEY=ccd3ae6c91msh55b7206e9ec60a0p12da13jsncb260a5f7642
```
