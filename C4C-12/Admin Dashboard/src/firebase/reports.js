/**
 * GraamSehat Admin Dashboard - Reports & Aggregations Service
 * Location: /src/firebase/reports.js
 */

import { db } from './config';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy
} from 'firebase/firestore';

/**
 * Fetches data for Report 1: Screening Summary Report.
 * Filters: date range, district, ASHA worker.
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @param {string} district 
 * @param {string} ashaWorkerId 
 * @returns {Promise<Array>}
 */
export const getScreeningSummaryReportData = async (startDate, endDate, district, ashaWorkerId) => {
  try {
    // We will query the screenings collection
    const screeningsRef = collection(db, 'screenings');
    let q = query(screeningsRef);
    
    // We will apply filters on client side or Firestore side depending on indexes.
    // Client-side filtering is extremely reliable and prevents index-required crashes.
    const querySnapshot = await getDocs(q);
    const results = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const screeningDate = data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)) : null;
      
      let matches = true;
      
      if (screeningDate) {
        if (startDate && screeningDate < startDate) matches = false;
        if (endDate && screeningDate > endDate) matches = false;
      } else {
        if (startDate || endDate) matches = false; // Exclude if no date but date filter active
      }
      
      if (district && data.district !== district) matches = false;
      if (ashaWorkerId && data.ashaWorkerId !== ashaWorkerId) matches = false;
      
      if (matches) {
        results.push({
          id: doc.id,
          ...data,
          formattedDate: screeningDate ? screeningDate.toLocaleDateString('en-IN') : 'N/A'
        });
      }
    });
    
    return results;
  } catch (error) {
    console.error('Error fetching screening summary report data:', error);
    // Fallback: If screenings collection doesn't exist or errors, aggregate from patients screenings history
    return [];
  }
};

/**
 * Fetches data for Report 2: High-Risk Patient Report.
 * All patients with riskLevel === 'red' or 'high' sorted by last screened date.
 * @returns {Promise<Array>}
 */
export const getHighRiskPatientReportData = async () => {
  try {
    const patientsRef = collection(db, 'patients');
    const q = query(patientsRef, where('riskLevel', 'in', ['red', 'high', 'RED', 'HIGH']));
    const querySnapshot = await getDocs(q);
    const results = [];
    
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort client-side by lastScreened date descending
    results.sort((a, b) => {
      const dateA = a.lastScreened ? (a.lastScreened.toDate ? a.lastScreened.toDate() : new Date(a.lastScreened)) : 0;
      const dateB = b.lastScreened ? (b.lastScreened.toDate ? b.lastScreened.toDate() : new Date(b.lastScreened)) : 0;
      return dateB - dateA;
    });
    
    return results;
  } catch (error) {
    console.error('Error fetching high risk patient report data:', error);
    throw error;
  }
};

/**
 * Fetches data for Report 3: ASHA Worker Activity Report.
 * Screenings per ASHA worker per month.
 * @returns {Promise<Array>}
 */
export const getASHAActivityReportData = async () => {
  try {
    // Fetch all ASHA workers to match profiles
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(query(usersRef, where('role', '==', 'asha')));
    const ashaMap = new Map();
    usersSnap.forEach((doc) => {
      ashaMap.set(doc.id, { id: doc.id, name: doc.data().name, district: doc.data().district });
    });
    
    // Fetch screenings to aggregate monthly counts
    const screeningsSnap = await getDocs(collection(db, 'screenings'));
    const aggregations = {}; // key: ashaId_year_month
    
    screeningsSnap.forEach((doc) => {
      const data = doc.data();
      const ashaId = data.ashaWorkerId;
      if (!ashaId || !ashaMap.has(ashaId)) return;
      
      const date = data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)) : null;
      if (!date) return;
      
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'short' });
      const key = `${ashaId}_${year}_${month}`;
      
      if (!aggregations[key]) {
        aggregations[key] = {
          ashaId,
          ashaName: ashaMap.get(ashaId).name,
          district: ashaMap.get(ashaId).district,
          year,
          month,
          screeningsCount: 0
        };
      }
      aggregations[key].screeningsCount += 1;
    });
    
    return Object.values(aggregations);
  } catch (error) {
    console.error('Error compiling ASHA activity report:', error);
    return [];
  }
};

/**
 * Fetches data for Report 4: Medicine Distribution Report.
 * What was distributed, by whom, to how many patients.
 * @returns {Promise<Array>}
 */
export const getMedicineDistributionReportData = async () => {
  try {
    const screeningsSnap = await getDocs(collection(db, 'screenings'));
    const distribution = [];
    
    screeningsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.medicinesDistributed && Object.keys(data.medicinesDistributed).length > 0) {
        const date = data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)) : null;
        
        distribution.push({
          id: doc.id,
          ashaName: data.ashaName || 'ASHA Worker',
          district: data.district || 'N/A',
          patientName: data.patientName || 'Patient',
          date: date ? date.toLocaleDateString('en-IN') : 'N/A',
          medicines: data.medicinesDistributed // e.g., { Metformin: 10, Amlodipine: 5 }
        });
      }
    });
    
    return distribution;
  } catch (error) {
    console.error('Error fetching medicine distribution report:', error);
    return [];
  }
};
