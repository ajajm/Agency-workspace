// Placeholder for Notification System

const sendNotification = async (userId, title, message) => {
    // In production, integrate Firebase Cloud Messaging (FCM) or Nodemailer
    console.log(`[Notification Simulated] To User: ${userId} | Title: ${title} | Message: ${message}`);
};

const sendToRole = async (role, title, message) => {
    console.log(`[Notification Simulated] To Role: ${role} | Title: ${title} | Message: ${message}`);
};

module.exports = {
    sendNotification,
    sendToRole
};
