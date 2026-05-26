import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, MessageCircle, Store, Sparkles, Heart, ClipboardCheck } from "lucide-react";
import heroImage from "@/assets/hero-crafts.jpg";
import { getMockProductImage, mockProducts } from "@/data/mockProducts";
import { mockArtisans } from "@/data/mockArtisans";
import { ProductCard } from "@/components/product/ProductCard";
import { BotDemo } from "@/components/common/BotDemo";
import type { Product } from "@/lib/types";
import { API_BASE } from "@/lib/api-base";

import { useLang } from "@/lib/i18n";

const API_URL = API_BASE;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HastKala Haat — Handmade by Women Artisans" },
      {
        name: "description",
        content:
          "Discover handmade products from rural craft districts and support women artisans through direct digital market access.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { t } = useLang();
  const [featured, setFeatured] = useState<Product[]>(mockProducts.slice(0, 4));
  const artisans = mockArtisans.slice(0, 3);

  useEffect(() => {
    fetch(`${API_URL}/api/products?limit=4`)
      .then((r) => r.json())
      .then((res) => {
        const items = res?.data?.products ?? res?.data ?? [];
        if (Array.isArray(items) && items.length > 0) {
          const mapped: Product[] = items.map((p: any) => ({
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
            createdAt: p.createdAt ?? p.created_at ?? new Date().toISOString(),
            newFromWhatsApp: true,
            artisan: p.artisan
              ? {
                  id: p.artisan.id,
                  name: p.artisan.name ?? "",
                  district: p.artisan.district ?? "",
                  isVerified: p.artisan.isVerified ?? p.artisan.is_verified ?? false,
                }
              : undefined,
          }));
          setFeatured(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-soft-highlight/60 via-background to-background" />
        <div className="mx-auto grid w-full items-center gap-10 px-5 pt-10 pb-16 md:grid-cols-2 md:px-10 md:pt-20 md:pb-28">
          <div>
            <h1 className="font-display text-4xl leading-[1.08] text-foreground sm:text-5xl md:text-7xl">
              {t("home.heroTitle")}
              <span className="block text-primary">{t("home.heroTitleAccent")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:mt-6 md:text-lg">
              {t("home.heroDesc")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                {t("home.exploreProducts")} <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#artisans"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold transition hover:bg-soft-highlight"
              >
                {t("home.meetArtisans")}
              </a>
              <a
                href={`https://wa.me/${import.meta.env.VITE_BOT_PHONE || "919037978905"}?text=${encodeURIComponent("Hi 🙏 I want to start selling on HastKala")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1da851]"
              >
                <MessageCircle className="h-4 w-4" /> Chat with our bot
              </a>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">{t("home.trustLine")}</p>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {[
                { n: "42", l: t("home.statArtisans") },
                { n: "15", l: t("home.statDistricts") },
                { n: "2.4×", l: t("home.statIncome") },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border border-border bg-card p-4">
                  <p className="font-display text-3xl font-semibold text-primary">{s.n}</p>
                  <p className="mt-1 text-xs leading-tight text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border shadow-craft">
              <img
                src={heroImage}
                alt="Handmade crafts by women artisans across Karnataka"
                width={1280}
                height={1280}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 max-w-[280px] rounded-2xl border border-border bg-card p-5 shadow-craft">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-soft-highlight font-display text-lg font-semibold text-primary">
                  L
                </div>
                <div>
                  <p className="font-semibold">Lakshmi</p>
                  <p className="text-xs text-muted-foreground">Dakshina Kannada · 12 yrs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto w-full px-6 py-20 md:px-10">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              {t("home.featuredLabel")}
            </p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl">{t("home.featuredTitle")}</h2>
          </div>
          <Link
            to="/products"
            className="hidden items-center gap-1.5 text-sm font-semibold text-primary hover:underline md:inline-flex"
          >
            {t("home.viewAll")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-soft-highlight/50 py-20">
        <div className="mx-auto w-full px-6 md:px-10">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              {t("home.howTitle")}
            </p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl">{t("home.howSubtitle")}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                icon: MessageCircle,
                title: t("home.step1Title"),
                body: t("home.step1Body"),
              },
              {
                icon: Sparkles,
                title: t("home.step2Title"),
                body: t("home.step2Body"),
              },
              {
                icon: ClipboardCheck,
                title: t("home.step3Title"),
                body: t("home.step3Body"),
              },
              {
                icon: Store,
                title: t("home.step4Title"),
                body: t("home.step4Body"),
              },
            ].map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-secondary">STEP {i + 1}</p>
                <h3 className="mt-1 font-display text-xl">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* See the bot live — autoplay phone-frame demo */}
      <section
        id="bot-demo"
        aria-labelledby="bot-demo-title"
        className="relative overflow-hidden py-20 md:py-28"
      >
        {/* Soft section background that visually anchors the section without
            clashing with the surrounding cream. The radial gradient adds a
            subtle warm glow behind the phone. */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(60% 50% at 70% 40%, rgba(124,45,18,0.06) 0%, rgba(180,83,9,0.04) 35%, transparent 70%)",
          }}
        />
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
          {/* Card-style container with generous border + soft shadow so the
              section reads as a discrete, premium showcase. */}
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card/70 px-6 py-12 shadow-craft backdrop-blur-sm md:px-12 md:py-16">
            {/* Decorative top-corner gradient flourish */}
            <div
              className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-secondary/15 via-primary/10 to-transparent blur-3xl"
              aria-hidden="true"
            />
            <h2 id="bot-demo-title" className="sr-only">
              {t("home.demoTitle")} {t("home.demoTitleAccent")}
            </h2>
            <BotDemo />
          </div>
        </div>
      </section>

      {/* Artisans */}
      <section id="artisans" className="mx-auto w-full px-6 py-20 md:px-10">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            {t("home.meetArtisans")}
          </p>
          <h2 className="mt-2 font-display text-4xl md:text-5xl">{t("home.artisansTitle")}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {artisans.map((a) => (
            <Link
              key={a.id}
              to="/artisans/$id"
              params={{ id: a.id }}
              className="group rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:shadow-craft"
            >
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-soft-highlight font-display text-2xl font-semibold text-primary">
                  {a.name[0]}
                </div>
                <div>
                  <h3 className="font-display text-xl">{a.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {a.craftType} · {a.district}
                  </p>
                </div>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {a.story}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                {t("home.readStory")}{" "}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Community Network */}
      <section className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-10">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">Community Network</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Artisan communities across Karnataka connecting to share skills, materials, and fulfill orders together.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { name: "Ullal Coconut Shell", district: "Dakshina Kannada", craft: "Coconut Shell Craft", members: 12 },
            { name: "Dharwad Kasuti", district: "Dharwad", craft: "Kasuti Embroidery", members: 8 },
            { name: "Ilkal Handloom", district: "Bagalkot", craft: "Handloom Weaving", members: 20 },
          ].map(c => (
            <div key={c.name} className="rounded-2xl border border-border bg-card p-5 text-center transition hover:shadow-craft">
              <p className="font-semibold text-sm">{c.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.district} • {c.members} members</p>
              <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{c.craft}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link to="/network" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
            Explore All Communities <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Impact strip */}
      <section className="mx-auto w-full px-6 pb-20 md:px-10">
        <div className="overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground md:p-16">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <Heart className="h-8 w-8" />
              <h2 className="mt-4 font-display text-4xl md:text-5xl">{t("home.impactTitle")}</h2>
              <p className="mt-4 max-w-md text-primary-foreground/80">{t("home.impactDesc")}</p>
              <Link
                to="/impact"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-primary hover:bg-soft-highlight"
              >
                {t("home.seeImpact")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["2.4×", t("home.impactMetric1")],
                ["100%", t("home.impactMetric2")],
                ["15+", t("home.impactMetric3")],
                ["5", t("home.impactMetric4")],
              ].map(([n, l]) => (
                <div key={l} className="rounded-2xl bg-primary-foreground/10 p-5 backdrop-blur-sm">
                  <p className="font-display text-3xl font-semibold">{n}</p>
                  <p className="mt-1 text-sm text-primary-foreground/80">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
