# SellerCloudX - Product Requirements Document

## Original Problem Statement
To'liq avtomatlashtirilgan e-commerce tizimi yaratish - Yandex Market uchun. Hamkorlar rasm va narx yuklaydi, AI mahsulotni aniqlaydi, kontent yaratadi (rus/o'zbek), infografika generatsiya qiladi va 100/100 sifatli product card joylashtiradi.

## User Personas
- **Hamkorlar (Partners):** Kichik/o'rta biznes egalari, mahsulot sotuvchilar
- **Admin:** Platforma boshqaruvchisi

## Core Requirements

### 1. Partner Lifecycle Automation
- ✅ INN (STIR) orqali unikal biznes identifikatsiyasi
- ✅ Tier-based subscription model (free_starter, basic, starter_pro, professional)
- ✅ Annual subscription 20% chegirma
- 🔄 Click/Payme to'lov integratsiyasi (backend ready, UI in progress)

### 2. AI Product Card Creation
- ✅ Gemini AI orqali mahsulot tahlili
- ✅ Rus/O'zbek tilida kontent generatsiya
- ✅ Yandex Market API integratsiyasi
- 🔜 100/100 sifat ball maqsadi

### 3. Mobile Application
- ✅ React Native/Expo scaffolding (`/app/mobile`)
- ✅ Navigation, state management (Zustand)
- ✅ Backend API ulangan
- 🔄 Android APK build (pending)
- 🔜 Push notifications
- 🔜 Offline queue

## Architecture
```
/app
├── backend/         # Python/FastAPI - AI, Yandex/Uzum
├── client/          # React/Vite - Web Frontend
├── mobile/          # React Native/Expo - Mobile App
├── server/          # Node.js/Express - Main API
└── shared/          # Shared schemas (Drizzle)
```

## Database
- **Development:** SQLite
- **Production:** PostgreSQL (Railway)

## What's Implemented

### 2024-12-28
- INN verification system
- Click payment backend setup
- Mobile app scaffolding

### 2024-12-29
- PostgreSQL migration fix for `business_type`, `inn`, Click payment columns
- `/app/server/migrate.ts` - auto-migration for PostgreSQL
- `/app/migrations/012_fix_partners_business_and_payment_columns.sql`
- Added `is_active`, `business_address`, `phone`, `website`, `created_at`, `updated_at` columns

### 2025-01-23
- Mobile app API URL updated to `https://sellercloudx.com/api`
- Expo project created: `@medik2244/sellercloudx-mobile` (ID: e37f5496-4917-4ebd-8a05-8640a6045a5a)
- Dependencies updated to Expo 50 compatible versions
- EAS Build configured but requires Android SDK for local build

## Prioritized Backlog

### P0 - Critical
- [x] Fix Railway deployment (PostgreSQL migration)

### P1 - High Priority
- [ ] Build Android APK for mobile app
- [ ] Complete Click payment UI integration

### P2 - Medium Priority
- [ ] Push notifications (mobile)
- [ ] End-to-end partner onboarding test
- [ ] Yandex 100/100 quality score

### P3 - Low Priority
- [ ] Offline queue for mobile uploads
- [ ] Biometric login (Face ID/Touch ID)
- [ ] Barcode scanner
- [ ] Uzum Market automation
- [ ] Real-time admin-partner chat

## 3rd Party Integrations
- **Yandex Market Partner API** - Product management
- **Gemini API** - AI text/image generation (Emergent LLM Key)
- **ImgBB** - Image hosting
- **Click/Payme** - Payment gateway (planned)

## Known Issues
- Railway deployment requires PostgreSQL migration (FIXED)
- Mobile app needs testing with real backend

## Notes for Next Agent
- Migration file is ready: `/app/migrations/012_fix_partners_business_and_payment_columns.sql`
- After GitHub push, Railway auto-deploy should run migrations
- Mobile APK build is next priority after deployment fix
