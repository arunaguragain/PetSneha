const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    summary: { type: String },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vet', required: true },
    petType: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    season: { type: String, enum: ['all', 'monsoon', 'winter', 'summer'], default: 'all' },
    isVerified: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    readTime: { type: Number },
    imageUrl: { type: String, trim: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Article', articleSchema);