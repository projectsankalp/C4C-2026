"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AnalysisInput, AnalysisResult } from '@/lib/mockDataV1';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Calendar, AlertOctagon, TrendingDown, MapPin, CheckCircle, RefreshCcw } from 'lucide-react';

interface AnalysisResultPanelProps {
  result: AnalysisResult;
  input: AnalysisInput;
  onReset: () => void;
}

export const AnalysisResultPanel: React.FC<AnalysisResultPanelProps> = ({ result, input, onReset }) => {
  
  // Risk styling mapping
  const riskBadgeStyles = {
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    High: 'bg-orange-50 text-orange-700 border-orange-200',
    Critical: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
  };

  // Generate seasonal 12-month curve data based on extraction volume
  const seasonalChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Seasonal multiplier: higher in summer (Apr-May), lower in monsoon (Jul-Aug)
    const seasonalMultipliers = [1.0, 1.1, 1.3, 1.6, 1.8, 1.4, 0.7, 0.6, 0.9, 1.1, 1.0, 0.9];
    
    return months.map((month, idx) => {
      const mult = seasonalMultipliers[idx];
      return {
        month,
        extraction: Math.round(result.monthlyImpactLitres * mult),
        threshold: Math.round(result.monthlyImpactLitres * 1.3) // reference comparison
      };
    });
  }, [result.monthlyImpactLitres]);

  return (
    <div className="space-y-6">
      {/* Top Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Sustainability Score */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center text-center">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Sustainability Score
          </h3>
          <ScoreRing score={result.sustainabilityScore} size={150} textColorClass="text-slate-800" />
        </div>

        {/* Extraction Risk Indicator */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Drilling & Extraction Risk
            </h3>
            
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-sm font-black px-4 py-1.5 rounded-full border ${riskBadgeStyles[result.extractionRisk]}`}>
                {result.extractionRisk} Risk
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Based on a borewell depth of <span className="font-bold text-slate-700">{input.borewellDepth}m</span> in <span className="font-bold text-slate-700">{input.location}</span>, water drawing is classified as <span className="font-semibold text-slate-800">{result.extractionRisk.toLowerCase()} impact</span>.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
            <AlertOctagon className="w-4 h-4 text-slate-300" />
            Impact Index: {result.aquiferHealthImpact}% Depletion Rate
          </div>
        </div>

        {/* Timelines Projections */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Aquifer Lifespan Projection
            </h3>
            
            <div className="mt-2 mb-3">
              <span className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-500">
                {result.lifespanEstimateYears}
              </span>
              <span className="text-sm font-bold text-slate-500 ml-1.5">Years</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Estimated duration before water tables contract beneath drilling reach at current utilization rates.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
            <Calendar className="w-4 h-4 text-slate-300" />
            Est. Depletion Year: {2026 + result.lifespanEstimateYears}
          </div>
        </div>

      </div>

      {/* Middle Grid: Chart Area */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <TrendingDown className="w-4.5 h-4.5 text-cyan-500" />
              Seasonal Extraction Projections
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Estimated extraction volumes in litres adjusted by weather models</p>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-500" />
              <span className="text-slate-600">Calculated Extraction</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300 border-dashed" />
              <span className="text-slate-500">Standard Threshold</span>
            </div>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={seasonalChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="extractionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
                  color: '#334155'
                }}
              />
              <Area
                type="monotone"
                dataKey="extraction"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#extractionGrad)"
                name="Extraction Volume (L)"
              />
              <Area
                type="monotone"
                dataKey="threshold"
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="4 4"
                fill="transparent"
                name="Critical Safety Threshold"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Suggestions and Nearby zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Nearby better zones */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-cyan-500" />
              Recommended Sustainable Aquifer Zones
            </h4>
            <p className="text-xs text-slate-500 leading-normal mb-4">
              Geologically safer extraction pockets located within reasonable distances displaying optimal sustainability indexes.
            </p>

            <div className="space-y-2.5">
              {result.nearbyBetterZones.map((zone, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/80 border border-slate-100 rounded-xl">
                  <span className="text-xs font-bold text-slate-700">{zone}</span>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    +{30 - idx * 8}% safer tables
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conservation Suggestions */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Tailored Conservation Strategies
            </h4>
            <p className="text-xs text-slate-500 leading-normal mb-4">
              Targeted AI action items which can improve your borewell sustainability index and extend depletion timelines.
            </p>

            <div className="space-y-3">
              {result.conservationSuggestions.map((suggestion, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-700 leading-normal font-medium">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Recalculate CTA */}
      <div className="flex justify-center pt-2">
        <motion.button
          onClick={onReset}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Run New Borewell Analysis
        </motion.button>
      </div>

    </div>
  );
};

export default AnalysisResultPanel;
