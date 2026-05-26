import { useState } from 'react';
import { getPendingScreenings, deleteOfflineScreening } from '../utils/offlineStorage';
import { createScreening } from '../services/screeningService';

export function useSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const syncNow = async () => {
    setSyncing(true);
    try {
      const pending = await getPendingScreenings();
      for (const item of pending) {
        try {
          await createScreening(item.data);
          await deleteOfflineScreening(item.id);
        } catch (err) {
          console.warn('Failed to sync item:', err.message);
        }
      }
      setLastSync(new Date());
    } finally {
      setSyncing(false);
    }
  };

  return { syncing, lastSync, syncNow };
}
