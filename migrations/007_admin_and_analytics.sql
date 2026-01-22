-- Add missing columns to audit_logs table
DO $$ 
BEGIN
  -- Add ip_address if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN ip_address TEXT;
  END IF;

  -- Add user_agent if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN user_agent TEXT;
  END IF;
END $$;

-- Create admin_permissions table if not exists
CREATE TABLE IF NOT EXISTS admin_permissions (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES users(id),
  permission_key TEXT NOT NULL,
  permission_value BOOLEAN DEFAULT TRUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_permissions_admin ON admin_permissions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_key ON admin_permissions(permission_key);

-- Create business_metrics table for analytics
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
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_business_metrics_date ON business_metrics(metric_date);
