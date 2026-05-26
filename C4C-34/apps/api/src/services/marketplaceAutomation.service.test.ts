import assert from "node:assert/strict";
import test from "node:test";
import { MarketplaceAutomationService } from "./marketplaceAutomation.service";
import { requestStore } from "./requestStore.service";
import { userStore } from "./userStore.service";

test("matches a new product to buyers by interests and open requests", async () => {
  const interestedBuyer = "919900000101";
  const requestBuyer = "919900000102";
  const unrelatedBuyer = "919900000103";
  const sellerPhone = "919900000104";

  await userStore.upsert(interestedBuyer, {
    role: "buyer",
    interests: ["Home Decor"],
    district: "Mysuru",
    onboardingComplete: true,
  });
  await userStore.upsert(requestBuyer, {
    role: "buyer",
    interests: ["Textiles"],
    district: "Mysuru",
    onboardingComplete: true,
  });
  await userStore.upsert(unrelatedBuyer, {
    role: "buyer",
    interests: ["Jewellery"],
    district: "Dharwad",
    onboardingComplete: true,
  });
  await userStore.upsert(sellerPhone, {
    role: "seller",
    craftCategory: "Home Decor",
    district: "Mysuru",
    onboardingComplete: true,
  });

  await requestStore.createRequest({
    buyerPhone: requestBuyer,
    brief: "Need coconut shell lamps for a function",
    category: "Home Decor",
    location: "Mysuru",
  });

  const matches = await MarketplaceAutomationService.matchBuyersForProduct({
    id: "prod_test_lamp",
    title: "Coconut Shell Table Lamp",
    category: "Home Decor",
    district: "Mysuru",
    price: 600,
    artisan: { phone: sellerPhone, name: "Lakshmi" },
  });

  assert.ok(matches.includes(interestedBuyer));
  assert.ok(matches.includes(requestBuyer));
  assert.equal(matches.includes(unrelatedBuyer), false);
  assert.equal(matches.includes(sellerPhone), false);
});
