"use client";

import { useMemo, useRef, useState } from "react";
import { ALL_SYMPTOMS, SYMPTOM_CATALOG } from "@/lib/symptoms";

export function SymptomPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceMsg, setVoiceMsg] = useState<string | null>(null);
  const recogRef = useRef<unknown>(null);

  function startVoice() {
    if (typeof window === "undefined") return;
    type SR = {
      new (): {
        lang: string;
        interimResults: boolean;
        continuous: boolean;
        onresult: (e: { results: { 0: { transcript: string } }[] }) => void;
        onerror: (e: { error: string }) => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
      };
    };
    const w = window as unknown as {
      SpeechRecognition?: SR;
      webkitSpeechRecognition?: SR;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setVoiceMsg("Voice input not supported in this browser. Try Chrome.");
      return;
    }
    const r = new Ctor();
    r.lang = "en-IN";
    r.interimResults = false;
    r.continuous = false;
    r.onresult = (e) => {
      const transcript = String(e.results[0][0].transcript || "").toLowerCase();
      const matched = ALL_SYMPTOMS.filter((s) =>
        transcript.includes(s.toLowerCase()),
      );
      if (matched.length === 0) {
        setVoiceMsg(`Heard: "${transcript}" — no matching symptoms in catalog.`);
        return;
      }
      const next = Array.from(new Set([...value, ...matched]));
      onChange(next);
      setVoiceMsg(`Added: ${matched.join(", ")}`);
    };
    r.onerror = (e) => setVoiceMsg(`Voice error: ${e.error}`);
    r.onend = () => setListening(false);
    recogRef.current = r;
    setVoiceMsg(null);
    setListening(true);
    r.start();
  }
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SYMPTOM_CATALOG;
    return SYMPTOM_CATALOG.map((g) => ({
      ...g,
      items: g.items.filter((s) => s.includes(q)),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  function toggle(s: string) {
    if (value.includes(s)) onChange(value.filter((x) => x !== s));
    else onChange([...value, s]);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search symptoms (e.g. chest pain)…"
          className="flex-1 min-w-[220px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
        <button
          type="button"
          onClick={startVoice}
          disabled={listening}
          aria-label="Voice symptom input"
          title="Speak your symptoms (English / Hinglish)"
          className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold ring-1 transition ${
            listening
              ? "bg-red-500 text-white ring-red-500 animate-pulse"
              : "bg-white text-navy-900 ring-slate-300 hover:ring-teal-400"
          }`}
        >
          <span aria-hidden>{listening ? "●" : "🎙"}</span>
          {listening ? "Listening…" : "Voice"}
        </button>
        <span className="text-xs text-slate-500">
          {value.length} selected
        </span>
      </div>
      {voiceMsg && (
        <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs text-navy-900">
          {voiceMsg}
        </div>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 rounded-md bg-teal-50 p-2 ring-1 ring-teal-100">
          {value.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggle(s)}
              className="rounded-full bg-teal-500 px-2.5 py-0.5 text-xs font-medium text-white hover:bg-teal-600"
            >
              {s} ×
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {filtered.map((g) => (
          <div key={g.group}>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {g.group}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map((s) => {
                const on = value.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(s)}
                    className={`rounded-full px-2.5 py-1 text-xs ring-1 transition ${
                      on
                        ? "bg-teal-500 text-white ring-teal-500"
                        : "bg-white text-slate-700 ring-slate-200 hover:ring-teal-400"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
