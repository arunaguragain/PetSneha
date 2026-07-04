const express = require('express');
const { body, param, query } = require('express-validator');
const vetController = require('../controllers/vet.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const { vetUpload, parseFormFields } = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/emergency', vetController.getEmergencyVets);

router.get('/', vetController.listVets);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('licenseNumber').trim().notEmpty().withMessage('License number is required.'),
    body('consultationFee').isNumeric().withMessage('Consultation fee is required.'),
  ],
  protect,
  restrictTo('vet', 'admin'),
  validateRequest,
  vetController.registerVet
);

router.get('/:id/reviews', [param('id').isMongoId().withMessage('Valid vet ID is required.')], validateRequest, vetController.getReviews);

router.post('/:id/reviews', [param('id').isMongoId().withMessage('Valid vet ID is required.'), body('appointmentId').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Invalid appointment ID.'), body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.')], protect, validateRequest, vetController.submitReview);

router.patch('/:id/status', [param('id').isMongoId().withMessage('Valid vet ID is required.')], protect, restrictTo('vet', 'admin'), validateRequest, vetController.toggleOpenStatus);

router.patch('/:id', [param('id').isMongoId().withMessage('Valid vet ID is required.')], protect, vetUpload.single('profilePicture'), parseFormFields, validateRequest, vetController.updateVetProfile);

router.get('/:id', [param('id').isMongoId().withMessage('Valid vet ID is required.')], validateRequest, vetController.getVet);

router.patch('/:id/reviews/:reviewId/reply', [param('id').isMongoId().withMessage('Valid vet ID is required.'), param('reviewId').isMongoId().withMessage('Valid review ID is required.'), body('reply').trim().notEmpty().withMessage('Reply content is required.')], protect, restrictTo('vet', 'admin'), validateRequest, vetController.replyToReview);

module.exports = router;