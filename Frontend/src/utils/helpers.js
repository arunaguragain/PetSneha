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
