"use client";

import { useEffect, useState } from "react";
import type { InterviewerResponse } from "@/lib/types";

export function InterviewCard({
  q,
  busy = false,
  onAnswer,
  onSkip,
}: {
  q: InterviewerResponse;
  busy?: boolean;
  onAnswer: (answer: string) => void;
  onSkip: () => void;
}) {
  const [text, setText] = useState("");
  const [scale, setScale] = useState<number>(5);
  const [flash, setFlash] = useState(true);

  useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 1500);
    return () => clearTimeout(t);
  }, [q.request_id]);

  return (
    <div
      className={`relative rounded-lg border-l-4 border-teal-500 p-4 transition-colors ${
        flash ? "bg-yellow-100 ring-2 ring-yellow-300" : "bg-teal-50/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          AI follow-up question · relay to patient
        </div>
        {flash && (
          <span className="rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-bold uppercase text-navy-900">
            New
          </span>
        )}
      </div>
      <p className="mt-1 text-lg font-semibold text-navy-900">{q.question}</p>
      {q.rationale && (
        <p className="mt-1 text-xs italic text-slate-600">Why: {q.rationale}</p>
      )}

      <div className="mt-3">
        {!["yes_no", "choice", "free_text"].includes(q.expected_answer_type) && (
          <FreeTextAnswer
            text={text}
            setText={setText}
            busy={busy}
            onAnswer={onAnswer}
            unknownType={q.expected_answer_type}
          />
        )}
        {q.expected_answer_type === "yes_no" && (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => onAnswer("yes")}
              className="rounded-md bg-teal-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-50"
            >
              Yes
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onAnswer("no")}
              className="rounded-md bg-slate-200 px-4 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-300 disabled:opacity-50"
            >
              No
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onAnswer("not sure")}
              className="rounded-md bg-white px-4 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              Not sure
            </button>
          </div>
        )}

        {q.expected_answer_type === "choice" && (
          <FreeTextAnswer
            text={text}
            setText={setText}
            busy={busy}
            onAnswer={onAnswer}
          />
        )}

        {q.expected_answer_type === "free_text" && (
          <FreeTextAnswer
            text={text}
            setText={setText}
            busy={busy}
            onAnswer={onAnswer}
          />
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-teal-200 pt-3">
        <span className="text-[11px] text-slate-500">
          Model: {q.model_version}
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={onSkip}
          className="rounded-md bg-coral-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-coral-600 disabled:opacity-50"
        >
          Done answering — run full assessment →
        </button>
      </div>

      {busy && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/80 backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-500" />
          <div className="text-sm font-semibold text-navy-900">
            AI is generating the next question…
          </div>
          <div className="text-xs text-slate-600">
            First call after cold-start can take 15–30 seconds.
          </div>
        </div>
      )}
    </div>
  );
}

function FreeTextAnswer({
  text,
  setText,
  busy,
  onAnswer,
  unknownType,
}: {
  text: string;
  setText: (s: string) => void;
  busy: boolean;
  onAnswer: (a: string) => void;
  unknownType?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wide text-teal-700">
        ✍️ Type the patient's answer below
        {unknownType && (
          <span className="ml-2 font-mono text-[10px] text-slate-500">
            (api type: {unknownType})
          </span>
        )}
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={busy}
        rows={3}
        placeholder="Example: It started about 30 minutes ago, just a few drops…"
        className="w-full rounded-md border-2 border-teal-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:opacity-50"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {text.trim() ? `${text.trim().length} characters` : "Empty — type to enable submit"}
        </span>
        <button
          type="button"
          disabled={busy || !text.trim()}
          onClick={() => onAnswer(text.trim())}
          className="rounded-md bg-teal-500 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit answer →
        </button>
      </div>
    </div>
  );
}
