const Order = require('../models/order.model');
const Product = require('../models/product.model');

function populateOrderItems(query) {
  return query.populate({
    path: 'items.productId',
    select: 'name images sellerId price',
    populate: {
      path: 'sellerId',
      select: 'name phone profilePhoto',
    },
  });
}

/**
 * Creates an order.
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document>}
 */
async function create(payload) {
  return Order.create(payload);
}

/**
 * Finds orders by user ID.
 * @param {string} userId
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findByUserId(userId) {
  return populateOrderItems(Order.find({ userId }).sort('-createdAt'));
}

/**
 * Finds orders containing products sold by the given seller.
 * @param {string} sellerId
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findBySellerId(sellerId) {
  const products = await Product.find({ sellerId }).select('_id');
  const productIds = products.map(p => p._id);
  return populateOrderItems(Order.find({ 'items.productId': { $in: productIds } }).sort('-createdAt'));
}

/**
 * Finds all orders.
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findAll() {
  return populateOrderItems(Order.find().sort('-createdAt'));
}

/**
 * Finds an order by ID.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findById(id) {
  return populateOrderItems(Order.findById(id));
}

/**
 * Updates an order.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function updateById(id, payload) {
  return populateOrderItems(Order.findByIdAndUpdate(id, payload, { new: true, runValidators: true }));
}

/**
 * Deletes an order.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function deleteById(id) {
  return Order.findByIdAndDelete(id);
}

/**
 * Deletes all orders for a user.
 * @param {string} userId
 * @returns {Promise<unknown>}
 */
async function deleteManyByUserId(userId) {
  return Order.deleteMany({ userId });
}

module.exports = { create, findByUserId, findBySellerId, findAll, findById, updateById, deleteById, deleteManyByUserId };