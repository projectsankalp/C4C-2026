import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import RiskBadge from '../../components/dashboard/RiskBadge';
import { getPatient } from '../../services/patientService';
import { getScreenings } from '../../services/screeningService';
import { formatDateTime } from '../../utils/formatDate';

export default function PatientHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPatient(id), getScreenings({ patientId: id })])
      .then(([p, s]) => { 
        setPatient(p.data); 
        // Sort screenings by newest first
        const sortedScreenings = s.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setScreenings(sortedScreenings); 
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-800">
      <Navbar />
      
      <main className="max-w-2xl mx-auto p-4 md:p-6 mt-2 space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 active:scale-95 transition-all shadow-sm shrink-0"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Patient Profile</h1>
        </div>

        {loading ? (
          // ================= SKELETON LOADER =================
          <div className="space-y-6">
            {/* Profile Skeleton */}
            <div className="animate-pulse bg-white rounded-[1.5rem] p-5 border border-slate-100 flex gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-full shrink-0"></div>
              <div className="space-y-3 flex-1 py-1">
                <div className="h-5 bg-slate-200 rounded w-1/2"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-slate-100 rounded w-12"></div>
                  <div className="h-6 bg-slate-100 rounded w-16"></div>
                  <div className="h-6 bg-slate-100 rounded w-20"></div>
                </div>
              </div>
            </div>
            
            {/* History Skeletons */}
            <div className="space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-2"></div>
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-[1.5rem] p-5 border border-slate-100 space-y-4">
                  <div className="flex justify-between">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-6 bg-slate-200 rounded w-20"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-16 bg-slate-100 rounded-xl"></div>
                    <div className="h-16 bg-slate-100 rounded-xl"></div>
                    <div className="h-16 bg-slate-100 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !patient ? (
          // ================= ERROR STATE =================
          <div className="text-center py-16 px-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-6">
            <span className="text-4xl">⚠️</span>
            <h3 className="text-lg font-bold text-slate-800 mt-4">Patient Not Found</h3>
            <p className="text-sm text-slate-500 mt-1">This record may have been deleted or is currently unavailable.</p>
          </div>
        ) : (
          // ================= LOADED CONTENT =================
          <>
            {/* 1. Patient Profile Card */}
            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-5">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-2xl md:text-3xl border border-blue-200 shadow-inner shrink-0">
                  {patient.name[0]?.toUpperCase()}
                </div>
                
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 mb-2">{patient.name}</h2>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold border border-slate-200/60">
                      {patient.age} yrs
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold border border-slate-200/60">
                      {patient.gender}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold border border-slate-200/60 flex items-center gap-1">
                      📍 {patient.village}
                    </span>
                  </div>

                  {patient.phone && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <span className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">📞</span>
                      {patient.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Screening History List */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-extrabold text-lg text-slate-800">Screening History</h3>
                <span className="text-sm font-bold text-slate-500 bg-slate-200/50 px-3 py-1 rounded-full">
                  {screenings.length} Total
                </span>
              </div>

              {screenings.length === 0 ? (
                // Empty State for History
                <div className="text-center py-12 px-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm border-dashed">
                  <span className="text-4xl opacity-50">📋</span>
                  <h3 className="text-base font-bold text-slate-700 mt-3">No Screenings Yet</h3>
                  <p className="text-sm text-slate-500 mt-1">Start a new screening to see the history here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {screenings.map((s, index) => (
                    <div 
                      key={s._id} 
                      className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                          <span className="text-base">📅</span>
                          {formatDateTime(s.createdAt)}
                          {index === 0 && (
                            <span className="ml-2 text-[10px] uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">Latest</span>
                          )}
                        </div>
                        <RiskBadge level={s.result?.riskLevel} />
                      </div>

                      {/* Vitals Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50 text-center">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">BP</p>
                          <p className="font-extrabold text-slate-800 text-sm md:text-base">
                            {s.vitals?.systolic || '--'}/{s.vitals?.diastolic || '--'}
                          </p>
                        </div>
                        <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100/50 text-center">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Sugar</p>
                          <p className="font-extrabold text-slate-800 text-sm md:text-base">
                            {s.vitals?.bloodSugar || '--'}
                          </p>
                        </div>
                        <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50 text-center">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">BMI</p>
                          <p className="font-extrabold text-slate-800 text-sm md:text-base">
                            {s.vitals?.bmi || '--'}
                          </p>
                        </div>
                      </div>

                      {/* Score & Flags */}
                      {s.result?.score !== undefined && (
                        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 uppercase">CBAC Score:</span>
                            <span className="text-sm font-extrabold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                              {s.result.score} / 20
                            </span>
                          </div>
                          
                          {/* Clinical Flags Tags */}
                          {s.result?.flags && s.result.flags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {s.result.flags.map((flag, idx) => (
                                <span 
                                  key={idx} 
                                  className="text-[11px] font-bold px-2 py-1 rounded-md bg-red-50 text-red-600 border border-red-100"
                                >
                                  {flag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}