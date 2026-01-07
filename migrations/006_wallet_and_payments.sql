-- Add wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL REFERENCES partners(id),
  type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'commission', 'withdrawal')),
  amount TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed')),
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_partner ON wallet_transactions(partner_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);

-- Add payment_history table
CREATE TABLE IF NOT EXISTS payment_history (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL REFERENCES partners(id),
  amount TEXT NOT NULL,
  currency TEXT DEFAULT 'UZS',
  payment_method TEXT CHECK(payment_method IN ('click', 'payme', 'uzcard', 'stripe', 'bank_transfer')),
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
  description TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_payment_history_partner ON payment_history(partner_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

-- Add impersonation_logs table
CREATE TABLE IF NOT EXISTS impersonation_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES users(id),
  partner_id TEXT NOT NULL REFERENCES partners(id),
  action TEXT NOT NULL CHECK(action IN ('start', 'end')),
  ip_address TEXT,
  user_agent TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_impersonation_logs_admin ON impersonation_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_partner ON impersonation_logs(partner_id);

-- Add referral_code column to partners if not exists
ALTER TABLE partners ADD COLUMN referral_code TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_partners_referral_code ON partners(referral_code);
