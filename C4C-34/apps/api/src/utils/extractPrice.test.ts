import assert from "node:assert/strict";
import test from "node:test";
import { extractPrice } from "./extractPrice";

test("extracts rupee prices from common WhatsApp message formats", () => {
  assert.equal(extractPrice("Handmade coconut shell lamp, Rs 600, 2 pieces"), 600);
  assert.equal(extractPrice("Basket for ₹450 only"), 450);
  assert.equal(extractPrice("price 1200 rupees for dupatta"), 1200);
});

test("returns null when no plausible price exists", () => {
  assert.equal(extractPrice("Handmade product available today"), null);
});
