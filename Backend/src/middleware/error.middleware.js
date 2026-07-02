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

  console.error('Error caught:', err.name, '-', err.message);
  if (err.errors) {
    console.error('Validation errors:', err.errors);
  }

  // Handle Multer errors specifically
  if (err.name === 'MulterError') {
    console.error('MulterError details:', { code: err.code, message: err.message, limit: err.limit });
    if (err.code === 'LIMIT_FIELD_SIZE') {
      error = new AppError('One or more form fields are too large. Please reduce the amount of text.', 400);
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      error = new AppError('File is too large. Maximum file size is 50MB.', 400);
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error = new AppError('Unexpected file upload field.', 400);
    } else {
      error = new AppError(`Upload error: ${err.message}`, 400);
    }
  }

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
    console.error('Mongoose ValidationError message:', message);
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