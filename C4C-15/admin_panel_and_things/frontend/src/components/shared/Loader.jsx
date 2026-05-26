import { Activity } from 'lucide-react';

export default function Loader({ message }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px] animate-in fade-in duration-300">
      <Activity className="w-8 h-8 text-accent-primary animate-pulse mb-4" />
      <h3 className="text-sm font-semibold text-text-main uppercase tracking-wider">{message || 'Loading Operational Data...'}</h3>
      <p className="text-xs text-text-muted mt-2 font-medium">Synchronizing with PHC network records</p>
    </div>
  );
}
