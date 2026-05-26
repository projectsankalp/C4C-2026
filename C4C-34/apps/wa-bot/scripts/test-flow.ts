/**
 * Headless conversation flow test.
 *
 * Drives the conversation engine WITHOUT WhatsApp. Useful for:
 *   - Verifying the state machine before you ever scan the QR code.
 *   - CI checks.
 *   - Pre-demo smoke tests.
 *
 * Run: npm run test:flow
 *
 * Assumes either the real backend or the mock backend is running, OR
 * USE_MOCK_DRAFT=true in .env so the bot synthesizes drafts locally.
 */
import { processMessage } from "../src/conversations/engine";
import { resetSession } from "../src/conversations/state";
import type { IncomingMessage } from "../src/types";

const PHONES = {
  seller: "919876543210",
  buyer: "919812345678",
  voice: "919711122233",
};

async function step(phone: string, label: string, msg: Partial<IncomingMessage>) {
  const incoming: IncomingMessage = {
    phone,
    body: msg.body ?? "",
    hasImage: msg.hasImage ?? false,
    hasAudio: msg.hasAudio ?? false,
    imageUrl: msg.imageUrl,
    source: "simulator",
  };
  console.log("\n────────────────────────────────────────");
  console.log(
    `USER (${label}):`,
    JSON.stringify({
      body: incoming.body,
      hasImage: incoming.hasImage,
      hasAudio: incoming.hasAudio,
    }),
  );
  const replies = await processMessage(incoming);
  for (const r of replies) {
    console.log(`\nBOT [state=${r.state}]:`);
    console.log(r.text);
  }
}

async function sellerFlow() {
  console.log("===== Seller first-time → onboard → add product =====");
  const phone = PHONES.seller;
  resetSession(phone);

  await step(phone, "greeting", { body: "hi" });
  await step(phone, "language: English", { body: "1" });
  await step(phone, "role: Seller", { body: "1" });
  await step(phone, "tutorial: continue", { body: "1" });
  await step(phone, "name", { body: "Lakshmi" });
  await step(phone, "district", { body: "Dakshina Kannada" });
  await step(phone, "craft: Home decor", { body: "5" });
  await step(phone, "shg: No", { body: "2" });
  await step(phone, "sakhi help: Yes", { body: "1" });
  await step(phone, "menu: Add Product", { body: "1" });
  await step(phone, "photo", {
    hasImage: true,
    imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38",
  });
  await step(phone, "done", { body: "DONE" });
  await step(phone, "details", { body: "Handmade coconut shell lamp, ₹600, 2 pieces available" });
  await step(phone, "confirm", { body: "1" });
  await step(phone, "menu", { body: "MENU" });
  await step(phone, "help", { body: "HELP" });
}

async function buyerFlow() {
  console.log("\n===== Buyer first-time → onboard → request =====");
  const phone = PHONES.buyer;
  resetSession(phone);

  await step(phone, "greeting", { body: "hi" });
  await step(phone, "language: Hindi", { body: "2" });
  await step(phone, "role: Buyer", { body: "2" });
  await step(phone, "tutorial: continue", { body: "1" });
  await step(phone, "name", { body: "Rahul" });
  await step(phone, "city", { body: "Bengaluru" });
  await step(phone, "interests: All", { body: "6" });
  await step(phone, "menu: Request", { body: "5" });
  await step(phone, "brief", { body: "250 idli plates for a function" });
  await step(phone, "date", { body: "next Saturday" });
  await step(phone, "location: skip", { body: "SKIP" });
  await step(phone, "budget", { body: "3000 to 4000" });
  await step(phone, "confirm", { body: "1" });
}

async function voiceFlow() {
  console.log("\n===== Voice flow (mock transcription path) =====");
  const phone = PHONES.voice;
  resetSession(phone);
  await step(phone, "greeting", { body: "hi" });
  await step(phone, "language", { body: "1" });
  await step(phone, "role", { body: "1" });
  await step(phone, "tutorial", { body: "1" });
  await step(phone, "name", { body: "Lakshmi" });
  await step(phone, "district", { body: "Dakshina Kannada" });
  await step(phone, "craft", { body: "5" });
  await step(phone, "shg", { body: "2" });
  await step(phone, "sakhi", { body: "1" });
  await step(phone, "menu: add product", { body: "1" });
  await step(phone, "photo", {
    hasImage: true,
    imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38",
  });
  await step(phone, "done", { body: "DONE" });
  await step(phone, "voice", { hasAudio: true });
}

async function run() {
  try {
    await sellerFlow();
    await buyerFlow();
    await voiceFlow();
    console.log("\n===== All flows complete =====");
  } catch (err: any) {
    console.error("Flow failed:", err?.message || err);
    process.exit(1);
  }
}

run();
