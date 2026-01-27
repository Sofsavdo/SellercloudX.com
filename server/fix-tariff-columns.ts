// Quick fix for tariff_type column missing in PostgreSQL
import { Pool } from 'pg';

async function addTariffColumns() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl || !databaseUrl.startsWith('postgres')) {
    console.log('Not PostgreSQL, skipping...');
    return;
  }
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔧 Adding tariff columns to partners table...');
    
    // Add columns one by one with error handling
    const columns = [
      { name: 'tariff_type', sql: "ALTER TABLE partners ADD COLUMN IF NOT EXISTS tariff_type TEXT DEFAULT 'trial'" },
      { name: 'setup_paid', sql: "ALTER TABLE partners ADD COLUMN IF NOT EXISTS setup_paid INTEGER DEFAULT 0" },
      { name: 'setup_fee_usd', sql: "ALTER TABLE partners ADD COLUMN IF NOT EXISTS setup_fee_usd INTEGER DEFAULT 699" },
      { name: 'monthly_fee_usd', sql: "ALTER TABLE partners ADD COLUMN IF NOT EXISTS monthly_fee_usd INTEGER DEFAULT 499" },
      { name: 'revenue_share_percent', sql: "ALTER TABLE partners ADD COLUMN IF NOT EXISTS revenue_share_percent REAL DEFAULT 0.04" },
      { name: 'total_debt_uzs', sql: "ALTER TABLE partners ADD COLUMN IF NOT EXISTS total_debt_uzs INTEGER DEFAULT 0" },
      { name: 'last_debt_calculated_at', sql: "ALTER TABLE partners ADD COLUMN IF NOT EXISTS last_debt_calculated_at INTEGER" },
      { name: 'blocked_until', sql: "ALTER TABLE partners ADD COLUMN IF NOT EXISTS blocked_until INTEGER" },
      { name: 'block_reason', sql: "ALTER TABLE partners ADD COLUMN IF NOT EXISTS block_reason TEXT" },
      { name: 'trial_start_date', sql: "ALTER TABLE partners ADD COLUMN IF NOT EXISTS trial_start_date INTEGER" },
      { name: 'trial_end_date', sql: "ALTER TABLE partners ADD COLUMN IF NOT EXISTS trial_end_date INTEGER" },
      { name: 'guarantee_start_date', sql: "ALTER TABLE partners ADD COLUMN IF NOT EXISTS guarantee_start_date INTEGER" },
      { name: 'sales_before_us', sql: "ALTER TABLE partners ADD COLUMN IF NOT EXISTS sales_before_us INTEGER DEFAULT 0" },
    ];
    
    for (const col of columns) {
      try {
        await pool.query(col.sql);
        console.log(`✅ Column ${col.name} added/verified`);
      } catch (error: any) {
        if (error.code === '42701') {
          // Column already exists - ignore
          console.log(`ℹ️ Column ${col.name} already exists`);
        } else {
          console.error(`❌ Error adding ${col.name}:`, error.message);
        }
      }
    }
    
    console.log('✅ All tariff columns migration completed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

addTariffColumns();
