/**
 * GraamSehat ASHA Worker App - Sync Queue Manager
 * Path: /src/db/pendingSync.local.js
 * Tracks offline database entries that need to be synced to Firebase Firestore.
 */

import { db } from "./localDB";

/**
 * Adds an operation to the local synchronization queue.
 * @param {string} table - Table name ('patients', 'screenings', 'medicines')
 * @param {number} localId - Dexie primary key of the record
 * @param {string} operation - 'create' or 'update'
 * @param {object} data - Complete payload of the record to sync
 * @returns {Promise<number>} Queue entry ID
 */
export async function addToSyncQueue(table, localId, operation, data) {
  try {
    const queueId = await db.syncQueue.add({
      table,
      localId,
      operation,
      data,
      addedAt: Date.now(),
      attempts: 0
    });
    return queueId;
  } catch (error) {
    console.error(`Failed to add record to sync queue: ${table} ID ${localId}`, error);
    throw error;
  }
}

/**
 * Fetches all pending operations from the sync queue.
 * @returns {Promise<Array>} List of queue entries sorted by addedAt
 */
export async function getPendingQueue() {
  return db.syncQueue.orderBy("addedAt").toArray();
}

/**
 * Removes a record from the sync queue after successful sync.
 * @param {number} queueId - The syncQueue entry ID
 * @returns {Promise<void>}
 */
export async function removeFromSyncQueue(queueId) {
  try {
    await db.syncQueue.delete(queueId);
  } catch (error) {
    console.error(`Failed to delete from sync queue ID: ${queueId}`, error);
  }
}

/**
 * Increments sync attempts for a queue entry.
 * @param {number} queueId - The syncQueue entry ID
 * @returns {Promise<void>}
 */
export async function incrementSyncAttempts(queueId) {
  try {
    const item = await db.syncQueue.get(queueId);
    if (item) {
      await db.syncQueue.update(queueId, {
        attempts: item.attempts + 1
      });
    }
  } catch (error) {
    console.error(`Failed to increment sync attempts for ID: ${queueId}`, error);
  }
}

/**
 * Gets the count of pending operations in the sync queue.
 * @returns {Promise<number>} Count of pending records
 */
export async function getPendingSyncCount() {
  return db.syncQueue.count();
}
