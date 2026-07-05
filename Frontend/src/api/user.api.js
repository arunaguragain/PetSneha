import axiosInstance from './axios';

export const updateLanguage = (language) => axiosInstance.patch('/users/me/language', { language });
export const getChecklist = () => axiosInstance.get('/users/me/checklist');
export const updateChecklist = (checklist) => axiosInstance.patch('/users/me/checklist', checklist);