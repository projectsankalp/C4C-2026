import api from './api';
export const createReferral = (data) => api.post('/referrals', data);
export const getReferrals = (params) => api.get('/referrals', { params });
export const updateReferral = (id, data) => api.patch(`/referrals/${id}`, data);
