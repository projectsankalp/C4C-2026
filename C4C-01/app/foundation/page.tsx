"use client";

import { useEffect, useState, useCallback } from "react";
import { ThreeDAnomalyMap } from "@/components/ThreeDAnomalyMap";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  totalPatients: number;
  screenedToday: number;
  highRiskToday: number;
  anomalyCount: number;
}

interface ClusterAlert {
  type: "CLUSTER";
  village: string;
  count: number;
  latestSeverity: string;
  message: string;
  action: string;
}

interface SpikeAlert {
  type: "SPIKE";
  todayCount: number;
  yesterdayCount: number;
  message: string;
  action: string;
}

interface MissedFollowup {
  type: "MISSED_FOLLOWUP";
  patientId: string;
  patientName: string;
  village: string;
  severity: string;
  hoursAgo: number;
  message: string;
  action: string;
}

interface SanitationSignal {
  type: "SANITATION";
  village: string;
  count: number;
  hints: string[];
  message: string;
  action: string;
}

interface Patient {
  id: string;
  patientName: string;
  patientId: string;
  age: number | null;
  gender: string | null;
  location: string | null;
  severity: string;
  symptoms: string[];
  createdAt: string;
  sanitationRisk: { flagged: boolean; level: string };
}

interface DashboardData {
  stats: Stats;
  anomalies: {
    clusters: ClusterAlert[];
    spikes: SpikeAlert[];
    missedFollowups: MissedFollowup[];
    sanitationSignals: SanitationSignal[];
  };
  recentPatients: Patient[];
}

// ─── Severity helpers ─────────────────────────────────────────────────────────

function severityBg(s: string) {
  switch (s) {
    case "EMERGENCY": return "bg-red-900 text-white";
    case "URGENT": return "bg-red-600 text-white";
    case "MODERATE": case "HIGH": return "bg-amber-500 text-white";
    case "LOW": return "bg-emerald-600 text-white";
    default: return "bg-slate-400 text-white";
  }
}

function severityDot(s: string) {
  switch (s) {
    case "EMERGENCY": return "bg-red-900";
    case "URGENT": return "bg-red-500";
    case "MODERATE": case "HIGH": return "bg-amber-500";
    default: return "bg-emerald-500";
  }
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diffMs / 3_600_000);
  if (h < 1) return `${Math.floor(diffMs / 60_000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Anomaly Card ─────────────────────────────────────────────────────────────

function AnomalyCard({
  icon,
  title,
  message,
  action,
  colorClass,
  pulseClass,
  onResolve,
}: {
  icon: string;
  title: string;
  message: string;
  action: string;
  colorClass: string;
  pulseClass?: string;
  onResolve?: () => void;
}) {
  return (
    <div className={`rounded-xl border p-4 shadow-sm flex flex-col justify-between ${colorClass}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 text-xl ${pulseClass ?? ""}`}>{icon}</span>
        <div>
          <div className="text-sm font-bold">{title}</div>
          <p className="mt-1 text-xs leading-relaxed opacity-90">{message}</p>
          <p className="mt-2 text-xs font-semibold opacity-85">→ {action}</p>
        </div>
      </div>
      {onResolve && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onResolve();
            }}
            className="rounded-lg bg-teal-600 hover:bg-teal-700 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm transition"
          >
            ✅ Mark Followed Up
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FoundationDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/foundation/anomalies");
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      setData(await res.json());
      setLastRefreshed(new Date());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveFollowup = async (patientId: string) => {
    try {
      const res = await fetch("/api/foundation/anomalies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      if (!res.ok) throw new Error("Failed to mark patient followed up");
      fetchData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60_000); // auto-refresh every 60s
    return () => clearInterval(id);
  }, [fetchData]);

  const allAnomalies = data
    ? [
        ...data.anomalies.clusters,
        ...data.anomalies.spikes,
        ...data.anomalies.missedFollowups,
        ...data.anomalies.sanitationSignals,
      ]
    : [];

  const filteredPatients = (data?.recentPatients ?? []).filter((p) => {
    const matchSearch =
      !search ||
      p.patientName.toLowerCase().includes(search.toLowerCase()) ||
      (p.location ?? "").toLowerCase().includes(search.toLowerCase());
    const matchSeverity =
      severityFilter === "ALL" || p.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-hero px-8 py-10 text-white shadow-glow relative overflow-hidden animate-fade-up flex flex-wrap items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none animate-float" />
        <div className="relative z-10 max-w-xl">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-200">
            Epidemiological Control
          </span>
          <h1 className="text-3xl font-extrabold font-display tracking-tight mt-1 text-white flex items-center gap-2">
            <span>🌾</span> Foundation Surveillance Portal
          </h1>
          <p className="text-sm text-slate-100/90 leading-relaxed mt-2 font-sans">
            As a foundation worker, your role is to spearhead community wellness and early disease detection on the ground.
            Monitor real-time rural patient surveillance, leverage 3D GIS anomaly modeling, track sanitation-linked risk factors,
            and manage critical follow-up tasks to prevent localized outbreaks.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-4 bg-white/10 backdrop-blur border border-white/20 p-4 rounded-2xl">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-cyan-200">System Status</div>
            <div className="text-xs font-semibold text-white/90">
              Updated: {lastRefreshed.toLocaleTimeString()}
            </div>
          </div>
          <button
            id="refresh-btn"
            onClick={fetchData}
            className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-primary shadow-float hover:bg-slate-50 transition transform hover:-translate-y-0.5"
          >
            ↻ Refresh Feed
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Could not load data:</strong> {error}
        </div>
      )}

      {loading && !data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      )}

      {data && (
        <>
          {/* ── KPI Stats ──────────────────────────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Total Patients",
                value: data.stats.totalPatients,
                sub: "all time",
                color: "bg-slate-900 text-white",
                icon: "👥",
              },
              {
                label: "Screened Today",
                value: data.stats.screenedToday,
                sub: new Date().toLocaleDateString("en-IN", { dateStyle: "medium" }),
                color: "bg-teal-600 text-white",
                icon: "📋",
              },
              {
                label: "High Risk Today",
                value: data.stats.highRiskToday,
                sub: "URGENT + EMERGENCY",
                color:
                  data.stats.highRiskToday > 0
                    ? "bg-red-600 text-white"
                    : "bg-emerald-600 text-white",
                icon: "⚠️",
              },
              {
                label: "Active Anomalies",
                value: data.stats.anomalyCount,
                sub: "requires attention",
                color:
                  data.stats.anomalyCount > 0
                    ? "bg-orange-500 text-white"
                    : "bg-emerald-600 text-white",
                icon: "🔍",
              },
            ].map((kpi) => (
              <div key={kpi.label} className={`rounded-xl p-5 shadow-sm ${kpi.color}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
                    {kpi.label}
                  </span>
                  <span className="text-xl">{kpi.icon}</span>
                </div>
                <div className="mt-2 text-3xl font-extrabold">{kpi.value}</div>
                <div className="mt-1 text-xs opacity-70">{kpi.sub}</div>
              </div>
            ))}
          </div>

          <ThreeDAnomalyMap patients={data.recentPatients} anomalies={allAnomalies} />

          {/* ── Anomaly Detection Panel ─────────────────────────────────────── */}
          <section>
            <h2 className="mb-3 text-base font-bold text-slate-800">
              🚨 Anomaly Detection
              {allAnomalies.length === 0 && (
                <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  All clear
                </span>
              )}
            </h2>

            {allAnomalies.length === 0 ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center text-sm text-emerald-700">
                ✅ No anomalies detected in the last 7 days. All populations within normal range.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.anomalies.clusters.map((c, i) => (
                  <AnomalyCard
                    key={`cluster-${i}`}
                    icon="🔴"
                    title={`Cluster Alert — ${c.village}`}
                    message={c.message}
                    action={c.action}
                    colorClass="border-red-200 bg-red-50 text-red-900"
                    pulseClass="animate-pulse"
                  />
                ))}
                {data.anomalies.spikes.map((s, i) => (
                  <AnomalyCard
                    key={`spike-${i}`}
                    icon="📈"
                    title="Rapid Case Spike"
                    message={s.message}
                    action={s.action}
                    colorClass="border-orange-200 bg-orange-50 text-orange-900"
                  />
                ))}
                {data.anomalies.missedFollowups.map((m, i) => (
                  <AnomalyCard
                    key={`followup-${i}`}
                    icon="⏰"
                    title={`Missed Follow-up — ${m.patientName}`}
                    message={m.message}
                    action={m.action}
                    colorClass="border-yellow-200 bg-yellow-50 text-yellow-900"
                    onResolve={() => resolveFollowup(m.patientId)}
                  />
                ))}
                {data.anomalies.sanitationSignals.map((s, i) => (
                  <AnomalyCard
                    key={`san-${i}`}
                    icon="💧"
                    title={`Sanitation Signal — ${s.village}`}
                    message={s.message}
                    action={s.action}
                    colorClass="border-cyan-200 bg-cyan-50 text-cyan-900"
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Patient Intelligence Feed ───────────────────────────────────── */}
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-800">
                📋 Patient Intelligence Feed
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id="patient-search"
                  type="text"
                  placeholder="Search by name or village…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm shadow-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
                <select
                  id="severity-filter"
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm shadow-sm outline-none focus:border-teal-400"
                >
                  <option value="ALL">All Severities</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="URGENT">Urgent</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            {filteredPatients.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                No patients match your filters.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Patient</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Risk</th>
                      <th className="px-4 py-3">Symptoms</th>
                      <th className="px-4 py-3">Flags</th>
                      <th className="px-4 py-3">Screened</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredPatients.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{p.patientName}</div>
                          <div className="text-xs text-slate-400">
                            {p.age ? `${p.age}y` : "?"} · {p.gender ?? "?"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {p.location ?? <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${severityDot(p.severity)}`} />
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${severityBg(p.severity)}`}
                            >
                              {p.severity}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {p.symptoms.slice(0, 3).join(", ")}
                          {p.symptoms.length > 3 ? "…" : ""}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(p.severity === "URGENT" || p.severity === "EMERGENCY") && (
                              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                                High Risk
                              </span>
                            )}
                            {p.sanitationRisk.flagged && (
                              <span className="rounded-full bg-cyan-100 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-700">
                                Sanitation · {p.sanitationRisk.level}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {timeAgo(p.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
                  Showing {filteredPatients.length} of {data.recentPatients.length} patients
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
