import { X, ShieldCheck, MapPin, Activity } from 'lucide-react';
import { renderSafe } from '../../utils/renderSafe';

export default function UserModal({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-1 border border-border-primary/50 rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
        
        <div className="flex items-center justify-between p-5 border-b border-border-primary/50 bg-surface-2/30 rounded-t-2xl shrink-0">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-text-main">Personnel Record</h2>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Read-Only District Oversight</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-main transition-colors duration-200 bg-surface-2 rounded-lg hover:bg-border-primary/50 border border-border-primary/50">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          <div className="flex items-center space-x-4 pb-6 border-b border-border-primary/30">
            <div className="w-12 h-12 rounded-full bg-surface-2 border border-border-primary/50 flex items-center justify-center text-text-main font-bold text-lg uppercase shadow-sm">
              {user.name.substring(0, 2)}
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-text-main">{user.name}</h3>
              <p className="text-xs font-bold text-accent-primary uppercase tracking-wider">{user.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-2/30 border border-border-primary/50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="w-3.5 h-3.5 text-text-muted" />
                <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Assigned PHC</p>
              </div>
              <p className="text-sm font-bold text-text-main">{user.phc}</p>
            </div>
            
            <div className="bg-surface-2/30 border border-border-primary/50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-text-muted" />
                <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Network Status</p>
              </div>
              <p className={`text-sm font-bold ${user.status === 'Active' ? 'text-status-green' : 'text-text-muted'}`}>{user.status}</p>
            </div>

            <div className="bg-surface-2/30 border border-border-primary/50 rounded-xl p-4 col-span-2 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">Village Coverage</p>
                <p className="text-sm font-bold text-text-main">{user.village}</p>
              </div>
              <div className="text-right border-l border-border-primary/30 pl-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">Screenings</p>
                <p className="text-sm font-bold text-text-main">{renderSafe(user?.screeningsCount, 'N/A')}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-2/10 p-4 rounded-xl border border-border-primary/50">
            <div className="flex items-center space-x-2 mb-3 border-b border-border-primary/30 pb-2">
              <Activity className="w-3.5 h-3.5 text-text-muted" />
              <h4 className="text-[10px] uppercase tracking-wider font-bold text-text-muted">System Activity</h4>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold text-text-muted">Last Device Sync</p>
              <p className="text-xs font-bold text-text-main">{user.lastActive || 'Unknown'}</p>
            </div>
          </div>

        </div>

        <div className="p-5 border-t border-border-primary/50 bg-surface-2/30 flex justify-end shrink-0 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-text-main bg-surface-1 hover:bg-border-primary/50 border border-border-primary/50 transition-colors duration-200 rounded-lg shadow-sm">
            Close Record
          </button>
        </div>
      </div>
    </div>
  );
}
