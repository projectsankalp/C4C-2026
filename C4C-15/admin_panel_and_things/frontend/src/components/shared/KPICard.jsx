export default function KPICard({ title, value, isDanger }) {
  return (
    <div className={`bg-surface-1 border rounded-xl p-4 flex flex-col justify-between transition-colors hover:bg-surface-2/30 ${
      isDanger ? 'border-status-red/50 shadow-[0_4px_20px_-4px_rgba(199,54,69,0.1)]' : 'border-border-primary/50 shadow-sm'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{title}</h3>
      </div>
      <div className="flex items-end justify-between mt-1">
        <p className={`text-2xl font-bold tracking-tight leading-none ${isDanger ? 'text-status-red' : 'text-text-main'}`}>
          {value}
        </p>
        <div className="text-[10px] font-semibold text-text-muted/70 ml-2 pb-0.5">
          Live Data
        </div>
      </div>
    </div>
  );
}
