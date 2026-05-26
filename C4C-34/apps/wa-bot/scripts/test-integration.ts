/**
 * Integration probe with Person 4's real backend.
 *
 * Verifies BOTH directions of the bot ↔ backend handshake:
 *
 *   Direction 1 (bot → backend):
 *     POST {BACKEND_URL}/api/products/draft  with our outbound payload
 *     Expect: 201 with a created Product including artisan + status pending_approval.
 *
 *   Direction 2 (backend → bot):
 *     POST http://localhost:{BOT_PORT}/send-message with the exact payload
 *     Person 4's WhatsAppService.sendMessage() sends. Expect: 200/202 with
 *     either delivered:true (live phone) or delivered:false reason:no-client.
 *     With the wrong secret: 401.
 *
 * Run: npm run test:integration
 *   Make sure BOTH the bot (npm run dev) and the API (npm run dev in apps/api) are running.
 */
import axios from "axios";
import { config } from "../src/config";

const BOT_INTERNAL = `http://localhost:${config.port}`;
const BACKEND_URL = config.backendUrl;

async function probe(label: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`✅ ${label}`);
  } catch (error: any) {
    console.log(`❌ ${label}`);
    console.log("   ", error?.message || error);
    if (error?.response?.data) {
      console.log("   response:", JSON.stringify(error.response.data).slice(0, 200));
    }
    process.exitCode = 1;
  }
}

async function run() {
  console.log("===== HastKala bot ↔ backend integration probe =====");
  console.log(`Backend  : ${BACKEND_URL}`);
  console.log(`Bot      : ${BOT_INTERNAL}`);
  console.log("");

  // ---- Health checks ----
  await probe("Backend health responds", async () => {
    const r = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 5000 });
    if (!r.data?.success) throw new Error("Backend health did not return success");
  });

  await probe("Bot health responds", async () => {
    const r = await axios.get(`${BOT_INTERNAL}/health`, { timeout: 5000 });
    if (!r.data?.success) throw new Error("Bot health did not return success");
  });

  // ---- Direction 1: bot → backend draft creation ----
  let draftId: string | undefined;
  await probe("POST /api/products/draft creates a pending product", async () => {
    const r = await axios.post(
      `${BACKEND_URL}/api/products/draft`,
      {
        phone: "919876543210",
        artisanName: "Lakshmi (integration test)",
        message: "Handmade coconut shell lamp, ₹600, 2 pieces available",
        district: "Dakshina Kannada",
        language: "kn",
        craftType: "Coconut Shell Craft",
        source: "whatsapp",
      },
      { timeout: 10000 },
    );
    if (!r.data?.success) throw new Error("Draft response not success");
    const product = r.data.data;
    if (!product?.id) throw new Error("No product id in response");
    if (product.status !== "pending_approval") {
      throw new Error(`Expected status=pending_approval, got ${product.status}`);
    }
    draftId = product.id;
    console.log(`     draft id: ${draftId} title: "${product.title}" price: ₹${product.price}`);
  });

  // ---- Direction 2: backend → bot ----
  await probe("/send-message rejects request without x-bot-secret", async () => {
    try {
      await axios.post(
        `${BOT_INTERNAL}/send-message`,
        { to: "919876543210", message: "test" },
        { timeout: 5000 },
      );
      throw new Error("Expected 401 but request succeeded");
    } catch (error: any) {
      if (error?.response?.status !== 401) throw error;
    }
  });

  await probe("/send-message accepts {to, message} with secret", async () => {
    const r = await axios.post(
      `${BOT_INTERNAL}/send-message`,
      { to: "919876543210", message: "Integration probe — generic send-message contract." },
      {
        headers: { "x-bot-secret": config.botSecret },
        timeout: 5000,
      },
    );
    if (!r.data?.success) throw new Error("Response not success");
    console.log(`     delivered=${r.data.data.delivered} reason=${r.data.data.reason || "(none)"}`);
  });

  await probe("/send-message accepts {phone, message} with secret", async () => {
    const r = await axios.post(
      `${BOT_INTERNAL}/send-message`,
      { phone: "919876543210", message: "Integration probe — phone field variant." },
      {
        headers: { "x-bot-secret": config.botSecret },
        timeout: 5000,
      },
    );
    if (!r.data?.success) throw new Error("Response not success");
  });

  await probe("/send-message rejects empty message", async () => {
    try {
      await axios.post(
        `${BOT_INTERNAL}/send-message`,
        { to: "919876543210", message: "" },
        { headers: { "x-bot-secret": config.botSecret }, timeout: 5000 },
      );
      throw new Error("Expected 400 but request succeeded");
    } catch (error: any) {
      if (error?.response?.status !== 400) throw error;
    }
  });

  await probe("/send-message rejects payload missing phone+to", async () => {
    try {
      await axios.post(
        `${BOT_INTERNAL}/send-message`,
        { message: "test" },
        { headers: { "x-bot-secret": config.botSecret }, timeout: 5000 },
      );
      throw new Error("Expected 400 but request succeeded");
    } catch (error: any) {
      if (error?.response?.status !== 400) throw error;
    }
  });

  console.log("\n===== probe complete =====");
}

run().catch((err) => {
  console.error("Integration probe crashed:", err?.message || err);
  process.exit(1);
});
