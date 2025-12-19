# 🔧 AnyDesk Columns Migration Guide

## Muammo

Database'da `anydesk_id` va `anydesk_password` kolonlari yo'q, lekin kod ularni ishlatmoqchi.

```
❌ SqliteError: table partners has no column named anydesk_id
```

## Yechim

Database'ga yangi kolonlar qo'shish kerak.

---

## Production Migration

### Option 1: Automatic Migration (Recommended)

Server'da quyidagi migration avtomatik ishga tushadi:

**File:** `server/migrate.ts`

```typescript
// Add anydesk columns if missing
const tableInfo = db.prepare("PRAGMA table_info(partners)").all();
const hasAnydeskId = tableInfo.some(col => col.name === 'anydesk_id');

if (!hasAnydeskId) {
  db.prepare('ALTER TABLE partners ADD COLUMN anydesk_id TEXT').run();
  db.prepare('ALTER TABLE partners ADD COLUMN anydesk_password TEXT').run();
  console.log('✅ Added anydesk columns');
}
```

### Option 2: Manual Migration

Agar avtomatik migration ishlamasa, qo'lda qiling:

#### Railway/Render Dashboard

1. **Database Console'ga kiring**
2. **SQL Query'ni ishga tushiring:**

```sql
-- Check if columns exist
PRAGMA table_info(partners);

-- Add columns if missing
ALTER TABLE partners ADD COLUMN anydesk_id TEXT;
ALTER TABLE partners ADD COLUMN anydesk_password TEXT;

-- Verify
PRAGMA table_info(partners);
```

#### SSH orqali

```bash
# Connect to production server
ssh user@server

# Run migration
sqlite3 /path/to/data.db << EOF
ALTER TABLE partners ADD COLUMN anydesk_id TEXT;
ALTER TABLE partners ADD COLUMN anydesk_password TEXT;
EOF
```

---

## Local Development

### 1. Delete and Recreate Database

```bash
# Backup old database
cp data.db data.db.backup

# Delete database
rm data.db

# Restart server (will recreate with new schema)
npm run dev
```

### 2. Manual Migration

```bash
# Run migration script
npx tsx scripts/migrate-anydesk.ts
```

### 3. SQL Direct

```bash
sqlite3 data.db << EOF
ALTER TABLE partners ADD COLUMN anydesk_id TEXT;
ALTER TABLE partners ADD COLUMN anydesk_password TEXT;
EOF
```

---

## Verification

### Check Columns

```sql
PRAGMA table_info(partners);
```

**Expected Output:**
```
...
| anydesk_id       | TEXT | 0 | NULL | 0 |
| anydesk_password | TEXT | 0 | NULL | 0 |
```

### Test Query

```sql
SELECT id, business_name, anydesk_id FROM partners LIMIT 1;
```

Should not throw error.

---

## Automatic Migration Code

Add to `server/migrate.ts`:

```typescript
export async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  try {
    const db = new Database(dbPath);
    
    // Check and add anydesk columns
    const tableInfo = db.prepare("PRAGMA table_info(partners)").all() as any[];
    const hasAnydeskId = tableInfo.some((col: any) => col.name === 'anydesk_id');
    const hasAnydeskPassword = tableInfo.some((col: any) => col.name === 'anydesk_password');
    
    if (!hasAnydeskId) {
      console.log('📝 Adding anydesk_id column...');
      db.prepare('ALTER TABLE partners ADD COLUMN anydesk_id TEXT').run();
      console.log('✅ Added anydesk_id column');
    }
    
    if (!hasAnydeskPassword) {
      console.log('📝 Adding anydesk_password column...');
      db.prepare('ALTER TABLE partners ADD COLUMN anydesk_password TEXT').run();
      console.log('✅ Added anydesk_password column');
    }
    
    if (hasAnydeskId && hasAnydeskPassword) {
      console.log('✅ AnyDesk columns already exist');
    }
    
    db.close();
    console.log('✅ Migrations completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
```

---

## Rollback Plan

Agar muammo bo'lsa:

### 1. Remove Columns

```sql
-- SQLite doesn't support DROP COLUMN directly
-- Need to recreate table

-- Create new table without anydesk columns
CREATE TABLE partners_backup AS 
SELECT 
  id, user_id, business_name, business_category,
  monthly_revenue, phone, pricing_tier, ai_enabled,
  is_approved, notes, created_at, last_activity_at
FROM partners;

-- Drop old table
DROP TABLE partners;

-- Rename backup
ALTER TABLE partners_backup RENAME TO partners;
```

### 2. Restore from Backup

```bash
# If you have backup
cp data.db.backup data.db

# Restart server
pm2 restart sellercloudx
```

---

## Testing

### 1. Test Partner Creation

```bash
curl -X POST http://localhost:5000/api/partners/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+998901234567",
    "businessName": "Test Business"
  }'
```

Should succeed without `anydesk_id` error.

### 2. Test Partner Query

```bash
curl http://localhost:5000/api/partners/me \
  -H "Cookie: connect.sid=SESSION_ID"
```

Should return partner data without error.

---

## Production Deployment

### Before Deploy

1. ✅ Test migration locally
2. ✅ Backup production database
3. ✅ Test rollback procedure
4. ✅ Prepare monitoring

### Deploy Steps

1. **Backup Database**
   ```bash
   # On production server
   cp /path/to/data.db /path/to/data.db.backup.$(date +%Y%m%d)
   ```

2. **Deploy Code**
   ```bash
   git push origin main
   # Railway/Render will auto-deploy
   ```

3. **Run Migration**
   - Automatic: Server will run on startup
   - Manual: SSH and run SQL

4. **Verify**
   ```bash
   # Check logs
   tail -f /var/log/app.log
   
   # Test API
   curl https://api.sellercloudx.com/health
   ```

5. **Monitor**
   - Check error logs
   - Test partner creation
   - Test partner login

### If Issues

1. **Check Logs**
   ```bash
   # Railway
   railway logs
   
   # Render
   # View logs in dashboard
   ```

2. **Rollback**
   ```bash
   # Restore backup
   cp data.db.backup data.db
   
   # Restart
   pm2 restart sellercloudx
   ```

---

## Status Checklist

- [ ] Migration script created
- [ ] Tested locally
- [ ] Backup created
- [ ] Migration run on production
- [ ] Verified columns exist
- [ ] Tested partner creation
- [ ] Tested partner login
- [ ] No errors in logs
- [ ] Monitoring active

---

## Quick Fix for Production

**Immediate fix without downtime:**

```bash
# SSH to production
ssh user@production-server

# Run migration
sqlite3 /app/data.db << 'EOF'
ALTER TABLE partners ADD COLUMN anydesk_id TEXT;
ALTER TABLE partners ADD COLUMN anydesk_password TEXT;
EOF

# Verify
sqlite3 /app/data.db "PRAGMA table_info(partners);" | grep anydesk

# No restart needed - columns are now available
```

---

**Status:** ⚠️ Needs Migration  
**Priority:** 🔴 High (Blocking partner creation)  
**Impact:** Partners cannot be created/accessed  
**Solution:** Add missing columns to database
