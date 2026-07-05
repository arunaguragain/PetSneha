const Product = require('../models/product.model');

/**
 * Creates a product.
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document>}
 */
async function create(payload) {
  return Product.create(payload);
}

/**
 * Finds products with optional filters.
 * @param {object} filter
 * @param {string|object} sortOption
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findAll(filter = {}, sortOption = '-createdAt') {
  return Product.find(filter).sort(sortOption);
}

/**
 * Finds a product by ID.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findById(id) {
  return Product.findById(id);
}

/**
 * Updates a product by ID.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function updateById(id, payload) {
  return Product.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
}

/**
 * Deletes a product by ID.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function deleteById(id) {
  return Product.findByIdAndDelete(id);
}

/**
 * Finds products by seller's user ID.
 * @param {string} userId
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findBySellerUserId(userId) {
  return Product.find({ sellerId: userId }).sort('-createdAt');
}

module.exports = { create, findAll, findById, updateById, deleteById, findBySellerUserId };