const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, enum: ['food', 'accessories', 'shelter', 'bodycare', 'wastemanagement'] },
    petType: [{ type: String, trim: true }],
    images: [{ type: String }],
    stock: { type: Number, default: 0, min: 0 },
    isVerifiedSeller: { type: Boolean, default: false },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);