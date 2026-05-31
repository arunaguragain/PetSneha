const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isVet: { type: Boolean, default: false },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const forumPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isAnonymous: { type: Boolean, default: false },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    group: { type: String, enum: ['all', 'dogs', 'cats', 'newOwners', 'emergency'], default: 'all' },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    answers: [answerSchema],
    isReported: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ForumPost', forumPostSchema);