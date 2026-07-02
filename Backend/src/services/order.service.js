const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');
const userRepository = require('../repositories/user.repository');
const notificationService = require('./notification.service');
const AppError = require('../utils/AppError');

async function resolveOrderAccess(currentUser, order) {
  if (currentUser.role !== 'admin' && order.userId.toString() !== currentUser.id) {
    throw new AppError('You do not have access to this order.', 403);
  }
}

/**
 * Returns order history for the current user or all orders for admins.
 * @param {{ id: string, role: string }} currentUser
 * @returns {Promise<Array<object>>}
 */
async function listOrders(currentUser) {
  if (currentUser.role === 'admin') {
    return orderRepository.findAll();
  }

  return orderRepository.findByUserId(currentUser.id);
}

/**
 * Returns a single order.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} orderId
 * @returns {Promise<object>}
 */
async function getOrder(currentUser, orderId) {
  const order = await orderRepository.findById(orderId);
  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  await resolveOrderAccess(currentUser, order);
  return order;
}

/**
 * Places an order and sends the confirmation email.
 * @param {{ id: string, role: string }} currentUser
 * @param {object} payload
 * @returns {Promise<object>}
 */
async function placeOrder(currentUser, payload) {
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (items.length === 0) {
    throw new AppError('Order items are required.', 400);
  }

  const normalizedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await productRepository.findById(item.productId);
    if (!product) {
      throw new AppError('One of the products does not exist.', 404);
    }

    const quantity = Number(item.quantity || 0);
    if (quantity <= 0) {
      throw new AppError('Quantity must be at least 1.', 400);
    }

    if (product.stock < quantity) {
      throw new AppError(`Insufficient stock for ${product.name}.`, 409);
    }

    subtotal += Number(product.price) * quantity;
    normalizedItems.push({
      productId: product._id,
      name: product.name,
      quantity,
      price: Number(product.price),
    });
  }

  const deliveryFee = Number(payload.deliveryFee ?? 100);
  const total = subtotal + deliveryFee;

  const order = await orderRepository.create({
    userId: currentUser.id,
    items: normalizedItems,
    subtotal,
    deliveryFee,
    total,
    paymentMethod: payload.paymentMethod || 'cod',
    deliveryAddress: payload.deliveryAddress,
    status: 'placed',
  });

  for (const item of normalizedItems) {
    const product = await productRepository.findById(item.productId);
    await productRepository.updateById(item.productId, { stock: product.stock - item.quantity });
  }

  try {
    const user = await userRepository.findById(currentUser.id);
    await notificationService.sendOrderConfirmationEmail(user, order);
    await orderRepository.updateById(order._id, { confirmationEmailSent: true });
  } catch (error) {
    // Order creation is not blocked by email delivery failures.
  }

  return order;
}

/**
 * Cancels an order and restores product stock.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} orderId
 * @returns {Promise<object>}
 */
async function cancelOrder(currentUser, orderId) {
  const order = await orderRepository.findById(orderId);
  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  await resolveOrderAccess(currentUser, order);

  if (['delivered', 'cancelled'].includes(order.status)) {
    throw new AppError('This order cannot be cancelled.', 400);
  }

  for (const item of order.items) {
    const product = await productRepository.findById(item.productId);
    if (product) {
      await productRepository.updateById(item.productId, { stock: product.stock + item.quantity });
    }
  }

  return orderRepository.updateById(orderId, { status: 'cancelled' });
}

/**
 * Returns orders for the current vet.
 * @param {{ id: string, role: string }} currentUser
 * @returns {Promise<Array<object>>}
 */
async function getSellerOrders(currentUser) {
  if (currentUser.role !== 'vet' && currentUser.role !== 'admin') {
    throw new AppError('Only vets and admins can access seller orders.', 403);
  }
  
  if (currentUser.role === 'admin') {
    return orderRepository.findAll();
  }
  
  return orderRepository.findBySellerId(currentUser.id);
}

/**
 * Updates the status of an order.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} orderId
 * @param {string} status
 * @returns {Promise<object>}
 */
async function updateOrderStatus(currentUser, orderId, status) {
  const order = await orderRepository.findById(orderId);
  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  if (currentUser.role !== 'admin') {
    if (currentUser.role !== 'vet') {
      throw new AppError('Only vets and admins can update order status.', 403);
    }
    
    // Check if vet owns any items in this order
    const sellerOrders = await orderRepository.findBySellerId(currentUser.id);
    const hasAccess = sellerOrders.some(o => o._id.toString() === orderId);
    if (!hasAccess) {
      throw new AppError('You do not have access to this order.', 403);
    }
  }

  return orderRepository.updateById(orderId, { status });
}

module.exports = { listOrders, getOrder, placeOrder, cancelOrder, getSellerOrders, updateOrderStatus };