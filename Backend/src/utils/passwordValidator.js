/**
 * Validates password strength
 * Requirements: minimum 8 characters, at least one uppercase, one lowercase, one number, one special character
 * @param {string} password
 * @returns {{ isValid: boolean, errors: string[] }}
 */
function validatePassword(password) {
  const errors = [];

  if (!password) {
    errors.push('Password is required.');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long.');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter.');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number.');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = { validatePassword };
