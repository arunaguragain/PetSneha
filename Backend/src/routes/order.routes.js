const express = require('express');
const { body, param } = require('express-validator');
const orderController = require('../controllers/order.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');

const router = express.Router();

router.use(protect);

router.get('/seller', restrictTo('vet', 'admin'), orderController.getSellerOrders);

router.patch('/:id/status', restrictTo('vet', 'admin'), [
  param('id').isMongoId().withMessage('Valid order ID is required.'),
  body('status').isIn(['placed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status.')
], validateRequest, orderController.updateOrderStatus);

router.get('/', orderController.listOrders);

router.get('/:id', [param('id').isMongoId().withMessage('Valid order ID is required.')], validateRequest, orderController.getOrder);

router.post('/', [body('items').isArray({ min: 1 }).withMessage('At least one item is required.')], validateRequest, orderController.placeOrder);

router.patch('/:id/cancel', [param('id').isMongoId().withMessage('Valid order ID is required.')], validateRequest, orderController.cancelOrder);

module.exports = router;