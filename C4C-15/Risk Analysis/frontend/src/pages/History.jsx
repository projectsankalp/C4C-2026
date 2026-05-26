import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  History as HistoryIcon, Trash2, ArrowUpRight, ShieldAlert, Award, Calendar, Heart 
} from 'lucide-react';

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load history from LocalStorage
    const savedHistory = JSON.parse(localStorage.getItem('health_history')) || [];
    setHistory(savedHistory);
    setLoading(false);
  }, []);

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to permanently clear all health assessment history?")) {
      localStorage.removeItem('health_history');
      setHistory([]);
    }
  };

  const handleViewDetails = (item) => {
    // Reload the prior prediction results into the results page view
    navigate('/results', { state: { prediction: item.results, inputs: item.inputs } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tealhealth-500" />
      </div>
    );
  }

  // Format Recharts data for history trend line chart
  const getTrendData = () => {
    // Recharts needs chronological order (oldest first) to plot left-to-right correctly
    return [...history].reverse().map((item) => ({
      date: new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      Diabetes: item.results.diabetes_probability,
      Hypertension: item.results.hypertension_probability,
      Overall: item.results.overall_probability,
    }));
  };

  const trendData = getTrendData();

  const getRiskColor = (risk) => {
    if (risk === 'Low') return 'text-emerald-500 bg-emerald-500/10 border-emerald-400/20';
    if (risk === 'Moderate') return 'text-amber-500 bg-amber-500/10 border-amber-400/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-400/20';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-200/50 dark:border-slate-850 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-tealhealth-600 dark:text-tealhealth-400 font-bold">
            <HistoryIcon className="h-5 w-5" />
            <span>Health Tracker History</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Patient Risk History Tracking
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track and visualize your diabetes and hypertension risk trends across multiple screening submissions.
          </p>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold py-2 px-3 border border-rose-500/20 hover:bg-rose-500/10 rounded-xl transition-all"
          >
            <Trash2 className="h-4 w-4" />
            <span>Wipe History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="max-w-xl mx-auto text-center py-16 px-4 space-y-6">
          <div className="bg-tealhealth-500/10 text-tealhealth-650 dark:text-tealhealth-400 p-6 rounded-3xl inline-block border border-tealhealth-500/20 animate-pulse">
            <HistoryIcon className="h-16 w-16 mx-auto" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">No Assessment Records Logged</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
              Your health history timeline will map your diagnostic probabilities as you complete risk assessments.
            </p>
          </div>
          <Link
            to="/assess"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-tealhealth-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-2xl shadow-md transition-all hover:scale-[1.02]"
          >
            <span>Begin Your First Screening</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* Trend Chart (Visible when history exists) */}
          <div className="glass-panel p-6 rounded-3xl border border-white/20 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Risk Timeline Trends</h2>
            </div>
            
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="Diabetes" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Hypertension" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Overall" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Submissions List */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Logged Screening Reports</h2>
            
            <div className="space-y-4">
              {history.map((item) => {
                const date = new Date(item.timestamp).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const overallColors = getRiskColor(item.results.overall_risk);

                return (
                  <div 
                    key={item.id} 
                    className="glass-panel p-5 rounded-2xl border border-white/20 shadow-sm flex flex-wrap items-center justify-between gap-4 hover:border-tealhealth-500/30 transition-all duration-300"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold py-0.5 px-2 border.5 rounded-full ${overallColors}`}>
                          {item.results.overall_risk} Risk
                        </span>
                        <span className="text-xs text-slate-400">{date} at {time}</span>
                      </div>
                      <h3 className="font-extrabold text-slate-700 dark:text-slate-200 text-sm">
                        Assessment for {item.patientName}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>Diabetes: <strong className="text-tealhealth-600 dark:text-tealhealth-400">{item.results.diabetes_probability}%</strong></span>
                        <span>Hypertension: <strong className="text-indigo-600 dark:text-indigo-400">{item.results.hypertension_probability}%</strong></span>
                        <span>BMI: <strong>{item.inputs.bmi}</strong></span>
                        <span>Age: <strong>{item.inputs.age}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewDetails(item)}
                      className="flex items-center gap-1 text-xs font-bold text-tealhealth-600 dark:text-tealhealth-400 hover:text-tealhealth-500 border border-tealhealth-500/20 bg-tealhealth-500/5 hover:bg-tealhealth-500/10 py-2.5 px-4 rounded-xl transition-all"
                    >
                      <span>View Details</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
