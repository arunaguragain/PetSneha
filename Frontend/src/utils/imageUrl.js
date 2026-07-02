/**
 * Constructs a full image URL with cache busting
 * @param {string} imageSrc - The image source path (e.g., '/uploads/vets/photo.jpg')
 * @returns {string} - Full URL with cache busting parameter
 */
export const getImageUrl = (imageSrc) => {
  if (!imageSrc) return '/profile.png';
  if (imageSrc.startsWith('http')) return imageSrc;
  
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5050/api').replace('/api', '');
  // Cache busting: changes every minute
  const timestamp = Math.floor(Date.now() / 60000);
  return `${baseUrl}${imageSrc}?t=${timestamp}`;
};

/**
 * Gets image URL with fallback to default profile picture
 * @param {string} imageSrc - The image source path
 * @returns {string} - Full URL or default profile picture
 */
export const getProfileImageUrl = (imageSrc) => {
  return getImageUrl(imageSrc) || '/profile.png';
};
