const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
  } as any;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Auto-detect if body is FormData, if not and body exists, set Content-Type JSON
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

export const api = {
  // Artisan Auth
  requestOTP: (phone: string) =>
    request('/users/request-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOTP: (phone: string, otp: string) =>
    request('/users/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    }),

  // Validator/Admin Auth
  login: (username: string, password: string) =>
    request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // Volunteer Auth
  registerVolunteer: (formData: FormData) =>
    request('/volunteers/register', {
      method: 'POST',
      body: formData,
    }),

  loginVolunteer: (email: string, password: string) =>
    request('/volunteers/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Artisan Actions
  getProfile: () => request('/users/profile'),

  submitSkill: (trade: string, file: File, candidateData?: any) => {
    const formData = new FormData();
    formData.append('trade', trade);
    formData.append('file', file);
    if (candidateData) {
      if (candidateData.name) formData.append('candidateName', candidateData.name);
      if (candidateData.phone) formData.append('candidatePhone', candidateData.phone);
      if (candidateData.location) formData.append('candidateLocation', candidateData.location);
    }
    return request('/users/submit', {
      method: 'POST',
      body: formData,
    });
  },

  getSubmissions: () => request('/users/submissions'),

  getJobs: (location?: string) =>
    request(location ? `/users/jobs?location=${encodeURIComponent(location)}` : `/users/jobs`),

  // Volunteer Actions
  getVolunteerDashboard: () => request('/volunteers/dashboard'),

  addVolunteerCertification: (formData: FormData) =>
    request('/volunteers/certifications', {
      method: 'POST',
      body: formData,
    }),

  // Validator Actions
  getPendingSubmissions: () => request('/admin/submissions/pending'),

  approveSubmission: (id: string, skillScore: number, professionalismScore: number) =>
    request(`/admin/submissions/${id}/approve?skillScore=${skillScore}&professionalismScore=${professionalismScore}`, {
      method: 'POST',
    }),

  rejectSubmission: (id: string) =>
    request(`/admin/submissions/${id}/reject`, {
      method: 'POST',
    }),

  // Public
  verifyCertificate: (code: string) => request(`/public/verify/${code}`),
};
