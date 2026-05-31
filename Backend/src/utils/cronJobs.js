const cron = require('node-cron');
const reminderService = require('../services/reminder.service');

let reminderJob;

/**
 * Starts the daily reminder check in Nepal time.
 * @returns {void}
 */
function startCronJobs() {
  if (reminderJob) {
    return;
  }

  reminderJob = cron.schedule(
    '0 8 * * *',
    async () => {
      await reminderService.processDueReminders();
    },
    { timezone: 'Asia/Kathmandu' }
  );
}

module.exports = { startCronJobs };