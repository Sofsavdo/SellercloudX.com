-- Migration 012: Add missing business verification and payment columns to partners table
-- Required for Railway PostgreSQL deployment
-- Date: 2024-12-29

-- ==================== CRITICAL: PARTNER STATUS FIELDS ====================
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT false;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "business_address" varchar(500);
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "phone" varchar(50);
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "website" varchar(255);
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "updated_at" timestamp;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT NOW();

-- ==================== BUSINESS VERIFICATION FIELDS ====================
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "business_type" varchar(50) DEFAULT 'yatt';
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "inn" varchar(20);
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "billing_period" varchar(20) DEFAULT 'monthly';
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "ai_cards_this_month" integer DEFAULT 0;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "products_count" integer DEFAULT 0;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "referred_by" text;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "wallet_balance" integer DEFAULT 0;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "marketplace_integrations" text;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "payment_verified" boolean DEFAULT false;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "activated_at" timestamp;

-- ==================== CLICK PAYMENT FIELDS ====================
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "pending_payment_id" text;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "pending_payment_tier" text;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "pending_payment_amount" integer;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "pending_payment_billing_period" text;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "pending_payment_created_at" timestamp;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "last_payment_id" text;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "last_payment_amount" integer;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "last_payment_date" timestamp;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "last_payment_status" text;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "click_transaction_id" text;

-- ==================== OTHER MISSING COLUMNS ====================
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "ai_cards_used" integer DEFAULT 0;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "promo_code" varchar(50);
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "notes" text;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "anydesk_id" varchar(100);
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "anydesk_password" varchar(100);
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "warehouse_space_kg" integer;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "ai_enabled" boolean DEFAULT false;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "approved" boolean DEFAULT false;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "monthly_fee" integer;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "profit_share_percent" integer;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "last_activity_at" timestamp;

-- Success message
SELECT 'Migration 012 completed successfully - All partners columns added' as status;
