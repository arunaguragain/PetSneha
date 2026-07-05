const ForumPost = require('../models/forumPost.model');

/**
 * Creates a forum post.
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document>}
 */
async function create(payload) {
  return ForumPost.create(payload);
}

/**
 * Finds forum posts with optional filters.
 * @param {object} filter
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findAll(filter = {}) {
  const list = await ForumPost.find(filter)
    .populate('authorId')
    .populate('answers.authorId')
    .sort('-isPinned -createdAt');

  return list.map((doc) => {
    if (!doc) return doc;

    const obj = doc.toObject();
    obj.author = obj.authorId;
    obj.answers = Array.isArray(obj.answers)
      ? obj.answers.map((answer) => ({
          ...answer,
          author: answer.authorId,
        }))
      : [];

    return obj;
  });
}

/**
 * Finds a forum post by ID.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findById(id) {
  const doc = await ForumPost.findById(id)
    .populate('authorId')
    .populate('answers.authorId');

  if (!doc) return null;

  const obj = doc.toObject();
  obj.author = obj.authorId;
  obj.answers = Array.isArray(obj.answers)
    ? obj.answers.map((answer) => ({
        ...answer,
        author: answer.authorId,
      }))
    : [];

  return obj;
}

/**
 * Updates a forum post by ID.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function updateById(id, payload) {
  return ForumPost.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
}

/**
 * Deletes a forum post by ID.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function deleteById(id) {
  return ForumPost.findByIdAndDelete(id);
}

module.exports = { create, findAll, findById, updateById, deleteById };