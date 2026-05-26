import RiskBadge from '../shared/RiskBadge';
import StatusPill from '../shared/StatusPill';
import { renderSafe } from '../../utils/renderSafe';
import { Eye, Clock, CheckCircle2 } from 'lucide-react';
import EmptyState from '../shared/EmptyState';

export default function PatientTable({ patients, onView, onFollowUp, onResolve }) {
  if (!patients || patients.length === 0) {
    return <EmptyState message="No patients match the current operational filters." />;
  }

  return (
    <div className="bg-surface-1 border border-border-primary/50 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-surface-2 z-10 border-b border-border-primary/50">
            <tr>
              <th className="px-5 py-3 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Patient Details</th>
              <th className="px-5 py-3 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Location</th>
              <th className="px-5 py-3 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Survey Snapshot</th>
              <th className="px-5 py-3 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Risk Level</th>
              <th className="px-5 py-3 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Field Operative</th>
              <th className="px-5 py-3 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 font-semibold text-text-muted text-[10px] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary/30">
            {patients.map((p) => (
              <tr key={p.id} className="hover:bg-surface-2/50 transition-colors duration-200 group">
                <td className="px-5 py-3">
                  <div className="font-semibold text-text-main text-sm">{renderSafe(p?.name)}</div>
                  <div className="text-[11px] font-medium text-text-muted mt-0.5">{renderSafe(p?.gender)} &bull; {renderSafe(p?.age)}y</div>
                </td>
                <td className="px-5 py-3 text-text-main font-medium text-sm">{renderSafe(p?.village)}</td>
                <td className="px-5 py-3">
                  <div className="text-text-main text-xs">BMI: <span className="font-semibold tracking-tight">{renderSafe(p?.bp)}</span></div>
                  <div className="text-[11px] text-text-muted mt-0.5">Overall: <span className="font-semibold text-text-main tracking-tight">{renderSafe(p?.sugar)}</span></div>
                </td>
                <td className="px-5 py-3">
                  <RiskBadge risk={p?.riskLevel || 'ALL'} />
                </td>
                <td className="px-5 py-3 text-text-main text-sm font-medium">{renderSafe(p?.ashaName)}</td>
                <td className="px-5 py-3">
                  <StatusPill status={p?.status || 'PENDING'} />
                </td>
                <td className="px-5 py-3 text-right space-x-2">
                  <button onClick={() => onView(p)} className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-surface-2 hover:bg-border-primary border border-border-primary/50 text-text-main text-xs font-semibold rounded-md transition-colors duration-200">
                    <Eye className="w-3.5 h-3.5 text-text-muted" />
                    <span>View</span>
                  </button>
                  {onFollowUp && p.status !== 'FOLLOW_UP' && p.status !== 'RESOLVED' && (
                    <button onClick={() => onFollowUp(p.id)} className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-surface-2 hover:bg-border-primary border border-border-primary/50 text-text-main text-xs font-semibold rounded-md transition-colors duration-200">
                      <Clock className="w-3.5 h-3.5 text-text-muted" />
                      <span>Follow-Up</span>
                    </button>
                  )}
                  {onResolve && p.status !== 'RESOLVED' && (
                    <button onClick={() => onResolve(p.id)} className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-surface-2 hover:bg-border-primary border border-border-primary/50 text-text-main text-xs font-semibold rounded-md transition-colors duration-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-status-green" />
                      <span>Resolve</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
