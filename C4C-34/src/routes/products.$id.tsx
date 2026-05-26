import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  MapPin,
  Sparkles,
  MessageCircle,
  Truck,
  Heart,
  ArrowRight,
  ChefHat,
  ClipboardCheck,
} from "lucide-react";
import { getMockProductImage, getProduct, mockProducts } from "@/data/mockProducts";
import { ProductCard } from "@/components/product/ProductCard";
import { useLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import type { Product } from "@/lib/types";
import { API_BASE } from "@/lib/api-base";

const API_URL = API_BASE;

async function fetchProduct(id: string): Promise<Product | undefined> {
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`);
    if (!res.ok) return undefined;
    const json = await res.json();
    const p = json?.data;
    if (!p) return undefined;
    return {
      id: p.id,
      artisanId: p.artisanId ?? p.artisan_id ?? "",
      title: p.title,
      description: p.description ?? "",
      price: p.price,
      quantity: p.quantity ?? 1,
      category: p.category ?? "Handmade Crafts",
      district: p.district ?? "",
      imageUrl: getMockProductImage(p.id) ?? p.imageUrl ?? p.image_url ?? "",
      status: p.status ?? "approved",
      material: p.material,
      tags: p.tags,
      createdAt: p.createdAt ?? p.created_at ?? new Date().toISOString(),
      newFromWhatsApp: true,
      artisan: p.artisan
        ? {
            id: p.artisan.id,
            name: p.artisan.name ?? "",
            district: p.artisan.district ?? "",
            village: p.artisan.village,
            craftType: p.artisan.craftType ?? p.artisan.craft_type,
            isVerified: p.artisan.isVerified ?? p.artisan.is_verified ?? false,
            story: p.artisan.story,
          }
        : undefined,
    };
  } catch {
    return undefined;
  }
}

export const Route = createFileRoute("/products/$id")({
  loader: async ({ params }) => {
    const apiProduct = await fetchProduct(params.id);
    if (apiProduct) return apiProduct;
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — HastKala Haat` },
          { name: "description", content: loaderData.description.slice(0, 155) },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description.slice(0, 155) },
          { property: "og:image", content: loaderData.imageUrl },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl">Product not found</h1>
      <Link
        to="/products"
        className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Back to marketplace
      </Link>
    </div>
  ),
  component: ProductDetail,
});

function ProductDetail() {
  const product = Route.useLoaderData();
  const { t } = useLang();
  const similar = mockProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);
  const incomeGain = product.middlemanEstimate
    ? (product.price / product.middlemanEstimate).toFixed(1)
    : null;

  const API = API_BASE;
  const [steps, setSteps] = useState<
    { id: string; stepNumber: number; title: string; description: string; imageUrl?: string }[]
  >([]);

  useEffect(() => {
    fetch(`${API}/api/products/${product.id}/steps`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSteps(d.data);
      })
      .catch(() => {});
  }, [product.id, API]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
      <Link to="/products" className="text-sm text-muted-foreground hover:text-primary">
        ← Back to marketplace
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-14">
        {/* Image */}
        <div className="overflow-hidden rounded-3xl border border-border bg-muted">
          <img
            src={product.imageUrl}
            alt={`${product.title} handmade by ${product.artisan?.name}`}
            className="aspect-[4/5] w-full object-cover md:aspect-square"
          />
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap gap-2">
            {product.newFromWhatsApp && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                <Sparkles className="h-3 w-3" /> New from WhatsApp
              </span>
            )}
            <span className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              {product.category}
            </span>
          </div>

          <h1 className="mt-5 font-display text-4xl leading-tight md:text-5xl">{product.title}</h1>

          <Link
            to="/artisans/$id"
            params={{ id: product.artisanId }}
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            By <span className="font-semibold text-foreground">{product.artisan?.name}</span>
            <span aria-hidden>·</span>
            <MapPin className="h-3.5 w-3.5" /> {product.district}
          </Link>

          <p className="mt-6 leading-relaxed text-foreground/85">{product.description}</p>

          {/* Price + CTA */}
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Direct artisan price
                </p>
                <p className="mt-1 font-display text-4xl font-semibold text-primary">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{product.quantity} in stock</p>
            </div>
            <Link
              to="/checkout"
              search={{ productId: product.id }}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Place Order <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out "${product.title}" by ${product.artisan?.name} — ₹${product.price} on HastKala Haat! 🛍️\n\n${product.description?.slice(0, 100)}...\n\n${typeof window !== "undefined" ? window.location.href : ""}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#25D366] bg-[#25D366]/10 px-6 py-3.5 text-sm font-semibold text-[#25D366] transition hover:bg-[#25D366]/20"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.625-1.476A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-2.115 0-4.09-.57-5.793-1.564l-.415-.247-2.742.876.876-2.688-.27-.43A9.71 9.71 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z" />
              </svg>
              Share on WhatsApp
            </a>
          </div>
          <div className="mt-6 rounded-2xl border border-border bg-soft-highlight/40 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
              Product origin
            </p>
            <ol className="mt-4 space-y-3 text-sm">
              {[
                { icon: MessageCircle, label: "Submitted via WhatsApp" },
                { icon: ClipboardCheck, label: "Reviewed before listing" },
                { icon: Sparkles, label: "Listed on HastKala Haat" },
                { icon: Truck, label: "Ready for direct order" },
              ].map((s) => (
                <li key={s.label} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-card text-primary">
                    <s.icon className="h-4 w-4" />
                  </span>
                  <span className="font-medium">{s.label}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Material */}
          {product.material && (
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Material
                </p>
                <p className="mt-1 font-medium">{product.material}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Craft
                </p>
                <p className="mt-1 font-medium">{product.craftType}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How it's made */}
      {steps.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center gap-3">
            <ChefHat className="h-6 w-6 text-secondary" />
            <h2 className="font-display text-3xl md:text-4xl">{t("howMadeTitle")}</h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step) => (
              <div key={step.id} className="rounded-2xl border border-border bg-card p-5">
                {step.imageUrl && (
                  <img
                    src={step.imageUrl}
                    alt={step.title}
                    className="mb-4 aspect-video w-full rounded-xl object-cover"
                  />
                )}
                <span className="text-xs font-semibold uppercase tracking-widest text-secondary">
                  Step {step.stepNumber}
                </span>
                <h3 className="mt-1 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Impact comparison */}
      {incomeGain && product.middlemanEstimate && (
        <section className="mt-16 overflow-hidden rounded-3xl bg-accent p-10 text-accent-foreground md:p-12">
          <Heart className="h-8 w-8" />
          <h2 className="mt-4 max-w-xl font-display text-3xl md:text-4xl">
            Your purchase supports direct artisan income.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-accent-foreground/10 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground/80">
                Earlier middleman estimate
              </p>
              <p className="mt-2 font-display text-3xl font-semibold">
                ₹{product.middlemanEstimate}
              </p>
            </div>
            <div className="rounded-2xl bg-accent-foreground/10 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground/80">
                Direct listed price
              </p>
              <p className="mt-2 font-display text-3xl font-semibold">₹{product.price}</p>
            </div>
            <div className="rounded-2xl bg-accent-foreground/10 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground/80">
                Potential income gain
              </p>
              <p className="mt-2 font-display text-3xl font-semibold">{incomeGain}× more</p>
            </div>
          </div>
          <p className="mt-6 text-xs text-accent-foreground/70">
            Estimates based on typical middleman pricing in regional craft markets.
          </p>
        </section>
      )}

      {/* Artisan card */}
      {product.artisan && (
        <section className="mt-16">
          <Link
            to="/artisans/$id"
            params={{ id: product.artisanId }}
            className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-8 transition hover:shadow-craft md:flex-row md:items-center md:p-10"
          >
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-soft-highlight font-display text-4xl font-semibold text-primary">
              {product.artisan.name[0]}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                Meet the artisan
              </p>
              <h3 className="mt-1 font-display text-2xl md:text-3xl">
                {product.artisan.name}, {product.district}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {product.artisan.story}
              </p>
            </div>
            <ArrowRight className="hidden h-6 w-6 text-primary md:block" />
          </Link>
        </section>
      )}

      {/* Similar */}
      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 font-display text-3xl md:text-4xl">You may also like</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
