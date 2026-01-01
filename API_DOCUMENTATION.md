# 📚 SELLERCLOUDX API DOCUMENTATION

## Base URL
```
Production: https://sellercloudx.com/api
Development: http://localhost:5000/api
```

## Authentication
All API requests require authentication via session cookies.

```javascript
// Login first
POST /api/login
{
  "username": "your_username",
  "password": "your_password"
}
```

---

## 💳 PAYMENT API

### Create Payment
```http
POST /api/payment/create-payment
Content-Type: application/json

{
  "amount": 300000,
  "pricingTier": "starter_pro",
  "billingPeriod": "monthly",
  "provider": "click"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://my.click.uz/services/pay?...",
  "transactionId": "SUB-partner-123-1234567890"
}
```

### Verify Payment
```http
POST /api/payment/verify/:transactionId
```

### Get Payment History
```http
GET /api/payment/history
```

---

## 📱 WHATSAPP API

### Send Message
```http
POST /api/whatsapp/send
Content-Type: application/json

{
  "phone": "+998901234567",
  "type": "order_confirmation",
  "data": {
    "orderNumber": "ORD-12345",
    "totalAmount": 500000,
    "items": [...]
  }
}
```

### Send Bulk Messages
```http
POST /api/whatsapp/send-bulk
Content-Type: application/json

{
  "notifications": [
    {
      "partnerId": "partner-123",
      "phone": "+998901234567",
      "type": "marketing",
      "data": {...}
    }
  ]
}
```

---

## 🤖 TELEGRAM API

### Send Message
```http
POST /api/telegram/send
Content-Type: application/json

{
  "chatId": 123456789,
  "message": "Your order has been shipped!"
}
```

---

## 🎥 VIDEO GENERATION API

### Generate Product Video
```http
POST /api/premium/video/generate
Content-Type: application/json

{
  "productName": "iPhone 15 Pro",
  "description": "Latest flagship smartphone",
  "images": ["url1", "url2", "url3"],
  "duration": 15
}
```

**Response:**
```json
{
  "success": true,
  "taskId": "task-123",
  "videoUrl": "https://..."
}
```

### Check Video Status
```http
GET /api/premium/video/status/:taskId
```

---

## 🔍 COMPETITOR INTELLIGENCE API

### Analyze Competitors
```http
POST /api/premium/competitor/analyze
Content-Type: application/json

{
  "productName": "iPhone 15 Pro",
  "marketplaces": ["uzum", "wildberries"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "competitors": [...],
    "priceRecommendation": {
      "suggestedPrice": 14250000,
      "minPrice": 13000000,
      "maxPrice": 16000000,
      "averagePrice": 15000000,
      "competitorCount": 15,
      "reasoning": "..."
    },
    "marketInsights": {...}
  }
}
```

### Monitor Price
```http
POST /api/premium/competitor/monitor-price
Content-Type: application/json

{
  "productName": "iPhone 15 Pro",
  "currentPrice": 15000000
}
```

---

## 📊 ADVANCED ANALYTICS API

### Get Dashboard
```http
GET /api/advanced/analytics/dashboard?startDate=2024-01-01&endDate=2024-12-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRevenue": 45000000,
      "totalOrders": 234,
      "averageOrderValue": 192307,
      "conversionRate": 3.5,
      "growthRate": 23.5
    },
    "predictions": [...],
    "recommendations": [...],
    "alerts": [...],
    "trends": [...]
  }
}
```

### Predict Customer LTV
```http
GET /api/advanced/analytics/customer-ltv/:customerId
```

### Predict Churn
```http
GET /api/advanced/analytics/churn-prediction
```

### Analyze Seasonal Trends
```http
GET /api/advanced/analytics/seasonal-trends
```

---

## 🤝 AFFILIATE API

### Get Stats
```http
GET /api/advanced/affiliate/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReferrals": 12,
    "activeReferrals": 8,
    "totalEarnings": 2400000,
    "pendingEarnings": 500000,
    "conversionRate": 66.7,
    "tier": "Silver",
    "nextTierProgress": 60
  }
}
```

### Generate Affiliate Link
```http
POST /api/advanced/affiliate/generate-link
Content-Type: application/json

{
  "campaign": "summer2024"
}
```

### Get Leaderboard
```http
GET /api/advanced/affiliate/leaderboard?limit=10
```

### Request Payout
```http
POST /api/advanced/affiliate/request-payout
Content-Type: application/json

{
  "amount": 1000000
}
```

---

## 📨 SMS API

### Send SMS
```http
POST /api/premium/sms/send
Content-Type: application/json

{
  "phone": "+998901234567",
  "message": "Your order has been confirmed!",
  "provider": "eskiz"
}
```

### Send OTP
```http
POST /api/premium/sms/send-otp
Content-Type: application/json

{
  "phone": "+998901234567",
  "code": "123456"
}
```

---

## 📦 PRODUCTS API

### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "sku": "IPH15PRO",
  "price": 15000000,
  "stockQuantity": 10,
  "category": "Electronics"
}
```

### Get Products
```http
GET /api/products
```

### Update Product
```http
PUT /api/products/:id
```

### Delete Product
```http
DELETE /api/products/:id
```

---

## 🛒 ORDERS API

### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerPhone": "+998901234567",
  "totalAmount": 500000,
  "items": [...]
}
```

### Get Orders
```http
GET /api/orders
```

### Update Order Status
```http
PUT /api/orders/:id/status
Content-Type: application/json

{
  "status": "shipped",
  "trackingNumber": "TRACK123"
}
```

---

## 🔐 AUTHENTICATION API

### Login
```http
POST /api/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

### Logout
```http
POST /api/logout
```

### Get Current User
```http
GET /api/user
```

---

## 📊 RATE LIMITS

- **Standard:** 100 requests per 15 minutes
- **Premium:** 500 requests per 15 minutes
- **Enterprise:** Unlimited

---

## 🔒 SECURITY

All API requests must:
- Use HTTPS in production
- Include valid session cookies
- Pass CORS validation
- Respect rate limits

---

## 📝 ERROR CODES

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## 💡 EXAMPLES

### Complete Payment Flow
```javascript
// 1. Create payment
const payment = await fetch('/api/payment/create-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    amount: 300000,
    pricingTier: 'starter_pro',
    billingPeriod: 'monthly',
    provider: 'click'
  })
});

const { paymentUrl, transactionId } = await payment.json();

// 2. Redirect to payment gateway
window.location.href = paymentUrl;

// 3. After payment, verify
const verify = await fetch(`/api/payment/verify/${transactionId}`, {
  method: 'POST',
  credentials: 'include'
});
```

### Generate Video
```javascript
// 1. Generate video
const video = await fetch('/api/premium/video/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    productName: 'iPhone 15 Pro',
    description: 'Latest flagship',
    images: ['url1', 'url2'],
    duration: 15
  })
});

const { taskId } = await video.json();

// 2. Poll for status
const checkStatus = async () => {
  const status = await fetch(`/api/premium/video/status/${taskId}`, {
    credentials: 'include'
  });
  const { status: videoStatus, videoUrl } = await status.json();
  
  if (videoStatus === 'completed') {
    console.log('Video ready:', videoUrl);
  } else {
    setTimeout(checkStatus, 5000); // Check again in 5s
  }
};

checkStatus();
```

---

## 🚀 SDKs (Coming Soon)

- JavaScript/TypeScript SDK
- Python SDK
- PHP SDK
- Ruby SDK

---

## 📞 SUPPORT

- **Email:** api@sellercloudx.com
- **Telegram:** @sellercloudx_api
- **Documentation:** https://docs.sellercloudx.com

---

**Last Updated:** December 2024
**API Version:** 3.0.0
