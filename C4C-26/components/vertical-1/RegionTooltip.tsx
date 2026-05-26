"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { IndiaRegion } from '@/lib/mockDataV1';

interface RegionTooltipProps {
  region: IndiaRegion;
  x: number; // Absolute X coordinates on overlay viewport
  y: number; // Absolute Y coordinates on overlay viewport
}

export const RegionTooltip: React.FC<RegionTooltipProps> = ({ region, x, y }) => {
  // Stress level color schemes
  const stressBadgeColors = {
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    moderate: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    low: 'bg-teal-50 text-teal-700 border-teal-200',
    safe: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="absolute pointer-events-none z-40 bg-white/90 backdrop-blur-2xl border border-white/60 rounded-2xl p-4 shadow-xl w-60"
      style={{
        left: `${x}px`,
        top: `${y - 130}px`, // offset above the marker point
        transform: 'translateX(-50%)',
      }}
    >
      {/* Tooltip caret indicator arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/90" />

      {/* Header Info */}
      <div className="mb-2">
        <h4 className="text-sm font-extrabold text-slate-800 leading-tight">{region.name}</h4>
        <span className="text-[10px] font-semibold text-slate-400">{region.state}</span>
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
        {/* Stress badge row */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-slate-400">Stress:</span>
          <span className={`px-2 py-0.5 rounded-full font-black border uppercase tracking-wider text-[8px] ${stressBadgeColors[region.stressLevel]}`}>
            {region.stressLevel}
          </span>
        </div>

        {/* Aquifer health bar row */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-semibold text-slate-400">Aquifer Health:</span>
            <span className="font-bold text-slate-700">{region.aquiferHealth}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
            <div
              className={`h-full rounded-full ${
                region.aquiferHealth > 75 ? 'bg-emerald-500' :
                region.aquiferHealth > 50 ? 'bg-teal-500' :
                region.aquiferHealth > 30 ? 'bg-yellow-500' : 'bg-rose-500'
              }`}
              style={{ width: `${region.aquiferHealth}%` }}
            />
          </div>
        </div>

        {/* Extraction Depth */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-slate-400">Water Depth:</span>
          <span className="font-bold text-slate-700">{region.groundwaterDepth}m</span>
        </div>
      </div>
    </motion.div>
  );
};

export default RegionTooltip;
