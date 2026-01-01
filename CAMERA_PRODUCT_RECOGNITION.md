# Camera + AI Product Recognition Feature

## 🎯 Maqsad
Hamkorning qo'l mehnatini maksimal darajada kamaytirish. Faqat mahsulot rasmini olish kifoya - AI qolgan hamma ishni bajaradi.

## 📱 Jarayon (Yangi Usul)

### Eski Usul (Ko'p qo'l mehnati):
1. ❌ Hamkor mahsulot nomini yozadi
2. ❌ Tannarxni kiritadi  
3. ❌ Rasmlarni yuklaydi
4. ❌ Kategoriyani tanlaydi
5. ❌ Tavsifni yozadi
6. ❌ Adminga yuboradi
7. ⏳ Admin tasdiqlaydi
8. ✅ AI Manager kartochka yaratadi

### Yangi Usul (Minimal qo'l mehnati):
1. 📸 Hamkor kamerani ochadi
2. 📸 Mahsulot rasmini oladi
3. 🤖 AI mahsulotni taniydi (Google Lens kabi)
4. 🔍 AI tarmoqdan 100% aniq mahsulotni topadi
5. 🎨 AI kartochka yaratadi (rasm, infografika, tavsif)
6. ✅ Avtomatik marketplace'larga joylanadi

**Natija:** 8 qadam → 2 qadam! 75% vaqt tejash!

## 🏗️ Arxitektura

### 1. Frontend (Hamkor Kabineti)

#### CameraProductCapture Component
```typescript
interface CameraProductCaptureProps {
  onProductRecognized: (product: RecognizedProduct) => void;
}

interface RecognizedProduct {
  name: string;
  category: string;
  brand?: string;
  images: string[];
  marketplaceLinks: {
    uzum?: string;
    wildberries?: string;
    ozon?: string;
    yandex?: string;
  };
  averagePrice: number;
  confidence: number; // 0-100%
}
```

**Funksiyalar:**
- 📸 Kamera ochish (front/back)
- 🖼️ Rasm olish
- 🔄 Qayta olish imkoniyati
- 📤 Serverga yuborish
- ⏳ Loading holati
- ✅ Natijani ko'rsatish

### 2. Backend API

#### Image Recognition Service
```typescript
class ProductRecognitionService {
  // Google Cloud Vision API
  async recognizeProduct(imageBuffer: Buffer): Promise<ProductInfo> {
    // 1. Google Vision API - mahsulotni tanish
    const visionResult = await this.googleVision.detectProduct(imageBuffer);
    
    // 2. Marketplace'lardan qidirish
    const marketplaceResults = await this.searchMarketplaces(visionResult);
    
    // 3. Eng mos mahsulotni tanlash
    const bestMatch = this.findBestMatch(marketplaceResults);
    
    return bestMatch;
  }
  
  // Marketplace'lardan qidirish
  async searchMarketplaces(productInfo: VisionResult): Promise<MarketplaceProduct[]> {
    const searches = await Promise.all([
      this.searchUzum(productInfo),
      this.searchWildberries(productInfo),
      this.searchOzon(productInfo),
      this.searchYandex(productInfo)
    ]);
    
    return searches.flat();
  }
  
  // Eng yaxshi moslikni topish
  findBestMatch(products: MarketplaceProduct[]): RecognizedProduct {
    // Similarity score hisoblash
    // - Rasm o'xshashligi (image similarity)
    // - Nom o'xshashligi (text similarity)
    // - Kategoriya mosligini
    // - Brend mosligini
    
    const scored = products.map(p => ({
      ...p,
      score: this.calculateSimilarity(p)
    }));
    
    // Eng yuqori score'li mahsulotni qaytarish
    return scored.sort((a, b) => b.score - a.score)[0];
  }
}
```

### 3. AI Manager Integration

#### Automatic Card Generation
```typescript
class AutomaticCardGenerator {
  async generateFromRecognizedProduct(
    recognizedProduct: RecognizedProduct,
    partnerId: string
  ): Promise<ProductCard> {
    
    // 1. Rasmlarni yuklab olish va optimizatsiya qilish
    const optimizedImages = await this.downloadAndOptimizeImages(
      recognizedProduct.images
    );
    
    // 2. Infografika yaratish
    const infographics = await this.generateInfographics(
      recognizedProduct,
      optimizedImages
    );
    
    // 3. SEO-optimizatsiyalangan tavsif yaratish
    const description = await this.generateSEODescription(recognizedProduct);
    
    // 4. Narxni tahlil qilish va tavsiya berish
    const pricingStrategy = await this.analyzePricing(recognizedProduct);
    
    // 5. Kartochka yaratish
    const card = await this.createProductCard({
      partnerId,
      name: recognizedProduct.name,
      category: recognizedProduct.category,
      brand: recognizedProduct.brand,
      images: [...optimizedImages, ...infographics],
      description,
      suggestedPrice: pricingStrategy.recommendedPrice,
      costPrice: pricingStrategy.estimatedCost,
      marketplaceData: recognizedProduct.marketplaceLinks
    });
    
    // 6. Marketplace'larga joylashtirish
    await this.publishToMarketplaces(card, partnerId);
    
    return card;
  }
}
```

## 🔌 API Integrations

### Google Cloud Vision API
**Endpoint:** `https://vision.googleapis.com/v1/images:annotate`

**Features:**
- ✅ Product detection
- ✅ Label detection
- ✅ Logo detection
- ✅ Web detection (similar images)
- ✅ Text detection (OCR)

**Pricing:**
- First 1,000 requests/month: FREE
- After: $1.50 per 1,000 requests

**Alternative:** 
- AWS Rekognition
- Azure Computer Vision
- Open source: CLIP, BLIP

### Marketplace Search APIs

#### Uzum Search
```typescript
async searchUzum(query: string, imageUrl?: string): Promise<Product[]> {
  // Uzum API orqali qidirish
  // Agar API bo'lmasa - web scraping
}
```

#### Wildberries Search
```typescript
async searchWildberries(query: string): Promise<Product[]> {
  // Wildberries API
  // https://openapi.wildberries.ru/
}
```

#### Ozon Search
```typescript
async searchOzon(query: string): Promise<Product[]> {
  // Ozon API
  // https://docs.ozon.ru/api/seller/
}
```

#### Yandex Market Search
```typescript
async searchYandex(query: string): Promise<Product[]> {
  // Yandex Market API
  // https://yandex.ru/dev/market/
}
```

## 📊 Database Schema

### recognized_products
```sql
CREATE TABLE recognized_products (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL REFERENCES partners(id),
  original_image TEXT NOT NULL, -- S3/local path
  recognition_data JSON NOT NULL, -- Vision API response
  matched_product_id TEXT, -- Final matched product
  confidence_score REAL, -- 0-100
  marketplace_matches JSON, -- All found matches
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at INTEGER NOT NULL,
  processed_at INTEGER
);
```

### product_cards (enhanced)
```sql
ALTER TABLE products ADD COLUMN recognition_id TEXT REFERENCES recognized_products(id);
ALTER TABLE products ADD COLUMN auto_generated INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN marketplace_source TEXT; -- uzum, wb, ozon, yandex
ALTER TABLE products ADD COLUMN source_url TEXT; -- Original marketplace URL
```

## 🎨 UI/UX Design

### Camera Capture Screen
```
┌─────────────────────────────────────┐
│  📸 Mahsulot Rasmini Oling          │
├─────────────────────────────────────┤
│                                     │
│     ┌─────────────────────┐        │
│     │                     │        │
│     │   📷 CAMERA VIEW    │        │
│     │                     │        │
│     │   [Mahsulotni       │        │
│     │    markazga         │        │
│     │    joylashtiring]   │        │
│     │                     │        │
│     └─────────────────────┘        │
│                                     │
│     [🔄 Kamerani almashtirish]     │
│                                     │
│     [📸 RASM OLISH]                │
│                                     │
│  💡 Maslahat:                       │
│  • Yaxshi yoritilgan joyda oling   │
│  • Mahsulotni to'liq ko'rinsin      │
│  • Brend/logotip ko'rinsin          │
└─────────────────────────────────────┘
```

### Recognition Results Screen
```
┌─────────────────────────────────────┐
│  🔍 Mahsulot Topildi!               │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────┐  Nike Air Max 270     │
│  │  [IMG]  │  Sportiv poyabzal     │
│  └─────────┘                        │
│                                     │
│  ✅ Aniqlash: 95%                   │
│  🏷️ Kategoriya: Poyabzal           │
│  🏢 Brend: Nike                     │
│                                     │
│  📊 Marketplace'larda topildi:      │
│  • Uzum: 850,000 so'm              │
│  • Wildberries: 4,200 ₽            │
│  • Ozon: 4,500 ₽                   │
│                                     │
│  💰 Tavsiya narx: 900,000 so'm     │
│                                     │
│  [✅ Tasdiqlash va Yaratish]       │
│  [🔄 Qayta Olish]                  │
│                                     │
└─────────────────────────────────────┘
```

### Auto-Generation Progress
```
┌─────────────────────────────────────┐
│  🤖 AI Kartochka Yaratyapti...      │
├─────────────────────────────────────┤
│                                     │
│  ✅ Mahsulot tanildi                │
│  ✅ Rasmlar yuklab olindi           │
│  ⏳ Infografika yaratyapti...       │
│  ⏳ SEO tavsif yaratyapti...        │
│  ⏳ Narx tahlil qilyapti...         │
│  ⏳ Marketplace'larga joylashtirish │
│                                     │
│  [████████░░] 80%                   │
│                                     │
│  ⏱️ Taxminan 30 soniya qoldi        │
│                                     │
└─────────────────────────────────────┘
```

## 🔐 Security & Privacy

### Image Storage
- ✅ Encrypt images at rest
- ✅ Secure S3/storage with signed URLs
- ✅ Auto-delete after 30 days (GDPR)
- ✅ Partner can delete anytime

### API Keys
- ✅ Store Google Vision API key in environment
- ✅ Rate limiting per partner
- ✅ Cost tracking and limits

### Data Privacy
- ✅ Images not shared with third parties
- ✅ Recognition data encrypted
- ✅ Compliance with data protection laws

## 📈 Performance Optimization

### Image Processing
```typescript
// Optimize image before sending to API
async optimizeImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1024, 1024, { fit: 'inside' })
    .jpeg({ quality: 85 })
    .toBuffer();
}
```

### Caching
```typescript
// Cache recognition results
const cacheKey = `recognition:${imageHash}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Cache for 7 days
await redis.setex(cacheKey, 7 * 24 * 3600, JSON.stringify(result));
```

### Batch Processing
```typescript
// Process multiple images in parallel
const results = await Promise.all(
  images.map(img => this.recognizeProduct(img))
);
```

## 🧪 Testing Strategy

### Unit Tests
- ✅ Image upload and validation
- ✅ Vision API integration
- ✅ Marketplace search
- ✅ Similarity scoring
- ✅ Card generation

### Integration Tests
- ✅ End-to-end camera → card flow
- ✅ API error handling
- ✅ Fallback mechanisms

### User Testing
- ✅ Test with real products
- ✅ Measure accuracy rate
- ✅ Collect user feedback
- ✅ A/B testing

## 📊 Success Metrics

### Accuracy
- **Target:** 90%+ correct product identification
- **Measure:** Partner confirmation rate

### Speed
- **Target:** < 30 seconds total time
- **Breakdown:**
  - Image capture: 5s
  - Recognition: 10s
  - Card generation: 15s

### User Satisfaction
- **Target:** 4.5+ stars
- **Measure:** In-app rating after use

### Adoption
- **Target:** 70%+ partners use this feature
- **Measure:** Usage analytics

## 🚀 Implementation Phases

### Phase 1: MVP (2 weeks)
- ✅ Camera capture UI
- ✅ Google Vision API integration
- ✅ Basic product matching
- ✅ Manual confirmation step

### Phase 2: Enhancement (2 weeks)
- ✅ Marketplace search integration
- ✅ Automatic card generation
- ✅ Infographic creation
- ✅ SEO optimization

### Phase 3: Automation (1 week)
- ✅ Remove manual confirmation
- ✅ Auto-publish to marketplaces
- ✅ Batch processing
- ✅ Analytics dashboard

### Phase 4: Optimization (ongoing)
- ✅ Improve accuracy
- ✅ Reduce processing time
- ✅ Add more marketplaces
- ✅ ML model training

## 💰 Cost Estimation

### Google Vision API
- 1,000 requests/month: FREE
- 10,000 requests/month: $15
- 100,000 requests/month: $150

### Storage (S3/equivalent)
- 100GB images: $2.30/month
- 1TB images: $23/month

### Processing (serverless)
- Lambda/Cloud Functions: ~$5-20/month

**Total:** $20-200/month depending on usage

## 🎓 User Guide

### For Partners

**1. Mahsulot Qo'shish:**
```
Hamkor Kabineti → Mahsulotlar → Yangi Mahsulot → 📸 Kamera
```

**2. Rasm Olish:**
- Mahsulotni yaxshi yoritilgan joyga qo'ying
- Kamerani mahsulotga qarating
- Brend/logotip ko'rinsin
- "Rasm Olish" tugmasini bosing

**3. Natijani Tekshirish:**
- AI topgan mahsulotni ko'ring
- Agar to'g'ri bo'lsa - "Tasdiqlash"
- Agar noto'g'ri - "Qayta Olish"

**4. Avtomatik Yaratish:**
- AI kartochka yaratadi (30 soniya)
- Marketplace'larga joylaydi
- Tayyor!

### For Admins

**Monitoring:**
- Recognition accuracy dashboard
- Failed recognitions review
- Cost tracking
- Usage analytics

## 🔄 Fallback Mechanisms

### If Recognition Fails
1. Show top 3 matches with confidence scores
2. Allow partner to select correct one
3. Learn from selection (ML training)

### If No Match Found
1. Allow manual product entry
2. Save for future training
3. Suggest similar products

### If API Down
1. Queue for later processing
2. Notify partner
3. Allow manual entry meanwhile

## 📝 Next Steps

1. **Setup Google Cloud Vision API**
2. **Create CameraCapture component**
3. **Implement recognition service**
4. **Build marketplace search**
5. **Integrate with AI Manager**
6. **Test with real products**
7. **Deploy to production**
8. **Monitor and optimize**

---

**Bu feature hamkorlar uchun game-changer bo'ladi! 🚀**
