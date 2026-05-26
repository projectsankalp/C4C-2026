"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { LinkedPatient } from "@/lib/patients";
import type {
  AnsweredQuestion,
  TriageAssessResponse,
  Vitals,
} from "@/lib/types";
import { SeverityBadge } from "./SeverityBadge";

const BRIEFING_LANGS = [
  { code: "hi", label: "Hindi" },
  { code: "mr", label: "Marathi" },
  { code: "kn", label: "Kannada" },
  { code: "ta", label: "Tamil" },
];

export function ReferralCard({
  patient,
  symptoms,
  vitals,
  answered,
  result,
}: {
  patient: LinkedPatient;
  symptoms: string[];
  vitals: Vitals;
  answered: AnsweredQuestion[];
  result: TriageAssessResponse;
}) {
  const [briefingLang, setBriefingLang] = useState("hi");
  const [translating, setTranslating] = useState(false);
  const [translatedBriefing, setTranslatedBriefing] = useState<{
    lang: string;
    text: string;
  } | null>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);

  async function translateBriefing() {
    setTranslateError(null);
    setTranslatedBriefing(null);
    setTranslating(true);
    try {
      const r = await api.translate({
        text: result.doctor_briefing,
        target_language: briefingLang,
      });
      const out =
        (typeof r.translated_text === "string" && r.translated_text) ||
        (typeof r.translation === "string" && (r.translation as string)) ||
        JSON.stringify(r);
      setTranslatedBriefing({ lang: briefingLang, text: out });
    } catch (e) {
      setTranslateError(
        e instanceof ApiError ? e.message : (e as Error).message,
      );
    } finally {
      setTranslating(false);
    }
  }

  function shareWhatsapp() {
    const lines = [
      `*PulsePoint Referral — ${result.severity}*`,
      ``,
      `Patient: ${patient.name} (${patient.profile.age}/${patient.profile.gender})`,
      `Location: ${patient.location}`,
      `Conditions: ${patient.profile.known_conditions?.join(", ") || "none"}`,
      `Medications: ${patient.profile.medications?.join(", ") || "none"}`,
      ``,
      `*Symptoms:* ${symptoms.join(", ")}`,
      `*Vitals:* ${formatVitals(vitals)}`,
      ``,
      `*Doctor briefing:*`,
      result.doctor_briefing,
      ``,
      `Confidence: ${Math.round(result.confidence * 100)}%`,
      `Request ID: ${result.request_id}`,
    ].join("\n");
    const url = `https://wa.me/?text=${encodeURIComponent(lines)}`;
    window.open(url, "_blank");
  }

  function printPdf() {
    window.print();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card print:border-0 print:shadow-none">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 print:px-0">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-teal-600">
            PulsePoint · Doctor-Ready Referral
          </div>
          <div className="mt-1 flex items-center gap-3">
            <SeverityBadge severity={result.severity} size="md" />
            <span className="text-sm text-slate-600">
              {new Date().toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            type="button"
            onClick={shareWhatsapp}
            className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            Share via WhatsApp
          </button>
          <button
            type="button"
            onClick={printPdf}
            className="rounded-md bg-navy-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-navy-800"
          >
            Save as PDF
          </button>
        </div>
      </div>

      <div className="grid gap-5 p-5 text-sm md:grid-cols-2 print:px-0">
        <Field label="Patient">
          <div className="font-medium text-navy-900">{patient.name}</div>
          <div className="text-slate-600">
            {patient.profile.age} y · {patient.profile.gender} · {patient.relation}
          </div>
          <div className="text-slate-600">{patient.location}</div>
        </Field>

        <Field label="Vitals">{formatVitals(vitals)}</Field>

        <Field label="Symptoms">{symptoms.join(", ") || "—"}</Field>

        <Field label="History">
          <div>
            <span className="text-slate-500">Conditions:</span>{" "}
            {patient.profile.known_conditions?.join(", ") || "none"}
          </div>
          <div>
            <span className="text-slate-500">Medications:</span>{" "}
            {patient.profile.medications?.join(", ") || "none"}
          </div>
          <div>
            <span className="text-slate-500">Allergies:</span>{" "}
            {patient.profile.allergies?.join(", ") || "none"}
          </div>
        </Field>

        {answered.length > 0 && (
          <Field label="Interview Q&A" full>
            <ul className="space-y-1">
              {answered.map((a, i) => (
                <li key={i}>
                  <span className="text-slate-500">Q:</span> {a.question}
                  <br />
                  <span className="text-slate-500">A:</span>{" "}
                  <span className="font-medium text-navy-900">{a.answer}</span>
                </li>
              ))}
            </ul>
          </Field>
        )}

        <Field label="Top conditions" full>
          <ul className="list-inside list-disc">
            {result.top_conditions.map((c) => (
              <li key={c.icd10}>
                {c.name} ({c.icd10}) — {Math.round(c.prob * 100)}%
              </li>
            ))}
          </ul>
        </Field>

        <Field label="Doctor briefing" full>
          <p className="whitespace-pre-line">{result.doctor_briefing}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 print:hidden">
            <select
              value={briefingLang}
              onChange={(e) => setBriefingLang(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {BRIEFING_LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={translating}
              onClick={translateBriefing}
              className="rounded-md bg-teal-500 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
            >
              {translating ? "Translating…" : "Translate for patient"}
            </button>
          </div>
          {translateError && (
            <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-800 print:hidden">
              {translateError}
            </div>
          )}
          {translatedBriefing && (
            <div className="mt-2 rounded-md border border-teal-200 bg-teal-50 p-3 text-sm text-navy-900">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-teal-700">
                Translated ({translatedBriefing.lang})
              </div>
              <p className="whitespace-pre-line">{translatedBriefing.text}</p>
            </div>
          )}
        </Field>

        {result.red_flags.length > 0 && (
          <Field label="Red flags" full>
            <ul className="list-inside list-disc text-red-800">
              {result.red_flags.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </Field>
        )}
      </div>

      <footer className="border-t border-slate-100 px-5 py-3 text-[11px] text-slate-500 print:px-0">
        Not a diagnosis. AI-assisted triage. All sources cited; reasoning
        explainable. Request ID: {result.request_id}
      </footer>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm text-slate-800">{children}</div>
    </div>
  );
}

function formatVitals(v: Vitals): string {
  const parts: string[] = [];
  if (v.bp_systolic && v.bp_diastolic)
    parts.push(`BP ${v.bp_systolic}/${v.bp_diastolic}`);
  if (v.pulse_bpm) parts.push(`HR ${v.pulse_bpm}`);
  if (v.spo2 != null) parts.push(`SpO₂ ${v.spo2}%`);
  if (v.temp_c != null) parts.push(`Temp ${v.temp_c}°C`);
  if (v.blood_sugar_mg_dl != null)
    parts.push(`Glucose ${v.blood_sugar_mg_dl} mg/dL`);
  if (v.respiratory_rate != null) parts.push(`RR ${v.respiratory_rate}`);
  if (v.waist_size_inches != null)
    parts.push(`Waist ${v.waist_size_inches} in`);
  return parts.length ? parts.join(" · ") : "—";
}
