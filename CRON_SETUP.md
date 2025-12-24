# 🕐 CRON JOBS SETUP GUIDE

## Cron Jobs Ro'yxati

### 1. Monthly Billing
**Fayl:** `server/cron/monthlyBilling.ts`  
**Schedule:** `0 0 1 * *` (Har oy 1-sanada 00:00)  
**Vazifa:** Oylik billing jarayoni

### 2. Overdue Check
**Fayl:** `server/cron/overdueCheck.ts`  
**Schedule:** `0 9 * * *` (Har kuni 09:00)  
**Vazifa:** Muddati o'tgan invoicelarni tekshirish

---

## Setup (Linux/Mac)

### 1. Crontab Ochish
```bash
crontab -e
```

### 2. Quyidagi Qatorlarni Qo'shing
```bash
# SellerCloudX Cron Jobs
0 0 1 * * cd /path/to/SellercloudX.com && node dist/cron/monthlyBilling.js >> /var/log/sellercloudx-billing.log 2>&1
0 9 * * * cd /path/to/SellercloudX.com && node dist/cron/overdueCheck.js >> /var/log/sellercloudx-overdue.log 2>&1
```

### 3. Path'ni O'zgartiring
`/path/to/SellercloudX.com` ni haqiqiy path bilan almashtiring:
```bash
pwd  # Hozirgi directory'ni ko'rish
```

---

## Setup (PM2 - Tavsiya)

### 1. PM2 O'rnatish
```bash
npm install -g pm2
```

### 2. Ecosystem File Yaratish
```bash
pm2 ecosystem
```

### 3. ecosystem.config.js
```javascript
module.exports = {
  apps: [
    {
      name: 'sellercloudx-server',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'monthly-billing',
      script: 'dist/cron/monthlyBilling.js',
      cron_restart: '0 0 1 * *',
      autorestart: false,
      watch: false,
    },
    {
      name: 'overdue-check',
      script: 'dist/cron/overdueCheck.js',
      cron_restart: '0 9 * * *',
      autorestart: false,
      watch: false,
    },
  ],
};
```

### 4. PM2 Boshlash
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Setup (Docker)

### Dockerfile'ga Qo'shing
```dockerfile
# Install cron
RUN apt-get update && apt-get install -y cron

# Copy cron file
COPY crontab /etc/cron.d/sellercloudx-cron
RUN chmod 0644 /etc/cron.d/sellercloudx-cron
RUN crontab /etc/cron.d/sellercloudx-cron

# Start cron
CMD cron && node dist/index.js
```

### crontab File
```
0 0 1 * * cd /app && node dist/cron/monthlyBilling.js >> /var/log/cron.log 2>&1
0 9 * * * cd /app && node dist/cron/overdueCheck.js >> /var/log/cron.log 2>&1
```

---

## Manual Testing

### Monthly Billing
```bash
npm run build
node dist/cron/monthlyBilling.js
```

### Overdue Check
```bash
npm run build
node dist/cron/overdueCheck.js
```

---

## Monitoring

### PM2 Logs
```bash
pm2 logs monthly-billing
pm2 logs overdue-check
```

### Cron Logs
```bash
tail -f /var/log/sellercloudx-billing.log
tail -f /var/log/sellercloudx-overdue.log
```

---

## Troubleshooting

### Cron Not Running
```bash
# Check cron service
sudo service cron status

# Restart cron
sudo service cron restart

# Check cron logs
grep CRON /var/log/syslog
```

### Permission Issues
```bash
# Make scripts executable
chmod +x dist/cron/*.js

# Check file ownership
ls -la dist/cron/
```

---

## Production Checklist

- [ ] Build project: `npm run build`
- [ ] Test cron jobs manually
- [ ] Setup crontab or PM2
- [ ] Configure log rotation
- [ ] Setup monitoring/alerts
- [ ] Test in staging first
- [ ] Document any custom setup

---

**Yaratildi:** Ona AI  
**Sana:** 24-Dekabr-2024
