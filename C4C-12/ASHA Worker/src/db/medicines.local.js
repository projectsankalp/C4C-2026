/**
 * GraamSehat ASHA Worker App - Medicine Distribution Local DB CRUD
 * Path: /src/db/medicines.local.js
 * Handles operations on the local IndexedDB 'medicines' table, and integrates
 * running inventory stock values in localStorage.
 */

import { db } from "./localDB";
import { addToSyncQueue } from "./pendingSync.local";
import { MEDICINES_LIST } from "../utils/constants";
import { doc, updateDoc, increment } from "firebase/firestore";
import { auth, firestore } from "../firebase/config";

// Key prefix for localStorage stock tracking
const STOCK_PREFIX = "graamsehat_stock_";

/**
 * Initializes default medicine stocks in localStorage if they don't exist.
 * Default starting stock: 50 units.
 */
export function initLocalStock() {
  MEDICINES_LIST.forEach(med => {
    const key = `${STOCK_PREFIX}${med.id}`;
    if (localStorage.getItem(key) === null) {
      // Set default stock to 50 for testing
      localStorage.setItem(key, "50");
    }
  });
}

/**
 * Gets the current stock of a medicine.
 * @param {string} medId - Medicine ID (e.g. 'metformin')
 * @returns {number} Current stock count
 */
export function getLocalMedicineStock(medId) {
  initLocalStock();
  const key = `${STOCK_PREFIX}${medId}`;
  return parseInt(localStorage.getItem(key) || "0", 10);
}

/**
 * Updates stock levels for a medicine (e.g. restock from PHC).
 * @param {string} medId - Medicine ID
 * @param {number} absoluteQty - New absolute stock value
 */
export function setLocalMedicineStock(medId, absoluteQty) {
  const key = `${STOCK_PREFIX}${medId}`;
  localStorage.setItem(key, String(absoluteQty));
}

/**
 * Deducts stock for a distributed medicine and returns warning status.
 * @param {string} medId - Medicine ID
 * @param {number} qtyDeducted - Quantity distributed
 * @returns {object} { currentStock: number, isLowStock: boolean }
 */
export function deductLocalMedicineStock(medId, qtyDeducted) {
  const current = getLocalMedicineStock(medId);
  const updated = Math.max(0, current - qtyDeducted);
  setLocalMedicineStock(medId, updated);
  
  // Real-time stock sync to Firestore
  const user = auth.currentUser;
  if (user && navigator.onLine) {
    const mapping = {
      metformin: "Metformin",
      amlodipine: "Amlodipine",
      atenolol: "Atenolol",
      ors: "ORS",
      iron: "Iron",
      folic_acid: "FolicAcid"
    };
    const firestoreKey = mapping[medId];
    if (firestoreKey) {
      const userRef = doc(firestore, "users", user.uid);
      updateDoc(userRef, {
        [`medicines.${firestoreKey}`]: increment(-qtyDeducted)
      }).catch(err => {
        console.error("Failed to update stock in Firestore:", err);
      });
    }
  }
  
  return {
    currentStock: updated,
    isLowStock: updated < 10
  };
}

/**
 * Saves a new medicine distribution log locally and decrements local stock.
 * Pushes to sync queue.
 * @param {object} logData - uid, medicineId, medicineName, dose, quantity, distributedAt, nextDueDate, ashaWorkerId
 * @returns {Promise<object>} Created log record plus stock updates
 */
export async function createLocalMedicineLog(logData) {
  // 1. Calculate next checkup date based on medicine type if not provided
  let nextDueDate = logData.nextDueDate;
  if (!nextDueDate) {
    const medId = logData.medicineId;
    const medPreset = MEDICINES_LIST.find(m => m.id === medId);
    const intervalDays = medPreset ? medPreset.nextDueDays : 30;
    
    if (intervalDays > 0) {
      const due = new Date();
      due.setDate(due.getDate() + intervalDays);
      nextDueDate = due.getTime();
    } else {
      nextDueDate = null; // As needed
    }
  }

  // 2. Deduct stock from localStorage
  const stockResult = deductLocalMedicineStock(logData.medicineId, parseInt(logData.quantity, 10));

  // 3. Construct IndexedDB record
  const medicineRecord = {
    uid: logData.uid,
    medicineName: logData.medicineName,
    dose: logData.dose,
    quantity: parseInt(logData.quantity, 10),
    distributedAt: logData.distributedAt || Date.now(),
    nextDueDate: nextDueDate,
    ashaWorkerId: logData.ashaWorkerId || "unknown_asha",
    syncStatus: "pending"
  };

  try {
    const localId = await db.medicines.add(medicineRecord);
    // Queue for Firestore sync
    await addToSyncQueue("medicines", localId, "create", { ...medicineRecord, localId });
    
    return {
      log: { ...medicineRecord, id: localId },
      isLowStock: stockResult.isLowStock,
      remainingStock: stockResult.currentStock
    };
  } catch (error) {
    console.error("Failed to create local medicine log", error);
    throw error;
  }
}

/**
 * Gets all medicine distribution logs for a given patient.
 * @param {string} uid - Patient UID
 * @returns {Promise<Array>} List of medicine logs sorted by distribution date descending
 */
export async function getLocalMedicineLogsForPatient(uid) {
  if (!uid) return [];
  const cleanUid = uid.replace(/-/g, "").trim();
  
  const logs = await db.medicines
    .filter(m => m.uid.replace(/-/g, "") === cleanUid)
    .toArray();
    
  return logs.sort((a, b) => b.distributedAt - a.distributedAt);
}

/**
 * Lists all medicine logs in local DB.
 * @returns {Promise<Array>} All logs
 */
export async function listAllMedicineLogs() {
  return db.medicines.toArray();
}
