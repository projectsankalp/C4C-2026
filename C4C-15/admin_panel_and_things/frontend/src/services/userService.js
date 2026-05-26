import { api } from './apiClient';
import { normalizeUser } from '../utils/normalizers';

export async function getUsers(role = null) {
  const query = role ? `?role=${role}` : '';
  const data = await api.get(`/users${query}`);
  return Array.isArray(data) ? data.map(normalizeUser) : [];
}

export async function addUser(user) {
  return await api.post('/users', user);
}

export async function updatePersonnel(id, payload) {
  if (payload.password) {
    await api.patch(`/users/${id}/password`, { password: payload.password });
    const rest = { ...payload };
    delete rest.password;
    if (Object.keys(rest).length > 0) {
      return await api.patch(`/users/${id}`, rest);
    }
    return true; // We don't have the full updated user object here, but it's fine
  }
  
  return await api.patch(`/users/${id}`, payload);
}

export async function changeUserStatus(id, status) {
  return await api.patch(`/users/${id}/status`, { status });
}

export async function restrictPersonnel(id) {
  return await api.patch(`/users/${id}/restrict`, {});
}

export async function removePersonnel(id) {
  return await api.delete(`/users/${id}`);
}
