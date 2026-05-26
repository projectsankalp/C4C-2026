import { useNavigate } from 'react-router-dom';
import RiskBadge from './RiskBadge';
import { formatDate } from '../../utils/formatDate';

export default function PatientRow({ alert, basePath = '/doctor' }) {
  const navigate = useNavigate();
  const patient = alert?.patientId;
  const screening = alert?.screeningId;
  
  if (!patient) return null;

  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'acknowledged':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'actioned':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <tr
      className="hover:bg-blue-50/30 cursor-pointer transition-colors duration-150 group"
      onClick={() => navigate(`${basePath}/patients/${patient._id}`)}
    >
      {/* Patient Name & Avatar */}
      <td className="py-3.5 px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200 group-hover:bg-blue-100 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors">
            {patient.name?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="font-bold text-slate-800">{patient.name}</span>
        </div>
      </td>
      
      {/* Village */}
      <td className="py-3.5 px-6 text-slate-500 font-medium">
        {patient.village}
      </td>
      
      {/* Age */}
      <td className="py-3.5 px-6 text-slate-600 font-medium">
        {patient.age} <span className="text-xs text-slate-400">yrs</span>
      </td>
      
      {/* Blood Pressure */}
      <td className="py-3.5 px-6 font-bold text-slate-700">
        {screening?.vitals?.systolic || '—'}/{screening?.vitals?.diastolic || '—'}
      </td>
      
      {/* Blood Sugar */}
      <td className="py-3.5 px-6 font-bold text-slate-700">
        {screening?.vitals?.bloodSugar || '—'}
      </td>
      
      {/* Risk Level */}
      <td className="py-3.5 px-6">
        <RiskBadge level={alert.riskLevel} />
      </td>
      
      {/* Date */}
      <td className="py-3.5 px-6 text-slate-400 text-xs font-semibold">
        {formatDate(alert.createdAt)}
      </td>
      
      {/* Status Badge */}
      <td className="py-3.5 px-6">
        <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md border font-extrabold ${getStatusStyle(alert.status)}`}>
          {alert.status || 'Unknown'}
        </span>
      </td>
    </tr>
  );
}