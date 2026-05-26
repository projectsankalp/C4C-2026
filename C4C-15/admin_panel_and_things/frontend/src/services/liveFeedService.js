import { api } from './apiClient';

export async function getDoctorWorkspaceFeed() {
  return await api.get('/mobile-feed/doctor');
}