import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getProduct } from "@/data/mockProducts";
import {
  createRazorpayOrder,
  getRazorpayConfig,
  verifyRazorpayPaymentSignature,
} from "@/lib/razorpay";

const createPaymentInput = z.object({
  localOrderId: z.string().min(1).max(40),
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
});

const verifyPaymentInput = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const createRazorpayCheckoutOrder = createServerFn({ method: "POST" })
  .inputValidator(createPaymentInput)
  .handler(async ({ data }) => {
    const product = getProduct(data.productId);

    if (!product) {
      throw new Error("Product not found.");
    }

    if (data.quantity > product.quantity) {
      throw new Error(`Only ${product.quantity} item(s) are available.`);
    }

    const config = getRazorpayConfig();
    const order = await createRazorpayOrder({
      amount: product.price * data.quantity,
      receipt: data.localOrderId,
      notes: {
        productId: product.id,
        productTitle: product.title,
        localOrderId: data.localOrderId,
      },
    });

    return {
      keyId: config.keyId,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      productTitle: product.title,
    };
  });

export const verifyRazorpayCheckoutPayment = createServerFn({ method: "POST" })
  .inputValidator(verifyPaymentInput)
  .handler(async ({ data }) => {
    const { keySecret } = getRazorpayConfig();
    const isVerified = await verifyRazorpayPaymentSignature({
      orderId: data.razorpayOrderId,
      paymentId: data.razorpayPaymentId,
      signature: data.razorpaySignature,
      keySecret,
    });

    if (!isVerified) {
      throw new Error("Razorpay payment verification failed.");
    }

    return { verified: true };
  });
