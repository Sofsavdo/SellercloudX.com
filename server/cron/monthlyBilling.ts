#!/usr/bin/env node
// Monthly Billing Cron Job
// Schedule: 0 0 1 * * (Every 1st of month at 00:00)

import billingService from '../services/billingService';

async function runMonthlyBilling() {
  console.log('🔄 Starting monthly billing process...');
  console.log(`📅 Date: ${new Date().toISOString()}`);

  try {
    await billingService.processMonthlyBilling();
    console.log('✅ Monthly billing completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Monthly billing failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runMonthlyBilling();
}

export default runMonthlyBilling;
