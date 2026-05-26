/**
 * GraamSehat ASHA Worker App - Sync Context Provider
 * Path: /src/context/SyncContext.jsx
 * Tracks database queue size, simulation settings, and triggers uploads.
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/localDB";
import { useOffline } from "../hooks/useOffline";
import { syncPendingRecords, pullPatientsFromFirestore } from "../firebase/sync";

const SyncContext = createContext(null);

export function SyncProvider({ children }) {
  const actualOffline = useOffline();
  
  // Load mock offline state from localStorage
  const [mockOffline, setMockOfflineState] = useState(() => {
    return localStorage.getItem("graamsehat_mock_offline") === "true";
  });

  const [syncing, setSyncing] = useState(false);
  const [lastSyncCount, setLastSyncCount] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Reactively track the sync queue count using Dexie's useLiveQuery
  const pendingCount = useLiveQuery(
    async () => {
      try {
        return await db.syncQueue.count();
      } catch (err) {
        console.error("Dexie queue count query failed", err);
        return 0;
      }
    },
    [],
    0
  );

  // Combined offline status
  const isOffline = actualOffline || mockOffline;

  const setMockOffline = (val) => {
    localStorage.setItem("graamsehat_mock_offline", String(val));
    setMockOfflineState(val);
  };

  /**
   * Triggers the upload of pending records to Firestore and pulls down cloud updates.
   */
  const triggerSync = async () => {
    if (isOffline || syncing) return;
    
    setSyncing(true);
    setLastSyncCount(0);
    setShowSuccessToast(false);
    
    try {
      // 1. Upload local changes to cloud
      const syncedCount = await syncPendingRecords();
      
      // 2. Download cloud updates to local DB
      await pullPatientsFromFirestore();
      
      setLastSyncCount(syncedCount);
      setShowSuccessToast(true);
      // Hide success toast after 4 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);
    } catch (error) {
      console.error("Sync process failed", error);
    } finally {
      setSyncing(false);
    }
  };

  // Auto-sync when transitioning from offline to online
  useEffect(() => {
    if (!isOffline && pendingCount > 0) {
      triggerSync();
    }
  }, [isOffline, pendingCount]);

  return (
    <SyncContext.Provider
      value={{
        isOffline,
        mockOffline,
        setMockOffline,
        pendingCount,
        syncing,
        lastSyncCount,
        showSuccessToast,
        setShowSuccessToast,
        triggerSync
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncContext() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSyncContext must be used within a SyncProvider");
  }
  return context;
}
