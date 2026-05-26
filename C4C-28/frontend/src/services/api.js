// Central API client for Swachh Vayu backend
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('sv_token');
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

const handleResponse = async (res) => {
  // If backend returns 401 (token expired/invalid), force logout
  if (res.status === 401) {
    localStorage.removeItem('sv_token');
    localStorage.removeItem('sv_user');
    sessionStorage.clear();
    // Redirect to login if not already there
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please login again.');
  }

  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.message || json.error || 'API error');
  }
  return json;
};

export const api = {
  get: async (path) => {
    const res = await fetch(`${BASE_URL}${path}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  post: async (path, body) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  put: async (path, body) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
};
