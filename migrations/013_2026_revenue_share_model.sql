-- Migration: 2026 Revenue Share Pricing Model
-- Adds new columns for revenue share, blocking, and trial management

-- Add new columns to partners table for 2026 pricing model
ALTER TABLE partners ADD COLUMN IF NOT EXISTS tariff_type TEXT DEFAULT 'trial';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS setup_paid INTEGER DEFAULT 0;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS setup_fee_usd INTEGER DEFAULT 699;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS monthly_fee_usd INTEGER DEFAULT 499;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS revenue_share_percent REAL DEFAULT 0.04;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS total_debt_uzs INTEGER DEFAULT 0;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS last_debt_calculated_at INTEGER;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS blocked_until INTEGER;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS block_reason TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS trial_start_date INTEGER;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS trial_end_date INTEGER;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS guarantee_start_date INTEGER;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS sales_before_us INTEGER DEFAULT 0;

-- Monthly Sales Tracking table
CREATE TABLE IF NOT EXISTS monthly_sales_tracking (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL REFERENCES partners(id),
  month INTEGER NOT NULL,
  marketplace TEXT NOT NULL,
  total_sales_uzs INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  revenue_share_uzs INTEGER DEFAULT 0,
  monthly_fee_uzs INTEGER DEFAULT 0,
  total_debt_uzs INTEGER DEFAULT 0,
  is_paid INTEGER DEFAULT 0,
  paid_at INTEGER,
  paid_amount INTEGER,
  payment_method TEXT,
  last_sync_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER
);

-- Revenue Share Payments table
CREATE TABLE IF NOT EXISTS revenue_share_payments (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL REFERENCES partners(id),
  monthly_tracking_id TEXT REFERENCES monthly_sales_tracking(id),
  amount_uzs INTEGER NOT NULL,
  payment_type TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  confirmed_by TEXT REFERENCES users(id),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  completed_at INTEGER
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_monthly_sales_partner ON monthly_sales_tracking(partner_id);
CREATE INDEX IF NOT EXISTS idx_monthly_sales_month ON monthly_sales_tracking(month);
CREATE INDEX IF NOT EXISTS idx_revenue_payments_partner ON revenue_share_payments(partner_id);
CREATE INDEX IF NOT EXISTS idx_partners_tariff ON partners(tariff_type);
CREATE INDEX IF NOT EXISTS idx_partners_blocked ON partners(blocked_until);
