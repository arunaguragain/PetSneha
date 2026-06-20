import axiosInstance from './axios';

export const getArticles = (params) => axiosInstance.get('/articles', { params });
export const getArticle = (id) => axiosInstance.get(`/articles/${id}`);
export const submitArticle = (data) => axiosInstance.post('/articles', data);
export const getForumPosts = (params) => axiosInstance.get('/forum', { params });
export const getForumPost = (id) => axiosInstance.get(`/forum/${id}`);
export const createForumPost = (data) => axiosInstance.post('/forum', data);
export const addForumAnswer = (id, data) => axiosInstance.post(`/forum/${id}/answers`, data);
export const upvotePost = (id) => axiosInstance.patch(`/forum/${id}/upvote`);
export const reportPost = (id) => axiosInstance.post(`/forum/${id}/report`);