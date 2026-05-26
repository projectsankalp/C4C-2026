import api from './api';
export const loginApi = (data) => api.post('/auth/login', data);
export const getMeApi = () => api.get('/auth/me');
