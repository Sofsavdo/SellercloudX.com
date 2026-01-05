# Railway PostgreSQL Setup - Qadam-Qadam Yo'riqnoma

## 1️⃣ Railway Dashboard'ga Kiring

1. **Railway.app** saytiga kiring: https://railway.app
2. **Login** qiling (GitHub account bilan)
3. **SellerCloudX** loyihangizni toping va oching

---

## 2️⃣ PostgreSQL Database Qo'shish

### Qadam 1: New Service Qo'shish
1. Loyiha ichida **"+ New"** tugmasini bosing
2. **"Database"** ni tanlang
3. **"Add PostgreSQL"** ni tanlang

### Qadam 2: Database Yaratilishini Kuting
- Railway avtomatik PostgreSQL database yaratadi
- Bu 1-2 daqiqa vaqt oladi
- Database tayyor bo'lgach, yangi service ko'rinadi

---

## 3️⃣ DATABASE_URL Environment Variable Olish

### Qadam 1: PostgreSQL Service'ni Oching
1. Yangi yaratilgan **PostgreSQL** service'ni bosing
2. **"Variables"** tab'ga o'ting

### Qadam 2: DATABASE_URL ni Nusxalash
1. **"DATABASE_URL"** o'zgaruvchisini toping
2. Uning qiymatini **nusxalang** (Copy)
3. Format: `postgresql://user:password@host:port/database`

**Misol:**
```
postgresql://postgres:password123@containers-us-west-123.railway.app:5432/railway
```

---

## 4️⃣ SellerCloudX Service'ga DATABASE_URL Qo'shish

### Qadam 1: SellerCloudX Service'ni Oching
1. **SellerCloudX** (asosiy web service) ni bosing
2. **"Variables"** tab'ga o'ting

### Qadam 2: DATABASE_URL Qo'shish
1. **"+ New Variable"** tugmasini bosing
2. **Variable Name:** `DATABASE_URL`
3. **Variable Value:** PostgreSQL'dan nusxalagan URL'ni joylashtiring
4. **"Add"** tugmasini bosing

### Qadam 3: Qo'shimcha Environment Variables
Quyidagi o'zgaruvchilarni ham qo'shing:

```bash
NODE_ENV=production
PORT=8080
SESSION_SECRET=your-super-secret-key-change-this-in-production-2026
CORS_ORIGIN=https://sellercloudx.com,https://www.sellercloudx.com
```

**MUHIM:** `SESSION_SECRET` ni o'zingizning xavfsiz kalitingizga o'zgartiring!

---

## 5️⃣ Database Migration Sozlash

### Qadam 1: Build Command Yangilash
1. **"Settings"** tab'ga o'ting
2. **"Build Command"** ni toping
3. Quyidagi command'ni kiriting:

```bash
npm run build && npm run db:push
```

Bu:
- Loyihani build qiladi
- Database schema'ni PostgreSQL'ga push qiladi

### Qadam 2: Start Command Tekshirish
**"Start Command"** quyidagicha bo'lishi kerak:
```bash
npm run start
```

---

## 6️⃣ Redeploy va Test Qilish

### Qadam 1: Redeploy
1. **"Deployments"** tab'ga o'ting
2. **"Redeploy"** tugmasini bosing yoki
3. Yangi commit push qiling (avtomatik deploy)

### Qadam 2: Deploy Logs'ni Kuzatish
1. **"Deployments"** tab'da
2. Eng yangi deploy'ni oching
3. **"View Logs"** ni bosing
4. Quyidagi xabarlarni kuting:

```
✅ PostgreSQL connection initialized
✅ Database tables created successfully
✅ Admin user created successfully
✅ Partner user created successfully
🚀 Server running on port 8080
```

---

## 7️⃣ Database Migration Muvaffaqiyatli Bo'lganini Tekshirish

### Deploy Logs'da Quyidagilarni Ko'ring:

**✅ Muvaffaqiyatli:**
```
📦 PostgreSQL: Tables should be created via migrations
🔍 Checking for admin user...
🔧 Creating admin user...
✅ Admin user created successfully!
🔑 Admin Login Credentials:
   Username: Medik
   Password: Medik9298
   Email: medik@sellercloudx.com
```

**❌ Xato Bo'lsa:**
```
❌ Error: Connection refused
❌ Error: Invalid DATABASE_URL
```

Agar xato bo'lsa:
1. DATABASE_URL to'g'ri nusxalanganini tekshiring
2. PostgreSQL service ishlab turganini tasdiqlang
3. Redeploy qiling

---

## 8️⃣ Production URL'ni Oching va Test Qiling

### Qadam 1: Production URL
1. **"Settings"** tab'da
2. **"Domains"** ni toping
3. Railway URL'ni oching (masalan: `sellercloudx.up.railway.app`)

### Qadam 2: Login Test
**Admin Login:**
- URL: `https://your-app.up.railway.app/admin-login`
- Username: `Medik`
- Password: `Medik9298`

**Partner Login:**
- URL: `https://your-app.up.railway.app/login`
- Username: `partner`
- Password: `partner123`

---

## 9️⃣ Custom Domain Qo'shish (Ixtiyoriy)

Agar `sellercloudx.com` domeningiz bo'lsa:

### Qadam 1: Railway'da Domain Qo'shish
1. **"Settings"** → **"Domains"**
2. **"Custom Domain"** tugmasini bosing
3. `sellercloudx.com` ni kiriting
4. Railway sizga DNS record beradi

### Qadam 2: DNS Sozlash
1. Domain registrar'ingizga kiring (Namecheap, GoDaddy, etc.)
2. DNS settings'ga o'ting
3. Railway bergan CNAME yoki A record'ni qo'shing

**Misol:**
```
Type: CNAME
Name: @
Value: your-app.up.railway.app
```

---

## 🔟 Troubleshooting

### Muammo 1: "Connection refused" xatosi
**Yechim:**
- DATABASE_URL to'g'ri nusxalanganini tekshiring
- PostgreSQL service ishlab turganini tasdiqlang
- Environment variables'ni qayta tekshiring

### Muammo 2: "Table does not exist" xatosi
**Yechim:**
- Build command'da `npm run db:push` borligini tekshiring
- Redeploy qiling
- Deploy logs'da migration muvaffaqiyatli bo'lganini ko'ring

### Muammo 3: Login ishlamayapti
**Yechim:**
- Browser console'ni oching (F12)
- Network tab'da `/api/auth/login` request'ni tekshiring
- Cookie settings to'g'ri bo'lganini tasdiqlang
- SESSION_SECRET o'rnatilganini tekshiring

---

## ✅ Yakuniy Tekshirish Ro'yxati

- [ ] PostgreSQL database yaratildi
- [ ] DATABASE_URL environment variable qo'shildi
- [ ] SESSION_SECRET qo'shildi
- [ ] Build command: `npm run build && npm run db:push`
- [ ] Start command: `npm run start`
- [ ] Deploy muvaffaqiyatli tugadi
- [ ] Admin user yaratildi (logs'da ko'rindi)
- [ ] Partner user yaratildi (logs'da ko'rindi)
- [ ] Production URL ochiladi
- [ ] Landing page ko'rinadi
- [ ] Admin login ishlaydi
- [ ] Partner login ishlaydi

---

## 📞 Yordam Kerak Bo'lsa

Agar qaysidir qadamda muammo bo'lsa:
1. Deploy logs'ni to'liq nusxalang
2. Browser console xatolarini ko'ring
3. Network tab'da API request'larni tekshiring
4. Menga xato xabarlarini yuboring

**Email:** SellercloudX@gmail.com
**Domain:** SellerCloudX.com

---

## 🎯 Keyingi Qadamlar

PostgreSQL muvaffaqiyatli ulangandan keyin:
1. ✅ Login to'liq ishlaydi
2. ✅ Database barqaror bo'ladi
3. ✅ Production tayyor
4. 🚀 Custom domain qo'shish
5. 🔒 SSL/HTTPS avtomatik (Railway beradi)

**Omad!** 🚀
