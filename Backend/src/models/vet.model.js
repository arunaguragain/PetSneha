const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

const vetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, trim: true, required: true },
    specialisation: { type: String, trim: true },
    clinicName: { type: String, trim: true },
    location: { type: String, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    yearsExperience: { type: Number, default: 0 },
    consultationFee: { type: Number, required: true },
    availability: {
      days: [{ type: String, trim: true }],
      openTime: { type: String },
      closeTime: { type: String },
      is24Hours: { type: Boolean, default: false },
    },
    isVerified: { type: Boolean, default: false },
    isOpenNow: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    bio: { type: String },
    profilePhoto: { type: String },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vet', vetSchema);