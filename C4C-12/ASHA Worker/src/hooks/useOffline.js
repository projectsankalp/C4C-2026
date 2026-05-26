/**
 * GraamSehat ASHA Worker App - Offline Detector Hook
 * Path: /src/hooks/useOffline.js
 * Listens to browser connectivity state transitions and returns online/offline status.
 */

import { useState, useEffect } from "react";

/**
 * Custom hook to detect network online/offline status.
 * @returns {boolean} True if the browser is offline
 */
export function useOffline() {
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOffline;
}
export default useOffline;
