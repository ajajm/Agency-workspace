const mongoose = require('mongoose');

const WorkLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    task: { type: String, required: true },
    timeSpent: { type: Number }, // Time spent in minutes
    notes: { type: String },
    timestamp: { type: Date, default: Date.now },
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' } // Assigned to a report when compiled
}, { timestamps: true });

module.exports = mongoose.model('WorkLog', WorkLogSchema);
