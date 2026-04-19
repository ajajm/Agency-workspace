const mongoose = require('mongoose');

const PunchLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    punchIn: { type: Date, required: true },
    punchOut: { type: Date },
    autoPunchOut: { type: Boolean, default: false } // True if the system auto-detected lack of activity
}, { timestamps: true });

module.exports = mongoose.model('PunchLog', PunchLogSchema);
