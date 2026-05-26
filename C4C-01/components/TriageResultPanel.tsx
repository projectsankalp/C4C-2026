"use client";

import type { TriageAssessResponse } from "@/lib/types";
import { SeverityBadge } from "./SeverityBadge";
import { SEVERITY_META, pct } from "@/lib/format";
import { recommendDepartment, urgencyTagline } from "@/lib/departments";

export function TriageResultPanel({
  r,
  symptoms,
}: {
  r: TriageAssessResponse;
  symptoms?: string[];
}) {
  const meta = SEVERITY_META[r.severity];
  const dept = recommendDepartment(symptoms ?? []);
  return (
    <div className="space-y-5">
      <div className={`rounded-xl ring-1 ring-inset ${meta.ring} ${meta.bg} p-5`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Severity verdict
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <SeverityBadge severity={r.severity} size="lg" />
              <span className={`text-base font-semibold ${meta.text}`}>
                {meta.tagline}
              </span>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 ring-1 ring-inset ring-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Recommended OPD
              </span>
              <span className="rounded-full bg-navy-900 px-2.5 py-0.5 text-xs font-bold text-white">
                {dept.name}
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                {dept.code}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-700">{r.next_action}</p>
            <p className="mt-1 text-xs italic text-slate-600">
              {urgencyTagline(r.severity)}
            </p>
          </div>
          <div className="text-right text-sm">
            <div className="text-xs text-slate-500">Confidence</div>
            <div className="text-2xl font-bold text-navy-900">{pct(r.confidence)}</div>
          </div>
        </div>

        {r.rules_fired?.length > 0 && (
          <div className="mt-4 rounded-md bg-white/60 p-3 ring-1 ring-inset ring-white/80">
            <div className="text-xs font-semibold uppercase text-slate-600">
              Hardcoded rules fired (cannot be overridden)
            </div>
            <ul className="mt-1 list-inside list-disc text-sm text-slate-800">
              {r.rules_fired.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {r.red_flags?.length > 0 && (
        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-red-700">
            Red flags
          </div>
          <ul className="mt-1 list-inside list-disc text-sm text-red-900">
            {r.red_flags.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      )}

      <div
        className={`rounded-lg border-l-4 p-4 ${
          r.hallucination_check.passed
            ? "border-green-500 bg-green-50"
            : "border-red-600 bg-red-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div
            className={`text-xs font-semibold uppercase tracking-wide ${
              r.hallucination_check.passed ? "text-green-700" : "text-red-700"
            }`}
          >
            Hallucination Guard ·{" "}
            {r.hallucination_check.passed
              ? "passed (no LLM-invented claims)"
              : `${r.hallucination_check.blocked.length} claim(s) blocked`}
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            req {r.request_id.slice(0, 8)}
          </span>
        </div>
        {r.hallucination_check.passed ? (
          <p className="mt-1 text-xs text-slate-600">
            Every flag in this output appears in the deterministic ground-truth
            set. The LLM did not invent any clinical claim.
          </p>
        ) : (
          <>
            <p className="mt-1 text-xs text-red-900">
              The LLM produced claims not in the deterministic ground-truth set.
              These are blocked from patient view and logged in the audit
              dashboard:
            </p>
            <ul className="mt-2 list-inside list-disc text-sm text-red-900">
              {r.hallucination_check.blocked.map((b, i) => (
                <li key={i}>
                  <span className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs">
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <div className="mb-2 text-sm font-semibold text-navy-900">
            Top conditions
          </div>
          <ul className="space-y-2">
            {r.top_conditions.map((c) => (
              <li
                key={c.icd10}
                className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium text-navy-900">{c.name}</div>
                  <div className="text-xs text-slate-500">ICD-10 · {c.icd10}</div>
                </div>
                <div className="font-mono text-sm font-semibold text-teal-600">
                  {pct(c.prob)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-2 text-sm font-semibold text-navy-900">
            Severity probabilities
          </div>
          <div className="space-y-1.5">
            {Object.entries(r.tier_probabilities)
              .sort((a, b) => b[1] - a[1])
              .map(([tier, p]) => (
                <div key={tier} className="text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">{tier}</span>
                    <span className="font-mono text-slate-600">{pct(p)}</span>
                  </div>
                  <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-teal-500"
                      style={{ width: `${Math.round(p * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {r.reasoning_steps?.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-semibold text-navy-900">
            Reasoning trace
          </div>
          <ol className="list-inside list-decimal space-y-1 rounded-md bg-slate-50 p-3 text-sm text-slate-800">
            {r.reasoning_steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      )}

      {r.feature_importance?.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-semibold text-navy-900">
            What drove the decision (top features)
          </div>
          <div className="space-y-1.5">
            {r.feature_importance.slice(0, 8).map((f) => {
              const v = Math.abs(f.shap);
              const max = Math.max(
                ...r.feature_importance.map((x) => Math.abs(x.shap)),
              );
              const w = max ? Math.round((v / max) * 100) : 0;
              return (
                <div key={f.feature} className="text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">{f.feature}</span>
                    <span className="font-mono text-slate-500">
                      {f.shap.toFixed(3)}
                    </span>
                  </div>
                  <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full ${f.shap >= 0 ? "bg-coral-500" : "bg-slate-400"}`}
                      style={{ width: `${w}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-lg bg-navy-900 p-4 text-white">
          <div className="text-xs font-semibold uppercase tracking-wide text-teal-300">
            Doctor briefing
          </div>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-100">
            {r.doctor_briefing}
          </p>
        </div>

        <div>
          <div className="mb-2 text-sm font-semibold text-navy-900">Sources</div>
          <ul className="space-y-1.5">
            {r.sources.map((s) => (
              <li key={s.id} className="text-sm">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-700 hover:underline"
                >
                  {s.title}
                </a>
              </li>
            ))}
            {r.sources.length === 0 && (
              <li className="text-xs text-slate-500">No sources cited.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <span>
          Hallucination check:{" "}
          {r.hallucination_check.passed ? (
            <span className="font-semibold text-green-700">passed</span>
          ) : (
            <span className="font-semibold text-red-700">
              {r.hallucination_check.blocked.length} blocked
            </span>
          )}
        </span>
        <span>·</span>
        <span>request_id: {r.request_id}</span>
        <span>·</span>
        <span>
          models:{" "}
          {Object.entries(r.model_versions)
            .map(([k, v]) => `${k}=${v}`)
            .join(", ")}
        </span>
      </div>
    </div>
  );
}
