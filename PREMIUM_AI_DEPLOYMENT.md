# 🚀 Premium AI Features - Deployment Guide

## Version 1.0.0
**Date:** December 18, 2024  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [API Configuration](#api-configuration)
6. [Payment Gateway Setup](#payment-gateway-setup)
7. [Frontend Deployment](#frontend-deployment)
8. [Backend Deployment](#backend-deployment)
9. [Testing](#testing)
10. [Monitoring](#monitoring)
11. [Rollback Plan](#rollback-plan)

---

## 🎯 Overview

This guide covers the deployment of Premium AI Features including:
- **Video Generation Studio** - AI-powered product videos
- **Bulk Product Processor** - Process hundreds of products at once
- **Premium Payment Integration** - Click, Payme, Uzcard support
- **Usage Tracking** - Monitor feature usage and costs

### Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   API Routes    │
│   (Express)     │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌──────────┐
│Services│ │ Payment  │
│        │ │ Gateway  │
└────────┘ └──────────┘
    │           │
    ↓           ↓
┌────────┐ ┌──────────┐
│OpenAI  │ │Click/    │
│Runway  │ │Payme     │
└────────┘ └──────────┘
```

---

## ✅ Prerequisites

### Required Services

1. **OpenAI Account**
   - GPT-4 Vision API access
   - GPT-3.5 Turbo API access
   - Minimum $100 credit

2. **Runway ML Account**
   - Video generation API access
   - Minimum $50 credit

3. **Payment Gateways**
   - Click merchant account
   - Payme merchant account
   - Uzcard merchant account (optional)

4. **Infrastructure**
   - Node.js 18+ server
   - PostgreSQL 14+ database
   - Redis 6+ for caching
   - 4GB+ RAM
   - 50GB+ storage

### Required Tools

```bash
node --version  # v18.0.0+
npm --version   # v9.0.0+
psql --version  # PostgreSQL 14+
redis-cli --version  # Redis 6+
```

---

## 🔧 Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/Sofsavdo/SellercloudX.com.git
cd SellercloudX.com
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Install multer for file uploads (if not already installed)
npm install multer
npm install @types/multer --save-dev
```

### 3. Environment Variables

Create `.env.production` file:

```bash
# ==================== SERVER ====================
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://sellercloudx.com

# ==================== DATABASE ====================
DATABASE_URL=postgresql://user:password@host:5432/sellercloudx

# ==================== REDIS ====================
REDIS_URL=redis://localhost:6379

# ==================== AI SERVICES ====================
# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENAI_ORG_ID=org-xxxxxxxxxxxxx

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Runway ML (Video Generation)
RUNWAY_API_KEY=xxxxxxxxxxxxx

# ==================== PAYMENT GATEWAYS ====================
# Click
CLICK_MERCHANT_ID=xxxxx
CLICK_SECRET_KEY=xxxxxxxxxxxxx
CLICK_SERVICE_ID=xxxxx

# Payme
PAYME_MERCHANT_ID=xxxxxxxxxxxxx
PAYME_SECRET_KEY=xxxxxxxxxxxxx

# Uzcard (Optional)
UZCARD_MERCHANT_ID=xxxxx
UZCARD_SECRET_KEY=xxxxxxxxxxxxx

# ==================== FILE STORAGE ====================
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes

# ==================== SECURITY ====================
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-super-secret-session-key-change-this

# ==================== MONITORING ====================
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
LOG_LEVEL=info
```

### 4. Verify Configuration

```bash
# Check environment variables
node -e "console.log(process.env.OPENAI_API_KEY ? '✅ OpenAI configured' : '❌ OpenAI missing')"
node -e "console.log(process.env.RUNWAY_API_KEY ? '✅ Runway configured' : '❌ Runway missing')"
node -e "console.log(process.env.CLICK_MERCHANT_ID ? '✅ Click configured' : '❌ Click missing')"
```

---

## 💾 Database Setup

### 1. Create Premium Features Tables

```sql
-- Premium feature transactions
CREATE TABLE IF NOT EXISTS premium_transactions (
  id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  partner_id INTEGER REFERENCES partners(id),
  feature_id VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'UZS',
  provider VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Premium feature usage
CREATE TABLE IF NOT EXISTS premium_usage (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER REFERENCES partners(id),
  feature_id VARCHAR(100) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Video generation tasks
CREATE TABLE IF NOT EXISTS video_generation_tasks (
  id SERIAL PRIMARY KEY,
  task_id VARCHAR(255) UNIQUE NOT NULL,
  partner_id INTEGER REFERENCES partners(id),
  product_name VARCHAR(255) NOT NULL,
  template VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  video_url TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Bulk processing batches
CREATE TABLE IF NOT EXISTS bulk_processing_batches (
  id SERIAL PRIMARY KEY,
  batch_id VARCHAR(255) UNIQUE NOT NULL,
  partner_id INTEGER REFERENCES partners(id),
  total_products INTEGER NOT NULL,
  processed_products INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  status VARCHAR(50) NOT NULL,
  file_path TEXT,
  results JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_premium_transactions_partner ON premium_transactions(partner_id);
CREATE INDEX idx_premium_transactions_status ON premium_transactions(status);
CREATE INDEX idx_premium_usage_partner ON premium_usage(partner_id);
CREATE INDEX idx_video_tasks_partner ON video_generation_tasks(partner_id);
CREATE INDEX idx_video_tasks_status ON video_generation_tasks(status);
CREATE INDEX idx_bulk_batches_partner ON bulk_processing_batches(partner_id);
CREATE INDEX idx_bulk_batches_status ON bulk_processing_batches(status);
```

### 2. Run Migrations

```bash
# Run database migrations
npm run db:migrate

# Verify tables created
psql $DATABASE_URL -c "\dt premium_*"
```

---

## 🔌 API Configuration

### 1. Register Routes

Update `server/index.ts`:

```typescript
import premiumFeaturesRoutes from './routes/premiumFeaturesRoutes';

// Register premium features routes
app.use('/api/premium', premiumFeaturesRoutes);
```

### 2. Configure File Upload

Create `uploads` directory:

```bash
mkdir -p uploads/videos
mkdir -p uploads/bulk
mkdir -p uploads/temp

# Set permissions
chmod 755 uploads
```

### 3. Configure CORS

Update CORS settings for payment callbacks:

```typescript
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    'https://my.click.uz',
    'https://checkout.paycom.uz'
  ],
  credentials: true
};
```

---

## 💳 Payment Gateway Setup

### 1. Click Integration

1. **Register Merchant Account**
   - Visit: https://click.uz/business
   - Complete registration
   - Get merchant ID and secret key

2. **Configure Callback URL**
   ```
   https://api.sellercloudx.com/api/payment/callback/click
   ```

3. **Test Integration**
   ```bash
   curl -X POST https://api.sellercloudx.com/api/premium/payment/create \
     -H "Authorization: Bearer TOKEN" \
     -d '{"featureId":"video-generation","amount":2,"provider":"click"}'
   ```

### 2. Payme Integration

1. **Register Merchant Account**
   - Visit: https://payme.uz/business
   - Complete registration
   - Get merchant ID and secret key

2. **Configure Callback URL**
   ```
   https://api.sellercloudx.com/api/payment/callback/payme
   ```

3. **Test Integration**
   ```bash
   curl -X POST https://api.sellercloudx.com/api/premium/payment/create \
     -H "Authorization: Bearer TOKEN" \
     -d '{"featureId":"video-generation","amount":2,"provider":"payme"}'
   ```

### 3. Webhook Configuration

Set up webhooks for payment notifications:

```typescript
// Payment webhook handler
router.post('/payment/webhook/:provider', async (req, res) => {
  const { provider } = req.params;
  
  // Verify webhook signature
  // Process payment notification
  // Update transaction status
  
  res.json({ success: true });
});
```

---

## 🎨 Frontend Deployment

### 1. Build Frontend

```bash
# Build production bundle
npm run build

# Verify build
ls -lh dist/
```

### 2. Deploy Components

Ensure these components are included:

```
client/src/components/
├── PremiumAIFeatures.tsx
├── VideoGenerationStudio.tsx
├── BulkProductProcessor.tsx
└── PremiumPaymentModal.tsx
```

### 3. Update Navigation

Add Premium Features to partner dashboard navigation:

```typescript
// In PartnerDashboard.tsx or Navigation.tsx
{
  name: 'Premium AI',
  href: '/premium',
  icon: Sparkles
}
```

### 4. Configure Routes

```typescript
// In App.tsx or routes configuration
<Route path="/premium" element={<PremiumAIFeatures />} />
<Route path="/premium/video" element={<VideoGenerationStudio />} />
<Route path="/premium/bulk" element={<BulkProductProcessor />} />
```

---

## 🖥️ Backend Deployment

### 1. Build Backend

```bash
# Compile TypeScript
npm run build:server

# Verify build
ls -lh dist/server/
```

### 2. Start Services

```bash
# Start Redis
sudo systemctl start redis

# Start PostgreSQL
sudo systemctl start postgresql

# Start application
npm run start:prod
```

### 3. Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/server/index.js --name sellercloudx

# Configure auto-restart
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### 4. Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.sellercloudx.com;

    # File upload size
    client_max_body_size 10M;

    location /api/premium {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout for long-running requests
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}
```

---

## 🧪 Testing

### 1. Smoke Tests

```bash
# Test API health
curl https://api.sellercloudx.com/health

# Test premium features endpoint
curl https://api.sellercloudx.com/api/premium/usage/stats \
  -H "Authorization: Bearer TOKEN"
```

### 2. Feature Tests

```bash
# Test video generation
curl -X POST https://api.sellercloudx.com/api/premium/video/generate \
  -H "Authorization: Bearer TOKEN" \
  -F "productName=Test" \
  -F "description=Test" \
  -F "template=modern-product" \
  -F "image0=@test.jpg"

# Test bulk processing
curl -X POST https://api.sellercloudx.com/api/premium/bulk/process \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@products.xlsx"

# Test payment creation
curl -X POST https://api.sellercloudx.com/api/premium/payment/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"featureId":"video-generation","amount":2,"provider":"click"}'
```

### 3. Load Testing

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 10 --num 50 \
  https://api.sellercloudx.com/api/premium/usage/stats
```

---

## 📊 Monitoring

### 1. Application Monitoring

```bash
# Install monitoring tools
npm install @sentry/node
npm install prom-client

# Configure Sentry
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### 2. Metrics to Track

- **Video Generation**
  - Success rate
  - Average processing time
  - Error rate
  - Cost per video

- **Bulk Processing**
  - Success rate
  - Products per minute
  - Error rate
  - Cost per batch

- **Payments**
  - Success rate
  - Average transaction time
  - Failed payments
  - Revenue

### 3. Alerts

Set up alerts for:
- API error rate > 5%
- Video generation failure rate > 10%
- Payment failure rate > 5%
- Server CPU > 80%
- Server memory > 90%
- Disk space < 10GB

---

## 🔄 Rollback Plan

### If Deployment Fails

1. **Immediate Rollback**
   ```bash
   # Stop current version
   pm2 stop sellercloudx
   
   # Restore previous version
   git checkout previous-stable-tag
   npm install
   npm run build
   pm2 restart sellercloudx
   ```

2. **Database Rollback**
   ```bash
   # Rollback migrations
   npm run db:rollback
   ```

3. **Verify Rollback**
   ```bash
   # Check application health
   curl https://api.sellercloudx.com/health
   
   # Verify core features work
   curl https://api.sellercloudx.com/api/partners/me \
     -H "Authorization: Bearer TOKEN"
   ```

### Rollback Triggers

Rollback if:
- Error rate > 10% for 5 minutes
- Payment processing fails completely
- Database connection issues
- Critical security vulnerability discovered

---

## 📝 Post-Deployment Checklist

- [ ] All services running
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Payment gateways tested
- [ ] File uploads working
- [ ] Video generation tested
- [ ] Bulk processing tested
- [ ] Payment flow tested
- [ ] Monitoring active
- [ ] Alerts configured
- [ ] Backup system verified
- [ ] Documentation updated
- [ ] Team notified
- [ ] Users notified (if needed)

---

## 🎯 Success Criteria

Deployment is successful when:

1. **Functionality**
   - ✅ All premium features accessible
   - ✅ Video generation works end-to-end
   - ✅ Bulk processing completes successfully
   - ✅ Payments process correctly

2. **Performance**
   - ✅ API response time < 200ms
   - ✅ Video generation < 3 minutes
   - ✅ Bulk processing < 10 minutes (100 products)
   - ✅ Payment processing < 30 seconds

3. **Reliability**
   - ✅ Error rate < 1%
   - ✅ Uptime > 99.9%
   - ✅ No data loss
   - ✅ Successful rollback tested

4. **Business**
   - ✅ Revenue tracking working
   - ✅ Usage analytics accurate
   - ✅ Cost tracking functional
   - ✅ Reporting available

---

## 📞 Support Contacts

**Technical Issues:**
- DevOps: devops@sellercloudx.com
- Backend: backend@sellercloudx.com
- Frontend: frontend@sellercloudx.com

**Payment Issues:**
- Click Support: support@click.uz
- Payme Support: support@payme.uz

**AI Services:**
- OpenAI Support: support@openai.com
- Runway Support: support@runwayml.com

---

## 📚 Additional Resources

- [Premium AI Testing Guide](./PREMIUM_AI_TESTING_GUIDE.md)
- [AI Manager Final Summary](./AI_MANAGER_FINAL_SUMMARY.md)
- [Smart AI Manager Guide](./SMART_AI_MANAGER_GUIDE.md)
- [API Documentation](./API_DOCUMENTATION.md)

---

**Deployment Status:** ✅ Ready for Production  
**Last Updated:** December 18, 2024  
**Version:** 1.0.0  
**Next Review:** After 1 week in production
