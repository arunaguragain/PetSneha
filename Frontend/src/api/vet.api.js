import axiosInstance from './axios';

export const getVets = (params) => axiosInstance.get('/vets', { params });
export const getVet = (id) => axiosInstance.get(`/vets/${id}`);
export const getEmergencyVets = () => axiosInstance.get('/vets/emergency');
export const getVetSlots = (vetId, date) => axiosInstance.get(`/vets/${vetId}/slots`, { params: { date } });
export const bookAppointment = (data) => axiosInstance.post('/appointments', data);
export const cancelAppointment = (id) => axiosInstance.patch(`/appointments/${id}/cancel`);
export const submitReview = (vetId, data) => axiosInstance.post(`/vets/${vetId}/reviews`, data);
export const saveVet = (vetId) => axiosInstance.patch('/users/me', { savedVetId: vetId });
export const createVetProfile = (data) => axiosInstance.post('/vets', data);
export const updateVetProfile = (id, data) => axiosInstance.patch(`/vets/${id}`, data);