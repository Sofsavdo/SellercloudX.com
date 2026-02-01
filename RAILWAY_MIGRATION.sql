-- ============================================
-- SELLERCLOUDX - COMPLETE POSTGRESQL MIGRATION
-- Run this script in Railway PostgreSQL Query tab
-- ============================================

-- 1. MARKETPLACE INTEGRATIONS - Add missing columns
DO $$
BEGIN
  -- Add api_key if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'marketplace_integrations' AND column_name = 'api_key'
  ) THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "api_key" TEXT;
    RAISE NOTICE 'Added api_key column';
  END IF;

  -- Add api_secret if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'marketplace_integrations' AND column_name = 'api_secret'
  ) THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "api_secret" TEXT;
    RAISE NOTICE 'Added api_secret column';
  END IF;

  -- Add active if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'marketplace_integrations' AND column_name = 'active'
  ) THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "active" BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added active column';
  END IF;

  -- Add last_sync_at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'marketplace_integrations' AND column_name = 'last_sync_at'
  ) THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "last_sync_at" TIMESTAMP;
    RAISE NOTICE 'Added last_sync_at column';
  END IF;
END $$;

-- 2. PRODUCTS - Add missing columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'optimized_title') THEN
    ALTER TABLE "products" ADD COLUMN "optimized_title" VARCHAR(500);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_active') THEN
    ALTER TABLE "products" ADD COLUMN "is_active" BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'low_stock_threshold') THEN
    ALTER TABLE "products" ADD COLUMN "low_stock_threshold" INTEGER DEFAULT 10;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'barcode') THEN
    ALTER TABLE "products" ADD COLUMN "barcode" VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sku') THEN
    ALTER TABLE "products" ADD COLUMN "sku" VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand') THEN
    ALTER TABLE "products" ADD COLUMN "brand" VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_quantity') THEN
    ALTER TABLE "products" ADD COLUMN "stock_quantity" INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'cost_price') THEN
    ALTER TABLE "products" ADD COLUMN "cost_price" DECIMAL(12,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'weight') THEN
    ALTER TABLE "products" ADD COLUMN "weight" VARCHAR(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'dimensions') THEN
    ALTER TABLE "products" ADD COLUMN "dimensions" VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
    ALTER TABLE "products" ADD COLUMN "updated_at" TIMESTAMP;
  END IF;
END $$;

-- 3. PARTNERS - Add missing columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'ai_cards_used') THEN
    ALTER TABLE "partners" ADD COLUMN "ai_cards_used" INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'promo_code') THEN
    ALTER TABLE "partners" ADD COLUMN "promo_code" VARCHAR(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'notes') THEN
    ALTER TABLE "partners" ADD COLUMN "notes" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'anydesk_id') THEN
    ALTER TABLE "partners" ADD COLUMN "anydesk_id" VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'anydesk_password') THEN
    ALTER TABLE "partners" ADD COLUMN "anydesk_password" VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'warehouse_space_kg') THEN
    ALTER TABLE "partners" ADD COLUMN "warehouse_space_kg" INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'monthly_fee') THEN
    ALTER TABLE "partners" ADD COLUMN "monthly_fee" INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'profit_share_percent') THEN
    ALTER TABLE "partners" ADD COLUMN "profit_share_percent" INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'ai_enabled') THEN
    ALTER TABLE "partners" ADD COLUMN "ai_enabled" BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'last_activity_at') THEN
    ALTER TABLE "partners" ADD COLUMN "last_activity_at" TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'approved') THEN
    ALTER TABLE "partners" ADD COLUMN "approved" BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 4. Create AI_TASKS table if not exists
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

-- 5. Create AI_PRODUCT_CARDS table if not exists
CREATE TABLE IF NOT EXISTS "ai_product_cards" (
  "id" TEXT PRIMARY KEY,
  "partner_id" TEXT NOT NULL,
  "product_id" TEXT,
  "account_id" TEXT,
  "base_product_name" TEXT,
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

-- 6. Create TRENDING_PRODUCTS table if not exists
CREATE TABLE IF NOT EXISTS "trending_products" (
  "id" TEXT PRIMARY KEY,
  "marketplace" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "product_name" TEXT NOT NULL,
  "price" DECIMAL(12,2),
  "sales_count" INTEGER,
  "rating" DECIMAL(3,2),
  "trend_score" INTEGER NOT NULL,
  "image_url" TEXT,
  "product_url" TEXT,
  "analyzed_at" TIMESTAMP DEFAULT NOW()
);

-- 7. Create NOTIFICATIONS table if not exists
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT DEFAULT 'info',
  "read" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- 8. Create AUDIT_LOGS table if not exists
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT,
  "action" TEXT NOT NULL,
  "entity_type" TEXT,
  "entity_id" TEXT,
  "old_values" TEXT,
  "new_values" TEXT,
  "changes" TEXT,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- 9. Create ANALYTICS table if not exists
CREATE TABLE IF NOT EXISTS "analytics" (
  "id" TEXT PRIMARY KEY,
  "partner_id" TEXT NOT NULL,
  "marketplace" TEXT,
  "date" DATE NOT NULL,
  "revenue" DECIMAL(14,2) DEFAULT 0,
  "orders" INTEGER DEFAULT 0,
  "views" INTEGER DEFAULT 0,
  "conversions" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- 10. Create CHAT_MESSAGES table for AI Chat
CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" TEXT PRIMARY KEY,
  "partner_id" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "metadata" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- 11. Create PRICING_TIERS table if not exists
CREATE TABLE IF NOT EXISTS "pricing_tiers" (
  "id" TEXT PRIMARY KEY,
  "tier" TEXT NOT NULL UNIQUE,
  "name_uz" TEXT NOT NULL,
  "fixed_cost" TEXT NOT NULL,
  "commission_min" TEXT NOT NULL,
  "commission_max" TEXT NOT NULL,
  "min_revenue" TEXT NOT NULL,
  "max_revenue" TEXT,
  "features" TEXT NOT NULL,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- 12. Create SESSION table for auth
CREATE TABLE IF NOT EXISTS "session" (
  "sid" VARCHAR NOT NULL COLLATE "default",
  "sess" JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- 13. Create REFERRALS table if not exists
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

-- 14. Create SUBSCRIPTIONS table if not exists
CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" TEXT PRIMARY KEY,
  "partner_id" TEXT NOT NULL,
  "tier_id" TEXT NOT NULL,
  "status" TEXT DEFAULT 'active' NOT NULL,
  "start_date" TIMESTAMP NOT NULL,
  "end_date" TIMESTAMP,
  "auto_renew" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP
);

-- 15. Insert default pricing tiers if empty
INSERT INTO "pricing_tiers" ("id", "tier", "name_uz", "fixed_cost", "commission_min", "commission_max", "min_revenue", "max_revenue", "features", "is_active")
SELECT 
  gen_random_uuid()::text,
  'free_starter',
  'Bepul Starter',
  '0',
  '2',
  '2',
  '0',
  '10000000',
  '{"sku_limit": 10, "marketplaces": ["yandex_market"], "ai_cards": 5, "support": "basic"}',
  true
WHERE NOT EXISTS (SELECT 1 FROM "pricing_tiers" WHERE "tier" = 'free_starter');

INSERT INTO "pricing_tiers" ("id", "tier", "name_uz", "fixed_cost", "commission_min", "commission_max", "min_revenue", "max_revenue", "features", "is_active")
SELECT 
  gen_random_uuid()::text,
  'basic',
  'Basic',
  '69',
  '1.5',
  '1.8',
  '10000000',
  '50000000',
  '{"sku_limit": 69, "marketplaces": ["uzum"], "ai_cards": 20, "support": "email"}',
  true
WHERE NOT EXISTS (SELECT 1 FROM "pricing_tiers" WHERE "tier" = 'basic');

INSERT INTO "pricing_tiers" ("id", "tier", "name_uz", "fixed_cost", "commission_min", "commission_max", "min_revenue", "max_revenue", "features", "is_active")
SELECT 
  gen_random_uuid()::text,
  'starter_pro',
  'Starter Pro',
  '349',
  '1',
  '1.5',
  '50000000',
  '200000000',
  '{"sku_limit": 400, "marketplaces": ["uzum", "wildberries", "yandex_market", "ozon"], "ai_cards": 100, "support": "priority"}',
  true
WHERE NOT EXISTS (SELECT 1 FROM "pricing_tiers" WHERE "tier" = 'starter_pro');

INSERT INTO "pricing_tiers" ("id", "tier", "name_uz", "fixed_cost", "commission_min", "commission_max", "min_revenue", "max_revenue", "features", "is_active")
SELECT 
  gen_random_uuid()::text,
  'professional',
  'Professional',
  '899',
  '0.5',
  '1',
  '200000000',
  NULL,
  '{"sku_limit": -1, "marketplaces": ["uzum", "wildberries", "yandex_market", "ozon"], "ai_cards": -1, "support": "dedicated", "ai_manager": true}',
  true
WHERE NOT EXISTS (SELECT 1 FROM "pricing_tiers" WHERE "tier" = 'professional');

-- Done!
SELECT 'Migration completed successfully!' as status;
