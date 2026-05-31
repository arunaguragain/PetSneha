const express = require('express');
const { body, param } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { validateRequest } = require('../middleware/validate.middleware');

const router = express.Router();

router.post(
  '/register',
  [body('name').trim().notEmpty().withMessage('Name is required.'), body('email').isEmail().withMessage('Valid email is required.'), body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')],
  validateRequest,
  authController.register
);

router.post(
  '/login',
  [body('email').isEmail().withMessage('Valid email is required.'), body('password').notEmpty().withMessage('Password is required.')],
  validateRequest,
  authController.login
);

router.post('/logout', authController.logout);

router.post('/forgot-password', [body('email').isEmail().withMessage('Valid email is required.')], validateRequest, authController.forgotPassword);

router.post('/reset-password/:token', [param('token').notEmpty().withMessage('Reset token is required.'), body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')], validateRequest, authController.resetPassword);

module.exports = router;