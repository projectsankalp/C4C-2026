const API_URL = window.location.port === "3001" ? "http://localhost:5000/api" : "/api";
const WEB_URL = window.location.origin.replace(/:\d+$/, ":3000");
const STORAGE_KEY = "hastkala_community_console_v1";

const productImages = [
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1606722590730-421c45f6d2fe?auto=format&fit=crop&w=900&q=80",
];

const initialData = {
  isLoggedIn: false,
  headName: "Rekha Devi",
  clusterName: "Dakshina Kannada Federation",
  liveApi: false,
  selectedListingId: "p1",
  selectedMemberId: "a2",
  listings: [
    {
      id: "p1",
      title: "Handmade Coconut Shell Lamp",
      artisanId: "a1",
      artisanName: "Lakshmi",
      phone: "+91 98765 43210",
      village: "Ullal",
      shgName: "Coastal Sakhi Group",
      category: "Coconut Shell",
      price: 600,
      quantity: 2,
      material: "Polished coconut shell, brass fitting",
      channel: "whatsapp",
      language: "Kannada",
      aiConfidence: 86,
      status: "pending_approval",
      imageUrl: productImages[0],
      originalMessage: "coconut shell lamp, handmade, 600 price, 2 items.",
      description:
        "Eco-friendly coconut shell lamp crafted by women artisans from the coastal cluster.",
      submittedAt: "2026-05-25T10:30:00Z",
      reviewChecks: { image: false, handmade: false, price: false, member: true },
    },
    {
      id: "p2",
      title: "Terracotta Festival Diya Set",
      artisanId: "a2",
      artisanName: "Savitha",
      phone: "+91 94321 09876",
      village: "Channapatna",
      shgName: "Clay Creators SHG",
      category: "Terracotta",
      price: 250,
      quantity: 15,
      material: "Terracotta clay, natural pigment",
      channel: "whatsapp",
      language: "Hindi",
      aiConfidence: 72,
      status: "pending_approval",
      imageUrl: productImages[1],
      originalMessage: "Diya sets clay, 250 rupees, 15 count available.",
      description: "Traditional hand-painted clay diyas for festival gifting and decor.",
      submittedAt: "2026-05-25T09:15:00Z",
      reviewChecks: { image: false, handmade: false, price: false, member: false },
    },
    {
      id: "p3",
      title: "Banana Fiber Basket Set",
      artisanId: "a3",
      artisanName: "Asha",
      phone: "+91 91234 56789",
      village: "Hunsur",
      shgName: "Mysore Fiber Sakhis",
      category: "Banana Fiber",
      price: 350,
      quantity: 4,
      material: "Banana fiber",
      channel: "web",
      language: "Kannada",
      aiConfidence: 91,
      status: "pending_approval",
      imageUrl: productImages[2],
      originalMessage: "banana fiber baskets, 4 sets, 350 cost.",
      description: "Durable organic banana fiber storage baskets handwoven by cluster artisans.",
      submittedAt: "2026-05-24T18:00:00Z",
      reviewChecks: { image: true, handmade: false, price: true, member: false },
    },
    {
      id: "p4",
      title: "Handwoven Cotton Tote Bag",
      artisanId: "a4",
      artisanName: "Meena",
      phone: "+91 90123 45678",
      village: "Saligrama",
      shgName: "Kaveri Weaver Cluster",
      category: "Textiles",
      price: 450,
      quantity: 8,
      material: "Cotton threads, natural dye",
      channel: "web",
      language: "Kannada",
      aiConfidence: 89,
      status: "approved",
      imageUrl: productImages[3],
      originalMessage: "Cotton bag hand woven, 450 cost, 8 ready to buy",
      description: "Durable handwoven cotton tote bag with ethnic border weaving.",
      submittedAt: "2026-05-23T14:20:00Z",
      approvedAt: "2026-05-23T16:10:00Z",
      reviewChecks: { image: true, handmade: true, price: true, member: true },
    },
  ],
  members: [
    {
      id: "a1",
      name: "Lakshmi",
      phone: "+91 98765 43210",
      village: "Ullal",
      district: "Dakshina Kannada",
      shgName: "Coastal Sakhi Group",
      craftType: "Coconut Shell Craft",
      language: "Kannada",
      yearsExperience: 8,
      verified: true,
      certificateCode: "HAST-DK-2026-014",
      joinedAt: "2026-05-20T09:00:00Z",
      checks: { phone: true, shg: true, sample: true, consent: true },
      story: "Makes coconut shell lamps and home decor, supporting her children's education.",
    },
    {
      id: "a2",
      name: "Savitha",
      phone: "+91 94321 09876",
      village: "Channapatna",
      district: "Ramanagara",
      shgName: "Clay Creators SHG",
      craftType: "Terracotta Craft",
      language: "Hindi",
      yearsExperience: 5,
      verified: false,
      certificateCode: "",
      joinedAt: "2026-05-24T18:00:00Z",
      checks: { phone: false, shg: false, sample: false, consent: true },
      story: "Learned terracotta art at a district training camp and now runs a home studio.",
    },
    {
      id: "a3",
      name: "Asha",
      phone: "+91 91234 56789",
      village: "Hunsur",
      district: "Mysuru",
      shgName: "Mysore Fiber Sakhis",
      craftType: "Banana Fiber Weaving",
      language: "Kannada",
      yearsExperience: 3,
      verified: false,
      certificateCode: "",
      joinedAt: "2026-05-25T08:00:00Z",
      checks: { phone: true, shg: false, sample: false, consent: true },
      story: "Creates functional household products after banana fiber training.",
    },
    {
      id: "a4",
      name: "Meena",
      phone: "+91 90123 45678",
      village: "Saligrama",
      district: "Udupi",
      shgName: "Kaveri Weaver Cluster",
      craftType: "Handloom Textiles",
      language: "Kannada",
      yearsExperience: 12,
      verified: true,
      certificateCode: "HAST-UD-2026-009",
      joinedAt: "2026-05-18T11:00:00Z",
      checks: { phone: true, shg: true, sample: true, consent: true },
      story: "Inherited handloom weaving from her mother and specializes in natural dyes.",
    },
  ],
  activity: [
    {
      id: "act1",
      type: "listing",
      title: "Lakshmi submitted Coconut Shell Lamp via WhatsApp",
      detail: "Awaiting image, handmade, and price verification checks.",
      time: "20m ago",
    },
    {
      id: "act2",
      type: "member",
      title: "Asha joined the community",
      detail: "SHG and craft sample verification pending.",
      time: "2h ago",
    },
    {
      id: "act3",
      type: "certificate",
      title: "Certificate issued to Lakshmi",
      detail: "HAST-DK-2026-014 generated by Rekha Devi.",
      time: "1d ago",
    },
  ],
};

let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && saved.listings && saved.members) return saved;
  } catch {
    // Use defaults.
  }
  return structuredClone(initialData);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function login() {
  state.isLoggedIn = true;
  state.headName = document.getElementById("login-name").value.trim() || state.headName;
  state.clusterName = document.getElementById("login-cluster").value.trim() || state.clusterName;
  saveState();
  document.getElementById("login-screen").classList.add("is-hidden");
  document.getElementById("app").classList.remove("is-hidden");
  await refreshData();
}

function logout() {
  state.isLoggedIn = false;
  saveState();
  document.getElementById("app").classList.add("is-hidden");
  document.getElementById("login-screen").classList.remove("is-hidden");
  toast("Logged out of Community Head Console.");
}

async function refreshData() {
  const connected = await checkApiConnection();
  if (connected) await syncFromApi();
  render();
  toast(connected ? "Live API data refreshed." : "Demo data loaded. Backend is offline.");
}

async function checkApiConnection() {
  try {
    const res = await fetch(`${API_URL}/health`, { method: "GET" });
    const json = await res.json();
    state.liveApi = Boolean(res.ok && json.success);
  } catch {
    state.liveApi = false;
  }
  saveState();
  return state.liveApi;
}

async function syncFromApi() {
  try {
    const [pendingRes, productsRes, artisansRes, communityRes] = await Promise.all([
      fetch(`${API_URL}/vendor/products/pending`),
      fetch(`${API_URL}/products?limit=100`),
      fetch(`${API_URL}/vendor/artisans`),
      fetch(`${API_URL}/community/members?status=all`),
    ]);
    const [pendingJson, productsJson, artisansJson, communityJson] = await Promise.all([
      pendingRes.json(),
      productsRes.json(),
      artisansRes.json(),
      communityRes.json(),
    ]);

    if (pendingJson.success && productsJson.success) {
      const pending = (pendingJson.data || []).map(mapApiProduct);
      const approved = (productsJson.data?.products || []).map(mapApiProduct);
      state.listings = mergeById(
        [...pending, ...approved],
        state.listings.filter((item) => item.status === "rejected"),
      );
    }

    // Members tab is sourced from community_members (the bot writes here on
    // onboarding). Artisan rows are merged in only if a community member with
    // that phone is already certified — they share the same row by phone.
    if (communityJson.success) {
      const artisanByPhone = new Map(
        ((artisansJson.success && artisansJson.data) || [])
          .filter((a) => a.phone)
          .map((a) => [a.phone, a]),
      );
      state.members = (communityJson.data || []).map((m) => {
        const artisan = m.phone ? artisanByPhone.get(m.phone) : null;
        const language = m.language || artisan?.language || "en";
        const district = m.location || artisan?.district || "Unknown";
        const skills = m.skills || artisan?.craftType || "Handmade Crafts";
        return {
          // Use community_member id — that's what /community/certify/:id wants.
          id: m.id,
          memberId: m.id,
          artisanId: artisan?.id || null,
          name: m.name || `Member ${String(m.phone || "").slice(-4)}`,
          phone: m.phone || "",
          village: artisan?.village || district,
          district,
          shgName: artisan?.shgName || "—",
          craftType: skills,
          language,
          yearsExperience: artisan?.yearsExperience || 1,
          verified: Boolean(m.isCertified),
          certificateCode: artisan?.certificateCode || "",
          joinedAt: m.createdAt || new Date().toISOString(),
          stage: m.stage || "learn",
          points: typeof m.points === "number" ? m.points : 0,
          source: m.source || "whatsapp",
          // Cohort-completion is the trust gate. Once a community member shows
          // up here, they've already been vetted by the community team — no
          // further per-row checks needed. Keep `checks` for back-compat with
          // any UI bits that still read it.
          checks: { phone: Boolean(m.phone), shg: true, sample: true, consent: true },
          story: artisan?.story || `Community member · ${skills} · ${district}`,
        };
      });
    } else if (artisansJson.success) {
      // Fallback: if the community endpoint fails, fall back to the legacy
      // artisans-only view so the page still renders something.
      state.members = (artisansJson.data || []).map((a) => ({
        id: a.id,
        memberId: null,
        artisanId: a.id,
        name: a.name || `Artisan ${String(a.phone || "").slice(-4)}`,
        phone: a.phone || "",
        village: a.village || "Unknown",
        district: a.district || "Unknown",
        shgName: a.shgName || "Unassigned SHG",
        craftType: a.craftType || "Handmade Crafts",
        language: a.language || "en",
        yearsExperience: a.yearsExperience || 1,
        verified: Boolean(a.isVerified),
        certificateCode: a.certificateCode || "",
        joinedAt: a.createdAt || new Date().toISOString(),
        stage: a.isVerified ? "seller" : "learn",
        points: 0,
        source: "manual",
        checks: {
          phone: Boolean(a.phone),
          shg: Boolean(a.shgName),
          sample: Boolean(a.craftType),
          consent: true,
        },
        story: a.story || "Community artisan profile synced from backend.",
      }));
    }
  } catch {
    state.liveApi = false;
  }
}

function mapApiProduct(p) {
  return {
    id: p.id,
    title: p.title,
    artisanId: p.artisanId,
    artisanName: p.artisan?.name || "Unknown artisan",
    phone: p.artisan?.phone || "",
    village: p.artisan?.village || "Unknown",
    shgName: p.artisan?.shgName || "Unassigned SHG",
    category: p.category || "Handmade Crafts",
    price: Number(p.price || 0),
    quantity: Number(p.quantity || 1),
    material: p.material || p.tags?.[0] || "",
    channel: p.submittedVia || "whatsapp",
    language: p.artisan?.language || "en",
    aiConfidence: p.aiGenerated ? 88 : 74,
    status: p.status,
    imageUrl: p.imageUrl || productImages[0],
    originalMessage: p.rawMessage || p.description || "",
    description: p.description || "",
    submittedAt: p.createdAt || new Date().toISOString(),
    reviewChecks: {
      image: Boolean(p.imageUrl),
      handmade: false,
      price: Boolean(p.price),
      member: Boolean(p.artisan?.isVerified),
    },
  };
}

function mergeById(items) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function render() {
  document.getElementById("head-name").textContent = state.headName;
  document.getElementById("head-cluster").textContent = state.clusterName;
  renderApiStatus();
  renderMetrics();
  renderReadiness();
  renderListings();
  renderMembers();
  renderCertificates();
  renderActivity();
}

function renderApiStatus() {
  const pill = document.getElementById("api-pill");
  pill.classList.toggle("live", state.liveApi);
  document.getElementById("api-label").textContent = state.liveApi
    ? "Live API connected"
    : "Demo mode";
}

function getMetrics() {
  const pendingListings = state.listings.filter(
    (item) => item.status === "pending_approval",
  ).length;
  const pendingMembers = state.members.filter((member) => !member.verified).length;
  const certified = state.members.filter((member) => member.verified).length;
  const liveProducts = state.listings.filter((item) => item.status === "approved").length;
  return { pendingListings, pendingMembers, certified, liveProducts };
}

function renderMetrics() {
  const metrics = [
    ["Members pending", getMetrics().pendingMembers, "Need identity and SHG checks"],
    ["Certified artisans", getMetrics().certified, "Eligible for marketplace listing"],
    ["Listings pending", getMetrics().pendingListings, "Need product review"],
    ["Live products", getMetrics().liveProducts, "Published on HastKala Haat"],
  ];
  document.getElementById("metric-grid").innerHTML = metrics
    .map(
      ([label, value, helper]) => `
        <article class="metric-card">
          <span>${label}</span>
          <strong>${value}</strong>
          <p>${helper}</p>
        </article>
      `,
    )
    .join("");
  document.getElementById("listing-count").textContent = getMetrics().pendingListings;
  document.getElementById("member-count").textContent = getMetrics().pendingMembers;
}

function renderReadiness() {
  const waitingPhone = state.members.filter((m) => !m.verified && !m.checks.phone).length;
  const waitingShg = state.members.filter((m) => !m.verified && !m.checks.shg).length;
  const waitingSample = state.members.filter((m) => !m.verified && !m.checks.sample).length;
  const rows = [
    ["Phone identity", waitingPhone, "Call or WhatsApp verification not complete."],
    ["SHG confirmation", waitingShg, "Community group record needs approval."],
    ["Craft sample", waitingSample, "Sample product review needed before certificate."],
  ];
  document.getElementById("readiness-list").innerHTML = rows
    .map(
      ([label, count, detail]) => `
        <div class="readiness-item">
          <h4>${count} waiting for ${label}</h4>
          <p>${detail}</p>
        </div>
      `,
    )
    .join("");
}

function renderListings() {
  const query = document.getElementById("listing-search")?.value.toLowerCase() || "";
  const status = document.getElementById("listing-status")?.value || "pending_approval";
  const channel = document.getElementById("listing-channel")?.value || "all";
  const rows = state.listings.filter((item) => {
    const haystack =
      `${item.title} ${item.artisanName} ${item.category} ${item.village}`.toLowerCase();
    return (
      haystack.includes(query) &&
      (status === "all" || item.status === status) &&
      (channel === "all" || item.channel === channel)
    );
  });
  const selected = rows.find((item) => item.id === state.selectedListingId) || rows[0];

  document.getElementById("listing-table").innerHTML =
    rows.length === 0
      ? emptyRow("No listings match these filters.")
      : rows.map((item) => listingRow(item, selected?.id === item.id)).join("");
  renderListingDetail(selected || rows[0]);
}

function listingRow(item, selected) {
  return `
    <button class="queue-row ${selected ? "selected" : ""}" type="button" onclick="selectListing('${item.id}')">
      <img class="thumb" src="${item.imageUrl}" alt="${item.title}" />
      <div>
        <p class="row-title">${item.title}</p>
        <div class="row-meta">
          <span>${item.artisanName}</span>
          <span>${item.village}</span>
          <span>Rs.${item.price}</span>
          <span>${item.quantity} pcs</span>
        </div>
      </div>
      <div class="row-action">
        ${statusBadge(item.status)}
        <span class="badge ${item.channel === "whatsapp" ? "green" : "blue"}">${item.channel}</span>
      </div>
    </button>
  `;
}

function renderListingDetail(item) {
  const target = document.getElementById("listing-detail");
  if (!item) {
    target.className = "detail-panel empty";
    target.innerHTML = "Select a listing to review.";
    return;
  }
  state.selectedListingId = item.id;
  target.className = "detail-panel";
  const checks = item.reviewChecks;
  target.innerHTML = `
    <img class="detail-hero" src="${item.imageUrl}" alt="${item.title}" />
    <h3>${item.title}</h3>
    <p class="muted">${item.description}</p>
    <div class="facts">
      <div class="fact"><span>Artisan</span><strong>${item.artisanName}</strong></div>
      <div class="fact"><span>AI confidence</span><strong>${item.aiConfidence}%</strong></div>
      <div class="fact"><span>Price</span><strong>Rs.${item.price}</strong></div>
      <div class="fact"><span>Quantity</span><strong>${item.quantity}</strong></div>
    </div>
    <label class="muted">Original ${item.language} submission</label>
    <textarea id="listing-original">${item.originalMessage}</textarea>
    <div class="facts">
      <label class="fact"><span>Title</span><input id="edit-title" value="${escapeAttr(item.title)}" /></label>
      <label class="fact"><span>Price</span><input id="edit-price" type="number" value="${item.price}" /></label>
    </div>
    <div class="checklist">
      ${check("image", "Image is clear and product-led", checks.image)}
      ${check("handmade", "Handmade craft quality reviewed", checks.handmade)}
      ${check("price", "Price and quantity are reasonable", checks.price)}
      ${check("member", "Member is certified or ready for certification", checks.member)}
    </div>
    <div class="action-row">
      <button class="success-action" type="button" onclick="approveListing('${item.id}')">
        <span class="material-symbols-outlined">publish</span>
        Approve Listing
      </button>
      <button class="danger-action" type="button" onclick="rejectListing('${item.id}')">
        <span class="material-symbols-outlined">undo</span>
        Send Back
      </button>
    </div>
  `;
}

function check(name, label, checked) {
  return `<label><input type="checkbox" data-check="${name}" ${checked ? "checked" : ""} onchange="updateListingCheck('${name}', this.checked)" /> ${label}</label>`;
}

function renderMembers() {
  const query = document.getElementById("member-search")?.value.toLowerCase() || "";
  const status = document.getElementById("member-status")?.value || "pending";
  const rows = state.members.filter((member) => {
    const haystack =
      `${member.name} ${member.village} ${member.shgName} ${member.craftType}`.toLowerCase();
    return (
      haystack.includes(query) && (status === "all" || (status === "verified") === member.verified)
    );
  });
  const selected = rows.find((member) => member.id === state.selectedMemberId) || rows[0];

  document.getElementById("member-table").innerHTML =
    rows.length === 0
      ? emptyRow("No members match these filters.")
      : rows.map((m) => memberRow(m, selected?.id === m.id)).join("");
  renderMemberDetail(selected || rows[0]);
}

function memberRow(member, selected) {
  return `
    <button class="queue-row ${selected ? "selected" : ""}" type="button" onclick="selectMember('${member.id}')">
      <span class="avatar">${initials(member.name)}</span>
      <div>
        <p class="row-title">${member.name}</p>
        <div class="row-meta">
          <span>${member.village}</span>
          <span>${member.shgName}</span>
          <span>${member.craftType}</span>
        </div>
      </div>
      <div class="row-action">
        ${member.verified ? '<span class="badge green">Certified</span>' : '<span class="badge amber">Pending</span>'}
      </div>
    </button>
  `;
}

function renderMemberDetail(member) {
  const target = document.getElementById("member-detail");
  if (!member) {
    target.className = "detail-panel empty";
    target.innerHTML = "Select a member to certify.";
    return;
  }
  state.selectedMemberId = member.id;
  target.className = "detail-panel";
  target.innerHTML = `
    <span class="avatar">${initials(member.name)}</span>
    <h3>${member.name}</h3>
    <p class="muted">${member.story}</p>
    <div class="facts">
      <div class="fact"><span>Phone</span><strong>${member.phone}</strong></div>
      <div class="fact"><span>Village</span><strong>${member.village}</strong></div>
      <div class="fact"><span>SHG</span><strong>${member.shgName}</strong></div>
      <div class="fact"><span>Craft</span><strong>${member.craftType}</strong></div>
    </div>
    <div class="checklist">
      ${memberCheck("phone", "Phone identity confirmed", member.checks.phone)}
      ${memberCheck("shg", "SHG or federation record confirmed", member.checks.shg)}
      ${memberCheck("sample", "Craft sample reviewed", member.checks.sample)}
      ${memberCheck("consent", "Consent for listing and alerts recorded", member.checks.consent)}
    </div>
    ${
      member.verified
        ? `<div class="certificate-issued">
            <span class="certificate-code">${member.certificateCode}</span>
            <a class="ghost-action" href="${certificateUrl(member)}" target="_blank" rel="noopener">
              <span class="material-symbols-outlined">open_in_new</span>
              View Certificate
            </a>
          </div>`
        : `<div class="action-row">
            <button class="success-action" type="button" onclick="certifyMember('${member.id}')">
              <span class="material-symbols-outlined">workspace_premium</span>
              Approve Member & Generate Certificate
            </button>
            <button class="ghost-action" type="button" onclick="rejectMemberPrompt('${member.id}')">
              <span class="material-symbols-outlined">close</span>
              Decline
            </button>
          </div>`
    }
  `;
}

function memberCheck(name, label, checked) {
  return `<label><input type="checkbox" data-member-check="${name}" ${checked ? "checked" : ""} onchange="updateMemberCheck('${name}', this.checked)" /> ${label}</label>`;
}

function renderCertificates() {
  const certified = state.members.filter((member) => member.verified);
  document.getElementById("certificate-list").innerHTML =
    certified.length === 0
      ? emptyRow("No certificates have been issued yet.")
      : `
        <div class="certificate-row certificate-head" aria-hidden="true">
          <span>Member</span>
          <span>Craft</span>
          <span>Certificate</span>
          <span>Issued</span>
          <span>Actions</span>
        </div>
        ${certified
          .map(
            (member) => `
              <article class="certificate-row">
                <div>
                  <strong>${member.name}</strong>
                  <small>${member.village} · ${member.phone}</small>
                </div>
                <span>${member.craftType}</span>
                <span class="certificate-code">${member.certificateCode}</span>
                <span>${formatDate(member.certifiedAt || member.joinedAt)}</span>
                <div class="certificate-actions">
                  <a class="ghost-action" href="${certificateUrl(member)}" target="_blank" rel="noopener">
                    <span class="material-symbols-outlined">open_in_new</span>
                    View Certificate
                  </a>
                </div>
              </article>
            `,
          )
          .join("")}
      `;
}

function renderActivity() {
  document.getElementById("activity-list").innerHTML = state.activity
    .map(
      (item) => `
        <article class="activity-item">
          <span class="badge ${item.type === "certificate" ? "green" : item.type === "member" ? "amber" : "blue"}">${item.type}</span>
          <h4>${item.title}</h4>
          <p>${item.detail}</p>
          <p>${item.time}</p>
        </article>
      `,
    )
    .join("");
}

function selectListing(id) {
  state.selectedListingId = id;
  saveState();
  renderListings();
}

function selectMember(id) {
  state.selectedMemberId = id;
  saveState();
  renderMembers();
}

function getSelectedListing() {
  return state.listings.find((item) => item.id === state.selectedListingId);
}

function getSelectedMember() {
  return state.members.find((member) => member.id === state.selectedMemberId);
}

function updateListingCheck(name, value) {
  const item = getSelectedListing();
  if (!item) return;
  item.reviewChecks[name] = value;
  saveState();
}

function updateMemberCheck(name, value) {
  const member = getSelectedMember();
  if (!member) return;
  member.checks[name] = value;
  saveState();
}

function rejectMemberPrompt(id) {
  const member = state.members.find((m) => m.id === id);
  if (!member) return;
  const reason = window.prompt(
    `Decline ${member.name}?\n\nOptional reason (sent to seller via WhatsApp):`,
    "Couldn't verify your details — please retry onboarding from WhatsApp.",
  );
  if (reason === null) return; // user cancelled
  rejectMember(id, reason || undefined);
}

async function approveListing(id) {
  const item = state.listings.find((listing) => listing.id === id);
  if (!item) return;
  const allChecked = Object.values(item.reviewChecks).every(Boolean);
  if (!allChecked) {
    toast("Complete all listing checks before approval.");
    return;
  }

  item.title = document.getElementById("edit-title").value.trim() || item.title;
  item.price = Number(document.getElementById("edit-price").value || item.price);

  if (state.liveApi) {
    try {
      await fetch(`${API_URL}/vendor/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: item.title, price: item.price }),
      });
      await fetch(`${API_URL}/vendor/products/${id}/approve`, { method: "PATCH" });
    } catch {
      state.liveApi = false;
    }
  }

  item.status = "approved";
  item.approvedAt = new Date().toISOString();
  addActivity(
    "listing",
    `Approved listing: ${item.title}`,
    `${item.artisanName} can now sell this product on HastKala Haat.`,
  );
  saveState();
  render();
  toast("Listing approved and published.");
}

async function rejectListing(id) {
  const item = state.listings.find((listing) => listing.id === id);
  if (!item) return;
  if (state.liveApi) {
    try {
      await fetch(`${API_URL}/vendor/products/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Community head requested corrections" }),
      });
    } catch {
      state.liveApi = false;
    }
  }
  item.status = "rejected";
  addActivity(
    "listing",
    `Sent listing back: ${item.title}`,
    `WhatsApp correction request prepared for ${item.artisanName}.`,
  );
  saveState();
  render();
  toast("Listing returned for correction.");
}

async function certifyMember(id) {
  const member = state.members.find((item) => item.id === id);
  if (!member) return;
  if (member.verified) {
    toast("Already certified.");
    return;
  }
  // The community-cohort flow IS the verification step. Once a row shows up
  // in /api/community/members, the community team has already vetted them.
  // We don't gate on per-field checks anymore.
  if (state.liveApi && member.memberId) {
    try {
      const resp = await fetch(`${API_URL}/community/certify/${member.memberId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!resp.ok) {
        const txt = await resp.text();
        console.warn("[certify] non-200 from API:", resp.status, txt);
        toast("Certification API returned " + resp.status + " — check API logs.");
        return;
      }
    } catch (err) {
      console.warn("[certify] network error:", err);
      state.liveApi = false;
      toast("Could not reach API. Marked locally — please retry.");
    }
  } else if (state.liveApi && !member.memberId && member.phone) {
    // Legacy fallback: row came from /vendor/artisans (no community memberId).
    // Use the phone-keyed legacy /api/certify so the bot still gets pinged.
    try {
      await fetch(`${API_URL}/vendor/artisans/${id}/verify`, { method: "PATCH" });
      await fetch(`${API_URL}/certify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: member.phone }),
      });
    } catch {
      state.liveApi = false;
    }
  }
  member.verified = true;
  member.certificateCode = member.certificateCode || generateCertificateCode(member);
  member.certifiedAt = new Date().toISOString();
  state.listings
    .filter((item) => item.artisanId === member.id)
    .forEach((item) => {
      item.reviewChecks.member = true;
    });
  addActivity(
    "certificate",
    `Certificate issued to ${member.name}`,
    `${member.certificateCode} generated by ${state.headName}. WhatsApp notification sent.`,
  );
  saveState();
  render();
  toast("Member certified! WhatsApp notification sent to unlock their seller account.");
}

async function rejectMember(id, reason) {
  const member = state.members.find((item) => item.id === id);
  if (!member) return;
  if (member.verified) {
    toast("Already certified — cannot reject.");
    return;
  }
  if (state.liveApi && member.memberId) {
    try {
      const resp = await fetch(`${API_URL}/community/reject/${member.memberId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "Rejected by community head" }),
      });
      if (!resp.ok) {
        toast("Reject API returned " + resp.status);
        return;
      }
    } catch {
      state.liveApi = false;
    }
  }
  // Drop from the local list — backend stage="rejected" filters them out anyway.
  state.members = state.members.filter((m) => m.id !== id);
  addActivity(
    "certificate",
    `Rejected ${member.name}`,
    reason || `${state.headName} declined certification. WhatsApp decline message sent.`,
  );
  saveState();
  render();
  toast("Member declined. WhatsApp message sent.");
}

function simulateListing() {
  const id = `p_sim_${Date.now()}`;
  state.listings.unshift({
    id,
    title: "Handwoven Areca Leaf Tray",
    artisanId: "a3",
    artisanName: "Asha",
    phone: "+91 91234 56789",
    village: "Hunsur",
    shgName: "Mysore Fiber Sakhis",
    category: "Home Decor",
    price: 320,
    quantity: 6,
    material: "Areca leaf, natural fiber",
    channel: "whatsapp",
    language: "Kannada",
    aiConfidence: 94,
    status: "pending_approval",
    imageUrl: productImages[2],
    originalMessage: "areca tray handmade 320 rupees 6 ready",
    description: "Natural areca leaf serving tray for sustainable gifting.",
    submittedAt: new Date().toISOString(),
    reviewChecks: { image: true, handmade: false, price: true, member: false },
  });
  state.selectedListingId = id;
  addActivity(
    "listing",
    "New WhatsApp listing received",
    "Asha submitted an areca leaf tray through the bot.",
  );
  saveState();
  switchView("listings");
  render();
  toast("New WhatsApp listing added to approval queue.");
}

function exportCertificates() {
  const rows = ["name,phone,certificateCode,craftType,village"].concat(
    state.members
      .filter((member) => member.verified)
      .map((member) =>
        [member.name, member.phone, member.certificateCode, member.craftType, member.village].join(
          ",",
        ),
      ),
  );
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "hastkala-certificates.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function openFromPriority(view, id) {
  switchView(view);
  if (view === "listings") state.selectedListingId = id;
  if (view === "members") state.selectedMemberId = id;
  saveState();
  render();
}

function switchView(view) {
  document.querySelectorAll(".view").forEach((el) => el.classList.remove("active"));
  document.getElementById(`view-${view}`).classList.add("active");
  document
    .querySelectorAll(".nav-item")
    .forEach((el) => el.classList.toggle("active", el.dataset.view === view));
  const titles = {
    members: "Member approvals",
    listings: "Listing approvals",
    certificates: "Certificates",
    activity: "Audit trail",
  };
  const subtitles = {
    members: "Review member evidence, approve certification, and generate certificate records.",
    listings: "Approve product listings after image, price, craft, and member checks pass.",
    certificates: "Review issued certificate records and open the public certificate page.",
    activity: "Track recent admin actions across member approvals, listings, and certificates.",
  };
  document.getElementById("page-title").textContent = titles[view];
  document.getElementById("page-subtitle").textContent = subtitles[view];
}

function addActivity(type, title, detail) {
  state.activity.unshift({ id: `act_${Date.now()}`, type, title, detail, time: "Just now" });
}

function statusBadge(status) {
  if (status === "approved") return '<span class="badge green">Approved</span>';
  if (status === "rejected") return '<span class="badge red">Rejected</span>';
  return '<span class="badge amber">Pending</span>';
}

function emptyRow(text) {
  return `<div class="priority-item"><div><h4>${text}</h4><p>Try changing filters or refreshing data.</p></div></div>`;
}

function generateCertificateCode(member) {
  const district =
    member.district
      .slice(0, 2)
      .toUpperCase()
      .replace(/[^A-Z]/g, "HK") || "HK";
  const serial = String(state.members.filter((m) => m.verified).length + 1).padStart(3, "0");
  return `HAST-${district}-2026-${serial}`;
}

function initials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function escapeAttr(value) {
  return String(value).replace(/"/g, "&quot;");
}

function formatDate(value) {
  if (!value) return "Just now";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function certificateUrl(member) {
  return `${WEB_URL}/certificate/${member.id}`;
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2600);
}

document.addEventListener("click", (event) => {
  const navButton = event.target.closest(".nav-item");
  if (navButton) switchView(navButton.dataset.view);
});

document.addEventListener("input", (event) => {
  if (event.target.id?.startsWith("listing-")) renderListings();
  if (event.target.id?.startsWith("member-")) renderMembers();
});

document.addEventListener("change", (event) => {
  if (event.target.id?.startsWith("listing-")) renderListings();
  if (event.target.id?.startsWith("member-")) renderMembers();
});

document.addEventListener("DOMContentLoaded", async () => {
  if (state.isLoggedIn) {
    document.getElementById("login-screen").classList.add("is-hidden");
    document.getElementById("app").classList.remove("is-hidden");
    await refreshData();
  } else {
    render();
  }
});
