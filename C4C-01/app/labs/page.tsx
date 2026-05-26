"use client";

import { useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Gender, LabAnalyzeResponse } from "@/lib/types";
import { Card } from "@/components/Card";

const SAMPLE = `Hemoglobin: 10.2 g/dL
WBC: 12.4 x10^9/L
Platelets: 180 x10^9/L
Glucose (fasting): 162 mg/dL
HbA1c: 7.8 %
Creatinine: 1.4 mg/dL
Total Cholesterol: 232 mg/dL
LDL: 158 mg/dL
HDL: 38 mg/dL
TSH: 2.1 mIU/L`;

const STATUS_COLOR: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 ring-blue-200",
  high: "bg-red-100 text-red-800 ring-red-200",
  normal: "bg-green-100 text-green-800 ring-green-200",
  unknown: "bg-slate-100 text-slate-700 ring-slate-200",
};

export default function LabsPage() {
  const [text, setText] = useState(SAMPLE);
  const [age, setAge] = useState(45);
  const [gender, setGender] = useState<Gender>("male");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LabAnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [uploadInfo, setUploadInfo] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploadInfo(null);
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Max 10 MB.");
      return;
    }
    setExtracting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract-pdf", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Upload failed (${res.status}).`);
        return;
      }
      setText(data.text);
      setUploadInfo(
        `Loaded ${data.filename} · ${data.pages} page${data.pages !== 1 ? "s" : ""} · ${data.text.length} chars`,
      );
      setResult(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setExtracting(false);
    }
  }

  async function analyze() {
    if (text.trim().length < 10) {
      setError("Paste at least a few lines of lab results.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await api.analyzeLabs({ ocr_text: text, age, gender });
      setResult(r);
    } catch (e) {
      setError(e instanceof ApiError ? `API ${e.status}: ${e.message}` : (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Lab Analyzer</h1>
        <p className="text-sm text-slate-600">
          Paste OCR text from a lab report. The deterministic engine flags abnormal
          values; the LLM only explains them — it cannot invent new flags.
        </p>
      </div>

      <Card
        title="Lab report"
        subtitle="Upload a PDF or paste OCR text. The extracted text appears below — review and edit before analyzing."
      >
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className={`mb-4 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition ${
            dragOver
              ? "border-teal-500 bg-teal-50"
              : "border-slate-300 bg-slate-50/50 hover:border-teal-400"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              if (fileRef.current) fileRef.current.value = "";
            }}
          />
          <div className="text-sm text-slate-700">
            <span className="font-semibold">Drop a lab report PDF here</span>{" "}
            or
          </div>
          <button
            type="button"
            disabled={extracting}
            onClick={() => fileRef.current?.click()}
            className="rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
          >
            {extracting ? "Extracting…" : "Choose PDF"}
          </button>
          <div className="text-xs text-slate-500">
            PDF only · Max 10 MB · Scanned/image PDFs aren't supported (paste
            text instead)
          </div>
          {uploadInfo && (
            <div className="mt-1 rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
              ✓ {uploadInfo}
            </div>
          )}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="w-full rounded-md border border-slate-300 bg-white p-3 font-mono text-xs leading-relaxed focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Age</span>
            <input
              type="number"
              min={0}
              max={120}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="mt-1 w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Gender</span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="mt-1 w-32 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="male">male</option>
              <option value="female">female</option>
              <option value="other">other</option>
            </select>
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={analyze}
            className="rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
          >
            {busy ? "Analyzing…" : "Analyze report"}
          </button>
          <button
            type="button"
            onClick={() => setText(SAMPLE)}
            className="text-xs text-slate-500 hover:underline"
          >
            Reset to sample
          </button>
        </div>
        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}
      </Card>

      {result && (
        <Card
          title={`Detected ${result.flags.length} flagged + ${result.unflagged_count} normal`}
          subtitle={`Hallucination check: ${
            result.hallucination_check.passed ? "passed" : "blocked items present"
          }`}
        >
          <div className="space-y-2">
            {result.flags.map((f, i) => (
              <div
                key={i}
                className="rounded-md border border-slate-200 bg-white px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-navy-900">
                    {f.canonical || f.name}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ring-1 ring-inset ${
                      STATUS_COLOR[f.status] ?? STATUS_COLOR.unknown
                    }`}
                  >
                    {f.status}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-slate-600">
                  Value:{" "}
                  <span className="font-mono">
                    {f.value} {f.unit}
                  </span>{" "}
                  · Reference:{" "}
                  <span className="font-mono">
                    {f.range_low ?? "—"}–{f.range_high ?? "—"} {f.unit}
                  </span>
                </div>
                {f.explanation && (
                  <p className="mt-2 text-sm text-slate-700">{f.explanation}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 text-[11px] text-slate-500">
            request_id: {result.request_id}
          </div>
        </Card>
      )}
    </div>
  );
}
