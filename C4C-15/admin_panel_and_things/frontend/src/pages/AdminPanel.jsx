import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import KPICard from '../components/shared/KPICard';
import UserTable from '../components/admin/UserTable';
import UserModal from '../components/admin/UserModal';
import UserUpdateModal from '../components/admin/UserUpdateModal';
import PHCModal from '../components/admin/PHCModal';
import PatientTable from '../components/dashboard/PatientTable';
import PatientModal from '../components/dashboard/PatientModal';
import AddPersonnelModal from '../components/admin/AddPersonnelModal';
import Loader from '../components/shared/Loader';
import ErrorState from '../components/shared/ErrorState';
import EmptyState from '../components/shared/EmptyState';
import { useAppData } from '../context/AppDataContext';
import { Activity, Plus } from 'lucide-react';

export default function AdminPanel() {
  const { 
    adminStats, 
    users = [], 
    heatmapData = [], 
    patients = [], 
    addUser,
    removePersonnel, 
    changeUserStatus, 
    updatePersonnel,
    loading, 
    error, 
    refresh 
  } = useAppData() || {};
  
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  


  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPHC, setSelectedPHC] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [userToRestrict, setUserToRestrict] = useState(null);
  const [userToRemove, setUserToRemove] = useState(null);
  const [userToChangeStatus, setUserToChangeStatus] = useState(null);

  const [successMessage, setSuccessMessage] = useState('');

  const [screeningsVillageFilter, setScreeningsVillageFilter] = useState('ALL');

  const safeUsers = useMemo(() => Array.isArray(users) ? users : [], [users]);
  const safePatients = useMemo(() => Array.isArray(patients) ? patients : [], [patients]);
  const safeHeatmap = useMemo(() => Array.isArray(heatmapData) ? heatmapData : [], [heatmapData]);

  const activeFieldOps = useMemo(() => safeUsers.filter(u => u.role === 'ASHA' && u.status === 'Active').length || 0, [safeUsers]);
  const networkDoctors = useMemo(() => safeUsers.filter(u => u.role === 'Doctor').length || 0, [safeUsers]);

  if (loading) return <Loader message="Loading District Operations..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const handleRemoveConfirm = async () => {
    if (userToRemove) {
      try {
        await removePersonnel(userToRemove.id);
        setUserToRemove(null);
      } catch (err) {
        alert(err.message || 'Failed to remove personnel');
      }
    }
  };

  const handleRestrictConfirm = async () => {
    if (userToRestrict) {
      await changeUserStatus(userToRestrict.id, 'RESTRICTED');
      setUserToRestrict(null);
    }
  };

  const handleStatusChangeConfirm = async () => {
    if (userToChangeStatus) {
      await changeUserStatus(userToChangeStatus.user.id, userToChangeStatus.newStatus);
      setUserToChangeStatus(null);
    }
  };

  const handleAddPersonnel = async (newUser) => {
    if (addUser) {
      await addUser(newUser);
      setIsAddModalOpen(false);
      setSuccessMessage('Operational personnel account created successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleSaveUpdate = async (id, data) => {
    if (updatePersonnel) {
      await updatePersonnel(id, data);
      setUserToUpdate(null);
    }
  };

  const jumpToScreeningsVillage = (villageName) => {
    setScreeningsVillageFilter(villageName);
    setActiveTab('screenings');
  };

  const jumpToWorker = (workerName) => {
    const worker = safeUsers.find(u => u.name === workerName);
    if (worker) {
      setSelectedUser(worker);
      setActiveTab('personnel');
    }
  };

  // Dummy PHC data since it's not fully provided by context yet
  const dummyPHCs = [
    { name: 'Bantwal PHC', district: 'Dakshina Kannada', doctors: 3, ashas: 42, villages: 12, screenings: 4500, redBurden: 85 },
    { name: 'Vittal PHC', district: 'Dakshina Kannada', doctors: 2, ashas: 28, villages: 8, screenings: 3100, redBurden: 42 }
  ];

  const renderTabNav = () => (
    <div className="flex items-center space-x-6 border-b border-border-primary/50 mb-6 overflow-x-auto">
      {[
        { id: 'overview', label: 'Overview' },
        { id: 'personnel', label: 'Personnel' },
        { id: 'phcs', label: 'PHC Coverage' },
        { id: 'heatmap', label: 'Heatmap' },
        { id: 'screenings', label: 'Screenings' },
        { id: 'activity', label: 'Activity' }
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
        <h1 className="text-2xl font-bold tracking-tight text-text-main">District Operations Panel</h1>
        <p className="text-sm font-medium text-text-muted mt-1">Monitor network personnel, verify PHC coverage, and oversee district risk distribution.</p>
      </div>

      {renderTabNav()}

      {successMessage && (
        <div className="mb-6 p-4 bg-status-green/10 border border-status-green/30 rounded-xl flex items-center shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-2 h-2 rounded-full bg-status-green mr-3 animate-pulse"></div>
          <p className="text-sm font-bold text-status-green tracking-wide">{successMessage}</p>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <KPICard title="Total Personnel" value={users?.length || 0} />
            <KPICard title="Active Field Ops" value={activeFieldOps} />
            <KPICard title="Network Doctors" value={networkDoctors} />
            <KPICard title="Active PHC Nodes" value={adminStats?.phcs || 2} />
            <KPICard title="Total Screenings" value={adminStats?.totalScreenings?.toLocaleString() || 7600} />
            <div className="bg-surface-1 border border-border-primary/50 rounded-xl p-4 flex flex-col justify-between shadow-sm transition-colors hover:bg-surface-2/30">
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Network Status</h3>
              <p className="text-xl font-bold tracking-tight text-status-green flex items-center space-x-2 mt-1">
                <Activity className="w-5 h-5 animate-pulse" />
                <span>Operational</span>
              </p>
            </div>
          </div>
          <div className="bg-surface-1 border border-border-primary/50 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold tracking-tight text-text-main border-b border-border-primary/50 pb-4 mb-4">District Burden Summary</h2>
            <div className="flex items-center space-x-8">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">Total RED Cases</p>
                <p className="text-2xl font-bold text-status-red">{patients?.filter(p => p?.riskLevel === 'RED').length || 0}</p>
              </div>
              <div className="border-l border-border-primary/30 pl-8">
                <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">Total YELLOW Cases</p>
                <p className="text-2xl font-bold text-status-yellow">{patients?.filter(p => p?.riskLevel === 'YELLOW').length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERSONNEL TAB */}
      {activeTab === 'personnel' && (
        <div className="bg-surface-1 border border-border-primary/50 rounded-2xl p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-text-main">Network Personnel Directory</h2>
              <p className="text-[11px] font-medium text-text-muted uppercase tracking-widest mt-1">Manage Operational Staff</p>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg bg-accent-primary px-3.5 py-2 text-xs font-semibold text-white transition duration-200 hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Personnel
            </button>
          </div>
          <div className="max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
            {safeUsers.length > 0 ? (
              <UserTable 
                users={safeUsers} 
                onView={setSelectedUser}
                onUpdate={setUserToUpdate}
                onRestrict={setUserToRestrict}
                onChangeStatus={(user, newStatus) => setUserToChangeStatus({ user, newStatus })}
                onRemove={setUserToRemove} 
              />
            ) : (
              <EmptyState message="No personnel records available." />
            )}
          </div>
        </div>
      )}

      {/* PHC COVERAGE TAB */}
      {activeTab === 'phcs' && (
        <div className="bg-surface-1 border border-border-primary/50 rounded-2xl p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold tracking-tight text-text-main">PHC Coverage Nodes</h2>
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-widest mt-1">District Facilities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummyPHCs.map(phc => (
              <div key={phc.name} className="bg-surface-2/30 border border-border-primary/50 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-text-main">{phc.name}</h3>
                  <div className="w-2.5 h-2.5 rounded-full bg-status-green animate-pulse"></div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted font-semibold">Doctors Assigned</span>
                    <span className="text-text-main font-bold">{phc.doctors}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted font-semibold">Field Ops</span>
                    <span className="text-text-main font-bold">{phc.ashas}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted font-semibold">Villages Covered</span>
                    <span className="text-text-main font-bold">{phc.villages}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedPHC(phc)} className="w-full px-4 py-2 bg-surface-1 hover:bg-border-primary/50 border border-border-primary/50 text-text-main text-xs font-bold uppercase tracking-widest rounded-lg transition-colors duration-200">
                  View PHC Summary
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HEATMAP TAB */}
      {activeTab === 'heatmap' && (
        <div className="bg-surface-1 border border-border-primary/50 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-end mb-4 border-b border-border-primary/50 pb-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-text-main">Village Risk Heatmap</h2>
              <p className="text-[11px] font-medium text-text-muted uppercase tracking-widest mt-1">Algorithmic Burden Distribution</p>
            </div>
            
            <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center space-x-1.5 text-status-green">
                <div className="w-2.5 h-2.5 rounded bg-status-green/20 border border-status-green/40"></div>
                <span>Low</span>
              </div>
              <div className="flex items-center space-x-1.5 text-status-yellow">
                <div className="w-2.5 h-2.5 rounded bg-status-yellow/20 border border-status-yellow/40"></div>
                <span>Moderate</span>
              </div>
              <div className="flex items-center space-x-1.5 text-status-red">
                <div className="w-2.5 h-2.5 rounded bg-status-red/25 border border-status-red/50"></div>
                <span>High</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] p-4 rounded-xl border border-border-primary/30">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {safeHeatmap.length > 0 ? safeHeatmap.map((village, idx) => {
              const riskScore = (village.redCount * 3) + village.yellowCount;
              
              let burdenLevel = 'Low';
              let bgClass = 'bg-status-green/12 border-status-green/35';
              let textClass = 'text-status-green';
              
              if (riskScore >= 10 || village.redCount >= 3) {
                burdenLevel = 'High';
                bgClass = 'bg-status-red/25 border-status-red/50';
                textClass = 'text-status-red';
              } else if (riskScore >= 4 || village.yellowCount >= 3) {
                burdenLevel = 'Moderate';
                bgClass = 'bg-status-yellow/20 border-status-yellow/45';
                textClass = 'text-status-yellow';
              }
              
              return (
                <div 
                  key={idx} 
                  onClick={() => jumpToScreeningsVillage(village.village)}
                  className={`border rounded-lg p-3 shadow-sm cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:border-opacity-80 min-h-[120px] ${bgClass} group flex flex-col justify-between`}
                >
                  <div className="mb-2">
                    <h3 className="text-sm font-bold text-text-main group-hover:text-text-main/90 transition-colors leading-tight mb-1">{village.village}</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-widest leading-none ${textClass}`}>
                      {burdenLevel}
                    </p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-text-main/80 bg-background/30 inline-block px-1.5 py-0.5 rounded leading-none">
                      Score {riskScore}
                    </p>
                    <div className="flex items-center space-x-1.5 text-[9px] font-bold tracking-widest text-text-main/70">
                      <span className="text-status-red">R{village.redCount}</span>
                      <span className="text-status-yellow">Y{village.yellowCount}</span>
                      <span className="text-status-green">G{village.greenCount}</span>
                    </div>
                    <p className="text-[9px] font-medium text-text-muted opacity-80">
                      {village.screenings || (village.redCount + village.yellowCount + village.greenCount)} screenings
                    </p>
                  </div>
                </div>
              );
            }) : (
              <EmptyState message="No village risk data available." />
            )}
          </div>
          </div>
        </div>
      )}

      {/* SCREENINGS TAB */}
      {activeTab === 'screenings' && (
        <div className="bg-surface-1 border border-border-primary/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-text-main">Operational Screenings Database</h2>
              <p className="text-[11px] font-medium text-text-muted uppercase tracking-widest mt-1">Read-Only View</p>
            </div>
          </div>

          <div className="mb-4">
             {/* Read-only wrapper for PatientTable which has internal searching if configured, else we can build a filter here.
                 Since PatientTable doesn't have internal filtering out of the box in our implementation, we'll filter patients before passing them. */}
             <select 
                value={screeningsVillageFilter}
                onChange={(e) => setScreeningsVillageFilter(e.target.value)}
                className="bg-surface-2 border border-border-primary/50 rounded-lg py-2 px-3 text-sm font-medium text-text-main focus:outline-none mb-4 min-w-[200px]"
              >
                <option value="ALL">All Villages</option>
                {Array.from(new Set(patients?.map(p => p.village))).sort().map(v => <option key={v} value={v}>{v}</option>)}
              </select>
          </div>

          <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {patients?.filter(p => screeningsVillageFilter === 'ALL' || p.village === screeningsVillageFilter).length > 0 ? (
              <PatientTable 
                patients={patients?.filter(p => screeningsVillageFilter === 'ALL' || p.village === screeningsVillageFilter)}  
                readOnly={true}
                isAdmin={true}
                onView={setSelectedPatient}
              />
            ) : (
              <EmptyState message="No screening records match current filters." />
            )}
          </div>
        </div>
      )}

      {/* ACTIVITY TAB */}
      {activeTab === 'activity' && (
        <div className="bg-surface-1 border border-border-primary/50 rounded-2xl p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold tracking-tight text-text-main">Recent Network Activity</h2>
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-widest mt-1">Operational Audit Log</p>
          </div>
          
          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
            {safePatients.filter(p => p.status === 'RESOLVED').slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-border-primary/30 bg-surface-2/30 hover:bg-surface-2/50 transition-colors duration-200">
                <div>
                  <p className="text-sm font-semibold text-text-main">
                    <span className="text-accent-primary cursor-pointer hover:underline" onClick={() => jumpToWorker(p.resolvedBy)}>{p.resolvedBy || 'System'}</span> clinically resolved a case from {p.village}
                  </p>
                  <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest">{new Date(p.resolvedAt).toLocaleString()}</p>
                </div>
                <button onClick={() => jumpToScreeningsVillage(p.village)} className="px-3 py-1.5 bg-surface-1 border border-border-primary/50 text-[10px] font-bold text-text-muted rounded-md hover:text-text-main transition-colors uppercase tracking-widest">
                  View Screenings
                </button>
              </div>
            ))}
            
            <div className="flex items-center justify-between p-4 rounded-xl border border-border-primary/30 bg-surface-2/30 hover:bg-surface-2/50 transition-colors duration-200">
              <div>
                <p className="text-sm font-semibold text-text-main">
                  <span className="text-accent-primary cursor-pointer hover:underline" onClick={() => jumpToWorker('ASHA Meena')}>ASHA Meena</span> synced 12 screenings from Kalladka
                </p>
                <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest">10 mins ago</p>
              </div>
              <button onClick={() => jumpToScreeningsVillage('Kalladka')} className="px-3 py-1.5 bg-surface-1 border border-border-primary/50 text-[10px] font-bold text-text-muted rounded-md hover:text-text-main transition-colors uppercase tracking-widest">
                View Screenings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {selectedUser && <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      {userToUpdate && <UserUpdateModal user={userToUpdate} onClose={() => setUserToUpdate(null)} onSave={handleSaveUpdate} />}
      {isAddModalOpen && <AddPersonnelModal onClose={() => setIsAddModalOpen(false)} onSave={handleAddPersonnel} existingUsers={safeUsers} />}
      {selectedPHC && <PHCModal phc={selectedPHC} onClose={() => setSelectedPHC(null)} />}
      {selectedPatient && <PatientModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} isAdmin={true} />}
      
      {/* CONFIRMATION MODAL FOR REMOVAL */}
      {userToRemove && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-1 border border-status-red/50 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-border-primary/50 bg-status-red/5">
              <h2 className="text-lg font-bold tracking-tight text-status-red">Remove Personnel Record?</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-text-main leading-relaxed font-medium">
                This action should only be used for duplicate or incorrect records. Are you sure you want to remove <span className="font-bold text-accent-primary">{userToRemove.name}</span>?
              </p>
            </div>
            <div className="px-5 py-3 border-t border-border-primary/30 bg-surface-2/30 flex items-center justify-end gap-2 mt-auto">
              <button onClick={() => setUserToRemove(null)} className="inline-flex items-center justify-center rounded-lg border border-border-primary/50 bg-surface-2 px-3.5 py-2 text-xs font-medium text-text-muted transition duration-200 hover:bg-surface-3 hover:text-text-primary">
                Cancel
              </button>
              <button onClick={handleRemoveConfirm} className="inline-flex items-center justify-center rounded-lg border border-status-red/30 bg-status-red/10 px-3.5 py-2 text-xs font-semibold text-status-red transition duration-200 hover:bg-status-red/20">
                Remove Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR RESTRICT */}
      {userToRestrict && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-1 border border-status-red/50 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-border-primary/50 bg-status-red/5">
              <h2 className="text-lg font-bold tracking-tight text-status-red">Restrict Personnel Access?</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-text-main leading-relaxed font-medium">
                This will temporarily block system access for <span className="font-bold text-accent-primary">{userToRestrict.name}</span>. The record will remain in the system.
              </p>
            </div>
            <div className="px-5 py-3 border-t border-border-primary/30 bg-surface-2/30 flex items-center justify-end gap-2 mt-auto">
              <button onClick={() => setUserToRestrict(null)} className="inline-flex items-center justify-center rounded-lg border border-border-primary/50 bg-surface-2 px-3.5 py-2 text-xs font-medium text-text-muted transition duration-200 hover:bg-surface-3 hover:text-text-primary">
                Cancel
              </button>
              <button onClick={handleRestrictConfirm} className="inline-flex items-center justify-center rounded-lg border border-status-red/30 bg-status-red/10 px-3.5 py-2 text-xs font-semibold text-status-red transition duration-200 hover:bg-status-red/20">
                Restrict Access
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CONFIRMATION MODAL FOR STATUS CHANGE */}
      {userToChangeStatus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-1 border border-border-primary/50 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-border-primary/50 bg-surface-2/30">
              <h2 className="text-lg font-bold tracking-tight text-text-main">Change Personnel Status?</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-text-main leading-relaxed font-medium">
                Are you sure you want to change the status of <span className="font-bold text-accent-primary">{userToChangeStatus.user?.name}</span> to <span className="font-bold">{userToChangeStatus.newStatus}</span>?
              </p>
            </div>
            <div className="px-5 py-3 border-t border-border-primary/30 bg-surface-2/30 flex items-center justify-end gap-2 mt-auto">
              <button onClick={() => setUserToChangeStatus(null)} className="inline-flex items-center justify-center rounded-lg border border-border-primary/50 bg-surface-2 px-3.5 py-2 text-xs font-medium text-text-muted transition duration-200 hover:bg-surface-3 hover:text-text-primary">
                Cancel
              </button>
              <button onClick={handleStatusChangeConfirm} className="inline-flex items-center justify-center rounded-lg bg-accent-primary px-3.5 py-2 text-xs font-semibold text-white transition duration-200 hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent-primary/30 disabled:cursor-not-allowed disabled:opacity-50">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
