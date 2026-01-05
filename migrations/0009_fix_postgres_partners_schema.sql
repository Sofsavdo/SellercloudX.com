-- Fix PostgreSQL partners schema to match application expectations

-- 1) Add missing columns used by the app (safe for repeated runs)
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "business_address" varchar(500);
--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "phone" varchar(50);
--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "website" varchar(255);
--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "inn" varchar(50);
--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "monthly_fee" integer;
--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "profit_share_percent" integer;
--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "warehouse_space_kg" integer;
--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "ai_enabled" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "anydesk_id" varchar(100);
--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "anydesk_password" varchar(100);
--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "last_activity_at" timestamp;
--> statement-breakpoint

-- 2) Add 'approved' column expected by the app (legacy schema used 'is_approved')
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "approved" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
UPDATE "partners"
SET "approved" = true
WHERE COALESCE("is_approved", false) = true;
--> statement-breakpoint

-- 3) Make enum-based columns compatible with app values (e.g. 'free_starter', 'general')
-- Convert pricing_tier enum -> varchar
ALTER TABLE "partners"
  ALTER COLUMN "pricing_tier" TYPE varchar(50)
  USING "pricing_tier"::text;
--> statement-breakpoint

-- Convert business_category enum -> varchar and allow null
ALTER TABLE "partners"
  ALTER COLUMN "business_category" TYPE varchar(100)
  USING "business_category"::text;
--> statement-breakpoint
ALTER TABLE "partners"
  ALTER COLUMN "business_category" DROP NOT NULL;
--> statement-breakpoint

-- Convert monthly_revenue numeric -> varchar for frontend compatibility
ALTER TABLE "partners"
  ALTER COLUMN "monthly_revenue" TYPE varchar(50)
  USING "monthly_revenue"::text;
--> statement-breakpoint
