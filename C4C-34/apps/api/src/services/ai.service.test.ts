import assert from "node:assert/strict";
import test from "node:test";
import { AIService } from "./ai.service";

test("generates a complete listing from WhatsApp product text without external AI", async () => {
  const listing = await AIService.generateListing({
    message: "Handmade coconut shell lamp, 600 rupees, 2 pieces available",
    district: "Dakshina Kannada",
    craftType: "Coconut Shell Craft",
  });

  assert.equal(listing.title, "Handmade Coconut Shell Lamp");
  assert.equal(listing.price, 600);
  assert.equal(listing.quantity, 2);
  assert.equal(listing.category, "Home Decor");
  assert.ok(listing.description.includes("Dakshina Kannada"));
  assert.ok(listing.tags.includes("women artisans"));
});
