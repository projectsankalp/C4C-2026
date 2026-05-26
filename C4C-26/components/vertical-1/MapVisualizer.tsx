"use client";

import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndiaRegion } from '@/lib/mockDataV1';
import MapMarker from './MapMarker';
import RegionTooltip from './RegionTooltip';
import { Maximize2, Compass, Layers } from 'lucide-react';

interface MapVisualizerProps {
  regions: IndiaRegion[];
  selectedRegion: IndiaRegion | null;
  onRegionSelect: (region: IndiaRegion) => void;
}

export const MapVisualizer: React.FC<MapVisualizerProps> = ({
  regions,
  selectedRegion,
  onRegionSelect,
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<IndiaRegion | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle marker hover state changes
  const handleMarkerHover = (id: string | null) => {
    if (!id) {
      setHoveredRegion(null);
      return;
    }
    const region = regions.find(r => r.id === id);
    if (region) setHoveredRegion(region);
  };

  // Convert SVG coordinates 0-800 X 0-900 into parent percentage values for the floating HTML tooltip
  const tooltipCoords = useMemo(() => {
    if (!hoveredRegion) return { xPct: 0, yPct: 0 };
    // Translate coordinate positions
    const xPct = (hoveredRegion.coordinates.x / 800) * 100;
    const yPct = (hoveredRegion.coordinates.y / 900) * 100;
    return { xPct, yPct };
  }, [hoveredRegion]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[580px] bg-gradient-to-br from-cyan-50/20 via-white to-emerald-50/20 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-xl overflow-hidden flex flex-col justify-between"
    >
      {/* Decorative Overlay Grid Panel */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Floating map instruments icons */}
      <div className="absolute top-5 left-5 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-slate-100 rounded-xl px-3 py-1.5 shadow-sm">
          <Compass className="w-4 h-4 text-cyan-600 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hydro-Spatial Layer</span>
        </div>
      </div>

      <div className="absolute top-5 right-5 z-10 flex gap-2">
        <div className="flex items-center justify-center p-2 rounded-xl bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm text-slate-500 hover:text-slate-800 transition-colors">
          <Layers className="w-4 h-4" />
        </div>
      </div>

      {/* Main SVG Vector Canvas */}
      <div className="flex-1 w-full h-full flex items-center justify-center p-4">
        <svg
          viewBox="0 0 800 900"
          className="w-full h-full max-h-[500px] select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft Ocean Grid Gradients */}
            <linearGradient id="indiaBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ecfeff" />
              <stop offset="50%" stopColor="#f0fdfa" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>

            <linearGradient id="indiaStrokeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* Glowing filter shadow */}
            <filter id="indiaShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#0891b2" floodOpacity="0.06" />
            </filter>
          </defs>

          {/* India Vector Outline Silhouette Shape */}
          <motion.path
            d="M 280 180 
               L 330 140 
               L 340 100 
               L 350 80 
               L 370 70 
               L 380 90 
               L 410 110 
               L 420 130 
               L 440 120 
               L 460 160 
               L 430 200 
               L 480 230 
               L 520 250 
               L 540 270 
               L 570 280 
               L 600 270 
               L 620 300 
               L 680 320 
               L 720 310 
               L 760 300 
               L 770 330 
               L 740 370 
               L 750 390 
               L 730 400 
               L 670 390 
               L 640 430 
               L 610 420 
               L 580 450 
               L 560 480 
               L 500 520 
               L 480 570 
               L 430 630 
               L 410 680 
               L 390 750 
               L 380 820 
               L 360 840 
               L 360 810 
               L 340 760 
               L 310 740 
               L 280 720 
               L 270 690 
               L 280 660 
               L 260 630 
               L 260 590 
               L 220 540 
               L 180 510 
               L 120 480 
               L 100 460 
               L 140 440 
               L 160 420 
               L 170 370 
               L 210 330 
               L 220 280 
               L 250 250 
               L 270 200 Z"
            fill="url(#indiaBgGrad)"
            stroke="url(#indiaStrokeGrad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            filter="url(#indiaShadow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />

          {/* Grid coordinates labels inside the map space */}
          <text x="140" y="820" fill="#cbd5e1" fontSize="12" fontWeight="bold" letterSpacing="2">ARABIAN SEA</text>
          <text x="500" y="820" fill="#cbd5e1" fontSize="12" fontWeight="bold" letterSpacing="2">BAY OF BENGAL</text>

          {/* Interactive Marker Groups overlay */}
          <g>
            {regions.map(region => (
              <MapMarker
                key={region.id}
                region={region}
                isSelected={selectedRegion?.id === region.id}
                isHovered={hoveredRegion?.id === region.id}
                onClick={() => onRegionSelect(region)}
                onHover={handleMarkerHover}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Floating HTML Hover Tooltip */}
      <AnimatePresence>
        {hoveredRegion && containerRef.current && (
          <RegionTooltip
            region={hoveredRegion}
            x={(tooltipCoords.xPct / 100) * containerRef.current.clientWidth}
            y={(tooltipCoords.yPct / 100) * containerRef.current.clientHeight}
          />
        )}
      </AnimatePresence>

      {/* Footer Info Strip */}
      <div className="bg-slate-50/80 border-t border-slate-100 py-3.5 px-6 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span>Click district nodes to load aquifer profile</span>
        <div className="flex items-center gap-1">
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Interactive coordinates</span>
        </div>
      </div>

    </div>
  );
};

export default MapVisualizer;
