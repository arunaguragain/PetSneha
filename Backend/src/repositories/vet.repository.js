const Vet = require('../models/vet.model');

/**
 * Creates a vet document.
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document>}
 */
async function create(payload) {
  return Vet.create(payload);
}

/**
 * Finds vet records with optional filters.
 * @param {object} filter
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findAll(filter = {}) {
  return Vet.find(filter).sort('-createdAt');
}

/**
 * Finds a vet by ID.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findById(id) {
  return Vet.findById(id).populate('reviews.authorId', 'name profilePhoto');
}

/**
 * Finds a vet by the related user ID.
 * @param {string} userId
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findByUserId(userId) {
  return Vet.findOne({ userId });
}

/**
 * Updates a vet by ID.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function updateById(id, payload) {
  return Vet.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
}

/**
 * Deletes a vet by ID.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function deleteById(id) {
  return Vet.findByIdAndDelete(id);
}

module.exports = { create, findAll, findById, findByUserId, updateById, deleteById };