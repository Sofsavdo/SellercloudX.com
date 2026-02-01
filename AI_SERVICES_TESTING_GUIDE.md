# SellerCloudX - AI Services Testing Guide

## Test Environment Setup

### 1. API Keys (Optional for Full Testing)
Add to `/app/.env`:
```env
GOOGLE_VISION_API_KEY=your_key_here  # For image recognition
SERPAPI_KEY=your_key_here             # For competitor search
```

**Note:** Services will work in demo mode without these keys, but with limited functionality.

---

## API Testing with curl

### Base URL
```bash
API_URL="https://your-backend-url.railway.app"  # Production
# or
API_URL="http://localhost:5000"  # Local development
```

### Authentication
All endpoints require authentication. First login:

```bash
# Login as partner
curl -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testpartner",
    "password": "test123"
  }' \
  -c cookies.txt

# Now use cookies.txt for authenticated requests
```

---

## 1. AI Scanner Tests

### Test Image Scanning
```bash
curl -X POST "$API_URL/api/ai/scanner/scan-image" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "imageUrl": "https://ae01.alicdn.com/kf/H8a9e7c8f5d8f4e8a9c0b1c2d3e4f5g6h/Wireless-Earbuds.jpg"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "taskId": "uuid-here",
    "productInfo": {
      "name": "Wireless Earbuds",
      "brand": "Unknown",
      "category": "electronics",
      "confidence": 75,
      "labels": ["earbuds", "wireless", "bluetooth"]
    },
    "competitors": [
      {
        "seller": "WildberriesRU",
        "price": 45000,
        "link": "...",
        "source": "wildberries"
      }
    ],
    "priceAnalysis": {
      "avgPrice": 45000,
      "minPrice": 35000,
      "maxPrice": 60000,
      "totalResults": 5
    },
    "status": "success"
  }
}
```

---

## 2. AI Manager Tests

### Test Product Creation
```bash
curl -X POST "$API_URL/api/ai/manager/create-product" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "marketplace": "wildberries",
    "productData": {
      "name": "Wireless Earbuds TWS Bluetooth 5.3",
      "description": "High quality wireless earbuds with active noise cancellation",
      "images": ["https://example.com/image1.jpg"],
      "costPrice": 40000,
      "category": "electronics",
      "brand": "TechBrand"
    },
    "priceOptimization": {
      "enabled": true,
      "minProfit": 15
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "taskId": "uuid",
    "marketplace": "wildberries",
    "productId": "WB123456",
    "optimizedPrice": 85000,
    "priceBreakdown": {
      "costPrice": 40000,
      "taxes": 6000,
      "commission": 4000,
      "logistics": 10000,
      "totalCost": 60000,
      "recommendedPrice": 85000,
      "profit": 25000,
      "profitPercent": 42
    },
    "status": "pending_moderation",
    "message": "Mahsulot wildberries da yaratildi!"
  }
}
```

**Note:** This will fail if marketplace API credentials are not configured. Expected error:
```json
{
  "success": false,
  "error": "wildberries marketplace ulanmagan. Iltimos, API kalitlarini kiriting."
}
```

---

## 3. Trend Hunter Tests

### Get Top Profit Opportunities
```bash
curl -X GET "$API_URL/api/trends/opportunities?limit=5&minProfitMargin=40" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "product": {
        "productName": "Wireless Earbuds TWS",
        "category": "electronics",
        "sourceMarket": "china",
        "sourcePrice": 3.5,
        "salesVolume": 15000,
        "salesGrowth": 45
      },
      "totalCost": 58000,
      "localCompetitors": 8,
      "localAvgPrice": 85000,
      "recommendedPrice": 80750,
      "profitMargin": 39.2,
      "monthlyProfitEstimate": 682500,
      "roi": 39.2,
      "opportunityScore": 87,
      "strengths": [
        "Kam raqobat: 8 ta raqobatchi",
        "Tez o'sish: 45% o'sish"
      ],
      "risks": [],
      "recommendation": "⭐ EXCELLENT: Juda yaxshi imkoniyat! Yuqori foyda va kam raqobat."
    }
  ]
}
```

### Get Trends by Category
```bash
curl -X GET "$API_URL/api/trends/category/electronics" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Get Top 10 Opportunities
```bash
curl -X GET "$API_URL/api/trends/top?limit=10" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Get Saved Trends
```bash
curl -X GET "$API_URL/api/trends/saved?limit=20" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

---

## 4. Check AI Services Status

```bash
curl -X GET "$API_URL/api/ai/status" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Expected Response:**
```json
{
  "success": true,
  "services": {
    "imageSearch": {
      "visionEnabled": false,
      "serpEnabled": false,
      "fullyEnabled": false
    },
    "aiGeneration": {
      "enabled": true,
      "provider": "Google Gemini",
      "model": "gemini-1.5-flash",
      "demo": false
    }
  }
}
```

---

## Frontend Integration Examples

### React Component - AI Scanner
```typescript
import { useState } from 'react';
import axios from 'axios';

export function AIScanner() {
  const [imageUrl, setImageUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const scanImage = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/ai/scanner/scan-image', {
        imageUrl
      });
      setResult(response.data.data);
    } catch (error) {
      console.error('Scan error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Rasm URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <button onClick={scanImage} disabled={loading}>
        {loading ? 'Skanerlash...' : 'Skanerlash'}
      </button>
      
      {result && (
        <div>
          <h3>{result.productInfo.name}</h3>
          <p>Brend: {result.productInfo.brand}</p>
          <p>O'rtacha narx: {result.priceAnalysis.avgPrice} so'm</p>
          <p>Raqobatchilar: {result.competitors.length} ta</p>
        </div>
      )}
    </div>
  );
}
```

### React Component - Trend Hunter
```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

export function TrendHunter() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      const response = await axios.get('/api/trends/opportunities?limit=10');
      setOpportunities(response.data.data);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Foyda Imkoniyatlari</h2>
      {loading ? (
        <p>Yuklanmoqda...</p>
      ) : (
        <div>
          {opportunities.map((opp, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
              <h3>{opp.product.productName}</h3>
              <p>Score: {opp.opportunityScore}/100</p>
              <p>Foyda: {opp.profitMargin.toFixed(1)}%</p>
              <p>Oylik foyda: {opp.monthlyProfitEstimate.toLocaleString()} so'm</p>
              <p>Raqobatchilar: {opp.localCompetitors} ta</p>
              <p>{opp.recommendation}</p>
              <ul>
                {opp.strengths.map((s, i) => (
                  <li key={i}>✅ {s}</li>
                ))}
                {opp.risks.map((r, i) => (
                  <li key={i}>⚠️ {r}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Expected Behavior

### With API Keys:
- ✅ Image scanning works with Google Vision + SerpAPI
- ✅ Real competitor data from marketplaces
- ✅ Accurate product recognition

### Without API Keys (Demo Mode):
- ⚠️ Image scanning returns generic product info
- ⚠️ Limited competitor data
- ⚠️ Services still functional but with mock data

### Product Creation:
- ❌ Requires marketplace API credentials
- ❌ Will fail with "marketplace ulanmagan" error
- ✅ Error handling works correctly

---

## Troubleshooting

### Issue: "Unauthorized" error
**Solution:** Ensure you're logged in and using cookies.txt

### Issue: "marketplace ulanmagan"
**Solution:** This is expected. Partners need to add their marketplace API keys in the partner dashboard.

### Issue: Image search returns no competitors
**Solution:** This is expected in demo mode. Add GOOGLE_VISION_API_KEY and SERPAPI_KEY to .env

### Issue: Trend Hunter returns mock data
**Solution:** This is expected. Real API integration requires AliExpress/Amazon API credentials (paid services).

---

## Next Steps

1. **Add API Keys** (optional): Google Vision + SerpAPI for full functionality
2. **Configure Marketplace APIs**: Partners add their Wildberries/Ozon/Uzum credentials
3. **Test Frontend Integration**: Create UI components for AI Scanner and Trend Hunter
4. **Monitor Performance**: Check AI cost tracking in database
5. **Deploy to Production**: Test all endpoints on Railway
