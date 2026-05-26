/**
 * GraamSehat Admin Dashboard - Admin Data Stats Hook
 * Location: /src/hooks/useAdminData.js
 */

import { useAdmin } from '../context/AdminContext';
import { useMemo } from 'react';

export const useAdminData = () => {
  const { patients, ashaWorkers, screenings } = useAdmin();

  const stats = useMemo(() => {
    // 1. Total patients registered
    const totalPatients = patients.length;

    // 2. Total screenings conducted
    const totalScreenings = screenings.length;

    // 3. High-risk patients (red risk level)
    const highRiskPatients = patients.filter(p => p.riskLevel === 'red').length;

    // 4. Pending syncs (aggregated across ASHA workers pendingSyncCount + patients pending sync)
    const pendingSyncs = ashaWorkers.reduce((acc, w) => acc + (w.pendingSyncCount || 0), 0) +
      patients.filter(p => p.syncStatus === 'pending').length;

    // 5. Active ASHA workers (approved and not suspended)
    const activeASHAs = ashaWorkers.filter(w => w.status === 'approved').length;

    // 6. Districts covered
    const districtsSet = new Set();
    patients.forEach(p => {
      if (p.district) districtsSet.add(p.district);
    });
    const districtsCovered = districtsSet.size;

    return {
      totalPatients,
      totalScreenings,
      highRiskPatients,
      pendingSyncs,
      activeASHAs,
      districtsCovered
    };
  }, [patients, ashaWorkers, screenings]);

  // Alert computations (Row 4)
  const alerts = useMemo(() => {
    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Patients not followed up in 60+ days: count + list
    // A patient is not followed up if lastScreened is older than 60 days
    const noFollowupPatients = patients.filter(p => {
      if (!p.lastScreened) return true; // Never screened since registration counts as no follow up
      const lastDate = p.lastScreened.toDate ? p.lastScreened.toDate() : new Date(p.lastScreened);
      return lastDate < sixtyDaysAgo;
    });

    // ASHA workers with no activity in 30 days
    const inactiveASHAs = ashaWorkers.filter(w => {
      if (w.status !== 'approved') return false; // Only check approved ones
      if (!w.lastActive) return true; // Never active counts as inactive
      const activeDate = w.lastActive.toDate ? w.lastActive.toDate() : new Date(w.lastActive);
      return activeDate < thirtyDaysAgo;
    });

    // Districts with zero screenings this month
    // Find all districts that had screenings this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const districtsWithScreeningsThisMonth = new Set();
    
    screenings.forEach(s => {
      const sDate = s.timestamp ? (s.timestamp.toDate ? s.timestamp.toDate() : new Date(s.timestamp)) : null;
      if (sDate && sDate >= startOfMonth && s.district) {
        districtsWithScreeningsThisMonth.add(s.district);
      }
    });

    // All possible districts (from patients)
    const allDistricts = new Set();
    patients.forEach(p => {
      if (p.district) allDistricts.add(p.district);
    });

    const zeroScreeningDistricts = Array.from(allDistricts).filter(
      dist => !districtsWithScreeningsThisMonth.has(dist)
    );

    return {
      noFollowupPatients: {
        count: noFollowupPatients.length,
        list: noFollowupPatients.slice(0, 10) // list of last 10
      },
      inactiveASHAs: {
        count: inactiveASHAs.length,
        list: inactiveASHAs
      },
      zeroScreeningDistricts: {
        count: zeroScreeningDistricts.length,
        list: zeroScreeningDistricts
      }
    };
  }, [patients, ashaWorkers, screenings]);

  return { stats, alerts };
};
