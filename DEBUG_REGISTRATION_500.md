# Debug Registration 500 Error

## Problem
Partner registration returning 500 Internal Server Error on production (sellercloudx.com)

## Possible Causes

### 1. Database Schema Mismatch
Production database may not have the new `anydesk_id` and `anydesk_password` columns.

**Solution:**
```bash
# SSH into production server
ssh user@sellercloudx.com

# Run migration
cd /path/to/app
sqlite3 production.db < migrations/add_anydesk_fields.sql
```

### 2. Missing nanoid Import
The `createPartner` function uses `nanoid()` but it might not be imported in storage.ts

**Check:**
```typescript
// server/storage.ts
import { nanoid } from 'nanoid'; // Must be present
```

### 3. Database Connection Issues
Production database might be locked or have permission issues.

**Check:**
```bash
# Check database file permissions
ls -la *.db

# Should be writable by the app user
chmod 664 production.db
```

### 4. Missing Environment Variables
Session secret or database path might be misconfigured.

**Check .env:**
```
DATABASE_URL=./production.db
SESSION_SECRET=your-secret-here
NODE_ENV=production
```

### 5. Referrals Table Issue
The referral code handling might fail if referrals table doesn't exist.

**Check:**
```sql
-- Verify referrals table exists
.tables

-- Check schema
.schema referrals
```

## Immediate Fixes

### Fix 1: Add Migration Check
```typescript
// server/index.ts - Add at startup
import fs from 'fs';

// Check if database has required columns
const checkDatabase = async () => {
  try {
    const result = await db.select().from(partners).limit(1);
    console.log('✅ Database connection OK');
  } catch (error) {
    console.error('❌ Database error:', error);
    process.exit(1);
  }
};

await checkDatabase();
```

### Fix 2: Safer Partner Creation
```typescript
// server/storage.ts
export async function createPartner(partnerData: {
  userId: string;
  businessName?: string;
  businessCategory: string;
  monthlyRevenue?: string;
  pricingTier?: string;
  phone: string;
  notes?: string;
}): Promise<Partner> {
  try {
    console.log('Creating partner with data:', partnerData);
    
    const partnerId = nanoid();
    console.log('Generated partner ID:', partnerId);
    
    const [partner] = await db.insert(partners).values({
      id: partnerId,
      userId: partnerData.userId,
      businessName: partnerData.businessName || 'Yangi Biznes',
      businessCategory: partnerData.businessCategory as any,
      monthlyRevenue: partnerData.monthlyRevenue,
      pricingTier: partnerData.pricingTier || 'starter_pro',
      phone: partnerData.phone,
      approved: false,
      createdAt: new Date(),
      notes: partnerData.notes,
      // Don't include anydesk fields if they don't exist
      // anydeskId: null,
      // anydeskPassword: null
    }).returning();
    
    console.log('Partner created successfully:', partner.id);
    return partner;
  } catch (error: any) {
    console.error('❌ Create partner error:', error);
    console.error('Error stack:', error.stack);
    throw new StorageError(`Hamkor yaratishda xatolik: ${error.message}`, 'CREATE_PARTNER_ERROR');
  }
}
```

### Fix 3: Catch Registration Errors Better
```typescript
// server/routes.ts
app.post("/api/partners/register", asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('[REGISTRATION] Starting registration...');
    console.log('[REGISTRATION] Request body:', JSON.stringify(req.body, null, 2));
    
    // ... rest of code ...
    
  } catch (error) {
    console.error('[REGISTRATION] FATAL ERROR:', error);
    console.error('[REGISTRATION] Error type:', error.constructor.name);
    console.error('[REGISTRATION] Error message:', error.message);
    console.error('[REGISTRATION] Error stack:', error.stack);
    
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Ma'lumotlar noto'g'ri",
        code: "VALIDATION_ERROR",
        errors: error.errors
      });
    }
    
    // Return detailed error in development
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({
        message: "Ro'yxatdan o'tishda xatolik",
        code: "REGISTRATION_ERROR",
        error: error.message,
        stack: error.stack
      });
    }
    
    // Generic error in production
    return res.status(500).json({
      message: "Ro'yxatdan o'tishda xatolik. Iltimos, qaytadan urinib ko'ring.",
      code: "REGISTRATION_ERROR"
    });
  }
}));
```

## How to Debug on Production

### Step 1: Check Server Logs
```bash
# If using PM2
pm2 logs sellercloudx

# If using systemd
journalctl -u sellercloudx -f

# If using Docker
docker logs -f container_name
```

### Step 2: Test Database Directly
```bash
# Connect to production database
sqlite3 production.db

# Test insert
INSERT INTO partners (
  id, user_id, business_name, business_category, 
  phone, approved, pricing_tier, created_at
) VALUES (
  'test_123', 'user_123', 'Test Business', 'general',
  '+998901234567', 0, 'starter_pro', unixepoch()
);

# If this fails, check the error
```

### Step 3: Check Database Schema
```bash
sqlite3 production.db ".schema partners"

# Should include:
# anydesk_id TEXT
# anydesk_password TEXT
```

### Step 4: Verify nanoid is Installed
```bash
cd /path/to/app
npm list nanoid

# Should show: nanoid@x.x.x
```

## Quick Fix for Production

If you need to fix immediately without downtime:

### Option 1: Rollback AnyDesk Changes
```sql
-- Remove anydesk columns if they're causing issues
ALTER TABLE partners DROP COLUMN anydesk_id;
ALTER TABLE partners DROP COLUMN anydesk_password;
```

Then redeploy previous version without anydesk fields.

### Option 2: Add Columns Manually
```sql
-- Add missing columns
ALTER TABLE partners ADD COLUMN anydesk_id TEXT;
ALTER TABLE partners ADD COLUMN anydesk_password TEXT;
```

### Option 3: Use Default Values
```typescript
// Modify createPartner to not include anydesk fields
const [partner] = await db.insert(partners).values({
  id: nanoid(),
  userId: partnerData.userId,
  businessName: partnerData.businessName || 'Yangi Biznes',
  businessCategory: partnerData.businessCategory as any,
  monthlyRevenue: partnerData.monthlyRevenue,
  pricingTier: partnerData.pricingTier || 'starter_pro',
  phone: partnerData.phone,
  approved: false,
  createdAt: new Date(),
  notes: partnerData.notes
  // Remove anydesk fields temporarily
}).returning();
```

## Testing Locally

```bash
# Start local server with logging
NODE_ENV=development npm run dev

# Try registration
curl -X POST http://localhost:5000/api/partners/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+998901234567",
    "businessName": "Test Business",
    "businessCategory": "general"
  }'

# Check console for [REGISTRATION] logs
```

## Prevention

1. **Always test migrations locally first**
2. **Use database migration tools** (like Drizzle Kit)
3. **Add health check endpoint** that verifies database schema
4. **Use staging environment** before production
5. **Add database backup** before schema changes

## Next Steps

1. Check production server logs immediately
2. Verify database schema matches code
3. Run missing migrations
4. Test registration again
5. Monitor for other errors
