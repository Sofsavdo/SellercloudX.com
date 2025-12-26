import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { Pool } from 'pg';
import * as schema from '@shared/schema';

// Smart Database Connection - Auto-detect PostgreSQL or SQLite
// Railway provides DATABASE_URL for PostgreSQL
// Local development uses SQLite

const isDevelopment = process.env.NODE_ENV !== 'production';
const hasPostgresUrl = !!process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');

console.log('🔧 Database Configuration:');
console.log('   Environment:', process.env.NODE_ENV);
console.log('   Has PostgreSQL URL:', hasPostgresUrl);

let db: any;
let dbType: 'postgres' | 'sqlite';

if (hasPostgresUrl) {
  // ✅ PRODUCTION: PostgreSQL (Railway, Render, etc.)
  console.log('📦 Using PostgreSQL database...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false,
    max: 20, // Connection pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  // Test connection
  pool.on('error', (err) => {
    console.error('❌ Unexpected PostgreSQL error:', err);
  });

  pool.on('connect', () => {
    console.log('✅ PostgreSQL connected successfully');
  });

  db = drizzle(pool, { schema });
  dbType = 'postgres';
  
  // Initialize PostgreSQL tables
  initializePostgreSQLTables(pool);
  
} else {
  // ✅ DEVELOPMENT: SQLite (local testing)
  console.log('📦 Using SQLite database (dev.db)...');
  
  const sqlite = new Database('dev.db');
  db = drizzleSqlite(sqlite, { schema });
  dbType = 'sqlite';
  
  // Initialize SQLite tables (existing auto-migration logic)
  initializeSQLiteTables(sqlite);
}

// Initialize PostgreSQL tables
async function initializePostgreSQLTables(pool: Pool) {
  try {
    console.log('🔧 Initializing PostgreSQL tables...');
    
    const client = await pool.connect();
    
    // Check if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    if (result.rows.length === 0) {
      console.log('📦 Creating PostgreSQL tables...');
      
      // Run all migrations in correct order
      await client.query(`
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE,
          password TEXT NOT NULL,
          first_name TEXT,
          last_name TEXT,
          phone TEXT,
          role TEXT NOT NULL DEFAULT 'customer',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        
        -- Partners table
        CREATE TABLE IF NOT EXISTS partners (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
          business_name TEXT NOT NULL,
          business_address TEXT,
          business_category TEXT,
          inn TEXT UNIQUE,
          phone TEXT NOT NULL,
          website TEXT,
          monthly_revenue TEXT,
          approved BOOLEAN DEFAULT false,
          pricing_tier TEXT DEFAULT 'free_starter',
          monthly_fee INTEGER,
          profit_share_percent INTEGER,
          ai_enabled BOOLEAN DEFAULT false,
          ai_requested_at TIMESTAMP,
          ai_approved_at TIMESTAMP,
          ai_approved_by TEXT,
          warehouse_space_kg INTEGER,
          notes TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          last_activity_at TIMESTAMP
        );
        
        -- Products table
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          partner_id TEXT NOT NULL REFERENCES partners(id),
          name TEXT NOT NULL,
          sku TEXT UNIQUE,
          barcode TEXT,
          description TEXT,
          category TEXT,
          brand TEXT,
          price NUMERIC NOT NULL,
          cost_price NUMERIC,
          weight TEXT,
          stock_quantity INTEGER DEFAULT 0,
          low_stock_threshold INTEGER DEFAULT 10,
          optimized_title TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP
        );
        
        -- Orders table
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          partner_id TEXT NOT NULL REFERENCES partners(id),
          order_number TEXT UNIQUE NOT NULL,
          customer_name TEXT NOT NULL,
          customer_email TEXT,
          customer_phone TEXT,
          marketplace TEXT,
          status TEXT DEFAULT 'pending',
          total_amount NUMERIC NOT NULL,
          shipping_address TEXT,
          tracking_number TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP
        );
        
        -- Order Items table
        CREATE TABLE IF NOT EXISTS order_items (
          id TEXT PRIMARY KEY,
          order_id TEXT NOT NULL REFERENCES orders(id),
          product_id TEXT NOT NULL REFERENCES products(id),
          quantity INTEGER NOT NULL,
          price NUMERIC NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        
        -- Marketplace Integrations table
        CREATE TABLE IF NOT EXISTS marketplace_integrations (
          id TEXT PRIMARY KEY,
          partner_id TEXT NOT NULL REFERENCES partners(id),
          marketplace TEXT NOT NULL,
          api_key TEXT,
          api_secret TEXT,
          seller_id TEXT,
          active BOOLEAN DEFAULT false,
          last_sync_at TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        
        -- Subscriptions table
        CREATE TABLE IF NOT EXISTS subscriptions (
          id TEXT PRIMARY KEY,
          partner_id TEXT NOT NULL REFERENCES partners(id),
          tier_id TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          start_date TIMESTAMP NOT NULL,
          end_date TIMESTAMP,
          auto_renew BOOLEAN DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP
        );
        
        -- Invoices table
        CREATE TABLE IF NOT EXISTS invoices (
          id TEXT PRIMARY KEY,
          partner_id TEXT NOT NULL REFERENCES partners(id),
          subscription_id TEXT REFERENCES subscriptions(id),
          amount NUMERIC NOT NULL,
          currency TEXT DEFAULT 'USD',
          status TEXT NOT NULL DEFAULT 'pending',
          due_date TIMESTAMP NOT NULL,
          paid_at TIMESTAMP,
          payment_method TEXT,
          metadata TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        
        -- Payments table
        CREATE TABLE IF NOT EXISTS payments (
          id TEXT PRIMARY KEY,
          invoice_id TEXT NOT NULL REFERENCES invoices(id),
          partner_id TEXT NOT NULL REFERENCES partners(id),
          amount NUMERIC NOT NULL,
          currency TEXT DEFAULT 'USD',
          payment_method TEXT NOT NULL,
          transaction_id TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          metadata TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          completed_at TIMESTAMP
        );
        
        -- Referrals table
        CREATE TABLE IF NOT EXISTS referrals (
          id TEXT PRIMARY KEY,
          referrer_partner_id TEXT NOT NULL REFERENCES partners(id),
          referred_partner_id TEXT NOT NULL REFERENCES partners(id),
          promo_code TEXT,
          contract_type TEXT NOT NULL,
          status TEXT DEFAULT 'invited',
          bonus_earned NUMERIC DEFAULT 0,
          bonus_paid NUMERIC DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          activated_at TIMESTAMP,
          expires_at TIMESTAMP
        );
        
        -- Audit Logs table
        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          user_id TEXT REFERENCES users(id),
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT,
          changes TEXT,
          payload TEXT,
          ip_address TEXT,
          user_agent TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        
        -- Admin Permissions table
        CREATE TABLE IF NOT EXISTS admin_permissions (
          user_id TEXT PRIMARY KEY REFERENCES users(id),
          can_manage_admins BOOLEAN DEFAULT false,
          can_manage_content BOOLEAN DEFAULT false,
          can_manage_chat BOOLEAN DEFAULT false,
          can_view_reports BOOLEAN DEFAULT false,
          can_receive_products BOOLEAN DEFAULT false,
          can_activate_partners BOOLEAN DEFAULT false,
          can_manage_integrations BOOLEAN DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP
        );
        
        -- Create indexes for performance
        CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);
        CREATE INDEX IF NOT EXISTS idx_products_partner_id ON products(partner_id);
        CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON orders(partner_id);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
      `);
      
      console.log('✅ PostgreSQL tables created successfully');
      
      // Create default admin user
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminId = `admin-${Date.now()}`;
      
      await client.query(`
        INSERT INTO users (id, username, email, password, role, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (username) DO NOTHING
      `, [adminId, 'admin', 'admin@sellercloudx.com', hashedPassword, 'admin']);
      
      console.log('✅ Default admin user created');
      console.log('   👤 Username: admin');
      console.log('   🔑 Password: admin123');
    } else {
      console.log('✅ PostgreSQL tables already exist');
    }
    
    client.release();
  } catch (error) {
    console.error('❌ PostgreSQL initialization error:', error);
    throw error;
  }
}

// Initialize SQLite tables (existing logic)
function initializeSQLiteTables(sqlite: Database.Database) {
  try {
    const tableCheck = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    
    if (!tableCheck) {
      console.log('📦 Creating SQLite tables...');
      
      // Use existing SQLite schema from original db.ts
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE,
          password TEXT NOT NULL,
          first_name TEXT,
          last_name TEXT,
          phone TEXT,
          role TEXT NOT NULL DEFAULT 'customer',
          is_active INTEGER DEFAULT 1,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          updated_at INTEGER DEFAULT (unixepoch())
        );
        
        CREATE TABLE IF NOT EXISTS partners (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
          business_name TEXT NOT NULL,
          business_address TEXT,
          business_category TEXT,
          inn TEXT UNIQUE,
          phone TEXT NOT NULL,
          website TEXT,
          monthly_revenue TEXT,
          approved INTEGER DEFAULT 0,
          pricing_tier TEXT DEFAULT 'starter_pro',
          monthly_fee INTEGER,
          profit_share_percent INTEGER,
          ai_enabled INTEGER DEFAULT 0,
          warehouse_space_kg INTEGER,
          notes TEXT,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          last_activity_at INTEGER
        );
        
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          partner_id TEXT NOT NULL REFERENCES partners(id),
          name TEXT NOT NULL,
          sku TEXT UNIQUE,
          barcode TEXT,
          description TEXT,
          category TEXT,
          brand TEXT,
          price REAL NOT NULL,
          cost_price REAL,
          weight TEXT,
          stock_quantity INTEGER DEFAULT 0,
          low_stock_threshold INTEGER DEFAULT 10,
          optimized_title TEXT,
          is_active INTEGER DEFAULT 1,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          updated_at INTEGER
        );
        
        CREATE TABLE IF NOT EXISTS marketplace_integrations (
          id TEXT PRIMARY KEY,
          partner_id TEXT NOT NULL REFERENCES partners(id),
          marketplace TEXT NOT NULL,
          api_key TEXT,
          api_secret TEXT,
          seller_id TEXT,
          active INTEGER DEFAULT 0,
          last_sync_at INTEGER,
          created_at INTEGER NOT NULL DEFAULT (unixepoch())
        );
        
        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          user_id TEXT REFERENCES users(id),
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT,
          payload TEXT,
          created_at INTEGER NOT NULL DEFAULT (unixepoch())
        );
      `);
      
      console.log('✅ SQLite tables created');
      
      // Create default admin
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      const adminId = 'admin-' + Date.now();
      
      sqlite.prepare(`
        INSERT INTO users (id, username, email, password, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(adminId, 'admin', 'admin@sellercloudx.com', hashedPassword, 'admin', Date.now());
      
      console.log('✅ Default admin user created (SQLite)');
    } else {
      console.log('✅ SQLite tables already exist');
    }
  } catch (error) {
    console.error('❌ SQLite initialization error:', error);
  }
}

// Export database info
export function getDatabaseInfo() {
  return {
    type: dbType,
    isConnected: !!db,
    connectionString: hasPostgresUrl ? 'PostgreSQL' : 'SQLite (dev.db)',
  };
}

// Export sqlite instance for services that need direct access
// Note: This will be null in PostgreSQL mode
let sqliteInstance: Database.Database | null = null;
if (!hasPostgresUrl) {
  const Database = require('better-sqlite3');
  sqliteInstance = new Database('dev.db');
}

export { db, dbType };
export const sqlite = sqliteInstance; // For backward compatibility
