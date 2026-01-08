-- Add promo_code and ai_cards_used columns to partners table
ALTER TABLE partners ADD COLUMN IF NOT EXISTS promo_code TEXT UNIQUE;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS ai_cards_used INTEGER DEFAULT 0;

-- Create referrals table if not exists
CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    referrer_partner_id TEXT NOT NULL,
    referred_partner_id TEXT NOT NULL,
    promo_code TEXT,
    contract_type TEXT NOT NULL,
    status TEXT DEFAULT 'invited',
    bonus_earned NUMERIC DEFAULT 0,
    bonus_paid NUMERIC DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    activated_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- Create marketplace_integrations table if not exists
CREATE TABLE IF NOT EXISTS marketplace_integrations (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL,
    marketplace TEXT NOT NULL,
    api_key TEXT,
    api_secret TEXT,
    active BOOLEAN DEFAULT false,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
