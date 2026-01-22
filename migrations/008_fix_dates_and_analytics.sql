-- Fix invalid dates in partners table
DO $$ 
BEGIN
  -- Update partners with NULL or invalid createdAt
  UPDATE partners 
  SET created_at = NOW() 
  WHERE created_at IS NULL OR created_at = '';

  -- Add created_at default if column exists without default
  ALTER TABLE partners 
  ALTER COLUMN created_at SET DEFAULT NOW();

  -- Update lastActivityAt if needed
  UPDATE partners
  SET last_activity_at = NOW()
  WHERE last_activity_at IS NULL;
END $$;

-- Fix analytics table - add missing columns
DO $$ 
BEGIN
  -- Add metric_type column to analytics if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'analytics' AND column_name = 'metric_type'
  ) THEN
    ALTER TABLE analytics ADD COLUMN metric_type TEXT DEFAULT 'revenue';
  END IF;
END $$;
