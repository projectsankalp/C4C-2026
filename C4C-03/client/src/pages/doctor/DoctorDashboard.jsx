import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import StatCard from '../../components/dashboard/StatCard';
import RiskBadge from '../../components/dashboard/RiskBadge';
import RiskPieChart from '../../components/charts/RiskPieChart';
import WeeklyLineChart from '../../components/charts/WeeklyLineChart';
import VillageBarChart from '../../components/charts/VillageBarChart';
import { getStats, getWeeklyTrend, getVillageSummary } from '../../services/screeningService';
import { getAlerts } from '../../services/alertService';
import { formatDateTime } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getStats(), 
      getAlerts({ status: 'pending' }), 
      getWeeklyTrend(), 
      getVillageSummary()
    ])
      .then(([s, a, w, v]) => {
        setStats(s.data); 
        setAlerts(a.data.slice(0, 5)); 
        setWeekly(w.data); 
        setVillages(v.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-6 md:space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-in fade-in duration-300">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-1">
                Welcome, Dr. {user?.name?.split(' ')[0] || user?.name}
              </h1>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <span>🏥 PHC Dashboard</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </p>
            </div>
          </div>

          {loading ? (
            // ================= SKELETON LOADER =================
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white border border-slate-100 rounded-[1.5rem] animate-pulse"></div>)}
              </div>
              <div className="h-64 bg-white border border-slate-100 rounded-[1.5rem] animate-pulse"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-72 bg-white border border-slate-100 rounded-[1.5rem] animate-pulse"></div>)}
              </div>
            </div>
          ) : (
            // ================= LOADED CONTENT =================
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                <StatCard label="Screened Today" value={stats?.todayCount ?? '—'} icon="📋" color="blue" />
                <StatCard 
                  label="Critical Alerts" 
                  value={stats?.pendingAlerts ?? '—'} 
                  icon="🚨" 
                  color="red" 
                  onClick={() => navigate('/doctor/alerts')} 
                  className="cursor-pointer hover:shadow-md transition-shadow ring-2 ring-transparent hover:ring-rose-200"
                />
                <StatCard label="Follow-ups Due" value={stats?.pendingFollowups ?? '—'} icon="⏰" color="yellow" />
                <StatCard label="Total High Risk" value={stats?.highRisk ?? '—'} icon="⚠️" color="orange" />
              </div>

              {/* Alert Queue (Top 5) */}
              {alerts.length > 0 && (
                <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-sm shadow-sm border border-rose-100">🚨</div>
                      <h2 className="font-extrabold text-slate-800 text-lg">
                        Immediate Attention Required
                      </h2>
                      <span className="bg-rose-500 text-white text-xs font-bold rounded-full px-2.5 py-0.5 shadow-sm">
                        {alerts.length} Pending
                      </span>
                    </div>
                    <button 
                      onClick={() => navigate('/doctor/alerts')} 
                      className="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
                    >
                      View Queue →
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase text-[11px] font-extrabold tracking-wider">
                        <tr>
                          <th className="py-3.5 px-6">Patient</th>
                          <th className="py-3.5 px-6">Village</th>
                          <th className="py-3.5 px-6">Age</th>
                          <th className="py-3.5 px-6">BP (mmHg)</th>
                          <th className="py-3.5 px-6">Sugar</th>
                          <th className="py-3.5 px-6">Reported</th>
                          <th className="py-3.5 px-6">Risk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {alerts.map(a => (
                          <tr 
                            key={a._id} 
                            className="hover:bg-rose-50/40 cursor-pointer transition-colors duration-150 group" 
                            onClick={() => navigate(`/doctor/patients/${a.patientId?._id}`)}
                          >
                            <td className="py-3.5 px-6 font-bold text-slate-800">{a.patientId?.name}</td>
                            <td className="py-3.5 px-6 text-slate-500 font-medium">{a.patientId?.village}</td>
                            <td className="py-3.5 px-6 text-slate-600 font-medium">{a.patientId?.age} yrs</td>
                            <td className="py-3.5 px-6">
                              <span className="text-rose-700 font-bold bg-rose-100/60 px-2.5 py-1 rounded-lg border border-rose-100">
                                {a.screeningId?.vitals?.systolic}/{a.screeningId?.vitals?.diastolic}
                              </span>
                            </td>
                            <td className="py-3.5 px-6">
                              <span className="text-rose-700 font-bold bg-rose-100/60 px-2.5 py-1 rounded-lg border border-rose-100">
                                {a.screeningId?.vitals?.bloodSugar}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-slate-400 text-xs font-semibold">
                              {formatDateTime(a.createdAt)}
                            </td>
                            <td className="py-3.5 px-6">
                              <RiskBadge level="HIGH" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
                <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 p-5 md:p-6">
                  <RiskPieChart data={stats} />
                </div>
                <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 p-5 md:p-6 lg:col-span-1">
                  <WeeklyLineChart data={weekly} />
                </div>
                <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 p-5 md:p-6 lg:col-span-1">
                  <VillageBarChart data={villages} />
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}