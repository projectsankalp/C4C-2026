import api from './api';
export const getAlerts = (params) => api.get('/alerts', { params });
export const updateAlert = (id, data) => api.patch(`/alerts/${id}`, data);
