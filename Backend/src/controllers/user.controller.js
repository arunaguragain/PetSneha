const catchAsync = require('../utils/catchAsync');
const userService = require('../services/user.service');

function sendItem(res, key, item, statusCode = 200) {
  return res.status(statusCode).json({
    status: 'success',
    data: { [key]: item },
  });
}

/**
 * Gets the current user profile.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getMe = catchAsync(async (req, res) => {
  const user = await userService.getCurrentUser(req.user.id);
  sendItem(res, 'user', user);
});

/**
 * Updates the current user profile.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const updateMe = catchAsync(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  sendItem(res, 'user', user);
});

/**
 * Toggles the current user language.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const toggleLanguage = catchAsync(async (req, res) => {
  const user = await userService.toggleLanguage(req.user.id);
  sendItem(res, 'user', user);
});

/**
 * Deletes the current user account.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const deleteMe = catchAsync(async (req, res) => {
  await userService.deleteAccount(req.user.id);
  res.status(204).send();
});

module.exports = { getMe, updateMe, toggleLanguage, deleteMe };