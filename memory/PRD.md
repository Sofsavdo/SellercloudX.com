# SellerCloudX - Product Requirements Document

## Overview
SellerCloudX.com - AI-powered marketplace automation SaaS for Uzbekistan sellers. Complete automation from product scan to Yandex Market listing.

## Live Environment
- **Preview URL**: https://vendorai.preview.emergentagent.com
- **Production URL**: https://sellercloudx.com

## Architecture
```
/app
├── backend/            # Python/FastAPI (port 8001)
├── client/             # React/Vite (port 3000)
├── mobile/             # React Native/Expo
├── server/             # Node.js/Express
├── shared/             # Drizzle schema
└── migrations/         # SQL Migrations
```

## Completed Features (Jan 27, 2026)

### 1. Full Automation ✅ NEW - ONE-CLICK PRODUCT CREATION
**Endpoint**: `POST /api/ai/full-automation`

Complete 6-step automation:
1. **Scan** - AI product recognition from image URL
2. **MXIK** - Automatic tax code assignment (tasnif.soliq.uz)
3. **AI Card** - SEO-optimized Russian product card
4. **Pricing** - Competitive price calculation
5. **Infographics** - 6 professional images (1080x1440)
6. **Yandex** - Direct API upload to marketplace

**Input:**
```json
{
  "image_url": "https://example.com/product.jpg",
  "cost_price": 15000,
  "generate_infographics": true
}
```

**Output:** 6/6 steps completed, product on Yandex Market

### 2. AI Scanner ✅ NEW
**Endpoint**: `POST /api/ai/scan-from-url`

- Image URL scan (camera/web)
- Product recognition with 85%+ confidence
- Automatic category detection
- MXIK code assignment
- Price suggestion

### 3. Yandex Market Integration ✅
- **6 Campaigns** connected
- **83 Products** total (76 ready, 95%)
- **Real-time Dashboard**: `/api/yandex/dashboard/status`
- **Status Tracking**: `/api/yandex/offer/{id}/status`
- **Product Creation**: Full API automation

### 4. Nano Banana Infographics ✅ UPDATED
**Resolution**: 1080x1440 pixels (3:4 portrait)

6 infographic types:
1. Hero shot with floating ingredients
2. Features & benefits with icons
3. Ingredient composition
4. Usage instructions
5. Purity/quality badges
6. Lifestyle shot

Category-specific prompts for:
- Cosmetics: vitamins, citrus, plant leaves
- Food: nuts, chocolate, dried fruits
- Electronics: tech elements, sound waves
- Perfume: flower petals, molecules

### 5. MXIK/IKPU Codes ✅
- **250+ codes** from tasnif.soliq.uz
- **8-digit format** (full 17-digit available)
- **Auto-detection** by product category

### 6. Price Calculator ✅
- Commission: 8-15% by category
- Payout fees: 1.3-5.5%
- Logistics: FBS/FBY/DBS
- Margin: 15-30%

### 7. Real-time Dashboard ✅
**Frontend**: `/yandex-dashboard`

- Total products count
- Ready/moderation/rejected stats
- Auto-refresh every 30 seconds
- Campaign list

## Test Results (Jan 27, 2026)
- **Backend**: 100% (11/11 tests passed)
- **Full Automation**: 6/6 steps working
- **Infographics**: 1080x1440 generating
- **Yandex API**: Products created successfully

## API Endpoints Summary

### Full Automation (NEW)
- `POST /api/ai/full-automation` - One-click product creation
- `POST /api/ai/scan-from-url` - Scan from image URL

### Yandex Market
- `GET /api/yandex/dashboard/status` - Real-time stats
- `GET /api/yandex/offer/{id}/status` - Single product status
- `POST /api/yandex/partner/dashboard` - Partner dashboard
- `POST /api/yandex-market/full-process` - Full AI process
- `POST /api/yandex-market/create-product` - Create product

### AI Services
- `POST /api/ai/generate-infographics` - 6 images @ 1080x1440
- `GET /api/ai/status` - AI service status

### MXIK
- `GET /api/mxik/search?q=&lang=uz|ru`
- `GET /api/mxik/best-match?q=&category=`

## Yandex Statistics
| Metric | Value |
|--------|-------|
| Total Products | 83 |
| Ready | 76 (92%) |
| Campaigns | 6 |
| New (today) | 3 |

## Sample Generated Data
- **Offer IDs**: SCX-20260127094012, SCX-20260127094650
- **Infographics**: https://i.ibb.co/sDpkcxR/4e54acb182ec.jpg

## Upcoming Tasks (P1)

### Video Generation
- [ ] Sora 2 integration
- [ ] 8-second product video

### Revenue Share Automation
- [ ] Monthly sales sync cron job
- [ ] 4% revenue calculation
- [ ] Auto-blocking for overdue

### Mobile App
- [ ] Full automation integration
- [ ] Camera scan improvements

## Future Tasks (P2-P4)

### P2
- [ ] Uzum Market integration
- [ ] Push notifications

### P3
- [ ] Wildberries/Ozon
- [ ] Advanced analytics

### P4
- [ ] CI/CD pipeline
- [ ] API documentation

## Technical Notes

### Image Specifications
- Resolution: 1080x1440 pixels
- Aspect ratio: 3:4 (portrait)
- Format: PNG/JPG via ImgBB
- Max: 6 images per product

### Yandex API Requirements
- Weight & dimensions required
- Price: Integer only
- Max 10 images per upload
- Business ID: 197529861

## Last Updated
January 27, 2026 - Full Automation Complete (100% tests passed)

## Contact
- Telegram: @sellercloudx_support
- Email: sales@sellercloudx.com
