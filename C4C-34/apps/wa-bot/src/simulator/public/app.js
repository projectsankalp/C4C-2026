/**
 * HastKala BolKeBecho — Simulator client.
 *
 * Browser fallback for the live WhatsApp demo. Drives the conversation engine
 * via /simulator/message, plus a few extras for an exceptional rehearsal:
 *   - Photo + voice-note buttons
 *   - One-click full-flow demo (calls /demo/run on the bot)
 *   - Live sessions panel
 */
(() => {
  const chat = document.getElementById("chat");
  const composer = document.getElementById("composer");
  const input = document.getElementById("composer-input");
  const imageBtn = document.getElementById("image-btn");
  const audioBtn = document.getElementById("audio-btn");
  const phoneInput = document.getElementById("phone-input");
  const stateReadout = document.getElementById("state-readout");
  const resetBtn = document.getElementById("reset-btn");
  const quickRow = document.getElementById("quick-row");
  const runDemoBtn = document.getElementById("run-demo-btn");
  const sessionsList = document.getElementById("sessions-list");
  const lastDraftDiv = document.getElementById("last-draft");

  const PLACEHOLDER_IMAGE =
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80";

  // -------------- helpers --------------

  function nowTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function formatBotText(text) {
    return escapeHtml(text)
      .replace(/\*([^*]+)\*/g, "<strong>$1</strong>")
      .replace(/_([^_]+)_/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }

  function appendBubble({ from, text, imageUrl, voiceNote }) {
    const bubble = document.createElement("div");
    bubble.className = `bubble ${from}`;

    if (voiceNote) {
      bubble.classList.add("voice-note");
      bubble.innerHTML = `
        <span class="voice-icon">🎙️</span>
        <div class="voice-bars">
          <span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
        <span class="voice-duration">0:08</span>
      `;
    } else if (imageUrl) {
      bubble.classList.add("image-thumb");
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = "Product photo";
      bubble.appendChild(img);
    } else {
      bubble.innerHTML = formatBotText(text);
    }

    const ts = document.createElement("span");
    ts.className = "timestamp";
    ts.textContent = nowTime();
    bubble.appendChild(ts);

    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight;
  }

  function setState(state) {
    if (state) stateReadout.textContent = state;
  }

  function updateLastReply(reply) {
    if (!reply || !reply.text) return;
    // Detect a draft confirmation in the text — quick-and-dirty preview card.
    const m = reply.text.match(/Product:\s*([^\n]+)\n💰\s*₹(\d+)/);
    if (m) {
      lastDraftDiv.classList.remove("muted-line");
      lastDraftDiv.innerHTML = `
        <div class="draft-title">${escapeHtml(m[1])}</div>
        <div class="draft-meta">₹${escapeHtml(m[2])}</div>
      `;
    }
  }

  async function api(path, options = {}) {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || "Server error");
    return json.data;
  }

  function getPhone() {
    return (phoneInput.value || "919876543210").replace(/\D/g, "");
  }

  // -------------- core send --------------

  async function send({ body = "", imageUrl, hasImage = false, hasAudio = false } = {}) {
    const phone = getPhone();

    if (hasAudio && !body) {
      appendBubble({ from: "user", voiceNote: true });
    } else if (imageUrl) {
      appendBubble({ from: "user", imageUrl });
    } else if (body) {
      appendBubble({ from: "user", text: body });
    }

    let replies = [];
    try {
      const data = await api("/simulator/message", {
        method: "POST",
        body: JSON.stringify({ phone, body, imageUrl, hasImage, hasAudio }),
      });
      replies = data.replies;
    } catch (err) {
      appendBubble({ from: "bot", text: `_Could not reach simulator: ${err.message}_` });
      return;
    }

    for (const reply of replies) {
      await new Promise((r) => setTimeout(r, 350));
      appendBubble({ from: "bot", text: reply.text });
      if (reply.state) setState(reply.state);
      updateLastReply(reply);
    }

    refreshSessions();
  }

  // -------------- composer + buttons --------------

  composer.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    await send({ body: text });
  });

  imageBtn.addEventListener("click", async () => {
    await send({ imageUrl: PLACEHOLDER_IMAGE, hasImage: true });
  });

  audioBtn.addEventListener("click", async () => {
    await send({ hasAudio: true });
  });

  quickRow.addEventListener("click", async (e) => {
    const target = e.target.closest("[data-quick]");
    if (!target) return;
    await send({ body: target.getAttribute("data-quick") });
  });

  resetBtn.addEventListener("click", async () => {
    chat.innerHTML = "";
    await send({ body: "RESET" });
  });

  // -------------- one-click full demo --------------

  runDemoBtn.addEventListener("click", async () => {
    runDemoBtn.disabled = true;
    runDemoBtn.textContent = "Running…";
    chat.innerHTML = "";
    setState("GREETING");

    try {
      const data = await api("/demo/run", {
        method: "POST",
        body: JSON.stringify({ phone: getPhone() }),
      });

      // The transcript walks through every step of first-time → seller → add-product.
      // Render the user's prompt as a bubble before each batch of bot replies.
      const stepCues = {
        "user-greeting": { text: "hi", from: "user" },
        "user-language": { text: "1", from: "user" },
        "user-role": { text: "1", from: "user" },
        "user-tutorial": { text: "1", from: "user" },
        "user-name": { text: "Lakshmi", from: "user" },
        "user-district": { text: "Dakshina Kannada", from: "user" },
        "user-craft": { text: "5", from: "user" },
        "user-shg": { text: "2", from: "user" },
        "user-sakhi": { text: "1", from: "user" },
        "user-add-product": { text: "1", from: "user" },
        "user-photo": { imageUrl: PLACEHOLDER_IMAGE, from: "user" },
        "user-done": { text: "DONE", from: "user" },
        "user-details": {
          text: "Handmade coconut shell lamp, ₹600, 2 pieces available",
          from: "user",
        },
        "user-confirm": { text: "1", from: "user" },
      };

      for (const step of data.transcript) {
        const cue = stepCues[step.step];
        if (cue) {
          appendBubble(cue);
          await new Promise((r) => setTimeout(r, 400));
        }
        for (const reply of step.replies) {
          appendBubble({ from: "bot", text: reply.text });
          if (reply.state) setState(reply.state);
          updateLastReply(reply);
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    } catch (err) {
      appendBubble({ from: "bot", text: `_Demo run failed: ${err.message}_` });
    } finally {
      runDemoBtn.disabled = false;
      runDemoBtn.textContent = "▶ Run full demo (one-click)";
      refreshSessions();
    }
  });

  // -------------- live sessions polling --------------

  async function refreshSessions() {
    try {
      const data = await api("/sessions");
      if (data.sessions.length === 0) {
        sessionsList.innerHTML = '<div class="muted-line">No active sessions</div>';
        return;
      }
      sessionsList.innerHTML = data.sessions
        .slice(0, 5)
        .map((s) => {
          const role = s.role ? ` · ${escapeHtml(s.role)}` : "";
          const name = s.name ? ` · ${escapeHtml(s.name)}` : "";
          return `
            <div class="session-row">
              <span class="phone-mask">${escapeHtml(s.phone)}${name}${role}</span>
              <span class="state-tag">${escapeHtml(s.state)}</span>
            </div>
          `;
        })
        .join("");
    } catch {
      // ignore polling errors
    }
  }

  setInterval(refreshSessions, 5000);

  // -------------- boot --------------

  appendBubble({
    from: "bot",
    text:
      "_Simulator ready._\n\nThis chat uses the same conversation engine as the real WhatsApp bot.\n\nClick *▶ Run full demo* on the right to see the canonical flow, or type *hi* to start manually.",
  });

  refreshSessions();
})();
