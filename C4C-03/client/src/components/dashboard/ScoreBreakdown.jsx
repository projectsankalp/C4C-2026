export default function ScoreBreakdown({ result }) {
  if (!result) return null;
  
  const pct = Math.round((result.score / result.maxScore) * 100);

  // Unified color mapping for consistent UI across the app
  const getRiskStyles = (level) => {
    switch (level?.toUpperCase()) {
      case 'HIGH': 
        return { 
          text: 'text-rose-600', 
          bg: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]', 
          pill: 'bg-rose-50 text-rose-700 border-rose-200' 
        };
      case 'MEDIUM': 
        return { 
          text: 'text-amber-600', 
          bg: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]', 
          pill: 'bg-amber-50 text-amber-700 border-amber-200' 
        };
      case 'LOW': 
        return { 
          text: 'text-emerald-600', 
          bg: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]', 
          pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
        };
      default: 
        return { 
          text: 'text-slate-600', 
          bg: 'bg-slate-500', 
          pill: 'bg-slate-50 text-slate-700 border-slate-200' 
        };
    }
  };

  const styles = getRiskStyles(result.riskLevel);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Metric Container */}
      <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-100 shadow-sm">
        <div className="flex items-end justify-between mb-3">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            Calculated Score
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-black tracking-tight leading-none ${styles.text}`}>
              {result.score}
            </span>
            <span className="text-sm font-bold text-slate-400">
              / {result.maxScore}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200/60 rounded-full h-2.5 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${styles.bg}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Contributing Factors */}
      {result.flags?.length > 0 && (
        <div className="pt-1">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
            Contributing Factors
          </p>
          <div className="flex flex-wrap gap-2">
            {result.flags.map(flag => (
              <span 
                key={flag} 
                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border shadow-sm flex items-center gap-1.5 ${styles.pill}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
}