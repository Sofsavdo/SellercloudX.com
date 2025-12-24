#!/usr/bin/env node
// Overdue Invoices Check Cron Job
// Schedule: 0 9 * * * (Every day at 09:00)

import billingService from '../services/billingService';

async function runOverdueCheck() {
  console.log('🔄 Starting overdue invoices check...');
  console.log(`📅 Date: ${new Date().toISOString()}`);

  try {
    await billingService.processOverdueInvoices();
    console.log('✅ Overdue check completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Overdue check failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runOverdueCheck();
}

export default runOverdueCheck;
