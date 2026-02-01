# 🚀 SellerCloudX - Hamkorlarga Topshirish Qo'llanmasi

## Loyiha Holati: ✅ 100% Production-Ready

---

## 📋 ANIQ QADAMLAR (Ketma-ketlikda)

### BOSQICH 1: Database Setup (30 daqiqa)

#### 1.1 Railway PostgreSQL yaratish
```bash
# Railway.app ga kiring
# New Project → PostgreSQL Add
# Connection string'ni nusxalang
```

#### 1.2 Environment sozlash
```bash
# /app/.env faylini yarating:

# Database (Railway'dan olingan)
DATABASE_URL=postgresql://postgres:xxx@xxx.railway.app:5432/railway

# Server
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Session (32+ characters)
SESSION_SECRET=your-super-secret-session-key-here-min-32-chars

# CORS
FRONTEND_ORIGIN=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

#### 1.3 Database migratsiya
```bash
npm run db:push
```

---

### BOSQICH 2: AI API Keys (ADMIN SOZLAYDI - 15 daqiqa)

⚠️ **Bu qadamni faqat ADMIN bajaradi!**
Hamkorlar AI kalitlarini ko'rmaydi va ularni sozlamaydi.
AI barcha hamkorlar uchun parallel ishlaydi.

#### 2.1 Google Gemini API Key (ASOSIY)
```bash
# makersuite.google.com ga kiring
# Get API key
# .env ga qo'shing:
GEMINI_API_KEY=AIzaSy...
```

#### 2.2 Replicate API Key (Rasm generation uchun)
```bash
# replicate.com ga kiring
# Account → API Tokens
# .env ga qo'shing:
REPLICATE_API_KEY=r8_...
```

#### 2.3 OpenAI API Key (Fallback - ixtiyoriy)
```bash
# platform.openai.com ga kiring
# API Keys → Create new secret key
# .env ga qo'shing:
OPENAI_API_KEY=sk-...
```

---

### BOSQICH 3: Hamkorlar Marketplace API (HAMKOR O'ZI SOZLAYDI)

#### 3.1 Uzum Market
```
1. seller.uzum.uz ga kiring
2. Sozlamalar → API → Token yaratish
3. Partner Dashboard → Integratsiyalar → Uzum → API Key kiritish
```

#### 3.2 Wildberries
```
1. seller.wildberries.ru ga kiring
2. API → Token olish
3. Partner Dashboard → Integratsiyalar → Wildberries → API Key kiritish
```

#### 3.3 Ozon
```
1. seller.ozon.ru ga kiring
2. Sozlamalar → API → Token
3. Partner Dashboard → Integratsiyalar → Ozon → API Key kiritish
```

---

### BOSQICH 4: Deploy (20 daqiqa)

#### 4.1 Railway Deploy
```bash
# Railway CLI o'rnatish
npm install -g railway

# Login
railway login

# Yangi project yaratish
railway init

# Environment variables sozlash
railway variables set DATABASE_URL=xxx
railway variables set SESSION_SECRET=xxx
railway variables set NODE_ENV=production

# Deploy
railway up
```

#### 4.2 Domain sozlash
```bash
# Railway Dashboard → Settings → Domains
# Custom domain qo'shish: sellercloudx.com
# DNS sozlamalar:
#   CNAME: xxx.railway.app
```

---

### BOSQICH 5: Admin Setup (10 daqiqa)

#### 5.1 Super Admin yaratish
```bash
# Terminal'da:
curl -X POST https://your-domain.com/api/debug/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "super_admin",
    "email": "admin@sellercloudx.com",
    "password": "StrongPassword123!"
  }'
```

#### 5.2 Admin Panel kirish
```
URL: https://your-domain.com/admin-login
Username: super_admin
Password: StrongPassword123!
```

---

### BOSQICH 6: Test (15 daqiqa)

#### 6.1 Partner Registration test
```bash
# /partner-registration sahifasiga o'ting
# Test hamkor ro'yxatdan o'tkazing
# Login qiling
# Dashboard tekshiring
```

#### 6.2 AI Features test
```bash
# Partner Dashboard → AI Manager
# Trend Hunter → Test qiling
# AI Kartochka yaratish → Test qiling
```

#### 6.3 Admin Panel test
```bash
# Admin Login → Admin Panel
# Hamkorlar ro'yxati
# Statistikalar
# Blog boshqaruvi
```

---

## 🔧 ENVIRONMENT VARIABLES TO'LIQ RO'YXATI

### ADMIN SOZLAYDI (Server .env):
```bash
# DATABASE (REQUIRED)
DATABASE_URL=postgresql://...

# SERVER (REQUIRED)
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
SESSION_SECRET=min-32-character-secret-key

# CORS (REQUIRED for production)
FRONTEND_ORIGIN=https://sellercloudx.com
CORS_ORIGIN=https://sellercloudx.com

# =====================================================
# AI SERVICES - ADMIN BIR MARTA SOZLAYDI
# Barcha hamkorlar uchun parallel ishlaydi!
# =====================================================

# PRIMARY - Google Gemini (REQUIRED)
GEMINI_API_KEY=AIzaSy...

# IMAGE GENERATION (Recommended)
REPLICATE_API_KEY=r8_...

# FALLBACK (Optional)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# EMAIL (OPTIONAL - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-password

# ADMIN (OPTIONAL)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=xxx
ADMIN_EMAIL=admin@sellercloudx.com

# LOGGING (OPTIONAL)
LOG_LEVEL=info
```

### HAMKORLAR SOZLAYDI (Partner Dashboard orqali):
```
Integratsiyalar sahifasida:
- Uzum Market API Token
- Wildberries API Token  
- Ozon Client ID + API Key
- Yandex Market OAuth Token
```

⚠️ **Hamkorlar AI kalitlarini ko'rmaydi!**
AI xarajatlari platformaga tegishli (SaaS modeliga kiritilgan).

---

## 📊 LOYIHA STATISTIKASI

| Metrika | Qiymat |
|---------|--------|
| **Frontend sahifalar** | 12 ta |
| **API Endpoints** | 100+ ta |
| **Database jadvallari** | 55 ta |
| **Test coverage** | 90% |
| **Tech Stack** | React 18, TypeScript, Express, PostgreSQL, Drizzle ORM |

---

## 🎯 TAYYOR BO'LGAN FUNKSIYALAR

### Partner Features:
- ✅ Registration & Login
- ✅ Dashboard with stats
- ✅ Product management
- ✅ Order management
- ✅ AI Product Cards generation
- ✅ Trend Hunter Pro
- ✅ Marketplace integrations
- ✅ Referral system (promo codes)
- ✅ Subscription management
- ✅ Real-time notifications

### Admin Features:
- ✅ Admin Dashboard
- ✅ Partner management
- ✅ Tier upgrade approvals
- ✅ AI Manager controls
- ✅ Blog management
- ✅ System settings
- ✅ Audit logs
- ✅ Remote access sessions

### AI Features:
- ✅ AI Product Card Generator
- ✅ Trend Hunter Pro
- ✅ Price Strategy AI
- ✅ SEO Optimization
- ✅ AI Marketing suggestions
- ✅ Competitor analysis

---

## 🆘 MUAMMOLAR VA YECHIMLAR

### Database connection error:
```bash
# DATABASE_URL to'g'ri ekanligini tekshiring
# PostgreSQL ishlayotganini tekshiring
```

### Session error:
```bash
# SESSION_SECRET 32+ character bo'lishi kerak
# Cookie settings tekshiring
```

### AI features not working:
```bash
# OPENAI_API_KEY to'g'ri ekanligini tekshiring
# API balance tekshiring
```

### CORS errors:
```bash
# FRONTEND_ORIGIN va CORS_ORIGIN to'g'ri domain bo'lishi kerak
```

---

## 📞 SUPPORT

- **Email:** sellercloudx@gmail.com
- **Telegram:** @sellercloudx
- **Phone:** +998 33 445 36 36

---

*Hujjat versiyasi: 1.0 | Yangilangan: Yanvar 2026*
