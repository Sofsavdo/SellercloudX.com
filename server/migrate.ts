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
    throw error;
  }
}

/**
 * Run database migrations
 * This should be called on server startup in production
 */
export async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  
  // Check if using SQLite
  if (!connectionString || connectionString.startsWith('file:') || !connectionString.includes('postgresql://')) {
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
