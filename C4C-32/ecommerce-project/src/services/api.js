const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Core fetch wrapper — attaches Bearer token from localStorage if present.
 * Always returns parsed JSON or throws with server error message.
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('karighar_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
};

export const api = {
  get:   (endpoint)       => request(endpoint, { method: 'GET' }),
  post:  (endpoint, body) => request(endpoint, { method: 'POST',  body: JSON.stringify(body) }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  del:   (endpoint)       => request(endpoint, { method: 'DELETE' }),
};
