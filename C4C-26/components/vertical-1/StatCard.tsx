"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  change?: number; // e.g. 12 or -4
  changeType?: 'positive' | 'negative' | 'neutral'; // determines color
  icon?: React.ReactNode;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  change,
  changeType = 'neutral',
  icon,
  delay = 0,
}) => {
  // Style config for change indicators
  const changeStyles = {
    positive: {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
      Icon: TrendingUp
    },
    negative: {
      text: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-100',
      Icon: TrendingDown
    },
    neutral: {
      text: 'text-slate-500',
      bg: 'bg-slate-50 border-slate-100',
      Icon: Minus
    }
  };

  const style = changeStyles[changeType];
  const ChangeIcon = style.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white/60 backdrop-blur-2xl border border-white/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {title}
          </span>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
            {value}
          </h3>
        </div>

        {icon && (
          <div className="p-2.5 rounded-xl bg-cyan-50/60 text-cyan-600 border border-cyan-100/30">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100/60 pt-3">
        <span className="text-[10px] font-semibold text-slate-400">
          {subtext}
        </span>

        {change !== undefined && (
          <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${style.bg} ${style.text}`}>
            <ChangeIcon className="w-3 h-3" />
            <span>{change > 0 ? `+${change}` : change}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
