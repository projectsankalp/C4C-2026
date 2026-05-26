import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StatusPill({ status }) {
  const normalized = status?.toUpperCase() || '';
  if (normalized === 'PENDING') {
    return (
      <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-surface-2 border border-border-primary">
        <AlertCircle className="w-3.5 h-3.5 text-text-muted" />
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">New</span>
      </div>
    );
  }
  if (normalized === 'FOLLOW_UP') {
    return (
      <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-status-yellow/10 border border-status-yellow/30">
        <Clock className="w-3.5 h-3.5 text-status-yellow" />
        <span className="text-[10px] font-bold text-status-yellow uppercase tracking-wider">Follow-Up</span>
      </div>
    );
  }
  if (normalized === 'RESOLVED') {
    return (
      <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-status-green/10 border border-status-green/30">
        <CheckCircle2 className="w-3.5 h-3.5 text-status-green" />
        <span className="text-[10px] font-bold text-status-green uppercase tracking-wider">Resolved</span>
      </div>
    );
  }
  return null;
}
