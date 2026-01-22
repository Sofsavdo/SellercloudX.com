#!/usr/bin/env node
// Manual Monthly Billing Runner
// Usage: tsx scripts/run-monthly-billing.ts

import runMonthlyBilling from '../server/cron/monthlyBilling';

async function main() {
  try {
    await runMonthlyBilling();
    console.log('✅ Monthly billing completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Monthly billing failed:', error);
    process.exit(1);
  }
}

main();
