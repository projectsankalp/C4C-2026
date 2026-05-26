"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface AquiferHealthGaugeProps {
  value: number; // 0 - 100
}

export const AquiferHealthGauge: React.FC<AquiferHealthGaugeProps> = ({ value }) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));
  
  // Calculate angle for the needle (from -90 degrees for 0% to +90 degrees for 100%)
  const needleRotation = (clampedValue / 100) * 180 - 90;

  // Health risk categorization
  let category = 'Critical';
  let categoryColor = 'text-rose-500 bg-rose-50 border-rose-100';
  
  if (clampedValue >= 75) {
    category = 'Excellent Equilibrium';
    categoryColor = 'text-emerald-600 bg-emerald-50 border-emerald-100';
  } else if (clampedValue >= 50) {
    category = 'Safe / Stable';
    categoryColor = 'text-teal-600 bg-teal-50 border-teal-100';
  } else if (clampedValue >= 30) {
    category = 'Moderate Stress';
    categoryColor = 'text-amber-600 bg-amber-50 border-amber-100';
  } else if (clampedValue >= 15) {
    category = 'Severe Depletion';
    categoryColor = 'text-orange-600 bg-orange-50 border-orange-100';
  }

  return (
    <div className="bg-white/60 backdrop-blur-2xl border border-white/50 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center h-full">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 w-full">
        Aquifer Health Status
      </h3>

      <div className="relative w-full max-w-[240px] flex flex-col items-center justify-center">
        {/* Semicircular gauge SVG */}
        <svg viewBox="0 0 200 120" className="w-full h-auto">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />    {/* Red */}
              <stop offset="35%" stopColor="#f59e0b" />   {/* Orange/Amber */}
              <stop offset="65%" stopColor="#0d9488" />   {/* Teal */}
              <stop offset="100%" stopColor="#10b981" />  {/* Emerald */}
            </linearGradient>
            
            <filter id="gaugeShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.08"/>
            </filter>
          </defs>

          {/* Background Arc */}
          <path
            d="M20,100 A80,80 0 0,1 180,100"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Colored Gradient Arc */}
          <path
            d="M20,100 A80,80 0 0,1 180,100"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="16"
            strokeLinecap="round"
            filter="url(#gaugeShadow)"
          />

          {/* Semicircle grid ticks */}
          <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="2" strokeDasharray="1 19" className="opacity-40" />

          {/* Center Pin Anchor */}
          <circle cx="100" cy="100" r="10" fill="#334155" />
          <circle cx="100" cy="100" r="4" fill="#f8fafc" />

          {/* Animated Needle */}
          <motion.g
            transform="translate(100, 100)"
            animate={{ rotate: needleRotation }}
            transition={{ type: 'spring', stiffness: 60, damping: 12 }}
            style={{ originX: '0px', originY: '0px' }}
          >
            {/* Needle pointer */}
            <path
              d="M-5,-5 L-1,-75 L1,-75 L5,-5 Z"
              fill="#334155"
            />
          </motion.g>
        </svg>

        {/* Big percentage number */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-slate-800"
          >
            {clampedValue}%
          </motion.span>
        </div>
      </div>

      {/* Category Badge below */}
      <span className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full border mt-4 ${categoryColor}`}>
        {category}
      </span>
      
      <p className="text-[11px] text-slate-500 leading-normal max-w-[220px] mt-3">
        Reflects composite metrics: rainfall volume, local replenishment frequency, and structural soil layers.
      </p>
    </div>
  );
};

export default AquiferHealthGauge;
