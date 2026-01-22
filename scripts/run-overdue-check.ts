#!/usr/bin/env node
// Manual Overdue Check Runner
// Usage: tsx scripts/run-overdue-check.ts

import runOverdueCheck from '../server/cron/overdueCheck';

async function main() {
  try {
    await runOverdueCheck();
    console.log('✅ Overdue check completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Overdue check failed:', error);
    process.exit(1);
  }
}

main();
