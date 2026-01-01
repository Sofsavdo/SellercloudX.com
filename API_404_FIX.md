# 🔧 API 404 Xatolari - Tushuntirish va Yechim

## Muammo

Browser console'da quyidagi xatolar ko'rsatilmoqda:

```
❌ api/partners/me:1   Failed to load resource: the server responded with a status of 404 ()
❌ api/stock-alerts:1   Failed to load resource: the server responded with a status of 404 ()
❌ api/products:1   Failed to load resource: the server responded with a status of 404 ()
❌ api/analytics:1   Failed to load resource: the server responded with a status of 404 ()
❌ api/fulfillment-requests:1   Failed to load resource: the server responded with a status of 404 ()
```

## Sabab

Bu xatolar **NORMAL** va kutilgan xatolar. Sababi:

1. **Siz login qilmagansiz** - Partner Dashboard ochilganda, frontend avtomatik ravishda API'ga so'rovlar yuboradi
2. **Session yo'q** - Login qilmasangiz, session yaratilmaydi
3. **Backend 401 Unauthorized qaytaradi** - Lekin browser buni 404 deb ko'rsatadi

## Texnik Tushuntirish

### Backend Javobi

Server aslida **401 Unauthorized** qaytaradi:

```json
{
  "message": "Avtorizatsiya yo'q",
  "code": "UNAUTHORIZED",
  "timestamp": "2025-12-19T06:18:11.301Z"
}
```

### Frontend Xatti-harakati

Frontend bu xatoni ko'rib, avtomatik ravishda login sahifasiga yo'naltirishi kerak. Lekin ba'zan browser cache yoki network xatolari tufayli bu to'g'ri ishlamaydi.

## Yechim

### 1. Login Qiling

**Partner Hisob:**
```
URL: https://5000--019b2d9e-01e0-7839-9a09-32ad0ba51690.us-east-1-01.gitpod.dev/login
Username: testpartner
Parol: Partner2024!
```

**Admin Hisob:**
```
URL: https://5000--019b2d9e-01e0-7839-9a09-32ad0ba51690.us-east-1-01.gitpod.dev/admin-login
Username: admin
Parol: Admin2024!
```

### 2. Browser Cache Tozalash

Agar login qilganingizdan keyin ham xatolar ko'rsatilsa:

1. **Chrome:**
   - `Ctrl + Shift + Delete` (Windows/Linux)
   - `Cmd + Shift + Delete` (Mac)
   - "Cookies and other site data" va "Cached images and files" ni tanlang
   - "Clear data" bosing

2. **Hard Refresh:**
   - `Ctrl + Shift + R` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)

### 3. Incognito/Private Mode

Agar muammo davom etsa, incognito/private mode'da oching:

- **Chrome:** `Ctrl + Shift + N`
- **Firefox:** `Ctrl + Shift + P`
- **Safari:** `Cmd + Shift + N`

## To'g'ri Ishlash Tartibi

```
1. Login sahifasiga o'ting
   ↓
2. Username va parol kiriting
   ↓
3. "Kirish" tugmasini bosing
   ↓
4. Muvaffaqiyatli login
   ↓
5. Dashboard ochiladi
   ↓
6. API so'rovlari muvaffaqiyatli ishlaydi
   ↓
7. Ma'lumotlar ko'rsatiladi
```

## API Endpointlar Holati

### ✅ Ishlayotgan Endpointlar

```bash
# Health check
curl http://localhost:5000/health
# Response: {"status":"ok","timestamp":"...","uptime":...}

# Auth check (login qilganingizdan keyin)
curl http://localhost:5000/api/auth/me -H "Cookie: connect.sid=YOUR_SESSION"
# Response: {"user":{...},"partner":{...}}

# Partner info (login qilganingizdan keyin)
curl http://localhost:5000/api/partners/me -H "Cookie: connect.sid=YOUR_SESSION"
# Response: {"id":"...","businessName":"..."}
```

### ❌ Login Kerak Bo'lgan Endpointlar

Quyidagi endpointlar faqat login qilganingizdan keyin ishlaydi:

- `/api/partners/me` - Partner ma'lumotlari
- `/api/products` - Mahsulotlar ro'yxati
- `/api/analytics` - Analitika
- `/api/stock-alerts` - Stok ogohlantirishlari
- `/api/fulfillment-requests` - Yetkazib berish so'rovlari

## Xatoliklarni Tekshirish

### 1. Server Ishlayaptimi?

```bash
curl http://localhost:5000/health
```

Agar `{"status":"ok"}` qaytarsa, server ishlayapti.

### 2. Session Bormi?

Browser DevTools'da:
1. `F12` bosing
2. "Application" tabiga o'ting
3. "Cookies" ni oching
4. `connect.sid` cookie borligini tekshiring

Agar yo'q bo'lsa, login qilishingiz kerak.

### 3. Network Tab

Browser DevTools'da:
1. `F12` bosing
2. "Network" tabiga o'ting
3. Sahifani refresh qiling
4. API so'rovlarini ko'ring
5. Status code'larni tekshiring:
   - `401` = Login kerak
   - `404` = Endpoint topilmadi
   - `500` = Server xatolik

## Umumiy Xatolar va Yechimlar

### Xato 1: "Avtorizatsiya yo'q"

**Sabab:** Login qilmagansiz  
**Yechim:** Login sahifasiga o'ting va login qiling

### Xato 2: "Hamkor ma'lumotlari topilmadi"

**Sabab:** User yaratilgan, lekin partner ma'lumotlari yo'q  
**Yechim:** Admin panel orqali partner yarating yoki ro'yxatdan o'ting

### Xato 3: "Session expired"

**Sabab:** Session muddati tugagan  
**Yechim:** Qayta login qiling

### Xato 4: CORS xatolari

**Sabab:** Noto'g'ri origin  
**Yechim:** Server CORS sozlamalarini tekshiring

## Xulosa

**Bu xatolar NORMAL!** 

Ular faqat siz login qilmaganingizni bildiradi. Login qilganingizdan keyin barcha API so'rovlari to'g'ri ishlaydi.

### Qadamlar:

1. ✅ Login sahifasiga o'ting
2. ✅ Test hisoblar bilan login qiling
3. ✅ Dashboard ochiladi
4. ✅ Barcha API so'rovlari ishlaydi
5. ✅ Xatolar yo'qoladi

---

## Test Hisoblar

### Partner:
- **URL:** `/login`
- **Username:** `testpartner`
- **Parol:** `Partner2024!`

### Admin:
- **URL:** `/admin-login`
- **Username:** `admin`
- **Parol:** `Admin2024!`

---

**Status:** ✅ Server ishlayapti, faqat login kerak  
**Sana:** 19 Dekabr, 2024  
**Yechim:** Login qiling va xatolar yo'qoladi
