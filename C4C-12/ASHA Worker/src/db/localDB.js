/**
 * GraamSehat ASHA Worker App - Dexie.js Local Database Config
 * Path: /src/db/localDB.js
 * Configures the IndexedDB tables and local schema. Provides a helper to increment
 * and retrieve patient serial numbers from localStorage.
 */

import Dexie from "dexie";

// Initialize Dexie database
export const db = new Dexie("GraamSehrat_ASHA");

// Define schema version 1
db.version(1).stores({
  patients: "++id, uid, name, age, gender, village, district, phone, bloodGroup, ashaWorkerId, createdAt, syncStatus, firebaseDocId",
  screenings: "++id, uid, date, idrsScore, bpSystolic, bpDiastolic, glucoseLevel, riskLevel, overallRisk, ashaWorkerId, syncStatus, firebaseDocId",
  medicines: "++id, uid, medicineName, distributedAt, nextDueDate, ashaWorkerId, syncStatus",
  syncQueue: "++id, table, localId, operation, addedAt, attempts"
});

/**
 * Increments and retrieves the next patient serial number from localStorage.
 * Used to construct Karnataka (29) UIDs.
 * @returns {number} The next serial number (integer)
 */
export function getNextSerial() {
  const key = "graamsehat_serial_counter";
  const currentVal = localStorage.getItem(key);
  
  // Start from serial 1 (will be padded to 00001) if not set
  let nextVal = 1;
  if (currentVal) {
    nextVal = parseInt(currentVal, 10) + 1;
  }
  
  localStorage.setItem(key, String(nextVal));
  return nextVal;
}
