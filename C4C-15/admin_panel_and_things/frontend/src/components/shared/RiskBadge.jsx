export default function RiskBadge({ risk }) {
  if (risk === 'high' || risk === 'RED') {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-status-red/10 text-status-red border border-status-red/30 uppercase tracking-wider">High Risk</span>;
  }
  if (risk === 'medium' || risk === 'YELLOW') {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-status-yellow/10 text-status-yellow border border-status-yellow/30 uppercase tracking-wider">Medium</span>;
  }
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-status-green/10 text-status-green border border-status-green/30 uppercase tracking-wider">Low</span>;
}
