function saveSession(token, role, userId, name) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("userId", userId || "");
  localStorage.setItem("userName", name || "");
}

function clearSession() {
  ["token", "role", "userId", "userName"].forEach((k) => localStorage.removeItem(k));
}

function getRole() {
  return localStorage.getItem("role");
}

function requireAuth(allowedRoles) {
  const token = localStorage.getItem("token");
  const normalizedRole = (getRole() || "").toUpperCase();
  if (!token) {
    window.location.href = "/login.html";
    return false;
  }
  if (allowedRoles && !allowedRoles.map((r) => r.toUpperCase()).includes(normalizedRole)) {
    window.location.href = normalizedRole === "ASHA" ? "/dashboard/asha" : "/dashboard/user";
    return false;
  }
  return true;
}

function redirectAfterLogin(role) {
  const r = (role || "").toUpperCase();
  if (r === "ASHA") window.location.href = "/dashboard/asha";
  else window.location.href = "/dashboard/user";
}

function logout() {
  clearSession();
  window.location.href = "/login.html";
}

function initThemeToggle() {
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => document.documentElement.classList.toggle("dark"));
  });
}

function showToast(message, type = "info") {
  let el = document.getElementById("global-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "global-toast";
    el.className = "fixed top-4 right-4 z-[100] toast-enter";
    document.body.appendChild(el);
  }
  const colors =
    type === "error"
      ? "bg-error text-on-error"
      : type === "success"
        ? "bg-secondary text-on-secondary"
        : "bg-primary text-on-primary";
  el.innerHTML = `<div class="${colors} px-6 py-3 rounded-xl shadow-lg font-label-md">${message}</div>`;
  setTimeout(() => el.remove(), 4000);
}
