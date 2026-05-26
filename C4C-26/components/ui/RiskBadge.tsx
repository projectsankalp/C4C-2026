"use client";

import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface RiskBadgeProps {
  risk: 'Low' | 'Medium' | 'Critical';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk }) => {
  let color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  let icon = <ShieldCheck className="w-4 h-4 mr-1.5" />;
  let label = 'Low Risk';

  if (risk === 'Medium') {
    color = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    icon = <AlertTriangle className="w-4 h-4 mr-1.5" />;
    label = 'Medium Risk';
  } else if (risk === 'Critical') {
    color = 'bg-red-500/10 text-red-400 border-red-500/20';
    icon = <ShieldAlert className="w-4 h-4 mr-1.5" />;
    label = 'Critical Risk';
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
      {icon}
      {label}
    </span>
  );
};

export default RiskBadge;
