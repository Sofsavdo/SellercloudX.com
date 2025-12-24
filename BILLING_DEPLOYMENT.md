# Billing System Deployment Guide

## Overview
Complete deployment guide for the billing and commission management system.

## Pre-Deployment Checklist

### 1. Environment Variables

Add to `.env` file:

```bash
# Email Configuration (Required for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@sellercloudx.com
APP_URL=https://yourdomain.com

# Database (Already configured)
DATABASE_URL=your_database_url

# Session (Already configured)
SESSION_SECRET=your_session_secret
```

### 2. Email Setup

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification
   - App passwords → Generate
3. Use generated password in `SMTP_PASS`

**Alternative SMTP Providers:**
- **SendGrid:** smtp.sendgrid.net:587
- **Mailgun:** smtp.mailgun.org:587
- **AWS SES:** email-smtp.region.amazonaws.com:587

### 3. Database Migration

Ensure all tables exist:

```bash
npm run db:push
```

Verify tables:
```bash
sqlite3 data.db "SELECT name FROM sqlite_master WHERE type='table';"
```

Required tables:
- ✅ partners
- ✅ subscriptions
- ✅ invoices
- ✅ payments
- ✅ commissionRecords
- ✅ salesLimits

### 4. Build Application

```bash
npm run build
```

Verify build:
```bash
ls -la dist/
ls -la dist/public/
```

## Deployment Options

### Option 1: PM2 (Recommended for Production)

**Install PM2:**
```bash
npm install -g pm2
```

**Create PM2 Ecosystem File:**

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'sellercloudx',
    script: 'dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M'
  }]
};
```

**Start Application:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Monitor:**
```bash
pm2 status
pm2 logs sellercloudx
pm2 monit
```

### Option 2: Docker

**Create Dockerfile** (already exists):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
COPY .env .env
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

**Build and Run:**
```bash
docker build -t sellercloudx .
docker run -d -p 5000:5000 --name sellercloudx sellercloudx
```

### Option 3: Railway

**Deploy to Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

**Configure Environment:**
- Add all environment variables in Railway dashboard
- Set `PORT` to Railway's provided port
- Configure custom domain

### Option 4: Render

**Deploy to Render:**
1. Connect GitHub repository
2. Create new Web Service
3. Configure:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Environment: Node
4. Add environment variables
5. Deploy

## Cron Job Setup

### Option 1: PM2 Cron (Recommended)

Cron jobs are automatically started with the application.

**Verify Cron Jobs:**
```bash
# Check logs
pm2 logs sellercloudx | grep "cron"

# Should see:
# ✅ Cron jobs started successfully
# 📅 Monthly billing: 1st of every month at 00:00
# 📅 Overdue check: Every day at 09:00
```

**Manual Testing:**
```bash
# Test monthly billing
tsx server/cron/monthlyBilling.ts

# Test overdue check
tsx server/cron/overdueCheck.ts
```

### Option 2: System Cron (Linux/Mac)

If you prefer system cron:

```bash
# Edit crontab
crontab -e

# Add jobs
0 0 1 * * cd /path/to/app && tsx server/cron/monthlyBilling.ts >> logs/cron.log 2>&1
0 9 * * * cd /path/to/app && tsx server/cron/overdueCheck.ts >> logs/cron.log 2>&1
```

### Option 3: Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (monthly/daily)
4. Action: Start a program
5. Program: `node`
6. Arguments: `server/cron/monthlyBilling.ts`
7. Start in: Application directory

## Post-Deployment Verification

### 1. Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Test API Endpoints

```bash
# Test billing endpoints
curl http://localhost:5000/api/billing/admin/invoices \
  -H "Cookie: connect.sid=YOUR_SESSION"

# Test cron scheduler
curl http://localhost:5000/api/health/cron
```

### 3. Verify Email Service

```bash
# Send test email
tsx -e "
import emailService from './server/services/emailService';
await emailService.sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<p>Test</p>'
});
"
```

### 4. Check Database

```bash
# Verify data
sqlite3 data.db "SELECT COUNT(*) FROM invoices;"
sqlite3 data.db "SELECT COUNT(*) FROM subscriptions WHERE status='active';"
```

### 5. Monitor Logs

```bash
# PM2 logs
pm2 logs sellercloudx --lines 100

# System logs
tail -f logs/error.log
tail -f logs/out.log
```

## Monitoring Setup

### 1. Application Monitoring

**PM2 Plus (Recommended):**
```bash
pm2 link YOUR_SECRET_KEY YOUR_PUBLIC_KEY
```

**Alternative: Sentry**
```bash
# Already configured if SENTRY_DSN is set
# Add to .env:
SENTRY_DSN=your_sentry_dsn
```

### 2. Database Monitoring

**Create monitoring script:**

`scripts/monitor-billing.sh`:
```bash
#!/bin/bash

echo "=== Billing System Status ==="
echo ""

echo "Pending Invoices:"
sqlite3 data.db "SELECT COUNT(*) FROM invoices WHERE status='pending';"

echo "Overdue Invoices:"
sqlite3 data.db "SELECT COUNT(*) FROM invoices WHERE status='pending' AND dueDate < datetime('now');"

echo "Active Subscriptions:"
sqlite3 data.db "SELECT COUNT(*) FROM subscriptions WHERE status='active';"

echo "Suspended Subscriptions:"
sqlite3 data.db "SELECT COUNT(*) FROM subscriptions WHERE status='suspended';"

echo "Today's Revenue:"
sqlite3 data.db "SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE status='paid' AND DATE(paidAt) = DATE('now');"
```

**Run daily:**
```bash
chmod +x scripts/monitor-billing.sh
crontab -e
# Add: 0 8 * * * /path/to/scripts/monitor-billing.sh | mail -s "Billing Report" admin@example.com
```

### 3. Email Monitoring

Track email delivery:
- Check SMTP logs
- Monitor bounce rates
- Verify delivery receipts

### 4. Cron Job Monitoring

**Create health check endpoint:**

Already implemented in `server/cron/scheduler.ts`

**Monitor execution:**
```bash
# Check last execution
grep "Running monthly billing" logs/out.log | tail -1
grep "Running overdue check" logs/out.log | tail -1
```

## Backup Strategy

### 1. Database Backup

**Automated backup script:**

`scripts/backup-db.sh`:
```bash
#!/bin/bash

BACKUP_DIR="/backups/sellercloudx"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="data.db"

mkdir -p $BACKUP_DIR
sqlite3 $DB_FILE ".backup '$BACKUP_DIR/backup_$DATE.db'"

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.db" -mtime +30 -delete

echo "Backup completed: backup_$DATE.db"
```

**Schedule:**
```bash
crontab -e
# Add: 0 2 * * * /path/to/scripts/backup-db.sh
```

### 2. Configuration Backup

```bash
# Backup .env and configs
tar -czf config_backup_$(date +%Y%m%d).tar.gz .env ecosystem.config.js
```

## Rollback Plan

### 1. Application Rollback

**PM2:**
```bash
# List deployments
pm2 list

# Rollback
pm2 reload ecosystem.config.js --update-env
```

**Git:**
```bash
git log --oneline
git checkout PREVIOUS_COMMIT
npm run build
pm2 restart sellercloudx
```

### 2. Database Rollback

```bash
# Restore from backup
cp /backups/sellercloudx/backup_YYYYMMDD_HHMMSS.db data.db
pm2 restart sellercloudx
```

## Troubleshooting

### Issue: Cron Jobs Not Running

**Check:**
```bash
pm2 logs sellercloudx | grep "cron"
```

**Solution:**
- Verify timezone in `server/cron/scheduler.ts`
- Check server time: `date`
- Test manual execution

### Issue: Emails Not Sending

**Check:**
```bash
pm2 logs sellercloudx | grep "email"
```

**Solution:**
- Verify SMTP credentials
- Check firewall rules (port 587)
- Test SMTP connection:
```bash
telnet smtp.gmail.com 587
```

### Issue: High Memory Usage

**Check:**
```bash
pm2 monit
```

**Solution:**
- Increase `max_memory_restart` in ecosystem.config.js
- Optimize database queries
- Add database indexes

### Issue: Database Locked

**Solution:**
```bash
# Check connections
lsof data.db

# Kill processes if needed
kill -9 PID

# Restart application
pm2 restart sellercloudx
```

## Security Checklist

- ✅ HTTPS enabled
- ✅ Environment variables secured
- ✅ Database access restricted
- ✅ SMTP credentials encrypted
- ✅ Rate limiting enabled
- ✅ CSRF protection enabled
- ✅ Session security configured
- ✅ File upload restrictions
- ✅ API authentication required
- ✅ Admin routes protected

## Performance Optimization

### 1. Database Indexes

```sql
CREATE INDEX idx_invoices_partner ON invoices(partnerId);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due ON invoices(dueDate);
CREATE INDEX idx_payments_partner ON payments(partnerId);
CREATE INDEX idx_subscriptions_partner ON subscriptions(partnerId);
```

### 2. Caching

Consider adding Redis for:
- Session storage
- API response caching
- Rate limiting

### 3. Load Balancing

For high traffic:
```javascript
// ecosystem.config.js
instances: 'max', // Use all CPU cores
exec_mode: 'cluster'
```

## Maintenance Schedule

**Daily:**
- Check logs for errors
- Monitor email delivery
- Verify cron job execution

**Weekly:**
- Review pending invoices
- Check overdue accounts
- Analyze revenue reports

**Monthly:**
- Database backup verification
- Performance review
- Security audit

## Support Contacts

**Technical Issues:**
- Email: support@sellercloudx.com
- Slack: #billing-support

**Emergency:**
- On-call: +998 XX XXX XXXX
- Escalation: admin@sellercloudx.com

## Success Metrics

Monitor these KPIs:
- Invoice creation success rate: >99%
- Email delivery rate: >95%
- Cron job execution: 100%
- API response time: <500ms
- System uptime: >99.9%

## Next Steps

1. ✅ Complete deployment
2. ✅ Verify all systems
3. ✅ Set up monitoring
4. ✅ Configure backups
5. ✅ Train admin users
6. ✅ Document procedures
7. ✅ Go live!
