type RazorpayEnv = Partial<Record<"RAZORPAY_KEY_ID" | "RAZORPAY_KEY_SECRET", string>>;

export type RazorpayConfig = {
  keyId: string;
  keySecret: string;
};

export type CreateRazorpayOrderInput = {
  amount: number;
  receipt: string;
  notes?: Record<string, string>;
};

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: "INR";
  receipt?: string;
  status: string;
};

export function getRazorpayConfig(env: RazorpayEnv = getProcessEnv()): RazorpayConfig {
  const keyId = env.RAZORPAY_KEY_ID?.trim();
  const keySecret = env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId) {
    throw new Error("RAZORPAY_KEY_ID is required to create Razorpay payments.");
  }

  if (!keySecret) {
    throw new Error("RAZORPAY_KEY_SECRET is required to create Razorpay payments.");
  }

  return { keyId, keySecret };
}

export function toRazorpayAmount(amountInRupees: number): number {
  if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
    throw new Error("Razorpay amount must be a positive number.");
  }

  return Math.round(amountInRupees * 100);
}

export async function createRazorpayOrder(
  input: CreateRazorpayOrderInput,
  config = getRazorpayConfig(),
): Promise<RazorpayOrder> {
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      authorization: `Basic ${base64Encode(`${config.keyId}:${config.keySecret}`)}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      amount: toRazorpayAmount(input.amount),
      currency: "INR",
      receipt: input.receipt.slice(0, 40),
      notes: input.notes,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Razorpay order creation failed: ${message || response.statusText}`);
  }

  return response.json() as Promise<RazorpayOrder>;
}

export async function verifyRazorpayPaymentSignature({
  orderId,
  paymentId,
  signature,
  keySecret,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
  keySecret: string;
}): Promise<boolean> {
  const expectedSignature = await hmacSha256Hex(`${orderId}|${paymentId}`, keySecret);
  return timingSafeEqualHex(expectedSignature, signature);
}

function getProcessEnv(): RazorpayEnv {
  if (typeof process === "undefined") return {};
  return process.env;
}

function base64Encode(value: string): string {
  if (typeof btoa === "function") return btoa(value);
  return Buffer.from(value).toString("base64");
}

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const left = hexToBytes(a);
  const right = hexToBytes(b);

  if (left.length !== right.length) return false;

  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left[i] ^ right[i];
  }

  return diff === 0;
}

function hexToBytes(hex: string): Uint8Array {
  if (!/^[a-f0-9]+$/i.test(hex) || hex.length % 2 !== 0) return new Uint8Array();

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }

  return bytes;
}
