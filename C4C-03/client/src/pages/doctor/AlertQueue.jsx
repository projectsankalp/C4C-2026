import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import PatientRow from '../../components/dashboard/PatientRow';
import { getAlerts } from '../../services/alertService';

export default function AlertQueue() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = filter !== 'all' ? { status: filter } : {};
    getAlerts(params)
      .then(r => setAlerts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl shadow-sm border border-rose-100">
                🚨
              </div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Alert Queue</h1>
            </div>
            
            {/* iOS-Style Segmented Filter */}
            <div className="flex bg-slate-100/80 p-1.5 rounded-[1.25rem] border border-slate-200/50 overflow-x-auto hide-scrollbar">
              {['pending', 'acknowledged', 'actioned', 'all'].map(s => (
                <button 
                  key={s} 
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-200 whitespace-nowrap active:scale-95 ${
                    filter === s 
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                // ================= SKELETON LOADER =================
                <div className="p-6 space-y-4">
                  <div className="flex gap-4 border-b border-slate-100 pb-4">
                    <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                  </div>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-4 py-2 animate-pulse">
                      <div className="w-10 h-10 bg-slate-200 rounded-full shrink-0"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/5"></div>
                      <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                      <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                      <div className="h-8 bg-slate-200 rounded-xl w-24 ml-auto"></div>
                    </div>
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                // ================= EMPTY STATE =================
                <div className="text-center py-20 px-4">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100 shadow-sm">
                    <span className="text-4xl">🎉</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-800 mb-1">
                    No {filter !== 'all' ? filter : ''} alerts found
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {filter === 'pending' 
                      ? "You're all caught up! Great job monitoring the queue." 
                      : "Adjust your filters to see more patient records."}
                  </p>
                </div>
              ) : (
                // ================= DATA TABLE =================
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase text-[11px] font-extrabold tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Patient</th>
                      <th className="py-4 px-6">Village</th>
                      <th className="py-4 px-6">Age</th>
                      <th className="py-4 px-6">BP</th>
                      <th className="py-4 px-6">Sugar</th>
                      <th className="py-4 px-6">Risk</th>
                      <th className="py-4 px-6">Time</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alerts.map(a => (
                      // PatientRow should ideally render a <tr> with <td> elements inside to match this table structure
                      <PatientRow key={a._id} alert={a} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}