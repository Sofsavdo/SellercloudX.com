# 🧪 Role-Based Testing Guide

## Version 1.0.0
**Sana:** 19 Dekabr, 2024

---

## 📋 Rollar va Vazifalari

### 1. Partner Role
### 2. Admin Role
### 3. Customer Role (Future)

---

## 1. PARTNER ROLE

### Kirish Huquqlari

✅ **Ruxsat berilgan:**
- `/login` - Partner login sahifasi
- `/partner-dashboard` - Asosiy dashboard
- `/partner-registration` - Ro'yxatdan o'tish
- `/api/partners/me` - O'z ma'lumotlari
- `/api/products` - O'z mahsulotlari
- `/api/analytics` - O'z statistikasi
- `/api/chat/room` - O'z chat xonasi
- `/api/chat/messages` - O'z xabarlari

❌ **Ruxsat berilmagan:**
- `/admin-panel` - Admin panel
- `/admin-login` - Admin login
- `/api/admin/*` - Admin API'lar
- `/api/chat/rooms` - Barcha chat xonalar (faqat admin)

### Partner Funksiyalari

#### 1. Dashboard
```typescript
// Partner Dashboard Components
- PartnerStats: Umumiy statistika
- ProductForm: Mahsulot qo'shish
- OrderManagement: Buyurtmalar
- InventoryManagement: Inventar
- ProfitDashboard: Foyda tahlili
- ReferralDashboard: Referral dasturi
- ChatSystem: Admin bilan chat
```

#### 2. Mahsulot Boshqaruvi
```typescript
// CRUD Operations
POST   /api/products          // Mahsulot qo'shish
GET    /api/products          // Mahsulotlar ro'yxati
GET    /api/products/:id      // Mahsulot ma'lumotlari
PUT    /api/products/:id      // Mahsulot yangilash
DELETE /api/products/:id      // Mahsulot o'chirish
```

#### 3. Chat Tizimi
```typescript
// Partner → Admin Chat
GET  /api/chat/room           // O'z chat xonasi
GET  /api/chat/messages       // O'z xabarlari
POST /api/chat/messages       // Xabar yuborish
```

**Xususiyatlar:**
- Partner faqat admin bilan gaplashadi
- Bir chat xona (1-to-1)
- Real-time xabarlar
- Xabar o'qilganligini ko'rish

#### 4. Analitika
```typescript
GET /api/analytics            // O'z statistikasi
GET /api/analytics/revenue    // Daromad tahlili
GET /api/analytics/products   // Mahsulot tahlili
```

#### 5. Referral Dasturi
```typescript
GET  /api/referrals/stats     // Referral statistikasi
POST /api/referrals/generate-code  // Promo kod yaratish
GET  /api/referrals/earnings  // Daromad
```

### Partner Test Scenariylari

#### Scenario 1: Login va Dashboard
```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c partner_cookies.txt \
  -d '{"username":"testpartner","password":"Partner2024!"}'

# 2. Get partner info
curl http://localhost:5000/api/partners/me \
  -b partner_cookies.txt

# 3. Get products
curl http://localhost:5000/api/products \
  -b partner_cookies.txt

# 4. Get analytics
curl http://localhost:5000/api/analytics \
  -b partner_cookies.txt
```

#### Scenario 2: Mahsulot Qo'shish
```bash
curl -X POST http://localhost:5000/api/products \
  -b partner_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test description",
    "price": "100000",
    "quantity": 10,
    "category": "electronics"
  }'
```

#### Scenario 3: Chat
```bash
# Get chat room
curl http://localhost:5000/api/chat/room \
  -b partner_cookies.txt

# Send message
curl -X POST http://localhost:5000/api/chat/messages \
  -b partner_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"content":"Salom admin, yordam kerak!"}'

# Get messages
curl http://localhost:5000/api/chat/messages \
  -b partner_cookies.txt
```

#### Scenario 4: Referral
```bash
# Get stats
curl http://localhost:5000/api/referrals/stats \
  -b partner_cookies.txt

# Generate promo code
curl -X POST http://localhost:5000/api/referrals/generate-code \
  -b partner_cookies.txt
```

---

## 2. ADMIN ROLE

### Kirish Huquqlari

✅ **Ruxsat berilgan:**
- `/admin-login` - Admin login sahifasi
- `/admin-panel` - Admin panel
- `/api/admin/*` - Barcha admin API'lar
- `/api/partners/*` - Barcha partnerlar
- `/api/products/*` - Barcha mahsulotlar
- `/api/chat/rooms` - Barcha chat xonalar
- `/api/chat/messages/:chatRoomId` - Har qanday chat xabarlar

❌ **Ruxsat berilmagan:**
- Hech narsa (admin barcha narsaga kirishi mumkin)

### Admin Funksiyalari

#### 1. Partner Boshqaruvi
```typescript
// Partner Management
GET    /api/admin/partners           // Barcha partnerlar
GET    /api/admin/partners/:id       // Partner ma'lumotlari
PUT    /api/admin/partners/:id       // Partner yangilash
DELETE /api/admin/partners/:id       // Partner o'chirish
POST   /api/admin/partners/:id/approve  // Partner tasdiqlash
POST   /api/admin/partners/:id/reject   // Partner rad etish
```

#### 2. Chat Boshqaruvi
```typescript
// Admin → All Partners Chat
GET  /api/chat/rooms                 // Barcha chat xonalar
GET  /api/chat/messages/:chatRoomId  // Har qanday chat xabarlar
POST /api/chat/messages              // Har qanday chatga xabar
```

**Xususiyatlar:**
- Admin barcha partnerlar bilan gaplashadi
- Har bir partner uchun alohida chat xona
- Barcha xabarlarni ko'rish
- Har qanday chatga javob berish

#### 3. Statistika va Hisobotlar
```typescript
GET /api/admin/analytics             // Umumiy statistika
GET /api/admin/revenue               // Daromad tahlili
GET /api/admin/partners/stats        // Partner statistikasi
GET /api/admin/products/stats        // Mahsulot statistikasi
```

#### 4. Tizim Sozlamalari
```typescript
GET  /api/admin/settings             // Tizim sozlamalari
PUT  /api/admin/settings             // Sozlamalarni yangilash
POST /api/admin/broadcast            // Ommaviy xabar
```

### Admin Test Scenariylari

#### Scenario 1: Login va Dashboard
```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c admin_cookies.txt \
  -d '{"username":"admin","password":"Admin2024!"}'

# 2. Get all partners
curl http://localhost:5000/api/admin/partners \
  -b admin_cookies.txt

# 3. Get analytics
curl http://localhost:5000/api/admin/analytics \
  -b admin_cookies.txt
```

#### Scenario 2: Partner Tasdiqlash
```bash
# Get pending partners
curl http://localhost:5000/api/admin/partners?status=pending \
  -b admin_cookies.txt

# Approve partner
curl -X POST http://localhost:5000/api/admin/partners/partner-123/approve \
  -b admin_cookies.txt

# Reject partner
curl -X POST http://localhost:5000/api/admin/partners/partner-456/reject \
  -b admin_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"reason":"Incomplete information"}'
```

#### Scenario 3: Chat Boshqaruvi
```bash
# Get all chat rooms
curl http://localhost:5000/api/chat/rooms \
  -b admin_cookies.txt

# Get messages for specific partner
curl http://localhost:5000/api/chat/messages/chat-123 \
  -b admin_cookies.txt

# Send message to partner
curl -X POST http://localhost:5000/api/chat/messages \
  -b admin_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "content":"Salom! Sizga qanday yordam bera olaman?",
    "chatRoomId":"chat-123"
  }'
```

#### Scenario 4: Broadcast Xabar
```bash
curl -X POST http://localhost:5000/api/admin/broadcast \
  -b admin_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Yangi Xususiyat",
    "message":"Platformaga yangi AI xususiyatlari qo'shildi!",
    "type":"announcement"
  }'
```

---

## 🔒 Permission Matrix

| Feature | Partner | Admin | Customer |
|---------|---------|-------|----------|
| Login | ✅ | ✅ | ✅ |
| Dashboard | ✅ Own | ✅ All | ❌ |
| Products | ✅ Own | ✅ All | ❌ |
| Orders | ✅ Own | ✅ All | ✅ Own |
| Analytics | ✅ Own | ✅ All | ❌ |
| Chat | ✅ Admin only | ✅ All partners | ❌ |
| Settings | ✅ Own | ✅ All | ❌ |
| Users | ❌ | ✅ All | ❌ |
| Referrals | ✅ Own | ✅ All | ❌ |

---

## 🧪 Automated Testing

### Test Script

```bash
#!/bin/bash

echo "🧪 Testing Partner Role..."

# Partner login
PARTNER_SESSION=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c /tmp/partner_cookies.txt \
  -d '{"username":"testpartner","password":"Partner2024!"}' \
  | jq -r '.user.id')

echo "✅ Partner logged in: $PARTNER_SESSION"

# Test partner endpoints
curl -s http://localhost:5000/api/partners/me \
  -b /tmp/partner_cookies.txt | jq '.businessName'

curl -s http://localhost:5000/api/products \
  -b /tmp/partner_cookies.txt | jq 'length'

curl -s http://localhost:5000/api/chat/room \
  -b /tmp/partner_cookies.txt | jq '.id'

echo "🧪 Testing Admin Role..."

# Admin login
ADMIN_SESSION=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c /tmp/admin_cookies.txt \
  -d '{"username":"admin","password":"Admin2024!"}' \
  | jq -r '.user.id')

echo "✅ Admin logged in: $ADMIN_SESSION"

# Test admin endpoints
curl -s http://localhost:5000/api/admin/partners \
  -b /tmp/admin_cookies.txt | jq 'length'

curl -s http://localhost:5000/api/chat/rooms \
  -b /tmp/admin_cookies.txt | jq 'length'

echo "✅ All tests passed!"
```

---

## 📊 Test Results Template

```markdown
## Test Session: [Date]
**Tester:** [Name]
**Environment:** [Dev/Staging/Prod]

### Partner Role Tests
- [ ] Login successful
- [ ] Dashboard loads
- [ ] Products CRUD works
- [ ] Chat with admin works
- [ ] Analytics displays
- [ ] Referral system works
- [ ] Cannot access admin panel

### Admin Role Tests
- [ ] Login successful
- [ ] Admin panel loads
- [ ] Can view all partners
- [ ] Can approve/reject partners
- [ ] Can view all chats
- [ ] Can respond to all chats
- [ ] Analytics displays
- [ ] Broadcast works

### Issues Found
1. [Issue description]
2. [Issue description]

### Status
[ ] All tests passed
[ ] Some tests failed
[ ] Needs fixes
```

---

## 🎯 Success Criteria

### Partner Role
✅ Can login  
✅ Can access own dashboard  
✅ Can manage own products  
✅ Can chat with admin only  
✅ Can view own analytics  
✅ Cannot access admin panel  
✅ Cannot view other partners' data

### Admin Role
✅ Can login  
✅ Can access admin panel  
✅ Can view all partners  
✅ Can approve/reject partners  
✅ Can view all chats  
✅ Can respond to any chat  
✅ Can view all analytics  
✅ Can broadcast messages

---

**Status:** ✅ Ready for Testing  
**Last Updated:** 19 Dekabr, 2024
