const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    compiledTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkLog' }],
    todosForNextDay: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Todo' }],
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
