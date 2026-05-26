"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndiaRegion } from '@/lib/mockDataV1';
import { ScoreRing } from '@/components/ui/ScoreRing';
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Droplet,
  Layers,
  CloudRain,
  Activity,
  Award,
  Sparkles
} from 'lucide-react';

interface RegionSidebarPanelProps {
  region: IndiaRegion | null;
}

export const RegionSidebarPanel: React.FC<RegionSidebarPanelProps> = ({ region }) => {
  // Stress level color schemes
  const stressBadgeColors = {
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    moderate: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    low: 'bg-teal-50 text-teal-700 border-teal-200',
    safe: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  // Render trend state badge
  const renderTrendBadge = (trend: IndiaRegion['trend']) => {
    switch (trend) {
      case 'critical':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
            <AlertTriangle className="w-3.5 h-3.5 animate-bounce" /> Severe Crisis
          </span>
        );
      case 'declining':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md">
            <TrendingDown className="w-3.5 h-3.5" /> Declining Tables
          </span>
        );
      case 'stable':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
            <Minus className="w-3.5 h-3.5" /> Stable State
          </span>
        );
      case 'improving':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
            <TrendingUp className="w-3.5 h-3.5" /> Natural Recharge
          </span>
        );
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-2xl border border-white/50 rounded-2xl p-6 shadow-xl h-full flex flex-col justify-between min-h-[580px]">
      <AnimatePresence mode="wait">
        {!region ? (
          // Empty state view
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex-1 flex flex-col items-center justify-center text-center py-20"
          >
            <div className="p-4 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-500 mb-4 animate-bounce">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No District Selected</h3>
            <p className="text-xs text-slate-500 max-w-[220px] mt-1.5 leading-relaxed">
              Select any regional marker node on the vector map of India to load detailed aquifer analytics and AI recommendations.
            </p>
          </motion.div>
        ) : (
          // Regional stats display
          <motion.div
            key={region.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col justify-between"
          >
            <div>
              {/* Header Info */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800 leading-tight">{region.name}</h2>
                  <span className="text-xs font-bold text-slate-400">{region.state} District</span>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${stressBadgeColors[region.stressLevel]}`}>
                    {region.stressLevel}
                  </span>
                  {renderTrendBadge(region.trend)}
                </div>
              </div>

              {/* Top Row: Score Ring */}
              <div className="flex flex-col items-center justify-center py-2 bg-slate-50/50 border border-slate-100 rounded-xl mb-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Sustainability Score
                </span>
                <ScoreRing score={region.sustainabilityScore} size={110} textColorClass="text-slate-800" />
              </div>

              {/* Middle Section: Stats Grid */}
              <div className="space-y-2.5">
                {/* Groundwater Depth */}
                <div className="flex items-center justify-between p-3 bg-white/80 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Layers className="w-4 h-4 text-cyan-600" />
                    Water Table Depth
                  </div>
                  <span className="text-xs font-extrabold text-slate-800">{region.groundwaterDepth} meters</span>
                </div>

                {/* Extraction Rate */}
                <div className="flex items-center justify-between p-3 bg-white/80 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Droplet className="w-4 h-4 text-cyan-600" />
                    Extraction Rate
                  </div>
                  <span className="text-xs font-extrabold text-slate-800">{region.extractionRate} MLD</span>
                </div>

                {/* Recharge Rate */}
                <div className="flex items-center justify-between p-3 bg-white/80 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Recharge Rate
                  </div>
                  <span className="text-xs font-extrabold text-slate-800">{region.rechargeRate} MLD</span>
                </div>

                {/* Rainfall */}
                <div className="flex items-center justify-between p-3 bg-white/80 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <CloudRain className="w-4 h-4 text-cyan-500" />
                    Annual Rainfall
                  </div>
                  <span className="text-xs font-extrabold text-slate-800">{region.rainfallMM} mm</span>
                </div>

                {/* Aquifer Health Progress Bar */}
                <div className="flex flex-col gap-1.5 p-3 bg-white/80 border border-slate-100 rounded-xl">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-600" />
                      Aquifer Health Index
                    </div>
                    <span className="font-extrabold text-slate-800">{region.aquiferHealth}%</span>
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

                {/* Primary Usage */}
                <div className="flex items-center justify-between p-3 bg-white/80 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Award className="w-4 h-4 text-slate-400" />
                    Primary Sector Drawing
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200/40">
                    {region.primaryUsage}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom section: AI recommendations for selected zone */}
            <div className="mt-4 pt-4 border-t border-slate-100/80">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs mb-2">
                <Sparkles className="w-4 h-4 text-cyan-500 animate-pulse" />
                AI Regional Action Plan
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed bg-cyan-50/40 border border-cyan-100/30 rounded-xl p-3">
                {region.aiRecommendation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegionSidebarPanel;
