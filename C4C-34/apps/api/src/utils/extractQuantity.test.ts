import assert from "node:assert/strict";
import test from "node:test";
import { extractQuantity } from "./extractQuantity";

test("extracts quantities from product availability phrases", () => {
  assert.equal(extractQuantity("Handmade lamp, 2 pieces available"), 2);
  assert.equal(extractQuantity("5 pcs in stock"), 5);
  assert.equal(extractQuantity("quantity 7"), 7);
});

test("defaults to one when no quantity is provided", () => {
  assert.equal(extractQuantity("Handmade coconut shell lamp, Rs 600"), 1);
});
