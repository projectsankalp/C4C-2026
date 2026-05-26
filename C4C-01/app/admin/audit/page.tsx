"use client";

import { useEffect, useState } from "react";
import { clearAuditLog, readAuditLog, type AuditEntry } from "@/lib/audit";
import { Card } from "@/components/Card";
import { formatTimestamp } from "@/lib/format";

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    setEntries(readAuditLog());
    const onChange = () => setEntries(readAuditLog());
    window.addEventListener("pulsepoint:audit-changed", onChange);
    return () => window.removeEventListener("pulsepoint:audit-changed", onChange);
  }, []);

  const total = entries.length;
  const okCount = entries.filter((e) => e.ok).length;
  const blockedCount = entries.filter(
    (e) => e.hallucination_blocked && e.hallucination_blocked.length > 0,
  ).length;
  const avgLatency =
    total === 0
      ? 0
      : Math.round(entries.reduce((s, e) => s + e.latency_ms, 0) / total);

  function exportCsv() {
    const header = [
      "timestamp",
      "endpoint",
      "ok",
      "status",
      "latency_ms",
      "request_id",
      "models",
      "hallucination_passed",
      "blocked_items",
      "error",
    ];
    const rows = entries.map((e) =>
      [
        new Date(e.ts).toISOString(),
        e.endpoint,
        e.ok ? "true" : "false",
        e.status ?? "",
        e.latency_ms,
        e.request_id ?? "",
        e.model_versions
          ? Object.entries(e.model_versions)
              .map(([k, v]) => `${k}=${v}`)
              .join("|")
          : "",
        e.hallucination_passed === undefined
          ? ""
          : e.hallucination_passed
            ? "true"
            : "false",
        e.hallucination_blocked?.join("|") ?? "",
        e.error ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulsepoint-audit-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Bias Audit Log</h1>
          <p className="text-sm text-slate-600">
            Every AI call is logged. Hallucination Guard runs on every output;
            blocked items appear in red.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportCsv}
            disabled={!total}
            className="rounded-md bg-navy-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Clear audit log?")) clearAuditLog();
            }}
            disabled={!total}
            className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total calls" value={total} />
        <Stat label="Successful" value={okCount} accent="text-green-700" />
        <Stat
          label="Hallucinations blocked"
          value={blockedCount}
          accent={blockedCount > 0 ? "text-red-700" : "text-green-700"}
        />
        <Stat label="Avg latency (ms)" value={avgLatency} />
      </div>

      <Card title="Recent calls">
        {total === 0 ? (
          <p className="text-sm text-slate-500">
            No calls logged yet. Run a triage from the caregiver dashboard to populate
            this log.
          </p>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 text-left uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Endpoint</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Latency</th>
                  <th className="px-3 py-2">request_id</th>
                  <th className="px-3 py-2">Models</th>
                  <th className="px-3 py-2">Hallucination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {entries.map((e) => (
                  <tr key={e.id} className="text-slate-700">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {formatTimestamp(e.ts)}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px]">
                      {e.endpoint}
                    </td>
                    <td className="px-3 py-2">
                      {e.ok ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                          {e.status ?? "ok"}
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">
                          {e.status ?? "fail"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono">{e.latency_ms} ms</td>
                    <td className="px-3 py-2 font-mono text-[11px]">
                      {e.request_id ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-[11px]">
                      {e.model_versions
                        ? Object.entries(e.model_versions)
                            .map(([k, v]) => `${k}=${v}`)
                            .join(" · ")
                        : "—"}
                    </td>
                    <td className="px-3 py-2">
                      {e.hallucination_passed === undefined ? (
                        <span className="text-slate-400">n/a</span>
                      ) : e.hallucination_passed ? (
                        <span className="text-green-700">passed</span>
                      ) : (
                        <span className="font-semibold text-red-700">
                          blocked: {e.hallucination_blocked?.join(", ")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-bold ${accent ?? "text-navy-900"}`}>
        {value}
      </div>
    </div>
  );
}
