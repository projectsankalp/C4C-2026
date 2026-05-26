"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { LoadingAnimation } from "@/components/LoadingAnimation";

interface ExtractionResult {
  symptoms: string[];
  modifiers: string[];
  spans: { token: string; symptom: string; start: number; end: number }[];
}

interface ReportRow {
  id: string;
  kind: "PDF" | "VOICE";
  filename: string | null;
  rawText: string;
  symptoms: string[];
  modifiers: string[];
  language: string | null;
  createdAt: string;
}

interface LabFlagsResp {
  flags?: Array<{
    name: string;
    canonical: string;
    value: number;
    unit: string;
    range_low: number | null;
    range_high: number | null;
    status: "low" | "normal" | "high" | "unknown";
    explanation?: string | null;
  }>;
  unflagged_count?: number;
}

export default function PatientIntakePage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [transcript, setTranscript] = useState<string>("");
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [labFlags, setLabFlags] = useState<LabFlagsResp | null>(null);
  const [animatedChips, setAnimatedChips] = useState<string[]>([]);

  // PDF state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  // Voice state
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [language, setLanguage] = useState<"en" | "hi" | "auto">("en");
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function safeJson(r: Response): Promise<{ ok: boolean; data: Record<string, unknown>; raw: string }> {
    const raw = await r.text();
    let data: Record<string, unknown> = {};
    if (raw) {
      try {
        data = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        data = { error: `${r.status} ${r.statusText}: ${raw.slice(0, 200)}` };
      }
    } else {
      data = {
        error: `${r.status} ${r.statusText} (empty response — server may be cold-starting)`,
      };
    }
    return { ok: r.ok, data, raw };
  }

  async function loadReports() {
    setLoading(true);
    try {
      const r = await fetch("/api/me/reports");
      const { ok, data } = await safeJson(r);
      if (!ok) throw new Error(String(data.error ?? "Failed to load"));
      setReports((data.reports as ReportRow[]) ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (!extraction) {
      setAnimatedChips([]);
      return;
    }
    setAnimatedChips([]);
    const chips = [...extraction.symptoms, ...extraction.modifiers];
    chips.forEach((s, i) => {
      setTimeout(
        () => setAnimatedChips((prev) => [...prev, s]),
        i * 220,
      );
    });
  }, [extraction]);

  function clearResult() {
    setTranscript("");
    setExtraction(null);
    setLabFlags(null);
    setAnimatedChips([]);
    setError(null);
  }

  async function uploadPdf() {
    if (!pdfFile) return;
    clearResult();
    setPdfBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", pdfFile);
      const r = await fetch("/api/me/reports", { method: "POST", body: fd });
      const { ok, data } = await safeJson(r);
      if (!ok) throw new Error(String(data.error ?? "Upload failed"));
      const report = data.report as ReportRow;
      setTranscript(report.rawText);
      setExtraction(data.extraction as ExtractionResult);
      setLabFlags((data.labFlags as LabFlagsResp) ?? null);
      await loadReports();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPdfBusy(false);
      setPdfFile(null);
    }
  }

  async function startRecording() {
    clearResult();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => stream.getTracks().forEach((t) => t.stop());
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
      setSeconds(0);
      tickRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (e) {
      setError(`Microphone access denied: ${(e as Error).message}`);
    }
  }

  async function stopAndSubmit() {
    const mr = mediaRef.current;
    if (!mr) return;
    if (tickRef.current) clearInterval(tickRef.current);
    setRecording(false);
    setTranscribing(true);
    await new Promise<void>((resolve) => {
      mr.addEventListener("stop", () => resolve(), { once: true });
      mr.stop();
    });
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    chunksRef.current = [];
    try {
      const fd = new FormData();
      fd.append("audio", blob, "voice-note.webm");
      fd.append("language", language);
      const r = await fetch("/api/me/reports", { method: "POST", body: fd });
      const { ok, data } = await safeJson(r);
      if (!ok) throw new Error(String(data.error ?? "Transcription failed"));
      const report = data.report as ReportRow;
      setTranscript(report.rawText);
      setExtraction(data.extraction as ExtractionResult);
      await loadReports();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setTranscribing(false);
    }
  }

  function highlight(): React.ReactNode {
    if (!extraction || !transcript) return transcript;
    const spans = [...extraction.spans].sort((a, b) => a.start - b.start);
    const out: React.ReactNode[] = [];
    let cursor = 0;
    spans.forEach((s, i) => {
      if (s.start < cursor) return;
      if (s.start > cursor) out.push(transcript.slice(cursor, s.start));
      out.push(
        <mark
          key={i}
          className="rounded bg-teal-100 px-0.5 text-teal-900"
          title={`→ ${s.symptom}`}
        >
          {transcript.slice(s.start, s.end)}
        </mark>,
      );
      cursor = s.end;
    });
    if (cursor < transcript.length) out.push(transcript.slice(cursor));
    return out;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">My Health Intake</h1>
        <p className="text-sm text-slate-600">
          Upload a medical report (PDF) or describe how you&apos;re feeling by
          voice. Your reports are saved to your record and shared with your
          linked caregivers.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card title="📄 Upload a PDF report">
          <p className="text-xs text-slate-600">
            Discharge summary, lab report, doctor&apos;s note. We extract
            symptoms; for lab reports we also flag abnormal values.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              disabled={pdfBusy}
              className="text-xs"
            />
            <button
              type="button"
              disabled={!pdfFile || pdfBusy}
              onClick={uploadPdf}
              className="rounded-md bg-teal-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
            >
              {pdfBusy ? "Reading…" : "Upload & analyze"}
            </button>
          </div>
        </Card>

        <Card title="🎙 Record a voice note">
          <p className="text-xs text-slate-600">
            Tell us how you feel in your own words — English, Hindi, or
            auto-detect. Transcribed via AssemblyAI, then analyzed.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value as "en" | "hi" | "auto")
              }
              disabled={recording || transcribing}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="auto">Auto-detect</option>
            </select>
            {!recording && !transcribing && (
              <button
                type="button"
                onClick={startRecording}
                className="flex items-center gap-1.5 rounded-md bg-teal-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-600"
              >
                🎙 Start recording
              </button>
            )}
            {recording && (
              <button
                type="button"
                onClick={stopAndSubmit}
                className="flex items-center gap-1.5 rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-600"
              >
                <span aria-hidden className="animate-pulse">●</span> Stop ·{" "}
                {seconds}s
              </button>
            )}
            {transcribing && (
              <span className="text-xs font-semibold text-slate-700">
                Transcribing & analyzing…
              </span>
            )}
          </div>
        </Card>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {transcript && (
        <Card
          title="Latest analysis"
          subtitle="Saved to your record automatically."
        >
          <div className="rounded-md bg-slate-50 p-3 text-sm leading-relaxed text-slate-800 ring-1 ring-slate-100">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-teal-700">
              Extracted text
            </div>
            <div className="max-h-44 overflow-y-auto whitespace-pre-wrap">
              {highlight()}
            </div>
          </div>
          {extraction && (
            <div className="mt-3 rounded-md border border-teal-300 bg-teal-50/50 p-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-teal-700">
                Structured ({extraction.symptoms.length} symptoms ·{" "}
                {extraction.modifiers.length} modifiers)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {extraction.symptoms.map((s) => (
                  <span
                    key={s}
                    className={`rounded-full bg-teal-500 px-2.5 py-0.5 text-xs font-medium text-white shadow-sm transition-all duration-300 ${
                      animatedChips.includes(s)
                        ? "opacity-100"
                        : "translate-y-1 opacity-0"
                    }`}
                  >
                    {s}
                  </span>
                ))}
                {extraction.modifiers.map((m) => (
                  <span
                    key={m}
                    className={`rounded-full bg-coral-500 px-2.5 py-0.5 text-xs font-medium text-white transition-all duration-300 ${
                      animatedChips.includes(m)
                        ? "opacity-100"
                        : "translate-y-1 opacity-0"
                    }`}
                  >
                    {m}
                  </span>
                ))}
                {extraction.symptoms.length === 0 &&
                  extraction.modifiers.length === 0 && (
                    <span className="text-xs italic text-slate-500">
                      No catalog matches in this text.
                    </span>
                  )}
              </div>
            </div>
          )}
          {labFlags?.flags && labFlags.flags.length > 0 && (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-amber-800">
                Lab flags ({labFlags.flags.length} abnormal ·{" "}
                {labFlags.unflagged_count ?? 0} normal)
              </div>
              <ul className="space-y-1.5">
                {labFlags.flags.map((f, i) => (
                  <li
                    key={i}
                    className="rounded bg-white p-2 text-xs ring-1 ring-amber-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-navy-900">
                        {f.canonical || f.name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          f.status === "high"
                            ? "bg-red-500 text-white"
                            : f.status === "low"
                              ? "bg-blue-500 text-white"
                              : "bg-slate-300 text-slate-800"
                        }`}
                      >
                        {f.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-0.5 font-mono text-slate-700">
                      {f.value} {f.unit}
                      {f.range_low != null && f.range_high != null && (
                        <span className="ml-2 text-slate-500">
                          (normal {f.range_low}–{f.range_high})
                        </span>
                      )}
                    </div>
                    {f.explanation && (
                      <div className="mt-1 text-slate-600">{f.explanation}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      <Card
        title="Your past reports"
        subtitle={`${reports.length} saved · most recent first`}
      >
        {loading ? (
          <LoadingAnimation fullScreen={false} text="Loading reports..." />
        ) : reports.length === 0 ? (
          <div className="text-sm text-slate-500">
            Nothing yet. Upload a PDF or record a voice note above to start.
          </div>
        ) : (
          <ul className="space-y-2">
            {reports.map((r) => (
              <li
                key={r.id}
                className="rounded-md border border-slate-200 bg-white p-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {r.kind === "PDF" ? "📄" : "🎙"}
                    </span>
                    <span className="font-semibold text-navy-900">
                      {r.filename ?? `${r.kind} report`}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {r.kind}
                    </span>
                    {r.language && r.language !== "en" && (
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 ring-1 ring-teal-200">
                        {r.language}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>
                {r.symptoms.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.symptoms.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-teal-500 px-2 py-0.5 text-[10px] font-medium text-white"
                      >
                        {s}
                      </span>
                    ))}
                    {r.modifiers.map((m) => (
                      <span
                        key={m}
                        className="rounded-full bg-coral-500 px-2 py-0.5 text-[10px] font-medium text-white"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer text-[11px] font-semibold text-slate-600 hover:text-navy-900">
                    Show extracted text
                  </summary>
                  <pre className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded bg-slate-50 p-2 text-[11px] text-slate-700">
                    {r.rawText}
                  </pre>
                </details>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="text-xs text-slate-500">
        ← Back to{" "}
        <Link href="/account" className="font-semibold text-teal-700 hover:underline">
          your account
        </Link>
      </div>
    </div>
  );
}
