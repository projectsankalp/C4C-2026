import { api } from './api';

const TOKEN_KEY = 'sv_token';
const USER_KEY  = 'sv_user';

// Simple event system so React components can react to auth changes
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach(fn => fn());
};

export const auth = {
  login: async (mobile_number, password) => {
    const res = await api.post('/auth/login', { mobile_number, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
    notifyListeners();
    return res.data;
  },

  logout: () => {
    // Clear all auth-related storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Also clear any other stale session data
    sessionStorage.clear();
    notifyListeners();
  },

  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),

  getUser: () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  },

  getRole: () => {
    const user = auth.getUser();
    return user?.role || null;
  },

  getProfile: () => api.get('/auth/profile'),

  // Subscribe to auth state changes
  subscribe: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
