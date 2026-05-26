function getInitials(name) {
  return (name || "U")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderProfileUI(user) {
  const name = user?.name || localStorage.getItem("userName") || "User";
  localStorage.setItem("userName", name);
  document.querySelectorAll("#userProfileName").forEach((el) => (el.textContent = name));

  const img = document.getElementById("profileAvatarImg");
  const icon = document.getElementById("profileAvatarIcon");
  const btn = document.getElementById("profileBtn");

  if (user?.avatar_url && img) {
    img.src = user.avatar_url;
    img.classList.remove("hidden");
    icon?.classList.add("hidden");
    if (btn) btn.classList.remove("bg-primary-fixed");
  } else {
    img?.classList.add("hidden");
    if (icon) {
      icon.classList.remove("hidden");
      icon.textContent = "person";
    }
    if (btn) {
      btn.classList.add("bg-primary-fixed", "text-primary");
      btn.title = name;
    }
  }
}

function initProfileModal() {
  const modal = document.getElementById("profileModal");
  const btn = document.getElementById("profileBtn");
  const closeBtn = document.getElementById("profileModalClose");
  const form = document.getElementById("profileForm");
  const preview = document.getElementById("profilePreview");
  const fileInput = document.getElementById("profilePhotoInput");

  btn?.addEventListener("click", () => {
    document.getElementById("profileNameInput").value =
      localStorage.getItem("userName") || "";
    const img = document.getElementById("profileAvatarImg");
    if (img?.src && !img.classList.contains("hidden")) {
      preview.src = img.src;
      preview.classList.remove("hidden");
    } else {
      preview.classList.add("hidden");
    }
    modal?.classList.remove("hidden");
  });

  closeBtn?.addEventListener("click", () => modal?.classList.add("hidden"));
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  fileInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
      preview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData();
    const name = document.getElementById("profileNameInput").value.trim();
    if (name) fd.append("name", name);
    const file = fileInput?.files?.[0];
    if (file) fd.append("avatar", file);
    try {
      const user = await api.updateProfile(fd);
      renderProfileUI(user);
      modal?.classList.add("hidden");
      showToast("Profile updated", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

async function loadUserProfile() {
  try {
    const user = await api.profile();
    renderProfileUI(user);
  } catch {
    renderProfileUI({ name: localStorage.getItem("userName") });
  }
}
