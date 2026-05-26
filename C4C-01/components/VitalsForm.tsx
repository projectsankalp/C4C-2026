"use client";

import type { Vitals } from "@/lib/types";

const FIELDS: {
  key: keyof Vitals;
  label: string;
  unit: string;
  placeholder: string;
  step?: string;
  hint?: string;
}[] = [
  { key: "spo2", label: "SpO₂", unit: "%", placeholder: "98", hint: "<90 emergency" },
  { key: "pulse_bpm", label: "Pulse", unit: "bpm", placeholder: "78" },
  { key: "bp_systolic", label: "BP systolic", unit: "mmHg", placeholder: "120" },
  { key: "bp_diastolic", label: "BP diastolic", unit: "mmHg", placeholder: "80" },
  { key: "temp_c", label: "Temperature", unit: "°C", placeholder: "37.0", step: "0.1" },
  { key: "blood_sugar_mg_dl", label: "Blood sugar", unit: "mg/dL", placeholder: "110" },
  { key: "respiratory_rate", label: "Resp. rate", unit: "/min", placeholder: "16" },
  { key: "waist_size_inches", label: "Waist Size", unit: "inches", placeholder: "34", hint: "risk marker for diabetes" },
];

export function VitalsForm({
  value,
  onChange,
}: {
  value: Vitals;
  onChange: (next: Vitals) => void;
}) {
  function set(key: keyof Vitals, raw: string) {
    if (raw === "") {
      const next = { ...value };
      delete next[key];
      onChange(next);
      return;
    }
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    onChange({ ...value, [key]: n });
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {FIELDS.map((f) => (
        <label key={f.key} className="block">
          <span className="block text-xs font-medium text-slate-600">
            {f.label} <span className="text-slate-400">({f.unit})</span>
          </span>
          <input
            type="number"
            inputMode="decimal"
            step={f.step ?? "1"}
            placeholder={f.placeholder}
            value={value[f.key] ?? ""}
            onChange={(e) => set(f.key, e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          {f.hint && (
            <span className="mt-0.5 block text-[10px] text-slate-400">{f.hint}</span>
          )}
        </label>
      ))}
    </div>
  );
}
