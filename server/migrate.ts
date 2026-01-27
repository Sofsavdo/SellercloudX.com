// @ts-nocheck
import { Pool } from 'pg';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run SQLite migrations
 */
async function runSQLiteMigrations() {
  const dbPath = process.env.DATABASE_URL?.replace('file:', '') || join(__dirname, '../data.db');
  console.log('🔄 Running SQLite migrations...');
  console.log('📁 Database path:', dbPath);
  
  try {
    const db = new Database(dbPath);
    
    // Check if partners table exists
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='partners'").all() as any[];
    
    if (tables.length === 0) {
      console.log('⚠️  Partners table does not exist. Database needs initialization.');
      console.log('💡 Run: npm run db:push');
      db.close();
      return;
    }
    
    // Check and add columns
    const tableInfo = db.prepare("PRAGMA table_info(partners)").all() as any[];
    const hasAnydeskId = tableInfo.some((col: any) => col.name === 'anydesk_id');
    const hasAnydeskPassword = tableInfo.some((col: any) => col.name === 'anydesk_password');
    
    if (!hasAnydeskId) {
      console.log('📝 Adding anydesk_id column...');
      db.prepare('ALTER TABLE partners ADD COLUMN anydesk_id TEXT').run();
      console.log('✅ Added anydesk_id column');
    }
    
    if (!hasAnydeskPassword) {
      console.log('📝 Adding anydesk_password column...');
      db.prepare('ALTER TABLE partners ADD COLUMN anydesk_password TEXT').run();
      console.log('✅ Added anydesk_password column');
    }
    
    db.close();
    console.log('✅ SQLite migrations completed');
  } catch (error) {
    console.error('❌ SQLite migration failed:', error);
    if (process.env.NODE_ENV !== 'production') {
      throw error;
    }
  }
}

/**
 * Ensure PostgreSQL tables have all required columns
 */
async function ensurePostgresCompatibility(pool: Pool) {
  const compatSql = `
DO $$
BEGIN
  -- ==================== PARTNERS TABLE ====================
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'ai_cards_used') THEN
    ALTER TABLE "partners" ADD COLUMN "ai_cards_used" integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'promo_code') THEN
    ALTER TABLE "partners" ADD COLUMN "promo_code" varchar(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'notes') THEN
    ALTER TABLE "partners" ADD COLUMN "notes" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'anydesk_id') THEN
    ALTER TABLE "partners" ADD COLUMN "anydesk_id" varchar(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'anydesk_password') THEN
    ALTER TABLE "partners" ADD COLUMN "anydesk_password" varchar(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'warehouse_space_kg') THEN
    ALTER TABLE "partners" ADD COLUMN "warehouse_space_kg" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'ai_enabled') THEN
    ALTER TABLE "partners" ADD COLUMN "ai_enabled" boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'approved') THEN
    ALTER TABLE "partners" ADD COLUMN "approved" boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'monthly_fee') THEN
    ALTER TABLE "partners" ADD COLUMN "monthly_fee" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'profit_share_percent') THEN
    ALTER TABLE "partners" ADD COLUMN "profit_share_percent" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'last_activity_at') THEN
    ALTER TABLE "partners" ADD COLUMN "last_activity_at" timestamp;
  END IF;
  
  -- ==================== BUSINESS VERIFICATION FIELDS ====================
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'business_type') THEN
    ALTER TABLE "partners" ADD COLUMN "business_type" varchar(50) DEFAULT 'yatt';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'inn') THEN
    ALTER TABLE "partners" ADD COLUMN "inn" varchar(20);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'billing_period') THEN
    ALTER TABLE "partners" ADD COLUMN "billing_period" varchar(20) DEFAULT 'monthly';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'ai_cards_this_month') THEN
    ALTER TABLE "partners" ADD COLUMN "ai_cards_this_month" integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'products_count') THEN
    ALTER TABLE "partners" ADD COLUMN "products_count" integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'referred_by') THEN
    ALTER TABLE "partners" ADD COLUMN "referred_by" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'wallet_balance') THEN
    ALTER TABLE "partners" ADD COLUMN "wallet_balance" integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'marketplace_integrations') THEN
    ALTER TABLE "partners" ADD COLUMN "marketplace_integrations" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'payment_verified') THEN
    ALTER TABLE "partners" ADD COLUMN "payment_verified" boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'activated_at') THEN
    ALTER TABLE "partners" ADD COLUMN "activated_at" timestamp;
  END IF;
  
  -- ==================== CLICK PAYMENT FIELDS ====================
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'pending_payment_id') THEN
    ALTER TABLE "partners" ADD COLUMN "pending_payment_id" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'pending_payment_tier') THEN
    ALTER TABLE "partners" ADD COLUMN "pending_payment_tier" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'pending_payment_amount') THEN
    ALTER TABLE "partners" ADD COLUMN "pending_payment_amount" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'pending_payment_billing_period') THEN
    ALTER TABLE "partners" ADD COLUMN "pending_payment_billing_period" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'pending_payment_created_at') THEN
    ALTER TABLE "partners" ADD COLUMN "pending_payment_created_at" timestamp;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'last_payment_id') THEN
    ALTER TABLE "partners" ADD COLUMN "last_payment_id" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'last_payment_amount') THEN
    ALTER TABLE "partners" ADD COLUMN "last_payment_amount" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'last_payment_date') THEN
    ALTER TABLE "partners" ADD COLUMN "last_payment_date" timestamp;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'last_payment_status') THEN
    ALTER TABLE "partners" ADD COLUMN "last_payment_status" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'click_transaction_id') THEN
    ALTER TABLE "partners" ADD COLUMN "click_transaction_id" text;
  END IF;
  
  -- ==================== 2026 REVENUE SHARE MODEL FIELDS ====================
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'tariff_type') THEN
    ALTER TABLE "partners" ADD COLUMN "tariff_type" text DEFAULT 'trial';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'setup_paid') THEN
    ALTER TABLE "partners" ADD COLUMN "setup_paid" integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'setup_fee_usd') THEN
    ALTER TABLE "partners" ADD COLUMN "setup_fee_usd" integer DEFAULT 699;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'monthly_fee_usd') THEN
    ALTER TABLE "partners" ADD COLUMN "monthly_fee_usd" integer DEFAULT 499;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'revenue_share_percent') THEN
    ALTER TABLE "partners" ADD COLUMN "revenue_share_percent" real DEFAULT 0.04;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'total_debt_uzs') THEN
    ALTER TABLE "partners" ADD COLUMN "total_debt_uzs" integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'last_debt_calculated_at') THEN
    ALTER TABLE "partners" ADD COLUMN "last_debt_calculated_at" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'blocked_until') THEN
    ALTER TABLE "partners" ADD COLUMN "blocked_until" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'block_reason') THEN
    ALTER TABLE "partners" ADD COLUMN "block_reason" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'trial_start_date') THEN
    ALTER TABLE "partners" ADD COLUMN "trial_start_date" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'trial_end_date') THEN
    ALTER TABLE "partners" ADD COLUMN "trial_end_date" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'guarantee_start_date') THEN
    ALTER TABLE "partners" ADD COLUMN "guarantee_start_date" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'sales_before_us') THEN
    ALTER TABLE "partners" ADD COLUMN "sales_before_us" integer DEFAULT 0;
  END IF;
  
  -- ==================== CRITICAL: PARTNER STATUS FIELDS ====================
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'is_active') THEN
    ALTER TABLE "partners" ADD COLUMN "is_active" boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'business_address') THEN
    ALTER TABLE "partners" ADD COLUMN "business_address" varchar(500);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'phone') THEN
    ALTER TABLE "partners" ADD COLUMN "phone" varchar(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'website') THEN
    ALTER TABLE "partners" ADD COLUMN "website" varchar(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'updated_at') THEN
    ALTER TABLE "partners" ADD COLUMN "updated_at" timestamp;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'created_at') THEN
    ALTER TABLE "partners" ADD COLUMN "created_at" timestamp DEFAULT NOW();
  END IF;

  -- ==================== PRODUCTS TABLE ====================
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'optimized_title') THEN
    ALTER TABLE "products" ADD COLUMN "optimized_title" varchar(500);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_active') THEN
    ALTER TABLE "products" ADD COLUMN "is_active" boolean DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'low_stock_threshold') THEN
    ALTER TABLE "products" ADD COLUMN "low_stock_threshold" integer DEFAULT 10;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand') THEN
    ALTER TABLE "products" ADD COLUMN "brand" varchar(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'barcode') THEN
    ALTER TABLE "products" ADD COLUMN "barcode" varchar(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sku') THEN
    ALTER TABLE "products" ADD COLUMN "sku" varchar(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_quantity') THEN
    ALTER TABLE "products" ADD COLUMN "stock_quantity" integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'cost_price') THEN
    ALTER TABLE "products" ADD COLUMN "cost_price" decimal(12,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'weight') THEN
    ALTER TABLE "products" ADD COLUMN "weight" varchar(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'dimensions') THEN
    ALTER TABLE "products" ADD COLUMN "dimensions" varchar(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
    ALTER TABLE "products" ADD COLUMN "updated_at" timestamp;
  END IF;

  -- ==================== MARKETPLACE_INTEGRATIONS TABLE ====================
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'api_key') THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "api_key" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'api_secret') THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "api_secret" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'active') THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "active" boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'last_sync_at') THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "last_sync_at" timestamp;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'created_at') THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "created_at" timestamp DEFAULT NOW();
  END IF;

  -- ==================== AUDIT_LOGS TABLE ====================
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'changes') THEN
    ALTER TABLE "audit_logs" ADD COLUMN "changes" text;
  END IF;

END $$;
`;

  try {
    await pool.query(compatSql);
    console.log('✅ PostgreSQL compatibility ensured');
  } catch (error) {
    console.error('❌ PostgreSQL compatibility migration failed:', error);
  }
}

/**
 * Create all PostgreSQL tables
 */
async function createPostgresTables(pool: Pool) {
  console.log('🔄 Creating PostgreSQL tables...');
  
  // 1. SESSION TABLE
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
    );
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
  `);
  console.log('✅ Session table ready');

  // 2. REFERRALS TABLE
  await pool.query(`
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
  `);
  console.log('✅ Referrals table ready');

  // 3. MARKETPLACE_INTEGRATIONS TABLE
  await pool.query(`
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
  `);
  console.log('✅ Marketplace integrations table ready');

  // 4. BLOG TABLES
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "blog_categories" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL UNIQUE,
      "description" TEXT,
      "icon" TEXT,
      "color" TEXT,
      "sort_order" INTEGER DEFAULT 0,
      "created_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ Blog categories table ready');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "blog_posts" (
      "id" TEXT PRIMARY KEY,
      "slug" TEXT NOT NULL UNIQUE,
      "title" TEXT NOT NULL,
      "excerpt" TEXT,
      "content" TEXT NOT NULL,
      "featured_image" TEXT,
      "video_url" TEXT,
      "category" TEXT DEFAULT 'news',
      "tags" TEXT,
      "status" TEXT DEFAULT 'draft',
      "author_id" TEXT NOT NULL,
      "author_name" TEXT,
      "view_count" INTEGER DEFAULT 0,
      "like_count" INTEGER DEFAULT 0,
      "meta_title" TEXT,
      "meta_description" TEXT,
      "meta_keywords" TEXT,
      "published_at" TIMESTAMP,
      "created_at" TIMESTAMP DEFAULT NOW(),
      "updated_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ Blog posts table ready');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "blog_comments" (
      "id" TEXT PRIMARY KEY,
      "post_id" TEXT NOT NULL,
      "user_id" TEXT,
      "author_name" TEXT,
      "author_email" TEXT,
      "content" TEXT NOT NULL,
      "status" TEXT DEFAULT 'pending',
      "created_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ Blog comments table ready');

  // 5. AI TABLES
  await pool.query(`
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
  `);
  console.log('✅ AI tasks table ready');

  await pool.query(`
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
  `);
  console.log('✅ AI product cards table ready');

  // 6. TRENDING_PRODUCTS TABLE
  await pool.query(`
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
  `);
  console.log('✅ Trending products table ready');

  // 7. ANALYTICS TABLE
  await pool.query(`
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
  `);
  console.log('✅ Analytics table ready');

  // 8. CHAT TABLES
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "chat_rooms" (
      "id" TEXT PRIMARY KEY,
      "partner_id" TEXT NOT NULL,
      "title" TEXT,
      "created_at" TIMESTAMP DEFAULT NOW(),
      "updated_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ Chat rooms table ready');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "messages" (
      "id" TEXT PRIMARY KEY,
      "room_id" TEXT NOT NULL,
      "partner_id" TEXT NOT NULL,
      "role" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "metadata" TEXT,
      "created_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ Messages table ready');

  // 9. PRICING_TIERS TABLE
  await pool.query(`
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
  `);
  console.log('✅ Pricing tiers table ready');

  // 10. SUBSCRIPTIONS TABLE
  await pool.query(`
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
  `);
  console.log('✅ Subscriptions table ready');

  // 11. NOTIFICATIONS TABLE
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "notifications" (
      "id" TEXT PRIMARY KEY,
      "user_id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "type" TEXT DEFAULT 'info',
      "read" BOOLEAN DEFAULT false,
      "created_at" TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ Notifications table ready');

  // 12. AI_MARKETPLACE_ACCOUNTS TABLE
  await pool.query(`
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
  `);
  console.log('✅ AI marketplace accounts table ready');

  // 13. WALLET_TRANSACTIONS TABLE
  await pool.query(`
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
  `);
  console.log('✅ Wallet transactions table ready');

  console.log('✅ All PostgreSQL tables created successfully');
}

/**
 * Run PostgreSQL migrations
 */
async function runPostgresMigrations() {
  console.log('🔄 Running PostgreSQL migrations...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL connected');
    
    // Create tables
    await createPostgresTables(pool);
    
    // Ensure compatibility
    await ensurePostgresCompatibility(pool);
    
    console.log('✅ PostgreSQL migrations completed successfully');
  } catch (error) {
    console.error('❌ PostgreSQL migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Main migration function
 */
export async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL || '';
  const isPostgres = databaseUrl.startsWith('postgres');
  
  console.log('🔧 Initializing database tables...');
  console.log(`📦 Database type: ${isPostgres ? 'PostgreSQL' : 'SQLite'}`);
  
  if (isPostgres) {
    await runPostgresMigrations();
  } else {
    await runSQLiteMigrations();
  }
  
  console.log('✅ Database migrations completed successfully');
}

// Export for direct execution
export default runMigrations;
