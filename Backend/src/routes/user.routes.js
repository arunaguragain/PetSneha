const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');

const router = express.Router();

router.use(protect);

router.get('/me', userController.getMe);

router.patch('/me', [body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.')], validateRequest, userController.updateMe);

router.patch('/me/language', userController.toggleLanguage);

router.delete('/me', userController.deleteMe);

module.exports = router;