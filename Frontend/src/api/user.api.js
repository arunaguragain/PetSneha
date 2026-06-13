import axiosInstance from './axios';

export const updateLanguage = (language) => axiosInstance.patch('/users/me/language', { language });