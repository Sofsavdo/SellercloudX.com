# 🚀 SellerCloudX Railway Database Fix

## Problem
Railway deployment'da database schema xatolari:
- `ai_cards_used` column does not exist
- `low_stock_threshold` column does not exist
- `ip_address` column does not exist
- `metric_type` column does not exist

## Solution

### Option 1: Run Migration SQL (Recommended)
Railway PostgreSQL konsolida quyidagi SQL'ni ishga tushiring:

1. Railway Dashboard'ga kiring
2. Database servisingizni tanlang
3. "Query" yoki "SQL Editor" ni oching
4. `/app/migrations/010_railway_complete_fix.sql` faylidagi SQL'ni nusxalab qo'ying
5. Run tugmasini bosing

### Option 2: Manual Column Addition
Agar migration ishlamasa, quyidagi SQL'larni alohida ishga tushiring:

```sql
-- Add ai_cards_used column
ALTER TABLE partners ADD COLUMN IF NOT EXISTS ai_cards_used INTEGER DEFAULT 0;

-- Add ai_cards_limit column  
ALTER TABLE partners ADD COLUMN IF NOT EXISTS ai_cards_limit INTEGER DEFAULT 50;

-- Add low_stock_threshold column
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;

-- Add ip_address column
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Add user_agent column
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Add metric_type column
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS metric_type TEXT DEFAULT 'revenue';

-- Add referral_code column
ALTER TABLE partners ADD COLUMN IF NOT EXISTS referral_code TEXT;
```

### Option 3: Fresh Database
Agar juda ko'p xatolar bo'lsa, yangi database yarating:

1. Railway'da yangi PostgreSQL database yarating
2. `DATABASE_URL` environment variable'ni yangilang
3. `npm run db:push` ni ishga tushiring (yoki drizzle-kit push)

## Verification
Migration muvaffaqiyatli bo'lganini tekshirish uchun:

```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'partners' 
ORDER BY ordinal_position;
```

`ai_cards_used`, `ai_cards_limit`, `referral_code` kolonlari ko'rinishi kerak.

## Login Credentials
- **Admin**: username: `Medik`, password: `Medik9298`
- **Partner**: username: `partner`, password: `partner123`

## Support
Muammo hal bo'lmasa, `/app/migrations/010_railway_complete_fix.sql` faylini to'liq ko'ring.
