// Auto-create database tables using Drizzle Kit
import { db, dbType, sqlite } from './db';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';

/**
 * Initialize database tables - creates all tables if they don't exist
 * This is critical for SQLite deployments on Railway
 */
export async function initializeDatabaseTables() {
  try {
    console.log('🔧 Initializing database tables...');
    
    if (dbType === 'postgres') {
      // PostgreSQL - tables should be created via migrations
      console.log('📦 PostgreSQL: Tables should be created via migrations');
      return;
    }
    
    // SQLite - create tables manually using Drizzle
    if (!sqlite) {
      console.error('❌ SQLite instance not available');
      return;
    }
    
    console.log('📝 Creating SQLite tables...');
    
    // Create all tables from schema
    // We'll use raw SQL to create tables based on schema definitions
    
    // Users table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        role TEXT NOT NULL DEFAULT 'customer',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );
    `);
    
    // Partners table
    sqlite.exec(`
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
        pricing_tier TEXT DEFAULT 'free_starter',
        monthly_fee INTEGER,
        profit_share_percent INTEGER,
        ai_enabled INTEGER DEFAULT 0,
        warehouse_space_kg INTEGER,
        notes TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        last_activity_at INTEGER
      );
    `);
    
    // Products table
    sqlite.exec(`
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
    `);
    
    // Orders table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        order_number TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        customer_phone TEXT,
        marketplace TEXT,
        status TEXT DEFAULT 'pending',
        total_amount REAL NOT NULL,
        shipping_address TEXT,
        tracking_number TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER
      );
    `);
    
    // Order items table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL REFERENCES orders(id),
        product_id TEXT NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    
    // Marketplace integrations table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS marketplace_integrations (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        marketplace TEXT NOT NULL,
        api_key TEXT,
        api_secret TEXT,
        access_token TEXT,
        refresh_token TEXT,
        seller_id TEXT,
        is_active INTEGER DEFAULT 1,
        last_sync_at INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER
      );
    `);
    
    // AI tasks table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS ai_tasks (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        account_id TEXT REFERENCES ai_marketplace_accounts(id),
        task_type TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'pending',
        input_data TEXT,
        output_data TEXT,
        error_message TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        started_at INTEGER,
        completed_at INTEGER,
        updated_at INTEGER
      );
    `);
    
    // AI product cards table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS ai_product_cards (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        product_id TEXT REFERENCES products(id),
        marketplace TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        images TEXT,
        price REAL,
        status TEXT DEFAULT 'pending',
        error_message TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER
      );
    `);
    
    // AI marketplace accounts table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS ai_marketplace_accounts (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        marketplace TEXT NOT NULL,
        account_name TEXT,
        credentials TEXT,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER
      );
    `);
    
    // Marketplace products table (for tracking products on marketplaces)
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS marketplace_products (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        product_id TEXT REFERENCES products(id),
        marketplace TEXT NOT NULL,
        marketplace_product_id TEXT,
        marketplace_sku TEXT,
        title TEXT,
        price REAL,
        stock INTEGER,
        status TEXT DEFAULT 'active',
        error_message TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER
      );
    `);
    
    // AI generated products table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS ai_generated_products (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        product_id TEXT REFERENCES products(id),
        marketplace TEXT NOT NULL,
        generated_title TEXT,
        generated_description TEXT,
        generated_images TEXT,
        status TEXT DEFAULT 'pending',
        error_message TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER
      );
    `);
    
    console.log('✅ All database tables created successfully');
    
  } catch (error) {
    console.error('❌ Error initializing database tables:', error);
    throw error;
  }
}

