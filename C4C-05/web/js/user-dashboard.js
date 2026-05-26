if (!requireAuth(["USER"])) {
} else {
  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  let leafletMap = null;
  let markerLayer = null;

  function updateRiskCard(risk) {
    const card = document.getElementById("riskCard");
    const scoreEl = document.getElementById("riskScore");
    const badge = document.getElementById("riskBadge");
    const sub = document.getElementById("riskSubtext");
    const iconWrap = document.getElementById("riskIconWrap");
    if (!card || !scoreEl) return;

    card.classList.remove("border-l-4", "border-error");
    scoreEl.classList.remove("text-error", "text-secondary", "text-primary");
    iconWrap?.classList.remove("bg-error/10", "bg-secondary/10", "bg-primary/10");
    badge?.classList.add("hidden");

    if (!risk?.has_analysis) {
      scoreEl.textContent = "—";
      scoreEl.classList.add("text-primary");
      iconWrap?.classList.add("bg-primary/10");
      if (sub) sub.textContent = "Complete analysis in Vitals";
      return;
    }

    scoreEl.textContent = `${risk.score}%`;
    if (sub) sub.textContent = risk.level || "Analyzed";

    if (risk.level === "High Risk") {
      card.classList.add("border-l-4", "border-error");
      scoreEl.classList.add("text-error");
      iconWrap?.classList.remove("bg-primary/10");
      iconWrap?.classList.add("bg-error/10");
      badge?.classList.remove("hidden");
    } else if (risk.level === "Medium Risk") {
      scoreEl.classList.add("text-primary");
      iconWrap?.classList.add("bg-primary/10");
    } else {
      scoreEl.classList.add("text-secondary");
      iconWrap?.classList.add("bg-secondary/10");
    }
  }

  function initLeafletMap(doctors) {
    const el = document.getElementById("leafletMap");
    if (!el || typeof L === "undefined") return;

    if (!leafletMap) {
      leafletMap = L.map("leafletMap").setView([28.6139, 77.209], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 18,
      }).addTo(leafletMap);
      markerLayer = L.layerGroup().addTo(leafletMap);
    }

    markerLayer.clearLayers();
    (doctors || []).forEach((doc) => {
      const lat = doc.location_lat || 28.61 + Math.random() * 0.05;
      const lng = doc.location_lng || 77.2 + Math.random() * 0.05;
      const color = doc.availability ? "#005dac" : "#717783";
      const marker = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: color,
        color: "#fff",
        weight: 2,
        fillOpacity: 0.9,
      }).addTo(markerLayer);
      marker.bindPopup(`<b>${doc.name}</b><br>${doc.specialization}<br>${doc.availability ? "Available" : "Busy"}`);
      marker.on("click", () => showDoctorCard(doc));
    });

    setTimeout(() => leafletMap.invalidateSize(), 200);
  }

  window.showDoctorCard = function (doc) {
    const card = document.getElementById("doctorCard");
    if (!card) return;
    card.innerHTML = `
      <div class="flex justify-between items-start mb-4">
        <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <span class="material-symbols-outlined text-primary text-3xl">medical_services</span>
        </div>
        <button type="button" class="text-on-surface-variant hover:text-error" onclick="toggleDoctorCard(false)">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <h4 class="font-headline-md leading-tight mb-1">${doc.name}</h4>
      <p class="text-label-sm text-on-surface-variant mb-2">${doc.qualification || ""} • ${doc.specialization}</p>
      <p class="text-xs mb-2">${doc.location || "Rural clinic"}</p>
      <p class="text-xs mb-4">Rating: ${doc.rating ?? "4.5"} • ${doc.experience ?? 5} yrs</p>
      <button class="w-full bg-primary text-white py-3 rounded-xl font-label-md">Book Consultation</button>`;
    toggleDoctorCard(true);
  };

  window.toggleDoctorCard = function (show) {
    const card = document.getElementById("doctorCard");
    if (!card) return;
    if (show) card.classList.remove("translate-y-full", "opacity-0");
    else card.classList.add("translate-y-full", "opacity-0");
  };

  window.toggleAIChat = function (show) {
    const chat = document.getElementById("aiChat");
    if (!chat) return;
    if (show) chat.classList.remove("translate-x-full");
    else chat.classList.add("translate-x-full");
  };

  window.sendPrompt = async function (text) {
    const content = document.getElementById("chatContent");
    if (!content) return;
    const userDiv = document.createElement("div");
    userDiv.className = "flex gap-3 justify-end";
    userDiv.innerHTML = `<div class="bg-primary text-white p-4 rounded-2xl rounded-tr-none max-w-[85%]"><p class="text-body-sm">${text}</p></div>`;
    content.appendChild(userDiv);
    try {
      const res = await api.chat(text);
      const aiDiv = document.createElement("div");
      aiDiv.className = "flex gap-3";
      aiDiv.innerHTML = `<div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><span class="material-symbols-outlined text-primary text-sm">smart_toy</span></div><div class="bg-surface-container-low p-4 rounded-2xl max-w-[85%]"><p class="text-body-sm">${res.response}</p></div>`;
      content.appendChild(aiDiv);
      content.scrollTop = content.scrollHeight;
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  async function loadDashboard() {
    try {
      const res = await api.userDashboard();
      const d = res.data;
      document.getElementById("appointmentsCount").textContent = String(
        d.upcoming_appointments?.length ?? 0
      );
      document.getElementById("doctorsCount").textContent = String(d.nearby_doctors ?? 0);
      document.getElementById("ashaCount").textContent = String(
        d.recent_asha_interactions?.length ?? 0
      );
      updateRiskCard(d.diabetes_risk_status);
      initLeafletMap(await api.doctors());
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  const chatSend = document.querySelector("#aiChat button .material-symbols-outlined");
  if (chatSend?.textContent.trim() === "send") {
    chatSend.closest("button")?.addEventListener("click", () => {
      const ta = document.querySelector("#aiChat textarea");
      if (ta?.value.trim()) {
        sendPrompt(ta.value.trim());
        ta.value = "";
      }
    });
  }

  initProfileModal();
  loadUserProfile();
  initThemeToggle();
  loadDashboard();
}
