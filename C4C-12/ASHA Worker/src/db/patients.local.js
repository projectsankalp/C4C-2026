/**
 * GraamSehat ASHA Worker App - Patient Local DB CRUD
 * Path: /src/db/patients.local.js
 * Handles operations on the local IndexedDB 'patients' table, incorporating encryption
 * and sync queues.
 */

import { db, getNextSerial } from "./localDB";
import { generateUID } from "../utils/uidGenerator";
import { encryptAadhaar, decryptAadhaar } from "../utils/validators";
import { addToSyncQueue } from "./pendingSync.local";

/**
 * Creates a new patient record locally.
 * Generates an 8-digit Karnataka UID, encrypts Aadhaar, and pushes to sync queue.
 * @param {object} patientData - Patient fields: name, age, gender, village, district, phone, aadhaar, bloodGroup, photo, ashaWorkerId
 * @returns {Promise<object>} Created patient record
 */
export async function createLocalPatient(patientData) {
  const serial = getNextSerial();
  const uid = generateUID(serial);
  
  // Encrypt Aadhaar if provided
  let aadhaarEncrypted = "";
  if (patientData.aadhaar && !patientData.noAadhaar) {
    aadhaarEncrypted = encryptAadhaar(patientData.aadhaar);
  }

  const patientRecord = {
    uid,
    name: patientData.name.trim(),
    age: parseInt(patientData.age, 10),
    gender: patientData.gender,
    village: patientData.village.trim(),
    district: patientData.district,
    household: patientData.household || "",
    phone: patientData.phone.trim(),
    aadhaarEncrypted,
    bloodGroup: patientData.bloodGroup,
    photo: patientData.photo || null, // base64 string or null
    ashaWorkerId: patientData.ashaWorkerId || "unknown_asha",
    createdAt: Date.now(),
    syncStatus: "pending",
    firebaseDocId: null,

    // Baseline Medical / IDRS Details
    height: patientData.height ? parseFloat(patientData.height) : null,
    weight: patientData.weight ? parseFloat(patientData.weight) : null,
    waist: patientData.waist ? parseFloat(patientData.waist) : null,
    bpSystolic: patientData.bpSystolic ? parseInt(patientData.bpSystolic, 10) : null,
    bpDiastolic: patientData.bpDiastolic ? parseInt(patientData.bpDiastolic, 10) : null,
    glucoseLevel: patientData.glucoseLevel ? parseInt(patientData.glucoseLevel, 10) : null,
    physicalActivity: patientData.physicalActivity || "",
    familyHistory: patientData.familyHistory || "",
    idrsScore: patientData.idrsScore !== undefined ? parseInt(patientData.idrsScore, 10) : null,
    overallRisk: patientData.overallRisk || "GREEN",
    doctorsNote: patientData.doctorsNote || "",
    nextMeetupDate: patientData.nextMeetupDate || null,
    lastScreened: Date.now()
  };

  try {
    const localId = await db.patients.add(patientRecord);
    // Queue for Firestore sync
    await addToSyncQueue("patients", localId, "create", { ...patientRecord, localId });
    return { ...patientRecord, id: localId };
  } catch (error) {
    console.error("Failed to create local patient record", error);
    throw error;
  }
}

/**
 * Gets a local patient by their UID.
 * @param {string} uid - Formatted (29-XXXXX-C) or plain (29XXXXXC) UID
 * @returns {Promise<object|null>} Patient record (decrypted) or null
 */
export async function getLocalPatientByUid(uid) {
  if (!uid) return null;
  const cleanUid = uid.replace(/-/g, "").trim();
  
  // Search in database (we support both hyphenated or unhyphenated depending on search)
  // Let's get all patients and match (or index on uid)
  const patient = await db.patients
    .filter(p => p.uid.replace(/-/g, "") === cleanUid)
    .first();
    
  if (patient) {
    return {
      ...patient,
      aadhaar: patient.aadhaarEncrypted ? decryptAadhaar(patient.aadhaarEncrypted) : ""
    };
  }
  return null;
}

/**
 * Searches local patients by name or UID.
 * @param {string} query - Text query
 * @returns {Promise<Array>} List of matching decrypted patient records
 */
export async function searchLocalPatients(query) {
  if (!query) {
    return listAllPatients();
  }
  
  const cleanQuery = query.toLowerCase().trim();
  const cleanUid = cleanQuery.replace(/-/g, "");
  
  const matches = await db.patients
    .filter(p => {
      const nameMatch = p.name.toLowerCase().includes(cleanQuery);
      const uidMatch = p.uid.replace(/-/g, "").includes(cleanUid);
      return nameMatch || uidMatch;
    })
    .toArray();
    
  return matches.map(p => ({
    ...p,
    aadhaar: p.aadhaarEncrypted ? decryptAadhaar(p.aadhaarEncrypted) : ""
  }));
}

/**
 * Lists all patients in the local database.
 * @returns {Promise<Array>} List of all decrypted patient records
 */
export async function listAllPatients() {
  const patients = await db.patients.toArray();
  return patients.map(p => ({
    ...p,
    aadhaar: p.aadhaarEncrypted ? decryptAadhaar(p.aadhaarEncrypted) : ""
  }));
}

/**
 * Updates an existing patient's details locally and registers the update in the sync queue.
 * @param {number} localId - Dexie primary key
 * @param {object} updateData - Fields to update
 * @returns {Promise<void>}
 */
export async function updateLocalPatient(localId, updateData) {
  const currentRecord = await db.patients.get(localId);
  if (!currentRecord) throw new Error(`Patient with ID ${localId} not found`);

  // Handle Aadhaar encryption if it is being updated
  let changes = { ...updateData, syncStatus: "pending" };
  if (updateData.aadhaar !== undefined) {
    changes.aadhaarEncrypted = updateData.aadhaar ? encryptAadhaar(updateData.aadhaar) : "";
    delete changes.aadhaar;
  }

  try {
    await db.patients.update(localId, changes);
    const updatedRecord = await db.patients.get(localId);
    
    // Add update operation to sync queue
    await addToSyncQueue("patients", localId, "update", { ...updatedRecord, localId });
  } catch (error) {
    console.error(`Failed to update local patient ID: ${localId}`, error);
    throw error;
  }
}
