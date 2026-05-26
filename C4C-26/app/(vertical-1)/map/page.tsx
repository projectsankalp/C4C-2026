"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { indiaRegions, IndiaRegion } from '@/lib/mockDataV1';
import MapVisualizer from '@/components/vertical-1/MapVisualizer';
import RegionSidebarPanel from '@/components/vertical-1/RegionSidebarPanel';
import StressLegend from '@/components/vertical-1/StressLegend';
import DistrictComparisonTable from '@/components/vertical-1/DistrictComparisonTable';
import { BrainCircuit, X, Table } from 'lucide-react';

export default function MapPage() {
  const [selectedRegion, setSelectedRegion] = useState<IndiaRegion | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'high' | 'safe'>('all');
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Filter markers based on selected stress level categories
  const filteredRegions = useMemo(() => {
    switch (activeFilter) {
      case 'critical':
        return indiaRegions.filter(r => r.stressLevel === 'critical');
      case 'high':
        return indiaRegions.filter(r => r.stressLevel === 'high');
      case 'safe':
        return indiaRegions.filter(r => r.stressLevel === 'safe' || r.stressLevel === 'low');
      default:
        return indiaRegions;
    }
  }, [activeFilter]);

  // Statistics counters for the floating minicard
  const statsSummary = useMemo(() => {
    const critical = indiaRegions.filter(r => r.stressLevel === 'critical').length;
    const improving = indiaRegions.filter(r => r.trend === 'improving').length;
    const stable = indiaRegions.filter(r => r.trend === 'stable').length;
    return { critical, improving, stable };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200/55 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 bg-cyan-50 border border-cyan-200/60 px-3 py-1 rounded-full">
            Vertical 1 Module
          </span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-2 flex items-center gap-2">
            AI Groundwater Intelligence Map
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">District hydro-spatial mapping overlay and real-time stress classifications</p>
        </div>

        {/* Modal Toggle Button */}
        <motion.button
          onClick={() => setShowCompareModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:bg-slate-50 cursor-pointer self-start md:self-auto"
        >
          <Table className="w-4 h-4 text-cyan-600" />
          Compare All Regions
        </motion.button>
      </div>

      {/* Main Map Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Map Visual Canvas (65% width equivalent) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Above Map Controls: Filters and Stats Summary */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70 backdrop-blur-xl border border-white/60 p-4 rounded-2xl shadow-sm">
            {/* Stress level filter selectors */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/50 w-full sm:w-auto">
              {[
                { id: 'all' as const, label: 'All Regions' },
                { id: 'critical' as const, label: 'Critical' },
                { id: 'high' as const, label: 'High Stress' },
                { id: 'safe' as const, label: 'Safe Zones' }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeFilter === filter.id
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200/20'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Minicard statistics display */}
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>{statsSummary.critical} Critical Zones</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{statsSummary.improving} Improving</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>{statsSummary.stable} Stable</span>
              </div>
            </div>
          </div>

          {/* Core Interactive Vector Visualizer */}
          <MapVisualizer
            regions={filteredRegions}
            selectedRegion={selectedRegion}
            onRegionSelect={setSelectedRegion}
          />

          {/* Bottom Map Legend */}
          <StressLegend />
        </div>

        {/* Right Side: Sidebar stats panel (35% width equivalent) */}
        <div className="space-y-4">
          
          {/* Main Sidebar panel detailing selected district parameters */}
          <RegionSidebarPanel region={selectedRegion} />

          {/* Under Sidebar AI recommendation block if district is active */}
          {selectedRegion && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-2xl border border-white/50 rounded-2xl p-5 shadow-lg space-y-3"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <BrainCircuit className="w-4 h-4 text-cyan-500" />
                AI Regional Action Plan Detail
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Hydro-geological assessments suggest that rejuvenating <span className="font-semibold text-slate-700">{selectedRegion.name}&apos;s</span> dry channels could offset drawing pressures. Incorporate micro-drip networks.
              </p>
            </motion.div>
          )}
        </div>

      </div>

      {/* Comparison Modal Overlay */}
      <AnimatePresence>
        {showCompareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Modal Content Panel */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-6xl bg-transparent select-none"
            >
              {/* Close Button top-right */}
              <button
                onClick={() => setShowCompareModal(false)}
                className="absolute -top-12 right-0 p-2.5 rounded-full bg-white/90 border border-slate-200 text-slate-600 hover:text-slate-800 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer z-50"
                aria-label="Close Comparison modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Distric Comparison Table */}
              <DistrictComparisonTable regions={indiaRegions} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
