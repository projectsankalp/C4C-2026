import { API_BASE } from "@/lib/api-base";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Users, MapPin, Handshake, Send, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/network")({
  head: () => ({ meta: [{ title: "Community Network — HastKala" }] }),
  component: NetworkPage,
});

const API = API_BASE;

interface Community {
  id: string;
  name: string;
  district: string;
  craftType: string;
  headName: string;
  memberCount: number;
  description: string;
}

interface CollabRequest {
  id: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  fromCommunity?: Community;
  toCommunity?: Community;
}

function NetworkPage() {
  const { t } = useLang();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [requests, setRequests] = useState<CollabRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fromCommunityId: "", toCommunityId: "", type: "material", description: "", quantity: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/network/communities`).then(r => r.json()).then(d => { if (d.success) setCommunities(d.data.communities); }).catch(() => {});
    fetch(`${API}/api/network/requests`).then(r => r.json()).then(d => { if (d.success) setRequests(d.data.requests); }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fromCommunityId || !form.toCommunityId || !form.description) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/api/network/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (d.success) {
        setSent(true);
        setShowForm(false);
        setForm({ fromCommunityId: "", toCommunityId: "", type: "material", description: "", quantity: "" });
        // Refresh requests
        fetch(`${API}/api/network/requests`).then(r => r.json()).then(d => { if (d.success) setRequests(d.data.requests); }).catch(() => {});
      }
    } catch {}
    setSending(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-10">
      {/* Header */}
      <div className="text-center">
        <Handshake className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 font-display text-4xl font-semibold">{t("network.title")}</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          {t("network.desc")}
        </p>
      </div>

      {/* Community Directory */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">{t("network.activeCommunities")}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map(c => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-5 transition hover:shadow-craft">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm">{c.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {c.district}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{c.craftType}</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{c.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" /> {c.memberCount} {t("network.members")} - {t("network.ledBy")} {c.headName}
                </span>
                <button
                  onClick={() => { setShowForm(true); setForm(f => ({ ...f, toCommunityId: c.id })); }}
                  className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
                >
                  {t("network.connect")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collaboration Request Form */}
      {showForm && (
        <section className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="font-display text-xl font-semibold">{t("network.sendRequest")}</h2>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">{t("network.yourCommunity")}</label>
              <select value={form.fromCommunityId} onChange={e => setForm(f => ({ ...f, fromCommunityId: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">{t("network.selectCommunity")}</option>
                {communities.filter(c => c.id !== form.toCommunityId).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">{t("network.requestType")}</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                <option value="material">{t("network.materials")}</option>
                <option value="skill">{t("network.skillExchange")}</option>
                <option value="order">{t("network.jointOrder")}</option>
                <option value="other">{t("network.other")}</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold">{t("network.whatNeed")}</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder={t("network.needPlaceholder")}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" rows={3} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">{t("network.quantityOptional")}</label>
              <input value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                placeholder={t("network.quantityPlaceholder")}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="flex items-end gap-3">
              <button type="submit" disabled={sending || !form.fromCommunityId || !form.description}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50">
                <Send className="h-4 w-4" /> {sending ? t("network.sending") : t("network.sendRequestBtn")}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-muted-foreground hover:text-foreground">{t("common.cancel")}</button>
            </div>
          </form>
        </section>
      )}

      {sent && (
        <div className="mt-6 rounded-2xl bg-accent/10 p-4 text-center text-sm text-accent font-semibold">
          {t("network.requestSent")}
        </div>
      )}

      {/* Recent Collaboration Requests */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">{t("network.recentCollaborations")}</h2>
        <div className="mt-6 space-y-3">
          {requests.map(r => (
            <div key={r.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${r.status === "accepted" ? "bg-accent/10 text-accent" : r.status === "declined" ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"}`}>
                <Handshake className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {r.fromCommunity?.name || t("common.unknown")} <ArrowRight className="inline h-3 w-3 mx-1" /> {r.toCommunity?.name || t("common.unknown")}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground truncate">{r.description}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.status === "accepted" ? "bg-accent/10 text-accent" : r.status === "declined" ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"}`}>
                  {r.status}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">{r.type}</p>
              </div>
            </div>
          ))}
          {requests.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">{t("network.empty")}</p>}
        </div>
      </section>

      {/* ---- Talent Request ---- */}
      <TalentRequestSection />
    </div>
  );
}

// ── Talent Request ────────────────────────────────────────────────────────────
const CRAFTS = [
  "Handloom Weaving", "Pottery", "Kasuti Embroidery", "Jewellery Making",
  "Coconut Shell Craft", "Banana Fiber Craft", "Terracotta", "Block Printing",
  "Natural Dyeing", "Bamboo Craft", "Leather Craft", "Other",
];

function TalentRequestSection() {
  const API = API_BASE;
  const [form, setForm] = useState({ buyerName: "", buyerPhone: "", craftType: "", description: "" });
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [notified, setNotified] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.buyerName.trim() || !form.craftType || !form.description.trim()) return;
    setState("submitting");
    try {
      const res = await fetch(`${API}/api/network/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (d.success) {
        setNotified(d.data.artisansNotified ?? 0);
        setState("done");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  return (
    <section className="mt-14">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-craft">
        <div className="bg-primary px-8 py-8 text-primary-foreground">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-foreground/15 text-lg">🎨</span>
            <div>
              <h2 className="font-display text-2xl font-semibold">Need an artisan for your project?</h2>
              <p className="mt-0.5 text-sm text-primary-foreground/80">
                Post your craft need — matching artisans get a WhatsApp notification instantly.
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          {state === "done" ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="text-4xl">🎉</span>
              <p className="font-display text-2xl font-semibold text-artisan-green">Request sent!</p>
              <p className="text-sm text-muted-foreground">
                {notified > 0
                  ? `${notified} artisan${notified > 1 ? "s" : ""} have been notified on WhatsApp.`
                  : "Your request has been posted. Artisans will be notified as they join."}
              </p>
              <button
                type="button"
                onClick={() => { setState("idle"); setForm({ buyerName: "", buyerPhone: "", craftType: "", description: "" }); }}
                className="mt-2 rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold transition hover:bg-soft-highlight"
              >
                Post another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold">Your name *</span>
                <input
                  value={form.buyerName}
                  onChange={e => setForm(f => ({ ...f, buyerName: e.target.value }))}
                  placeholder="e.g. Arjun Kumar"
                  required
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">WhatsApp number <span className="font-normal text-muted-foreground">(optional, for direct replies)</span></span>
                <input
                  value={form.buyerPhone}
                  onChange={e => setForm(f => ({ ...f, buyerPhone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  type="tel"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Craft type needed *</span>
                <select
                  value={form.craftType}
                  onChange={e => setForm(f => ({ ...f, craftType: e.target.value }))}
                  required
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select a craft…</option>
                  {CRAFTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold">What do you need? *</span>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. I need 50 handwoven cotton bags for a corporate gift, delivery in 3 weeks, budget ₹300–400 per piece."
                  required
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
              {state === "error" && (
                <p className="text-xs text-destructive md:col-span-2">Something went wrong. Please try again.</p>
              )}
              <div className="flex items-center gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={state === "submitting"}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {state === "submitting" ? "Posting…" : "🔔 Notify matching artisans"}
                </button>
                <p className="text-xs text-muted-foreground">Artisans get a WhatsApp ping immediately.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
