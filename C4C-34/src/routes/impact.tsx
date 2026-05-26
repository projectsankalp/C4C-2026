import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MessageCircle,
  Store,
  Globe,
  Languages,
  TrendingUp,
  ArrowRight,
  ClipboardCheck,
  HandCoins,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Our Impact - HastKala Haat" },
      {
        name: "description",
        content:
          "How HastKala turns WhatsApp into direct market access for rural women artisans across 15+ craft districts.",
      },
    ],
  }),
  component: ImpactPage,
});

function ImpactPage() {
  const { t } = useLang();

  return (
    <div>
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-10 md:px-10 md:pt-24">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          {t("impact.label")}
        </p>
        <h1 className="mt-2 max-w-3xl font-display text-5xl leading-[1.05] md:text-7xl">
          {t("impact.title")}
          <span className="block text-primary">{t("impact.titleAccent")}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          {t("impact.desc")}
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10">
        <div className="rounded-3xl border border-border bg-card p-10 md:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
            {t("impact.problemLabel")}
          </p>
          <h2 className="mt-3 max-w-3xl font-display text-3xl md:text-4xl">
            {t("impact.problemTitle")}
          </h2>
          <p className="mt-5 max-w-3xl leading-relaxed text-muted-foreground">
            {t("impact.problemDesc")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10">
        <h2 className="mb-8 font-display text-3xl md:text-4xl">{t("impact.metricsTitle")}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { n: t("impact.metric1N"), l: t("impact.metric1L"), b: t("impact.metric1B") },
            { n: t("impact.metric2N"), l: t("impact.metric2L"), b: t("impact.metric2B") },
            { n: t("impact.metric3N"), l: t("impact.metric3L"), b: t("impact.metric3B") },
            { n: t("impact.metric4N"), l: t("impact.metric4L"), b: t("impact.metric4B") },
            { n: t("impact.metric5N"), l: t("impact.metric5L"), b: t("impact.metric5B") },
            { n: t("impact.metric6N"), l: t("impact.metric6L"), b: t("impact.metric6B") },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-border bg-card p-6">
              <p className="font-display text-5xl font-semibold text-primary">{s.n}</p>
              <p className="mt-3 font-semibold">{s.l}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-soft-highlight/50 py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <h2 className="mb-10 max-w-2xl font-display text-3xl md:text-4xl">
            {t("impact.howTitle")}
          </h2>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { icon: MessageCircle, title: t("home.step1Title"), body: t("home.step1Body") },
              { icon: TrendingUp, title: t("home.step2Title"), body: t("home.step2Body") },
              { icon: ClipboardCheck, title: t("home.step3Title"), body: t("home.step3Body") },
              { icon: Store, title: t("home.step4Title"), body: t("home.step4Body") },
            ].map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-secondary">{t("common.step")} {i + 1}</p>
                <h3 className="mt-1 font-display text-xl">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <h2 className="mb-10 font-display text-3xl md:text-4xl">{t("impact.pillarsTitle")}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { icon: Globe, t: t("impact.pillar1T"), b: t("impact.pillar1B") },
            { icon: HandCoins, t: t("impact.pillar2T"), b: t("impact.pillar2B") },
            { icon: Languages, t: t("impact.pillar3T"), b: t("impact.pillar3B") },
            { icon: TrendingUp, t: t("impact.pillar4T"), b: t("impact.pillar4B") },
          ].map((p) => (
            <div key={p.t} className="rounded-2xl border border-border bg-card p-8">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-secondary/15 text-secondary">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-2xl">{p.t}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{p.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 md:px-10">
        <div className="overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground md:p-16">
          <h2 className="max-w-2xl font-display text-4xl md:text-5xl">
            {t("impact.ctaTitle")}
          </h2>
          <p className="mt-4 max-w-xl text-primary-foreground/85">
            {t("impact.ctaDesc")}
          </p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3.5 text-sm font-semibold text-primary hover:bg-soft-highlight"
          >
            {t("impact.ctaBtn")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
