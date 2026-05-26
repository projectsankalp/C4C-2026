"use client";

import { useEffect, useState } from "react";
import { useRuralMode } from "@/lib/rural";

const FALLBACK = { lat: 16.8524, lon: 74.5815, label: "Sangli, MH" };

export function FacilityMap() {
  const [coords, setCoords] = useState<{ lat: number; lon: number; label: string }>(
    FALLBACK,
  );
  const [status, setStatus] = useState<"idle" | "locating" | "ok" | "fail">("idle");
  const rural = useRuralMode();

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("fail");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({
          lat: p.coords.latitude,
          lon: p.coords.longitude,
          label: "Your location",
        });
        setStatus("ok");
      },
      () => setStatus("fail"),
      { enableHighAccuracy: false, timeout: 4000 },
    );
  }, []);

  const d = 0.05;
  const bbox = [
    coords.lon - d,
    coords.lat - d,
    coords.lon + d,
    coords.lat + d,
  ].join(",");
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lon}`;
  const overpassLink = `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lon}#map=14/${coords.lat}/${coords.lon}`;
  const govSearchLink = `https://www.google.com/maps/search/government+hospital/@${coords.lat},${coords.lon},14z`;
  const phcSearchLink = `https://www.google.com/maps/search/primary+health+centre/@${coords.lat},${coords.lon},14z`;
  const privateSearchLink = `https://www.google.com/maps/search/private+hospital/@${coords.lat},${coords.lon},14z`;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {rural.on && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
          <span className="font-semibold">Rural Mode on</span> ·{" "}
          {rural.reason === "auto-2g"
            ? `slow connection detected (${rural.effectiveType}) — `
            : rural.reason === "auto-savedata"
              ? "Save Data is on — "
              : ""}
          showing government &amp; PHC facilities only. Private hospitals hidden.
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs text-slate-600">
        <div>
          {status === "locating" && "Locating…"}
          {status === "ok" && `Centered on ${coords.label}`}
          {status === "fail" && `Using fallback: ${FALLBACK.label}`}
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={govSearchLink}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-teal-700 hover:underline"
          >
            Government hospitals →
          </a>
          <a
            href={phcSearchLink}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-teal-700 hover:underline"
          >
            PHCs →
          </a>
          {!rural.on && (
            <a
              href={privateSearchLink}
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 hover:underline"
            >
              Private hospitals →
            </a>
          )}
          <a
            href={overpassLink}
            target="_blank"
            rel="noreferrer"
            className="text-slate-500 hover:underline"
          >
            Open in OSM
          </a>
        </div>
      </div>
      {rural.on ? (
        <div className="flex h-72 items-center justify-center bg-slate-50 px-6 text-center text-sm text-slate-700">
          <div>
            <div className="text-2xl">📡</div>
            <div className="mt-2 font-semibold text-navy-900">
              Map hidden in Rural Mode
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Conserving bandwidth on slow connections — use the government /
              PHC links above. Coords:{" "}
              {coords.lat.toFixed(3)}, {coords.lon.toFixed(3)}
            </div>
          </div>
        </div>
      ) : (
        <iframe
          title="Nearest facilities"
          className="h-72 w-full"
          src={mapSrc}
          loading="lazy"
        />
      )}
    </div>
  );
}
