import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Heart, MessageCircle, Package, ArrowRight } from "lucide-react";
import { getOrder } from "@/lib/orders";
import type { Order } from "@/lib/types";

export const Route = createFileRoute("/order-success/$id")({
  head: () => ({ meta: [{ title: "Order placed — HastKala Haat" }] }),
  component: OrderSuccess,
});

function OrderSuccess() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    setOrder(getOrder(id) ?? null);
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:px-10">
      <div className="rounded-3xl border border-border bg-card p-10 md:p-14">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-accent/15 text-accent">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-6 font-display text-4xl md:text-5xl">
          {order?.status === "paid" ? "Payment received." : "Your order has been placed."}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Order ID: <span className="font-mono text-foreground">{id}</span>
        </p>

        {order ? (
          <div className="mt-8 rounded-2xl border border-border bg-soft-highlight/40 p-6">
            <p className="font-semibold">{order.productTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              By {order.artisanName} · {order.artisanDistrict}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <Stat l="Quantity" v={`× ${order.quantity}`} />
              <Stat l="Total" v={`₹${order.totalAmount.toLocaleString("en-IN")}`} />
              <Stat l="Status" v={order.status === "paid" ? "Paid" : "New Order"} />
            </div>
            {order.razorpayPaymentId && (
              <p className="mt-4 text-xs text-muted-foreground">
                Razorpay payment ID:{" "}
                <span className="font-mono text-foreground">{order.razorpayPaymentId}</span>
              </p>
            )}
          </div>
        ) : (
          <p className="mt-6 rounded-lg bg-soft-highlight/40 px-4 py-3 text-sm text-muted-foreground">
            Order details could not be loaded. Your order has still been recorded.
          </p>
        )}

        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
            What happens next
          </p>
          <ol className="mt-4 space-y-3">
            {[
              { icon: MessageCircle, t: "Karigar Sakhi alerts the artisan via WhatsApp" },
              { icon: Package, t: "Artisan confirms availability and packs the product" },
              { icon: ArrowRight, t: "Logistics partner picks up and delivers to you" },
            ].map((s) => (
              <li key={s.t} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
                  <s.icon className="h-4 w-4" />
                </span>
                <span className="font-medium">{s.t}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex items-start gap-3 rounded-2xl bg-primary p-6 text-primary-foreground">
          <Heart className="mt-1 h-5 w-5 shrink-0" />
          <p className="text-sm leading-relaxed">
            Thank you for supporting direct market access for women artisans. Your order travels
            straight from a craft district to your doorstep — no middleman in between.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Continue shopping <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{l}</p>
      <p className="mt-1 font-semibold">{v}</p>
    </div>
  );
}
