import { test } from "node:test";
import assert from "node:assert/strict";

import { processMessage } from "../src/conversations/engine";
import { clearAllSessions, getSession, transition, updateSession } from "../src/conversations/state";
import { listProducts } from "../src/services/listingService";
import { api } from "../src/services/apiClient";
import { getMessages } from "../src/conversations/messages";
import { isResetCommand } from "../src/utils/text";
import type { IncomingMessage } from "../src/types";

const PHONE = "919876543210";

function text(body: string): IncomingMessage {
  return { phone: PHONE, body, hasImage: false, hasAudio: false, source: "simulator" };
}

function makeOnboardedBuyer() {
  updateSession(PHONE, {
    name: "Kd",
    role: "buyer",
    roles: ["buyer"],
    language: "en",
    district: "Bengaluru",
    onboardingComplete: true,
    consentGiven: true,
  });
  transition(PHONE, "BUYER_MENU");
}

test("demo product fallback has at least one item for every buyer category", async () => {
  api.get = (async () => {
    throw Object.assign(new Error("backend unavailable"), { summary: "GET /api/products failed" });
  }) as any;

  for (const category of ["Home Decor", "Textiles", "Jewellery", "Food Products", "Gifts"]) {
    const products = await listProducts({ category, limit: 10 });
    assert.ok(products.length > 0, `expected demo products for ${category}`);
    assert.equal(products[0].category, category);
  }
});

test("empty backend category response still shows demo products", async () => {
  api.get = (async () => ({ data: { success: true, data: { products: [] } } })) as any;

  const products = await listProducts({ category: "Textiles", limit: 10 });

  assert.ok(products.length > 0);
  assert.equal(products[0].category, "Textiles");
});

test("buyer tutorial quick steps are buyer-focused", () => {
  const tutorialPostText = getMessages("en").tutorialPostText as (
    role?: "seller" | "buyer" | "sakhi"
  ) => string;
  const text = tutorialPostText("buyer");

  assert.match(text, /Search the product/i);
  assert.match(text, /Type your budget/i);
  assert.match(text, /Buyer order history/i);
  assert.doesNotMatch(text, /Send a product photo/i);
});

test("start from scratch is a reset command and clears an existing buyer session", async () => {
  clearAllSessions();
  makeOnboardedBuyer();

  assert.equal(isResetCommand("start from scratch"), true);
  const replies = await processMessage(text("start from scratch"));

  assert.equal(getSession(PHONE).state, "GREETING");
  assert.equal(getSession(PHONE).onboardingComplete, false);
  assert.match(replies.at(-1)?.text || "", /start|cleared|reset|begin/i);
});

test("existing buyer can switch into seller setup without losing buyer/reset escape hatches", async () => {
  clearAllSessions();
  makeOnboardedBuyer();

  const replies = await processMessage(text("seller"));
  const joined = replies.map((reply) => reply.text).join("\n\n");

  assert.equal(getSession(PHONE).state, "SELLER_PRECHECK_NAME");
  assert.equal(getSession(PHONE).role, "seller");
  assert.match(joined, /Seller mode/i);
  assert.match(joined, /full name/i);
  assert.match(joined, /BUYER/i);
  assert.equal(isResetCommand("start from scratch"), true);
});
