/**
 * Main entry point — boots Open-WA + the internal HTTP server together.
 *
 * Boot order:
 *   1. Sanity-check env config.
 *   2. Start the internal HTTP server first (so the simulator endpoint and
 *      health probe come up immediately, even before WhatsApp is logged in).
 *   3. Initialize Open-WA. On QR-required, prompt user to scan with the demo number.
 *   4. Once Open-WA is ready, attach message handlers and register the client
 *      via the shared accessor so the order-alert endpoint can deliver.
 *
 * Failure modes are loud and recoverable:
 *   - If WhatsApp fails to start, the simulator + order-alert (logged) still work.
 *   - If the backend is unreachable, the bot falls back to USE_MOCK_DRAFT behavior
 *     when configured, otherwise tells the user politely and continues.
 */
import { config } from "./config";
import { log } from "./utils/logger";
import { buildInternalServer } from "./server/internalServer";
import { createWhatsAppClient } from "./openwa/createClient";
import { registerMessageHandler } from "./openwa/handlers";
import { setWhatsAppClient, getWhatsAppClient } from "./openwa/sharedClient";

function preflight(): void {
  const banner = `
╔════════════════════════════════════════════════════════════╗
║              HastKala BolKeBecho WhatsApp Bot              ║
║       Speak. Send a photo. List on the marketplace.        ║
╚════════════════════════════════════════════════════════════╝`;
  console.log(banner);
  log.info("BOOT_PREFLIGHT", {
    botName: config.botName,
    sessionId: config.sessionId,
    backend: config.backendUrl,
    internalPort: config.port,
    demoMode: config.demoMode,
    allowedNumbers: config.allowedTestNumbers.length,
    headless: config.headless,
    useMockDraft: config.useMockDraft,
  });

  if (config.demoMode && config.allowedTestNumbers.length === 0) {
    log.warn("DEMO_MODE_NO_ALLOWLIST", {
      hint: "DEMO_MODE=true but ALLOWED_TEST_NUMBERS is empty. The bot will respond to ANY incoming WhatsApp message. Add numbers to .env before running with a real phone.",
    });
  }
}

async function main() {
  preflight();

  // 1. Internal HTTP server (always available — comes up immediately).
  // Bind to 127.0.0.1 by default so /send-message and other internal
  // endpoints are only reachable from the same host (via nginx). Override
  // with HOST=0.0.0.0 if the bot is on a different host than the API.
  const internal = buildInternalServer();
  const internalHost = process.env.HOST || "127.0.0.1";
  internal.listen(config.port, internalHost, () => {
    log.info("INTERNAL_SERVER_STARTED", {
      host: internalHost,
      port: config.port,
      simulator: `http://localhost:${config.port}/simulator/`,
      health: `http://localhost:${config.port}/health`,
    });
  });

  // 2. WhatsApp client. Failure here does NOT crash the process — the simulator
  //    and order-alert endpoint still work for the demo.
  try {
    const whatsappClient = await createWhatsAppClient();
    registerMessageHandler(whatsappClient);
    setWhatsAppClient(whatsappClient);
    log.info("BOT_LIVE", { hint: "Send 'hi' from the demo phone to start." });
  } catch (error: any) {
    log.error("WHATSAPP_BOOT_FAILED", {
      message: error?.message,
      hint:
        "Open-WA failed to start. Simulator at http://localhost:" +
        config.port +
        "/simulator/ still works.",
    });
  }
}

main().catch((error) => {
  log.error("FATAL_BOOT_ERROR", { message: error?.message });
  process.exit(1);
});

// Graceful shutdown — destroy WhatsApp client so puppeteer/Chrome exit cleanly.
// Without this, ts-node-dev / supervisor restarts leave zombie Chrome processes
// which then collide with the new bot's session lock.
let shuttingDown = false;
async function gracefulShutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  log.info("SHUTDOWN", { signal });

  const client = getWhatsAppClient();
  if (client) {
    try {
      // Race: destroy with 5s budget, then exit no matter what
      await Promise.race([
        client.destroy(),
        new Promise((r) => setTimeout(r, 5_000)),
      ]);
      log.info("WA_CLIENT_DESTROYED", {});
    } catch (err: any) {
      log.warn("WA_CLIENT_DESTROY_FAILED", { message: err?.message });
    }
  }

  process.exit(0);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Catch unhandled errors so the supervisor can restart cleanly
process.on("uncaughtException", (err) => {
  log.error("UNCAUGHT_EXCEPTION", {
    message: err.message,
    stack: String(err.stack || "").slice(0, 500),
  });
  // Exit so supervisor restarts us
  process.exit(2);
});

process.on("unhandledRejection", (reason: any) => {
  log.error("UNHANDLED_REJECTION", {
    message: reason?.message || String(reason),
  });
  // Don't exit on unhandled promise rejections — log only. Many libraries
  // (including whatsapp-web.js) emit these during normal operation.
});
