"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { LinkedPatient } from "@/lib/patients";
import { SeverityBadge } from "@/components/SeverityBadge";
import { TrendChart, classifyTrend } from "@/components/TrendChart";
import { formatTimestamp } from "@/lib/format";
import { LoadingAnimation } from "@/components/LoadingAnimation";

export default function CaregiverPage() {
  const { data: session } = useSession();
  const [patients, setPatients] = useState<LinkedPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const r = await fetch("/api/patients");
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Failed to load");
        if (!cancelled) setPatients(data.patients);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-hero px-8 py-10 text-white shadow-glow relative overflow-hidden animate-fade-up flex flex-wrap items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none animate-float" />
        <div className="relative z-10 max-w-xl">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-200">
            Caregiver Network
          </span>
          <h1 className="text-3xl font-extrabold font-display tracking-tight mt-1 text-white">
            Caregiver Portal
          </h1>
          <p className="text-sm text-slate-100/90 leading-relaxed mt-2 font-sans">
            As a remote caregiver, your role is the vital bridge of support for your family.
            Monitor health metrics, analyze clinical trends, and initiate AI-assisted remote triages
            to get guidance and doctor-ready referrals for your loved ones.
          </p>
        </div>
        <div className="relative z-10 flex flex-col items-end gap-1.5 text-xs text-cyan-100/95 bg-white/10 backdrop-blur border border-white/20 p-4 rounded-2xl">
          <div>
            Signed in as{" "}
            <span className="font-bold text-white">
              {session?.user?.name ?? "—"}
            </span>
          </div>
          <div className="font-semibold text-white/90">
            {patients.length} patient{patients.length === 1 ? "" : "s"} linked
          </div>
          <Link
            href="/caregiver/feed"
            className="mt-1 font-bold text-cyan-200 hover:text-white transition flex items-center gap-1"
          >
            Patient health feed <span className="text-xs">→</span>
          </Link>
        </div>
      </div>

      {loading && (
        <LoadingAnimation fullScreen={false} text="Loading linked patients..." />
      )}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {!loading && !error && patients.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <div className="text-2xl">👨‍👩‍👧</div>
          <div className="mt-2 text-base font-semibold text-navy-900">
            No patients linked yet
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Ask the patient to generate a 6-digit code from their account, then{" "}
            <Link href="/account" className="font-semibold text-teal-700 hover:underline">
              redeem it on your account page →
            </Link>
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {patients.map((p) => (
          <Link
            key={p.id}
            href={`/caregiver/triage?patient=${p.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-5 shadow-card transition hover:border-teal-400 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {p.relation}
                </div>
                <div className="text-lg font-semibold text-navy-900">{p.name}</div>
                <div className="text-xs text-slate-500">
                  {p.profile.age} y · {p.profile.gender} · {p.location}
                </div>
              </div>
              {p.last_severity ? (
                <SeverityBadge severity={p.last_severity} size="sm" />
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  No triage yet
                </span>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Health risk score</span>
                <span className="font-semibold text-navy-900">
                  {p.health_score}/100
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full ${
                    p.health_score >= 80
                      ? "bg-green-500"
                      : p.health_score >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${p.health_score}%` }}
                />
              </div>
              {p.risk_breakdown && (
                <div className="mt-2 grid grid-cols-5 gap-0.5 text-[9px] text-slate-500">
                  <BreakdownCell label="Labs" value={p.risk_breakdown.lab_trends} max={30} />
                  <BreakdownCell label="Triage" value={p.risk_breakdown.triage_history} max={25} />
                  <BreakdownCell label="Vitals" value={p.risk_breakdown.vitals_pattern} max={20} />
                  <BreakdownCell label="Meds" value={p.risk_breakdown.medication_adherence} max={15} />
                  <BreakdownCell label="Cond." value={p.risk_breakdown.condition_flags} max={10} />
                </div>
              )}
            </div>

            {p.trends && p.trends.length > 0 && (
              <div className="mt-3 space-y-1.5 rounded-md bg-slate-50 p-2 ring-1 ring-slate-100">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Trend Intelligence
                </div>
                {p.trends.slice(0, 2).map((t) => (
                  <TrendChart
                    key={t.label}
                    series={{
                      label: t.label,
                      unit: t.unit,
                      values: t.values,
                      goodIsHigh: t.goodIsHigh,
                    }}
                  />
                ))}
                {worseningAlert(p.trends) && (
                  <div className="mt-1 rounded bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700 ring-1 ring-red-200">
                    ⚠ Worsening trend — caregiver alert
                  </div>
                )}
              </div>
            )}

            {p.latest_report && (
              <div className="mt-3 rounded-md bg-teal-50 px-3 py-2 ring-1 ring-teal-100">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold uppercase tracking-wide text-teal-700">
                    {p.latest_report.kind === "PDF"
                      ? "📄 New report uploaded"
                      : "🎙 New voice note"}
                  </span>
                  <span className="text-teal-700">
                    {relativeTime(p.latest_report.created_at)}
                  </span>
                </div>
                {p.latest_report.symptoms.length > 0 && (
                  <div className="mt-1 truncate text-[11px] text-navy-900">
                    {p.latest_report.symptoms.slice(0, 4).join(", ")}
                    {p.latest_report.symptoms.length > 4 ? "…" : ""}
                  </div>
                )}
                {(p.reports_count ?? 0) > 1 && (
                  <div className="mt-1 text-[10px] text-teal-700">
                    +{(p.reports_count ?? 0) - 1} earlier report
                    {(p.reports_count ?? 0) - 1 === 1 ? "" : "s"}
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-1">
              {(p.profile.known_conditions ?? []).slice(0, 3).map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700"
                >
                  {c}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {p.last_seen_iso
                  ? `Last triage ${formatTimestamp(Date.parse(p.last_seen_iso))}`
                  : "Last triage —"}
              </span>
              <span className="font-semibold text-teal-700">Help now →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function BreakdownCell({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div title={`${label}: ${value}/${max}`}>
      <div className="h-1 overflow-hidden rounded bg-slate-200">
        <div className="h-full bg-teal-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-0.5 truncate">{label}</div>
    </div>
  );
}

function worseningAlert(
  trends: NonNullable<LinkedPatient["trends"]>,
): boolean {
  return trends.some(
    (t) =>
      classifyTrend(t.values, t.goodIsHigh ?? false).direction === "Worsening",
  );
}

function relativeTime(iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}
