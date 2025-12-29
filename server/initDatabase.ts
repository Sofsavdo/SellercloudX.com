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
    
    // First, check if tables exist and add missing columns
    // This handles the case where tables exist but columns are missing
    
    // Check and add last_price_update to products if missing
    try {
      const productsInfo = sqlite.prepare("PRAGMA table_info(products)").all() as any[];
      const hasLastPriceUpdate = productsInfo.some((col: any) => col.name === 'last_price_update');
      if (!hasLastPriceUpdate) {
        console.log('📝 Adding last_price_update column to products table...');
        sqlite.exec('ALTER TABLE products ADD COLUMN last_price_update INTEGER');
      }
    } catch (e) {
      // Table might not exist yet, will be created below
    }
    
    // Check and add columns to marketplace_products if missing
    try {
      const mpInfo = sqlite.prepare("PRAGMA table_info(marketplace_products)").all() as any[];
      const hasLastPriceUpdate = mpInfo.some((col: any) => col.name === 'last_price_update');
      const hasIsActive = mpInfo.some((col: any) => col.name === 'is_active');
      if (!hasLastPriceUpdate) {
        console.log('📝 Adding last_price_update column to marketplace_products table...');
        sqlite.exec('ALTER TABLE marketplace_products ADD COLUMN last_price_update INTEGER');
      }
      if (!hasIsActive) {
        console.log('📝 Adding is_active column to marketplace_products table...');
        sqlite.exec('ALTER TABLE marketplace_products ADD COLUMN is_active INTEGER DEFAULT 1');
      }
    } catch (e) {
      // Table might not exist yet, will be created below
    }
    
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
        last_price_update INTEGER,
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
        active INTEGER DEFAULT 1,
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
        ai_title TEXT,
        ai_description TEXT,
        status TEXT DEFAULT 'pending',
        error_message TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER
      );
    `);
    
    // Chat rooms table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id TEXT PRIMARY KEY,
        partner_id TEXT REFERENCES partners(id),
        admin_id TEXT REFERENCES users(id),
        status TEXT DEFAULT 'active',
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        last_message_at INTEGER
      );
    `);
    
    // Messages table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_room_id TEXT NOT NULL REFERENCES chat_rooms(id),
        sender_id TEXT NOT NULL REFERENCES users(id),
        sender_role TEXT NOT NULL,
        content TEXT NOT NULL,
        message_type TEXT DEFAULT 'text',
        attachment_url TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        read_at INTEGER
      );
    `);
    
    // Analytics table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS analytics (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        metric_type TEXT NOT NULL,
        value REAL NOT NULL,
        date INTEGER NOT NULL,
        metadata TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    
    // Profit breakdown table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS profit_breakdown (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        order_id TEXT REFERENCES orders(id),
        revenue REAL NOT NULL,
        costs REAL NOT NULL,
        platform_fee REAL NOT NULL,
        profit_share REAL NOT NULL,
        net_profit REAL NOT NULL,
        date INTEGER NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    
    // Trending products table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS trending_products (
        id TEXT PRIMARY KEY,
        marketplace TEXT NOT NULL,
        category TEXT NOT NULL,
        product_name TEXT NOT NULL,
        price REAL,
        sales_count INTEGER,
        rating REAL,
        trend_score INTEGER NOT NULL,
        image_url TEXT,
        product_url TEXT,
        analyzed_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    
    // Stock alerts table (matching schema.ts)
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS stock_alerts (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES products(id),
        alert_type TEXT NOT NULL,
        message TEXT NOT NULL,
        resolved INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        resolved_at INTEGER
      );
    `);
    
    // Referral First Purchases table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS referral_first_purchases (
        id TEXT PRIMARY KEY,
        referral_id TEXT NOT NULL REFERENCES referrals(id),
        referrer_partner_id TEXT NOT NULL REFERENCES partners(id),
        referred_partner_id TEXT NOT NULL REFERENCES partners(id),
        subscription_id TEXT REFERENCES subscriptions(id),
        invoice_id TEXT REFERENCES invoices(id),
        payment_id TEXT REFERENCES payments(id),
        tier_id TEXT NOT NULL,
        monthly_fee REAL NOT NULL,
        subscription_months INTEGER NOT NULL DEFAULT 1,
        total_amount REAL NOT NULL,
        commission_rate REAL NOT NULL DEFAULT 0.10,
        commission_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        paid_at INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    
    // Referral Campaigns table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS referral_campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        start_date INTEGER NOT NULL,
        end_date INTEGER NOT NULL,
        duration_days INTEGER NOT NULL,
        target_referrals INTEGER NOT NULL,
        bonus_amount REAL NOT NULL,
        min_tier TEXT NOT NULL DEFAULT 'basic',
        min_subscription_months INTEGER NOT NULL DEFAULT 1,
        status TEXT DEFAULT 'active',
        participants INTEGER DEFAULT 0,
        winners INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        created_by TEXT NOT NULL
      );
    `);
    
    // Referral Campaign Participants table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS referral_campaign_participants (
        id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL REFERENCES referral_campaigns(id),
        referrer_partner_id TEXT NOT NULL REFERENCES partners(id),
        referrals_count INTEGER DEFAULT 0,
        bonus_earned REAL DEFAULT 0,
        status TEXT DEFAULT 'participating',
        joined_at INTEGER NOT NULL DEFAULT (unixepoch()),
        completed_at INTEGER
      );
    `);
    
    console.log('✅ All database tables created successfully');
    
    // Final check: ensure all required columns exist
    console.log('🔍 Verifying all columns exist...');
    
    // Verify marketplace_products has last_price_update
    try {
      const mpInfo = sqlite.prepare("PRAGMA table_info(marketplace_products)").all() as any[];
      const hasLastPriceUpdate = mpInfo.some((col: any) => col.name === 'last_price_update');
      if (!hasLastPriceUpdate) {
        console.log('📝 Adding last_price_update to marketplace_products...');
        sqlite.exec('ALTER TABLE marketplace_products ADD COLUMN last_price_update INTEGER');
      }
      const hasIsActive = mpInfo.some((col: any) => col.name === 'is_active');
      if (!hasIsActive) {
        console.log('📝 Adding is_active to marketplace_products...');
        sqlite.exec('ALTER TABLE marketplace_products ADD COLUMN is_active INTEGER DEFAULT 1');
      }
    } catch (e) {
      console.warn('⚠️  Could not verify marketplace_products columns:', e);
    }
    
    // Verify products has last_price_update
    try {
      const pInfo = sqlite.prepare("PRAGMA table_info(products)").all() as any[];
      const hasLastPriceUpdate = pInfo.some((col: any) => col.name === 'last_price_update');
      if (!hasLastPriceUpdate) {
        console.log('📝 Adding last_price_update to products...');
        sqlite.exec('ALTER TABLE products ADD COLUMN last_price_update INTEGER');
      }
    } catch (e) {
      console.warn('⚠️  Could not verify products columns:', e);
    }
    
    console.log('✅ Column verification completed');
    
  } catch (error) {
    console.error('❌ Error initializing database tables:', error);
    throw error;
  }
}

