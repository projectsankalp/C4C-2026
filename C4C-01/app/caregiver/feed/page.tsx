"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingAnimation } from "@/components/LoadingAnimation";

interface LabFlag {
  name?: string;
  canonical?: string;
  value?: number;
  unit?: string;
  status?: string;
  range_low?: number | null;
  range_high?: number | null;
  explanation?: string | null;
}
interface LabFlagsPayload {
  flags?: LabFlag[];
  unflagged_count?: number;
  hallucination_check?: { passed?: boolean; blocked?: string[] };
}

interface FeedItem {
  id: string;
  patientId: string;
  patientName: string;
  patientLocation: string | null;
  permission: "VIEW_ONLY" | "TRIAGE" | "FULL";
  kind: "PDF" | "VOICE";
  filename: string | null;
  rawText: string;
  rawTextTruncated: boolean;
  symptoms: string[];
  modifiers: string[];
  labFlags: LabFlagsPayload | null;
  language: string | null;
  createdAt: string;
}

interface FeedSummary {
  total: number;
  patientsWithActivity: number;
  patientsLinked: number;
}

function relativeTime(iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function CaregiverFeedPage() {
  const [feed, setFeed] = useState<FeedItem[] | null>(null);
  const [summary, setSummary] = useState<FeedSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterPatient, setFilterPatient] = useState<string>("ALL");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/caregiver/feed");
        const raw = await r.text();
        let data: { feed?: FeedItem[]; summary?: FeedSummary; error?: string } = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          data = { error: `${r.status} ${r.statusText}: ${raw.slice(0, 200)}` };
        }
        if (!r.ok) throw new Error(data.error ?? "Failed");
        if (!cancelled) {
          setFeed(data.feed ?? []);
          setSummary(data.summary ?? null);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const patients = feed
    ? Array.from(
        new Map(feed.map((f) => [f.patientId, f.patientName])).entries(),
      )
    : [];

  const filtered = feed
    ? filterPatient === "ALL"
      ? feed
      : feed.filter((f) => f.patientId === filterPatient)
    : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            href="/caregiver"
            className="text-xs font-medium text-slate-500 hover:underline"
          >
            ← Caregiver Dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-navy-900">
            Patient Health Feed
          </h1>
          <p className="text-sm text-slate-600">
            Every report your linked family members have uploaded — voice notes
            and medical PDFs. You see this as soon as they save it.
          </p>
        </div>
        {summary && (
          <div className="rounded-lg bg-slate-50 px-4 py-2 text-xs text-slate-700 ring-1 ring-slate-200">
            <span className="font-semibold text-navy-900">
              {summary.total}
            </span>{" "}
            report{summary.total === 1 ? "" : "s"} from{" "}
            <span className="font-semibold text-navy-900">
              {summary.patientsWithActivity}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-navy-900">
              {summary.patientsLinked}
            </span>{" "}
            linked patient{summary.patientsLinked === 1 ? "" : "s"}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {feed && feed.length > 0 && patients.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 rounded-md bg-white p-2 ring-1 ring-slate-200">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Filter
          </span>
          <button
            type="button"
            onClick={() => setFilterPatient("ALL")}
            className={`rounded-full px-2.5 py-0.5 text-xs ring-1 ${
              filterPatient === "ALL"
                ? "bg-teal-500 text-white ring-teal-500"
                : "bg-white text-slate-700 ring-slate-200 hover:ring-teal-300"
            }`}
          >
            All
          </button>
          {patients.map(([pid, pname]) => (
            <button
              key={pid}
              type="button"
              onClick={() => setFilterPatient(pid)}
              className={`rounded-full px-2.5 py-0.5 text-xs ring-1 ${
                filterPatient === pid
                  ? "bg-teal-500 text-white ring-teal-500"
                  : "bg-white text-slate-700 ring-slate-200 hover:ring-teal-300"
              }`}
            >
              {pname}
            </button>
          ))}
        </div>
      )}

      {feed === null && !error && (
        <LoadingAnimation fullScreen={false} text="Loading feed..." />
      )}

      {feed && feed.length === 0 && !error && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <div className="text-3xl">🩺</div>
          <div className="mt-2 text-base font-semibold text-navy-900">
            Nothing here yet
          </div>
          <p className="mt-1 text-sm text-slate-600">
            When your linked patients upload a medical PDF or record a voice
            note, it shows up here automatically.
          </p>
        </div>
      )}

      {filtered && filtered.length > 0 && (
        <ul className="space-y-3">
          {filtered.map((item) => {
            const labs = item.labFlags?.flags ?? [];
            const abnormalLabs = labs.filter(
              (f) => f.status === "high" || f.status === "low",
            );
            const isOpen = expanded.has(item.id);
            return (
              <li
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-300"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/caregiver/triage?patient=${item.patientId}`}
                        className="text-base font-semibold text-navy-900 hover:underline"
                      >
                        {item.patientName}
                      </Link>
                      <span
                        title={`Permission: ${item.permission}`}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                      >
                        {item.permission}
                      </span>
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 ring-1 ring-teal-200">
                        {item.kind === "PDF" ? "📄 PDF" : "🎙 Voice"}
                      </span>
                      {abnormalLabs.length > 0 && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 ring-1 ring-red-200">
                          {abnormalLabs.length} abnormal lab
                          {abnormalLabs.length === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {item.patientLocation
                        ? `${item.patientLocation} · `
                        : ""}
                      {relativeTime(item.createdAt)} ·{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    className="text-xs font-semibold text-teal-700 hover:underline"
                  >
                    {isOpen ? "Hide details" : "Show details"}
                  </button>
                </div>

                {(item.symptoms.length > 0 || item.modifiers.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.symptoms.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-teal-500 px-2 py-0.5 text-[11px] font-medium text-white"
                      >
                        {s}
                      </span>
                    ))}
                    {item.modifiers.map((m) => (
                      <span
                        key={m}
                        className="rounded-full bg-coral-500 px-2 py-0.5 text-[11px] font-medium text-white"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )}

                {abnormalLabs.length > 0 && (
                  <div className="mt-2 rounded-md bg-red-50 p-2 ring-1 ring-red-100">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-red-700">
                      Abnormal labs
                    </div>
                    <ul className="mt-1 space-y-0.5 text-xs text-red-900">
                      {abnormalLabs.map((f, i) => (
                        <li key={i}>
                          <span className="font-semibold">
                            {f.canonical ?? f.name}
                          </span>{" "}
                          = {f.value} {f.unit}{" "}
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold">
                            {String(f.status ?? "").toUpperCase()}
                          </span>
                          {f.range_low != null && f.range_high != null && (
                            <span className="text-red-700">
                              {" "}
                              · ref {f.range_low}–{f.range_high}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {isOpen && (
                  <div className="mt-3 rounded-md bg-slate-50 p-3 ring-1 ring-slate-100">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {item.kind === "PDF" ? "Extracted text" : "Transcript"}
                      {item.language && item.language !== "en"
                        ? ` · ${item.language}`
                        : ""}
                      {item.filename ? ` · ${item.filename}` : ""}
                    </div>
                    <pre className="mt-1 max-h-48 overflow-y-auto whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800">
                      {item.rawText}
                      {item.rawTextTruncated ? "…" : ""}
                    </pre>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
