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
      // PostgreSQL - create missing tables dynamically
      console.log('📦 Database type: PostgreSQL');
      console.log('🔄 Running PostgreSQL migrations...');
      await initializePostgresTables();
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
    
    // Check and add anydesk columns to partners if missing
    try {
      const partnersInfo = sqlite.prepare("PRAGMA table_info(partners)").all() as any[];
      const hasAnydeskId = partnersInfo.some((col: any) => col.name === 'anydesk_id');
      const hasAnydeskPassword = partnersInfo.some((col: any) => col.name === 'anydesk_password');
      if (!hasAnydeskId) {
        console.log('📝 Adding anydesk_id column to partners table...');
        sqlite.exec('ALTER TABLE partners ADD COLUMN anydesk_id TEXT');
      }
      if (!hasAnydeskPassword) {
        console.log('📝 Adding anydesk_password column to partners table...');
        sqlite.exec('ALTER TABLE partners ADD COLUMN anydesk_password TEXT');
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
        ai_cards_used INTEGER DEFAULT 0,
        promo_code TEXT UNIQUE,
        warehouse_space_kg INTEGER,
        anydesk_id TEXT,
        anydesk_password TEXT,
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
    
    // AI Cost Records table (for tracking AI usage costs)
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS ai_cost_records (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL REFERENCES partners(id),
        operation TEXT NOT NULL,
        model TEXT NOT NULL,
        tokens_used INTEGER,
        images_generated INTEGER,
        cost REAL NOT NULL DEFAULT 0,
        tier TEXT NOT NULL DEFAULT 'free_starter',
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
    
    // Create admin_permissions table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS admin_permissions (
        user_id TEXT PRIMARY KEY REFERENCES users(id),
        can_manage_admins INTEGER NOT NULL DEFAULT 0,
        can_manage_content INTEGER NOT NULL DEFAULT 0,
        can_manage_chat INTEGER NOT NULL DEFAULT 0,
        can_view_reports INTEGER NOT NULL DEFAULT 0,
        can_receive_products INTEGER NOT NULL DEFAULT 0,
        can_activate_partners INTEGER NOT NULL DEFAULT 0,
        can_manage_integrations INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );
    `);
    
    // Create audit_logs table
    sqlite.exec(`
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
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
    `);
    
    // Add missing columns to existing tables
    console.log('📝 Adding missing columns to existing tables...');
    
    // Add ai_cards_used and promo_code to partners if missing
    try {
      const partnersInfo = sqlite.prepare("PRAGMA table_info(partners)").all() as any[];
      const hasAiCardsUsed = partnersInfo.some((col: any) => col.name === 'ai_cards_used');
      const hasPromoCode = partnersInfo.some((col: any) => col.name === 'promo_code');
      
      if (!hasAiCardsUsed) {
        console.log('📝 Adding ai_cards_used column to partners table...');
        sqlite.exec('ALTER TABLE partners ADD COLUMN ai_cards_used INTEGER DEFAULT 0');
      }
      if (!hasPromoCode) {
        console.log('📝 Adding promo_code column to partners table...');
        sqlite.exec('ALTER TABLE partners ADD COLUMN promo_code TEXT');
      }
    } catch (e) {
      console.warn('⚠️  Could not add columns to partners:', e);
    }
    
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

/**
 * Initialize PostgreSQL tables - creates missing tables
 */
async function initializePostgresTables() {
  try {
    // Create orders table if not exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        partner_id VARCHAR(255) NOT NULL,
        order_number VARCHAR(255) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        subtotal DECIMAL(12,2) DEFAULT 0,
        shipping_cost DECIMAL(12,2) DEFAULT 0,
        tax DECIMAL(12,2) DEFAULT 0,
        total_amount DECIMAL(12,2) DEFAULT 0,
        shipping_address JSONB,
        shipping_method VARCHAR(100),
        warehouse_id VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Orders table ready');

    // Create order_items table if not exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(255) PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL,
        product_id VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(12,2) NOT NULL,
        discount DECIMAL(12,2) DEFAULT 0,
        tax DECIMAL(12,2) DEFAULT 0,
        total_price DECIMAL(12,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Order items table ready');

    // Create monthly_sales_tracking table if not exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS monthly_sales_tracking (
        id VARCHAR(255) PRIMARY KEY,
        partner_id VARCHAR(255) NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        total_sales DECIMAL(12,2) DEFAULT 0,
        total_orders INTEGER DEFAULT 0,
        commission_earned DECIMAL(12,2) DEFAULT 0,
        revenue_share_paid DECIMAL(12,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(partner_id, month, year)
      )
    `);
    console.log('✅ Monthly sales tracking table ready');

    // Create profit_breakdown table if not exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS profit_breakdown (
        id VARCHAR(255) PRIMARY KEY,
        partner_id VARCHAR(255) NOT NULL,
        order_id VARCHAR(255),
        revenue DECIMAL(12,2) NOT NULL,
        costs DECIMAL(12,2) NOT NULL,
        platform_fee DECIMAL(12,2) NOT NULL,
        marketplace_fee DECIMAL(12,2) DEFAULT 0,
        shipping_cost DECIMAL(12,2) DEFAULT 0,
        tax DECIMAL(12,2) DEFAULT 0,
        net_profit DECIMAL(12,2) NOT NULL,
        profit_margin DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Profit breakdown table ready');

    // Create stock_movements table if not exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        movement_type VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        previous_stock INTEGER DEFAULT 0,
        new_stock INTEGER DEFAULT 0,
        reason VARCHAR(255),
        reference_type VARCHAR(100),
        reference_id VARCHAR(255),
        performed_by VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Stock movements table ready');

    // Create warehouses table if not exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS warehouses (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(500),
        city VARCHAR(100),
        region VARCHAR(100),
        country VARCHAR(100) DEFAULT 'Uzbekistan',
        postal_code VARCHAR(20),
        capacity DECIMAL(12,2) DEFAULT 0,
        current_utilization DECIMAL(12,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        manager_id VARCHAR(255),
        contact_phone VARCHAR(50),
        operating_hours JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Warehouses table ready');

    // Create warehouse_stock table if not exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS warehouse_stock (
        id VARCHAR(255) PRIMARY KEY,
        warehouse_id VARCHAR(255) NOT NULL,
        product_id VARCHAR(255) NOT NULL,
        quantity INTEGER DEFAULT 0,
        reserved_quantity INTEGER DEFAULT 0,
        available_quantity INTEGER DEFAULT 0,
        last_movement TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(warehouse_id, product_id)
      )
    `);
    console.log('✅ Warehouse stock table ready');

    // Create audit_logs table for PostgreSQL (TIMESTAMP instead of INTEGER)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(255) NOT NULL,
        entity_id VARCHAR(255),
        changes TEXT,
        payload TEXT,
        ip_address VARCHAR(255),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Audit logs table ready');

    // Create admin_permissions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS admin_permissions (
        user_id VARCHAR(255) PRIMARY KEY,
        can_manage_admins BOOLEAN DEFAULT FALSE,
        can_manage_content BOOLEAN DEFAULT FALSE,
        can_manage_chat BOOLEAN DEFAULT FALSE,
        can_view_reports BOOLEAN DEFAULT FALSE,
        can_receive_products BOOLEAN DEFAULT FALSE,
        can_activate_partners BOOLEAN DEFAULT FALSE,
        can_manage_integrations BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Admin permissions table ready');

    console.log('✅ PostgreSQL migrations completed successfully');
    
  } catch (error: any) {
    console.error('❌ PostgreSQL migration error:', error.message);
    // Don't throw - some tables might already exist with different structure
  }
}
