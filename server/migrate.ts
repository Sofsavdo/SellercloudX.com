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

  -- Fix partners.ai_cards_used column (CRITICAL FOR RAILWAY)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'ai_cards_used'
  ) THEN
    ALTER TABLE "partners" ADD COLUMN "ai_cards_used" integer DEFAULT 0;
  END IF;

  -- Fix partners.ai_cards_limit column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'ai_cards_limit'
  ) THEN
    ALTER TABLE "partners" ADD COLUMN "ai_cards_limit" integer DEFAULT 50;
  END IF;

  -- Fix products.low_stock_threshold column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE "products" ADD COLUMN "low_stock_threshold" integer DEFAULT 10;
  END IF;

  -- Fix audit_logs.ip_address column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE "audit_logs" ADD COLUMN "ip_address" text;
  END IF;

  -- Fix audit_logs.user_agent column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE "audit_logs" ADD COLUMN "user_agent" text;
  END IF;

  -- Fix analytics.metric_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'analytics' AND column_name = 'metric_type'
  ) THEN
    ALTER TABLE "analytics" ADD COLUMN "metric_type" text DEFAULT 'revenue';
  END IF;

  -- Fix partners.referral_code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE "partners" ADD COLUMN "referral_code" text;
  END IF;

END $$;

-- Create wallet_transactions table if not exists
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  type TEXT NOT NULL,
  amount TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payment_history table if not exists
CREATE TABLE IF NOT EXISTS payment_history (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  amount TEXT NOT NULL,
  currency TEXT DEFAULT 'UZS',
  payment_method TEXT,
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  metadata TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Create impersonation_logs table if not exists
CREATE TABLE IF NOT EXISTS impersonation_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create business_metrics table if not exists
CREATE TABLE IF NOT EXISTS business_metrics (
  id TEXT PRIMARY KEY,
  metric_date TEXT NOT NULL,
  total_partners INTEGER DEFAULT 0,
  active_partners INTEGER DEFAULT 0,
  paying_partners INTEGER DEFAULT 0,
  churned_partners INTEGER DEFAULT 0,
  mrr TEXT DEFAULT '0',
  arr TEXT DEFAULT '0',
  total_revenue TEXT DEFAULT '0',
  total_costs TEXT DEFAULT '0',
  profit_margin TEXT DEFAULT '0',
  metadata TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
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
    
    console.log('✅ Session table created successfully');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
