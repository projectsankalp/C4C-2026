export default function StatCard({ label, value, icon, color = 'green', onClick, className = '' }) {
  
  // Premium color mappings matching the Tailwind palette used across the app
  const themes = {
    green: {
      card: 'border-emerald-100 hover:border-emerald-300 hover:shadow-emerald-500/10 hover:bg-emerald-50/40',
      icon: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    red: {
      card: 'border-rose-100 hover:border-rose-300 hover:shadow-rose-500/10 hover:bg-rose-50/40',
      icon: 'bg-rose-50 text-rose-600 border-rose-100',
    },
    yellow: {
      card: 'border-amber-100 hover:border-amber-300 hover:shadow-amber-500/10 hover:bg-amber-50/40',
      icon: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    orange: {
      card: 'border-orange-100 hover:border-orange-300 hover:shadow-orange-500/10 hover:bg-orange-50/40',
      icon: 'bg-orange-50 text-orange-600 border-orange-100',
    },
    blue: {
      card: 'border-blue-100 hover:border-blue-300 hover:shadow-blue-500/10 hover:bg-blue-50/40',
      icon: 'bg-blue-50 text-blue-600 border-blue-100',
    }
  };

  const theme = themes[color] || themes.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[1.5rem] p-5 border shadow-sm transition-all duration-300 group ${
        onClick ? 'cursor-pointer active:scale-[0.97]' : ''
      } ${theme.card} ${className}`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-1.5 overflow-hidden">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider truncate">
            {label}
          </p>
          <p className="text-3xl font-black text-slate-800 tracking-tight truncate">
            {value}
          </p>
        </div>
        
        {/* Squircle Icon Wrapper */}
        <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-2xl border shadow-sm transition-transform duration-300 ${
          onClick ? 'group-hover:scale-110 group-hover:rotate-3' : ''
        } ${theme.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}