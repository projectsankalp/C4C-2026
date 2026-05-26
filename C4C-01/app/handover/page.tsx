"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card } from "@/components/Card";
import type { MedReachResponse } from "@/lib/types";

const SAMPLE_PATIENT = `{
  "name": "Ramesh Kulkarni",
  "age": 68,
  "gender": "male",
  "known_conditions": ["Hypertension", "Type 2 diabetes"],
  "medications": ["Telmisartan 40mg", "Metformin 500mg"],
  "allergies": ["Sulfa drugs"]
}`;

const SAMPLE_HISTORY = `[
  {
    "date": "2026-05-01",
    "severity": "URGENT",
    "symptoms": ["chest pain", "dizziness", "pain radiating to left arm"],
    "vitals": { "bp_systolic": 168, "bp_diastolic": 96, "pulse_bpm": 102, "spo2": 94 },
    "doctor_briefing": "68y M with HTN, T2DM presents with substernal chest pain radiating to left arm, dizziness. BP 168/96, HR 102, SpO2 94%. ECG advised."
  },
  {
    "date": "2026-04-12",
    "severity": "MEDIUM",
    "symptoms": ["fatigue", "shortness of breath on exertion"],
    "vitals": { "bp_systolic": 152, "bp_diastolic": 90 }
  }
]`;

const TRANSLATE_TARGETS = [
  { code: "hi", label: "Hindi" },
  { code: "mr", label: "Marathi" },
  { code: "kn", label: "Kannada" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "bn", label: "Bengali" },
];

export default function HandoverPage() {
  const [patientJson, setPatientJson] = useState(SAMPLE_PATIENT);
  const [historyJson, setHistoryJson] = useState(SAMPLE_HISTORY);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<MedReachResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translation, setTranslation] = useState<{ lang: string; text: string } | null>(
    null,
  );
  const [target, setTarget] = useState("hi");

  async function summarize() {
    setError(null);
    setResult(null);
    setTranslation(null);
    let patient_data: Record<string, unknown>;
    let triage_history: Record<string, unknown>[];
    try {
      patient_data = JSON.parse(patientJson);
    } catch {
      setError("Patient JSON is invalid.");
      return;
    }
    try {
      triage_history = JSON.parse(historyJson);
      if (!Array.isArray(triage_history)) throw new Error("must be an array");
    } catch (e) {
      setError(`Triage history JSON is invalid: ${(e as Error).message}`);
      return;
    }
    setBusy(true);
    try {
      const r = await api.summarize({ patient_data, triage_history });
      setResult(r);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function translateSummary() {
    if (!result) return;
    const text =
      result.summary ||
      (typeof result === "object" ? JSON.stringify(result, null, 2) : String(result));
    setTranslation(null);
    setTranslating(true);
    try {
      const r = await api.translate({ text, target_language: target });
      const out =
        (typeof r.translated_text === "string" && r.translated_text) ||
        (typeof r.translation === "string" && (r.translation as string)) ||
        JSON.stringify(r);
      setTranslation({ lang: target, text: out });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : (e as Error).message);
    } finally {
      setTranslating(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Doctor Handover</h1>
        <p className="text-sm text-slate-600">
          Generate a clinical summary for a doctor handover from patient profile +
          triage history. Powers the MedReach async-consult queue from the
          blueprint.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Patient profile (JSON)">
          <textarea
            value={patientJson}
            onChange={(e) => setPatientJson(e.target.value)}
            rows={9}
            className="w-full rounded-md border border-slate-300 bg-white p-3 font-mono text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </Card>
        <Card title="Triage history (JSON array)">
          <textarea
            value={historyJson}
            onChange={(e) => setHistoryJson(e.target.value)}
            rows={9}
            className="w-full rounded-md border border-slate-300 bg-white p-3 font-mono text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={busy}
          onClick={summarize}
          className="rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
        >
          {busy ? "Summarizing…" : "Generate clinical summary"}
        </button>
        <button
          type="button"
          onClick={() => {
            setPatientJson(SAMPLE_PATIENT);
            setHistoryJson(SAMPLE_HISTORY);
          }}
          className="text-xs text-slate-500 hover:underline"
        >
          Reset to sample
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {result !== null && (
        <Card title="Summary">
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-slate-900 p-4 text-xs text-slate-100">
            {JSON.stringify(result, null, 2)}
          </pre>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Translate for patient
            </span>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {TRANSLATE_TARGETS.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={translating}
              onClick={translateSummary}
              className="rounded-md bg-navy-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50"
            >
              {translating ? "Translating…" : "Translate summary"}
            </button>
          </div>
          {translation && (
            <div className="mt-3 rounded-md border border-teal-200 bg-teal-50 p-3 text-sm text-navy-900">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-teal-700">
                Translated ({translation.lang})
              </div>
              <p className="whitespace-pre-wrap">{translation.text}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
