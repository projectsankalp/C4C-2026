import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import { getRazorpayConfig, toRazorpayAmount, verifyRazorpayPaymentSignature } from "./razorpay.ts";

test("toRazorpayAmount converts rupees to paise", () => {
  assert.equal(toRazorpayAmount(222.25), 22225);
});

test("getRazorpayConfig requires both Razorpay keys", () => {
  assert.throws(
    () => getRazorpayConfig({ RAZORPAY_KEY_ID: "rzp_test_123" }),
    /RAZORPAY_KEY_SECRET/,
  );
});

test("verifyRazorpayPaymentSignature validates the checkout response signature", async () => {
  const orderId = "order_IEIaMR65cu6nz3";
  const paymentId = "pay_IH4NVgf4Dreq1l";
  const keySecret = "test_secret";
  const signature = createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");

  assert.equal(
    await verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature,
      keySecret,
    }),
    true,
  );

  assert.equal(
    await verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature: signature.replace(/.$/, "0"),
      keySecret,
    }),
    false,
  );
});
