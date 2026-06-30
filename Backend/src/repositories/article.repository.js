const Article = require('../models/article.model');

/**
 * Creates an article.
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document>}
 */
async function create(payload) {
  return Article.create(payload);
}

/**
 * Finds published articles with filters.
 * @param {object} filter
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findAllPublished(filter = {}) {
  const list = await Article.find({ ...filter, isPublished: true })
    .populate('authorId')
    .sort('-createdAt');
  return list.map((doc) => {
    if (!doc) return doc;
    const obj = doc.toObject();
    obj.author = obj.authorId;
    return obj;
  });
}

/**
 * Finds an article by ID.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findById(id) {
  const doc = await Article.findById(id).populate('authorId');
  if (!doc) return null;
  const obj = doc.toObject();
  obj.author = obj.authorId;
  return obj;
}

/**
 * Updates an article by ID.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function updateById(id, payload) {
  return Article.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
}

/**
 * Deletes an article by ID.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function deleteById(id) {
  return Article.findByIdAndDelete(id);
}

module.exports = { create, findAllPublished, findById, updateById, deleteById };