import axiosInstance from './axios';

export const getProducts = (params) => axiosInstance.get('/products', { params });
export const getProduct = (id) => axiosInstance.get(`/products/${id}`);
export const placeOrder = (data) => axiosInstance.post('/orders', data);
export const getOrders = () => axiosInstance.get('/orders');
export const cancelOrder = (id) => axiosInstance.patch(`/orders/${id}/cancel`);