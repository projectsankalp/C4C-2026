"use client";
 
import { useEffect, useRef, useState, useMemo } from "react";
 
interface MapNode {
  name: string;
  lat: number;
  lon: number;
  cases: number;
  anomalies: number;
  severity: "EMERGENCY" | "URGENT" | "MODERATE" | "LOW" | "HIGH";
  details: string[];
}
 
export function ThreeDAnomalyMap({
  patients,
  anomalies,
}: {
  patients: { location: string | null; severity: string; patientName: string }[];
  anomalies: { type: string; village?: string; message: string }[];
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);
 
  // Base coordinates for India central focus
  const INDIA_CENTRAL_LAT = 21.8937;
  const INDIA_CENTRAL_LON = 78.9629;
 
  // Map city names in India to accurate coordinates
  const locationCoords: Record<string, { lat: number; lon: number }> = {
    sangli: { lat: 16.8524, lon: 74.5815 },
    mumbai: { lat: 19.0760, lon: 72.8777 },
    pune: { lat: 18.5204, lon: 73.8567 },
    delhi: { lat: 28.6139, lon: 77.2090 },
    aiims: { lat: 28.5672, lon: 77.2100 },
    ncr: { lat: 28.5355, lon: 77.3910 },
    bangalore: { lat: 12.9716, lon: 77.5946 },
    karnataka: { lat: 15.3173, lon: 75.7139 },
    chennai: { lat: 13.0827, lon: 80.2707 },
    tamil: { lat: 11.1271, lon: 78.6569 },
    kerala: { lat: 10.8505, lon: 76.2711 },
    gujarat: { lat: 22.2587, lon: 71.1924 },
    rajasthan: { lat: 27.0238, lon: 74.2179 },
    punjab: { lat: 31.1471, lon: 75.3412 },
    haryana: { lat: 29.0588, lon: 76.0856 },
    unr: { lat: 16.8624, lon: 74.5915 }, // default near Sangli if unnamed
  };
 
  // Process patients into map nodes
  const nodes = useMemo<MapNode[]>(() => {
    const map = new Map<string, { cases: number; anomalies: number; severity: string; details: string[] }>();
    
    // Group patients by location
    for (const p of patients) {
      const loc = p.location || "Unknown District";
      const existing = map.get(loc) || { cases: 0, anomalies: 0, severity: "LOW", details: [] };
      existing.cases += 1;
      
      const ranks = { EMERGENCY: 4, URGENT: 3, HIGH: 3, MODERATE: 2, LOW: 1 };
      const currentRank = ranks[p.severity as keyof typeof ranks] || 1;
      const existingRank = ranks[existing.severity as keyof typeof ranks] || 1;
      if (currentRank > existingRank) {
        existing.severity = p.severity;
      }
      
      map.set(loc, existing);
    }
 
    // Annotate anomalies
    for (const a of anomalies) {
      const loc = a.village || "Unknown District";
      const node = map.get(loc);
      if (node) {
        node.anomalies += 1;
        node.details.push(a.message);
      }
    }
 
    // Assign stable 3D coordinates based on location coordinates dictionary or hash offset
    return Array.from(map.entries()).map(([name, data]) => {
      const cleanName = name.toLowerCase();
      let coords = { lat: INDIA_CENTRAL_LAT, lon: INDIA_CENTRAL_LON };
      
      // Match coordinate dictionary
      let matched = false;
      for (const [key, val] of Object.entries(locationCoords)) {
        if (cleanName.includes(key)) {
          coords = { ...val };
          matched = true;
          break;
        }
      }
 
      if (!matched) {
        // Fallback to Nagpur (central India landmass) with a tiny jitter (within 10-15km) to guarantee it stays on land
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
          hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const latJitter = ((hash % 20) / 100) - 0.1;
        const lonJitter = (((hash >> 6) % 20) / 100) - 0.1;
        coords = { lat: 21.1458 + latJitter, lon: 79.0882 + lonJitter };
      }
 
      return {
        name,
        lat: coords.lat,
        lon: coords.lon,
        cases: data.cases,
        anomalies: data.anomalies,
        severity: data.severity as MapNode["severity"],
        details: data.details,
      };
    });
  }, [patients, anomalies]);
 
  // Calculate statistics
  const totalCases = patients.length;
  const highRiskCount = patients.filter(p => 
    p.severity === "EMERGENCY" || p.severity === "URGENT" || p.severity === "HIGH"
  ).length;
 
  // Dynamically load Leaflet CDN assets
  useEffect(() => {
    if (typeof window === "undefined") return;
 
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }
 
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);
 
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(script);
  }, []);
 
  // Render and update Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;
 
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
 
    // Initialize Leaflet Map Centered on India
    const map = L.map(mapContainerRef.current, {
      center: [INDIA_CENTRAL_LAT, INDIA_CENTRAL_LON],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });
    mapInstanceRef.current = map;
 
    L.control.zoom({ position: "bottomright" }).addTo(map);
 
    // Beautiful, clean Dark Matter Tiles (or Positron light tiles)
    // Using Positron matches the dashboard color palette beautifully
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
    }).addTo(map);
 
    const markers: any[] = [];
 
    for (const node of nodes) {
      let color = "#10b981"; // Stable green
      if (node.anomalies > 0) {
        color = "#fb923c"; // General warning orange
      }
      if (node.severity === "EMERGENCY" || node.severity === "URGENT" || node.severity === "HIGH") {
        color = "#ef4444"; // Urgent/high-risk red
      }
 
      // Marker circle representing cases size
      const radius = 10 + Math.min(node.cases * 4, 18);
 
      // Draw outer glowing circle
      const pulseCircle = L.circle([node.lat, node.lon], {
        radius: radius * 350,
        fillColor: color,
        color: "transparent",
        fillOpacity: 0.15,
      }).addTo(map);
 
      // Draw core circle marker
      const marker = L.circleMarker([node.lat, node.lon], {
        radius,
        fillColor: color,
        color: "#ffffff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      });
 
      marker.on("mouseover", () => {
        setHoveredNode(node);
      });
      marker.on("mouseout", () => {
        setHoveredNode(null);
      });
 
      const popupContent = `
        <div style="font-family: sans-serif; min-width: 180px; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="font-size: 12px; color: #0f172a;">📍 ${node.name}</strong>
            <span style="font-size: 8px; font-weight: bold; text-transform: uppercase; padding: 1.5px 5px; border-radius: 9999px; background-color: ${color}; color: #ffffff;">
              ${node.severity}
            </span>
          </div>
          <div style="font-size: 10px; color: #475569; margin-bottom: 3px;">
            Cases recorded: <strong>${node.cases}</strong>
          </div>
          <div style="font-size: 10px; color: #475569; margin-bottom: 4px;">
            Outbreaks: <strong>${node.anomalies}</strong>
          </div>
          ${
            node.details.length > 0
              ? `<div style="border-top: 1px solid #f1f5f9; padding-top: 4px; font-size: 9px; color: #ea580c; line-height: 1.2;">
                  <strong>Alert Details:</strong>
                  <ul style="margin: 2px 0 0 0; padding-left: 10px;">
                    ${node.details.map((d) => `<li style="margin-bottom: 1.5px;">${d}</li>`).join("")}
                  </ul>
                 </div>`
              : ""
          }
        </div>
      `;
 
      marker.bindPopup(popupContent);
      marker.addTo(map);
      markers.push(marker);
    }
 
    // Fit bounds to markers if they are spread out, otherwise keep default zoom on India
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.4));
    }
 
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, nodes]);
 
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-1.5 shadow-md overflow-hidden">
      {/* 📊 LEFT HUD Panel: Outbreak statistics */}
      <div className="absolute top-4 left-4 z-[999] pointer-events-none select-none bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 shadow-sm w-56">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-teal-600 font-mono">
            India Prevalence Grid
          </span>
        </div>
        <h3 className="mt-1 text-xs font-bold text-slate-800 leading-tight">
          Diabetes Diagnostic Prevalence Map
        </h3>
        <p className="text-[9px] text-slate-400">
          Real-time case mappings across India
        </p>
        <div className="mt-2.5 pt-2.5 border-t border-slate-100">
          <span className="text-[9px] text-slate-500 block">Total Database Cases:</span>
          <span className="text-base font-extrabold text-teal-600">{totalCases}</span>
          <span className="text-[8px] text-slate-400 block mt-0.5">
            ({highRiskCount} High Severity Triage)
          </span>
        </div>
      </div>
 
      {/* 🎨 RIGHT HUD Panel: Severity Legend */}
      <div className="absolute top-4 right-4 z-[999] pointer-events-none select-none bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 shadow-sm w-40">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Triage Severity</span>
        <div className="mt-2 space-y-1 text-[9px]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
            <span className="text-slate-600">Urgent / Emergency / High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#fb923c]" />
            <span className="text-slate-600">Moderate / Warnings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#10b981]" />
            <span className="text-slate-600">Low / Stable Cases</span>
          </div>
        </div>
      </div>
 
      {/* Map Element */}
      <div
        ref={mapContainerRef}
        style={{ height: "350px" }}
        className="w-full rounded-xl bg-slate-50 border border-slate-100 z-10"
      />
 
      {!leafletLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 backdrop-blur-xs z-50">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            <span>Loading Native 2D Map tiles...</span>
          </div>
        </div>
      )}
 
      {/* Dynamic Hover Details HUD */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 z-[999] w-64 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-md backdrop-blur-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="font-bold text-slate-800 text-xs">📍 {hoveredNode.name}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold text-white ${
              hoveredNode.severity === "EMERGENCY" || hoveredNode.severity === "URGENT" || hoveredNode.severity === "HIGH"
                ? "bg-red-500"
                : hoveredNode.anomalies > 0
                ? "bg-orange-500"
                : "bg-emerald-500"
            }`}>
              {hoveredNode.severity}
            </span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Patients Screened:</span>
              <span className="font-semibold text-slate-700">{hoveredNode.cases}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Anomalies:</span>
              <span className="font-semibold text-orange-600">{hoveredNode.anomalies}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
