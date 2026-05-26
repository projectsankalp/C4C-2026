/**
 * src/db/localDB.js
 * Database initialization for Dexie.js (IndexedDB).
 * Stores patient records, screening history, family accounts, medicine reminder logs, and sync queues.
 */

import Dexie from 'dexie';

export const db = new Dexie('GraamSehat_Villager');

// Define database tables and index fields
db.version(1).stores({
  patients: '&uid, name, phone, village, district, riskLevel, lastScreeningDate',
  screenings: '++id, uid, date, riskLevel',
  medicines: '++id, uid, name',
  medicineLogs: '++id, uid, medicineId, takenDate, synced',
  familyLinks: '++id, primaryUID, memberUID, relation',
  syncQueue: '++id, table, operation, addedAt'
});

export default db;
