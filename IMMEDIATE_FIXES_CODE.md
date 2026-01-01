# 🔧 Immediate Fixes - Code Changes

**Priority:** CRITICAL  
**Estimated Time:** 2-4 hours  
**Impact:** Unblocks registration and fixes tier mismatch

---

## 1. DELETE OLD PRICING CONFIG FILES

```bash
# Delete these files immediately
rm /workspaces/SellercloudX.com/CORRECT_PRICING_STRUCTURE.ts
rm /workspaces/SellercloudX.com/NEW_PRICING_CONFIG.ts
```

---

## 2. FIX PARTNER DASHBOARD TIER NAMES

**File:** `/client/src/pages/PartnerDashboard.tsx`

**Find (around line 180):**
```typescript
const getTierName = (tier: string) => {
  const tierNames = {
    starter_pro: 'Starter Pro',
    business_standard: 'Business Standard',
    professional_plus: 'Professional Plus',
    enterprise_elite: 'Enterprise Elite'
  };
  return tierNames[tier as keyof typeof tierNames] || tier;
};
```

**Replace with:**
```typescript
import { SAAS_PRICING_TIERS } from '../../../SAAS_PRICING_CONFIG';

const getTierName = (tier: string) => {
  const tierConfig = SAAS_PRICING_TIERS[tier as keyof typeof SAAS_PRICING_TIERS];
  return tierConfig ? tierConfig.name : tier;
};
```

**Also find (around line 35):**
```typescript
import { AI_MANAGER_PLANS } from '../../../SAAS_PRICING_CONFIG';
```

**Replace with:**
```typescript
import { SAAS_PRICING_TIERS, AI_MANAGER_PLANS } from '../../../SAAS_PRICING_CONFIG';
```

**Find (around line 200):**
```typescript
const tierKey = partner.pricingTier || 'starter_pro';
```

**Replace with:**
```typescript
const tierKey = partner.pricingTier || 'starter';
```

---

## 3. FIX TIER ACCESS HOOK

**File:** `/client/src/hooks/useTierAccess.ts`

**Find (line 5):**
```typescript
export interface TierAccess {
  tier: 'starter_pro' | 'business_standard' | 'professional_plus' | 'enterprise_elite';
  hasProfitDashboard: boolean;
  hasTrendHunter: boolean;
  canViewFullAnalytics: boolean;
  canAccessPremiumFeatures: boolean;
}
```

**Replace with:**
```typescript
export interface TierAccess {
  tier: 'free_starter' | 'basic' | 'starter' | 'professional';
  hasProfitDashboard: boolean;
  hasTrendHunter: boolean;
  canViewFullAnalytics: boolean;
  canAccessPremiumFeatures: boolean;
}
```

**Find (line 20):**
```typescript
const currentTier = (partner as any)?.pricingTier || 'starter_pro';

const access: TierAccess = {
  tier: currentTier,
  hasProfitDashboard: ['business_standard', 'professional_plus', 'enterprise_elite'].includes(currentTier),
  hasTrendHunter: ['professional_plus', 'enterprise_elite'].includes(currentTier),
  canViewFullAnalytics: ['business_standard', 'professional_plus', 'enterprise_elite'].includes(currentTier),
  canAccessPremiumFeatures: ['enterprise_elite'].includes(currentTier),
};
```

**Replace with:**
```typescript
const currentTier = (partner as any)?.pricingTier || 'free_starter';

const access: TierAccess = {
  tier: currentTier,
  hasProfitDashboard: ['basic', 'starter', 'professional'].includes(currentTier),
  hasTrendHunter: ['starter', 'professional'].includes(currentTier),
  canViewFullAnalytics: ['starter', 'professional'].includes(currentTier),
  canAccessPremiumFeatures: ['professional'].includes(currentTier),
};
```

**Find (line 35):**
```typescript
export function getTierName(tier: string): string {
  const tierNames: Record<string, string> = {
    starter_pro: 'Starter Pro',
    business_standard: 'Business Standard',
    professional_plus: 'Professional Plus',
    enterprise_elite: 'Enterprise Elite',
  };
  return tierNames[tier] || tier;
}
```

**Replace with:**
```typescript
import { SAAS_PRICING_TIERS } from '../../../SAAS_PRICING_CONFIG';

export function getTierName(tier: string): string {
  const tierConfig = SAAS_PRICING_TIERS[tier as keyof typeof SAAS_PRICING_TIERS];
  return tierConfig ? tierConfig.name : tier;
}
```

**Find (line 45):**
```typescript
export function getRequiredTierForFeature(feature: 'profit' | 'trends'): string {
  if (feature === 'profit') return 'business_standard';
  if (feature === 'trends') return 'professional_plus';
  return 'starter_pro';
}
```

**Replace with:**
```typescript
export function getRequiredTierForFeature(feature: 'profit' | 'trends'): string {
  if (feature === 'profit') return 'basic';
  if (feature === 'trends') return 'starter';
  return 'free_starter';
}
```

---

## 4. FIX ADMIN PARTNERS MANAGEMENT

**File:** `/client/src/components/AdminPartnersManagement.tsx`

**Find (around line 45):**
```typescript
const TIER_NAMES: Record<string, string> = {
  starter_pro: 'Starter Pro',
  business_standard: 'Business Standard',
  professional_plus: 'Professional Plus',
  enterprise_elite: 'Enterprise Elite'
};
```

**Replace with:**
```typescript
import { SAAS_PRICING_TIERS } from '../../../SAAS_PRICING_CONFIG';

const TIER_NAMES: Record<string, string> = {
  free_starter: 'Free Starter',
  basic: 'Basic',
  starter: 'Starter',
  professional: 'Professional'
};
```

---

## 5. FIX LANDING PAGE TIER REFERENCES

**File:** `/client/src/pages/LandingNew.tsx`

**Find (around line 300):**
```typescript
const tierData = [
  { 
    name: 'Free Starter', 
    price: '0', 
    // ... hardcoded data
  },
  // ... more hardcoded tiers
];
```

**Replace with:**
```typescript
import { SAAS_PRICING_TIERS } from '../../../SAAS_PRICING_CONFIG';

// Use config instead of hardcoded data
const tierData = Object.entries(SAAS_PRICING_TIERS).map(([key, tier]) => ({
  id: key,
  name: tier.name,
  price: tier.monthlyFeeUSD.toString(),
  currency: '$',
  commission: `${tier.commissionRate * 100}%`,
  sku: tier.limits.sku === -1 ? '∞' : tier.limits.sku.toString(),
  salesLimit: tier.limits.monthlySalesLimit === -1 ? '♾️ Cheksiz' : `${tier.limits.monthlySalesLimit / 1000000} mln`,
  features: tier.features,
  excluded: tier.excluded || [],
  popular: tier.popular,
  description: tier.description,
  badge: tier.badge
}));
```

---

## 6. ADD TIER SELECTION TO REGISTRATION

**File:** `/client/src/pages/PartnerRegistration.tsx`

**Find (around line 20):**
```typescript
const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  username: '',
  password: '',
  businessName: '',
  agreeToTerms: false,
  referralCode: ''
});
```

**Replace with:**
```typescript
import { SAAS_PRICING_TIERS } from '../../../SAAS_PRICING_CONFIG';

const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  username: '',
  password: '',
  businessName: '',
  agreeToTerms: false,
  referralCode: '',
  pricingTier: 'free_starter' // Add tier selection
});
```

**Add tier selection UI (after line 150):**
```typescript
{/* Tier Selection */}
<div className="space-y-4">
  <h3 className="font-bold text-lg flex items-center gap-2">
    <Crown className="w-5 h-5 text-blue-600" />
    Tarif Tanlang
  </h3>
  
  <div className="grid md:grid-cols-2 gap-4">
    {Object.entries(SAAS_PRICING_TIERS).map(([key, tier]) => (
      <Card 
        key={key}
        className={`cursor-pointer transition-all ${
          formData.pricingTier === key 
            ? 'border-2 border-blue-500 shadow-lg' 
            : 'border hover:border-blue-300'
        }`}
        onClick={() => setFormData({...formData, pricingTier: key})}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold">{tier.name}</h4>
            {tier.popular && (
              <Badge className="bg-blue-600">Mashhur</Badge>
            )}
          </div>
          <div className="text-2xl font-black mb-2">
            {tier.monthlyFeeUSD === 0 ? 'BEPUL' : `$${tier.monthlyFeeUSD}/oy`}
          </div>
          <div className="text-sm text-gray-600">
            + {tier.commissionRate * 100}% savdodan
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
</div>
```

**Update registration mutation (around line 50):**
```typescript
body: JSON.stringify({
  ...data,
  businessCategory: 'general',
  monthlyRevenue: '0',
  notes: '',
  pricingTier: data.pricingTier || 'free_starter' // Include tier
}),
```

---

## 7. UPDATE BACKEND PARTNER CREATION

**File:** `/server/routes.ts` (or wherever partner registration is handled)

**Find partner creation code:**
```typescript
const partner = await storage.createPartner({
  userId: user.id,
  businessName,
  businessCategory: 'general',
  monthlyRevenue: '0',
  phone
});
```

**Replace with:**
```typescript
const partner = await storage.createPartner({
  userId: user.id,
  businessName,
  businessCategory: 'general',
  monthlyRevenue: '0',
  phone,
  pricingTier: req.body.pricingTier || 'free_starter' // Add tier
});
```

---

## 8. CREATE DATABASE MIGRATION

**Create file:** `/migrations/001_add_subscription_tables.sql`

```sql
-- Subscription Payments Table
CREATE TABLE IF NOT EXISTS subscription_payments (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  tier TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  provider TEXT,
  transaction_id TEXT,
  period_start INTEGER,
  period_end INTEGER,
  paid_at INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (partner_id) REFERENCES partners(id)
);

-- Billing Invoices Table
CREATE TABLE IF NOT EXISTS billing_invoices (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  amount REAL NOT NULL,
  due_date INTEGER NOT NULL,
  paid_date INTEGER,
  status TEXT DEFAULT 'pending',
  items TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (partner_id) REFERENCES partners(id)
);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  amount REAL NOT NULL,
  provider TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  transaction_id TEXT,
  metadata TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (partner_id) REFERENCES partners(id)
);

-- Partner Subscriptions Table
CREATE TABLE IF NOT EXISTS partner_subscriptions (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  tier TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  start_date INTEGER NOT NULL,
  end_date INTEGER,
  auto_renew INTEGER DEFAULT 1,
  cancelled_at INTEGER,
  next_billing_date INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (partner_id) REFERENCES partners(id)
);

-- Commission Records Table
CREATE TABLE IF NOT EXISTS commission_records (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  order_id TEXT,
  revenue REAL NOT NULL,
  commission_rate REAL NOT NULL,
  commission_amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  calculated_at INTEGER NOT NULL,
  paid_at INTEGER,
  FOREIGN KEY (partner_id) REFERENCES partners(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_payments_partner ON subscription_payments(partner_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_partner ON billing_invoices(partner_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_partner ON payment_transactions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_partner ON partner_subscriptions(partner_id);
CREATE INDEX IF NOT EXISTS idx_commission_records_partner ON commission_records(partner_id);
```

**Run migration:**
```bash
# Add to package.json scripts:
"migrate": "node -e \"const fs = require('fs'); const db = require('./server/db').db; const sql = fs.readFileSync('./migrations/001_add_subscription_tables.sql', 'utf8'); db.exec(sql); console.log('Migration complete');\""

# Then run:
npm run migrate
```

---

## 9. UPDATE SCHEMA FILE

**File:** `/shared/schema.ts`

**Add after existing tables (around line 600):**
```typescript
// ==================== SUBSCRIPTION & BILLING ====================

export const subscriptionPayments = sqliteTable('subscription_payments', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  tier: text('tier').notNull(),
  amount: real('amount').notNull(),
  currency: text('currency').default('USD'),
  status: text('status').default('pending'),
  provider: text('provider'),
  transactionId: text('transaction_id'),
  periodStart: integer('period_start', { mode: 'timestamp' }),
  periodEnd: integer('period_end', { mode: 'timestamp' }),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const billingInvoices = sqliteTable('billing_invoices', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  invoiceNumber: text('invoice_number').unique().notNull(),
  amount: real('amount').notNull(),
  dueDate: integer('due_date', { mode: 'timestamp' }).notNull(),
  paidDate: integer('paid_date', { mode: 'timestamp' }),
  status: text('status').default('pending'),
  items: text('items'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const paymentTransactions = sqliteTable('payment_transactions', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  amount: real('amount').notNull(),
  provider: text('provider').notNull(),
  status: text('status').default('pending'),
  transactionId: text('transaction_id'),
  metadata: text('metadata'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const partnerSubscriptions = sqliteTable('partner_subscriptions', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  tier: text('tier').notNull(),
  status: text('status').default('active'),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }),
  autoRenew: integer('auto_renew', { mode: 'boolean' }).default(true),
  cancelledAt: integer('cancelled_at', { mode: 'timestamp' }),
  nextBillingDate: integer('next_billing_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const commissionRecords = sqliteTable('commission_records', {
  id: text('id').primaryKey(),
  partnerId: text('partner_id').notNull().references(() => partners.id),
  orderId: text('order_id').references(() => orders.id),
  revenue: real('revenue').notNull(),
  commissionRate: real('commission_rate').notNull(),
  commissionAmount: real('commission_amount').notNull(),
  status: text('status').default('pending'),
  calculatedAt: integer('calculated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
});

// Type exports
export type SubscriptionPayment = typeof subscriptionPayments.$inferSelect;
export type BillingInvoice = typeof billingInvoices.$inferSelect;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type PartnerSubscription = typeof partnerSubscriptions.$inferSelect;
export type CommissionRecord = typeof commissionRecords.$inferSelect;
```

---

## 10. VERIFICATION SCRIPT

**Create file:** `/scripts/verify-fixes.sh`

```bash
#!/bin/bash

echo "🔍 Verifying fixes..."

# Check if old config files are deleted
if [ -f "CORRECT_PRICING_STRUCTURE.ts" ]; then
  echo "❌ CORRECT_PRICING_STRUCTURE.ts still exists"
  exit 1
else
  echo "✅ CORRECT_PRICING_STRUCTURE.ts deleted"
fi

if [ -f "NEW_PRICING_CONFIG.ts" ]; then
  echo "❌ NEW_PRICING_CONFIG.ts still exists"
  exit 1
else
  echo "✅ NEW_PRICING_CONFIG.ts deleted"
fi

# Check for old tier names in code
OLD_TIERS=$(grep -r "starter_pro\|business_standard\|professional_plus\|enterprise_elite" client/src/ | grep -v node_modules | wc -l)
if [ $OLD_TIERS -gt 0 ]; then
  echo "⚠️  Found $OLD_TIERS references to old tier names"
  grep -r "starter_pro\|business_standard\|professional_plus\|enterprise_elite" client/src/ | grep -v node_modules
else
  echo "✅ No old tier names found"
fi

# Check if new tables exist
sqlite3 data.db "SELECT name FROM sqlite_master WHERE type='table' AND name='subscription_payments';" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ subscription_payments table exists"
else
  echo "❌ subscription_payments table missing"
fi

echo ""
echo "✅ Verification complete!"
```

**Make executable and run:**
```bash
chmod +x scripts/verify-fixes.sh
./scripts/verify-fixes.sh
```

---

## 11. TESTING CHECKLIST

After applying all fixes, test:

### Registration Flow:
```bash
# 1. Visit landing page
# 2. Click "Ro'yxatdan o'tish"
# 3. Select a tier (should see tier selection)
# 4. Fill form
# 5. Submit
# 6. Check database:
sqlite3 data.db "SELECT username, pricingTier FROM partners ORDER BY createdAt DESC LIMIT 1;"
# Should show correct tier (free_starter, basic, starter, or professional)
```

### Tier Display:
```bash
# 1. Login as partner
# 2. Check dashboard header
# Should show correct tier name from SAAS_PRICING_CONFIG
```

### Database Tables:
```bash
# Check if all tables exist
sqlite3 data.db ".tables" | grep -E "subscription_payments|billing_invoices|payment_transactions|partner_subscriptions|commission_records"
# Should show all 5 tables
```

---

## 12. ROLLBACK PLAN

If something breaks:

```bash
# 1. Restore old config files (if you backed them up)
git checkout CORRECT_PRICING_STRUCTURE.ts
git checkout NEW_PRICING_CONFIG.ts

# 2. Revert code changes
git diff HEAD > changes.patch
git checkout .
# Review changes.patch and apply selectively

# 3. Drop new tables if needed
sqlite3 data.db "DROP TABLE IF EXISTS subscription_payments;"
sqlite3 data.db "DROP TABLE IF EXISTS billing_invoices;"
sqlite3 data.db "DROP TABLE IF EXISTS payment_transactions;"
sqlite3 data.db "DROP TABLE IF EXISTS partner_subscriptions;"
sqlite3 data.db "DROP TABLE IF EXISTS commission_records;"
```

---

## 📊 EXPECTED RESULTS

After applying all fixes:

✅ **Pricing Consistency:**
- All code uses SAAS_PRICING_CONFIG
- Tier names match everywhere
- No conflicting configs

✅ **Registration:**
- Users can select tier
- Tier is saved to database
- Correct tier displayed in dashboard

✅ **Database:**
- All 5 new tables created
- Indexes created for performance
- Ready for payment integration

✅ **Code Quality:**
- No old tier references
- No legacy config files
- Clean imports

---

## ⏱️ TIME ESTIMATE

- Delete old files: 1 minute
- Update PartnerDashboard: 10 minutes
- Update useTierAccess: 10 minutes
- Update AdminPartnersManagement: 5 minutes
- Update LandingNew: 15 minutes
- Update PartnerRegistration: 20 minutes
- Update backend: 10 minutes
- Create migration: 15 minutes
- Update schema: 15 minutes
- Testing: 30 minutes

**Total: ~2 hours**

---

## 🚀 NEXT STEPS

After these fixes:

1. **Test thoroughly** - Verify all flows work
2. **Payment integration** - Implement Click/Payme
3. **Referral fixes** - Fix bonus calculation
4. **Automated billing** - Implement cron jobs

---

**Last Updated:** December 19, 2024  
**Status:** Ready to apply  
**Priority:** CRITICAL
