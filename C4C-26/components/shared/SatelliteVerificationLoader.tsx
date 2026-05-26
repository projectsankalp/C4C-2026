"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SatelliteVerificationLoaderProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const SatelliteVerificationLoader: React.FC<SatelliteVerificationLoaderProps> = ({
  isVisible,
  onComplete,
}) => {
  const [statusIdx, setStatusIdx] = useState(0);

  const statusMessages = [
    "Establishing satellite connection...",
    "Scanning Sentinel-2 Multispectral Imagery...",
    "Cross-referencing Bhulekh Land Records...",
    "Validating soil moisture index...",
    "Finalizing groundwater model..."
  ];

  useEffect(() => {
    if (!isVisible) return;

    // Cycle through messages every 1000ms
    const msgInterval = setInterval(() => {
      setStatusIdx((prev) => (prev < statusMessages.length - 1 ? prev + 1 : prev));
    }, 1000);

    // Complete loader after exactly 5 seconds
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearInterval(msgInterval);
      clearTimeout(completeTimeout);
    };
  }, [isVisible, onComplete, statusMessages.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950 flex flex-col items-center justify-center p-6 text-center select-none">
      
      {/* Background stars / grid simulation overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(6,182,212,0.15)_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />

      <div className="relative flex flex-col items-center max-w-md w-full space-y-12 z-10">
        
        {/* Animated Satellite SVG */}
        <div className="relative flex items-center justify-center w-40 h-40">
          
          {/* Concentric pulsing radar rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[0, 1, 2].map((idx) => (
              <motion.div
                key={idx}
                className="absolute w-24 h-24 rounded-full border border-cyan-500/40"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: idx * 0.8,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          {/* Core satellite model */}
          <motion.div
            animate={{
              y: [0, -8, 0],
              rotate: [0, 4, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-24 h-24 flex items-center justify-center text-cyan-400"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {/* Solar array panels */}
              <rect x="15" y="42" width="22" height="16" rx="2" fill="rgba(6,182,212,0.1)" />
              <line x1="15" y1="50" x2="37" y2="50" />
              <line x1="26" y1="42" x2="26" y2="58" />

              <rect x="63" y="42" width="22" height="16" rx="2" fill="rgba(6,182,212,0.1)" />
              <line x1="63" y1="50" x2="85" y2="50" />
              <line x1="74" y1="42" x2="74" y2="58" />

              {/* Connector shafts */}
              <line x1="37" y1="50" x2="44" y2="50" />
              <line x1="56" y1="50" x2="63" y2="50" />

              {/* Main spacecraft chassis body */}
              <rect x="44" y="38" width="12" height="24" rx="1.5" fill="#0f172a" />
              
              {/* Antennae */}
              <path d="M 50 38 L 50 25" />
              <circle cx="50" cy="24" r="2" fill="currentColor" />
              
              {/* Receiver dish */}
              <path d="M 42 66 C 45 74, 55 74, 58 66 Z" fill="rgba(6,182,212,0.2)" />
              <line x1="50" y1="62" x2="50" y2="69" />
            </svg>
          </motion.div>

        </div>

        {/* Cycling Status Indicators */}
        <div className="h-16 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={statusIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-sm sm:text-base font-bold text-cyan-400 tracking-wide uppercase"
            >
              {statusMessages[statusIdx]}
            </motion.p>
          </AnimatePresence>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Sentinel-2 Geospatial Pipeline</span>
        </div>

      </div>

      {/* Progress Bar Container (bottom edge) */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800/80">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 5, ease: 'linear' }}
        />
      </div>

    </div>
  );
};

export default SatelliteVerificationLoader;
