import { API_BASE } from "@/lib/api-base";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join the Community — HastKala" },
      {
        name: "description",
        content:
          "Join the HastKala community and start your journey to becoming a certified seller.",
      },
    ],
  }),
  component: JoinPage,
});

const API = API_BASE;

const SKILLS = [
  "Tailoring",
  "Cooking / Food",
  "Handmade Crafts",
  "Mehendi",
  "Beauty Services",
  "Embroidery",
  "Pottery / Terracotta",
  "Bamboo / Cane Craft",
  "Other",
];

function JoinPage() {
  const { t } = useLang();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    skills: "",
    language: "en",
  });
  const [submitted, setSubmitted] = useState(false);
  const [member, setMember] = useState<{ name?: string; [key: string]: unknown } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/community/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMember(data.data);
        setSubmitted(true);
      } else setError(data.message || t("error"));
    } catch {
      setError(t("error"));
    }
    setLoading(false);
  }

  if (submitted && member) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <span className="grid h-20 w-20 mx-auto place-items-center rounded-full bg-accent/10 text-accent">
          <CheckCircle2 className="h-10 w-10" />
        </span>
        <h1 className="mt-6 font-display text-4xl font-semibold">Welcome, {member.name}!</h1>
        <p className="mt-3 text-muted-foreground">
          You've joined the HastKala community. Start learning to earn your certification and become a direct seller.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/learn"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Start Learning <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/community"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition hover:bg-muted"
          >
            View Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-10 md:py-16">
      <div className="grid gap-12 md:grid-cols-2 md:items-start">
        {/* Left — pitch */}
        <div className="md:sticky md:top-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
            <Logo className="h-3.5 w-3.5" /> Free to join
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
            Start your journey as a certified artisan seller.
          </h1>
          <p className="mt-4 text-muted-foreground">
            No app download. No fees. Just your name, your skills, and your ambition.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              {
                title: "Learn in your language",
                desc: "Modules available in Kannada, Hindi, and English.",
              },
              {
                title: "Earn as you learn",
                desc: "Every module completed earns you points toward certification.",
              },
              {
                title: "Sell without middlemen",
                desc: "Certified sellers list products directly. Income goes to you.",
              },
            ].map((item) => (
              <li key={item.title} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-border bg-card p-7 md:p-9 space-y-5"
        >
          <h2 className="font-display text-2xl font-semibold">Create your profile</h2>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Lakshmi Devi"
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">WhatsApp Number</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 9876543210"
              type="tel"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Dharwad, Karnataka"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">Your Skill</label>
            <select
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select a skill...</option>
              {SKILLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">Preferred Language</label>
            <div className="flex gap-3">
              {[
                ["en", "English"],
                ["kn", "ಕನ್ನಡ"],
                ["hi", "हिंदी"],
              ].map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setForm({ ...form, language: code })}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                    form.language === code
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? (
              "Joining..."
            ) : (
              <>
                {" "}
                Join the Community <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Already a member?{" "}
            <Link to="/learn" className="font-semibold text-primary hover:underline">
              Go to learning modules →
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
