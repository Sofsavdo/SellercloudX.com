// Database Configuration - Production Ready
// PostgreSQL (Railway) yoki SQLite (local development)

import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePostgres } from 'drizzle-orm/node-postgres';
import Database from 'better-sqlite3';
import { Pool } from 'pg';
import * as schema from '@shared/schema';

// Database connection configuration
const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV || 'development';

let db: any;
let dbType: 'postgres' | 'sqlite' = 'sqlite';
let sqliteInstance: Database | null = null;

// Check if DATABASE_URL is provided (Railway PostgreSQL)
if (DATABASE_URL && DATABASE_URL.startsWith('postgres://')) {
  console.log('✅ Using PostgreSQL (Railway)');
  dbType = 'postgres';
  
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test connection
  pool.on('connect', () => {
    console.log('✅ PostgreSQL connected');
  });

  pool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err);
  });

  db = drizzlePostgres(pool, { schema });
} else {
  // Fallback to SQLite for local development
  console.log('⚠️  Using SQLite (local development)');
  console.log('💡 For production, set DATABASE_URL environment variable');
  
  // Use persistent path for SQLite
  const sqlitePath = process.env.SQLITE_PATH || './data/sellercloudx.db';
  
  // Ensure directory exists
  const fs = require('fs');
  const path = require('path');
  const dir = path.dirname(sqlitePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  sqliteInstance = new Database(sqlitePath, {
    // Enable WAL mode for better concurrency
    // This allows multiple readers and one writer
  });

  // Enable WAL mode for better performance
  sqliteInstance.pragma('journal_mode = WAL');
  sqliteInstance.pragma('foreign_keys = ON');
  sqliteInstance.pragma('synchronous = NORMAL');
  sqliteInstance.pragma('cache_size = -64000'); // 64MB cache
  sqliteInstance.pragma('temp_store = memory');

  db = drizzle(sqliteInstance, { schema });
}

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    if (dbType === 'postgres') {
      const result = await db.execute('SELECT 1');
      return true;
    } else {
      db.run('SELECT 1');
      return true;
    }
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}

// Initialize database tables
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🔧 Initializing database...');
    
    if (dbType === 'postgres') {
      // PostgreSQL - use migrations
      console.log('📦 PostgreSQL: Run migrations manually or use Drizzle Kit');
    } else {
      // SQLite - create tables if not exist
      const fs = require('fs');
      const path = require('path');
      const migrationPath = path.join(__dirname, '../migrations/add_ai_tables.sql');
      
      if (fs.existsSync(migrationPath)) {
        const migration = fs.readFileSync(migrationPath, 'utf-8');
        // Execute migration (basic SQL execution)
        const statements = migration.split(';').filter((s: string) => s.trim());
        for (const statement of statements) {
          try {
            db.run(statement);
          } catch (err: any) {
            // Ignore "table already exists" errors
            if (!err.message.includes('already exists')) {
              console.warn('Migration warning:', err.message);
            }
          }
        }
      }
    }
    
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

export { db, dbType, sqliteInstance as sqlite };
