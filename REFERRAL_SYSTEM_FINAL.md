# Referral Tizimi - Yakuniy Versiya

## ✅ Amalga Oshirilgan Funksiyalar

### 1. Birinchi Haridaga Nisbatan Komissiya Tizimi

#### Asosiy Prinsiplar:
- **Faqat birinchi haridaga nisbatan** bonus beriladi
- **Muddatga qarab komissiya** hisoblanadi:
  - 1 oylik tarif: 1 oy uchun 10% (masalan $69 → $6.90 bir martalik)
  - 12 oylik tarif: 12 oy uchun 10% (masalan $69 × 12 → $82.80 bir martalik)
- **Qayta ulanishda bonus yo'q** - faqat birinchi marta

#### Komissiya Hisoblash:
```typescript
Komissiya = (Oylik to'lov × Oylar soni) × 10%

Misol:
- Basic ($69/oy) × 1 oy = $69 → $6.90 komissiya
- Basic ($69/oy) × 12 oy = $828 → $82.80 komissiya
- Starter Pro ($349/oy) × 1 oy = $349 → $34.90 komissiya
- Starter Pro ($349/oy) × 12 oy = $4,188 → $418.80 komissiya
```

### 2. Admin Panel - Konkurslar va Aksiyalar

#### Funksiyalar:
- ✅ **Konkurs yaratish** - admin istalgan vaqtda yangi konkurs yarata oladi
- ✅ **Parametrlar**:
  - Nomi va tavsif
  - Davomiyligi (kun)
  - Maqsad (takliflar soni)
  - Bonus miqdori ($)
  - Minimal tarif (basic, starter_pro, professional)
  - Minimal muddat (1, 3, 6, 12 oy)

#### Misol Konkurslar:
- "3 kun ichida 10 ta yangi hamkor uchun $1000 bonus"
- "10 kun ichida 25 ta hamkor uchun $2500 bonus"
- "30 kun ichida 50 ta hamkor uchun $5000 bonus"

### 3. Animatsiyali Taymerlar va Olov Effekti

#### Taymer Funksiyalari:
- ✅ **Real-time countdown** - har soniyada yangilanadi
- ✅ **Kun, Soat, Daqiqa, Soniya** ko'rsatiladi
- ✅ **Urgent mode** - 24 soatdan kam qolganida:
  - Olov effekti (flame icon)
  - Orange rang
  - Pulse animatsiya
  - "Shoshilinch!" badge

#### Progress Bar:
- ✅ **Progress ko'rsatiladi** - qancha taklif qilingan
- ✅ **Qolgan takliflar** ko'rsatiladi
- ✅ **G'olib statusi** - maqsadga yetilganda

### 4. Partner Dashboard - Konkurslar

#### Funksiyalar:
- ✅ **Faol konkurslarni ko'rish**
- ✅ **Konkursga qo'shilish** - bir tugma bosilishi bilan
- ✅ **O'z statistikasini ko'rish**:
  - Qancha taklif qilingan
  - Qancha qolgan
  - Progress foizi
  - G'olib bo'lish holati

### 5. Backend Integratsiya

#### Payment Flow:
1. **Payment yaratilganda** → `checkAndProcessFirstPurchase()` chaqiriladi
2. **Invoice paid bo'lganda** → Referral first purchase tekshiriladi
3. **Subscription yaratilganda** → Muddat hisoblanadi va komissiya hisoblanadi

#### Database:
- ✅ `referral_first_purchases` - birinchi haridalar
- ✅ `referral_campaigns` - konkurslar
- ✅ `referral_campaign_participants` - ishtirokchilar

## 📊 Moliyaviy Tahlil

### Komissiya Tizimi:
- **1 oylik Basic**: $6.90 (bir martalik)
- **12 oylik Basic**: $82.80 (bir martalik)
- **1 oylik Starter Pro**: $34.90 (bir martalik)
- **12 oylik Starter Pro**: $418.80 (bir martalik)
- **1 oylik Professional**: $89.90 (bir martalik)
- **12 oylik Professional**: $1,078.80 (bir martalik)

### Konkurslar:
- **3 kun ichida 10 ta hamkor**: $1000 bonus
- **10 kun ichida 25 ta hamkor**: $2500 bonus
- **30 kun ichida 50 ta hamkor**: $5000 bonus

## 🎯 Qanday Ishlaydi

### 1. Partner Ro'yxatdan O'tadi:
- Promo kod kiritadi (ixtiyoriy)
- Referral relationship yaratiladi

### 2. Birinchi Harida:
- Partner subscription yaratadi (1, 3, 6, 12 oy)
- Payment to'lanadi
- `checkAndProcessFirstPurchase()` chaqiriladi
- Komissiya hisoblanadi: (Oylik to'lov × Oylar) × 10%
- Referral earnings'ga qo'shiladi

### 3. Qayta Ulanish:
- Agar partner qayta ulansa → bonus yo'q
- Faqat birinchi haridaga nisbatan

### 4. Konkurslar:
- Admin konkurs yaratadi
- Partnerlar qo'shiladi
- Taklif qilingan hamkorlar hisoblanadi
- Maqsadga yetilganda → g'olib bo'ladi
- Bonus olinadi

## 🚀 Keyingi Qadamlar

1. ✅ Birinchi haridaga nisbatan komissiya - **Tayyor**
2. ✅ Konkurslar tizimi - **Tayyor**
3. ✅ Animatsiyali taymerlar - **Tayyor**
4. ✅ Olov effekti - **Tayyor**
5. ✅ Admin panel integratsiyasi - **Tayyor**
6. ✅ Partner dashboard integratsiyasi - **Tayyor**

## 📝 Eslatmalar

- **Birinchi harida** - faqat birinchi marta subscription yaratilganda
- **Muddatga qarab** - necha oyga ulangan bo'lsa, shuncha oy uchun komissiya
- **Qayta ulanish** - bonus yo'q
- **Konkurslar** - admin belgilagan shartlar bo'yicha
- **Minimal tarif** - admin belgilagan minimal tarif
- **Minimal muddat** - admin belgilagan minimal muddat

