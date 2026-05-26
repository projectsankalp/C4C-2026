"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { RecommendationTip } from '@/lib/mockData';
import {
  Droplet,
  Sprout,
  CloudRain,
  Cpu,
  RefreshCw,
  Home,
  Compass,
  Layers,
  HelpCircle
} from 'lucide-react';

interface RecommendationCardProps {
  tip: RecommendationTip;
  delay?: number;
}

const IconMapper: React.FC<{ iconName: string; className?: string }> = ({ iconName, className }) => {
  switch (iconName) {
    case 'Droplet':
      return <Droplet className={className} />;
    case 'Sprout':
      return <Sprout className={className} />;
    case 'CloudRain':
      return <CloudRain className={className} />;
    case 'Cpu':
      return <Cpu className={className} />;
    case 'RefreshCw':
      return <RefreshCw className={className} />;
    case 'Home':
      return <Home className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ tip, delay = 0 }) => {
  const { title, description, impact, category, savingsGallons } = tip;

  const impactStyles = {
    High: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/5',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/5',
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{
        y: -6,
        boxShadow: "0 12px 24px -10px rgba(6, 182, 212, 0.25)",
        borderColor: "rgba(6, 182, 212, 0.3)"
      }}
      className="h-full"
    >
      <GlassCard className="h-full flex flex-col justify-between transition-colors border border-white/10 hover:bg-white/[0.07]">
        <div>
          {/* Header Row */}
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="p-2.5 rounded-xl bg-aqua-500/10 text-aqua-400 border border-aqua-500/20 shrink-0">
              <IconMapper iconName={tip.icon} className="w-5 h-5" />
            </div>
            <div className="flex gap-2">
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${impactStyles[impact]}`}>
                {impact} Impact
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-white/5 text-slate-400 border border-white/5">
                {category}
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <h4 className="text-base font-bold text-white mb-2 leading-tight tracking-tight">{title}</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">{description}</p>
        </div>

        {/* Savings Metric */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between mt-auto">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Estimated Savings</span>
          <span className="text-sm font-extrabold text-emerald-400 text-glow-emerald">
            {savingsGallons.toLocaleString()} gal/year
          </span>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default RecommendationCard;
