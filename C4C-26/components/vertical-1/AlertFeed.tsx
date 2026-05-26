"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { environmentalAlerts } from '@/lib/mockDataV1';
import * as LucideIcons from 'lucide-react';

export const AlertFeed: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'all') return environmentalAlerts;
    return environmentalAlerts.filter(alert => alert.severity === activeFilter);
  }, [activeFilter]);

  // Color theme helpers
  const severityStyles = {
    critical: {
      border: 'border-l-rose-500',
      badge: 'bg-rose-50 text-rose-700 border-rose-200/60',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      glow: 'shadow-rose-100/50'
    },
    warning: {
      border: 'border-l-amber-500',
      badge: 'bg-amber-50 text-amber-700 border-amber-200/60',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      glow: 'shadow-amber-100/50'
    },
    info: {
      border: 'border-l-cyan-500',
      badge: 'bg-cyan-50 text-cyan-700 border-cyan-200/60',
      iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-100',
      glow: 'shadow-cyan-100/50'
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <div className="bg-white/60 backdrop-blur-2xl border border-white/50 rounded-2xl p-6 shadow-xl flex flex-col h-full max-h-[580px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <LucideIcons.BellRing className="w-5 h-5 text-cyan-500 animate-pulse" />
            Environmental Alerts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time geological water anomalies</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/50 overflow-x-auto self-start sm:self-auto">
          {(['all', 'critical', 'warning', 'info'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200/30'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Feed Container */}
      <div className="flex-1 overflow-y-auto pr-1.5 space-y-3 custom-scrollbar">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map(alert => {
                const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[alert.icon] || LucideIcons.AlertTriangle;
                const theme = severityStyles[alert.severity];

                return (
                  <motion.div
                    key={alert.id}
                    variants={itemVariants}
                    layout
                    exit="exit"
                    className={`bg-white/90 backdrop-blur-md rounded-xl p-4 border border-slate-100 border-l-4 ${theme.border} shadow-sm hover:shadow-md transition-all flex gap-3.5`}
                  >
                    <div className={`p-2 rounded-xl h-fit border shrink-0 ${theme.iconBg} ${theme.glow}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${theme.badge}`}>
                          {alert.severity}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {alert.timestamp}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-800 leading-tight mb-1">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">
                        {alert.description}
                      </p>

                      <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                        <LucideIcons.MapPin className="w-3.5 h-3.5 text-slate-300" />
                        {alert.region}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                variants={itemVariants}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="p-4 rounded-full bg-slate-50 border border-slate-100 text-slate-300 mb-3">
                  <LucideIcons.Inbox className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-500">No alerts found</p>
                <p className="text-xs text-slate-400 max-w-[200px] mt-1">There are no anomalies reported matching this severity index.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AlertFeed;
