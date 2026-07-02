const express = require('express');
const { body, param } = require('express-validator');
const productController = require('../controllers/product.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const { productUpload, parseFormFields } = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', productController.listProducts);

router.get('/mine', protect, restrictTo('vet'), productController.getMyProducts);

router.get('/:id', [param('id').isMongoId().withMessage('Valid product ID is required.')], validateRequest, productController.getProduct);

router.post('/', protect, restrictTo('admin', 'vet'), productUpload.array('images', 6), parseFormFields, [
  body('name').trim().notEmpty().withMessage('Name is required.'), 
  body('price').isNumeric().withMessage('Price is required.').isFloat({ min: 0 }).withMessage('Price cannot be below 0.'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock cannot be below 0.')
], validateRequest, productController.createProduct);

router.patch('/:id', protect, productUpload.array('images', 6), parseFormFields, [
  param('id').isMongoId().withMessage('Valid product ID is required.'),
  body('price').optional().isNumeric().withMessage('Price must be a number.').isFloat({ min: 0 }).withMessage('Price cannot be below 0.'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock cannot be below 0.')
], validateRequest, productController.updateProduct);

router.delete('/:id', [param('id').isMongoId().withMessage('Valid product ID is required.')], protect, validateRequest, productController.deleteProduct);

module.exports = router;