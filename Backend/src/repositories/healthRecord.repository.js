const HealthRecord = require('../models/healthRecord.model');

/**
 * Creates a health record.
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document>}
 */
async function create(payload) {
  return HealthRecord.create(payload);
}

/**
 * Finds records for a pet.
 * @param {string} petId
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findByPetId(petId) {
  return HealthRecord.find({ petId }).sort('-date');
}

/**
 * Finds a record by ID.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findById(id) {
  return HealthRecord.findById(id);
}

/**
 * Updates a health record.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function updateById(id, payload) {
  return HealthRecord.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
}

/**
 * Deletes a health record.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function deleteById(id) {
  return HealthRecord.findByIdAndDelete(id);
}

/**
 * Deletes health records for many pets.
 * @param {Array<string>} petIds
 * @returns {Promise<unknown>}
 */
async function deleteManyByPetIds(petIds) {
  return HealthRecord.deleteMany({ petId: { $in: petIds } });
}

module.exports = { create, findByPetId, findById, updateById, deleteById, deleteManyByPetIds };