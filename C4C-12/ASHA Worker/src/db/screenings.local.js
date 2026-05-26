/**
 * GraamSehat ASHA Worker App - Screening Local DB CRUD
 * Path: /src/db/screenings.local.js
 * Handles operations on the local IndexedDB 'screenings' table.
 */

import { db } from "./localDB";
import { addToSyncQueue } from "./pendingSync.local";

/**
 * Saves a new screening record locally.
 * Pushes to sync queue for Firestore.
 * @param {object} screeningData - Screening fields: uid, date, idrsScore, bpSystolic, bpDiastolic, glucoseLevel, riskLevel, overallRisk, doctorsNote, symptoms, ashaWorkerId
 * @returns {Promise<object>} Created screening record
 */
export async function createLocalScreening(screeningData) {
  const screeningRecord = {
    uid: screeningData.uid,
    date: screeningData.date || Date.now(),
    idrsScore: parseInt(screeningData.idrsScore, 10),
    bpSystolic: screeningData.bpSystolic ? parseInt(screeningData.bpSystolic, 10) : null,
    bpDiastolic: screeningData.bpDiastolic ? parseInt(screeningData.bpDiastolic, 10) : null,
    glucoseLevel: screeningData.glucoseLevel ? parseInt(screeningData.glucoseLevel, 10) : null,
    riskLevel: screeningData.riskLevel, // low, moderate, high, very high
    overallRisk: screeningData.overallRisk, // green, yellow, red
    doctorsNote: screeningData.doctorsNote || "",
    symptoms: screeningData.symptoms || [], // Array of checked symptoms
    nextMeetupDate: screeningData.nextMeetupDate || null,
    ashaWorkerId: screeningData.ashaWorkerId || "unknown_asha",
    syncStatus: "pending",
    firebaseDocId: null
  };

  try {
    const localId = await db.screenings.add(screeningRecord);
    // Queue for Firestore sync
    await addToSyncQueue("screenings", localId, "create", { ...screeningRecord, localId });
    return { ...screeningRecord, id: localId };
  } catch (error) {
    console.error("Failed to create local screening record", error);
    throw error;
  }
}

/**
 * Gets all screenings logged for a particular patient UID.
 * Sorted by date descending (newest first).
 * @param {string} uid - Patient UID
 * @returns {Promise<Array>} List of screening records
 */
export async function getLocalScreeningsForPatient(uid) {
  if (!uid) return [];
  const cleanUid = uid.replace(/-/g, "").trim();
  
  const screenings = await db.screenings
    .filter(s => s.uid.replace(/-/g, "") === cleanUid)
    .toArray();
    
  // Sort descending by date
  return screenings.sort((a, b) => b.date - a.date);
}

/**
 * Gets all screening records from local DB.
 * @returns {Promise<Array>} All screening records
 */
export async function listAllScreenings() {
  return db.screenings.toArray();
}
