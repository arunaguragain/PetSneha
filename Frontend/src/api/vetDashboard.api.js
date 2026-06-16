import axiosInstance from './axios';

export const getVetDashboard = () => axiosInstance.get('/vet/dashboard');
export const getVetAppointments = (params) => axiosInstance.get('/vet/appointments', { params });
export const confirmAppointment = (id) => axiosInstance.patch(`/vet/appointments/${id}/confirm`);
export const completeAppointment = (id, data) => axiosInstance.patch(`/vet/appointments/${id}/complete`, data);
export const vetCancelAppointment = (id, reason) => axiosInstance.patch(`/vet/appointments/${id}/cancel`, { reason });
export const toggleVetStatus = () => axiosInstance.patch('/vet/status');
export const submitVetArticle = (data) => axiosInstance.post('/vet/articles', data);
export const getMyVetArticles = () => axiosInstance.get('/vet/articles');