import api from './api';
export const createPatient = (data) => api.post('/patients', data);
export const getPatients = (params) => api.get('/patients', { params });
export const getPatient = (id) => api.get(`/patients/${id}`);
