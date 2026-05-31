const express = require('express');
const { body, param } = require('express-validator');
const productController = require('../controllers/product.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');

const router = express.Router();

router.get('/', productController.listProducts);

router.get('/:id', [param('id').isMongoId().withMessage('Valid product ID is required.')], validateRequest, productController.getProduct);

router.post('/', [body('name').trim().notEmpty().withMessage('Name is required.'), body('price').isNumeric().withMessage('Price is required.')], protect, restrictTo('admin', 'vet'), validateRequest, productController.createProduct);

router.patch('/:id', [param('id').isMongoId().withMessage('Valid product ID is required.')], protect, validateRequest, productController.updateProduct);

router.delete('/:id', [param('id').isMongoId().withMessage('Valid product ID is required.')], protect, validateRequest, productController.deleteProduct);

module.exports = router;