import { API_BASE } from "@/lib/api-base";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeftRight, Plus, X } from "lucide-react";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/barter")({
  head: () => ({
    meta: [
      { title: "Skill Barter — HastKala" },
      {
        name: "description",
        content: "Exchange skills with other women entrepreneurs. No money needed to start.",
      },
    ],
  }),
  component: BarterPage,
});

const API = API_BASE;

interface BarterListing {
  id: string;
  posterName: string;
  offerSkill: string;
  needSkill: string;
  description?: string;
  district?: string;
  createdAt: string;
}

function BarterPage() {
  const { t } = useLang();
  const [listings, setListings] = useState<BarterListing[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    posterName: "",
    offerSkill: "",
    needSkill: "",
    description: "",
    district: "",
  });

  useEffect(() => {
    fetch(`${API}/api/barter`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setListings(d.data.listings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/barter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setListings((prev) => [data.data, ...prev]);
        setForm({ posterName: "", offerSkill: "", needSkill: "", description: "", district: "" });
        setShowForm(false);
      }
    } catch {
      // Network failure: keep the form open so the user can retry.
    }
    setSubmitting(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold">{t("barterTitle")}</h1>
          <p className="mt-2 text-muted-foreground">{t("barterSub")}</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          {showForm ? (
            <>
              <X className="h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Post Request
            </>
          )}
        </button>
      </div>

      {/* Post form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-3xl border border-border bg-card p-6 md:p-8"
        >
          <h2 className="font-display text-xl font-semibold">New Barter Request</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">{t("barterNameLabel")}</label>
              <input
                value={form.posterName}
                onChange={(e) => setForm({ ...form, posterName: e.target.value })}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">District (optional)</label>
              <input
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">{t("barterOfferLabel")}</label>
              <input
                value={form.offerSkill}
                onChange={(e) => setForm({ ...form, offerSkill: e.target.value })}
                required
                placeholder="e.g. tailoring, cooking..."
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">{t("barterNeedLabel")}</label>
              <input
                value={form.needSkill}
                onChange={(e) => setForm({ ...form, needSkill: e.target.value })}
                required
                placeholder="e.g. packaging, social media..."
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold">Details (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {submitting ? t("loading") : t("barterPostBtn")}
          </button>
        </form>
      )}

      {/* Listings */}
      <div className="mt-8">
        {loading ? (
          <p className="text-center text-muted-foreground">{t("loading")}</p>
        ) : listings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border py-16 text-center">
            <ArrowLeftRight className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-muted-foreground">No barter listings yet. Be the first!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {listings.map((l) => (
              <div key={l.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{l.posterName}</p>
                  {l.district && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {l.district}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="rounded-full bg-secondary/20 px-3 py-1 font-medium text-secondary">
                    Offers: {l.offerSkill}
                  </span>
                  <ArrowLeftRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                    Needs: {l.needSkill}
                  </span>
                </div>
                {l.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{l.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
