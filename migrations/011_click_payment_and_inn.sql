-- Migration: Add Click Payment and Business Verification fields to partners table
-- Date: 2024-12-28

-- Business verification fields
ALTER TABLE partners ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'yatt';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS inn TEXT UNIQUE;

-- Click Payment fields  
ALTER TABLE partners ADD COLUMN IF NOT EXISTS pending_payment_id TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS pending_payment_tier TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS pending_payment_amount INTEGER;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS pending_payment_billing_period TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS pending_payment_created_at INTEGER;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS last_payment_id TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS last_payment_amount INTEGER;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS last_payment_date INTEGER;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS last_payment_status TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS click_transaction_id TEXT;
