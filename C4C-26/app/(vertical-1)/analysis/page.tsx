"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisInput, AnalysisResult, calculateAnalysis } from '@/lib/mockDataV1';
import AnalysisForm from '@/components/vertical-1/AnalysisForm';
import AnalysisResultPanel from '@/components/vertical-1/AnalysisResultPanel';
import { GlassCard } from '@/components/ui/GlassCard';
import { Database, Activity, ChevronRight } from 'lucide-react';
import { SatelliteVerificationLoader } from '@/components/shared/SatelliteVerificationLoader';

export default function AnalysisPage() {
  const [phase, setPhase] = useState<'form' | 'calculating' | 'result'>('form');
  const [formState, setFormState] = useState<AnalysisInput | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Triggers form submission and starts calculations phase
  const handleFormSubmit = (input: AnalysisInput) => {
    setFormState(input);
    setPhase('calculating');
  };

  const handleReset = () => {
    setPhase('form');
    setFormState(null);
    setResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
      
      {/* Title Header */}
      <div className="border-b border-slate-200/55 pb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 bg-cyan-50 border border-cyan-200/60 px-3 py-1 rounded-full">
          Vertical 1 Module
        </span>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-2">
          Location Sustainability Calculator
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">Verify structural drilling sustainability rates and secure localized water reserve lifespans</p>
      </div>

      {/* Dynamic Phase Canvas */}
      <AnimatePresence mode="wait">
        
        {/* Phase 1: Interactive Input Form */}
        {phase === 'form' && (
          <motion.div
            key="form-phase"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
          >
            
            {/* Form Left Side (65% width equivalent) */}
            <div className="lg:col-span-2 bg-white/60 backdrop-blur-2xl border border-white/50 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-800">
                  Aquifer Drilling Simulator
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Input borewell specs to project geological draw boundaries</p>
              </div>

              <AnalysisForm onSubmit={handleFormSubmit} isLoading={false} />
            </div>

            {/* Info Right Side (35% width equivalent) */}
            <div className="space-y-4">
              <GlassCard className="bg-white/60 border-white/60 shadow-lg text-left p-6">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">
                  <Database className="w-4 h-4 text-cyan-600" />
                  What is analyzed?
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  The JalRakshak hydro-spatial algorithm cross-references your inputs against local district datasets:
                </p>

                <div className="space-y-3.5">
                  {[
                    { label: 'Geological Aquifer Depth', desc: 'Analyzes draw pressure limits and substrate composition layers' },
                    { label: 'Draw Volume Frequency', desc: 'Projects seasonal recovery heights to prevent localized sink pockets' },
                    { label: 'Monsoon Replenishment Factor', desc: 'Contrasts natural monsoon percolation rates against draw velocities' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <ChevronRight className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-700">{item.label}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Your results will appear here card placeholder */}
              <GlassCard className="bg-white/40 border-slate-100/50 border border-dashed flex flex-col items-center justify-center text-center p-8 select-none">
                <div className="p-3 rounded-full bg-slate-100/60 border border-slate-200/30 text-slate-300 mb-3 animate-pulse">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-400">Results Simulator Idle</h4>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Fill in borewell parameters to load the groundwater sustainability analysis</p>
              </GlassCard>
            </div>
            
          </motion.div>
        )}

        {/* Phase 2: Loading Processing Scans */}
        {phase === 'calculating' && (
          <motion.div
            key="calculating-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center min-h-[460px]"
          >
            {/* Full-screen SatelliteVerificationLoader handles the visual layout */}
          </motion.div>
        )}

        {/* Phase 3: Results Display Panel */}
        {phase === 'result' && result && formState && (
          <motion.div
            key="result-phase"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <AnalysisResultPanel
              result={result}
              input={formState}
              onReset={handleReset}
            />
          </motion.div>
        )}

      </AnimatePresence>

      {/* Satellite Scan Overlay */}
      <SatelliteVerificationLoader
        isVisible={phase === 'calculating'}
        onComplete={() => {
          if (formState) {
            const computedResult = calculateAnalysis(formState);
            setResult(computedResult);
            setPhase('result');
          }
        }}
      />

    </div>
  );
}
