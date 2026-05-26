import { api } from './apiClient';

export async function login(username, password) {
  return await api.post('/auth/login', { username, password });
}

export async function checkSession() {
  return await api.get('/auth/me');
}

export function logout() {
  localStorage.removeItem('asha_plus_token');
  localStorage.removeItem('asha_plus_user');
  localStorage.removeItem('asha_plus_role');
}
