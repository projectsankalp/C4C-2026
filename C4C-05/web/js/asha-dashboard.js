function firstName(full) {
  const n = (full || "Worker").trim();
  return n.split(/\s+/)[0] || "Worker";
}

function getInitials(name) {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function greetingByTime() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function riskBadgeClass(status) {
  if (status === "High Risk") return "bg-error-container text-on-error-container";
  if (status === "Low Risk" || status === "Normal") return "bg-secondary-container text-on-secondary-container";
  return "bg-surface-container-highest text-on-surface-variant";
}

function setAshaIdentity(name, village) {
  const full = name || localStorage.getItem("userName") || "ASHA Worker";
  const first = firstName(full);
  const greet = document.getElementById("ashaGreeting");
  const profile = document.getElementById("ashaProfileName");
  const role = document.getElementById("ashaProfileRole");
  if (greet) greet.textContent = `${greetingByTime()}, ${first}`;
  if (profile) profile.textContent = full;
  if (role) role.textContent = village ? `ASHA • ${village}` : "ASHA Worker";
}

if (!requireAuth(["ASHA"])) {
  // redirected by requireAuth
} else {
  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  // Show name immediately from login session
  setAshaIdentity(localStorage.getItem("userName"));

  async function loadAshaDashboard() {
    try {
      const res = await api.ashaDashboard();
      const d = res.data;

      if (d.asha_name) setAshaIdentity(d.asha_name, d.village);
      else setAshaIdentity(localStorage.getItem("userName"), d.village);

      const sub = document.getElementById("ashaSubGreeting");
      if (sub) {
        const n = d.pending_followups ?? 0;
        const place = d.village || "your assigned villages";
        sub.textContent = `You have ${n} follow-up visit${n === 1 ? "" : "s"} scheduled for today in ${place}.`;
      }

      const statMap = {
        total_patients: d.total_patients,
        home_visits: d.home_visits,
        pending_followups: d.pending_followups,
      };
      Object.entries(statMap).forEach(([key, val]) => {
        const el = document.querySelector(`[data-stat="${key}"]`);
        if (el != null && val != null) el.textContent = val;
      });

      const tbody = document.querySelector("table tbody");
      if (tbody && d.patients?.length) {
        tbody.innerHTML = d.patients
          .map((p) => {
            const initials = getInitials(p.name);
            const badge = riskBadgeClass(p.risk_status);
            return `<tr class="hover:bg-surface-container-lowest transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-xs">${initials}</div>
                  <span class="font-label-md">${p.name}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-body-sm">${p.village}</td>
              <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold ${badge}">${p.risk_status}</span>
              </td>
              <td class="px-6 py-4 text-body-sm text-on-surface-variant">${p.last_interaction}</td>
              <td class="px-6 py-4 text-right">
                <button type="button" class="p-2 hover:bg-surface-container rounded-full transition-colors" aria-label="Patient options">
                  <span class="material-symbols-outlined text-on-surface-variant">more_vert</span>
                </button>
              </td>
            </tr>`;
          })
          .join("");
      }
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  document.querySelectorAll("header button").forEach((btn) => {
    const icon = btn.querySelector(".material-symbols-outlined");
    if (icon?.textContent?.trim() === "dark_mode") {
      btn.addEventListener("click", () => document.documentElement.classList.toggle("dark"));
    }
  });

  initThemeToggle();
  loadAshaDashboard();
}
