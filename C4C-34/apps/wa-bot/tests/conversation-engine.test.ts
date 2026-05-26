/**
 * Engine-level integration tests for the new state machine.
 *
 * These complement unit.test.ts (which covers parsers) by driving the engine
 * through actual conversation transitions and asserting the resulting state.
 *
 * Run: npm run test:unit
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { processMessage } from "../src/conversations/engine";
import { clearAllSessions, getSession } from "../src/conversations/state";
import { api } from "../src/services/apiClient";
import type { IncomingMessage } from "../src/types";

const PHONE = "919876543210";

function text(body: string): IncomingMessage {
  return {
    phone: PHONE,
    body,
    hasImage: false,
    hasAudio: false,
    source: "simulator",
  };
}

function image(url = "https://example.com/product.jpg"): IncomingMessage {
  return {
    phone: PHONE,
    body: "",
    hasImage: true,
    hasAudio: false,
    imageUrl: url,
    source: "simulator",
  };
}

test("first contact greets the user and asks for language", async () => {
  clearAllSessions();
  stubBackend({});

  const replies = await processMessage(text("hi"));

  assert.equal(replies[0].state, "AWAITING_LANGUAGE");
  assert.match(replies[0].text, /Welcome|HastKala/i);
  assert.match(replies[0].text, /English/);
  assert.match(replies[0].text, /हिन्दी|ಕನ್ನಡ/);
});

test("language pick by number transitions to role selection", async () => {
  clearAllSessions();
  stubBackend({});

  await processMessage(text("hi"));
  const replies = await processMessage(text("1")); // English

  assert.equal(replies.at(-1)?.state, "AWAITING_ROLE");
  assert.match(replies.at(-1)?.text || "", /Seller|Buyer/);
  assert.equal(getSession(PHONE).language, "en");
});

test("invalid language pick re-asks the same question", async () => {
  clearAllSessions();
  stubBackend({});

  await processMessage(text("hi"));
  const replies = await processMessage(text("9"));

  assert.equal(replies[0].state, "AWAITING_LANGUAGE");
  assert.match(replies[0].text, /1\s*to\s*5|number/i);
});

test("role pick triggers tutorial state", async () => {
  clearAllSessions();
  stubBackend({});

  await processMessage(text("hi"));
  await processMessage(text("1")); // English
  const replies = await processMessage(text("1")); // Seller

  assert.equal(replies.at(-1)?.state, "TUTORIAL");
  assert.equal(getSession(PHONE).role, "seller");
});

test("seller onboarding walks through all 5 questions to the menu", async () => {
  clearAllSessions();
  stubBackend({});

  await processMessage(text("hi"));
  await processMessage(text("1")); // language
  await processMessage(text("1")); // role: seller
  await processMessage(text("1")); // tutorial: continue

  assert.equal(getSession(PHONE).state, "SELLER_ONBOARD_NAME");

  await processMessage(text("Lakshmi"));
  assert.equal(getSession(PHONE).state, "SELLER_ONBOARD_DISTRICT");
  assert.equal(getSession(PHONE).name, "Lakshmi");

  await processMessage(text("Dakshina Kannada"));
  assert.equal(getSession(PHONE).state, "SELLER_ONBOARD_CRAFT");
  assert.equal(getSession(PHONE).district, "Dakshina Kannada");

  await processMessage(text("5")); // Home decor
  assert.equal(getSession(PHONE).state, "SELLER_ONBOARD_SHG_ASK");

  await processMessage(text("2")); // No SHG
  assert.equal(getSession(PHONE).state, "SELLER_ONBOARD_SAKHI_HELP");

  const replies = await processMessage(text("1")); // Yes, connect Sakhi

  assert.equal(replies.at(-1)?.state, "SELLER_MENU");
  assert.equal(getSession(PHONE).onboardingComplete, true);
});

test("photo arriving in the wrong state asks for photo first", async () => {
  clearAllSessions();
  stubBackend({});

  await onboardSeller();
  await processMessage(text("1")); // Add Product → ADD_PRODUCT_PHOTOS

  const replies = await processMessage(text("I sell lamps"));

  assert.equal(replies[0].state, "ADD_PRODUCT_PHOTOS");
  assert.match(replies[0].text, /photo/i);
});

test("add-product accepts an image and advances on DONE", async () => {
  clearAllSessions();
  stubBackend({});

  await onboardSeller();
  await processMessage(text("1")); // Add Product

  const photoReply = await processMessage(image());
  assert.equal(photoReply[0].state, "ADD_PRODUCT_PHOTOS");
  assert.match(photoReply[0].text, /received|✅/i);

  const doneReply = await processMessage(text("DONE"));
  assert.equal(doneReply[0].state, "ADD_PRODUCT_DETAILS");
});

test("add-product reaches the confirm step when slots are present", async () => {
  clearAllSessions();
  stubBackend({
    "/api/products/draft": {
      success: true,
      data: {
        id: "draft_abc",
        title: "Handmade Coconut Shell Lamp",
        description: "Eco-friendly lamp",
        price: 600,
        quantity: 2,
        status: "pending_approval",
        approvalUrl: "http://localhost:3001/products/draft_abc",
      },
    },
  });

  await onboardSeller();
  await processMessage(text("1")); // Add Product
  await processMessage(image()); // Photo
  await processMessage(text("DONE")); // Done photos
  await processMessage(text("Handmade coconut shell lamp, Rs.600, 2 pieces"));

  assert.equal(getSession(PHONE).state, "ADD_PRODUCT_CONFIRM");

  const replies = await processMessage(text("1")); // Confirm

  assert.equal(replies[0].state, "SELLER_MENU");
  assert.match(replies[0].text, /verification|approval|Sakhi/i);
});

test("RESET clears the session at any state", async () => {
  clearAllSessions();
  stubBackend({});

  await onboardSeller();
  await processMessage(text("1")); // Add Product

  const replies = await processMessage(text("RESET"));

  assert.match(replies[0].text, /cleared|reset/i);
  assert.equal(getSession(PHONE).state, "GREETING");
  assert.equal(getSession(PHONE).onboardingComplete, false);
});

test("MENU returns to seller menu after onboarding", async () => {
  clearAllSessions();
  stubBackend({});

  await onboardSeller();
  await processMessage(text("1")); // Add Product → photos state

  const replies = await processMessage(text("MENU"));
  assert.equal(replies[0].state, "SELLER_MENU");
});

test("HELP works in any state", async () => {
  clearAllSessions();
  stubBackend({});

  await processMessage(text("hi"));
  const replies = await processMessage(text("HELP"));

  assert.match(replies[0].text, /MENU|HELP|BACK/);
});

test("backend failure during draft submission surfaces a friendly error", async () => {
  clearAllSessions();
  stubBackend({}, /* failPost */ true);

  await onboardSeller();
  await processMessage(text("1"));
  await processMessage(image());
  await processMessage(text("DONE"));
  await processMessage(text("Handmade coconut shell lamp, Rs.600, 2 pieces"));

  const replies = await processMessage(text("1")); // Confirm
  assert.match(replies[0].text, /server|busy|try again/i);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function onboardSeller() {
  await processMessage(text("hi"));
  await processMessage(text("1")); // English
  await processMessage(text("1")); // Seller
  await processMessage(text("1")); // Continue tutorial
  await processMessage(text("Lakshmi"));
  await processMessage(text("Dakshina Kannada"));
  await processMessage(text("5")); // Home decor
  await processMessage(text("2")); // No SHG
  await processMessage(text("1")); // Connect Sakhi
}

/**
 * Stub `api.post`, `api.get`, `api.patch` for one test.
 * `failPost` makes POST throw — used to simulate backend outage.
 */
function stubBackend(routes: Record<string, unknown>, failPost = false) {
  const make = (verb: string) =>
    (async (url: string) => {
      if (failPost && verb === "POST") {
        const err: any = new Error("Backend offline");
        err.summary = `${verb} ${url} → ERR`;
        throw err;
      }
      const matchedKey = Object.keys(routes).find((k) => url.includes(k));
      const payload = matchedKey
        ? (routes as any)[matchedKey]
        : { success: true, data: { onboardingComplete: false } };
      return { data: payload };
    }) as any;

  api.post = make("POST");
  api.get = make("GET");
  api.patch = make("PATCH");
}
