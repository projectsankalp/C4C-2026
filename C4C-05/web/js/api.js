const API_BASE = window.location.origin + "/api/v1";

async function apiRequest(path, options = {}) {
  const isForm = options.body instanceof FormData;
  const headers = { ...(options.headers || {}) };
  if (!isForm) headers["Content-Type"] = "application/json";
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, {
    ...options,
    headers,
    body: isForm ? options.body : options.body,
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.detail || data.message || "Request failed";
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return data;
}

const api = {
  register: (body) => apiRequest("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  userDashboard: () => apiRequest("/dashboard/user/me"),
  ashaDashboard: () => apiRequest("/dashboard/asha/me"),
  doctors: () => apiRequest("/doctors/"),
  patients: () => apiRequest("/patients/"),
  addPatient: (body) => apiRequest("/patients/analyze", { method: "POST", body: JSON.stringify(body) }),
  calls: () => apiRequest("/calls/"),
  predict: (body) => apiRequest("/prediction/", { method: "POST", body: JSON.stringify(body) }),
  chat: (message) => apiRequest("/chat/", { method: "POST", body: JSON.stringify({ message }) }),
  notifications: () => apiRequest("/notifications/"),
  profile: () => apiRequest("/users/me"),
  updateProfile: (formData) => apiRequest("/users/me", { method: "PATCH", body: formData }),
};
