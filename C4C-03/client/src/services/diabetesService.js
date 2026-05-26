import api from './api';

export const createClassification   = (data)       => api.post('/diabetes', data);
export const suggestClassification  = (data)       => api.post('/diabetes/suggest', data);
export const getByPatient           = (patientId)  => api.get(`/diabetes/patient/${patientId}`);
export const getByScreening         = (screeningId)=> api.get(`/diabetes/screening/${screeningId}`);
export const getAllClassifications  = (params)     => api.get('/diabetes', { params });
export const updateClassification   = (id, data)   => api.patch(`/diabetes/${id}`, data);
