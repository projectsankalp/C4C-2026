import { api } from './apiClient';
import { normalizePhc, normalizeNotification } from '../utils/normalizers';

export async function getSystemStats() {
  return await api.get('/stats/system');
}

export async function getAdminStats() {
  return await api.get('/stats/admin');
}

export async function getDoctorStats() {
  return await api.get('/stats/doctor');
}

export async function getVillageRiskHeatmap() {
  return await api.get('/stats/village-risk');
}

export async function getNotifications() {
  const data = await api.get('/notifications');
  return Array.isArray(data) ? data.map(normalizeNotification) : [];
}

export async function getPhcs() {
  const data = await api.get('/phcs');
  return Array.isArray(data) ? data.map(normalizePhc) : [];
}