const AppError = require('../utils/AppError');

/**
 * Global Express error handler.
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
function errorHandler(err, req, res, next) {
  let error = { ...err, message: err.message };

  if (err.name === 'CastError') {
    error = new AppError('Invalid resource ID.', 400);
  }

  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
    error = new AppError(`Duplicate value for ${duplicateField}.`, 409);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {})
      .map((validationError) => validationError.message)
      .join('. ');
    error = new AppError(message || 'Validation failed.', 422);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = new AppError('Invalid or expired token.', 401);
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';
  const response = { status, message: error.message || 'Something went wrong.' };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  if (!error.isOperational && process.env.NODE_ENV !== 'development') {
    response.message = 'Internal server error.';
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;