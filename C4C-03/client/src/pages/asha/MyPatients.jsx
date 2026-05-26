import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import { getPatients } from '../../services/patientService';

export default function MyPatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatients()
      .then(r => setPatients(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p =>
    (p.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (p.village?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-800">
      <Navbar />
      
      <main className="max-w-2xl mx-auto p-4 md:p-6 mt-2 space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/asha')} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 active:scale-95 transition-all shadow-sm shrink-0"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">My Patients</h1>
          </div>
          <div className="text-sm font-semibold text-slate-500 bg-slate-200/50 px-3 py-1 rounded-full shrink-0">
            {patients.length} Total
          </div>
        </div>

        {/* Modern Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            placeholder="Search by name or village..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Content Area */}
        <div className="space-y-3">
          {loading ? (
            // Skeleton Loader
            [1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-[1.5rem] p-4 border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            // Empty State
            <div className="text-center py-16 px-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👥</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                {search ? 'No patients found' : 'No patients yet'}
              </h3>
              <p className="text-sm text-slate-500 max-w-[250px] mx-auto">
                {search 
                  ? `We couldn't find anyone matching "${search}". Try a different name or village.` 
                  : 'You have not registered any patients yet. Start a new screening to add someone.'}
              </p>
            </div>
          ) : (
            // Patient List
            filtered.map(p => (
              <div
                key={p._id}
                onClick={() => navigate(`/asha/patients/${p._id}`)}
                className="bg-white rounded-[1.5rem] p-4 flex items-center justify-between cursor-pointer border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 active:scale-[0.98] transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  {/* Dynamic Avatar */}
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {(p.name?.[0] || '?').toUpperCase()}
                  </div>
                  
                  {/* Patient Info */}
                  <div>
                    <p className="font-bold text-slate-800 text-base">{p.name}</p>
                    <p className="text-sm font-medium text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span>{p.age}y</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{p.gender}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="truncate">📍 {p.village}</span>
                    </p>
                  </div>
                </div>
                
                {/* Chevron */}
                <div className="text-slate-300 group-hover:text-blue-500 transition-colors pr-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}