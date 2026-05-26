"use client";

import Link from "next/link";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { DiseasePredictResponse, Gender } from "@/lib/types";
import { Card } from "@/components/Card";
import { SymptomPicker } from "@/components/SymptomPicker";
import { pct } from "@/lib/format";

export default function PredictPage() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [age, setAge] = useState(45);
  const [gender, setGender] = useState<Gender>("male");
  const [topK, setTopK] = useState(5);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DiseasePredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function predict() {
    if (symptoms.length === 0) {
      setError("Pick at least one symptom.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await api.predictDisease({
        symptoms,
        age,
        gender,
        top_k: topK,
      });
      setResult(r);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : (e as Error).message ?? "Failed",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Disease Predictor</h1>
        <p className="text-sm text-slate-600">
          Top-K ICD-10 conditions from symptoms + demographics. LightGBM
          classifier with per-prediction feature importance. Click any condition
          to open its plain-English card.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Inputs">
          <SymptomPicker value={symptoms} onChange={setSymptoms} />
          <div className="mt-4 grid grid-cols-3 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Age</span>
              <input
                type="number"
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Gender</span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              >
                <option value="male">male</option>
                <option value="female">female</option>
                <option value="other">other</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Top K</span>
              <input
                type="number"
                min={1}
                max={10}
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {symptoms.length} symptom{symptoms.length !== 1 ? "s" : ""}
            </span>
            <button
              type="button"
              disabled={busy || symptoms.length === 0}
              onClick={predict}
              className="rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
            >
              {busy ? "Predicting…" : "Predict conditions"}
            </button>
          </div>
          {error && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
        </Card>

        <Card
          title="Predictions"
          subtitle={
            result
              ? `${result.predictions.length} conditions · model ${result.model_version}`
              : "Run a prediction to see results."
          }
        >
          {!result && (
            <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              No predictions yet.
            </div>
          )}
          {result && (
            <div className="space-y-3">
              {result.predictions.map((p) => {
                const max = Math.max(
                  ...p.top_features.map((f) => Math.abs(f.shap)),
                  0.0001,
                );
                return (
                  <div
                    key={p.icd10}
                    className="rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-navy-900">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          ICD-10 · {p.icd10}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-teal-600">
                          {pct(p.prob)}
                        </div>
                        <Link
                          href={`/conditions?icd10=${encodeURIComponent(p.icd10)}&name=${encodeURIComponent(p.name)}`}
                          className="text-xs font-medium text-teal-700 hover:underline"
                        >
                          Plain-English card →
                        </Link>
                      </div>
                    </div>
                    {p.top_features.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Why this prediction (SHAP)
                        </div>
                        {p.top_features.slice(0, 5).map((f) => (
                          <div key={f.feature} className="text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-700">{f.feature}</span>
                              <span className="font-mono text-slate-500">
                                {f.shap.toFixed(3)}
                              </span>
                            </div>
                            <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full ${f.shap >= 0 ? "bg-coral-500" : "bg-slate-400"}`}
                                style={{
                                  width: `${Math.round((Math.abs(f.shap) / max) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="text-[11px] text-slate-500">
                request_id: {result.request_id}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
