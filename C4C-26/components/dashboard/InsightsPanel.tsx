"use client";

import React from 'react';
import { useUser } from '@/lib/userContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Check, Sparkles, Droplet, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export const InsightsPanel: React.FC = () => {
  const { profile, result } = useUser();

  if (!profile || !result) return null;

  // Determine dynamic Quick Win based on user profile
  let quickWinTitle = "Install Rooftop Rainwater Harvesting";
  let quickWinDesc = "Harvest rain from roof profiles directly into aquifer recharge trenches.";
  let quickWinSavings = "12,000 gal/year";

  if (profile.irrigationFrequency === 'flood' || profile.irrigationFrequency === 'daily') {
    quickWinTitle = "Switch to Sub-Surface Drip Irrigation";
    quickWinDesc = "Eliminate field evaporation. Delivers water directly to root depths.";
    quickWinSavings = "45,000 gal/year";
  } else if (profile.cropType === 'water-intensive') {
    quickWinTitle = "Transition to Pearl Millet / Sorghum";
    quickWinDesc = "Swap intensive cash crops for highly drought-resilient grain varieties.";
    quickWinSavings = "38,000 gal/year";
  } else if (profile.livestockCount > 80) {
    quickWinTitle = "Recycle Livestock Washwater";
    quickWinDesc = "Filter barn wash runoff through gravel reedbeds to reuse for cleaning.";
    quickWinSavings = "9,500 gal/year";
  } else if (profile.householdSize > 5) {
    quickWinTitle = "Install Low-Flow Aerators";
    quickWinDesc = "Add standard pressure aerators to kitchen and shower outputs.";
    quickWinSavings = "3,000 gal/year";
  }

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Sparkles className="w-5 h-5 text-emerald-400" />
        <h3 className="text-base font-bold text-white tracking-tight">Sustainability Insights</h3>
      </div>

      {/* Praise list */}
      <div className="space-y-2">
        {result.praiseMessages && result.praiseMessages.map((praise, idx) => (
          <div key={idx} className="flex gap-2.5 items-start text-xs text-slate-300 leading-normal">
            <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span>{praise}</span>
          </div>
        ))}
      </div>

      {/* Quick Win Highlight Card */}
      <div className="pt-3 border-t border-white/10">
        <span className="text-[10px] font-bold text-aqua-400 uppercase tracking-widest block mb-2">Recommended Quick Win</span>
        <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-aqua-500/5 rounded-full blur-2xl group-hover:bg-aqua-500/10 transition-colors" />
          
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center gap-2 bg-aqua-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold text-aqua-400 mb-2">
              <Droplet className="w-3 h-3" />
              Saves {quickWinSavings}
            </div>
            <Link href="/recommendations" className="text-slate-400 hover:text-white transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          
          <h4 className="text-sm font-bold text-white leading-tight">{quickWinTitle}</h4>
          <p className="text-xs text-slate-400 mt-1 leading-normal">{quickWinDesc}</p>
        </div>
      </div>
    </GlassCard>
  );
};

export default InsightsPanel;
