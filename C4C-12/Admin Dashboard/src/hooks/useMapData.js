/**
 * GraamSehat Admin Dashboard - Map Data Processing Hook
 * Location: /src/hooks/useMapData.js
 */

import { useAdmin } from '../context/AdminContext';
import { useMemo } from 'react';
import { DISTRICT_COORDINATES } from '../utils/geoData';

export const useMapData = (filters) => {
  const { patients, ashaWorkers, screenings } = useAdmin();

  const filteredMarkers = useMemo(() => {
    // 1. Filter patients based on criteria
    const filteredPatients = patients.filter((patient) => {
      // Risk level filter (multi-select check if applicable, or single select)
      if (filters.riskLevel && filters.riskLevel.length > 0) {
        if (!filters.riskLevel.includes(patient.riskLevel)) return false;
      }

      // District filter
      if (filters.district && patient.district !== filters.district) {
        return false;
      }

      // ASHA Worker filter
      if (filters.ashaWorkerId && patient.ashaWorkerId !== filters.ashaWorkerId) {
        return false;
      }

      // Date range filter (lastScreened date)
      if (filters.startDate || filters.endDate) {
        if (!patient.lastScreened) return false;
        const lastDate = patient.lastScreened.toDate ? patient.lastScreened.toDate() : new Date(patient.lastScreened);
        
        if (filters.startDate && lastDate < new Date(filters.startDate)) return false;
        
        // Add 23:59:59 to endDate to include screenings on that day
        if (filters.endDate) {
          const endDateTime = new Date(filters.endDate);
          endDateTime.setHours(23, 59, 59, 999);
          if (lastDate > endDateTime) return false;
        }
      }

      return true;
    });

    // 2. Group by district
    const districtGroups = {};

    filteredPatients.forEach((patient) => {
      const dist = patient.district;
      if (!dist || !DISTRICT_COORDINATES[dist]) return; // Skip if no coordinate config

      if (!districtGroups[dist]) {
        districtGroups[dist] = {
          name: dist,
          lat: DISTRICT_COORDINATES[dist].lat,
          lng: DISTRICT_COORDINATES[dist].lng,
          patients: [],
          riskCounts: { green: 0, yellow: 0, red: 0 }
        };
      }

      districtGroups[dist].patients.push(patient);
      
      const risk = (patient.riskLevel || 'green').toLowerCase();
      if (districtGroups[dist].riskCounts[risk] !== undefined) {
        districtGroups[dist].riskCounts[risk] += 1;
      } else {
        districtGroups[dist].riskCounts.green += 1;
      }
    });

    // 3. Convert groups to markers with color, size, and metadata
    const markers = Object.values(districtGroups).map((group) => {
      const totalInDistrict = group.patients.length;
      const { green, yellow, red } = group.riskCounts;

      // Dominant risk logic:
      // Any red patients -> red marker (red overrides)
      // Majority yellow -> yellow marker
      // Majority green -> green marker
      let dominantRisk = 'green';
      if (red > 0) {
        dominantRisk = 'red';
      } else if (yellow > green) {
        dominantRisk = 'yellow';
      }

      // Marker size scales with number of patients (min 10px, max 30px)
      // Scale based on patient count in this district relative to others
      // e.g. min 10px, adding 2px per patient up to 30px
      const size = Math.max(10, Math.min(30, 10 + (totalInDistrict * 1.5)));

      // Find top ASHA worker in this district (by screening count in the screenings collection)
      const districtASHAStats = {};
      
      // Calculate how many screenings each ASHA did in this district
      screenings.forEach(s => {
        if (s.district === group.name && s.ashaWorkerId) {
          districtASHAStats[s.ashaWorkerId] = (districtASHAStats[s.ashaWorkerId] || 0) + 1;
        }
      });

      // Find ASHA worker UID with max screenings
      let topASHAId = null;
      let maxScreenings = -1;
      Object.entries(districtASHAStats).forEach(([ashaId, count]) => {
        if (count > maxScreenings) {
          maxScreenings = count;
          topASHAId = ashaId;
        }
      });

      // Find ASHA name
      let topASHAName = 'None';
      if (topASHAId) {
        const workerDoc = ashaWorkers.find(w => w.id === topASHAId);
        topASHAName = workerDoc ? workerDoc.name : 'Unknown';
      } else {
        // Fallback: search patients assigned ASHA workers in this district
        const altStats = {};
        group.patients.forEach(p => {
          if (p.ashaWorkerId) {
            altStats[p.ashaWorkerId] = (altStats[p.ashaWorkerId] || 0) + 1;
          }
        });
        let altTopId = null;
        let altMax = -1;
        Object.entries(altStats).forEach(([id, c]) => {
          if (c > altMax) {
            altMax = c;
            altTopId = id;
          }
        });
        if (altTopId) {
          const workerDoc = ashaWorkers.find(w => w.id === altTopId);
          topASHAName = workerDoc ? workerDoc.name : 'Unknown';
        }
      }

      return {
        districtName: group.name,
        position: [group.lat, group.lng],
        totalPatients: totalInDistrict,
        riskBreakdown: group.riskCounts,
        dominantRisk,
        markerSize: size,
        topASHAWorker: topASHAName
      };
    });

    return markers;
  }, [patients, ashaWorkers, screenings, filters]);

  // Heatmap points (density of high-risk patients only)
  const heatmapPoints = useMemo(() => {
    const points = [];
    patients.forEach((p) => {
      if (p.riskLevel === 'red' && p.district && DISTRICT_COORDINATES[p.district]) {
        const coord = DISTRICT_COORDINATES[p.district];
        // Add coordinates [lat, lng, intensity]
        // Add slight random offset so they don't stack directly on the center
        const latOffset = (Math.random() - 0.5) * 0.15;
        const lngOffset = (Math.random() - 0.5) * 0.15;
        points.push([coord.lat + latOffset, coord.lng + lngOffset, 0.8]);
      }
    });
    return points;
  }, [patients]);

  return { markers: filteredMarkers, heatmapPoints };
};
