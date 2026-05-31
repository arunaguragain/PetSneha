const jwt = require('jsonwebtoken');

/**
 * Signs an authentication token for a user.
 * @param {{ _id: string|object, role: string }} user
 * @returns {string}
 */
function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = generateToken;