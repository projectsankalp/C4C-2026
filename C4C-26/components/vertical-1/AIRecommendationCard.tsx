"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AIRecommendation } from '@/lib/mockDataV1';
import * as LucideIcons from 'lucide-react';

interface AIRecommendationCardProps {
  recommendation: AIRecommendation;
}

export const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({ recommendation }) => {
  // Dynamically resolve icon or fall back to Sparkles
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[recommendation.icon] || LucideIcons.Sparkles;

  // Impact color mapping
  const impactColors = {
    High: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    Medium: 'bg-cyan-50 text-cyan-700 border-cyan-200/60',
    Low: 'bg-slate-50 text-slate-600 border-slate-200/60'
  };

  // Ease color mapping
  const easeColors = {
    Easy: 'bg-emerald-50/50 text-emerald-600 border-emerald-100',
    Moderate: 'bg-amber-50/50 text-amber-600 border-amber-100',
    Complex: 'bg-rose-50/50 text-rose-600 border-rose-100'
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(6, 182, 212, 0.08)' }}
      whileTap={{ scale: 0.98 }}
      className="bg-white/60 backdrop-blur-2xl border border-white/50 rounded-2xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Header with Icon and Category */}
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100/50">
            <IconComponent className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-slate-50 text-slate-400 border-slate-100">
            {recommendation.category}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-slate-800 mb-2 leading-snug">
          {recommendation.title}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-6">
          {recommendation.description}
        </p>
      </div>

      {/* Footer Metrics */}
      <div className="border-t border-slate-100/80 pt-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-slate-400">Impact:</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${impactColors[recommendation.impact]}`}>
            {recommendation.impact}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-slate-400">Ease:</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${easeColors[recommendation.implementationEase]}`}>
            {recommendation.implementationEase}
          </span>
        </div>

        <div className="w-full mt-3 flex items-center justify-between bg-cyan-50/40 border border-cyan-100/30 rounded-lg px-2.5 py-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-700">Est. Savings</span>
          <span className="text-xs font-black text-cyan-600">
            {recommendation.savingsLitresPerYear.toLocaleString()} L/yr
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default AIRecommendationCard;
