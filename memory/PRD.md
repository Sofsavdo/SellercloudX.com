# SellerCloudX - Product Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS. 4 ta marketplace (Yandex, Uzum, Wildberries, Ozon) uchun to'liq avtomatizatsiya.

## Live URLs
- **Preview**: https://ezmktplace.preview.emergentagent.com
- **Mobile API**: https://ezmktplace.preview.emergentagent.com/api

## Mobile App v1.0.3 (Jan 27, 2026)
- **APK**: https://expo.dev/artifacts/eas/4tX4Wy5CP5vjmMYVDPdZHq.apk
- **Version**: 1.0.3

### Yangi xususiyatlar (v1.0.3):
1. ✅ **Background Upload** - Mahsulot yaratish fonda, UI blokirovka qilmaydi
2. ✅ **Marketplace Status** - "Marketplace Ulanmagan" ogohlantirishi
3. ✅ **2026 Pricing Model** - $699 + $499/oy + 4% revenue share
4. ✅ **4 Marketplace Support** - Yandex (faol), Uzum/Wildberries/Ozon (tez kunda)
5. ✅ **Raqobatchi Narx Tahlili** - Boshqa platformalardagi narxlar
6. ✅ **Yangilangan UI** - Professional ranglar, tuzatilgan matnlar
7. ✅ **Tungi rejim toggle** - Qo'shildi (to'liq tema keyingi versiyada)
8. ✅ **Profil saqlash** - 404 xatosi tuzatildi
9. ✅ **Qisqartirilgan matnlar** - "Qayta", "Buyurtma" va h.k.

## 2026 Revenue Share Model
```
Premium Tariff:
├── Setup: $699 (one-time)
├── Monthly: $499/month
└── Revenue Share: 4% of sales

Individual Tariff:
├── Setup: Kelishuv
├── Monthly: Kelishuv
└── Revenue Share: 2% minimum
```

## Architecture
```
/app
├── backend/            # Python/FastAPI (port 8001)
├── client/             # React/Vite (port 3000)  
├── mobile/             # React Native/Expo
├── server/             # Node.js/Express (legacy)
└── migrations/         # SQL Migrations
```

## API Endpoints

### Mobile Scanner (Python)
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
- `PUT /api/partners/me`

## Test Credentials
- **Expo**: rasmiydorixona@gmail.com / Medik9298
- **Yandex**: token: ACMA:OIjjTDFMnmBe7XOs7EqaWqdoXUS772aKqwqjXj6C:245e5a96

## Known Issues

### P1 - Node.js Drizzle ORM
- Production DB schema mismatch
- Workaround applied, but root cause not fixed

### P1 - Trend Hunter
- Auth fix applied, needs full testing

### P2 - Web Frontend Mock Data
- Some dashboards still have mock data

## Backlog

### P0 (Critical)
- [x] Background upload
- [x] Marketplace status check
- [x] 2026 pricing model

### P1 (Important)
- [ ] Trend Hunter full testing
- [ ] Node.js DB migration fix
- [ ] Video generation

### P2 (Nice to have)
- [ ] Uzum Market integration
- [ ] Wildberries integration
- [ ] Web frontend cleanup
- [ ] Dark mode full implementation

### P3 (Future)
- [ ] 1688.com API
- [ ] Unit tests
- [ ] Docker deployment
