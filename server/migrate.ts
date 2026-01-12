// @ts-nocheck
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema';
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
      return; // Don't throw error, just skip migration
    }
    
    // Check and add anydesk columns
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
    
    if (hasAnydeskId && hasAnydeskPassword) {
      console.log('✅ AnyDesk columns already exist');
    }
    
    db.close();
    console.log('✅ SQLite migrations completed');
  } catch (error) {
    console.error('❌ SQLite migration failed:', error);
    // Don't throw error in production, just log it
    if (process.env.NODE_ENV !== 'production') {
      throw error;
    }
  }
}

async function ensurePostgresCompatibility(pool: Pool) {
  const compatSql = `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'business_address'
  ) THEN
    ALTER TABLE "partners" ADD COLUMN "business_address" varchar(500);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'phone'
  ) THEN
    ALTER TABLE "partners" ADD COLUMN "phone" varchar(50);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'website'
  ) THEN
    ALTER TABLE "partners" ADD COLUMN "website" varchar(255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'inn'
  ) THEN
    ALTER TABLE "partners" ADD COLUMN "inn" varchar(50);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'monthly_fee'
  ) THEN
    ALTER TABLE "partners" ADD COLUMN "monthly_fee" integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'profit_share_percent'
  ) THEN
    ALTER TABLE "partners" ADD COLUMN "profit_share_percent" integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'warehouse_space_kg'
  ) THEN
    ALTER TABLE "partners" ADD COLUMN "warehouse_space_kg" integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'ai_enabled'
  ) THEN
    ALTER TABLE "partners" ADD COLUMN "ai_enabled" boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'anydesk_id'
  ) THEN
    ALTER TABLE "partners" ADD COLUMN "anydesk_id" varchar(100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'anydesk_password'
  ) THEN
    ALTER TABLE "partners" ADD COLUMN "anydesk_password" varchar(100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'last_activity_at'
  ) THEN
    ALTER TABLE "partners" ADD COLUMN "last_activity_at" timestamp;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'approved'
  ) THEN
    ALTER TABLE "partners" ADD COLUMN "approved" boolean DEFAULT false NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'is_approved'
  ) THEN
    UPDATE "partners" SET "approved" = true WHERE COALESCE("is_approved", false) = true;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'pricing_tier' AND data_type = 'USER-DEFINED'
  ) THEN
    ALTER TABLE "partners" ALTER COLUMN "pricing_tier" TYPE varchar(50) USING "pricing_tier"::text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'business_category' AND data_type = 'USER-DEFINED'
  ) THEN
    ALTER TABLE "partners" ALTER COLUMN "business_category" TYPE varchar(100) USING "business_category"::text;
  END IF;

  BEGIN
    ALTER TABLE "partners" ALTER COLUMN "business_category" DROP NOT NULL;
  EXCEPTION WHEN others THEN
  END;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'monthly_revenue' AND data_type = 'numeric'
  ) THEN
    ALTER TABLE "partners" ALTER COLUMN "monthly_revenue" TYPE varchar(50) USING "monthly_revenue"::text;
  END IF;

  -- Fix products.brand column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'brand'
  ) THEN
    ALTER TABLE "products" ADD COLUMN "brand" varchar(100);
  END IF;

  -- Fix audit_logs.changes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'changes'
  ) THEN
    ALTER TABLE "audit_logs" ADD COLUMN "changes" text;
  END IF;

  -- Fix products.stock_quantity column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE "products" ADD COLUMN "stock_quantity" integer DEFAULT 0;
  END IF;

  -- Fix products.cost_price column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'cost_price'
  ) THEN
    ALTER TABLE "products" ADD COLUMN "cost_price" decimal(10,2) DEFAULT 0;
  END IF;

  -- Fix products.weight column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'weight'
  ) THEN
    ALTER TABLE "products" ADD COLUMN "weight" decimal(8,2) DEFAULT 0;
  END IF;

  -- Fix products.dimensions column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'dimensions'
  ) THEN
    ALTER TABLE "products" ADD COLUMN "dimensions" varchar(100);
  END IF;

  -- Fix products.optimized_title column (AI generated SEO title)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'optimized_title'
  ) THEN
    ALTER TABLE "products" ADD COLUMN "optimized_title" varchar(500);
  END IF;

  -- Fix products.low_stock_threshold column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE "products" ADD COLUMN "low_stock_threshold" integer DEFAULT 10;
  END IF;

  -- Fix products.is_active column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE "products" ADD COLUMN "is_active" boolean DEFAULT true;
  END IF;

  -- Fix products.barcode column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'barcode'
  ) THEN
    ALTER TABLE "products" ADD COLUMN "barcode" varchar(100);
  END IF;

  -- Add promo_code column to partners
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'promo_code'
  ) THEN
    ALTER TABLE "partners" ADD COLUMN "promo_code" varchar(50) UNIQUE;
  END IF;

  -- Add ai_cards_used column to partners
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'ai_cards_used'
  ) THEN
    ALTER TABLE "partners" ADD COLUMN "ai_cards_used" integer DEFAULT 0;
  END IF;

  -- Add notes column to partners
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'notes'
  ) THEN
    ALTER TABLE "partners" ADD COLUMN "notes" text;
  END IF;

  -- ==================== MARKETPLACE_INTEGRATIONS COLUMNS ====================
  
  -- Add api_key column to marketplace_integrations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'marketplace_integrations' AND column_name = 'api_key'
  ) THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "api_key" TEXT;
  END IF;

  -- Add api_secret column to marketplace_integrations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'marketplace_integrations' AND column_name = 'api_secret'
  ) THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "api_secret" TEXT;
  END IF;

  -- Add active column to marketplace_integrations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'marketplace_integrations' AND column_name = 'active'
  ) THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "active" BOOLEAN DEFAULT false;
  END IF;

  -- Add last_sync_at column to marketplace_integrations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'marketplace_integrations' AND column_name = 'last_sync_at'
  ) THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "last_sync_at" TIMESTAMP;
  END IF;

  -- Add created_at column to marketplace_integrations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'marketplace_integrations' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE "marketplace_integrations" ADD COLUMN "created_at" TIMESTAMP DEFAULT NOW();
  END IF;

END $$;
`;

  try {
    await pool.query(compatSql);
  } catch (error) {
    console.error('❌ PostgreSQL compatibility migration failed:', error);
  }
}

/**
 * Run database migrations
 * This should be called on server startup in production
 */
export async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  
  // Check if using SQLite
  if (
    !connectionString ||
    connectionString.startsWith('file:') ||
    (!connectionString.includes('postgresql://') && !connectionString.includes('postgres://'))
  ) {
    await runSQLiteMigrations();
    return;
  }
  
  try {
    console.log('🔄 Running database migrations...');
    
    const pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });

    await ensurePostgresCompatibility(pool);
    
    const db = drizzle(pool, { schema });
    
    // Run migrations from the migrations folder
    await migrate(db, { migrationsFolder: './migrations' });
    
    console.log('✅ Database migrations completed successfully');
    
    // Create session table for connect-pg-simple
    console.log('🔄 Creating session table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      ) WITH (OIDS=FALSE);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);

    // Create referrals table
    console.log('🔄 Creating referrals table...');
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

    // Create marketplace_integrations table
    console.log('🔄 Creating marketplace_integrations table...');
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

    // Create blog_categories table
    console.log('🔄 Creating blog_categories table...');
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

    // Create blog_posts table
    console.log('🔄 Creating blog_posts table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "blog_posts" (
        "id" TEXT PRIMARY KEY,
        "slug" TEXT NOT NULL UNIQUE,
        "title" TEXT NOT NULL,
        "excerpt" TEXT,
        "content" TEXT NOT NULL,
        "featured_image" TEXT,
        "video_url" TEXT,
        "category" TEXT NOT NULL DEFAULT 'news',
        "tags" TEXT,
        "status" TEXT NOT NULL DEFAULT 'draft',
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

    // Create blog_comments table
    console.log('🔄 Creating blog_comments table...');
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

    // Create ai_generated_products table
    console.log('🔄 Creating ai_generated_products table...');
    await pool.query(`
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
    `);

    // Create audit_logs table
    console.log('🔄 Creating audit_logs table...');
    await pool.query(`
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
    `);

    // Create notifications table
    console.log('🔄 Creating notifications table...');
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

    // Create ai_tasks table
    console.log('🔄 Creating ai_tasks table...');
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

    // Create trending_products table
    console.log('🔄 Creating trending_products table...');
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

    // Create pricing_tiers table
    console.log('🔄 Creating pricing_tiers table...');
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

    // Create subscriptions table
    console.log('🔄 Creating subscriptions table...');
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
    
    console.log('✅ All tables created successfully');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
