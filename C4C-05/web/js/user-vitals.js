if (!requireAuth(["USER"])) {
} else {
  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  initProfileModal();
  loadUserProfile();
  const nameInput = document.getElementById("v_name");
  if (nameInput && !nameInput.value) nameInput.value = localStorage.getItem("userName") || "";

  const riskColors = {
    "Low Risk": { ring: "#1b6d24", badge: "bg-secondary-container text-on-secondary-container" },
    "Medium Risk": { ring: "#005dac", badge: "bg-primary-fixed text-primary" },
    "High Risk": { ring: "#ba1a1a", badge: "bg-error-container text-error" },
  };

  function renderRiskChart(pct, level) {
    const canvas = document.getElementById("riskChart");
    if (!canvas || typeof Chart === "undefined") return;
    if (window._riskChart) window._riskChart.destroy();
    const color = riskColors[level]?.ring || "#005dac";
    window._riskChart = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: ["Risk", "Safe"],
        datasets: [
          {
            data: [pct, 100 - pct],
            backgroundColor: [color, "#e0e3e5"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        cutout: "75%",
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: true,
      },
    });
  }

  function renderFactorChart(factors) {
    const canvas = document.getElementById("factorChart");
    if (!canvas || typeof Chart === "undefined") return;
    if (window._factorChart) window._factorChart.destroy();
    const labels = Object.keys(factors).map((k) =>
      k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );
    window._factorChart = new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Contribution",
            data: Object.values(factors),
            backgroundColor: "#1976d2",
            borderRadius: 8,
          },
        ],
      },
      options: {
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: {
          x: { max: 45, grid: { color: "#f2f4f6" } },
          y: { grid: { display: false } },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  function showResults(result) {
    document.getElementById("resultsHint")?.classList.add("hidden");
    const panel = document.getElementById("resultsPanel");
    panel?.classList.remove("hidden");
    panel?.scrollIntoView({ behavior: "smooth", block: "start" });

    const pct = result.risk_percentage ?? (parseInt(result.score, 10) || 0);
    const level = result.level || "Low Risk";
    const colors = riskColors[level] || riskColors["Medium Risk"];

    document.getElementById("resultScore").textContent = result.score;
    document.getElementById("resultLevel").textContent = level;
    document.getElementById("resultLevel").className = `inline-block px-4 py-1 rounded-full text-sm font-label-md ${colors.badge}`;
    document.getElementById("resultDesc").textContent = result.desc;

    const stats = result.health_stats || {};
    document.getElementById("statBmi").textContent = stats.bmi ? `${stats.bmi} (${stats.bmi_category})` : "—";
    document.getElementById("statGlucose").textContent = stats.glucose
      ? `${stats.glucose} mg/dL — ${stats.glucose_status}`
      : "—";
    document.getElementById("statBp").textContent = stats.bp ? `${stats.bp} mmHg — ${stats.bp_status}` : "—";
    document.getElementById("statAge").textContent = stats.age ? `${stats.age} years` : "—";

    const recList = document.getElementById("recommendationsList");
    const lifeList = document.getElementById("lifestyleList");
    if (recList) {
      recList.innerHTML = (result.recommendations || [])
        .map((r) => `<li class="flex items-start gap-2 text-body-sm"><span class="material-symbols-outlined text-primary text-sm">check_circle</span>${r}</li>`)
        .join("");
    }
    if (lifeList) {
      lifeList.innerHTML = (result.lifestyle_suggestions || [])
        .map((r) => `<li class="flex items-start gap-2 text-body-sm"><span class="material-symbols-outlined text-secondary text-sm">eco</span>${r}</li>`)
        .join("");
    }

    renderRiskChart(pct, level);
    renderFactorChart(stats.risk_factors || {});
  }

  document.getElementById("diabetesForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("resultsHint")?.classList.add("hidden");
    const btn = document.getElementById("analyzeBtn");
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Analyzing...';

    try {
      const result = await api.predict({
        name: document.getElementById("v_name").value,
        age: parseInt(document.getElementById("v_age").value, 10) || 30,
        gender: document.getElementById("v_gender").value,
        blood_group: document.getElementById("v_blood_group").value,
        weight: parseFloat(document.getElementById("v_weight").value) || 0,
        height: parseFloat(document.getElementById("v_height").value) || 170,
        bp: parseFloat(document.getElementById("v_bp").value) || 0,
        glucose: parseFloat(document.getElementById("v_glucose").value) || 0,
        family_history: document.getElementById("v_family_history").value === "yes",
        smoking: document.getElementById("v_smoking").value === "yes",
        activity: document.getElementById("v_activity").value,
      });
      showResults(result);
      showToast("Health analysis complete", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
    btn.disabled = false;
    btn.innerHTML = orig;
  });

  initThemeToggle();
}
