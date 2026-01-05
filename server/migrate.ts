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
    
    console.log('✅ Session table created successfully');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
