/**
 * src/context/PatientContext.jsx
 * State management for active patient, history, family accounts, medicines, and offline synchronization.
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../db/localDB';
import { checkPatientUID, logUnregisteredRequest } from '../firebase/auth';
import { fetchPatientScreenings, fetchFamilyMembers, fetchEducationArticles, addFamilyLink, fetchPatientMedicines } from '../firebase/patients';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db as firestoreDB, isFirebaseMock } from '../firebase/config';
import { LanguageContext } from './LanguageContext';

export const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const { lang, t } = useContext(LanguageContext);
  
  const [activePatient, setActivePatient] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [streak, setStreak] = useState(0);

  // ═══════════════════════════════════
  // OFFLINE / ONLINE DETECTOR
  // ═══════════════════════════════════
  useEffect(() => {
    const handleOnline = () => {
      setOffline(false);
      syncQueueData();
    };
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ═══════════════════════════════════
  // INITIALIZE SESSION
  // ═══════════════════════════════════
  useEffect(() => {
    initializeSession();
  }, []);

  // Update streak whenever active patient changes
  useEffect(() => {
    if (activePatient) {
      const savedStreak = localStorage.getItem(`streak_${activePatient.uid}`);
      setStreak(savedStreak ? parseInt(savedStreak, 10) : 0);
    }
  }, [activePatient]);

  const initializeSession = async () => {
    setLoading(true);
    try {
      const savedUid = localStorage.getItem('graamsehat_uid');
      if (savedUid) {
        // Load from Dexie first (offline-first capability!)
        const localPat = await db.patients.get(savedUid);
        if (localPat) {
          setActivePatient(localPat);
          
          // Load local history & medicines
          const localScr = await db.screenings.where('uid').equals(savedUid).toArray();
          setScreenings(localScr.sort((a, b) => new Date(b.date) - new Date(a.date)));

          const localMeds = await db.medicines.where('uid').equals(savedUid).toArray();
          setMedicines(localMeds);

          const localFam = await db.familyLinks.where('primaryUID').equals(savedUid).toArray();
          setFamilyMembers(localFam);

          // In background, if online, update caches from Firestore
          if (navigator.onLine) {
            updatePatientCache(savedUid);
          }
        } else {
          // If no local record but UID exists, attempt online fetch
          if (navigator.onLine) {
            const serverPat = await checkPatientUID(savedUid);
            if (serverPat) {
              await cachePatientLocal(serverPat);
              setActivePatient(serverPat);
              await updatePatientCache(savedUid);
            } else {
              // UID no longer valid
              localStorage.removeItem('graamsehat_uid');
            }
          }
        }
      }
    } catch (err) {
      console.error('Session initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Caches a patient's core record locally in Dexie.
   */
  const cachePatientLocal = async (patient) => {
    await db.patients.put({
      uid: patient.uid,
      name: patient.name,
      phone: patient.phone,
      village: patient.village,
      district: patient.district,
      riskLevel: patient.riskLevel || 'GREEN',
      bloodGroup: patient.bloodGroup || 'N/A',
      lastScreeningDate: patient.lastScreeningDate || '',
      nextScreeningDate: patient.nextScreeningDate || '',
      bpSystolic: patient.bpSystolic || 120,
      bpDiastolic: patient.bpDiastolic || 80,
      glucoseLevel: patient.glucoseLevel || 100,
      idrsScore: patient.idrsScore || 0,
      ashaWorkerName: patient.ashaWorkerName || 'N/A',
      ashaWorkerPhone: patient.ashaWorkerPhone || '',
      doctorsNote: patient.doctorsNote || { en: '' }
    });
  };

  /**
   * Refetches and updates local DB cache from Firestore for the given patient UID.
   */
  const updatePatientCache = async (uid) => {
    try {
      const serverPat = await checkPatientUID(uid);
      if (serverPat) {
        // Fetch Screenings
        const serverScr = await fetchPatientScreenings(uid);
        await db.screenings.where('uid').equals(uid).delete();
        for (const scr of serverScr) {
          await db.screenings.add({ uid, ...scr });
        }

        // Fetch Medicines
        const serverMeds = await fetchPatientMedicines(uid);
        await db.medicines.where('uid').equals(uid).delete();
        for (const med of serverMeds) {
          await db.medicines.add({
            uid,
            id: med.id,
            name: med.name || med.medicineName || '',
            dose: med.dose || '',
            frequency: med.frequency || 'Daily',
            quantity: med.quantity || 0,
            distributedAt: med.distributedAt || '',
            nextDueDate: med.nextDueDate || ''
          });
        }

        // Determine the latest screening to update patient summary fields
        const latestScr = serverScr.length > 0
          ? [...serverScr].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
          : null;

        if (latestScr) {
          serverPat.riskLevel = latestScr.overallRisk || latestScr.riskLevel || serverPat.riskLevel;
          serverPat.lastScreeningDate = latestScr.date ? latestScr.date.split('T')[0] : serverPat.lastScreeningDate;
          serverPat.bpSystolic = latestScr.bpSystolic !== undefined ? latestScr.bpSystolic : serverPat.bpSystolic;
          serverPat.bpDiastolic = latestScr.bpDiastolic !== undefined ? latestScr.bpDiastolic : serverPat.bpDiastolic;
          serverPat.glucoseLevel = latestScr.glucoseLevel !== undefined ? latestScr.glucoseLevel : serverPat.glucoseLevel;
          serverPat.idrsScore = latestScr.idrsScore !== undefined ? latestScr.idrsScore : serverPat.idrsScore;
          if (latestScr.nextApptDate) {
            serverPat.nextScreeningDate = latestScr.nextApptDate;
          }
          if (latestScr.doctorsNote) {
            if (typeof latestScr.doctorsNote === 'string') {
              serverPat.doctorsNote = {
                en: latestScr.doctorsNote,
                kn: latestScr.doctorsNote,
                hi: latestScr.doctorsNote,
                ta: latestScr.doctorsNote,
                te: latestScr.doctorsNote
              };
            } else if (typeof latestScr.doctorsNote === 'object') {
              if (latestScr.doctorsNote.explanation) {
                serverPat.doctorsNote = {
                  en: latestScr.doctorsNote.explanation,
                  kn: latestScr.doctorsNote.explanation,
                  hi: latestScr.doctorsNote.explanation,
                  ta: latestScr.doctorsNote.explanation,
                  te: latestScr.doctorsNote.explanation
                };
              } else {
                serverPat.doctorsNote = latestScr.doctorsNote;
              }
            }
          }
        }

        await cachePatientLocal(serverPat);

        // Fetch Family Links
        const serverFam = await fetchFamilyMembers(uid);
        await db.familyLinks.where('primaryUID').equals(uid).delete();
        for (const fam of serverFam) {
          await db.familyLinks.add({ primaryUID: uid, ...fam });
        }

        // Refresh React States if active patient matches
        if (localStorage.getItem('graamsehat_uid') === uid) {
          const freshPat = await db.patients.get(uid);
          setActivePatient(freshPat);
          
          const freshScr = await db.screenings.where('uid').equals(uid).toArray();
          setScreenings(freshScr.sort((a, b) => new Date(b.date) - new Date(a.date)));

          const freshMeds = await db.medicines.where('uid').equals(uid).toArray();
          setMedicines(freshMeds);

          const freshFam = await db.familyLinks.where('primaryUID').equals(uid).toArray();
          setFamilyMembers(freshFam);
        }
      }
    } catch (err) {
      console.error('Failed to sync/update local database cache:', err);
    }
  };

  /**
   * Logs in a patient, caches their details, and redirects to Dashboard.
   */
  const handleLogin = async (patient) => {
    setLoading(true);
    try {
      localStorage.setItem('graamsehat_uid', patient.uid);
      await cachePatientLocal(patient);
      setActivePatient(patient);
      await updatePatientCache(patient.uid);
    } catch (err) {
      console.error('Login cache error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clears patient data and logs out.
   */
  const handleLogout = async () => {
    setLoading(true);
    try {
      const currentUid = localStorage.getItem('graamsehat_uid');
      if (currentUid) {
        localStorage.removeItem('graamsehat_uid');
        localStorage.removeItem(`streak_${currentUid}`);
        localStorage.removeItem(`last_taken_${currentUid}`);
        
        // Clear local DB records
        await db.patients.where('uid').equals(currentUid).delete();
        await db.screenings.where('uid').equals(currentUid).delete();
        await db.medicines.where('uid').equals(currentUid).delete();
        await db.familyLinks.where('primaryUID').equals(currentUid).delete();
      }
      setActivePatient(null);
      setScreenings([]);
      setMedicines([]);
      setFamilyMembers([]);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Switch the active patient profile to a family member.
   */
  const switchProfile = async (memberUID) => {
    setLoading(true);
    try {
      const member = await db.patients.get(memberUID);
      if (member) {
        localStorage.setItem('graamsehat_uid', memberUID);
        setActivePatient(member);

        // Load local records for this switched user
        const localScr = await db.screenings.where('uid').equals(memberUID).toArray();
        setScreenings(localScr.sort((a, b) => new Date(b.date) - new Date(a.date)));

        const localMeds = await db.medicines.where('uid').equals(memberUID).toArray();
        setMedicines(localMeds);

        const localFam = await db.familyLinks.where('primaryUID').equals(memberUID).toArray();
        setFamilyMembers(localFam);

        // Background update if online
        if (navigator.onLine) {
          updatePatientCache(memberUID);
        }
      } else {
        // Fetch from server if online
        if (navigator.onLine) {
          const serverPat = await checkPatientUID(memberUID);
          if (serverPat) {
            localStorage.setItem('graamsehat_uid', memberUID);
            await cachePatientLocal(serverPat);
            setActivePatient(serverPat);
            await updatePatientCache(memberUID);
          }
        }
      }
    } catch (err) {
      console.error('Failed to switch family profile:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Links a family member UID to this phone.
   */
  const linkFamily = async (memberUID, relation) => {
    if (!activePatient) return false;
    
    // Add link in Firestore / Mock
    const success = await addFamilyLink(activePatient.uid, memberUID, relation);
    if (success) {
      // Recache family links
      await updatePatientCache(activePatient.uid);
      // Cache this family member's details locally too
      const serverMember = await checkPatientUID(memberUID);
      if (serverMember) {
        await cachePatientLocal(serverMember);
      }
      return true;
    }
    return false;
  };

  /**
   * Marks a medicine as taken today, updates local streak, logs to DB, and syncs if online.
   */
  const markMedicineTaken = async (medicineId) => {
    if (!activePatient) return;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const uid = activePatient.uid;

    // Check if already taken today
    const exists = await db.medicineLogs
      .where({ uid, medicineId, takenDate: todayStr })
      .first();

    if (exists) return; // Already logged today

    // Add to local DB log
    await db.medicineLogs.add({
      uid,
      medicineId,
      takenDate: todayStr,
      takenAt: new Date().toISOString(),
      synced: 0
    });

    // Update streak counter
    const lastTakenStr = localStorage.getItem(`last_taken_${uid}`);
    let newStreak = streak;
    if (!lastTakenStr) {
      newStreak = 1;
    } else {
      const lastTakenDate = new Date(lastTakenStr);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate - lastTakenDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1; // Streak broken
      }
    }

    localStorage.setItem(`last_taken_${uid}`, todayStr);
    localStorage.setItem(`streak_${uid}`, newStreak.toString());
    setStreak(newStreak);

    // Schedule notification alert reminder
    scheduleNotificationAlert();

    // Push taken log to Firestore / add to offline syncQueue
    const logData = {
      uid,
      medicineId,
      takenDate: todayStr,
      takenAt: new Date().toISOString()
    };

    if (navigator.onLine && !isFirebaseMock) {
      try {
        await addDoc(collection(firestoreDB, 'patients', uid, 'medicineLogs'), {
          ...logData,
          serverTimestamp: serverTimestamp()
        });
        // Mark as synced in local DB
        await db.medicineLogs
          .where({ uid, medicineId, takenDate: todayStr })
          .modify({ synced: 1 });
      } catch (err) {
        console.error('Failed to sync medicine log directly, queuing:', err);
        await db.syncQueue.add({
          table: 'medicineLogs',
          operation: 'ADD',
          data: logData,
          addedAt: new Date().toISOString()
        });
      }
    } else {
      console.log('[Offline] Medicine log queued for synchronization:', logData);
      await db.syncQueue.add({
        table: 'medicineLogs',
        operation: 'ADD',
        data: logData,
        addedAt: new Date().toISOString()
      });
    }
  };

  /**
   * Synchronizes queued offline sync logs with Firestore when online.
   */
  const syncQueueData = async () => {
    if (isFirebaseMock) return;

    try {
      const queue = await db.syncQueue.toArray();
      if (queue.length === 0) return;

      console.log(`[Sync Manager] Processing ${queue.length} offline operations...`);

      for (const item of queue) {
        if (item.table === 'medicineLogs') {
          try {
            await addDoc(collection(firestoreDB, 'patients', item.data.uid, 'medicineLogs'), {
              ...item.data,
              serverTimestamp: serverTimestamp()
            });

            // Mark synced locally
            await db.medicineLogs
              .where({ uid: item.data.uid, medicineId: item.data.medicineId, takenDate: item.data.takenDate })
              .modify({ synced: 1 });

            // Remove from queue
            await db.syncQueue.delete(item.id);
          } catch (err) {
            console.error('Sync failed for queue item, keeping in queue:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error synchronizing queue:', err);
    }
  };

  /**
   * Request Notifications Permission and schedule a reminder.
   */
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return false;
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      scheduleNotificationAlert();
      return true;
    }
    return false;
  };

  const scheduleNotificationAlert = () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    // Simulate simple reminder scheduling by triggering a test reminder
    console.log('[Notification API] Reminder alert registered for medicines.');
  };

  return (
    <PatientContext.Provider
      value={{
        activePatient,
        screenings,
        medicines,
        familyMembers,
        loading,
        offline,
        streak,
        login: handleLogin,
        logout: handleLogout,
        switchProfile,
        linkFamily,
        markMedicineTaken,
        requestNotificationPermission,
        syncLocalData: syncQueueData
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};
