const mongoose = require('mongoose');

const onboardingChecklistSchema = new mongoose.Schema(
  {
    sleepingArea: { type: Boolean, default: false },
    food: { type: Boolean, default: false },
    vetVisit: { type: Boolean, default: false },
    groomingTools: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 8, select: false },
    role: { type: String, enum: ['petOwner', 'vet', 'admin'], default: 'petOwner' },
    googleId: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    profilePhoto: { type: String },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
    savedVetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vet' },
    language: { type: String, enum: ['en', 'ne'], default: 'en' },
    checklist: { type: onboardingChecklistSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);