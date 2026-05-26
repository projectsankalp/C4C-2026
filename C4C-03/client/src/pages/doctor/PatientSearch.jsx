import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import RiskBadge from '../../components/dashboard/RiskBadge';
import { getScreenings } from '../../services/screeningService';
import { formatDate } from '../../utils/formatDate';

export default function PatientSearch() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Reusable modern input styles
  const inputStyles = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium w-full";

  const doSearch = async () => {
    setLoading(true); 
    setSearched(true);
    try {
      const res = await getScreenings();
      let data = res.data;
      if (search) {
        data = data.filter(s => 
          s.patientId?.name?.toLowerCase().includes(search.toLowerCase()) || 
          s.patientId?.village?.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (riskFilter) {
        data = data.filter(s => s.result?.riskLevel === riskFilter);
      }
      setResults(data);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
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
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-sm border border-blue-100">
              🔍
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Search Patients</h1>
          </div>

          {/* Search Controls Card */}
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 p-4 md:p-5 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
              
              {/* Text Search */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  className={`${inputStyles} pl-11`}
                  placeholder="Search by patient name or village..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doSearch()}
                />
              </div>
              
              {/* Risk Filter */}
              <div className="w-full md:w-48 shrink-0">
                <select 
                  className={`${inputStyles} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10`} 
                  value={riskFilter} 
                  onChange={e => setRiskFilter(e.target.value)}
                >
                  <option value="">All Risk Levels</option>
                  <option value="HIGH">High Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="LOW">Low Risk</option>
                </select>
              </div>
              
              {/* Submit Button */}
              <button 
                onClick={doSearch} 
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-sm hover:shadow-md hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all shrink-0"
              >
                Search
              </button>
            </div>
          </div>

          {/* Results Area */}
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
            
            {!searched && !loading ? (
              // Initial Empty State
              <div className="flex flex-col items-center justify-center h-full py-24 px-4 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-4 shadow-sm">
                  <span className="text-4xl opacity-80">🔎</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-800">Find Patient Records</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Enter a name, village, or select a risk level to begin.</p>
              </div>
            ) : loading ? (
              // Skeleton Loader
              <div className="p-6 space-y-4 w-full">
                <div className="flex gap-4 border-b border-slate-100 pb-4">
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                </div>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-4 py-3 animate-pulse">
                    <div className="w-10 h-10 bg-slate-200 rounded-full shrink-0"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/5"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                    <div className="h-8 bg-slate-200 rounded-xl w-24 ml-auto"></div>
                  </div>
                ))}
              </div>
            ) : results.length === 0 ? (
              // No Results Found
              <div className="flex flex-col items-center justify-center h-full py-24 px-4 text-center animate-in fade-in duration-300">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100 mb-4 shadow-sm">
                  <span className="text-4xl opacity-80">📄</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-800">No Records Found</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">We couldn't find anyone matching your search criteria.</p>
              </div>
            ) : (
              // Results Table
              <div className="overflow-x-auto animate-in fade-in duration-500">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-sm">
                    {results.length} {results.length === 1 ? 'result' : 'results'} found
                  </span>
                </div>
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase text-[11px] font-extrabold tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Village</th>
                      <th className="py-4 px-6">Age</th>
                      <th className="py-4 px-6">BP</th>
                      <th className="py-4 px-6">Sugar</th>
                      <th className="py-4 px-6">Risk</th>
                      <th className="py-4 px-6">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {results.map(s => (
                      <tr 
                        key={s._id} 
                        className="hover:bg-blue-50/30 cursor-pointer transition-colors duration-150 group" 
                        onClick={() => navigate(`/doctor/patients/${s.patientId?._id}`)}
                      >
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200 group-hover:bg-blue-100 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors">
                              {s.patientId?.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-800">{s.patientId?.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 text-slate-500 font-medium">{s.patientId?.village}</td>
                        <td className="py-3.5 px-6 text-slate-600 font-medium">{s.patientId?.age} yrs</td>
                        <td className="py-3.5 px-6 font-bold text-slate-700">{s.vitals?.systolic}/{s.vitals?.diastolic}</td>
                        <td className="py-3.5 px-6 font-bold text-slate-700">{s.vitals?.bloodSugar || '—'}</td>
                        <td className="py-3.5 px-6"><RiskBadge level={s.result?.riskLevel} /></td>
                        <td className="py-3.5 px-6 text-slate-400 text-xs font-semibold">{formatDate(s.createdAt)}</td>
                      </tr>
                    ))}
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