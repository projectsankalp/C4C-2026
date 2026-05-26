const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function getToken() {
  return localStorage.getItem('asha_plus_token');
}

async function request(endpoint, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // not JSON
  }

  if (!response.ok) {
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint} - Status: ${response.status} - Message:`, data?.message || response.statusText);
    if (response.status === 401) {
      localStorage.removeItem('asha_plus_token');
      localStorage.removeItem('asha_plus_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    throw new Error(data?.message || 'API request failed');
  }

  return data;
}

export const api = {
  get: (endpoint) => request(endpoint),
  
  post: (endpoint, body) => request(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  
  patch: (endpoint, body) => request(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }),
  
  delete: (endpoint) => request(endpoint, {
    method: 'DELETE',
  }),
};
