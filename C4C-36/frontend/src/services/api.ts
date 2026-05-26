const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  public get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public post<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public put<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  public patch<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const api = new APIClient(API_BASE_URL);

// Auth endpoints
export const authAPI = {
  login: (userType: 'user' | 'volunteer' | 'admin') =>
    api.post(`/auth/login`, { userType }),
  logout: () => api.post(`/auth/logout`),
  verifyOtp: (phone: string, otp: string) =>
    api.post(`/auth/verify-otp`, { phone, otp }),
  requestOtp: (phone: string) =>
    api.post(`/auth/request-otp`, { phone }),
};

// Volunteer endpoints
export const volunteerAPI = {
  getProfile: (volunteerId: string) =>
    api.get(`/volunteers/${volunteerId}`),
  updateProfile: (volunteerId: string, data: unknown) =>
    api.put(`/volunteers/${volunteerId}`, data),
  getCertifications: (volunteerId: string) =>
    api.get(`/volunteers/${volunteerId}/certifications`),
};

// User endpoints
export const userAPI = {
  getProfile: (userId: string) =>
    api.get(`/users/${userId}`),
  updateProfile: (userId: string, data: unknown) =>
    api.put(`/users/${userId}`, data),
};

// Admin endpoints
export const adminAPI = {
  getStats: () => api.get(`/admin/stats`),
  getVolunteers: () => api.get(`/admin/volunteers`),
  approveVolunteer: (volunteerId: string) =>
    api.post(`/admin/volunteers/${volunteerId}/approve`),
};
