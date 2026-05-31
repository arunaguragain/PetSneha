const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    petOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vet', required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    fee: { type: Number },
    notes: { type: String },
    confirmationEmailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);