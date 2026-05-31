const { validationResult } = require('express-validator');

/**
 * Sends a 422 response if validation errors exist.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
function validateRequest(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  return res.status(422).json({
    status: 'fail',
    message: 'Validation failed.',
    errors: result.array().map((error) => ({ field: error.path, message: error.msg })),
  });
}

module.exports = { validateRequest };