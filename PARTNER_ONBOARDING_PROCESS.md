# Hamkor Onboarding Jarayoni - To'liq Qadamlar

## 📋 Hamkor Ro'yxatdan O'tishdan Sotuv Boshlanguncha

### **BOSQICH 1: Ro'yxatdan O'tish va Tasdiqlash**

#### Hamkor Qiladigan Qadamlar:
1. ✅ **Ro'yxatdan o'tish** (`/partner-registration`)
   - Username, email, password
   - Biznes nomi, telefon
   - INN (ixtiyoriy)
   - Biznes kategoriyasi

2. ✅ **Email tasdiqlash** (agar yoqilgan bo'lsa)
   - Email xabariga link bosish
   - Akkauntni faollashtirish

#### SellerCloudX Qiladigan Qadamlar:
1. ✅ **Ma'lumotlarni saqlash**
   - `users` jadvaliga saqlash
   - `partners` jadvaliga saqlash
   - Default tarif: `free_starter`
   - Status: `approved: false` (kutilmoqda)

2. ✅ **Admin xabarnomasi**
   - Admin panelga yangi so'rov ko'rinadi
   - Email xabar (agar yoqilgan bo'lsa)

---

### **BOSQICH 2: Admin Tasdiqlash**

#### Admin Qiladigan Qadamlar:
1. ✅ **Admin Panel → Partners → Pending**
   - Yangi hamkor so'rovini ko'rish
   - Ma'lumotlarni tekshirish

2. ✅ **Tasdiqlash yoki Rad Elish**
   - "Tasdiqlash" tugmasi
   - Yoki "Rad Elish" + sabab

#### SellerCloudX Qiladigan Qadamlar:
1. ✅ **Tasdiqlash bo'lsa:**
   - `partners.approved = true`
   - `users.isActive = true`
   - Hamkorga email xabar
   - WebSocket orqali real-time xabar

2. ✅ **Rad etilgan bo'lsa:**
   - `partners.approved = false`
   - Hamkorga email xabar (sabab bilan)
   - Ma'lumotlar saqlanadi (qayta ko'rib chiqish uchun)

---

### **BOSQICH 3: Hamkor Kabinetga Kirish**

#### Hamkor Qiladigan Qadamlar:
1. ✅ **Login** (`/login`)
   - Username/email + password
   - Session yaratiladi

2. ✅ **Dashboard ko'rish**
   - Agar `approved = false` → "Tasdiqlash kutilmoqda" xabari
   - Agar `approved = true` → To'liq dashboard

3. ✅ **Profil to'ldirish** (ixtiyoriy)
   - Biznes ma'lumotlari
   - Yuridik ma'lumotlar
   - Bank ma'lumotlari

---

### **BOSQICH 4: Marketplace Integratsiyasi**

#### Hamkor Qiladigan Qadamlar:
1. ✅ **Marketplace ulash**
   - Dashboard → Marketplace tab
   - Uzum, Wildberries, Yandex, Ozon tanlash
   - API kalitlarini kiritish
   - "Ulash" tugmasi

#### SellerCloudX Qiladigan Qadamlar:
1. ✅ **API test qilish**
   - Marketplace API ga so'rov
   - Ulanishni tekshirish
   - Xatolik bo'lsa xabar

2. ✅ **Ma'lumotlarni saqlash**
   - `marketplace_integrations` jadvaliga
   - `active = true` (agar muvaffaqiyatli bo'lsa)
   - WebSocket orqali real-time xabar

---

### **BOSQICH 5: Mahsulot Qo'shish**

#### Hamkor Qiladigan Qadamlar:
1. ✅ **Mahsulot yaratish** (2 usul):

   **A) Minimal (Qo'lda):**
   - Dashboard → "Yangi Mahsulot (Minimal)"
   - Nomi, qoldiq, tannarx, 1 rasm
   - "Mahsulot Yaratish" tugmasi

   **B) AI Scanner:**
   - Dashboard → "AI Scanner"
   - Kamerani yoqish
   - Mahsulotni rasmga olish
   - AI avtomatik ma'lumotlarni to'ldiradi
   - Faqat tannarx va qoldiq kiritish

#### SellerCloudX Qiladigan Qadamlar:
1. ✅ **Mahsulotni saqlash**
   - `products` jadvaliga
   - `marketplaceCardGenerated = false`

2. ✅ **AI Manager ishga tushadi** (avtomatik):
   - AI Scanner bo'lsa → rasm tahlili (GPT-4 Vision)
   - Mahsulot ma'lumotlarini to'ldirish
   - Marketplace card generatsiyasi
   - Har bir ulangan marketplace uchun:
     - SEO-optimizatsiya qilingan sarlavha
     - Tavsif generatsiyasi
     - Rasm generatsiyasi (Flux.1 yoki Ideogram)
     - Narx optimizatsiyasi
     - Marketplace ga yuklash

3. ✅ **Real-time xabar**
   - WebSocket orqali progress
   - "Mahsulot yaratildi", "Card generatsiya qilinmoqda", "Yuklandi"

---

### **BOSQICH 6: AI Manager Avtomatik Ishlari**

#### SellerCloudX (AI Manager) Qiladigan Qadamlar:
1. ✅ **Mahsulot kartochkalarini yaratish**
   - Har bir marketplace uchun
   - SEO optimizatsiyasi
   - Rasm generatsiyasi
   - Marketplace ga yuklash

2. ✅ **Narx optimizatsiyasi**
   - Raqobatchilar narxlarini kuzatish
   - Dinamik narx o'zgartirish
   - Real-time yangilanish

3. ✅ **Qoldiq boshqaruvi**
   - Qoldiq kamayganda xabar
   - Auto-reorder (agar yoqilgan bo'lsa)

4. ✅ **Marketplace monitoring**
   - Xatolarni aniqlash
   - Avtomatik tuzatish
   - Chat javoblari (avtomatik)

5. ✅ **Analytics va hisobotlar**
   - Sotuv statistikasi
   - Performance monitoring
   - Tavsiyalar

---

### **BOSQICH 7: Sotuv Boshlanishi**

#### Marketplace Qiladigan Qadamlar:
1. ✅ **Buyurtma keladi**
   - Marketplace → SellerCloudX webhook
   - Yoki API orqali polling

#### SellerCloudX Qiladigan Qadamlar:
1. ✅ **Buyurtmani qabul qilish**
   - `orders` jadvaliga saqlash
   - Hamkorga real-time xabar (WebSocket)
   - Email xabar (agar yoqilgan bo'lsa)

2. ✅ **AI Manager avtomatik:**
   - Buyurtmani tasdiqlash (agar sozlangan bo'lsa)
   - Status yangilash
   - Marketplace ga javob

3. ✅ **Hamkorga xabar**
   - Dashboard → Orders tab
   - Real-time yangilanish

---

### **BOSQICH 8: Foyda Olish**

#### SellerCloudX Qiladigan Qadamlar:
1. ✅ **Sotuv hisoblash**
   - Revenue = Sotuv narxi
   - Cost = Tannarx
   - Profit = Revenue - Cost - Commission

2. ✅ **Komissiya hisoblash**
   - Tarif bo'yicha komissiya %
   - `commission_paid` jadvaliga saqlash

3. ✅ **Analytics yangilash**
   - `analytics` jadvaliga
   - Hamkor dashboard yangilanadi
   - Real-time statistikalar

4. ✅ **To'lov (agar kerak bo'lsa)**
   - Hamkor balansi yangilanadi
   - To'lov tarixi saqlanadi

---

## 📊 Jarayon Diagrammasi

```
1. Ro'yxatdan O'tish
   ↓
2. Admin Tasdiqlash
   ↓
3. Login + Dashboard
   ↓
4. Marketplace Ulash
   ↓
5. Mahsulot Qo'shish
   ↓
6. AI Manager (Avtomatik)
   ├─ Card Generatsiya
   ├─ Narx Optimizatsiya
   ├─ Qoldiq Boshqaruv
   └─ Monitoring
   ↓
7. Sotuv Boshlanishi
   ↓
8. Foyda Olish
```

---

## ⏱️ Vaqt Jadvali

- **Ro'yxatdan o'tish:** 2-5 daqiqa
- **Admin tasdiqlash:** 1-24 soat (admin tekshirishi)
- **Marketplace ulash:** 5-10 daqiqa
- **Mahsulot qo'shish:** 1-2 daqiqa
- **AI Card generatsiya:** 2-5 daqiqa (paralel)
- **Sotuv boshlanishi:** Marketplace ga bog'liq
- **Foyda olish:** Sotuv bo'lgandan keyin darhol

---

## ✅ Tekshiruv Ro'yxati

- [ ] Hamkor ro'yxatdan o'ta oladimi?
- [ ] Admin tasdiqlay oladimi?
- [ ] Marketplace ulana oladimi?
- [ ] Mahsulot qo'sha oladimi?
- [ ] AI Manager ishlaydimi?
- [ ] Sotuvlar kuzatiladimi?
- [ ] Foyda hisoblanadimi?

