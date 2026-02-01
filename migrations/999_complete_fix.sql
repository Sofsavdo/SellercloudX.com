-- Complete migration for all missing columns
-- This migration is safe to run multiple times (uses IF NOT EXISTS)

-- 1. Add low_stock_threshold to products
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER DEFAULT 10;
    RAISE NOTICE 'Added low_stock_threshold column to products';
  END IF;
END $$;

-- 2. Add ip_address and user_agent to audit_logs
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN ip_address TEXT;
    RAISE NOTICE 'Added ip_address column to audit_logs';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN user_agent TEXT;
    RAISE NOTICE 'Added user_agent column to audit_logs';
  END IF;
END $$;

-- 3. Fix invalid dates in partners
UPDATE partners 
SET created_at = NOW()::TEXT 
WHERE created_at IS NULL OR created_at = '' OR created_at = 'Invalid Date';

UPDATE partners
SET last_activity_at = NOW()::TEXT
WHERE last_activity_at IS NULL OR last_activity_at = '' OR last_activity_at = 'Invalid Date';

-- 4. Add metric_type to analytics if exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'analytics' AND column_name = 'metric_type'
    ) THEN
      ALTER TABLE analytics ADD COLUMN metric_type TEXT DEFAULT 'revenue';
      RAISE NOTICE 'Added metric_type column to analytics';
    END IF;
  END IF;
END $$;

-- 5. Create wallet_transactions if not exists
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'commission', 'withdrawal')),
  amount TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed')),
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()::TEXT,
  updated_at TEXT DEFAULT NOW()::TEXT
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_partner ON wallet_transactions(partner_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);

-- 6. Create payment_history if not exists
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
  created_at TEXT NOT NULL DEFAULT NOW()::TEXT,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_payment_history_partner ON payment_history(partner_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

-- 7. Create impersonation_logs if not exists
CREATE TABLE IF NOT EXISTS impersonation_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('start', 'end')),
  ip_address TEXT,
  user_agent TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT NOW()::TEXT
);

CREATE INDEX IF NOT EXISTS idx_impersonation_logs_admin ON impersonation_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_partner ON impersonation_logs(partner_id);

-- 8. Add referral_code to partners
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partners' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE partners ADD COLUMN referral_code TEXT;
    RAISE NOTICE 'Added referral_code column to partners';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_partners_referral_code ON partners(referral_code);

-- 9. Create admin_permissions if not exists
CREATE TABLE IF NOT EXISTS admin_permissions (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  permission_key TEXT NOT NULL,
  permission_value BOOLEAN DEFAULT TRUE,
  created_at TEXT NOT NULL DEFAULT NOW()::TEXT,
  updated_at TEXT DEFAULT NOW()::TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_permissions_admin ON admin_permissions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_key ON admin_permissions(permission_key);

-- 10. Create business_metrics if not exists
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
  created_at TEXT NOT NULL DEFAULT NOW()::TEXT
);

CREATE INDEX IF NOT EXISTS idx_business_metrics_date ON business_metrics(metric_date);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All migrations completed successfully!';
END $$;
