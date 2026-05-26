import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import VillageBarChart from '../../components/charts/VillageBarChart';
import { getVillageSummary } from '../../services/screeningService';

export default function VillageSummary() {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVillageSummary()
      .then(r => setVillages(r.data))
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
          <div className="flex items-center gap-3 animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xl shadow-sm border border-teal-100">
              🗺️
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Village Summary</h1>
          </div>

          {/* Chart Widget - FIXED: Added explicit height (h-[400px]) to prevent ResponsiveContainer from collapsing */}
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 p-5 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[400px] flex flex-col">
            {loading ? (
              // Chart Skeleton Loader
              <div className="flex-1 w-full h-full animate-pulse flex flex-col">
                <div className="h-6 bg-slate-200 rounded w-48 mb-auto"></div>
                <div className="flex items-end gap-4 sm:gap-8 h-48 border-b border-slate-100 pb-0 px-4">
                  <div className="flex-1 bg-slate-100 rounded-t-lg h-[60%]"></div>
                  <div className="flex-1 bg-slate-200 rounded-t-lg h-[90%]"></div>
                  <div className="flex-1 bg-slate-100 rounded-t-lg h-[40%]"></div>
                  <div className="flex-1 bg-slate-200 rounded-t-lg h-[75%]"></div>
                  <div className="flex-1 bg-slate-100 rounded-t-lg h-[30%] hidden sm:block"></div>
                </div>
              </div>
            ) : (
              <VillageBarChart data={villages} />
            )}
          </div>

          {/* Data Table Card */}
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
            {loading ? (
              // Table Skeleton Loader
              <div className="p-6 space-y-4 w-full">
                <div className="flex gap-4 border-b border-slate-100 pb-4">
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                </div>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-4 py-3 animate-pulse">
                    <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-5 bg-slate-100 rounded w-1/6"></div>
                    <div className="h-6 bg-rose-100 rounded-md w-10"></div>
                    <div className="h-6 bg-amber-100 rounded-md w-10"></div>
                    <div className="h-6 bg-emerald-100 rounded-md w-10"></div>
                    <div className="h-3 bg-slate-200 rounded-full w-1/4 ml-auto"></div>
                  </div>
                ))}
              </div>
            ) : villages.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center h-full py-24 px-4 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-4 shadow-sm">
                  <span className="text-4xl opacity-80">📍</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-800">No Village Data</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Screening data hasn't been aggregated by village yet.</p>
              </div>
            ) : (
              // Data Table
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase text-[11px] font-extrabold tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Village Name</th>
                      <th className="py-4 px-6">Total Screened</th>
                      <th className="py-4 px-6">
                        <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1.5 mb-0.5"></span>
                        High Risk
                      </th>
                      <th className="py-4 px-6">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1.5 mb-0.5"></span>
                        Medium Risk
                      </th>
                      <th className="py-4 px-6">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5 mb-0.5"></span>
                        Low Risk
                      </th>
                      <th className="py-4 px-6">High Risk %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {villages.map(v => {
                      const percent = v.total ? Math.round((v.high / v.total) * 100) : 0;
                      
                      return (
                        <tr key={v._id} className="hover:bg-blue-50/30 transition-colors duration-150">
                          <td className="py-3.5 px-6 font-extrabold text-slate-800 text-base">{v._id || 'Unknown'}</td>
                          <td className="py-3.5 px-6">
                            <span className="font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60">
                              {v.total}
                            </span>
                          </td>
                          <td className="py-3.5 px-6">
                            <span className="text-rose-700 font-extrabold bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg inline-block text-center min-w-[2.5rem]">
                              {v.high}
                            </span>
                          </td>
                          <td className="py-3.5 px-6">
                            <span className="text-amber-700 font-extrabold bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg inline-block text-center min-w-[2.5rem]">
                              {v.medium}
                            </span>
                          </td>
                          <td className="py-3.5 px-6">
                            <span className="text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg inline-block text-center min-w-[2.5rem]">
                              {v.low}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 min-w-[150px]">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-slate-100 rounded-full h-2.5 border border-slate-200/60 overflow-hidden">
                                <div 
                                  className="bg-rose-500 h-full rounded-full transition-all duration-1000 ease-out" 
                                  style={{ width: `${percent}%` }} 
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-500 w-8">
                                {percent}%
                              </span>
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