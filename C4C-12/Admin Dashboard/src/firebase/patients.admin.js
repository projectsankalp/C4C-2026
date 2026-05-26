/**
 * GraamSehat Admin Dashboard - Admin Patients Service
 * Location: /src/firebase/patients.admin.js
 */

import { db, logAdminActivity } from './config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  limit
} from 'firebase/firestore';

/**
 * Fetches all patients ordered by creation date desc.
 * @returns {Promise<Array>}
 */
export const getAllPatients = async () => {
  try {
    const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const patients = [];
    querySnapshot.forEach((doc) => {
      patients.push({ id: doc.id, ...doc.data() });
    });
    return patients;
  } catch (error) {
    console.error('Error fetching all patients:', error);
    throw error;
  }
};

/**
 * Fetches a single patient by ID.
 * @param {string} patientId 
 * @returns {Promise<object>}
 */
export const getPatientById = async (patientId) => {
  try {
    const docRef = doc(db, 'patients', patientId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Patient not found');
    }
  } catch (error) {
    console.error('Error fetching patient:', error);
    throw error;
  }
};

/**
 * Updates admin-only notes for a patient.
 * @param {string} adminId 
 * @param {string} patientId 
 * @param {string} notes 
 * @param {string} patientName 
 */
export const updatePatientNotes = async (adminId, patientId, notes, patientName) => {
  try {
    const docRef = doc(db, 'patients', patientId);
    await updateDoc(docRef, { notes });
    
    // Log admin action
    await logAdminActivity(adminId, 'UPDATE_PATIENT_NOTES', {
      patientId,
      patientName,
      notesSnippet: notes ? notes.substring(0, 100) : ''
    });
  } catch (error) {
    console.error('Error updating patient notes:', error);
    throw error;
  }
};

/**
 * Special Admin-only Lost & Found lookup.
 * Searches by partial name (case prefix), village, or UID prefix without OTP.
 * Logs search query and results to `lostFoundLog`.
 * @param {string} adminId 
 * @param {string} searchQuery 
 * @returns {Promise<Array>}
 */
export const searchLostFound = async (adminId, searchQuery) => {
  try {
    if (!searchQuery) return [];
    
    const patientsRef = collection(db, 'patients');
    const resultsMap = new Map();
    
    // Normalize query text for case-insensitive start matches
    const term = searchQuery.trim();
    const termCapitalized = term.charAt(0).toUpperCase() + term.slice(1);
    const termUpper = term.toUpperCase();
    const termLower = term.toLowerCase();

    // Queries to run in parallel
    const searchPromises = [];

    const addQueryPromises = (searchField, searchVal) => {
      searchPromises.push(
        getDocs(query(
          patientsRef,
          where(searchField, '>=', searchVal),
          where(searchField, '<=', searchVal + '\uf8ff'),
          limit(20)
        ))
      );
    };

    // 1. Search by Name (various cases)
    addQueryPromises('name', term);
    addQueryPromises('name', termCapitalized);
    addQueryPromises('name', termLower);
    addQueryPromises('name', termUpper);

    // 2. Search by Village (various cases)
    addQueryPromises('village', term);
    addQueryPromises('village', termCapitalized);

    // 3. Search by UID prefix
    addQueryPromises('uid', term);
    addQueryPromises('uid', termUpper);

    // Resolve all queries
    const snapshots = await Promise.all(searchPromises);
    
    snapshots.forEach((snap) => {
      snap.forEach((doc) => {
        resultsMap.set(doc.id, { id: doc.id, ...doc.data() });
      });
    });

    const results = Array.from(resultsMap.values()).slice(0, 20);

    // Log the search to Firestore lostFoundLog/{autoId}
    await addDoc(collection(db, 'lostFoundLog'), {
      searchedBy: adminId,
      searchQuery,
      resultsCount: results.length,
      timestamp: serverTimestamp(),
      ip: '' // Leave blank as requested
    });

    // Also log to general admin activity
    await logAdminActivity(adminId, 'LOST_FOUND_LOOKUP', {
      searchQuery,
      resultsCount: results.length
    });

    return results;
  } catch (error) {
    console.error('Error running lost & found search:', error);
    throw error;
  }
};
