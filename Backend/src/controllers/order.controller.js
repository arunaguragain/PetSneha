const catchAsync = require('../utils/catchAsync');
const orderService = require('../services/order.service');

function sendList(res, items) {
  return res.status(200).json({ status: 'success', results: items.length, data: { items } });
}

function sendItem(res, key, item, statusCode = 200) {
  return res.status(statusCode).json({ status: 'success', data: { [key]: item } });
}

/**
 * Lists orders for the current user.
 */
const listOrders = catchAsync(async (req, res) => {
  const orders = await orderService.listOrders(req.user);
  sendList(res, orders);
});

/**
 * Gets a single order.
 */
const getOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrder(req.user, req.params.id);
  sendItem(res, 'order', order);
});

/**
 * Places a new order.
 */
const placeOrder = catchAsync(async (req, res) => {
  const order = await orderService.placeOrder(req.user, req.body);
  sendItem(res, 'order', order, 201);
});

/**
 * Cancels an order.
 */
const cancelOrder = catchAsync(async (req, res) => {
  const order = await orderService.cancelOrder(req.user, req.params.id);
  sendItem(res, 'order', order);
});

/**
 * Gets seller orders.
 */
const getSellerOrders = catchAsync(async (req, res) => {
  const orders = await orderService.getSellerOrders(req.user);
  sendList(res, orders);
});

/**
 * Updates an order's status.
 */
const updateOrderStatus = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.user, req.params.id, req.body.status);
  sendItem(res, 'order', order);
});

module.exports = { listOrders, getOrder, placeOrder, cancelOrder, getSellerOrders, updateOrderStatus };