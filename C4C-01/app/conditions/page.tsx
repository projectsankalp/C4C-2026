"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { ConditionCardResponse } from "@/lib/types";
import { Card } from "@/components/Card";

const PRESETS = [
  { icd10: "I21", name: "Acute myocardial infarction" },
  { icd10: "J18", name: "Pneumonia" },
  { icd10: "E11", name: "Type 2 diabetes mellitus" },
  { icd10: "I10", name: "Hypertension" },
  { icd10: "K29", name: "Gastritis" },
];

export default function ConditionsPage() {
  const [icd10, setIcd10] = useState("");
  const [name, setName] = useState("");
  const [reading, setReading] = useState<"grade6" | "layman" | "professional">("grade6");
  const [language, setLanguage] = useState("en");
  const [busy, setBusy] = useState(false);
  const [card, setCard] = useState<ConditionCardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function lookup(code = icd10, label = name) {
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api.conditionCard({
        icd10: code.trim(),
        name: label || null,
        language,
        reading_level: reading,
      });
      setCard(r);
    } catch (e) {
      setError(e instanceof ApiError ? `API ${e.status}: ${e.message}` : (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Condition Cards</h1>
        <p className="text-sm text-slate-600">
          Plain-English explanations of any ICD-10 code, sourced from
          WHO/CDC/NIH/Mayo/NHS.
        </p>
      </div>

      <Card title="Look up a condition">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="block md:col-span-1">
            <span className="text-xs font-medium text-slate-600">ICD-10 code</span>
            <input
              value={icd10}
              onChange={(e) => setIcd10(e.target.value)}
              placeholder="I21"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-medium text-slate-600">
              Name (optional)
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acute myocardial infarction"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </label>
          <div className="grid grid-cols-2 gap-2 md:col-span-1">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Lang</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
              >
                <option value="en">en</option>
                <option value="hi">hi</option>
                <option value="ta">ta</option>
                <option value="mr">mr</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Reading</span>
              <select
                value={reading}
                onChange={(e) =>
                  setReading(e.target.value as "grade6" | "layman" | "professional")
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
              >
                <option value="grade6">grade 6</option>
                <option value="layman">layman</option>
                <option value="professional">professional</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!icd10.trim() || busy}
            onClick={() => lookup()}
            className="rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
          >
            {busy ? "Loading…" : "Get card"}
          </button>
          <span className="ml-2 text-xs text-slate-500">Try:</span>
          {PRESETS.map((p) => (
            <button
              key={p.icd10}
              type="button"
              onClick={() => {
                setIcd10(p.icd10);
                setName(p.name);
                lookup(p.icd10, p.name);
              }}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700 hover:bg-slate-200"
            >
              {p.icd10} · {p.name}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}
      </Card>

      {card && (
        <Card title={`${card.name} · ${card.unsupported ? "(unsupported)" : ""}`}>
          <p className="whitespace-pre-line text-sm text-slate-800">
            {card.plain_summary}
          </p>

          <div className="mt-5">
            <div className="mb-2 text-sm font-semibold text-navy-900">
              What to do
            </div>
            <ol className="list-inside list-decimal space-y-1 text-sm text-slate-800">
              {card.action_steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>

          {card.sources?.length > 0 && (
            <div className="mt-5">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sources
              </div>
              <ul className="space-y-1 text-sm">
                {card.sources.map((s) => (
                  <li key={s.id}>
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
              </ul>
            </div>
          )}

          <div className="mt-3 text-[11px] text-slate-500">
            request_id: {card.request_id}
          </div>
        </Card>
      )}
    </div>
  );
}
