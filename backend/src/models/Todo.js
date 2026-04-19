const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    notes: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Specific user
    assignedRole: { type: String }, // Or assigned to all users of a specific role
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    deadline: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Todo', TodoSchema);
