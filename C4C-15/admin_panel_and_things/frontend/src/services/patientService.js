import { api } from './apiClient';
import { normalizeScreening } from '../utils/normalizers';

export async function getPatients(filters = {}) {
  const queryParams = new URLSearchParams(filters).toString();
  const query = queryParams ? `?${queryParams}` : '';
  const data = await api.get(`/screenings${query}`);
  return Array.isArray(data) ? data.map(normalizeScreening) : [];
}

export async function updatePatientStatus(id, newStatus) {
  return await api.patch(`/mobile-feed/screenings/${id}/status`, { status: newStatus });
}

export async function updatePatientClinicalDetails(id, details) {
  return await api.patch(`/mobile-feed/screenings/${id}`, details);
}

export async function resolvePatient(id, details) {
  return await api.patch(`/mobile-feed/screenings/${id}`, {
    ...details,
    status: 'RESOLVED',
  });
}

export async function createFollowUp(id) {
  return await api.patch(`/mobile-feed/screenings/${id}/status`, { status: 'FOLLOW_UP' });
}

export async function getFollowups() {
  const data = await api.get('/followups');
  return Array.isArray(data) ? data.map(normalizeScreening) : [];
}