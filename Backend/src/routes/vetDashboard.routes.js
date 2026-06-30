const express = require('express');
const { body, param } = require('express-validator');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const vetDashboardController = require('../controllers/vetDashboard.controller');
const { articleUpload } = require('../middleware/upload.middleware');

const router = express.Router();

router.use(protect, restrictTo('vet'));

router.get('/dashboard', vetDashboardController.getDashboard);
router.get('/appointments', vetDashboardController.getAppointments);
router.patch('/appointments/:id/confirm', [param('id').isMongoId().withMessage('Valid appointment ID is required.')], validateRequest, vetDashboardController.confirmAppointment);
router.patch(
  '/appointments/:id/complete',
  [param('id').isMongoId().withMessage('Valid appointment ID is required.')],
  validateRequest,
  vetDashboardController.completeAppointment
);
router.patch('/appointments/:id/cancel', [param('id').isMongoId().withMessage('Valid appointment ID is required.')], validateRequest, vetDashboardController.cancelAppointment);
router.patch('/status', vetDashboardController.toggleOpenStatus);
router.post(
  '/articles',
  articleUpload.single('image'),
  [body('title').trim().notEmpty().withMessage('Title is required.'), body('content').trim().notEmpty().withMessage('Content is required.')],
  validateRequest,
  vetDashboardController.submitArticle
);
router.get('/articles', vetDashboardController.getMyArticles);
router.post('/reviews/:reviewId/reply', [param('reviewId').isMongoId().withMessage('Valid review ID is required.'), body('reply').trim().notEmpty().withMessage('Reply is required.')], validateRequest, vetDashboardController.replyToReview);

module.exports = router;