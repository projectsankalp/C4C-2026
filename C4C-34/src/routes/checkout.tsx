import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { API_BASE } from "@/lib/api-base";
import { getProduct, mockProducts } from "@/data/mockProducts";
import { saveOrder } from "@/lib/orders";
import type { Order } from "@/lib/types";
import { useLang } from "@/lib/i18n";

const search = z.object({ productId: z.string().optional() });

type RazorpayCheckoutResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: "INR";
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    contact: string;
  };
  method?: "upi";
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
  handler: (response: RazorpayCheckoutResponse) => void | Promise<void>;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

export const Route = createFileRoute("/checkout")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Checkout — HastKala Haat" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { productId } = Route.useSearch();
  const product = getProduct(productId ?? "") ?? mockProducts[0];
  const navigate = useNavigate();
  const { t } = useLang();
  const API = API_BASE;

  const [form, setForm] = useState({
    buyerName: "",
    buyerPhone: "",
    buyerAddress: "",
    quantity: 1,
    note: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const total = product.price * form.quantity;

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.buyerName.trim()) return setError(t("checkout.errorName"));
    if (!/^\+?\d{10,13}$/.test(form.buyerPhone.replace(/\s/g, "")))
      return setError(t("checkout.errorPhone"));
    if (!form.buyerAddress.trim()) return setError(t("checkout.errorAddress"));
    if (form.quantity < 1 || form.quantity > product.quantity)
      return setError(t("checkout.errorQuantity", { max: product.quantity }));

    setSubmitting(true);
    const localId = `o_${Date.now().toString(36)}`;

    try {
      // Post directly to the API — it creates the order in DB and sends
      // a WhatsApp alert to the artisan. No payment gateway for demo.
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          artisanId: product.artisan?.id ?? "",
          buyerName: form.buyerName,
          buyerPhone: form.buyerPhone,
          buyerAddress: form.buyerAddress,
          quantity: form.quantity,
          totalAmount: total,
        }),
      });
      const d = await res.json();
      const orderId = d.data?.id ?? d.data?.orderId ?? localId;

      saveOrder({
        id: orderId,
        productId: product.id,
        productTitle: product.title,
        artisanName: product.artisan?.name ?? "HastKala artisan",
        artisanDistrict: product.district,
        buyerName: form.buyerName,
        buyerPhone: form.buyerPhone,
        buyerAddress: form.buyerAddress,
        quantity: form.quantity,
        totalAmount: total,
        status: "new",
        paymentProvider: "none",
        createdAt: new Date().toISOString(),
      });

      await navigate({ to: "/order-success/$id", params: { id: orderId } });
    } catch {
      setSubmitting(false);
      setError("Could not place order. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">
      <Link
        to="/products/$id"
        params={{ id: product.id }}
        className="text-sm text-muted-foreground hover:text-primary"
      >
        {t("checkout.backToProduct")}
      </Link>
      <h1 className="mt-4 font-display text-4xl md:text-5xl">{t("checkout.title")}</h1>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_380px]">
        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-2xl border border-border bg-card p-8"
        >
          <h2 className="font-display text-xl">{t("checkout.deliveryDetails")}</h2>

          <Field label={t("checkout.fullName")}>
            <input
              value={form.buyerName}
              onChange={(e) => update("buyerName", e.target.value)}
              placeholder={t("checkout.fullNamePlaceholder")}
              className="input"
            />
          </Field>
          <Field label={t("checkout.phone")}>
            <input
              type="tel"
              value={form.buyerPhone}
              onChange={(e) => update("buyerPhone", e.target.value)}
              placeholder={t("checkout.phonePlaceholder")}
              className="input"
            />
          </Field>
          <Field label={t("checkout.address")}>
            <textarea
              value={form.buyerAddress}
              onChange={(e) => update("buyerAddress", e.target.value)}
              placeholder={t("checkout.addressPlaceholder")}
              rows={3}
              className="input"
            />
          </Field>
          <Field label={t("checkout.quantity")}>
            <input
              type="number"
              min={1}
              max={product.quantity}
              value={form.quantity}
              onChange={(e) => update("quantity", Number(e.target.value))}
              className="input w-32"
            />
          </Field>
          <Field label={t("checkout.noteForArtisan")}>
            <textarea
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
              rows={2}
              className="input"
            />
          </Field>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <p className="rounded-lg bg-soft-highlight/60 px-4 py-3 text-xs text-muted-foreground">
            {t("checkout.razorpayNote")}
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? (
              t("checkout.openingRazorpay")
            ) : (
              <>
                {t("checkout.payWithRazorpay")} <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">{t("checkout.orderSummary")}</h2>
          <div className="mt-4 flex gap-4">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="h-20 w-20 rounded-xl object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold leading-snug">{product.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("checkout.by")} {product.artisan?.name} - {product.district}
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            <Row l={t("checkout.price")} v={`Rs. ${product.price.toLocaleString("en-IN")}`} />
            <Row l={t("checkout.quantity")} v={`x ${form.quantity}`} />
            <Row l={t("checkout.delivery")} v={t("checkout.deliveryValue")} />
          </div>
          <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">{t("checkout.total")}</span>
            <span className="font-display text-3xl font-semibold text-primary">
              Rs. {total.toLocaleString("en-IN")}
            </span>
          </div>
        </aside>
      </div>

      <style>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid var(--color-border); background: var(--color-background); padding: 0.75rem 1rem; font-size: 0.875rem; }
        .input:focus { outline: none; border-color: var(--color-primary); }
      `}</style>
    </div>
  );
}

function loadRazorpayCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Razorpay checkout failed to load.")),
        {
          once: true,
        },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay checkout failed to load."));
    document.body.appendChild(script);
  });
}

function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay checkout is unavailable."));
      return;
    }

    const checkout = new window.Razorpay({
      ...options,
      modal: {
        ...options.modal,
        ondismiss: () => {
          options.modal.ondismiss();
          reject(new Error("Payment was cancelled. Your order is saved as unpaid."));
        },
      },
      handler: async (response) => {
        try {
          await options.handler(response);
          resolve();
        } catch (err) {
          reject(err instanceof Error ? err : new Error("Payment verification failed."));
        }
      },
    });

    checkout.open();
  });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

function Row({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{l}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
