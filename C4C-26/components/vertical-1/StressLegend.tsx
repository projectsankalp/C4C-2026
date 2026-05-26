"use client";

import React from 'react';

export const StressLegend: React.FC = () => {
  // Stress level metadata
  const categories = [
    { label: 'Critical', color: 'bg-rose-500', desc: 'Over-extracted aquifer table' },
    { label: 'High', color: 'bg-orange-500', desc: 'Accelerated table contraction' },
    { label: 'Moderate', color: 'bg-yellow-500', desc: 'Seasonal water draw stress' },
    { label: 'Low', color: 'bg-teal-500', desc: 'Healthy water draw balance' },
    { label: 'Safe', color: 'bg-emerald-500', desc: 'Optimal natural water reserves' }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Aquifer Stress Index:
      </span>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {categories.map((cat, idx) => (
          <div key={idx} className="flex items-center gap-2 group cursor-help relative">
            <span className={`w-3 h-3 rounded-full ${cat.color} border border-white shadow-sm`} />
            <span className="text-xs font-bold text-slate-700">{cat.label}</span>
            
            {/* Tooltip on hover */}
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 bg-slate-800 text-white text-[9px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-center z-20 font-normal shadow-md leading-normal">
              {cat.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StressLegend;
