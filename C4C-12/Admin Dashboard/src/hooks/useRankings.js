/**
 * GraamSehat Admin Dashboard - District Rankings Hook
 * Location: /src/hooks/useRankings.js
 */

import { useAdmin } from '../context/AdminContext';
import { useMemo } from 'react';

export const useRankings = (searchQuery = '', sortConfig = null) => {
  const { patients, ashaWorkers, screenings } = useAdmin();

  const rankings = useMemo(() => {
    const districtsData = {};
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 1. Initialize data for all districts found in patients/asha workers
    const allDistricts = new Set();
    patients.forEach(p => p.district && allDistricts.add(p.district));
    ashaWorkers.forEach(w => w.district && allDistricts.add(w.district));
    screenings.forEach(s => s.district && allDistricts.add(s.district));

    allDistricts.forEach(dist => {
      districtsData[dist] = {
        districtName: dist,
        totalPatients: 0,
        highRiskCount: 0,
        highRiskPercent: 0,
        screeningsThisMonth: 0,
        activeASHAs: 0,
        lastActivityDate: null,
        status: 'Active' // Active / Needs Attention / Critical
      };
    });

    // 2. Count patients & high-risk per district
    patients.forEach(p => {
      const dist = p.district;
      if (!dist || !districtsData[dist]) return;
      
      districtsData[dist].totalPatients += 1;
      if (p.riskLevel === 'red') {
        districtsData[dist].highRiskCount += 1;
      }
      
      // Update last activity date from patient's last screened
      if (p.lastScreened) {
        const screenedDate = p.lastScreened.toDate ? p.lastScreened.toDate() : new Date(p.lastScreened);
        const currentLast = districtsData[dist].lastActivityDate;
        if (!currentLast || screenedDate > currentLast) {
          districtsData[dist].lastActivityDate = screenedDate;
        }
      }
    });

    // 3. Count screenings this month per district
    screenings.forEach(s => {
      const dist = s.district;
      if (!dist || !districtsData[dist]) return;
      
      const sDate = s.timestamp ? (s.timestamp.toDate ? s.timestamp.toDate() : new Date(s.timestamp)) : null;
      
      if (sDate && sDate >= startOfMonth) {
        districtsData[dist].screeningsThisMonth += 1;
      }
      
      if (sDate) {
        const currentLast = districtsData[dist].lastActivityDate;
        if (!currentLast || sDate > currentLast) {
          districtsData[dist].lastActivityDate = sDate;
        }
      }
    });

    // 4. Count active ASHA workers per district
    ashaWorkers.forEach(w => {
      const dist = w.district;
      if (!dist || !districtsData[dist]) return;
      
      if (w.status === 'approved') {
        districtsData[dist].activeASHAs += 1;
      }

      // Update last active date from ASHA activity
      if (w.lastActive) {
        const activeDate = w.lastActive.toDate ? w.lastActive.toDate() : new Date(w.lastActive);
        const currentLast = districtsData[dist].lastActivityDate;
        if (!currentLast || activeDate > currentLast) {
          districtsData[dist].lastActivityDate = activeDate;
        }
      }
    });

    // 5. Calculate percentages and status badges
    const districtList = Object.values(districtsData).map((data) => {
      const percent = data.totalPatients > 0 
        ? Math.round((data.highRiskCount / data.totalPatients) * 100) 
        : 0;

      // Status badge:
      // "Needs Attention": district with >30% high-risk patients
      // "Critical": district with >50% high-risk OR no activity in 14 days
      let status = 'Active';
      const noActivity14Days = !data.lastActivityDate || data.lastActivityDate < fourteenDaysAgo;

      if (percent > 50 || noActivity14Days) {
        status = 'Critical';
      } else if (percent > 30) {
        status = 'Needs Attention';
      }

      return {
        ...data,
        highRiskPercent: percent,
        status
      };
    });

    // 6. Rank them: #1 is best (lowest high-risk percentage)
    // Sort ascending by highRiskPercent, then descending by totalPatients
    districtList.sort((a, b) => {
      if (a.highRiskPercent !== b.highRiskPercent) {
        return a.highRiskPercent - b.highRiskPercent;
      }
      return b.totalPatients - a.totalPatients;
    });

    // Add rank number (1-based)
    return districtList.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [patients, ashaWorkers, screenings]);

  // 7. Filter and Sort
  const processedRankings = useMemo(() => {
    let result = [...rankings];

    // Search by district name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => item.districtName.toLowerCase().includes(q));
    }

    // Sort config: { key, direction: 'asc' | 'desc' }
    if (sortConfig && sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Handle dates
        if (sortConfig.key === 'lastActivityDate') {
          valA = valA ? valA.getTime() : 0;
          valB = valB ? valB.getTime() : 0;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [rankings, searchQuery, sortConfig]);

  return processedRankings;
};
