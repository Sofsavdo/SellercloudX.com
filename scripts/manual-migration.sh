#!/bin/bash

# Railway Manual Migration Script
# Run this in Railway console if migrations don't auto-run

echo "🔄 Starting manual database migration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set!"
    exit 1
fi

echo "📦 Installing psql if needed..."
apt-get update -qq && apt-get install -y -qq postgresql-client > /dev/null 2>&1

echo "🗄️ Running migration..."
psql $DATABASE_URL << 'EOF'

-- Add low_stock_threshold to products
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER DEFAULT 10;
    RAISE NOTICE 'Added low_stock_threshold';
  ELSE
    RAISE NOTICE 'low_stock_threshold already exists';
  END IF;
END $$;

-- Add ip_address to audit_logs
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN ip_address TEXT;
    RAISE NOTICE 'Added ip_address';
  END IF;
END $$;

-- Add user_agent to audit_logs
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN user_agent TEXT;
    RAISE NOTICE 'Added user_agent';
  END IF;
END $$;

-- Fix invalid dates
UPDATE partners 
SET created_at = NOW()::TEXT 
WHERE created_at IS NULL OR created_at = '' OR created_at = 'Invalid Date';

RAISE NOTICE '✅ Migration complete!';
EOF

echo "✅ Migration completed successfully!"
echo "🔄 Please restart your Railway service"
