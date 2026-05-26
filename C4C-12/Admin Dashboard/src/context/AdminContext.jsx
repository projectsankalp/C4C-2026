/**
 * GraamSehat Admin Dashboard - Admin Context Provider
 * Location: /src/context/AdminContext.jsx
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth, db, logAdminActivity } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, query, where, getDocs, getDoc } from 'firebase/firestore';
import { logoutAdmin } from '../firebase/auth';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Real-time states
  const [patients, setPatients] = useState([]);
  const [ashaWorkers, setAshaWorkers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [screenings, setScreenings] = useState([]);
  
  // Map caching states
  const [mapData, setMapData] = useState(null);
  const [lastMapUpdate, setLastMapUpdate] = useState(null);
  
  // Notifications/Alerts
  const [notifications, setNotifications] = useState([]);
  const prevPatientsRef = useRef([]);

  // Inactivity timeout (8 hours)
  const INACTIVITY_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours in ms
  const timerRef = useRef(null);

  const resetInactivityTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(async () => {
      if (auth.currentUser) {
        console.log('Session timeout due to inactivity. Signing out.');
        alert('Your session has expired due to 8 hours of inactivity.');
        await logoutAdmin();
      }
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    // Add activity listeners for inactivity timeout
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => resetInactivityTimer();
    
    events.forEach(event => window.addEventListener(event, handleActivity));
    resetInactivityTimer(); // init timer
    
    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentAdmin]);

  // Auth observer
  useEffect(() => {
    const cachedAdmin = localStorage.getItem('graamsehat_admin_session');
    if (cachedAdmin) {
      try {
        setCurrentAdmin(JSON.parse(cachedAdmin));
        setLoading(false);
      } catch (e) {
        console.error("Failed to parse cached admin session", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            const adminData = {
              uid: user.uid,
              email: user.email,
              ...userDoc.data()
            };
            localStorage.setItem('graamsehat_admin_session', JSON.stringify(adminData));
            setCurrentAdmin(adminData);
          } else {
            setCurrentAdmin(null);
            localStorage.removeItem('graamsehat_admin_session');
          }
        } catch (error) {
          console.error('Error fetching admin profile:', error);
          if (!localStorage.getItem('graamsehat_admin_session')) {
            setCurrentAdmin(null);
          }
        }
      } else {
        if (!localStorage.getItem('graamsehat_admin_session')) {
          setCurrentAdmin(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore Listeners (only when admin is logged in)
  useEffect(() => {
    if (!currentAdmin) {
      setPatients([]);
      setAshaWorkers([]);
      setPendingApprovals([]);
      setScreenings([]);
      setNotifications([]);
      return;
    }

    // 1. Patients real-time listener
    const unsubscribePatients = onSnapshot(collection(db, 'patients'), (snapshot) => {
      const patientList = [];
      snapshot.forEach((doc) => {
        patientList.push({ id: doc.id, ...doc.data() });
      });
      
      // Look for newly added high-risk (red) patients to flash notification
      if (prevPatientsRef.current.length > 0) {
        patientList.forEach((patient) => {
          const wasPresent = prevPatientsRef.current.find(p => p.id === patient.id);
          // If newly registered, or risk changed to red
          const isRed = patient.riskLevel === 'red';
          const wasRed = wasPresent ? wasPresent.riskLevel === 'red' : false;
          
          if (isRed && (!wasPresent || !wasRed)) {
            const newNotif = {
              id: `${patient.id}_${Date.now()}`,
              message: `ALERT: High-risk patient registered/updated: ${patient.name} (${patient.district})`,
              patientId: patient.id,
              timestamp: new Date()
            };
            setNotifications(prev => [newNotif, ...prev]);
          }
        });
      }
      
      prevPatientsRef.current = patientList;
      setPatients(patientList);
    });

    // 2. Users (ASHA workers) real-time listener
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const workers = [];
      const pending = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.role === 'asha') {
          const workerObj = { id: doc.id, ...userData };
          if (userData.status === 'pending') {
            pending.push(workerObj);
          } else {
            workers.push(workerObj);
          }
        }
      });
      setAshaWorkers(workers);
      setPendingApprovals(pending);
    });

    // 3. Screenings real-time listener (recent history)
    const unsubscribeScreenings = onSnapshot(collection(db, 'screenings'), (snapshot) => {
      const screeningList = [];
      snapshot.forEach((doc) => {
        screeningList.push({ id: doc.id, ...doc.data() });
      });
      setScreenings(screeningList);
    });

    return () => {
      unsubscribePatients();
      unsubscribeUsers();
      unsubscribeScreenings();
    };
  }, [currentAdmin]);

  // Map Data grouping and caching function (every 5 minutes or manual)
  const calculateMapData = (patientList) => {
    const districtStats = {};

    patientList.forEach((patient) => {
      const dist = patient.district || 'Unknown';
      if (!districtStats[dist]) {
        districtStats[dist] = {
          district: dist,
          totalPatients: 0,
          riskBreakdown: { green: 0, yellow: 0, red: 0 },
          ashaWorkerIds: new Set(),
          screeningsCount: 0
        };
      }

      districtStats[dist].totalPatients += 1;
      
      // Risk breakdown
      const risk = (patient.riskLevel || 'green').toLowerCase();
      if (districtStats[dist].riskBreakdown[risk] !== undefined) {
        districtStats[dist].riskBreakdown[risk] += 1;
      } else {
        districtStats[dist].riskBreakdown.green += 1; // Fallback
      }

      if (patient.ashaWorkerId) {
        districtStats[dist].ashaWorkerIds.add(patient.ashaWorkerId);
      }
    });

    // Format for consumption
    const formatted = Object.values(districtStats).map((data) => {
      const { green, yellow, red } = data.riskBreakdown;
      
      // Dominant risk level:
      // Red overrides all
      // Yellow if no red but yellow present
      // Green if mostly green and no red
      let dominantRisk = 'green';
      if (red > 0) {
        dominantRisk = 'red';
      } else if (yellow > 0) {
        dominantRisk = 'yellow';
      }

      return {
        ...data,
        dominantRisk,
        ashaWorkersCount: data.ashaWorkerIds.size,
        ashaWorkerIds: Array.from(data.ashaWorkerIds)
      };
    });

    return formatted;
  };

  const getCachedMapData = (forceRefresh = false) => {
    const now = Date.now();
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes in ms
    
    if (forceRefresh || !mapData || !lastMapUpdate || (now - lastMapUpdate > cacheExpiry)) {
      const computed = calculateMapData(patients);
      setMapData(computed);
      setLastMapUpdate(now);
      return computed;
    }
    
    return mapData;
  };

  // Re-run map aggregation automatically if patients change but cache expired
  useEffect(() => {
    if (patients.length > 0) {
      const now = Date.now();
      const cacheExpiry = 5 * 60 * 1000;
      if (!mapData || !lastMapUpdate || (now - lastMapUpdate > cacheExpiry)) {
        const computed = calculateMapData(patients);
        setMapData(computed);
        setLastMapUpdate(now);
      }
    }
  }, [patients]);

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const value = {
    currentAdmin,
    setCurrentAdmin,
    loading,
    patients,
    ashaWorkers,
    pendingApprovals,
    screenings,
    mapData: mapData || [],
    getCachedMapData,
    notifications,
    clearNotification,
    logAdminAction: async (action, details) => {
      if (currentAdmin) {
        await logAdminActivity(currentAdmin.uid, action, details);
      }
    }
  };

  return (
    <AdminContext.Provider value={value}>
      {!loading && children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
