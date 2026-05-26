/**
 * AarogyaNet — shared client-side utilities
 * Loaded on all pages via base.html (or standalone)
 */

// ── JWT helpers ───────────────────────────────────────────────
const AarogyaNet = {
  TOKEN_KEY: 'aarogyanet_token',
  USER_KEY:  'aarogyanet_user',

  getToken() { return localStorage.getItem(this.TOKEN_KEY); },
  getUser()  {
    try { return JSON.parse(localStorage.getItem(this.USER_KEY)); }
    catch { return null; }
  },
  setAuth(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    window.location.href = '/login';
  },
  isLoggedIn() { return !!this.getToken(); },

  // ── API client ─────────────────────────────────────────────
  headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.getToken(),
    };
  },
  async get(url) {
    const r = await fetch(url, { headers: this.headers() });
    if (r.status === 401) { this.logout(); return null; }
    return r.json();
  },
  async post(url, body) {
    const r = await fetch(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (r.status === 401) { this.logout(); return null; }
    return r.json();
  },

  // ── Risk colour helper ─────────────────────────────────────
  riskClass(level) {
    return { HIGH: 'risk-high', MEDIUM: 'risk-medium', LOW: 'risk-low' }[level] || '';
  },
  riskBadgeClass(level) {
    return { HIGH: 'danger', MEDIUM: 'warning', LOW: 'success' }[level] || 'secondary';
  },

  // ── Toast notifications (Bootstrap) ───────────────────────
  toast(message, type = 'info') {
    const id = 'toast-' + Date.now();
    const map = { success:'text-bg-success', danger:'text-bg-danger', info:'text-bg-info', warning:'text-bg-warning' };
    const el = document.createElement('div');
    el.innerHTML = `
      <div id="${id}" class="toast align-items-center ${map[type]||'text-bg-info'} border-0" role="alert" style="min-width:280px">
        <div class="d-flex">
          <div class="toast-body">${message}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>`;
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }
    container.appendChild(el.firstElementChild);
    const toast = new bootstrap.Toast(document.getElementById(id), { delay: 4000 });
    toast.show();
  },

  // ── Date formatting ────────────────────────────────────────
  formatDate(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  },
  formatDateTime(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-IN');
  },
};

// Expose as global `API` alias for backward compat with inline scripts
const API = {
  token:   () => AarogyaNet.getToken(),
  headers: () => AarogyaNet.headers(),
  get:     (url) => AarogyaNet.get(url),
  post:    (url, body) => AarogyaNet.post(url, body),
};
