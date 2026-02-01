-- Migration: Add missing columns to partners table
-- Run this to fix "ai_cards_used" and other missing column errors

-- Add ai_cards_used column if not exists
ALTER TABLE partners ADD COLUMN ai_cards_used INTEGER DEFAULT 0;

-- Add promo_code column if not exists  
ALTER TABLE partners ADD COLUMN promo_code TEXT UNIQUE;

-- Add anydesk columns if not exists
ALTER TABLE partners ADD COLUMN anydesk_id TEXT;
ALTER TABLE partners ADD COLUMN anydesk_password TEXT;

-- Create ai_generated_products table if not exists
CREATE TABLE IF NOT EXISTS ai_generated_products (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL,
    marketplace_type TEXT NOT NULL,
    raw_product_name TEXT,
    raw_description TEXT,
    raw_category TEXT,
    raw_price REAL,
    raw_images TEXT,
    ai_title TEXT,
    ai_description TEXT,
    ai_short_description TEXT,
    ai_keywords TEXT,
    ai_category_suggestions TEXT,
    ai_tags TEXT,
    seo_score INTEGER,
    seo_issues TEXT,
    seo_suggestions TEXT,
    suggested_price REAL,
    price_rationale TEXT,
    marketplace_specific_data TEXT,
    ai_confidence_score INTEGER,
    status TEXT DEFAULT 'draft',
    infographic_url TEXT,
    video_url TEXT,
    error_message TEXT,
    created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
    updated_at INTEGER DEFAULT (unixepoch()),
    published_at INTEGER,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);

-- Create marketplace_products table if not exists
CREATE TABLE IF NOT EXISTS marketplace_products (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL,
    marketplace_type TEXT NOT NULL,
    external_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL,
    status TEXT DEFAULT 'pending',
    last_price_update INTEGER,
    created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);

-- Create ai_actions_log table if not exists
CREATE TABLE IF NOT EXISTS ai_actions_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_id TEXT,
    marketplace_type TEXT,
    action_type TEXT NOT NULL,
    action_description TEXT,
    before_state TEXT,
    after_state TEXT,
    impact_level TEXT,
    estimated_impact TEXT,
    ai_reasoning TEXT,
    confidence_level INTEGER,
    was_successful INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch()) NOT NULL
);
