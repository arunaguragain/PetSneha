import axiosInstance from './axios';

export const getProducts = (params) => axiosInstance.get('/products', { params });
export const getProduct = (id) => axiosInstance.get(`/products/${id}`);
export const placeOrder = (data) => axiosInstance.post('/orders', data);
export const getOrders = () => axiosInstance.get('/orders');
export const cancelOrder = (id) => axiosInstance.patch(`/orders/${id}/cancel`);

export const getMyProducts = () => axiosInstance.get('/products/mine');
export const addProduct = (data) => axiosInstance.post('/products', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const editProduct = (id, data) => axiosInstance.patch(`/products/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const removeProduct = (id) => axiosInstance.delete(`/products/${id}`);

export const getSellerOrders = () => axiosInstance.get('/orders/seller');
export const updateOrderStatus = (id, status) => axiosInstance.patch(`/orders/${id}/status`, { status });