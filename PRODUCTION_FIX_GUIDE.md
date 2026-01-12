# 🚀 SellerCloudX - Production Xatolarni Tuzatish

## Hozirgi Xatolar va Yechimlar

### ❌ Xato 1: `column "optimized_title" does not exist`
**Sabab:** PostgreSQL database'da `products` jadvalidagi `optimized_title` ustuni yo'q.

**Yechim:** ✅ `migrate.ts` faylida tuzatildi. Server qayta ishga tushsa avtomatik qo'shiladi.

---

### ❌ Xato 2: AI Services Disabled
```
⚠️  Gemini API key not found. Gemini service disabled.
⚠️  No image AI services enabled. Using fallback.
⚠️  Video Generation Service disabled (no API keys found)
```

**Sabab:** AI API kalitlari sozlanmagan.

**Yechim:** Railway environment variables ga quyidagilarni qo'shing:

```bash
# ASOSIY - Gemini (eng muhim)
GEMINI_API_KEY=AIzaSy...

# Qo'shimcha (ixtiyoriy)
REPLICATE_API_KEY=r8_...
OPENAI_API_KEY=sk-...
```

---

## 📋 Production Deploy Qadamlari

### 1. GitHub ga Push qiling
```bash
git add .
git commit -m "Fix PostgreSQL migrations - add optimized_title column"
git push origin main
```

### 2. Railway Redeploy
Railway avtomatik qayta deploy qiladi. Agar avtomatik bo'lmasa:
- Railway Dashboard → Deployments → Redeploy

### 3. Environment Variables tekshiring (Railway)
```
DATABASE_URL=postgresql://...  ✅
SESSION_SECRET=...             ✅
NODE_ENV=production            ✅
GEMINI_API_KEY=AIzaSy...       ⬅️ QO'SHING!
```

---

## 🔧 Qo'shilgan Migratsiyalar

### Products jadvali uchun:
- ✅ `optimized_title` - AI tomonidan yaratilgan SEO sarlavha
- ✅ `low_stock_threshold` - Kam zaxira chegarasi
- ✅ `is_active` - Mahsulot faolmi
- ✅ `barcode` - Shtrix kod

### Yangi jadvallar:
- ✅ `ai_generated_products` - AI yaratgan kartochkalar
- ✅ `audit_logs` - Audit loglari
- ✅ `notifications` - Bildirishnomalar
- ✅ `ai_tasks` - AI vazifalar
- ✅ `trending_products` - Trend mahsulotlar
- ✅ `pricing_tiers` - Narx tariflari
- ✅ `subscriptions` - Obunalar

---

## 🔑 AI API Kalitlarini Olish

### Google Gemini (ASOSIY):
1. https://makersuite.google.com ga kiring
2. "Get API Key" bosing
3. API kalitni nusxalang
4. Railway → Variables → `GEMINI_API_KEY` ga qo'shing

### Replicate (Rasm uchun - ixtiyoriy):
1. https://replicate.com ga kiring
2. Account → API Tokens
3. Token yarating
4. Railway → `REPLICATE_API_KEY` ga qo'shing

---

## ✅ Deploy dan keyin tekshirish

```bash
# Health check
curl https://sellercloudx.com/api/health

# Logs tekshiring
Railway Dashboard → Logs

# Kutilgan natija:
✅ PostgreSQL connected
✅ All tables created successfully
✅ Server running on port 8080
```

---

## 📞 Muammo bo'lsa

Agar xatolar davom etsa:
1. Railway logs'ni to'liq ko'ring
2. Xato xabarini menga yuboring
3. Men tezda tuzatib beraman

---

*Yangilangan: Yanvar 2026*
