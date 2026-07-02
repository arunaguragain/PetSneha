/**
 * Capitalise first letter of each word
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) =>
  str?.replace(/\b\w/g, (character) => character.toUpperCase()) || '';

/**
 * Format date to Nepal-friendly format
 * @param {string|Date} date
 * @returns {string} e.g. "Monday, 18 May 2026"
 */
export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

/**
 * Format date short
 * @param {string|Date} date
 * @returns {string} e.g. "18 May 2026"
 */
export const formatDateShort = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

/**
 * Get initials from full name
 * @param {string} name
 * @returns {string} e.g. "Aruna Guragain" -> "AG"
 */
export const getInitials = (name) =>
  name?.split(' ').map((word) => word[0]).join('').toUpperCase().slice(0, 2) || '?';

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Get role display label
 * @param {string} role - 'petOwner' | 'vet' | 'admin'
 * @returns {string}
 */
export const getRoleLabel = (role) =>
  ({
    petOwner: 'Pet Owner',
    vet: 'Veterinary Doctor',
    admin: 'Administrator',
  })[role] || role;

/**
 * Open Google Maps directions to a location
 * @param {string} locationQuery - clinic name + address/area
 */
export const openGoogleMapsDirections = (locationQuery) => {
  const encoded = encodeURIComponent(locationQuery)
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * Get a Google Maps embed URL for a location preview (no API key needed
 * for basic embed, but for production use Maps Embed API key)
 * @param {string} locationQuery
 * @returns {string} embed URL
 */
export const getGoogleMapsEmbedUrl = (locationQuery) => {
  const encoded = encodeURIComponent(locationQuery)
  return `https://maps.google.com/maps?q=${encoded}&t=&z=14&ie=UTF8&iwloc=&output=embed`
}

/**
 * Validate password strength
 * Requirements: minimum 8 characters, at least one uppercase, one lowercase, one number, one special character
 * @param {string} password
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validatePassword = (password) => {
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
};

