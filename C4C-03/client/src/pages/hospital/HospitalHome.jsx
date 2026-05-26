import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import { getReferrals, updateReferral } from '../../services/referralService';
import { formatDateTime } from '../../utils/formatDate';

export default function HospitalHome() {
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReferrals()
      .then(r => setReferrals(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const ack = async (id, status) => {
    try {
      await updateReferral(id, { status });
      setReferrals(prev =>
        prev.map(r => (r._id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const pending  = referrals.filter(r => r.status === 'sent');
  
  // Blood sugar extraction logic
  const getBloodSugar = (r) => {
    const s = r.screeningId;
    if (!s) return null;
    return s.phcTest?.bloodGlucose ?? s.vitals?.bloodSugar ?? null;
  };

  const getGlucoseLabel = (r) => {
    const val = getBloodSugar(r);
    if (!val) return '—';
    return `${val} mg/dL`;
  };

  const getGlucoseResult = (r) => r.screeningId?.phcTest?.glucoseResult ?? null;

  const isHighGlucose = (r) => {
    const result = getGlucoseResult(r);
    if (result === 'diabetic') return true;
    const val = getBloodSugar(r);
    return val !== null && val >= 200;
  };

  const isPreDiabeticGlucose = (r) => {
    const result = getGlucoseResult(r);
    if (result === 'prediabetic') return true;
    const val = getBloodSugar(r);
    return val !== null && val >= 140 && val < 200;
  };

  // UI Helpers
  const getStatusDropdownStyle = (status) => {
    switch(status) {
      case 'sent': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'received': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'admitted': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-6 md:space-y-8">

          {/* Header Section */}
          <div className="flex items-center gap-3 animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shadow-sm border border-indigo-100">
              🏥
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Incoming Referrals</h1>
              <p className="text-slate-500 text-sm font-medium mt-0.5">
                {pending.length} new {pending.length === 1 ? 'referral' : 'referrals'} awaiting acknowledgement
              </p>
            </div>
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {[
              { label: 'Total Referrals', value: referrals.length, icon: '📋', color: 'blue' },
              { label: 'Pending Ack', value: pending.length, icon: '🔔', color: 'rose' },
              { label: 'Diabetic Glucose', value: referrals.filter(r => getGlucoseResult(r) === 'diabetic').length, icon: '🔴', color: 'amber' },
              { label: 'Needs Classification', value: referrals.filter(r => isHighGlucose(r)).length, icon: '🔬', color: 'purple' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xl">{c.icon}</span>
                  <span className={`text-2xl font-black tracking-tight text-${c.color}-600`}>{c.value}</span>
                </div>
                <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider leading-snug">
                  {c.label}
                </p>
              </div>
            ))}
          </div>

          {/* Urgent Alert Queue: New Referrals */}
          {pending.length > 0 && (
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-rose-100 overflow-hidden animate-in fade-in duration-500">
              <div className="bg-rose-50/80 px-5 py-4 border-b border-rose-100 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <h2 className="font-extrabold text-rose-800 tracking-wide uppercase text-xs">
                  Requires Immediate Action ({pending.length})
                </h2>
              </div>
              <div className="divide-y divide-rose-50 p-2">
                {pending.map(r => (
                  <div key={r._id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 hover:bg-rose-50/50 rounded-xl transition-colors gap-4">
                    
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-slate-800 text-base">
                          {r.patientId?.name} 
                          <span className="text-slate-400 font-bold ml-1 text-sm">
                            • {r.patientId?.age}y {r.patientId?.gender}
                          </span>
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                        <span>📍 {r.patientId?.village}</span>
                        <span>🕒 {formatDateTime(r.createdAt)}</span>
                        <span>👨‍⚕️ Ref: Dr. {r.referredBy?.name}</span>
                        <span className="text-slate-700">📝 Reason: {r.reason}</span>
                      </div>

                      <div className="flex items-center flex-wrap gap-2 pt-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Vitals:</span>
                        <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md border ${
                          isHighGlucose(r) ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          Sugar: {getGlucoseLabel(r)}
                        </span>
                        
                        {getGlucoseResult(r) && (
                          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-extrabold border ${
                            getGlucoseResult(r) === 'diabetic' ? 'bg-rose-100 text-rose-700 border-rose-200'
                            : getGlucoseResult(r) === 'prediabetic' ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}>
                            {getGlucoseResult(r)}
                          </span>
                        )}
                        
                        {isHighGlucose(r) && (
                          <span className="text-[10px] uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md font-extrabold flex items-center gap-1">
                            <span>🔬</span> Needs Classifying
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                      <button
                        onClick={() => navigate(`/hospital/referrals/${r._id}`)}
                        className="flex-1 md:flex-none text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 text-center"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => ack(r._id, 'received')}
                        className="flex-1 md:flex-none text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 text-center"
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Master Referrals Table */}
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-extrabold text-slate-800">Master Referral Directory</h2>
              <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-sm">
                {referrals.length} Total
              </span>
            </div>

            {loading ? (
              // SKELETON LOADER
              <div className="p-6 space-y-4 w-full">
                <div className="flex gap-4 border-b border-slate-100 pb-4">
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                </div>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-4 py-3 animate-pulse">
                    <div className="w-8 h-8 bg-slate-200 rounded-full shrink-0"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/5"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                    <div className="h-6 bg-slate-200 rounded-lg w-20"></div>
                    <div className="h-8 bg-slate-200 rounded-xl w-24 ml-auto"></div>
                  </div>
                ))}
              </div>
            ) : referrals.length === 0 ? (
              // EMPTY STATE
              <div className="flex flex-col items-center justify-center h-full py-24 px-4 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-4 shadow-sm">
                  <span className="text-4xl opacity-80">📭</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-800">No Referrals Found</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">There are no incoming hospital referrals at this time.</p>
              </div>
            ) : (
              // DATA TABLE
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase text-[10px] font-extrabold tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Patient</th>
                      <th className="py-4 px-6">Location & Contact</th>
                      <th className="py-4 px-6">BP (mmHg)</th>
                      <th className="py-4 px-6">Blood Sugar</th>
                      <th className="py-4 px-6">Referred By</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {referrals.map(r => {
                      const glucoseResult = getGlucoseResult(r);
                      const highGlucose = isHighGlucose(r);
                      const preDiabetic = isPreDiabeticGlucose(r);

                      return (
                        <tr key={r._id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                          
                          {/* Patient Col */}
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                                {r.patientId?.name?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-800">{r.patientId?.name}</p>
                                <p className="text-xs font-medium text-slate-400">{r.patientId?.age}y {r.patientId?.gender}</p>
                              </div>
                            </div>
                          </td>

                          {/* Location Col */}
                          <td className="py-3 px-6">
                            <p className="font-semibold text-slate-600">{r.patientId?.village}</p>
                            <p className="text-xs text-slate-400">{r.patientId?.phone || 'No phone'}</p>
                          </td>

                          {/* BP Col */}
                          <td className="py-3 px-6 font-bold text-slate-700">
                            {r.screeningId?.vitals?.systolic
                              ? `${r.screeningId.vitals.systolic}/${r.screeningId.vitals.diastolic}`
                              : '—'}
                          </td>

                          {/* Blood Sugar Col */}
                          <td className="py-3 px-6">
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`font-extrabold text-sm ${highGlucose ? 'text-rose-600' : preDiabetic ? 'text-amber-600' : 'text-slate-700'}`}>
                                {getGlucoseLabel(r)}
                              </span>
                              {glucoseResult && (
                                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border font-extrabold ${
                                  glucoseResult === 'diabetic' ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : glucoseResult === 'prediabetic' ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}>
                                  {glucoseResult}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Ref By Col */}
                          <td className="py-3 px-6 font-semibold text-slate-700">
                            Dr. {r.referredBy?.name}
                          </td>

                          {/* Date Col */}
                          <td className="py-3 px-6 text-slate-400 text-xs font-semibold">
                            {formatDateTime(r.createdAt)}
                          </td>

                          {/* Status Col (Dropdown) */}
                          <td className="py-3 px-6">
                            <div className="relative w-28">
                              <select
                                value={r.status}
                                onChange={e => ack(r._id, e.target.value)}
                                className={`w-full appearance-none text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-lg border shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors ${getStatusDropdownStyle(r.status)}`}
                              >
                                <option value="sent">Sent</option>
                                <option value="received">Received</option>
                                <option value="admitted">Admitted</option>
                              </select>
                              {/* Custom Chevron */}
                              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none opacity-50">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                              </div>
                            </div>
                          </td>

                          {/* Actions Col */}
                          <td className="py-3 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {highGlucose && (
                                <button
                                  onClick={() => navigate(`/hospital/referrals/${r._id}`)}
                                  className="text-[10px] uppercase tracking-wider bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1.5 rounded-lg font-extrabold transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                                >
                                  <span>🔬</span> Classify
                                </button>
                              )}
                              <button
                                onClick={() => navigate(`/hospital/referrals/${r._id}`)}
                                className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 px-3 py-1.5 rounded-lg transition-colors border border-blue-100 shadow-sm active:scale-95"
                              >
                                View 
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}