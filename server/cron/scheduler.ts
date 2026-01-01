import cron from 'node-cron';
import monthlyBilling from './monthlyBilling';
import overdueCheck from './overdueCheck';

export function startCronJobs() {
  console.log('🚀 Starting cron jobs...');

  // Monthly billing - 1st of every month at 00:00
  cron.schedule('0 0 1 * *', async () => {
    console.log('⏰ Running monthly billing cron job');
    try {
      await monthlyBilling();
    } catch (error) {
      console.error('Monthly billing cron failed:', error);
    }
  }, {
    timezone: 'Asia/Tashkent'
  });

  // Overdue check - Every day at 09:00
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running overdue check cron job');
    try {
      await overdueCheck();
    } catch (error) {
      console.error('Overdue check cron failed:', error);
    }
  }, {
    timezone: 'Asia/Tashkent'
  });

  console.log('✅ Cron jobs started successfully');
  console.log('📅 Monthly billing: 1st of every month at 00:00 (Tashkent time)');
  console.log('📅 Overdue check: Every day at 09:00 (Tashkent time)');
}

export function stopCronJobs() {
  cron.getTasks().forEach(task => task.stop());
  console.log('🛑 All cron jobs stopped');
}
