import { FileX } from 'lucide-react';

export default function EmptyState({ message, subMessage }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-1 border border-border-primary/50 rounded-2xl animate-in fade-in duration-300">
      <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center mb-4 border border-border-primary/50">
        <FileX className="w-5 h-5 text-text-muted" />
      </div>
      <h3 className="text-sm font-semibold text-text-main">{message || 'No operational records match current filters.'}</h3>
      <p className="text-[11px] font-medium text-text-muted mt-1.5 uppercase tracking-wider">{subMessage || 'Clear filters or wait for ASHA sync'}</p>
    </div>
  );
}
