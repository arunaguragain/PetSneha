const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema(
  {
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    vetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vet' },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    type: { type: String, enum: ['vaccination', 'checkup', 'treatment', 'deworming', 'other', 'manual'], default: 'manual' },
    customType: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    date: { type: Date, required: true },
    nextDueDate: { type: Date },
    status: { type: String, enum: ['done', 'upcoming', 'overdue'], default: 'done' },
    attachments: [{ type: String }],
    addedBy: { type: String, enum: ['vet', 'owner'], default: 'owner' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HealthRecord', healthRecordSchema);