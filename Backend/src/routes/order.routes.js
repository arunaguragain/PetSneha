const express = require('express');
const { body, param } = require('express-validator');
const orderController = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');

const router = express.Router();

router.use(protect);

router.get('/', orderController.listOrders);

router.get('/:id', [param('id').isMongoId().withMessage('Valid order ID is required.')], validateRequest, orderController.getOrder);

router.post('/', [body('items').isArray({ min: 1 }).withMessage('At least one item is required.')], validateRequest, orderController.placeOrder);

router.patch('/:id/cancel', [param('id').isMongoId().withMessage('Valid order ID is required.')], validateRequest, orderController.cancelOrder);

module.exports = router;