import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import OfflineBanner from '../../components/shared/OfflineBanner';
import SyncStatus from '../../components/shared/SyncStatus';
import { useAuth } from '../../context/AuthContext';
import { getPatients } from '../../services/patientService';
import { getScreenings } from '../../services/screeningService';

export default function AshaHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ patients: 0, todayScreenings: 0, pendingFollowups: 0 });

  useEffect(() => {
    async function load() {
      try {
        const [pRes, sRes] = await Promise.all([getPatients(), getScreenings()]);
        const today = new Date().toDateString();
        const todayScreenings = sRes.data.filter(s => new Date(s.createdAt).toDateString() === today).length;
        setStats({ patients: pRes.data.length, todayScreenings, pendingFollowups: 0 });
      } catch (err) { 
        console.error(err); 
      }
    }
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Stats configuration with professional SVG icons
  const statCards = [
    { 
      label: 'Total Patients', 
      value: stats.patients, 
      color: '#3b82f6', 
      bg: '#eff6ff',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      label: 'Screened Today', 
      value: stats.todayScreenings, 
      color: '#8b5cf6', 
      bg: '#f5f3ff',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    { 
      label: 'Follow-ups', 
      value: stats.pendingFollowups, 
      color: '#f59e0b', 
      bg: '#fffbeb',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-800">
      <OfflineBanner />
      <Navbar />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 mt-2">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="md:col-span-7 flex flex-col gap-6">
            
            {/* 1. Greeting Card */}
            <div 
              className="relative overflow-hidden rounded-[2rem] p-6 md:p-8 text-white shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700"
              style={{ boxShadow: '0 20px 40px -15px rgba(59, 130, 246, 0.4)' }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="absolute bottom-0 right-20 w-32 h-32 bg-indigo-900 opacity-20 rounded-full -mb-10 blur-xl"></div>
              
              <div className="relative z-10">
                <p className="text-blue-100 font-medium tracking-wide text-sm mb-1">{greeting},</p>
                <h1 className="text-3xl font-extrabold tracking-tight mb-3">{user?.name}</h1>
                
                <div className="inline-flex items-center gap-2 bg-black/15 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  <svg className="w-4 h-4 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-50">{user?.village || 'Assigned Area'}</span>
                </div>

                <div className="mt-6 pt-5 border-t border-white/20">
                  <div className="inline-flex items-center bg-white px-4 py-2 rounded-xl shadow-sm">
                    <SyncStatus />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Stats Grid */}
            <div className="grid grid-cols-3 gap-3 md:gap-5">
              {statCards.map(s => (
                <div 
                  key={s.label} 
                  className="bg-white rounded-[1.5rem] p-4 md:p-5 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                    style={{ backgroundColor: s.bg, color: s.color }}
                  >
                    {s.icon}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-slate-800 leading-none mb-1.5">{s.value}</div>
                  <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>

            {/* 3. Clinical Reminder (Desktop) */}
            <div className="hidden md:block bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-base font-bold text-slate-800">Screening Protocol Reminders</p>
              </div>
              <ul className="text-sm text-slate-600 space-y-3 font-medium">
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-0.5">•</span> Take BP after patient has rested for at least 5 minutes
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-0.5">•</span> Use glucometer specifically for random blood sugar tests
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-0.5">•</span> Measure waist circumference accurately at navel level
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-0.5">•</span> Record all symptoms the patient reports today
                </li>
              </ul>
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="md:col-span-5 flex flex-col gap-5">
            
            {/* Primary Action Button */}
            <button
              onClick={() => navigate('/asha/new-screening')}
              className="group relative w-full rounded-[2rem] p-6 text-white text-left transition-all duration-200 ease-out active:scale-[0.98] bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
              style={{ boxShadow: '0 15px 30px -10px rgba(59, 130, 246, 0.4)' }}
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[1.25rem] flex items-center justify-center text-3xl shadow-inner border border-white/30 group-hover:scale-110 transition-transform duration-300">
                  ➕
                </div>
                <div className="flex-1">
                  <p className="text-xl font-extrabold mb-1">New Screening</p>
                  <p className="text-blue-100 text-sm font-medium leading-snug">Screen a patient for diabetes, BP & vitals</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/asha/patients')} 
                className="bg-white p-5 rounded-[1.5rem] flex flex-col gap-4 items-start border border-slate-200 shadow-sm active:scale-95 transition-all duration-200 hover:shadow-md hover:border-blue-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 text-sm mb-0.5">My Patients</p>
                  <p className="text-xs font-semibold text-slate-400">{stats.patients} registered</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/asha/followups')} 
                className="bg-white p-5 rounded-[1.5rem] flex flex-col gap-4 items-start border border-slate-200 shadow-sm active:scale-95 transition-all duration-200 hover:shadow-md hover:border-orange-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 text-sm mb-0.5">Follow-ups</p>
                  <p className="text-xs font-semibold text-slate-400">Check due dates</p>
                </div>
              </button>
            </div>

            {/* Clinical Reminder (Mobile Only) */}
            <div className="md:hidden mt-2 bg-white border border-slate-200 rounded-[1.5rem] p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Protocol Reminders
              </p>
              <ul className="text-xs text-slate-500 space-y-2 font-medium">
                <li className="flex items-start gap-2"><span className="text-blue-400">•</span> Take BP after patient has rested 5 mins</li>
                <li className="flex items-start gap-2"><span className="text-blue-400">•</span> Use glucometer for random blood sugar</li>
                <li className="flex items-start gap-2"><span className="text-blue-400">•</span> Measure waist accurately at navel level</li>
                <li className="flex items-start gap-2"><span className="text-blue-400">•</span> Record all patient-reported symptoms</li>
              </ul>
            </div>

          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}