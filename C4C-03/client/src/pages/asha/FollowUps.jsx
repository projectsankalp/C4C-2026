import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';

import api from '../../services/api';
import { formatDate, daysUntil } from '../../utils/formatDate';

export default function FollowUps() {
  const navigate = useNavigate();
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'completed'

  useEffect(() => {
    api.get('/followups')
      .then(r => setFollowups(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const complete = async (id) => {
    try {
      // Optimistic UI update for immediate feedback
      setFollowups(prev => prev.map(f => f._id === id ? { ...f, status: 'done' } : f));
      await api.patch(`/followups/${id}/complete`);
    } catch (error) {
      console.error("Failed to complete:", error);
      // Revert if failed (optional, but good practice)
      setFollowups(prev => prev.map(f => f._id === id ? { ...f, status: 'pending' } : f));
    }
  };

  const pendingList = followups.filter(f => f.status !== 'done');
  const doneList = followups.filter(f => f.status === 'done');
  
  const displayList = activeTab === 'pending' ? pendingList : doneList;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-800">
      <Navbar />
      
      <main className="max-w-2xl mx-auto p-4 md:p-6 mt-2 space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/asha')} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 active:scale-95 transition-all shadow-sm"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Follow-ups</h1>
          </div>
          <div className="text-sm font-semibold text-slate-500 bg-slate-200/50 px-3 py-1 rounded-full">
            {pendingList.length} Pending
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-200/50 rounded-2xl">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'pending' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Pending ({pendingList.length})
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'completed' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Completed ({doneList.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {loading ? (
            // Skeleton Loader
            [1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-[1.5rem] p-5 border border-slate-100 flex justify-between">
                <div className="space-y-3 w-2/3">
                  <div className="h-5 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-100 rounded w-2/3 pt-2"></div>
                </div>
                <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
              </div>
            ))
          ) : displayList.length === 0 ? (
            // Empty State
            <div className="text-center py-16 px-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎉</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                {activeTab === 'pending' ? "All caught up!" : "No completed tasks yet"}
              </h3>
              <p className="text-sm text-slate-500">
                {activeTab === 'pending' ? "You have completed all your scheduled follow-ups." : "Once you mark a follow-up as done, it will appear here."}
              </p>
            </div>
          ) : (
            // List Items
            displayList.map(f => {
              const days = daysUntil(f.dueDate);
              const overdue = days < 0;
              const dueSoon = days >= 0 && days <= 3;
              const isDone = f.status === 'done';
              
              // Dynamic styling based on status
              let cardStyle = "border-slate-100";
              let badgeStyle = "bg-blue-50 text-blue-700";
              let badgeText = `Due: ${formatDate(f.dueDate)}`;
              
              if (isDone) {
                cardStyle = "border-slate-100 opacity-70";
                badgeStyle = "bg-emerald-50 text-emerald-700";
                badgeText = "Completed";
              } else if (overdue) {
                cardStyle = "border-red-200 bg-red-50/30";
                badgeStyle = "bg-red-100 text-red-700";
                badgeText = `Overdue by ${Math.abs(days)} days`;
              } else if (dueSoon) {
                cardStyle = "border-amber-200 bg-amber-50/30";
                badgeStyle = "bg-amber-100 text-amber-700";
                badgeText = `Due in ${days} days`;
              }

              return (
                <div 
                  key={f._id} 
                  className={`bg-white rounded-[1.5rem] p-5 shadow-sm border transition-all duration-300 hover:shadow-md ${cardStyle}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    
                    {/* Patient Info */}
                    <div>
                      <h3 className={`text-lg font-bold ${isDone ? 'text-slate-600 line-through' : 'text-slate-800'}`}>
                        {f.patientId?.name || "Unknown Patient"}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        📍 {f.patientId?.village || "Unknown Village"}
                      </p>
                      
                      {/* Status Badge */}
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold mt-3 ${badgeStyle}`}>
                        {overdue && !isDone && "⚠️ "}
                        {badgeText}
                      </div>
                    </div>

                    {/* Action Button */}
                    {!isDone && (
                      <button 
                        onClick={() => complete(f._id)} 
                        className="shrink-0 bg-white border-2 border-slate-200 text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95 font-bold text-sm px-4 py-2.5 rounded-xl transition-all duration-200"
                      >
                        Mark Done
                      </button>
                    )}
                    
                    {isDone && (
                      <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}