import { AlertTriangle } from 'lucide-react';

export default function AlertStrip({ count }) {
  if (count === 0) return null;
  return (
    <div className="bg-[#1A0B0E] border border-[#3A141A] rounded-lg p-3 mb-6 flex items-center justify-center space-x-3 shadow-[0_0_15px_-3px_rgba(199,54,69,0.2)]">
      <AlertTriangle className="w-5 h-5 text-status-red animate-pulse" />
      <span className="text-status-red font-semibold text-sm tracking-wide">
        {count} HIGH-RISK PATIENTS REQUIRE IMMEDIATE ATTENTION
      </span>
    </div>
  );
}
