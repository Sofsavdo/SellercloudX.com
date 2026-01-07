-- Railway Database Fix Migration
-- Run this SQL in Railway PostgreSQL console or add to deployment script
-- This migration is idempotent (safe to run multiple times)

-- ==================== CRITICAL FIXES ====================

-- 1. Add ai_cards_used column to partners (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partners' AND column_name = 'ai_cards_used'
  ) THEN
    ALTER TABLE partners ADD COLUMN ai_cards_used INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Added ai_cards_used column to partners';
  END IF;
END $$;

-- 2. Add ai_cards_limit column to partners (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partners' AND column_name = 'ai_cards_limit'
  ) THEN
    ALTER TABLE partners ADD COLUMN ai_cards_limit INTEGER DEFAULT 50;
    RAISE NOTICE '✅ Added ai_cards_limit column to partners';
  END IF;
END $$;

-- 3. Add low_stock_threshold column to products (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER DEFAULT 10;
    RAISE NOTICE '✅ Added low_stock_threshold column to products';
  END IF;
END $$;

-- 4. Add ip_address and user_agent columns to audit_logs (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN ip_address TEXT;
    RAISE NOTICE '✅ Added ip_address column to audit_logs';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN user_agent TEXT;
    RAISE NOTICE '✅ Added user_agent column to audit_logs';
  END IF;
END $$;

-- 5. Add metric_type column to analytics (if missing)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'analytics' AND column_name = 'metric_type'
    ) THEN
      ALTER TABLE analytics ADD COLUMN metric_type TEXT DEFAULT 'revenue';
      RAISE NOTICE '✅ Added metric_type column to analytics';
    END IF;
  END IF;
END $$;

-- ==================== CREATE MISSING TABLES ====================

-- 6. Create wallet_transactions table
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

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_partner ON wallet_transactions(partner_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);

-- 7. Create payment_history table
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

CREATE INDEX IF NOT EXISTS idx_payment_history_partner ON payment_history(partner_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

-- 8. Create impersonation_logs table
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

CREATE INDEX IF NOT EXISTS idx_impersonation_logs_admin ON impersonation_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_partner ON impersonation_logs(partner_id);

-- 9. Create business_metrics table
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

CREATE INDEX IF NOT EXISTS idx_business_metrics_date ON business_metrics(metric_date);

-- 10. Add referral_code column to partners (if missing)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partners' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE partners ADD COLUMN referral_code TEXT;
    RAISE NOTICE '✅ Added referral_code column to partners';
  END IF;
END $$;

-- ==================== VERIFICATION ====================

-- Display all columns in partners table for verification
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'partners' 
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ ALL RAILWAY MIGRATIONS COMPLETED!';
  RAISE NOTICE '============================================';
END $$;
