"use client";

import React from 'react';
import { useUser } from '@/lib/userContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { RiskBadge } from '@/components/ui/RiskBadge';

export const AlertsPanel: React.FC = () => {
  const { result } = useUser();

  if (!result) return null;

  const hasWarnings = result.warningMessages && result.warningMessages.length > 0;

  return (
    <GlassCard className="space-y-4">
      <div className="flex justify-between items-center border-b border-white/10 pb-3">
        <h3 className="text-base font-bold text-white tracking-tight">Active Alerts</h3>
        <RiskBadge risk={result.riskLevel} />
      </div>

      <div className="space-y-3">
        {hasWarnings ? (
          result.warningMessages.map((warning, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex gap-3 text-xs leading-relaxed ${
                result.riskLevel === 'Critical'
                  ? 'bg-red-500/10 border-red-500/20 text-red-200'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
              }`}
            >
              {result.riskLevel === 'Critical' ? (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <span>{warning}</span>
            </div>
          ))
        ) : (
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 flex items-center gap-3 text-xs leading-relaxed">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>All indicators are within safe thresholds. Your water table has optimal natural replenishment.</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default AlertsPanel;
