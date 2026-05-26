import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import KPICard from '../components/shared/KPICard';
import PatientTable from '../components/dashboard/PatientTable';
import PatientModal from '../components/dashboard/PatientModal';
import Loader from '../components/shared/Loader';
import ErrorState from '../components/shared/ErrorState';
import EmptyState from '../components/shared/EmptyState';
import { useAppData } from '../context/AppDataContext';
import { Search, RotateCcw, AlertCircle } from 'lucide-react';

export default function DoctorDashboard() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const { patients, doctorStats, updatePatientClinicalDetails, resolvePatient, createFollowUp, loading, error, refresh } = useAppData();

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState(searchParams.get('filter') || 'ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [villageFilter, setVillageFilter] = useState('ALL');

  useEffect(() => {
    const tab = searchParams.get('tab');
    const filter = searchParams.get('filter');
    queueMicrotask(() => {
      if (tab) setActiveTab(tab);
      if (filter) setRiskFilter(filter);
    });
  }, [searchParams]);

  const safePatients = useMemo(() => Array.isArray(patients) ? patients : [], [patients]);

  const filteredActiveQueue = useMemo(() => {
    const normalize = (value) => String(value || "").trim().toUpperCase();
    
    const normalizeRisk = (value) => {
      const risk = normalize(value);
      if (risk === "HIGH" || risk === "HIGH RISK" || risk === "RED") return "RED";
      if (risk === "MEDIUM" || risk === "MODERATE" || risk === "YELLOW") return "YELLOW";
      if (risk === "LOW" || risk === "LOW RISK" || risk === "GREEN") return "GREEN";
      return risk;
    };

    return safePatients.filter(patient => {
      const status = normalize(patient?.status || 'PENDING');
      const risk = normalizeRisk(patient?.riskLevel || 'ALL');

      const isActiveByDefault = status === "NEW" || status === "FOLLOW_UP" || status === "PENDING";

      const matchesStatus =
        statusFilter && normalize(statusFilter) !== "ALL"
          ? status === normalize(statusFilter)
          : isActiveByDefault;

      const matchesRisk =
        !riskFilter ||
        normalizeRisk(riskFilter) === "ALL" ||
        risk === normalizeRisk(riskFilter);

      const matchesVillage =
        !villageFilter ||
        normalize(villageFilter) === "ALL" ||
        normalize(patient.village) === normalize(villageFilter);

      const matchesSearch =
        !searchQuery ||
        [
          patient?.name,
          patient?.village,
          patient?.ashaName,
          patient?.phone,
          patient?.bp,
          patient?.id
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesRisk && matchesVillage && matchesSearch;
    });
  }, [safePatients, searchQuery, riskFilter, statusFilter, villageFilter]);

  const followUpQueue = useMemo(() => safePatients.filter(p => p.status === 'FOLLOW_UP'), [safePatients]);
  const resolvedQueue = useMemo(() => safePatients.filter(p => p.status === 'RESOLVED'), [safePatients]);

  const uniqueVillages = useMemo(() => {
    const v = new Set(safePatients.map(p => p.village));
    return Array.from(v).sort();
  }, [safePatients]);

  if (loading) return <Loader message="Loading Operational Workspace..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const handleReset = () => {
    setSearchQuery('');
    setRiskFilter('ALL');
    setStatusFilter('ALL');
    setVillageFilter('ALL');
  };



  const renderTabNav = () => (
    <div className="flex items-center space-x-6 border-b border-border-primary/50 mb-6 overflow-x-auto">
      {[
        { id: 'overview', label: 'Overview' },
        { id: 'triage', label: 'Active Triage' },
        { id: 'followups', label: 'Follow-Ups' },
        { id: 'resolved', label: 'Resolved Cases' }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`py-3 px-2 text-sm font-bold uppercase tracking-wider transition-colors duration-200 border-b-2 whitespace-nowrap ${
            activeTab === tab.id 
              ? 'border-accent-primary text-text-main' 
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="animate-in fade-in duration-300 pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-text-main">Clinical Triage Workspace</h1>
        <p className="text-sm font-medium text-text-muted mt-1">Monitor high-risk cases and coordinate field operative deployments.</p>
      </div>

      {renderTabNav()}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {(doctorStats?.highRisk > 0 || safePatients.filter(p => p?.riskLevel === 'RED' && p?.status === 'NEW').length > 0) && (
            <div className="bg-status-red/10 border border-status-red/30 rounded-xl p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-status-red" />
              <p className="text-sm font-bold text-status-red uppercase tracking-wide">
                {doctorStats?.highRisk || safePatients.filter(p => p?.riskLevel === 'RED' && p?.status === 'NEW').length} high-risk patients require immediate review today
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <KPICard title="Total Screened" value={doctorStats?.totalScreened || safePatients.length} />
            <KPICard title="RED Cases" value={doctorStats?.highRisk || safePatients.filter(p => p?.riskLevel === 'RED').length} isDanger />
            <KPICard title="Follow-Ups Pending" value={followUpQueue.length} />
            <KPICard title="Resolved Cases" value={resolvedQueue.length} />
            <KPICard title="Today's Syncs" value={doctorStats?.todaySyncs || 0} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-surface-1 border border-border-primary/50 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold tracking-tight text-text-main border-b border-border-primary/50 pb-4 mb-4">Critical Case Preview</h2>
              <div className="space-y-3">
                {safePatients.filter(p => p?.riskLevel === 'RED' && p?.status !== 'RESOLVED').slice(0,3).map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 rounded-lg border border-border-primary/30 bg-surface-2/30">
                    <div>
                      <p className="text-sm font-bold text-text-main">{p?.name || 'Unknown'}</p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mt-1">{p?.village || 'Unknown'} &bull; {p?.status || 'NEW'}</p>
                    </div>
                    <button onClick={() => { setActiveTab('triage'); setSelectedPatient(p); }} className="px-3 py-1.5 bg-surface-1 border border-border-primary/50 text-[10px] font-bold text-text-main rounded-md hover:bg-surface-2 transition-colors uppercase tracking-widest">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-1 border border-border-primary/50 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold tracking-tight text-text-main border-b border-border-primary/50 pb-4 mb-4">Follow-Up Snapshot</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-text-muted">Pending Follow-Ups</span>
                  <span className="text-sm font-bold text-text-main">{followUpQueue.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-text-muted">Overdue Actions</span>
                  <span className="text-sm font-bold text-status-red">{Math.max(0, followUpQueue.length - 2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border-primary/30">
                  <span className="text-sm font-bold text-text-muted">Villages Requiring Attention</span>
                  <span className="text-sm font-bold text-text-main">{new Set(followUpQueue.map(p => p.village)).size}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE TRIAGE TAB */}
      {activeTab === 'triage' && (
        <div className="bg-surface-1 border border-border-primary/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-text-main">Active Triage Queue</h2>
              <p className="text-[11px] font-medium text-text-muted uppercase tracking-widest mt-1">Requires Clinical Attention</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, village, or operative..." 
                className="w-full bg-surface-2 border border-border-primary/50 rounded-lg py-2.5 pl-9 pr-4 text-sm font-medium text-text-main focus:outline-none focus:border-text-muted transition-colors duration-200 placeholder:text-text-muted/60"
              />
            </div>
            
            <div className="flex space-x-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <select 
                value={villageFilter}
                onChange={(e) => setVillageFilter(e.target.value)}
                className="bg-surface-2 border border-border-primary/50 rounded-lg py-2.5 px-3 text-sm font-medium text-text-main focus:outline-none focus:border-text-muted transition-colors duration-200 cursor-pointer min-w-[120px]"
              >
                <option value="ALL">All Villages</option>
                {uniqueVillages.map(v => <option key={v} value={v}>{v}</option>)}
              </select>

              <select 
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-surface-2 border border-border-primary/50 rounded-lg py-2.5 px-3 text-sm font-medium text-text-main focus:outline-none focus:border-text-muted transition-colors duration-200 cursor-pointer min-w-[120px]"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="RED">High Risk</option>
                <option value="YELLOW">Medium Risk</option>
                <option value="GREEN">Low Risk</option>
              </select>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-2 border border-border-primary/50 rounded-lg py-2.5 px-3 text-sm font-medium text-text-main focus:outline-none focus:border-text-muted transition-colors duration-200 cursor-pointer min-w-[120px]"
              >
                <option value="ALL">All Active Status</option>
                <option value="PENDING">New</option>
                <option value="FOLLOW_UP">Follow-Up</option>
                <option value="RESOLVED">Resolved (Hidden)</option>
              </select>

              <button 
                onClick={handleReset}
                className="p-2.5 border border-border-primary/50 bg-surface-2 hover:bg-border-primary/50 text-text-muted hover:text-text-main rounded-lg transition-colors duration-200 flex items-center justify-center shrink-0 shadow-sm"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {filteredActiveQueue.length > 0 ? (
              <PatientTable 
                patients={filteredActiveQueue} 
                onView={setSelectedPatient}
                onFollowUp={(id) => createFollowUp(id)}
              />
            ) : (
              <EmptyState message="No active screening cases require review." subMessage="Clear filters or wait for ASHA sync." />
            )}
          </div>
        </div>
      )}

      {/* FOLLOW-UPS TAB */}
      {activeTab === 'followups' && (
        <div className="bg-surface-1 border border-border-primary/50 rounded-2xl p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold tracking-tight text-text-main">Pending Follow-Ups</h2>
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-widest mt-1">Operational Field Coordination</p>
          </div>
          <div className="max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
            {followUpQueue.length > 0 ? (
              <PatientTable patients={followUpQueue} onView={setSelectedPatient} />
            ) : (
              <EmptyState message="No pending follow-up actions." />
            )}
          </div>
        </div>
      )}

      {/* RESOLVED CASES TAB */}
      {activeTab === 'resolved' && (
        <div className="bg-surface-1 border border-border-primary/50 rounded-2xl p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold tracking-tight text-text-main">Historical Resolutions</h2>
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-widest mt-1">Read-Only Clinical Summaries</p>
          </div>
          <div className="max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
            {resolvedQueue.length > 0 ? (
              <PatientTable patients={resolvedQueue} onView={setSelectedPatient} />
            ) : (
              <EmptyState message="No clinically resolved cases available." />
            )}
          </div>
        </div>
      )}

      {/* PATIENT MODAL WORKFLOW */}
      {selectedPatient && (
        <PatientModal 
          patient={selectedPatient} 
          onClose={() => setSelectedPatient(null)} 
          onSaveNotes={(id, notes) => updatePatientClinicalDetails(id, { doctorNotes: notes })}
          onFollowUp={(id) => { createFollowUp(id); setSelectedPatient(null); }}
          onResolve={(id, details) => { resolvePatient(id, details); setSelectedPatient(null); }}
        />
      )}
    </div>
  );
}
