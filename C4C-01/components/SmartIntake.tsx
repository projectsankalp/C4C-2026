"use client";

import { useEffect, useRef, useState } from "react";

type Tab = "voice" | "pdf";

interface ExtractionResult {
  symptoms: string[];
  modifiers: string[];
  spans: { token: string; symptom: string; start: number; end: number }[];
}

export function SmartIntake({
  selected,
  onAdd,
}: {
  selected: string[];
  onAdd: (symptoms: string[], modifiers: string[]) => void;
}) {
  const [tab, setTab] = useState<Tab>("voice");
  const [transcript, setTranscript] = useState("");
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animatedChips, setAnimatedChips] = useState<string[]>([]);

  // Voice (AssemblyAI batch) state
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [language, setLanguage] = useState<"en" | "hi" | "auto">("en");
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // PDF state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  useEffect(() => {
    if (!extraction) {
      setAnimatedChips([]);
      return;
    }
    setAnimatedChips([]);
    const chips = [...extraction.symptoms, ...extraction.modifiers];
    chips.forEach((s, i) => {
      setTimeout(() => {
        setAnimatedChips((prev) => [...prev, s]);
      }, i * 220);
    });
  }, [extraction]);

  async function startRecording() {
    setError(null);
    setTranscript("");
    setExtraction(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
      setSeconds(0);
      tickRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (e) {
      setError(`Microphone access denied: ${(e as Error).message}`);
    }
  }

  async function stopAndTranscribe() {
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
      fd.append("audio", blob, "intake.webm");
      fd.append("language", language);
      const r = await fetch("/api/transcribe", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Transcription failed");
      setTranscript(data.transcript ?? "");
      if (data.transcript) {
        await runExtraction(data.transcript);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setTranscribing(false);
    }
  }

  async function runExtraction(text: string) {
    setExtracting(true);
    setError(null);
    try {
      const r = await fetch("/api/extract-symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Extraction failed");
      setExtraction(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setExtracting(false);
    }
  }

  async function handlePdf() {
    if (!pdfFile) return;
    setError(null);
    setTranscript("");
    setExtraction(null);
    setPdfBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", pdfFile);
      const r = await fetch("/api/extract-pdf", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "PDF parse failed");
      setTranscript(data.text ?? "");
      if (data.text) {
        await runExtraction(data.text);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPdfBusy(false);
    }
  }

  function commit() {
    if (!extraction) return;
    onAdd(extraction.symptoms, extraction.modifiers);
    setExtraction(null);
    setTranscript("");
    setAnimatedChips([]);
  }

  function highlightedTranscript(): React.ReactNode {
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

  const newSymptoms = extraction
    ? extraction.symptoms.filter((s) => !selected.includes(s))
    : [];

  return (
    <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/60 to-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-navy-900">
              Smart Intake
            </span>
            <span className="rounded-full bg-teal-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              AI
            </span>
          </div>
          <div className="text-xs text-slate-600">
            Speak symptoms naturally or upload a PDF — we extract the structured
            data for you.
          </div>
        </div>
        <div className="flex rounded-md bg-white p-0.5 ring-1 ring-slate-200">
          <button
            type="button"
            onClick={() => setTab("voice")}
            className={`rounded px-3 py-1 text-xs font-semibold transition ${
              tab === "voice"
                ? "bg-teal-500 text-white"
                : "text-slate-600 hover:text-navy-900"
            }`}
          >
            🎙 Voice
          </button>
          <button
            type="button"
            onClick={() => setTab("pdf")}
            className={`rounded px-3 py-1 text-xs font-semibold transition ${
              tab === "pdf"
                ? "bg-teal-500 text-white"
                : "text-slate-600 hover:text-navy-900"
            }`}
          >
            📄 PDF
          </button>
        </div>
      </div>

      {tab === "voice" && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
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
                <span aria-hidden>🎙</span> Start recording
              </button>
            )}
            {recording && (
              <button
                type="button"
                onClick={stopAndTranscribe}
                className="flex items-center gap-1.5 rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-600"
              >
                <span aria-hidden className="animate-pulse">●</span> Stop ·{" "}
                {seconds}s
              </button>
            )}
            {transcribing && (
              <span className="text-xs font-semibold text-slate-700">
                Transcribing via AssemblyAI…
              </span>
            )}
          </div>
          <p className="text-[11px] italic text-slate-500">
            Try: <span className="font-mono">&quot;She&apos;s been throwing up since lunch and her stomach is sore on the right side&quot;</span>
          </p>
        </div>
      )}

      {tab === "pdf" && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
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
              onClick={handlePdf}
              className="rounded-md bg-teal-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
            >
              {pdfBusy ? "Reading PDF…" : "Extract from PDF"}
            </button>
          </div>
          <p className="text-[11px] italic text-slate-500">
            Upload a doctor&apos;s note, discharge summary, or prior referral —
            we&apos;ll pull the symptoms out.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {error}
        </div>
      )}

      {transcript && (
        <div className="mt-4 rounded-md bg-white/80 p-3 text-sm leading-relaxed text-slate-800 ring-1 ring-slate-200">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-teal-700">
            {tab === "voice" ? "Transcript" : "Extracted text"}
            {extracting ? " · extracting…" : ""}
          </div>
          <div className="max-h-32 overflow-y-auto whitespace-pre-wrap">
            {highlightedTranscript()}
          </div>
        </div>
      )}

      {extraction && (
        <div className="mt-3 rounded-md border border-teal-300 bg-teal-50/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-teal-700">
              Structured symptoms ({extraction.symptoms.length}) ·
              modifiers ({extraction.modifiers.length})
            </div>
            <button
              type="button"
              onClick={commit}
              disabled={extraction.symptoms.length === 0}
              className="rounded-md bg-navy-900 px-3 py-1 text-xs font-semibold text-white hover:bg-navy-800 disabled:opacity-50"
            >
              Add to triage ({newSymptoms.length} new)
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {extraction.symptoms.map((s) => {
              const visible = animatedChips.includes(s);
              const dup = selected.includes(s);
              return (
                <span
                  key={s}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-300 ${
                    !visible
                      ? "translate-y-1 opacity-0"
                      : dup
                        ? "bg-slate-200 text-slate-500 line-through opacity-100"
                        : "bg-teal-500 text-white opacity-100 shadow-sm"
                  }`}
                  title={dup ? "Already selected" : ""}
                >
                  {s}
                </span>
              );
            })}
            {extraction.modifiers.map((m) => {
              const visible = animatedChips.includes(m);
              return (
                <span
                  key={m}
                  className={`rounded-full bg-coral-500 px-2.5 py-0.5 text-xs font-medium text-white transition-all duration-300 ${
                    visible ? "opacity-100" : "translate-y-1 opacity-0"
                  }`}
                >
                  {m}
                </span>
              );
            })}
            {extraction.symptoms.length === 0 && (
              <span className="text-xs text-slate-500">
                No matching symptoms in catalog. Try the manual picker below.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
