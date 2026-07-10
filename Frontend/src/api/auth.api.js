import axiosInstance from './axios';

/**
 * Register new user
 * @param {{ name, email, password, confirmPassword, role }} data
 * @returns {Promise<{ token, data: { user } }>}
 */
export const registerUser = (data) => axiosInstance.post('/auth/register', data);

/**
 * Login user
 * @param {{ email, password }} data
 * @returns {Promise<{ token, data: { user } }>}
 */
export const loginUser = (data) => axiosInstance.post('/auth/login', data);

/**
 * Login or Register user with Google
 * @param {{ credential }} data
 * @returns {Promise<{ token, data: { user } }>}
 */
export const googleLogin = (data) => axiosInstance.post('/auth/google', data);

/**
 * Logout user
 * @returns {Promise}
 */
export const logoutUser = () => axiosInstance.post('/auth/logout');

/**
 * Send forgot password email
 * @param {{ email }} data
 * @returns {Promise}
 */
export const forgotPassword = (data) => axiosInstance.post('/auth/forgot-password', data);

/**
 * Reset password with token
 * @param {string} token
 * @param {{ password, confirmPassword }} data
 * @returns {Promise}
 */
export const resetPassword = (token, data) => axiosInstance.post(`/auth/reset-password/${token}`, data);

/**
 * Get current logged-in user profile
 * @returns {Promise<{ data: { user } }>}
 */
export const getCurrentUser = () => axiosInstance.get('/users/me');
