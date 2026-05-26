import { API_BASE } from "@/lib/api-base";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2, Lightbulb } from "lucide-react";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/matchmaker")({
  head: () => ({
    meta: [
      { title: "AI Business Matchmaker — HastKala" },
      {
        name: "description",
        content: "Get a personalized business idea and roadmap based on your skills and budget.",
      },
    ],
  }),
  component: MatchmakerPage,
});

const API = API_BASE;

interface MatchResult {
  idea: string;
  investment: string;
  estimatedProfit: string;
  roadmap: string[];
  affordable: boolean;
}

function MatchmakerPage() {
  const { t } = useLang();
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API}/api/ai/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, budget: Number(budget), location }),
      });
      const data = await res.json();
      if (data.success) setResult(data.data);
      else setError(data.message || t("error"));
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-16">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-1.5 text-sm font-semibold text-secondary">
          <Sparkles className="h-4 w-4" /> AI-Powered
        </span>
        <h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">{t("matchTitle")}</h1>
        <p className="mt-3 text-muted-foreground">{t("matchSub")}</p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-10 space-y-5 rounded-3xl border border-border bg-card p-6 md:p-8"
      >
        <div>
          <label className="mb-1.5 block text-sm font-semibold">{t("matchSkillLabel")}</label>
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. tailoring, cooking, mehendi, craft..."
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("matchBudgetLabel")}</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="500"
              min="0"
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("matchLocationLabel")}</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bengaluru, Dharwad..."
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? (
            t("loading")
          ) : (
            <>
              {t("matchBtn")} <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
        {error && <p className="text-center text-sm text-destructive">{error}</p>}
      </form>

      {/* Result */}
      {result && (
        <div className="mt-8 rounded-3xl border border-border bg-soft-highlight/40 p-6 md:p-8">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary/20 text-secondary">
              <Lightbulb className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-semibold">{result.idea}</h2>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-card px-3 py-1 font-medium">
                  Investment: {result.investment}
                </span>
                <span className="rounded-full bg-card px-3 py-1 font-medium">
                  Profit: {result.estimatedProfit}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Your 5-Step Roadmap
            </p>
            <ol className="mt-3 space-y-2">
              {result.roadmap.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
