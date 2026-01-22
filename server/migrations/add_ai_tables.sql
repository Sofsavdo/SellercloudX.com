-- AI Management Tables
-- AI usage tracking, error logging, configuration

-- AI Usage Logs
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  model TEXT NOT NULL,
  task_type TEXT,
  tokens INTEGER DEFAULT 0,
  cost REAL DEFAULT 0,
  latency INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT 1,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES partners(id)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_partner_date ON ai_usage_logs(partner_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_model ON ai_usage_logs(model);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage_logs(created_at);

-- AI Error Logs
CREATE TABLE IF NOT EXISTS ai_error_logs (
  id TEXT PRIMARY KEY,
  partner_id TEXT,
  error_type TEXT NOT NULL,
  error_message TEXT,
  model TEXT,
  task_type TEXT,
  status TEXT DEFAULT 'open', -- open, fixed, ignored
  fixed_at TIMESTAMP,
  fixed_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES partners(id)
);

CREATE INDEX IF NOT EXISTS idx_ai_errors_partner ON ai_error_logs(partner_id);
CREATE INDEX IF NOT EXISTS idx_ai_errors_status ON ai_error_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_errors_created ON ai_error_logs(created_at);

-- AI Configuration (add to partners table)
-- ALTER TABLE partners ADD COLUMN ai_settings TEXT DEFAULT '{}';

