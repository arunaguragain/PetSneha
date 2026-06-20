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

