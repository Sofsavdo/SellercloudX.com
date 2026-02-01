-- ============================================
-- PostgreSQL Migration Script for SellerCloudX
-- Run this on Railway PostgreSQL database
-- ============================================

-- 1. Products table - add missing columns
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "optimized_title" varchar(500);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "low_stock_threshold" integer DEFAULT 10;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "barcode" varchar(100);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sku" varchar(100);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "brand" varchar(100);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "stock_quantity" integer DEFAULT 0;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "cost_price" decimal(10,2) DEFAULT 0;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "weight" varchar(50);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "dimensions" varchar(100);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "updated_at" timestamp;

-- 2. Partners table - add missing columns
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "ai_cards_used" integer DEFAULT 0;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "promo_code" varchar(50);
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "notes" text;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "anydesk_id" varchar(100);
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "anydesk_password" varchar(100);
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "warehouse_space_kg" integer;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "monthly_fee" integer;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "profit_share_percent" integer;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "last_activity_at" timestamp;

-- 3. Audit logs - add missing columns
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "changes" text;

-- 4. Create unique index for promo_code (if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_partners_promo_code ON partners(promo_code) WHERE promo_code IS NOT NULL;

-- 5. Create ai_generated_products table if not exists
CREATE TABLE IF NOT EXISTS "ai_generated_products" (
  "id" TEXT PRIMARY KEY,
  "partner_id" TEXT NOT NULL,
  "product_id" TEXT,
  "marketplace" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "bullet_points" TEXT,
  "seo_keywords" TEXT,
  "image_prompts" TEXT,
  "generated_images" TEXT,
  "status" TEXT DEFAULT 'draft',
  "quality_score" INTEGER,
  "ai_model" TEXT,
  "generation_cost" DECIMAL(10,4),
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "published_at" TIMESTAMP
);

-- 6. Create ai_tasks table if not exists
CREATE TABLE IF NOT EXISTS "ai_tasks" (
  "id" TEXT PRIMARY KEY,
  "partner_id" TEXT NOT NULL,
  "account_id" TEXT,
  "task_type" TEXT NOT NULL,
  "status" TEXT DEFAULT 'pending',
  "priority" TEXT DEFAULT 'medium',
  "input_data" TEXT,
  "output_data" TEXT,
  "error_message" TEXT,
  "started_at" TIMESTAMP,
  "completed_at" TIMESTAMP,
  "estimated_cost" DECIMAL(10,4),
  "actual_cost" DECIMAL(10,4),
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- 7. Create referrals table if not exists
CREATE TABLE IF NOT EXISTS "referrals" (
  "id" TEXT PRIMARY KEY,
  "referrer_partner_id" TEXT NOT NULL,
  "referred_partner_id" TEXT NOT NULL,
  "promo_code" TEXT,
  "contract_type" TEXT NOT NULL,
  "status" TEXT DEFAULT 'invited',
  "bonus_earned" NUMERIC DEFAULT 0,
  "bonus_paid" NUMERIC DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "activated_at" TIMESTAMP,
  "expires_at" TIMESTAMP
);

-- 8. Create marketplace_integrations table if not exists
CREATE TABLE IF NOT EXISTS "marketplace_integrations" (
  "id" TEXT PRIMARY KEY,
  "partner_id" TEXT NOT NULL,
  "marketplace" TEXT NOT NULL,
  "api_key" TEXT,
  "api_secret" TEXT,
  "active" BOOLEAN DEFAULT false,
  "last_sync_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- 9. Create trending_products table if not exists
CREATE TABLE IF NOT EXISTS "trending_products" (
  "id" TEXT PRIMARY KEY,
  "marketplace" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "product_name" TEXT NOT NULL,
  "price" DECIMAL(10,2),
  "sales_count" INTEGER,
  "rating" DECIMAL(3,2),
  "trend_score" INTEGER NOT NULL,
  "image_url" TEXT,
  "product_url" TEXT,
  "analyzed_at" TIMESTAMP DEFAULT NOW()
);

-- 10. Create notifications table if not exists
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT DEFAULT 'info',
  "read" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- 11. Create session table for connect-pg-simple
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
) WITH (OIDS=FALSE);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- Done!
SELECT 'Migration completed successfully!' as status;
