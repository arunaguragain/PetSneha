const Pet = require('../models/pet.model');

/**
 * Creates a pet document.
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document>}
 */
async function create(payload) {
  return Pet.create(payload);
}

/**
 * Finds pets by owner ID.
 * @param {string} ownerId
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findByOwnerId(ownerId) {
  return Pet.find({ ownerId }).sort('-createdAt');
}

/**
 * Finds all pets.
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findAll() {
  return Pet.find().sort('-createdAt');
}

/**
 * Finds a pet by ID.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findById(id) {
  return Pet.findById(id);
}

/**
 * Updates a pet by ID.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function updateById(id, payload) {
  return Pet.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
}

/**
 * Deletes a pet by ID.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function deleteById(id) {
  return Pet.findByIdAndDelete(id);
}

/**
 * Deletes all pets for an owner.
 * @param {string} ownerId
 * @returns {Promise<import('mongoose').DeleteResult|import('mongoose').UpdateResult|unknown>}
 */
async function deleteManyByOwnerId(ownerId) {
  return Pet.deleteMany({ ownerId });
}

module.exports = { create, findByOwnerId, findAll, findById, updateById, deleteById, deleteManyByOwnerId };