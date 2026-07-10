const express = require('express');
const { body, param } = require('express-validator');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/dashboard', adminController.getDashboard);

router.get('/users', adminController.getAllUsers);
router.get('/users/:id', [param('id').isMongoId().withMessage('Valid user ID is required.')], validateRequest, adminController.getUserById);
router.patch('/users/:id/deactivate', [param('id').isMongoId().withMessage('Valid user ID is required.')], validateRequest, adminController.deactivateUser);
router.patch('/users/:id/reactivate', [param('id').isMongoId().withMessage('Valid user ID is required.')], validateRequest, adminController.reactivateUser);

router.get('/pets', adminController.getAllPets);

router.get('/vets/pending', adminController.getPendingVets);
router.get('/vets', adminController.getAllVets);
router.patch('/vets/:id/approve', [param('id').isMongoId().withMessage('Valid vet ID is required.')], validateRequest, adminController.approveVet);
router.patch('/vets/:id/reject', [param('id').isMongoId().withMessage('Valid vet ID is required.'), body('reason').optional().trim()], validateRequest, adminController.rejectVet);

router.get('/articles/pending', adminController.getPendingArticles);
router.get('/articles', adminController.getAllArticles);
router.patch('/articles/:id/publish', [param('id').isMongoId().withMessage('Valid article ID is required.')], validateRequest, adminController.publishArticle);
router.patch('/articles/:id/reject', [param('id').isMongoId().withMessage('Valid article ID is required.'), body('reason').optional().trim()], validateRequest, adminController.rejectArticle);

router.get('/forum/reported', adminController.getReportedPosts);
router.get('/forum', adminController.getAllForumPosts);
router.delete('/forum/:id', [param('id').isMongoId().withMessage('Valid post ID is required.')], validateRequest, adminController.removePost);
router.patch('/forum/:id/dismiss-report', [param('id').isMongoId().withMessage('Valid post ID is required.')], validateRequest, adminController.dismissPostReport);
router.patch('/forum/:id/pin', [param('id').isMongoId().withMessage('Valid post ID is required.')], validateRequest, adminController.pinPost);

router.get('/products/pending', adminController.getPendingProducts);
router.get('/products', adminController.getAllProducts);
router.patch('/products/:id/approve', [param('id').isMongoId().withMessage('Valid product ID is required.')], validateRequest, adminController.approveProduct);
router.patch('/products/:id/reject', [param('id').isMongoId().withMessage('Valid product ID is required.')], validateRequest, adminController.rejectProduct);

router.get('/orders', adminController.getAllOrders);

module.exports = router;