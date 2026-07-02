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
  try {
    console.log('Repository updateById called with fields:', Object.keys(payload));
    const result = await Vet.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    console.log('Repository updateById succeeded');
    return result;
  } catch (err) {
    console.error('Repository updateById error:', err.message);
    if (err.errors) {
      Object.entries(err.errors).forEach(([field, error]) => {
        console.error(`  Field "${field}": ${error.message}`);
      });
    }
    throw err;
  }
}

/**
 * Deletes a vet by ID.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function deleteById(id) {
  return Vet.findByIdAndDelete(id);
}

async function findAllPublic(filters = {}) {
  const query = {};

  if (filters.isVerified !== undefined) {
    query.isVerified = filters.isVerified === 'true' || filters.isVerified === true;
  } else if (filters.verified !== undefined) {
    query.isVerified = filters.verified === 'true' || filters.verified === true;
  }

  // Support both raw query param names and built filter structures
  if (filters.maxFee) {
    query.consultationFee = { $lte: Number(filters.maxFee) };
  } else if (filters.consultationFee) {
    query.consultationFee = filters.consultationFee;
  }

  if (filters.location) {
    query.location = filters.location instanceof RegExp ? filters.location : new RegExp(filters.location, 'i');
  }

  if (filters.specialisation) {
    query.specialisation = filters.specialisation;
  }

  // Also support any other filters
  for (const key of Object.keys(filters)) {
    if (!['maxFee', 'consultationFee', 'location', 'specialisation', 'verified', 'isVerified'].includes(key)) {
      query[key] = filters[key];
    }
  }

  return Vet.find(query).sort({ rating: -1 });
}

module.exports = { create, findAll, findAllPublic, findById, findByUserId, updateById, deleteById };