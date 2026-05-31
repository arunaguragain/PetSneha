const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['vaccination', 'checkup', 'deworming', 'custom'], default: 'custom' },
    dueDate: { type: Date, required: true },
    leadTimeDays: { type: Number, default: 3 },
    notifyVia: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isTriggered: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', reminderSchema);