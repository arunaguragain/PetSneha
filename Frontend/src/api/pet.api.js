import axiosInstance from './axios';

export const getPets = () => axiosInstance.get('/pets');
export const getPet = (id) => axiosInstance.get(`/pets/${id}`);
export const createPet = (formData) =>
  axiosInstance.post('/pets', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    transformRequest: (data) => data, // Prevent Axios from stringifying FormData
  });
export const updatePet = (id, data) => axiosInstance.patch(`/pets/${id}`, data);
export const deletePet = (id) => axiosInstance.delete(`/pets/${id}`);
export const getHealthRecords = (petId) => axiosInstance.get(`/pets/${petId}/records`);
export const createHealthRecord = (petId, data) => axiosInstance.post(`/pets/${petId}/records`, data);
export const updateHealthRecord = (petId, id, data) => axiosInstance.patch(`/pets/${petId}/records/${id}`, data);
export const deleteHealthRecord = (petId, id) => axiosInstance.delete(`/pets/${petId}/records/${id}`);
export const downloadHealthRecordPDF = (petId) => axiosInstance.get(`/pets/${petId}/records/download`, { responseType: 'blob' });
export const getPetReminders = (petId) => axiosInstance.get(`/pets/${petId}/reminders`);
export const createReminder = (data) => axiosInstance.post('/reminders', data);
export const updateReminder = (id, data) => axiosInstance.patch(`/reminders/${id}`, data);
export const deleteReminder = (id) => axiosInstance.delete(`/reminders/${id}`);
export const getAppointments = () => axiosInstance.get('/appointments');