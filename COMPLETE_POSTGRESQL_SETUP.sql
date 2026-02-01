-- ============================================
-- SELLERCLOUDX - COMPLETE POSTGRESQL SETUP
-- Railway PostgreSQL Query tabida ishga tushiring
-- ============================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "email" TEXT UNIQUE,
  "password" TEXT NOT NULL,
  "first_name" TEXT,
  "last_name" TEXT,
  "phone" TEXT,
  "role" TEXT NOT NULL DEFAULT 'customer',
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- 2. PARTNERS TABLE
CREATE TABLE IF NOT EXISTS "partners" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL UNIQUE REFERENCES "users"("id"),
  "business_name" TEXT NOT NULL,
  "business_address" TEXT,
  "business_category" TEXT,
  "inn" TEXT UNIQUE,
  "phone" TEXT NOT NULL,
  "website" TEXT,
  "monthly_revenue" TEXT,
  "approved" BOOLEAN DEFAULT false,
  "pricing_tier" TEXT DEFAULT 'free_starter',
  "monthly_fee" INTEGER,
  "profit_share_percent" INTEGER,
  "ai_enabled" BOOLEAN DEFAULT false,
  "ai_cards_used" INTEGER DEFAULT 0,
  "promo_code" TEXT UNIQUE,
  "warehouse_space_kg" INTEGER,
  "anydesk_id" TEXT,
  "anydesk_password" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "last_activity_at" TIMESTAMP
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS "products" (
  "id" TEXT PRIMARY KEY,
  "partner_id" TEXT NOT NULL REFERENCES "partners"("id"),
  "name" TEXT NOT NULL,
  "sku" TEXT UNIQUE,
  "barcode" TEXT,
  "description" TEXT,
  "category" TEXT,
  "brand" TEXT,
  "price" DECIMAL(12,2) NOT NULL,
  "cost_price" DECIMAL(12,2),
  "weight" TEXT,
  "dimensions" TEXT,
  "stock_quantity" INTEGER DEFAULT 0,
  "low_stock_threshold" INTEGER DEFAULT 10,
  "optimized_title" TEXT,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS "orders" (
  "id" TEXT PRIMARY KEY,
  "partner_id" TEXT NOT NULL REFERENCES "partners"("id"),
  "order_number" TEXT UNIQUE NOT NULL,
  "customer_name" TEXT NOT NULL,
  "customer_email" TEXT,
  "customer_phone" TEXT,
  "marketplace" TEXT,
  "status" TEXT DEFAULT 'pending',
  "total_amount" DECIMAL(14,2) NOT NULL,
  "shipping_address" TEXT,
  "tracking_number" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP
);

-- 5. ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS "order_items" (
  "id" TEXT PRIMARY KEY,
  "order_id" TEXT NOT NULL REFERENCES "orders"("id"),
  "product_id" TEXT NOT NULL REFERENCES "products"("id"),
  "quantity" INTEGER NOT NULL,
  "price" DECIMAL(12,2) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- 6. MARKETPLACE_INTEGRATIONS TABLE
CREATE TABLE IF NOT EXISTS "marketplace_integrations" (
  "id" TEXT PRIMARY KEY,
  "partner_id" TEXT NOT NULL REFERENCES "partners"("id"),
  "marketplace" TEXT NOT NULL,
  "api_key" TEXT,
  "api_secret" TEXT,
  "active" BOOLEAN DEFAULT false,
  "last_sync_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- 7. AI_TASKS TABLE
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

-- 8. AI_PRODUCT_CARDS TABLE
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

-- 9. TRENDING_PRODUCTS TABLE
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

-- 10. ANALYTICS TABLE
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

-- 11. CHAT_ROOMS TABLE
CREATE TABLE IF NOT EXISTS "chat_rooms" (
  "id" TEXT PRIMARY KEY,
  "partner_id" TEXT NOT NULL,
  "title" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- 12. MESSAGES TABLE (for AI Chat)
CREATE TABLE IF NOT EXISTS "messages" (
  "id" TEXT PRIMARY KEY,
  "room_id" TEXT NOT NULL,
  "partner_id" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "metadata" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT DEFAULT 'info',
  "read" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- 14. AUDIT_LOGS TABLE
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

-- 15. PRICING_TIERS TABLE
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

-- 16. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" TEXT PRIMARY KEY,
  "partner_id" TEXT NOT NULL,
  "tier_id" TEXT NOT NULL,
  "status" TEXT DEFAULT 'active' NOT NULL,
  "start_date" TIMESTAMP NOT NULL,
  "end_date" TIMESTAMP,
  "auto_renew" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- 17. REFERRALS TABLE
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

-- 18. REFERRAL_BONUSES TABLE
CREATE TABLE IF NOT EXISTS "referral_bonuses" (
  "id" TEXT PRIMARY KEY,
  "referral_id" TEXT NOT NULL,
  "referrer_partner_id" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "month_number" INTEGER NOT NULL,
  "platform_profit" DECIMAL(12,2) NOT NULL,
  "bonus_rate" DECIMAL(5,2) NOT NULL,
  "tier_multiplier" DECIMAL(5,2) NOT NULL,
  "status" TEXT DEFAULT 'pending',
  "paid_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- 19. SESSION TABLE (for auth)
CREATE TABLE IF NOT EXISTS "session" (
  "sid" VARCHAR NOT NULL COLLATE "default",
  "sess" JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- 20. INVOICES TABLE
CREATE TABLE IF NOT EXISTS "invoices" (
  "id" TEXT PRIMARY KEY,
  "partner_id" TEXT NOT NULL,
  "subscription_id" TEXT,
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT DEFAULT 'USD',
  "status" TEXT DEFAULT 'pending' NOT NULL,
  "due_date" TIMESTAMP NOT NULL,
  "paid_at" TIMESTAMP,
  "payment_method" TEXT,
  "metadata" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- 21. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS "payments" (
  "id" TEXT PRIMARY KEY,
  "invoice_id" TEXT,
  "partner_id" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT DEFAULT 'USD',
  "payment_method" TEXT NOT NULL,
  "transaction_id" TEXT,
  "status" TEXT DEFAULT 'pending' NOT NULL,
  "metadata" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "completed_at" TIMESTAMP
);

-- 22. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS "customers" (
  "id" TEXT PRIMARY KEY,
  "partner_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT NOT NULL,
  "address" TEXT,
  "total_orders" INTEGER DEFAULT 0,
  "total_spent" DECIMAL(14,2) DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "last_order_at" TIMESTAMP
);

-- 23. WAREHOUSES TABLE
CREATE TABLE IF NOT EXISTS "warehouses" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "code" TEXT,
  "location" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL,
  "current_load" INTEGER DEFAULT 0,
  "active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- 24. WALLET_TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS "wallet_transactions" (
  "id" TEXT PRIMARY KEY,
  "partner_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "description" TEXT,
  "status" TEXT DEFAULT 'pending' NOT NULL,
  "metadata" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- 25. AI_MARKETPLACE_ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS "ai_marketplace_accounts" (
  "id" TEXT PRIMARY KEY,
  "partner_id" TEXT NOT NULL,
  "marketplace" TEXT NOT NULL,
  "account_name" TEXT NOT NULL,
  "status" TEXT DEFAULT 'active',
  "products_count" INTEGER DEFAULT 0,
  "last_activity" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- 26. SYSTEM_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS "system_settings" (
  "id" TEXT PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "value" TEXT NOT NULL,
  "description" TEXT,
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "updated_by" TEXT
);

-- ============================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Partners columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'ai_cards_used') THEN
    ALTER TABLE "partners" ADD COLUMN "ai_cards_used" INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'promo_code') THEN
    ALTER TABLE "partners" ADD COLUMN "promo_code" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'notes') THEN
    ALTER TABLE "partners" ADD COLUMN "notes" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'ai_enabled') THEN
    ALTER TABLE "partners" ADD COLUMN "ai_enabled" BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'approved') THEN
    ALTER TABLE "partners" ADD COLUMN "approved" BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Products columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'optimized_title') THEN
    ALTER TABLE "products" ADD COLUMN "optimized_title" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_active') THEN
    ALTER TABLE "products" ADD COLUMN "is_active" BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'low_stock_threshold') THEN
    ALTER TABLE "products" ADD COLUMN "low_stock_threshold" INTEGER DEFAULT 10;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand') THEN
    ALTER TABLE "products" ADD COLUMN "brand" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'barcode') THEN
    ALTER TABLE "products" ADD COLUMN "barcode" TEXT;
  END IF;
END $$;

-- Marketplace integrations columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'api_key') THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "api_key" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'api_secret') THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "api_secret" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'active') THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "active" BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'last_sync_at') THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "last_sync_at" TIMESTAMP;
  END IF;
END $$;

-- ============================================
-- INSERT DEFAULT PRICING TIERS
-- ============================================

INSERT INTO "pricing_tiers" ("id", "tier", "name_uz", "fixed_cost", "commission_min", "commission_max", "min_revenue", "max_revenue", "features", "is_active")
SELECT gen_random_uuid()::text, 'free_starter', 'Bepul Starter', '0', '2', '2', '0', '10000000', '{"sku_limit": 10, "marketplaces": ["yandex_market"], "ai_cards": 5}', true
WHERE NOT EXISTS (SELECT 1 FROM "pricing_tiers" WHERE "tier" = 'free_starter');

INSERT INTO "pricing_tiers" ("id", "tier", "name_uz", "fixed_cost", "commission_min", "commission_max", "min_revenue", "max_revenue", "features", "is_active")
SELECT gen_random_uuid()::text, 'basic', 'Basic', '69', '1.5', '1.8', '10000000', '50000000', '{"sku_limit": 69, "marketplaces": ["uzum"], "ai_cards": 20}', true
WHERE NOT EXISTS (SELECT 1 FROM "pricing_tiers" WHERE "tier" = 'basic');

INSERT INTO "pricing_tiers" ("id", "tier", "name_uz", "fixed_cost", "commission_min", "commission_max", "min_revenue", "max_revenue", "features", "is_active")
SELECT gen_random_uuid()::text, 'starter_pro', 'Starter Pro', '349', '1', '1.5', '50000000', '200000000', '{"sku_limit": 400, "marketplaces": ["uzum", "wildberries", "yandex_market", "ozon"], "ai_cards": 100}', true
WHERE NOT EXISTS (SELECT 1 FROM "pricing_tiers" WHERE "tier" = 'starter_pro');

INSERT INTO "pricing_tiers" ("id", "tier", "name_uz", "fixed_cost", "commission_min", "commission_max", "min_revenue", "max_revenue", "features", "is_active")
SELECT gen_random_uuid()::text, 'professional', 'Professional', '899', '0.5', '1', '200000000', NULL, '{"sku_limit": -1, "marketplaces": ["uzum", "wildberries", "yandex_market", "ozon"], "ai_cards": -1, "ai_manager": true}', true
WHERE NOT EXISTS (SELECT 1 FROM "pricing_tiers" WHERE "tier" = 'professional');

-- ============================================
-- DONE
-- ============================================
SELECT 'Migration completed successfully!' as status, COUNT(*) as tables_count FROM information_schema.tables WHERE table_schema = 'public';
