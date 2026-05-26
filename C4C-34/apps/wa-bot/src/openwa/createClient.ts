/**
 * WhatsApp client factory using whatsapp-web.js.
 *
 * Production hardening layers:
 *   1. LocalAuth session persistence — survive restarts without re-scanning the QR.
 *   2. Auto-reconnect — if WhatsApp Web disconnects, schedule a reinitialize().
 *   3. Watchdog — every 60s ping the page; if unresponsive 3x in a row, recover.
 *   4. Keepalive — periodic getState() call so WhatsApp Web doesn't idle the tab.
 *
 * NOTE: We migrated from Open-WA (abandoned) to whatsapp-web.js. This is still
 * UNOFFICIAL automation of WhatsApp Web. Use only with controlled test numbers
 * during the hackathon. Production needs the official WhatsApp Business Cloud API.
 */
import path from "path";
import fs from "fs";
import qrcode from "qrcode-terminal";
import { Client, LocalAuth } from "whatsapp-web.js";
import { config } from "../config";
import { log } from "../utils/logger";

const SESSION_DIR = path.resolve(__dirname, "..", "..", ".wwebjs_auth");

// Latest QR string from WhatsApp; null once authenticated or before first QR.
let latestQrString: string | null = null;
let latestQrTime: number | null = null;

export function getLatestQr(): { qr: string; receivedAt: number } | null {
  if (!latestQrString || !latestQrTime) return null;
  return { qr: latestQrString, receivedAt: latestQrTime };
}

const CANDIDATE_BROWSERS = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_PATH,
  process.env.GOOGLE_CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
];

function detectBrowserPath(): string | undefined {
  for (const candidate of CANDIDATE_BROWSERS) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

const KEEPALIVE_INTERVAL_MS = 60_000;
const WATCHDOG_INTERVAL_MS = 90_000;
const WATCHDOG_FAILURE_THRESHOLD = 3;

/** Module-level handles so we can manage timers across reconnects. */
let keepaliveTimer: NodeJS.Timeout | null = null;
let watchdogTimer: NodeJS.Timeout | null = null;
let watchdogFailures = 0;

/**
 * Boots the WhatsApp client. Returns once the client is fully `ready` (or
 * once `authenticated` plus a 30s grace timer fires, whichever comes first).
 *
 * After ready, installs:
 *   - keepalive: periodic getState() so the page doesn't idle.
 *   - watchdog: detects unresponsive pages and triggers reinitialize().
 *   - disconnect handler: schedules a reinitialize() with backoff.
 */
export async function createWhatsAppClient(): Promise<Client> {
  const executablePath = detectBrowserPath();

  const sessionFolder = path.join(SESSION_DIR, `session-${config.sessionId}`);
  const hasSavedSession = fs.existsSync(sessionFolder);

  log.info("WA_CLIENT_INIT", {
    sessionId: config.sessionId,
    headless: config.headless,
    browserStrategy: executablePath ? "system-chrome" : "puppeteer-bundled",
    executablePath,
    sessionDir: SESSION_DIR,
    hasSavedSession,
  });

  if (!hasSavedSession) {
    log.warn("WA_FIRST_TIME_SETUP", {
      hint:
        "No saved session found. A QR code will be printed below — scan it with the demo phone within 60 seconds. " +
        "After that, the session will persist and future restarts will skip the QR.",
    });
  } else {
    log.info("WA_RESUMING_SESSION", {
      hint: "Saved session detected. Skipping QR scan.",
    });
  }

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: config.sessionId,
      dataPath: SESSION_DIR,
    }),
    puppeteer: {
      headless: config.headless,
      executablePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
    },
    // Cache the WhatsApp Web build in case Meta breaks something. This way
    // a freshly-deployed broken WA Web build doesn't kill our session.
    webVersionCache: {
      type: "local",
      path: path.join(SESSION_DIR, "..", ".wwebjs_cache"),
    },
  });

  // ----- event wiring -----
  client.on("qr", (qr) => {
    latestQrString = qr;
    latestQrTime = Date.now();
    log.info("WA_QR_REQUESTED", {
      hint: "Open http://<host>/wabot/qr in a browser to scan, or check terminal below.",
    });
    qrcode.generate(qr, { small: true });
  });

  client.on("loading_screen", (percent, message) => {
    log.info("WA_LOADING", { percent, message });
  });

  client.on("authenticated", () => {
    latestQrString = null;
    latestQrTime = null;
    log.info("WA_AUTHENTICATED", {
      hint: "Session token saved. Future restarts will not require a QR scan.",
    });
  });

  client.on("auth_failure", (message) => {
    log.error("WA_AUTH_FAILURE", { message });
  });

  client.on("disconnected", async (reason) => {
    log.error("WA_DISCONNECTED_EXITING", {
      reason,
      hint: "WhatsApp disconnected. Exiting so supervisor restarts cleanly.",
    });
    stopWatchdogs();
    // Exit immediately — supervisor will respawn with a clean Chrome process.
    // In-place reconnect from this state is unreliable.
    process.exit(2);
  });

  client.on("change_state", (state) => {
    log.info("WA_STATE_CHANGED", { state });
  });

  // ----- start -----
  await new Promise<void>((resolve, reject) => {
    let resolved = false;
    let readyFired = false;

    const finish = (label: string) => {
      if (resolved) return;
      resolved = true;
      log.info("WA_CLIENT_READY", {
        sessionId: config.sessionId,
        via: label,
        info: client.info
          ? { wid: client.info.wid?._serialized, pushname: client.info.pushname }
          : undefined,
      });
      // Install reliability layer once we're ready (or close to it).
      startKeepalive(client);
      startWatchdog(client);
      resolve();
    };

    client.once("ready", () => {
      readyFired = true;
      finish("ready");
    });
    client.once("authenticated", () => {
      // Give `ready` a 120s grace period. If it doesn't fire, the page is stuck
      // in a weird state — message_create won't fire reliably. Exit the process
      // so the supervisor restarts us cleanly instead of running deaf.
      setTimeout(() => {
        if (readyFired) return;
        log.error("WA_READY_TIMEOUT_EXITING", {
          hint: "Authenticated but 'ready' did not fire within 120s. Exiting so supervisor restarts. If this persists, delete .wwebjs_auth/ and re-scan QR.",
        });
        // Exit code 2 → supervisor restarts with backoff
        process.exit(2);
      }, 120_000);
    });
    client.once("auth_failure", (m: string) => {
      if (resolved) return;
      resolved = true;
      reject(new Error(`WhatsApp auth failure: ${m}`));
    });

    client.initialize().catch((err) => {
      if (resolved) return;
      resolved = true;
      reject(err);
    });
  });

  return client;
}

// ---------------------------------------------------------------------------
// Reliability: keepalive + watchdog + auto-reconnect
// ---------------------------------------------------------------------------

function startKeepalive(client: Client): void {
  if (keepaliveTimer) clearInterval(keepaliveTimer);
  keepaliveTimer = setInterval(async () => {
    try {
      const state = await client.getState();
      log.debug("WA_KEEPALIVE", { state });
    } catch (error: any) {
      log.warn("WA_KEEPALIVE_FAILED", { message: error?.message });
    }
  }, KEEPALIVE_INTERVAL_MS);
  // Don't keep the process alive just for this timer.
  if (typeof keepaliveTimer.unref === "function") keepaliveTimer.unref();
}

function startWatchdog(client: Client): void {
  if (watchdogTimer) clearInterval(watchdogTimer);
  watchdogFailures = 0;
  watchdogTimer = setInterval(async () => {
    try {
      // Two-step probe: check state AND verify we can fetch chats.
      // Just getState() can return CONNECTED while the message_create listener
      // is broken — getChats() actually exercises the page.
      const state = await Promise.race([
        client.getState(),
        new Promise<string>((_, rej) =>
          setTimeout(() => rej(new Error("watchdog state timeout")), 10_000),
        ),
      ]);

      if (state !== "CONNECTED") {
        watchdogFailures += 1;
        log.warn("WA_WATCHDOG_BAD_STATE", { state, failures: watchdogFailures });
      } else {
        // Deeper probe: try to fetch chats. This forces the page to respond.
        await Promise.race([
          client.getChats(),
          new Promise<never>((_, rej) =>
            setTimeout(() => rej(new Error("watchdog getChats timeout")), 15_000),
          ),
        ]);
        // Both probes passed — reset failure counter
        watchdogFailures = 0;
      }
    } catch (error: any) {
      watchdogFailures += 1;
      log.warn("WA_WATCHDOG_PROBE_FAILED", {
        message: error?.message,
        failures: watchdogFailures,
      });
    }

    if (watchdogFailures >= WATCHDOG_FAILURE_THRESHOLD) {
      log.error("WA_WATCHDOG_TRIGGERING_EXIT", {
        failures: watchdogFailures,
        hint: "Bot is unresponsive. Exiting so supervisor restarts cleanly.",
      });
      stopWatchdogs();
      // Exit instead of in-place reconnect — supervisor will restart with
      // a clean Chrome process. In-place reconnect tends to fail in zombie state.
      process.exit(2);
    }
  }, WATCHDOG_INTERVAL_MS);
  if (typeof watchdogTimer.unref === "function") watchdogTimer.unref();
}

function stopWatchdogs(): void {
  if (keepaliveTimer) {
    clearInterval(keepaliveTimer);
    keepaliveTimer = null;
  }
  if (watchdogTimer) {
    clearInterval(watchdogTimer);
    watchdogTimer = null;
  }
  watchdogFailures = 0;
}
