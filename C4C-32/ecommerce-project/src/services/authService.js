import { api } from './api';

export const authService = {
  /**
   * Register a new user.
   * @param {{ email, password, full_name, role, phone_number?, village?, district?, state? }} payload
   */
  signup: (payload) => api.post('/api/auth/signup', payload),

  /**
   * Log in with email + password.
   * @param {{ email, password }} payload
   */
  login: (payload) => api.post('/api/auth/login', payload),

  /**
   * Fetch the authenticated user's profile (requires token in localStorage).
   */
  getProfile: () => api.get('/api/auth/profile'),

  /**
   * Update fields on the authenticated user's profile.
   * @param {object} updates
   */
  updateProfile: (updates) => api.patch('/api/auth/profile', updates),
};
