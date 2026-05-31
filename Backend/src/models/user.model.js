const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['petOwner', 'vet', 'admin'], default: 'petOwner' },
    profilePhoto: { type: String },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
    savedVetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vet' },
    language: { type: String, enum: ['en', 'ne'], default: 'en' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);