/**
 * GraamSehat ASHA Worker App - Custom Sync Hook
 * Path: /src/hooks/useSync.js
 * Wrapper hook around SyncContext to expose sync-triggering states and queue statistics.
 */

import { useSyncContext } from "../context/SyncContext";

/**
 * Hook to access sync state and manually trigger background sync.
 * @returns {object} Sync states and triggerSync callback
 */
export function useSync() {
  const {
    isOffline,
    pendingCount,
    syncing,
    lastSyncCount,
    showSuccessToast,
    triggerSync
  } = useSyncContext();

  return {
    isOffline,
    pendingCount,
    syncing,
    lastSyncCount,
    showSuccessToast,
    triggerSync
  };
}

export default useSync;
