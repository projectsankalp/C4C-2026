/**
 * End-to-end integration probe.
 *
 * Verifies that the running internal server + (mock or real) backend +
 * conversation engine can complete the full draft creation cycle.
 *
 * Prereqs (one of):
 *   A) npm run dev:simulator  +  npm run dev:mock-backend
 *      Then BACKEND_URL=http://localhost:4000, simulator on http://localhost:5002
 *
 *   B) The full stack from Person 4 backend at BACKEND_URL.
 *
 * Run: npm run test:e2e
 */
import axios from "axios";
import { config } from "../src/config";

const SIM_URL = `http://localhost:${config.simulatorPort}`;
const PHONE = "919876543210";

interface SimReply {
  text: string;
  state: string;
  draft?: { id: string; price: number; quantity: number; title: string };
}

async function send(payload: any): Promise<SimReply[]> {
  const res = await axios.post(`${SIM_URL}/simulator/message`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.data?.success) {
    throw new Error(`Simulator returned error: ${JSON.stringify(res.data)}`);
  }
  return res.data.data.replies as SimReply[];
}

async function expectReply(
  label: string,
  payload: any,
  predicate: (replies: SimReply[]) => boolean,
) {
  const replies = await send(payload);
  const ok = predicate(replies);
  console.log(`${ok ? "✅" : "❌"} ${label}`);
  if (!ok) {
    console.log("  Got:", JSON.stringify(replies, null, 2));
    process.exitCode = 1;
  }
  return replies;
}

async function run() {
  console.log("===== HastKala BolKeBecho — end-to-end probe =====");
  console.log(`Simulator URL: ${SIM_URL}`);

  // 0. Health
  const health = await axios.get(`${SIM_URL}/health`).then((r) => r.data);
  console.log("Health:", JSON.stringify(health.data));

  // 1. Reset
  await send({ phone: PHONE, body: "RESET" });

  // 2. Start
  await expectReply(
    "ADD PRODUCT puts user in AWAITING_PRODUCT_PHOTO",
    { phone: PHONE, body: "ADD PRODUCT" },
    (replies) => replies.some((r) => r.state === "AWAITING_PRODUCT_PHOTO"),
  );

  // 3. Send photo
  await expectReply(
    "Sending an image transitions to AWAITING_PRODUCT_DETAILS",
    {
      phone: PHONE,
      hasImage: true,
      imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38",
    },
    (replies) => replies.some((r) => r.state === "AWAITING_PRODUCT_DETAILS"),
  );

  // 4. Send details — backend should create a draft
  await expectReply(
    "Sending product details creates a draft",
    {
      phone: PHONE,
      body: "Handmade coconut shell lamp, ₹600, 2 pieces available",
    },
    (replies) => {
      const last = replies[replies.length - 1];
      return Boolean(last?.draft?.id && last.draft.price > 0 && last.state === "DRAFT_CREATED");
    },
  );

  console.log("\n===== probe complete =====");
}

run().catch((err: any) => {
  console.error("E2E probe failed:", err?.message || err);
  process.exit(1);
});
