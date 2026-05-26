import { Lock } from 'lucide-react';

interface JobCardProps {
  title: string;
  company: string;
  isUnlocked: boolean;
  onApply?: () => void;
}

export function JobCard({ title, company, isUnlocked, onApply }: JobCardProps) {
  return (
    <div
      className={`rounded-full bg-white/70 flex items-center justify-between p-4 mb-3 transition-all ${
        isUnlocked ? 'hover:bg-white/90 hover:shadow-md' : 'opacity-60'
      }`}
    >
      <div className="flex flex-col">
        <div className="text-slate-800">{title}</div>
        <div className="text-sm text-slate-500">{company}</div>
      </div>

      {isUnlocked ? (
        <button
          onClick={onApply}
          className="px-6 py-2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all"
        >
          Apply Now
        </button>
      ) : (
        <div className="p-3 bg-gray-200 rounded-full">
          <Lock size={20} className="text-gray-500" />
        </div>
      )}
    </div>
  );
}
