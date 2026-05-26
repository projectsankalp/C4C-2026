import { openDB } from 'idb';

const DB_NAME = 'niramaya-offline';
const STORE = 'pending-screenings';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
    }
  });
}

export async function saveOfflineScreening(data) {
  const db = await getDB();
  return db.add(STORE, { ...data, savedAt: new Date().toISOString() });
}

export async function getPendingScreenings() {
  const db = await getDB();
  return db.getAll(STORE);
}

export async function deleteOfflineScreening(id) {
  const db = await getDB();
  return db.delete(STORE, id);
}
