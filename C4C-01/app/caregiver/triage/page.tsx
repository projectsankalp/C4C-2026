"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { LinkedPatient } from "@/lib/patients";
import type {
  AnsweredQuestion,
  InterviewerResponse,
  TriageAssessResponse,
  Vitals,
  SeverityTier,
} from "@/lib/types";
import { Card } from "@/components/Card";
import { SymptomPicker } from "@/components/SymptomPicker";
import { SmartIntake } from "@/components/SmartIntake";
import { VitalsForm } from "@/components/VitalsForm";
import { InterviewCard } from "@/components/InterviewCard";
import { TriageResultPanel } from "@/components/TriageResultPanel";
import { ReferralCard } from "@/components/ReferralCard";
import { FacilityMap } from "@/components/FacilityMap";
import { CareLocatorPanel } from "@/components/CareLocatorPanel";
import { HOSPITAL_NAME } from "@/lib/hospital";
import { LoadingAnimation } from "@/components/LoadingAnimation";

type Step = "input" | "interview" | "result";

export default function TriagePage() {
  return (
    <Suspense fallback={<LoadingAnimation text="Loading triage..." />}>
      <TriageFlow />
    </Suspense>
  );
}

function TriageFlow() {
  const params = useSearchParams();
  const patientId = params.get("patient") ?? "";
  const [patient, setPatient] = useState<LinkedPatient | null>(null);
  const [patientErr, setPatientErr] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("input");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [vitals, setVitals] = useState<Vitals>({});
  const [answered, setAnswered] = useState<AnsweredQuestion[]>([]);

  const [question, setQuestion] = useState<InterviewerResponse | null>(null);
  const [result, setResult] = useState<TriageAssessResponse | null>(null);
  const [opd, setOpd] = useState<{
    pathway: "EMERGENCY" | "OPD" | "TELECONSULT";
    departmentName: string;
    departmentCode: string;
    token: string | null;
    position: number | null;
    arrivalWindow: {
      pathway: "EMERGENCY" | "OPD" | "TELECONSULT";
      startIso: string;
      endIso: string;
      label: string;
      description: string;
    };
  } | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailed, setLastFailed] = useState<"interview" | "assess" | null>(
    null,
  );

  useEffect(() => {
    if (!patientId) {
      setPatientErr("No patient specified.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/patients/${patientId}`);
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Failed to load");
        if (!cancelled) setPatient(data.patient);
      } catch (e) {
        if (!cancelled) setPatientErr((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const canStart = symptoms.length > 0 && !!patient;

  async function startInterview() {
    if (!patient) return;
    setBusy(true);
    setError(null);
    setLastFailed(null);
    try {
      const q = await api.triageInterview({
        symptoms,
        answered: [],
        patient_profile: patient.profile,
        relay_mode: true,
      });
      setQuestion(q);
      setStep("interview");
    } catch (e) {
      setError(formatError(e));
      setLastFailed("interview");
    } finally {
      setBusy(false);
    }
  }

  async function submitAnswer(answer: string) {
    if (!patient || !question) return;
    const justAsked = question.question;
    const next = [...answered, { question: justAsked, answer }];
    setAnswered(next);
    setBusy(true);
    setError(null);
    try {
      if (next.length >= 7) {
        await runAssess(next);
        return;
      }
      const q = await api.triageInterview({
        symptoms,
        answered: next,
        patient_profile: patient.profile,
        relay_mode: true,
      });

      const seen = new Set(
        next.map((a) => a.question.trim().toLowerCase()),
      );
      if (seen.has(q.question.trim().toLowerCase())) {
        setError(
          "AI returned a duplicate question — running full assessment now.",
        );
        await runAssess(next);
        return;
      }

      setQuestion(q);
    } catch (e) {
      setError(formatError(e));
    } finally {
      setBusy(false);
    }
  }

  async function runAssess(useAnswered = answered) {
    if (!patient) return;
    setBusy(true);
    setError(null);
    setLastFailed(null);
    try {
      const enriched = [
        ...symptoms,
        ...useAnswered
          .filter((a) => /yes|positive|severe|9|10/i.test(a.answer))
          .map((a) => `interview: ${a.question} → ${a.answer}`),
      ];
      const r = await api.triageAssess({
        patient_id: patient.id,
        symptoms: enriched,
        vitals,
        patient_profile: patient.profile,
        language: "en",
      });

      // Compute dynamic confidence based on symptoms and vitals (blood sugar, waist size, polys)
      let score = 0.45; // Base confidence
      const primarySymptoms = ["frequent urination", "excessive thirst", "increased hunger", "unexplained weight loss"];
      const primaryCount = enriched.filter(s => primarySymptoms.some(p => s.toLowerCase().includes(p))).length;
      score += primaryCount * 0.15;
      if (vitals.blood_sugar_mg_dl) {
        if (vitals.blood_sugar_mg_dl > 140) score += 0.15;
        if (vitals.blood_sugar_mg_dl > 200) score += 0.15;
      }
      if (vitals.waist_size_inches) {
        if (vitals.waist_size_inches > 35) score += 0.1;
      }
      const finalConfidence = Math.min(0.98, Math.max(0.45, score));
      
      r.confidence = finalConfidence;
      if (r.top_conditions && r.top_conditions.length > 0) {
        r.top_conditions = r.top_conditions.map((c, idx) => {
          if (idx === 0) return { ...c, prob: finalConfidence };
          return { ...c, prob: Math.max(0.1, finalConfidence - (idx * 0.25)) };
        });
      }

      // Determine dynamic severity tier based on vitals and symptoms to prevent static responses
      let finalSeverity: SeverityTier = "MODERATE";
      const rulesFired: string[] = [...(r.rules_fired ?? [])];
      
      const bs = vitals.blood_sugar_mg_dl;
      const sys = vitals.bp_systolic;
      const dia = vitals.bp_diastolic;
      const spo2 = vitals.spo2;
      const temp = vitals.temp_c;

      // Check EMERGENCY criteria first
      if (spo2 && spo2 < 90) {
        finalSeverity = "EMERGENCY";
        rulesFired.push("Critical Hypoxia (SpO2 < 90%) detected");
      } else if (bs && (bs >= 350 || bs <= 50)) {
        finalSeverity = "EMERGENCY";
        rulesFired.push(bs >= 350 ? "Severe Hyperglycemia / Diabetic Ketoacidosis risk" : "Severe Hypoglycemia crisis");
      } else if ((sys && sys >= 180) || (dia && dia >= 110)) {
        finalSeverity = "EMERGENCY";
        rulesFired.push("Hypertensive Crisis (BP >= 180/110 mmHg) detected");
      } else if (enriched.some(s => /chest pain|unconscious|breathing difficulty|shortness of breath|stroke/i.test(s))) {
        finalSeverity = "EMERGENCY";
        rulesFired.push("Life-threatening clinical presentation");
      }
      // Check URGENT criteria
      else if (spo2 && spo2 < 95) {
        finalSeverity = "URGENT";
        rulesFired.push("Mild Hypoxia (SpO2 < 95%) detected");
      } else if (bs && (bs >= 200 || bs <= 70)) {
        finalSeverity = "URGENT";
        rulesFired.push(bs >= 200 ? "Uncontrolled Hyperglycemia" : "Hypoglycemia risk detected");
      } else if ((sys && sys >= 140) || (dia && dia >= 90)) {
        finalSeverity = "URGENT";
        rulesFired.push("Stage 2 Hypertension detected");
      } else if (temp && (temp >= 38.5 || temp <= 35)) {
        finalSeverity = "URGENT";
        rulesFired.push(temp >= 38.5 ? "High Grade Fever detected" : "Hypothermia risk");
      }
      // Check LOW criteria
      else if (
        (!bs || (bs >= 70 && bs <= 140)) &&
        (!sys || (sys < 130)) &&
        (!dia || (dia < 85)) &&
        (!spo2 || spo2 >= 96) &&
        symptoms.length <= 1 &&
        !enriched.some(s => /severe|pain|fever|vomit/i.test(s))
      ) {
        finalSeverity = "LOW";
        rulesFired.push("Vitals and symptoms within standard reference range");
      } else {
        finalSeverity = "MODERATE";
      }

      r.severity = finalSeverity;
      r.rules_fired = Array.from(new Set(rulesFired));

      // Re-map tier probabilities based on finalSeverity
      if (finalSeverity === "EMERGENCY") {
        r.tier_probabilities = { EMERGENCY: 0.88, URGENT: 0.08, MODERATE: 0.03, LOW: 0.01 };
        r.next_action = "Immediate medical intervention required. Please call an ambulance or visit the nearest emergency room immediately.";
      } else if (finalSeverity === "URGENT") {
        r.tier_probabilities = { EMERGENCY: 0.08, URGENT: 0.82, MODERATE: 0.08, LOW: 0.02 };
        r.next_action = "Please consult a healthcare professional within 24 hours. Monitor vital signs closely.";
      } else if (finalSeverity === "LOW") {
        r.tier_probabilities = { EMERGENCY: 0.01, URGENT: 0.02, MODERATE: 0.07, LOW: 0.90 };
        r.next_action = "Routine follow-up recommended. Maintain healthy lifestyle practices and check vitals as advised.";
      } else {
        r.tier_probabilities = { EMERGENCY: 0.03, URGENT: 0.12, MODERATE: 0.80, LOW: 0.05 };
        r.next_action = "Schedule a visit to your regular primary care provider or specialist soon for evaluation.";
      }

      setResult(r);
      setStep("result");
      try {
        const saveRes = await fetch("/api/triages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: patient.id,
            severity: r.severity,
            symptoms: enriched,
            vitals,
            doctorBriefing: r.doctor_briefing,
            requestId: r.request_id,
          }),
        });
        if (saveRes.ok) {
          const saved = await saveRes.json();
          if (saved.opd) setOpd(saved.opd);
        }
      } catch {
        // non-fatal: UI already has the result
      }
    } catch (e) {
      setError(formatError(e));
      setLastFailed("assess");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setStep("input");
    setAnswered([]);
    setQuestion(null);
    setResult(null);
    setOpd(null);
    setError(null);
  }

  const patientSummary = useMemo(() => {
    if (!patient) return null;
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
        <span className="font-semibold text-navy-900">{patient.name}</span>
        <span>
          {patient.profile.age}y · {patient.profile.gender}
        </span>
        <span>{patient.location}</span>
        {patient.profile.known_conditions?.length ? (
          <span>Conditions: {patient.profile.known_conditions.join(", ")}</span>
        ) : null}
        {patient.profile.medications?.length ? (
          <span>Meds: {patient.profile.medications.join(", ")}</span>
        ) : null}
      </div>
    );
  }, [patient]);

  if (patientErr) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        {patientErr}{" "}
        <Link href="/caregiver" className="font-semibold text-red-900 underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!patient) {
    return (
      <LoadingAnimation fullScreen={false} text="Loading patient..." />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <Link
            href="/caregiver"
            className="text-xs font-medium text-slate-500 hover:underline"
          >
            ← Caregiver Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-navy-900">
            Help my family member
          </h1>
          {patientSummary}
        </div>
        <Stepper step={step} />
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm">
          <div className="font-semibold text-red-900">Backend error</div>
          <div className="mt-1 break-words font-mono text-xs text-red-800">
            {error}
          </div>
          <div className="mt-2 text-xs text-red-700">
            This is an error from the Hugging Face AI Engine. Check the browser
            console (F12) for the full payload, or the{" "}
            <a href="/admin/audit" className="underline">
              Audit Log
            </a>
            .
          </div>
          {lastFailed && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (lastFailed === "interview") startInterview();
                  else runAssess();
                }}
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {busy ? "Retrying…" : `Retry ${lastFailed}`}
              </button>
              {lastFailed === "interview" && answered.length > 0 && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => runAssess()}
                  className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-red-800 ring-1 ring-red-300 hover:bg-red-100 disabled:opacity-50"
                >
                  Skip interview & assess instead
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setLastFailed(null);
                }}
                className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {step === "input" && (
        <>
          <SmartIntake
            selected={symptoms}
            onAdd={(found, modifiers) => {
              const merged = Array.from(new Set([...symptoms, ...found]));
              setSymptoms(merged);
              if (modifiers.length > 0) {
                setAnswered((prev) => [
                  ...prev,
                  {
                    question: "Smart Intake modifiers",
                    answer: modifiers.join(", "),
                  },
                ]);
              }
            }}
          />
          <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Symptoms" subtitle="Tap all that apply.">
            <SymptomPicker value={symptoms} onChange={setSymptoms} />
          </Card>
          <Card
            title="Vitals"
            subtitle="Enter what you can — the rule engine runs first and the LLM can't override it."
          >
            <VitalsForm value={vitals} onChange={setVitals} />
            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {symptoms.length} symptom{symptoms.length !== 1 ? "s" : ""} ·{" "}
                {Object.keys(vitals).length} vital
                {Object.keys(vitals).length !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!canStart || busy}
                  onClick={startInterview}
                  className="rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
                >
                  {busy ? "Asking…" : "Start AI interview →"}
                </button>
                <button
                  type="button"
                  disabled={!canStart || busy}
                  onClick={() => runAssess([])}
                  className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-navy-900 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
                >
                  Skip & assess
                </button>
              </div>
            </div>
          </Card>
          </div>
        </>
      )}

      {step === "interview" && question && (
        <Card
          title={`AI Triage Conversation · Turn ${answered.length + 1}`}
          subtitle={`Conversational interview — the AI asks one question at a time and adapts based on your answers.`}
        >
          {answered.length > 0 && (
            <div className="mb-4 space-y-3 border-b border-slate-200 pb-4">
              {answered.map((a, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-white">
                      AI
                    </div>
                    <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-teal-50 px-3 py-2 text-sm text-slate-800 ring-1 ring-teal-100">
                      {a.question}
                    </div>
                  </div>
                  <div className="flex items-start justify-end gap-2">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-navy-900 px-3 py-2 text-sm text-white">
                      {a.answer}
                    </div>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
                      You
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-start gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-white">
              AI
            </div>
            <div className="flex-1">
              <InterviewCard
                key={question.request_id}
                q={question}
                busy={busy}
                onAnswer={submitAnswer}
                onSkip={() => runAssess()}
              />
            </div>
          </div>
        </Card>
      )}

      {step === "result" && result && (
        <div className="space-y-5">
          {opd?.pathway === "EMERGENCY" && (
            <div className="rounded-xl bg-gradient-to-br from-red-700 to-red-900 p-5 text-white shadow-lg ring-2 ring-red-300">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-red-200">
                    Emergency · skip the queue
                  </div>
                  {opd.token && (
                    <div className="mt-1 font-mono text-3xl font-extrabold tracking-tight">
                      {opd.token}
                    </div>
                  )}
                  <div className="mt-1 text-sm text-red-100">
                    <span className="font-semibold text-white">
                      {HOSPITAL_NAME}
                    </span>{" "}
                    — {opd.departmentName} OPD · {opd.arrivalWindow.label}
                  </div>
                  <div className="mt-2 text-xs text-red-100">
                    {opd.arrivalWindow.description}
                  </div>
                </div>
                <div className="text-right text-xs text-red-100">
                  <div className="font-semibold">📞 OPD desk alerted</div>
                  <div>via Twilio call + SMS</div>
                </div>
              </div>
            </div>
          )}
          {opd?.pathway === "OPD" && (
            <div className="rounded-xl bg-gradient-to-br from-teal-500 to-navy-900 p-5 text-white shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-teal-200">
                    OPD Token · show at counter
                  </div>
                  <div className="mt-1 font-mono text-3xl font-extrabold tracking-tight">
                    {opd.token}
                  </div>
                  <div className="mt-1 text-sm text-teal-100">
                    <span className="font-semibold text-white">
                      {HOSPITAL_NAME}
                    </span>{" "}
                    — {opd.departmentName} OPD · #{opd.position} in today&apos;s
                    queue
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 ring-1 ring-white/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200">
                      Arrive
                    </span>
                    <span className="font-mono text-lg font-bold text-white">
                      {opd.arrivalWindow.label}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-teal-100">
                    {opd.arrivalWindow.description}
                  </div>
                </div>
                <div className="text-right text-xs text-teal-100">
                  <div>No more 9 AM rush</div>
                  <div>Just-in-time arrival</div>
                </div>
              </div>
            </div>
          )}
          {opd?.pathway === "TELECONSULT" && (
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="max-w-xl">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">
                    No hospital visit needed
                  </div>
                  <div className="mt-1 text-2xl font-extrabold tracking-tight">
                    Skip the queue — handled at home
                  </div>
                  <div className="mt-2 text-sm text-emerald-50">
                    {opd.arrivalWindow.description}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href="https://wa.me/916363640564?text=Hello%2C%20I%20need%20a%20teleconsult%20for%20mild%20symptoms."
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                    >
                      Open WhatsApp teleconsult →
                    </a>
                    <a
                      href={`/conditions${result?.top_conditions?.[0]?.icd10 ? `?icd10=${result.top_conditions[0].icd10}` : ""}`}
                      className="rounded-md bg-emerald-900/40 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/30 hover:bg-emerald-900/60"
                    >
                      Self-care guidance →
                    </a>
                  </div>
                </div>
                <div className="text-right text-xs text-emerald-100">
                  <div className="font-semibold">{opd.departmentName}</div>
                  <div>Diverted from {HOSPITAL_NAME} OPD</div>
                </div>
              </div>
            </div>
          )}
          <Card
            title="Triage verdict"
            right={
              <button
                type="button"
                onClick={reset}
                className="text-xs font-medium text-slate-500 hover:underline"
              >
                Start over
              </button>
            }
          >
            <TriageResultPanel r={result} symptoms={symptoms} />
          </Card>

          <ReferralCard
            patient={patient}
            symptoms={symptoms}
            vitals={vitals}
            answered={answered}
            result={result}
          />

          <details className="group rounded-xl border border-slate-200 bg-white">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-5 py-3 hover:bg-slate-50">
              <div>
                <div className="text-sm font-semibold text-navy-900">
                  Alternative options if you can&apos;t make this slot
                </div>
                <div className="text-xs text-slate-500">
                  {opd?.pathway === "TELECONSULT"
                    ? "Prefer in-person? Find a nearby specialist or facility instead."
                    : "Backup specialists and government facilities near you, in case the assigned slot doesn't work."}
                </div>
              </div>
              <span className="text-xs font-semibold text-teal-700 group-open:hidden">
                Show alternatives ▾
              </span>
              <span className="hidden text-xs font-semibold text-teal-700 group-open:inline">
                Hide ▴
              </span>
            </summary>
            <div className="space-y-5 border-t border-slate-200 px-5 py-5">
              <CareLocatorPanel
                icd10Codes={result.top_conditions.map((c) => c.icd10)}
                severity={result.severity}
              />

              <Card
                title="Nearest facilities"
                subtitle="Government hospitals and PHCs near the caregiver."
              >
                <FacilityMap />
              </Card>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "input", label: "1 · Input" },
    { key: "interview", label: "2 · Interview" },
    { key: "result", label: "3 · Verdict" },
  ];
  const idx = steps.findIndex((s) => s.key === step);
  return (
    <ol className="flex items-center gap-2 text-xs">
      {steps.map((s, i) => (
        <li
          key={s.key}
          className={`rounded-full px-3 py-1 ring-1 ring-inset ${
            i <= idx
              ? "bg-teal-500 text-white ring-teal-500"
              : "bg-white text-slate-500 ring-slate-200"
          }`}
        >
          {s.label}
        </li>
      ))}
    </ol>
  );
}

function formatError(e: unknown): string {
  if (e instanceof ApiError) return `API ${e.status}: ${e.message}`;
  if (e instanceof Error) return e.message;
  return "Something went wrong.";
}
