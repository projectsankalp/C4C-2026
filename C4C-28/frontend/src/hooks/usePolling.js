import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * usePolling — repeatedly calls fetchFn at intervalMs.
 * Returns { data, loading, error, lastUpdated, refetch }
 */
export function usePolling(fetchFn, intervalMs = 5000, immediate = true) {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef                      = useRef(null);

  const run = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (immediate) run();
    if (intervalMs && intervalMs > 0) {
      timerRef.current = setInterval(run, intervalMs);
    }
    return () => clearInterval(timerRef.current);
  }, [run, intervalMs, immediate]);

  return { data, loading, error, lastUpdated, refetch: run };
}
