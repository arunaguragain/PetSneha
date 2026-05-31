/**
 * Wraps an async Express handler and forwards rejections to next().
 * @param {Function} fn
 * @returns {Function}
 */
function catchAsync(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

module.exports = catchAsync;