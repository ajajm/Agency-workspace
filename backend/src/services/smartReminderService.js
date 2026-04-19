const cron = require('node-cron');
const PunchLog = require('../models/PunchLog');
const { sendNotification } = require('./notificationService');

const initCronJobs = () => {
    // Job to run every hour to check for long punches
    cron.schedule('0 * * * *', async () => {
        try {
            const twelveHoursAgo = new Date();
            twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

            const activePunches = await PunchLog.find({ 
                punchOut: { $exists: false },
                punchIn: { $lte: twelveHoursAgo }
            });

            for (let punch of activePunches) {
                // Send a nudging reminder before auto-closing
                await sendNotification(punch.userId, "Long Session Detected", "You've been punched in for over 12 hours. Auto-punching out. Don't forget to report your tasks!");
                
                punch.punchOut = new Date();
                punch.autoPunchOut = true;
                await punch.save();
            }
        } catch (err) {
            console.error("Cron Job Error (Inactive Punches):", err);
        }
    });

    console.log("Background Smart Reminders initialized.");
};

module.exports = { initCronJobs };
