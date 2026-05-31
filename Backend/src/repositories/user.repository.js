const User = require('../models/user.model');

/**
 * Creates a new user document.
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document>}
 */
async function create(payload) {
  return User.create(payload);
}

/**
 * Finds a user by ID.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findById(id) {
  return User.findById(id);
}

/**
 * Finds a user by email.
 * @param {string} email
 * @param {boolean} [includePassword=false]
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findByEmail(email, includePassword = false) {
  const query = User.findOne({ email: email.toLowerCase() });
  if (includePassword) {
    query.select('+password');
  }
  return query;
}

/**
 * Updates a user by ID.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function updateById(id, payload) {
  return User.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
}

/**
 * Deletes a user by ID.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function deleteById(id) {
  return User.findByIdAndDelete(id);
}

module.exports = { create, findById, findByEmail, updateById, deleteById };