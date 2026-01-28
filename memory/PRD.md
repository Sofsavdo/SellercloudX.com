# SellerCloudX - Product Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS. 4 ta marketplace (Yandex, Uzum, Wildberries, Ozon) uchun to'liq avtomatizatsiya.

## Live URLs
- **Preview**: https://autotrader-110.preview.emergentagent.com
- **Mobile API**: https://autotrader-110.preview.emergentagent.com/api

## 2026 Pricing Model (UPDATED Jan 28, 2026)
```
Premium Tariff:
├── Bir martalik sozlash: $699
├── Oylik to'lov: $499/month
├── Revenue Share: 4% savdodan
├── 7-kun bepul sinov
├── 60-kun kafolat
└── Cheksiz AI karta, mahsulot

Individual Tariff:
├── Bir martalik sozlash: $1599+
├── Oylik to'lov: Kelishiladi
├── Revenue Share: 2% dan boshlab
├── Shaxsiy menejer
├── 24/7 qo'llab-quvvatlash
├── Maxsus integratsiyalar
└── SLA kafolati
```

## Mobile App v1.0.6 (Jan 28, 2026)

### APK Download:
**https://expo.dev/artifacts/eas/fJDsj6HUFC9nx7vwoKwey4.apk**

### Xususiyatlar:
- Professional marketplace grid (2x2 layout)
- Splash Screen animatsiya
- 2026 narx modeli
- Haqiqiy marketplace logolari

## Expo Credentials
- **Email**: Dubaymall.beauty@gmail.com
- **Username**: medik3636
- **Password**: Medik9298

## Architecture
```
/app
├── backend/            # Python/FastAPI (port 8001)
├── client/             # React/Vite (port 3000)  
├── mobile/             # React Native/Expo
├── server/             # Node.js/Express (Production only)
└── migrations/         # SQL Migrations
```

## Recent Changes (Jan 28, 2026)

### Web Frontend Updated:
1. ✅ LandingNew.tsx - 2026 narx modeli yangilandi
2. ✅ Premium: $499/oy + $699 setup + 4% savdodan
3. ✅ Individual: SHAXSIY narx + $1599+ + 2%
4. ✅ 60-kun kafolat badge qo'shildi
5. ✅ 7-kun bepul sinov badge qo'shildi
6. ✅ BlogPage.tsx - API error handling tuzatildi

### Working Features:
- ✅ Landing page 2026 pricing
- ✅ Trend Hunter API (real AliExpress data)
- ✅ Navigation (Imkoniyatlar, Narxlar, Blog)
- ✅ Registration flow
- ✅ Login dropdown (Hamkor/Admin)

## Test Results (iteration_16.json)
- **Success Rate**: 90% (7/8 features)
- **All 2026 pricing verified working**
- **Trend Hunter API returns real data**

## Backlog

### P0 (Critical)
- [x] Web Frontend 2026 narx modeli - DONE
- [ ] Node.js Backend Drizzle ORM xatolarini tuzatish (Production env)
- [ ] Mobile App v1.0.6 startup muammosini tuzatish

### P1 (High)
- [ ] Mahsulot kartalari uchun video generatsiyasi
- [ ] Trend Hunter uchun 1688.com API
- [ ] Admin panel hamkorni faollashtirish UI

### P2 (Medium)
- [ ] Python va Node.js backend'larni birlashtirish
- [ ] To'liq test coverage
- [ ] Uzum Market avtomatizatsiyasi

### P3 (Low)
- [ ] API hujjatlari (Swagger)
- [ ] Blog maqolalari qo'shish

## Key API Endpoints
- `GET /api/trends/top` - Trend Hunter (real AliExpress data)
- `POST /api/admin/partners/activate-manual` - Manual partner activation
- `POST /api/scanner/analyze-base64` - Mobile scanner

## Files Modified
- `/app/client/src/pages/LandingNew.tsx` - 2026 pricing update
- `/app/client/src/pages/BlogPage.tsx` - Error handling fix
