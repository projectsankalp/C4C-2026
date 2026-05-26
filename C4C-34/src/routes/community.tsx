import { API_BASE } from "@/lib/api-base";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  Award, BookOpen, Users, ArrowRight, CheckCircle2, Heart,
  ArrowLeftRight, Lightbulb, BadgeCheck, TrendingUp, MapPin,
  MessageCircle, GraduationCap, HandHeart, Store, Star,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — HastKala" },
      { name: "description", content: "Join the HastKala community. Learn, contribute, earn certification, and sell directly without a middleman." },
    ],
  }),
  component: CommunityPage,
});

const API = API_BASE;

function CommunityPage() {
  const { t } = useLang();
  const [stats, setStats] = useState({ totalMembers: 42, certified: 18, activeSellers: 12 });
  const [barters, setBarters] = useState<any[]>([]);
  const [waBanner, setWaBanner] = useState(false);

  const showWaBanner = useCallback(() => {
    setWaBanner(true);
    setTimeout(() => setWaBanner(false), 6000);
  }, []);

  useEffect(() => {
    fetch(`${API}/api/community/stats`).then(r => r.json()).then(d => { if (d.success) setStats(d.data); }).catch(() => {});
    fetch(`${API}/api/barter?limit=4`).then(r => r.json()).then(d => { if (d.success) setBarters(d.data.listings || []); }).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-10">
      {waBanner && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 rounded-2xl bg-[#25D366] px-6 py-4 text-white shadow-lg max-w-sm text-center">
          <p className="font-semibold text-sm">{t("community.whatsappOpening")}</p>
          <p className="mt-1 text-xs text-white/90">Just tap <strong>Send</strong> — the bot will guide you from there.</p>
        </div>
      )}

      {/* Hero */}
      <section className="py-16 md:py-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-4 py-1.5 text-sm font-semibold text-secondary">
          <Users className="h-4 w-4" /> {t("community.badge")}
        </span>
        <h1 className="mt-5 font-display text-5xl font-semibold leading-tight md:text-6xl lg:text-7xl">
          {t("community.heroTitle")}<br />
          <span className="text-primary">{t("community.heroAccent")}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          {t("community.heroDesc")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/join" className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
            {t("community.joinCommunity")} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/learn" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold transition hover:bg-muted">
            {t("community.startLearning")}
          </Link>
        </div>
      </section>

      {/* Live Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-3xl border border-border bg-card p-6 md:p-10">
        {[
          { label: t("community.statMembers"), value: stats.totalMembers, icon: Users, color: "text-primary" },
          { label: t("community.statCertified"), value: stats.certified, icon: Award, color: "text-secondary" },
          { label: t("community.statActive"), value: stats.activeSellers, icon: Store, color: "text-accent" },
          { label: t("community.statDistricts"), value: 5, icon: MapPin, color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <s.icon className={`mx-auto h-6 w-6 ${s.color} mb-2`} />
            <p className={`font-display text-3xl font-semibold md:text-4xl ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      {/* The Journey */}
      <section className="py-16 md:py-24">
        <div className="text-center">
          <h2 className="mx-auto max-w-4xl font-display text-5xl font-semibold leading-[1.05] text-foreground md:text-7xl">
            {t("community.journeyTitle")}
            <span className="block text-primary">{t("community.journeyAccent")}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {t("community.journeyDesc")}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { step: "01", icon: Users, title: t("community.step1Title"), desc: t("community.step1Desc"), color: "bg-primary/10 text-primary" },
            { step: "02", icon: GraduationCap, title: t("community.step2Title"), desc: t("community.step2Desc"), color: "bg-secondary/10 text-secondary" },
            { step: "03", icon: HandHeart, title: t("community.step3Title"), desc: t("community.step3Desc"), color: "bg-accent/10 text-accent" },
            { step: "04", icon: Award, title: t("community.step4Title"), desc: t("community.step4Desc"), color: "bg-secondary/10 text-secondary" },
            { step: "05", icon: Store, title: t("community.step5Title"), desc: t("community.step5Desc"), color: "bg-primary/10 text-primary" },
          ].map((j) => (
            <div key={j.step} className="group rounded-3xl border border-border bg-card p-7 transition hover:shadow-craft">
              <div className="flex items-start gap-4">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${j.color}`}>
                  <j.icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("common.step")} {j.step}</p>
                  <h3 className="mt-1 font-display text-xl font-semibold">{j.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{j.desc}</p>
                </div>
              </div>
            </div>
          ))}

          {/* CTA card */}
          <div className="rounded-3xl bg-primary p-7 text-primary-foreground">
            <Award className="h-10 w-10 opacity-80" />
            <h3 className="mt-4 font-display text-2xl font-semibold">{t("community.readyTitle")}</h3>
            <p className="mt-2 text-sm opacity-80">{t("community.readyDesc")}</p>
            <Link to="/join" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary-foreground/90">
              {t("community.joinNow")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 md:py-20">
        <h2 className="text-center font-display text-4xl font-semibold md:text-5xl">{t("community.offersTitle")}</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Lightbulb, title: t("community.offer1Title"), desc: t("community.offer1Desc"), link: "/matchmaker" },
            { icon: ArrowLeftRight, title: t("community.offer2Title"), desc: t("community.offer2Desc"), link: "/barter" },
            { icon: BookOpen, title: t("community.offer3Title"), desc: t("community.offer3Desc"), link: "/learn" },
            { icon: TrendingUp, title: t("community.offer4Title"), desc: t("community.offer4Desc") },
            { icon: MessageCircle, title: t("community.offer5Title"), desc: t("community.offer5Desc") },
            { icon: BadgeCheck, title: t("community.offer6Title"), desc: t("community.offer6Desc") },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 transition hover:shadow-craft">
              <f.icon className="h-8 w-8 text-secondary" />
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              {f.link && (
                <Link to={f.link as any} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  {t("community.tryIt")} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Skill Barter Preview */}
      {barters.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">{t("community.activeExchanges")}</h2>
              <p className="mt-2 text-muted-foreground">{t("community.activeExchangesDesc")}</p>
            </div>
            <Link to="/barter" className="hidden md:inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted">
              {t("community.viewAll")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {barters.slice(0, 4).map((b: any) => (
              <div key={b.id} className="rounded-2xl border border-border bg-card p-5">
                <p className="font-semibold">{b.posterName}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-full bg-accent/10 px-3 py-1 font-medium text-accent">{t("community.offers")}: {b.offerSkill}</span>
                  <ArrowLeftRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="rounded-full bg-secondary/10 px-3 py-1 font-medium text-secondary">{t("community.needs")}: {b.needSkill}</span>
                </div>
                {b.description && <p className="mt-2 text-xs text-muted-foreground">{b.description}</p>}
              </div>
            ))}
          </div>
          <Link to="/barter" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary md:hidden">
            {t("community.viewAllExchanges")} <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {/* What Certification Means */}
      <section className="mb-16 rounded-3xl border border-border bg-soft-highlight/40 p-8 md:p-12">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
              <Award className="h-3.5 w-3.5" /> {t("community.certifiedBadge")}
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold md:text-4xl">{t("community.certTitle")}</h2>
            <p className="mt-3 text-muted-foreground">
              {t("community.certDesc")}
            </p>
          </div>
          <ul className="space-y-3">
            {[
              t("community.certPoint1"),
              t("community.certPoint2"),
              t("community.certPoint3"),
              "Products listed directly — no approval queue",
              t("community.certPoint5"),
              t("community.certPoint6"),
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Success Stories */}
      <section className="mb-16">
        <h2 className="text-center font-display text-3xl font-semibold md:text-4xl">{t("community.storiesTitle")}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { name: "Meena Patil", district: "Dharwad", skill: "Tailoring", story: "Earned certification in 3 days. Listed 5 blouses on HastKala Haat. First order within 48 hours. Now earns Rs.800/day directly.", gain: "3.2x income" },
            { name: "Rekha Devi", district: "Raichur", skill: "Embroidery", story: "Used skill barter to get product photography help. Her listings now get 4x more views. Certified seller for 10 days.", gain: "4x visibility" },
            { name: "Priya Nair", district: "Bengaluru", skill: "Cooking", story: "AI Matchmaker suggested tiffin service. Used pricing helper to set rates. Currently serving 15 daily tiffins.", gain: "Rs.1,200/day" },
          ].map((s) => (
            <div key={s.name} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-display text-lg font-semibold text-primary">
                  {s.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.district} — {s.skill}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{s.story}</p>
              <div className="mt-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-secondary" />
                <span className="text-sm font-semibold text-secondary">{s.gain}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="mb-20 rounded-3xl bg-[#1a1a1a] p-8 md:p-12 text-white text-center">
        <MessageCircle className="mx-auto h-10 w-10 opacity-70" />
        <h2 className="mt-4 font-display text-3xl font-semibold md:text-4xl">{t("community.whatsappTitle")}</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-white/70">
          {t("community.whatsappDesc")}
        </p>
        <a
          href={`https://wa.me/${import.meta.env.VITE_BOT_PHONE || "919876543210"}?text=Hi%20%F0%9F%99%8F%20%2F%20%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%A4%E0%A5%87%20%2F%20%E0%B2%A8%E0%B2%AE%E0%B2%B8%E0%B3%8D%E0%B2%95%E0%B2%BE%E0%B2%B0%20%2F%20%E0%AE%B5%E0%AE%A3%E0%AE%95%E0%AF%8D%E0%AE%95%E0%AE%AE%E0%AF%8D%20%2F%20%E0%B4%A8%E0%B4%AE%E0%B4%B8%E0%B5%8D%E0%B4%95%E0%B4%BE%E0%B4%B0%E0%B4%82`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={showWaBanner}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#20bd5a]"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
          {t("community.whatsappButton")}
        </a>
      </section>
    </div>
  );
}
