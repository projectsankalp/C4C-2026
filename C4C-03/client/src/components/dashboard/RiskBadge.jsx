export default function RiskBadge({ level, size = 'sm' }) {
  const normalizedLevel = level?.toUpperCase() || 'UNKNOWN';

  // Map to handle the specific Tailwind colors for each risk tier
  const getStatusStyles = (status) => {
    switch (status) {
      case 'LOW':
        return {
          colors: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-500/10',
          emoji: '🟢'
        };
      case 'MEDIUM':
        return {
          colors: 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-500/10',
          emoji: '🟡'
        };
      case 'HIGH':
        return {
          colors: 'bg-rose-50 text-rose-700 border-rose-200 shadow-rose-500/10',
          emoji: '🔴'
        };
      default:
        return {
          colors: 'bg-slate-50 text-slate-500 border-slate-200 shadow-slate-500/10',
          emoji: '⚪'
        };
    }
  };

  const { colors, emoji } = getStatusStyles(normalizedLevel);
  
  // Size variations
  const sizeClasses = size === 'lg' 
    ? 'text-[13px] px-3.5 py-1.5 gap-2' 
    : 'text-[10px] px-2.5 py-1 gap-1.5';

  return (
    <span 
      className={`inline-flex items-center rounded-full font-extrabold uppercase tracking-wider border shadow-sm ${sizeClasses} ${colors}`}
      style={{ WebkitFontSmoothing: 'antialiased' }}
    >
      <span className="leading-none select-none">{emoji}</span>
      <span>{normalizedLevel}</span>
    </span>
  );
}