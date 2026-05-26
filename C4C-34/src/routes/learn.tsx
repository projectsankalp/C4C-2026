import { API_BASE } from "@/lib/api-base";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, Award, ArrowRight, Star } from "lucide-react";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learning Modules — HastKala" },
      {
        name: "description",
        content: "Complete learning modules to earn your HastKala Certified Seller badge.",
      },
    ],
  }),
  component: LearnPage,
});

const API = API_BASE;

interface Module {
  id: string;
  title: string;
  description: string;
  content?: string;
  pointsReward: number;
  orderIndex: number;
}

const MODULE_ICONS = ["💰", "📸", "📦"];
const MODULE_COLORS = [
  "from-secondary/10 to-secondary/5 border-secondary/20",
  "from-primary/10 to-primary/5 border-primary/20",
  "from-accent/10 to-accent/5 border-accent/20",
];

function LearnPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [memberId, setMemberId] = useState("");
  const [completing, setCompleting] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch(`${API}/api/community/modules`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setModules(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function completeModule(moduleId: string) {
    if (!memberId.trim()) {
      setToast("Enter your Member ID to track progress.");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    setCompleting(moduleId);
    try {
      const res = await fetch(`${API}/api/community/complete-module`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: memberId.trim(), moduleId }),
      });
      const data = await res.json();
      if (data.success) {
        setCompleted((prev) => new Set([...prev, moduleId]));
        const msg = data.data.certified
          ? "🎉 Congratulations! You are now HastKala Certified!"
          : `✓ Module complete! You now have ${data.data.points} points.`;
        setToast(msg);
        setTimeout(() => setToast(""), 4000);
      }
    } catch {
      setToast("Could not save progress. Try again.");
      setTimeout(() => setToast(""), 3000);
    }
    setCompleting(null);
  }

  const totalPoints = modules.reduce((s, m) => s + m.pointsReward, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          <BookOpen className="h-4 w-4" /> Learning Modules
        </span>
        <h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">
          Learn. Earn. Get Certified.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Complete all modules to earn <strong>{totalPoints} points</strong> and unlock your
          HastKala Certified Seller badge.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">
            {completed.size} of {modules.length} modules completed
          </span>
          <span className="font-bold text-secondary">
            {completed.size * 50} / {totalPoints} pts
          </span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-all duration-500"
            style={{ width: modules.length ? `${(completed.size / modules.length) * 100}%` : "0%" }}
          />
        </div>
        {completed.size === modules.length && modules.length > 0 && (
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-accent">
            <Award className="h-4 w-4" /> All modules complete! You qualify for certification.
          </p>
        )}
      </div>

      {/* Member ID input */}
      <div className="mt-4 flex gap-3">
        <input
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          placeholder="Enter your Member ID to track progress..."
          className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <Link
          to="/join"
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:text-primary"
        >
          New? Join →
        </Link>
      </div>

      {/* Modules */}
      <div className="mt-8 space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading modules...</p>
        ) : (
          modules.map((mod, i) => {
            const isCompleted = completed.has(mod.id);
            const isOpen = expanded === mod.id;
            return (
              <div
                key={mod.id}
                className={`rounded-3xl border bg-gradient-to-br ${MODULE_COLORS[i % 3]} overflow-hidden transition`}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : mod.id)}
                  className="flex w-full items-center gap-4 p-6 text-left"
                >
                  <span className="text-3xl">{MODULE_ICONS[i % 3]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Module {mod.orderIndex}
                      </p>
                      {isCompleted && <CheckCircle2 className="h-4 w-4 text-accent" />}
                    </div>
                    <h3 className="mt-0.5 font-display text-xl font-semibold">{mod.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{mod.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs font-bold text-secondary">
                      <Star className="h-3 w-3" /> {mod.pointsReward} pts
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border/50 bg-card/60 px-6 py-5">
                    {mod.content && (
                      <p className="text-sm leading-relaxed text-foreground/85 mb-5">
                        {mod.content}
                      </p>
                    )}
                    <button
                      onClick={() => completeModule(mod.id)}
                      disabled={isCompleted || completing === mod.id}
                      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                        isCompleted
                          ? "bg-accent/10 text-accent cursor-default"
                          : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Completed
                        </>
                      ) : completing === mod.id ? (
                        "Saving..."
                      ) : (
                        <>
                          Mark as Complete <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 rounded-3xl bg-primary p-8 text-primary-foreground text-center">
        <Award className="mx-auto h-10 w-10 opacity-80" />
        <h2 className="mt-4 font-display text-2xl font-semibold">
          Complete all modules to get certified
        </h2>
        <p className="mt-2 text-sm opacity-80">
          Certified sellers list products directly on HastKala Haat — no approval needed, no
          middlemen.
        </p>
        <Link
          to="/community"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-foreground px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary-foreground/90"
        >
          Learn about the journey <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
