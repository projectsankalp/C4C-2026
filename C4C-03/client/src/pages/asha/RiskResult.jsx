import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import ScoreBreakdown from '../../components/dashboard/ScoreBreakdown';
import { useLanguage } from '../../context/LanguageContext';
import { riskEmoji } from '../../utils/riskColor';

export default function RiskResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Redirect if accessed directly without data
  if (!state) {
    navigate('/asha');
    return null;
  }

  const { result, patient, offline } = state;

  // =========================
  // OFFLINE STATE UI
  // =========================
  if (offline) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-800">
        <Navbar />
        <main className="max-w-2xl mx-auto p-4 md:p-6 mt-6">
          <div className="bg-white rounded-[2rem] p-8 text-center shadow-sm border border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-slate-100">
              <span className="text-5xl">📴</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Saved Offline</h2>
            <p className="text-slate-500 font-medium">
              Screening for <strong className="text-slate-800">{patient?.name}</strong> has been saved locally.
            </p>
            <div className="mt-4 mb-8 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              Will sync when online
            </div>
            
            <button 
              onClick={() => navigate('/asha')} 
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              ← Back to Home
            </button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // =========================
  // ONLINE RESULT UI
  // =========================
  const recs = result?.recommendations?.[language] || result?.recommendations?.en || [];
  
  // Dynamic styling based on Risk Level
  const getRiskStyles = (level) => {
    if (level === 'HIGH') return 'from-rose-500 to-red-600 shadow-red-500/30';
    if (level === 'MEDIUM') return 'from-amber-400 to-orange-500 shadow-orange-500/30 text-amber-950';
    return 'from-emerald-400 to-emerald-600 shadow-emerald-500/30';
  };

  const bgClass = getRiskStyles(result?.riskLevel);
  const isMedium = result?.riskLevel === 'MEDIUM';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-800">
      <Navbar />
      
      <main className="max-w-2xl mx-auto p-4 md:p-6 mt-2 space-y-5">
        
        {/* Risk Banner */}
        <div 
          className={`relative overflow-hidden bg-gradient-to-br ${bgClass} ${isMedium ? 'text-amber-950' : 'text-white'} rounded-[2rem] p-8 text-center shadow-xl`}
          style={{ boxShadow: `0 20px 40px -15px var(--tw-shadow-color)` }}
        >
          {/* Aesthetic background circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black opacity-10 rounded-full -ml-10 -mb-10 blur-xl"></div>
          
          <div className="relative z-10">
            <div className="text-6xl mb-3 drop-shadow-md">
              {riskEmoji(result?.riskLevel)}
            </div>
            <h1 className="text-4xl font-black tracking-tight drop-shadow-sm mb-1">
              {result?.riskLevel} RISK
            </h1>
            <p className={`font-medium ${isMedium ? 'text-amber-900/80' : 'text-white/80'}`}>
              Patient: <strong className={isMedium ? 'text-amber-950' : 'text-white'}>{patient?.name}</strong>
            </p>
            
            {result?.riskLevel === 'HIGH' && (
              <div className="mt-5 bg-white/20 backdrop-blur-md rounded-xl p-3 border border-white/30 inline-flex items-center gap-2">
                <span className="animate-pulse">🚨</span>
                <p className="font-bold text-sm">Alert sent to PHC Doctor</p>
              </div>
            )}
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="bg-white rounded-[1.5rem] p-5 md:p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
            📊 Score Breakdown
          </h3>
          <ScoreBreakdown result={result} />
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-[1.5rem] p-5 md:p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
            📋 What to do next
          </h3>
          <ul className="space-y-3">
            {recs.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold mt-0.5">
                  ✓
                </div>
                <span className="text-slate-700 text-sm font-medium leading-relaxed">
                  {rec}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button 
            onClick={() => navigate('/asha/new-screening')} 
            className="flex flex-col items-center justify-center gap-1 bg-gradient-to-b from-blue-500 to-blue-600 text-white p-4 rounded-[1.5rem] font-bold shadow-sm hover:shadow-md active:scale-95 transition-all"
          >
            <span className="text-2xl">➕</span>
            <span className="text-sm">New Screening</span>
          </button>
          
          <button 
            onClick={() => navigate('/asha/patients')} 
            className="flex flex-col items-center justify-center gap-1 bg-white border-2 border-slate-100 text-slate-700 p-4 rounded-[1.5rem] font-bold shadow-sm hover:border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <span className="text-2xl">👥</span>
            <span className="text-sm">My Patients</span>
          </button>
        </div>
        
        <button 
          onClick={() => navigate('/asha')} 
          className="w-full py-4 mt-2 bg-slate-200/50 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 active:scale-[0.98] transition-all"
        >
          ← Back to Dashboard
        </button>

      </main>
      <BottomNav />
    </div>
  );
}