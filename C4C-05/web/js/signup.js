function wireSignup(role) {
  const form = document.getElementById("signupForm");
  if (!form) return;

  document.querySelector('a[href="#"]')?.setAttribute("href", "/login.html");
  const loginLink = document.querySelector("p a.text-primary");
  if (loginLink) loginLink.href = "/login.html";

  const phoneField = document.getElementById("phone");
  if (!phoneField) {
    const emailWrap = document.getElementById("email")?.closest(".space-y-1");
    if (emailWrap) {
      const div = document.createElement("div");
      div.className = "space-y-1";
      div.innerHTML = `<label class="block font-label-md text-on-surface-variant ml-1" for="phone">Phone Number</label>
        <div class="relative group"><span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">call</span>
        <input class="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none" id="phone" type="tel" placeholder="+91 98765 43210" required /></div>`;
      emailWrap.parentNode.insertBefore(div, emailWrap);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      await api.register({
        name: document.getElementById("fullName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        password: document.getElementById("password").value,
        role,
      });
      showToast("Account created! Please login.", "success");
      setTimeout(() => (window.location.href = "/login.html"), 1200);
    } catch (err) {
      showToast(err.message, "error");
      btn.disabled = false;
    }
  });
}

function togglePassword() {
  const passwordInput = document.getElementById("password");
  const eyeIcon = document.getElementById("eyeIcon");
  if (!passwordInput) return;
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    if (eyeIcon) eyeIcon.textContent = "visibility_off";
  } else {
    passwordInput.type = "password";
    if (eyeIcon) eyeIcon.textContent = "visibility";
  }
}

window.togglePassword = togglePassword;
