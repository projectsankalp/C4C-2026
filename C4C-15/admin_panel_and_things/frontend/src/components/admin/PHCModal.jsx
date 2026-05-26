import { X, Users, Activity } from 'lucide-react';

export default function PHCModal({ phc, onClose }) {
  if (!phc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-1 border border-border-primary/50 rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
        
        <div className="flex items-center justify-between p-5 border-b border-border-primary/50 bg-surface-2/30 rounded-t-2xl shrink-0">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-text-main">PHC Operational Summary</h2>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Read-Only District Oversight</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-main transition-colors duration-200 bg-surface-2 rounded-lg hover:bg-border-primary/50 border border-border-primary/50">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          <div className="flex items-center justify-between pb-6 border-b border-border-primary/30">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-text-main">{phc.name}</h3>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mt-1">{phc.district}</p>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-status-green/10 border border-status-green/30">
              <div className="w-2 h-2 rounded-full bg-status-green animate-pulse"></div>
              <span className="text-[10px] font-bold text-status-green uppercase tracking-widest">Active Node</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-2/30 border border-border-primary/50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Users className="w-3.5 h-3.5 text-text-muted" />
                <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Doctors</p>
              </div>
              <p className="text-xl font-bold text-text-main">{phc.doctors}</p>
            </div>
            
            <div className="bg-surface-2/30 border border-border-primary/50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Users className="w-3.5 h-3.5 text-text-muted" />
                <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted">ASHA Workers</p>
              </div>
              <p className="text-xl font-bold text-text-main">{phc.ashas}</p>
            </div>
          </div>
          
          <div className="bg-surface-2/10 p-4 rounded-xl border border-border-primary/50">
            <div className="flex items-center space-x-2 mb-4 border-b border-border-primary/30 pb-3">
              <Activity className="w-3.5 h-3.5 text-text-muted" />
              <h4 className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Load & Performance</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-text-muted">Total Screenings (YTD)</p>
                <p className="text-sm font-bold text-text-main">{phc.screenings.toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-text-muted">RED Case Burden</p>
                <p className="text-sm font-bold text-status-red">{phc.redBurden}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-text-muted">Villages Covered</p>
                <p className="text-sm font-bold text-text-main">{phc.villages}</p>
              </div>
            </div>
          </div>

        </div>

        <div className="p-5 border-t border-border-primary/50 bg-surface-2/30 flex justify-end shrink-0 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-text-main bg-surface-1 hover:bg-border-primary/50 border border-border-primary/50 transition-colors duration-200 rounded-lg shadow-sm">
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
}
