import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import ReferralCard from '../../components/referral/ReferralCard';
import Modal from '../../components/shared/Modal';
import { getReferrals } from '../../services/referralService';
import { formatDate } from '../../utils/formatDate';

export default function ReferralManager() {
  const [referrals, setReferrals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReferrals()
      .then(r => setReferrals(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'admitted': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'received': 
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default: 
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full">
          
          {/* Header Section */}
          <div className="flex items-center gap-3 mb-6 md:mb-8 animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shadow-sm border border-indigo-100">
              📋
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Referrals Sent</h1>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
            {loading ? (
              // ================= SKELETON LOADER =================
              <div className="p-6 space-y-4 w-full">
                <div className="flex gap-4 border-b border-slate-100 pb-4">
                  <div className="h-4 bg-slate-100 rounded w-1/5"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/5"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                </div>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-4 py-3 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/5"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/5"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                    <div className="h-6 bg-slate-200 rounded-lg w-16"></div>
                    <div className="h-8 bg-slate-200 rounded-xl w-20 ml-auto"></div>
                  </div>
                ))}
              </div>
            ) : referrals.length === 0 ? (
              // ================= EMPTY STATE =================
              <div className="flex flex-col items-center justify-center h-full py-24 px-4 text-center animate-in fade-in duration-300">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-4 shadow-sm">
                  <span className="text-4xl opacity-80">📭</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-800">No Referrals Sent</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">You haven't referred any patients to a hospital or CHC yet.</p>
              </div>
            ) : (
              // ================= DATA TABLE =================
              <div className="overflow-x-auto animate-in fade-in duration-500">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-sm">
                    {referrals.length} {referrals.length === 1 ? 'Referral' : 'Referrals'} Total
                  </span>
                </div>
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase text-[11px] font-extrabold tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Patient</th>
                      <th className="py-4 px-6">Village</th>
                      <th className="py-4 px-6">Referred To</th>
                      <th className="py-4 px-6">Date Sent</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {referrals.map(r => (
                      <tr key={r._id} className="hover:bg-blue-50/30 transition-colors duration-150">
                        <td className="py-3.5 px-6 font-bold text-slate-800">{r.patientId?.name}</td>
                        <td className="py-3.5 px-6 text-slate-500 font-medium">{r.patientId?.village}</td>
                        <td className="py-3.5 px-6 text-slate-700 font-semibold">{r.referredToName}</td>
                        <td className="py-3.5 px-6 text-slate-400 text-xs font-semibold">{formatDate(r.createdAt)}</td>
                        <td className="py-3.5 px-6">
                          <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md border font-extrabold ${getStatusStyle(r.status)}`}>
                            {r.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <button 
                            onClick={() => setSelected(r)} 
                            className="text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 hover:text-blue-700 px-4 py-2 rounded-xl transition-all active:scale-95 text-xs border border-blue-100 shadow-sm"
                          >
                            View Card
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <Modal 
        open={!!selected} 
        onClose={() => setSelected(null)} 
        title={
          <div className="flex items-center gap-2 text-slate-800">
            <span>📋</span>
            <span>Referral Card</span>
          </div>
        }
      >
        {selected && <ReferralCard referral={selected} />}
      </Modal>
    </div>
  );
}