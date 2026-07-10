const catchAsync = require('../utils/catchAsync');
const authService = require('../services/auth.service');

function sendAuthResponse(res, statusCode, payload) {
  return res.status(statusCode).json({
    status: 'success',
    data: payload,
  });
}

/**
 * Registers a new pet owner.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  sendAuthResponse(res, 201, result);
});

/**
 * Logs a user in and returns a token.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  sendAuthResponse(res, 200, result);
});

/**
 * Logs the user out.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const logout = catchAsync(async (req, res) => {
  res.clearCookie('token');
  sendAuthResponse(res, 200, { message: 'Logged out successfully.' });
});

/**
 * Sends a password reset email.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const forgotPassword = catchAsync(async (req, res) => {
  const result = await authService.forgotPassword(req.body);
  sendAuthResponse(res, 200, result);
});

/**
 * Resets the password using a reset token.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const resetPassword = catchAsync(async (req, res) => {
  const result = await authService.resetPassword({ token: req.params.token, password: req.body.password });
  sendAuthResponse(res, 200, result);
});

/**
 * Authenticates a user using Google OAuth.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const googleLogin = catchAsync(async (req, res) => {
  const result = await authService.googleLogin(req.body);
  sendAuthResponse(res, 200, result);
});

module.exports = { register, login, logout, forgotPassword, resetPassword, googleLogin };