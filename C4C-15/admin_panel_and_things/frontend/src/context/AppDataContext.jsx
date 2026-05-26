import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPatients, updatePatientStatus as apiUpdatePatientStatus, updatePatientClinicalDetails as apiUpdatePatientClinicalDetails, resolvePatient as apiResolvePatient, createFollowUp as apiCreateFollowUp } from '../services/patientService';
import { getUsers, addUser as apiAddUser, changeUserStatus as apiChangeUserStatus, updatePersonnel as apiUpdatePersonnel, removePersonnel as apiRemovePersonnel } from '../services/userService';
import { getSystemStats, getAdminStats, getVillageRiskHeatmap as apiGetVillageRiskHeatmap, getNotifications, getPhcs } from '../services/systemService';
import { getDoctorWorkspaceFeed } from '../services/liveFeedService';

/* eslint-disable react-refresh/only-export-components */
const AppDataContext = createContext();

export function AppDataProvider({ children }) {
  const [patients, setPatients] = useState([]);
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [doctorStats, setDoctorStats] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userStr = localStorage.getItem('asha_plus_user');
      const user = userStr ? JSON.parse(userStr) : null;
      const role = user?.role?.toUpperCase?.();

      let patientsData = [], usersData = [], sysStats = null, admStats = null, heatmap = [], docStats = null;

      if (role === 'DOCTOR') {
        const result = await getDoctorWorkspaceFeed();
        patientsData = Array.isArray(result?.patients) ? result.patients : [];
        docStats = result?.doctorStats || null;
      } else if (role === 'ADMIN') {
        const results = await Promise.allSettled([
          getAdminStats(),
          getSystemStats(),
          getUsers(),
          getPhcs(),
          getPatients(),
          apiGetVillageRiskHeatmap(),
          getNotifications(),
        ]);

        admStats = results[0].status === 'fulfilled' ? results[0].value : null;
        sysStats = results[1].status === 'fulfilled' ? results[1].value : null;
        usersData = results[2].status === 'fulfilled' ? results[2].value : [];
        // phcs are not currently stored in context but loaded.
        patientsData = results[4].status === 'fulfilled' ? results[4].value : [];
        heatmap = results[5].status === 'fulfilled' ? results[5].value : [];

        if (results.every(r => r.status === 'rejected')) {
          throw new Error('Failed to fetch operations data');
        }
      }

      setPatients(patientsData);
      setUsers(usersData);
      setSystemStats(sysStats);
      setAdminStats(admStats);
      setDoctorStats(docStats);
      setHeatmapData(heatmap);
    } catch (err) {
      setError(err.message || 'Failed to fetch operations data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let refreshTimer = null;

    queueMicrotask(() => {
      void fetchAllData();
    });

    const userStr = localStorage.getItem('asha_plus_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const role = user?.role?.toUpperCase?.();

    if (role === 'DOCTOR') {
      refreshTimer = window.setInterval(() => {
        void fetchAllData();
      }, 15000);
    }

    return () => {
      if (refreshTimer) {
        window.clearInterval(refreshTimer);
      }
    };
  }, [fetchAllData]);
  
  const updatePatientStatus = async (id, newStatus) => {
    try {
      setPatients(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      await apiUpdatePatientStatus(id, newStatus);
    } catch {
      fetchAllData();
      alert('Failed to update patient status');
    }
  };

  const updatePatientClinicalDetails = async (id, details) => {
    try {
      setPatients(prev => prev.map(p => p.id === id ? { ...p, ...details } : p));
      await apiUpdatePatientClinicalDetails(id, details);
    } catch {
      fetchAllData();
      alert('Failed to update clinical details');
    }
  };

  const resolvePatient = async (id, details) => {
    try {
      const userStr = localStorage.getItem('asha_plus_user');
      const user = userStr ? JSON.parse(userStr) : { name: 'System' };
      const resolvedAt = new Date().toISOString();

      setPatients(prev => prev.map(p => p.id === id ? { ...p, ...details, status: 'RESOLVED', resolvedAt, resolvedBy: user.name } : p));
      await apiResolvePatient(id, details);
    } catch {
      fetchAllData();
      alert('Failed to resolve patient');
    }
  };

  const createFollowUp = async (id) => {
    try {
      setPatients(prev => prev.map(p => p.id === id ? { ...p, status: 'FOLLOW_UP' } : p));
      await apiCreateFollowUp(id);
    } catch {
      fetchAllData();
      alert('Failed to create follow-up');
    }
  };

  const addUser = async (user) => {
    try {
      setUsers(prev => [...prev, user]);
      await apiAddUser(user);
    } catch {
      fetchAllData();
      alert('Failed to create user');
    }
  };
  
  const changeUserStatus = async (id, status) => {
    try {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
      await apiChangeUserStatus(id, status);
    } catch {
      fetchAllData();
      alert('Failed to change user status');
    }
  };

  const updatePersonnel = async (id, payload) => {
    try {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...payload } : u));
      await apiUpdatePersonnel(id, payload);
    } catch {
      fetchAllData();
      alert('Failed to update personnel');
    }
  };

  const removePersonnel = async (id) => {
    try {
      await apiRemovePersonnel(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error("Remove personnel failed:", err);
      throw err;
    }
  };
  
  return (
    <AppDataContext.Provider value={{
      patients,
      users,
      systemStats,
      adminStats,
      doctorStats,
      heatmapData,
      loading,
      error,
      refresh: fetchAllData,
      updatePatientStatus,
      updatePatientClinicalDetails,
      resolvePatient,
      createFollowUp,
      addUser,
      changeUserStatus,
      updatePersonnel,
      removePersonnel,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
