const cron = require('node-cron');
const FollowUp = require('../models/FollowUp.model');
const { sendFollowUpReminder } = require('./emailService');

function startScheduler() {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running daily follow-up check...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdue = await FollowUp.find({
        dueDate: { $lte: new Date() },
        status: 'pending'
      }).populate('patientId', 'name village');

      // Mark as overdue in DB
      await FollowUp.updateMany(
        { dueDate: { $lte: today }, status: 'pending' },
        { $set: { status: 'overdue' } }
      );

      if (overdue.length > 0) {
        await sendFollowUpReminder(overdue);
      }
    } catch (err) {
      console.error('Scheduler error:', err.message);
    }
  });

  console.log('✅ Follow-up scheduler started (runs daily at 8AM)');
}

module.exports = { startScheduler };
