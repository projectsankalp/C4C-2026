"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type {
  CareLocatorResponse,
  DoctorMatch,
  SeverityTier,
} from "@/lib/types";

const FALLBACK_COORDS = { lat: 16.8524, lon: 74.5815, label: "Sangli, MH (fallback)" };

const CITY_PRESETS = [
  { lat: 12.9716, lon: 77.5946, label: "Bangalore" },
  { lat: 19.076, lon: 72.8777, label: "Mumbai" },
  { lat: 28.6139, lon: 77.209, label: "Delhi" },
  { lat: 13.0827, lon: 80.2707, label: "Chennai" },
  { lat: 22.5726, lon: 88.3639, label: "Kolkata" },
  { lat: 17.385, lon: 78.4867, label: "Hyderabad" },
  { lat: 18.5204, lon: 73.8567, label: "Pune" },
  { lat: 15.8497, lon: 74.4977, label: "Belagavi" },
  { lat: 16.8524, lon: 74.5815, label: "Sangli" },
];

export function CareLocatorPanel({
  icd10Codes,
  severity,
}: {
  icd10Codes: string[];
  severity: SeverityTier;
}) {
  const [coords, setCoords] = useState(FALLBACK_COORDS);
  const [locStatus, setLocStatus] = useState<"idle" | "locating" | "ok" | "fail">(
    "idle",
  );
  const [locError, setLocError] = useState<string | null>(null);
  const [radius, setRadius] = useState<number>(severity === "EMERGENCY" ? 10 : 25);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CareLocatorResponse | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  function tryGeolocate() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocStatus("fail");
      setLocError("This browser doesn't support geolocation.");
      return;
    }
    setLocStatus("locating");
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({
          lat: p.coords.latitude,
          lon: p.coords.longitude,
          label: "Your location",
        });
        setLocStatus("ok");
      },
      (err) => {
        setLocStatus("fail");
        const messages: Record<number, string> = {
          1: "Location permission denied. Click the lock icon in the URL bar → allow location, or pick a city below.",
          2: "Location unavailable. Check Windows Location Services (Settings → Privacy → Location).",
          3: "Location request timed out. Try again or pick a city.",
        };
        setLocError(messages[err.code] ?? err.message);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60_000 },
    );
  }

  function pickCity(c: { lat: number; lon: number; label: string }) {
    setCoords({ lat: c.lat, lon: c.lon, label: c.label });
    setLocStatus("ok");
    setLocError(null);
    setPickerOpen(false);
    setData(null);
  }

  useEffect(() => {
    tryGeolocate();
  }, []);

  async function search() {
    if (icd10Codes.length === 0) {
      setError("No ICD-10 codes available from the triage to match against.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await api.careLocator({
        icd10_codes: icd10Codes.slice(0, 5),
        severity_tier: severity,
        patient_lat: coords.lat,
        patient_lon: coords.lon,
        radius_km: radius,
        max_results: 8,
      });
      setData(r);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (locStatus === "ok" && icd10Codes.length > 0 && !data && !busy) {
      search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locStatus, coords.lat, coords.lon]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-navy-900">
              HyperLocal Specialist Match
            </span>
            <span className="rounded-full bg-coral-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Connect
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Ranks nearby doctors by ICD-10 specialty fit, urgency tier, and
            distance.
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-slate-700">
              📍 {coords.label} · {coords.lat.toFixed(3)}, {coords.lon.toFixed(3)}
            </span>
            <button
              type="button"
              onClick={tryGeolocate}
              disabled={locStatus === "locating"}
              className="rounded-md border border-teal-300 bg-white px-2 py-0.5 font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-50"
            >
              {locStatus === "locating" ? "Locating…" : "Use my location"}
            </button>
            <button
              type="button"
              onClick={() => setPickerOpen(!pickerOpen)}
              className="rounded-md border border-slate-300 bg-white px-2 py-0.5 font-semibold text-slate-700 hover:bg-slate-50"
            >
              {pickerOpen ? "Hide cities" : "Pick a city"}
            </button>
          </div>
          {locError && (
            <div className="mt-1 text-[11px] text-red-700">⚠ {locError}</div>
          )}
          {pickerOpen && (
            <div className="mt-2 flex flex-wrap gap-1">
              {CITY_PRESETS.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => pickCity(c)}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 transition ${
                    coords.label === c.label
                      ? "bg-teal-500 text-white ring-teal-500"
                      : "bg-white text-slate-700 ring-slate-300 hover:ring-teal-400"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-[11px] text-slate-600">
            Radius:{" "}
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
            </select>
          </label>
          <button
            type="button"
            onClick={search}
            disabled={busy || locStatus === "locating"}
            className="rounded-md bg-teal-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
          >
            {busy ? "Searching…" : "Refresh match"}
          </button>
        </div>
      </div>

      <div className="p-5">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
            {error}
          </div>
        )}

        {!error && !data && busy && (
          <div className="text-sm text-slate-500">
            Matching {icd10Codes.length} condition{icd10Codes.length === 1 ? "" : "s"}{" "}
            against the doctor catalog…
          </div>
        )}

        {data && (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
              <span>
                Specialties needed:{" "}
                {data.required_specialties.length > 0
                  ? data.required_specialties.map((s) => (
                      <span
                        key={s}
                        className="ml-1 rounded-full bg-teal-50 px-2 py-0.5 font-semibold text-teal-700 ring-1 ring-teal-200"
                      >
                        {s}
                      </span>
                    ))
                  : "general"}
              </span>
              <span>·</span>
              <span>
                Sort policy:{" "}
                <span className="font-mono font-semibold">{data.sort_policy}</span>{" "}
                (urgency-aware)
              </span>
              <span>·</span>
              <span>
                {data.total_found} / {data.total_in_catalog} doctors in {data.radius_km}km
              </span>
            </div>

            {data.doctors.length === 0 ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No doctors found within {data.radius_km} km. Try expanding the
                radius.
              </div>
            ) : (
              <ul className="space-y-2">
                {data.doctors.map((d, i) => (
                  <DoctorRow key={d.id} d={d} rank={i + 1} />
                ))}
              </ul>
            )}

            <div className="mt-3 text-[10px] text-slate-400">
              model: {data.model_version} · request_id: {data.request_id}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DoctorRow({ d, rank }: { d: DoctorMatch; rank: number }) {
  const [open, setOpen] = useState(false);
  const breakdownEntries = Object.entries(d.score_breakdown).sort(
    (a, b) => b[1] - a[1],
  );
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-3 transition hover:border-teal-300">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
            #{rank}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-navy-900">{d.name}</span>
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 ring-1 ring-teal-200">
                {d.specialty}
              </span>
              {d.available_today && (
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 ring-1 ring-green-200">
                  available today
                </span>
              )}
            </div>
            <div className="mt-0.5 truncate text-xs text-slate-600">
              {d.clinic} · {d.distance_km.toFixed(1)} km
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span>★ {d.rating.toFixed(1)}</span>
              {d.fee_inr != null && <span>· ₹{d.fee_inr}</span>}
              {d.languages.length > 0 && (
                <span>· {d.languages.join(" / ")}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">
            match score
          </div>
          <div className="font-mono text-sm font-bold text-teal-700">
            {Math.round(d.score * 100)}%
          </div>
          <div className="flex gap-1">
            <a
              href={`tel:${d.phone}`}
              className="rounded-md bg-green-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-green-700"
            >
              Call
            </a>
            <a
              href={`https://www.openstreetmap.org/?mlat=${d.lat}&mlon=${d.lon}#map=15/${d.lat}/${d.lon}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-navy-900 px-2 py-1 text-[11px] font-semibold text-white hover:bg-navy-800"
            >
              Map
            </a>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-2 text-[11px] font-semibold text-teal-700 hover:underline"
      >
        {open ? "Hide" : "Show"} score breakdown
      </button>
      {open && (
        <div className="mt-2 space-y-1 rounded-md bg-slate-50 p-2 ring-1 ring-slate-100">
          {breakdownEntries.map(([k, v]) => (
            <div key={k} className="text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">{k}</span>
                <span className="font-mono text-slate-600">{v.toFixed(2)}</span>
              </div>
              <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full ${v >= 0 ? "bg-teal-500" : "bg-coral-500"}`}
                  style={{
                    width: `${Math.min(100, Math.abs(v) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </li>
  );
}
