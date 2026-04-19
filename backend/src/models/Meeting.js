const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slots: [{
        time: { type: Date, required: true },
        votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
    finalTime: { type: Date }, // Set by admin/founder later
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Specific participants, or empty for all
}, { timestamps: true });

module.exports = mongoose.model('Meeting', MeetingSchema);
