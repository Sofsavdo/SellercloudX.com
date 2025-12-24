# Billing System Testing Guide

## Overview
This guide covers testing the complete billing and commission management system.

## Prerequisites
- Server running on port 5000
- Admin account credentials
- Partner account credentials
- Email service configured (optional for email testing)

## Test Scenarios

### 1. Invoice Creation

**Test Monthly Billing Cron Job:**
```bash
# Run manually
cd /workspaces/SellercloudX.com
tsx server/cron/monthlyBilling.ts
```

**Expected Results:**
- ✅ New invoices created for all active partners
- ✅ Subscriptions extended by 1 month
- ✅ Sales limits reset
- ✅ Email notifications sent (if configured)

**Verify:**
```bash
# Check database
sqlite3 data.db "SELECT * FROM invoices ORDER BY createdAt DESC LIMIT 5;"
```

### 2. Overdue Invoice Processing

**Test Overdue Check Cron Job:**
```bash
# Run manually
tsx server/cron/overdueCheck.ts
```

**Expected Results:**
- ✅ Overdue invoices identified
- ✅ Email notifications sent
- ✅ Subscriptions suspended after 5 days
- ✅ Suspension emails sent

**Verify:**
```bash
# Check subscriptions
sqlite3 data.db "SELECT id, status, updatedAt FROM subscriptions WHERE status='suspended';"
```

### 3. Manual Payment Recording

**Test Admin Payment Form:**
1. Login as admin
2. Navigate to `/admin/billing`
3. Click "Record Payment"
4. Fill form:
   - Select partner
   - Select invoice (optional)
   - Enter amount
   - Select payment method
   - Add notes
5. Submit

**Expected Results:**
- ✅ Payment record created
- ✅ Invoice marked as paid
- ✅ Subscription reactivated (if suspended)
- ✅ Payment confirmation email sent

**API Test:**
```bash
curl -X POST http://localhost:5000/api/billing/admin/payments/manual \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{
    "partnerId": "partner_id_here",
    "invoiceId": "invoice_id_here",
    "amount": 99.00,
    "paymentMethod": "bank_transfer",
    "notes": "Test payment"
  }'
```

### 4. Billing Dashboard

**Test Admin Dashboard:**
1. Login as admin
2. Navigate to `/admin/billing`
3. Check tabs:
   - **Invoices Tab:**
     - View all invoices
     - Filter by status
     - Search by partner
     - Export to CSV
   - **Payments Tab:**
     - View all payments
     - Filter by date
     - View payment details
   - **Commissions Tab:**
     - View commission records
     - Partner breakdown
     - Monthly totals

**API Tests:**
```bash
# Get all invoices
curl http://localhost:5000/api/billing/admin/invoices \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"

# Get billing summary
curl http://localhost:5000/api/billing/admin/billing/summary \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"

# Export invoices
curl http://localhost:5000/api/billing/admin/invoices/export \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -o invoices.csv
```

### 5. Partner Billing View

**Test Partner Dashboard:**
1. Login as partner
2. Navigate to `/partner/billing`
3. Check sections:
   - Current subscription status
   - Pending invoices
   - Payment history
   - Commission earnings

**API Tests:**
```bash
# Get partner invoices
curl http://localhost:5000/api/billing/partner/invoices \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"

# Get partner billing summary
curl http://localhost:5000/api/billing/partner/billing/summary \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"

# Get partner commissions
curl http://localhost:5000/api/billing/partner/commissions \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

### 6. Email Notifications

**Test Email Service:**
```bash
# Test invoice created email
tsx -e "
import emailService from './server/services/emailService';
await emailService.sendInvoiceCreated(
  'test@example.com',
  'Test Partner',
  'INV-001',
  99.00,
  new Date(Date.now() + 5*24*60*60*1000).toISOString()
);
"

# Test payment received email
tsx -e "
import emailService from './server/services/emailService';
await emailService.sendPaymentReceived(
  'test@example.com',
  'Test Partner',
  'INV-001',
  99.00,
  'bank_transfer'
);
"

# Test overdue email
tsx -e "
import emailService from './server/services/emailService';
await emailService.sendInvoiceOverdue(
  'test@example.com',
  'Test Partner',
  'INV-001',
  99.00,
  3
);
"

# Test suspension email
tsx -e "
import emailService from './server/services/emailService';
await emailService.sendSubscriptionSuspended(
  'test@example.com',
  'Test Partner',
  'Payment overdue for 5 days'
);
"
```

### 7. Commission Calculation

**Test Commission Recording:**
```bash
# Create a sale and verify commission
curl -X POST http://localhost:5000/api/sales \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{
    "amount": 1000.00,
    "marketplace": "uzum"
  }'

# Check commission record
sqlite3 data.db "SELECT * FROM commissionRecords ORDER BY createdAt DESC LIMIT 1;"
```

**Expected Results:**
- ✅ Commission calculated based on tier
- ✅ Commission record created
- ✅ Partner notified (if configured)

### 8. Subscription Management

**Test Subscription Lifecycle:**

1. **Create Subscription:**
```bash
curl -X POST http://localhost:5000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{
    "tierId": "professional"
  }'
```

2. **Upgrade Subscription:**
```bash
curl -X PUT http://localhost:5000/api/subscriptions/upgrade \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{
    "newTierId": "enterprise"
  }'
```

3. **Check Subscription Status:**
```bash
curl http://localhost:5000/api/subscriptions/current \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

## Automated Testing

**Run All Tests:**
```bash
npm test
```

**Test Specific Module:**
```bash
npm test -- billing
```

## Performance Testing

**Load Test Invoice Creation:**
```bash
# Create 100 test invoices
for i in {1..100}; do
  curl -X POST http://localhost:5000/api/billing/admin/invoices/test \
    -H "Content-Type: application/json" \
    -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" &
done
wait
```

**Monitor Performance:**
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5000/api/billing/admin/invoices
```

## Troubleshooting

### Common Issues

**1. Emails Not Sending:**
- Check SMTP configuration in `.env`
- Verify SMTP credentials
- Check email service logs

**2. Cron Jobs Not Running:**
- Check server logs
- Verify timezone settings
- Test manual execution

**3. Payment Not Recording:**
- Check database connection
- Verify partner/invoice IDs
- Check API response errors

**4. Commission Not Calculated:**
- Verify tier configuration
- Check sales limit
- Review commission rate

## Monitoring

**Check System Health:**
```bash
# View server logs
pm2 logs sellercloudx

# Check cron job status
pm2 list

# Monitor database
sqlite3 data.db "SELECT COUNT(*) FROM invoices WHERE status='pending';"
```

**Key Metrics to Monitor:**
- Total revenue (monthly)
- Pending invoices count
- Overdue invoices count
- Commission payouts
- Subscription status distribution
- Email delivery rate

## Success Criteria

✅ All invoices created automatically on 1st of month
✅ Overdue checks run daily at 09:00
✅ Manual payments recorded correctly
✅ Email notifications sent successfully
✅ Commissions calculated accurately
✅ Subscriptions managed properly
✅ Dashboard displays correct data
✅ CSV export works
✅ API endpoints respond correctly
✅ No errors in logs

## Next Steps

After successful testing:
1. Deploy to production
2. Set up monitoring alerts
3. Configure backup schedule
4. Document operational procedures
5. Train admin users
