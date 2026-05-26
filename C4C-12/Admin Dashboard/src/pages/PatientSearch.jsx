/**
 * GraamSehat Admin Dashboard - Patient Search Page
 * Location: /src/pages/PatientSearch.jsx
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import PatientTable from '../components/PatientTable';
import ExportButton from '../components/ExportButton';
import { Search, UserCheck } from 'lucide-react';
import './PatientSearch.css';

export default function PatientSearch() {
  const { patients, ashaWorkers } = useAdmin();
  const [searchParams] = useSearchParams();

  // Initialize filters from URL parameters if available
  const urlDistrict = searchParams.get('district') || '';
  const urlAshaWorkerId = searchParams.get('ashaWorkerId') || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    riskLevel: [],
    startDate: '',
    endDate: '',
    district: urlDistrict,
    ashaWorkerId: urlAshaWorkerId
  });

  // Sync URL params if they change
  useEffect(() => {
    if (urlDistrict || urlAshaWorkerId) {
      setFilters(prev => ({
        ...prev,
        district: urlDistrict || prev.district,
        ashaWorkerId: urlAshaWorkerId || prev.ashaWorkerId
      }));
    }
  }, [urlDistrict, urlAshaWorkerId]);

  // Combined Search and Filter Logic
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // 1. Text Search Box (searches partial name, exact UID, village, district)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = patient.name?.toLowerCase().includes(q);
        const matchesUid = patient.uid?.toLowerCase() === q || patient.id?.toLowerCase() === q;
        const matchesVillage = patient.village?.toLowerCase().includes(q);
        const matchesDistrict = patient.district?.toLowerCase().includes(q);

        if (!matchesName && !matchesUid && !matchesVillage && !matchesDistrict) {
          return false;
        }
      }

      // 2. Risk Level Filters (multi-select check)
      if (filters.riskLevel && filters.riskLevel.length > 0) {
        if (!filters.riskLevel.includes(patient.riskLevel)) return false;
      }

      // 3. District Dropdown Filter
      if (filters.district && patient.district !== filters.district) {
        return false;
      }

      // 4. ASHA Worker Dropdown Filter
      if (filters.ashaWorkerId && patient.ashaWorkerId !== filters.ashaWorkerId) {
        return false;
      }

      // 5. Date Range Filters (lastScreened date)
      if (filters.startDate || filters.endDate) {
        if (!patient.lastScreened) return false;
        const lastDate = patient.lastScreened.toDate ? patient.lastScreened.toDate() : new Date(patient.lastScreened);
        
        if (filters.startDate && lastDate < new Date(filters.startDate)) return false;
        if (filters.endDate) {
          const endDateTime = new Date(filters.endDate);
          endDateTime.setHours(23, 59, 59, 999);
          if (lastDate > endDateTime) return false;
        }
      }

      return true;
    });
  }, [patients, searchQuery, filters]);

  // Map ASHA worker ID to Name for CSV export
  const getAshaName = (ashaId) => {
    if (!ashaId) return 'N/A';
    const worker = ashaWorkers.find(w => w.id === ashaId);
    return worker ? worker.name : 'Unknown';
  };

  // Format data for CSV export
  const getCSVData = () => {
    return filteredPatients.map(p => ({
      'Patient UID': p.uid || p.id,
      'Name': p.name,
      'Age': p.age,
      'Gender': p.gender,
      'Village': p.village,
      'District': p.district,
      'Risk Level': p.riskLevel,
      'Last Screened': p.lastScreened ? (p.lastScreened.toDate ? p.lastScreened.toDate().toLocaleDateString('en-IN') : new Date(p.lastScreened).toLocaleDateString('en-IN')) : 'Never',
      'Blood Group': p.bloodGroup || 'N/A',
      'ASHA Worker Assigned': getAshaName(p.ashaWorkerId)
    }));
  };

  return (
    <div className="patient-search-page">
      <div className="search-header no-print">
        <div>
          <h1>Patient Registry Search</h1>
          <p className="subtitle">Filter and locate patient profiles across villages, districts, and ASHA worker networks.</p>
        </div>
        <div className="search-header-actions">
          <ExportButton 
            data={getCSVData} 
            filename="graamsehat_patient_registry" 
            type="csv"
            label="Export Filtered CSV" 
          />
        </div>
      </div>

      <div className="search-page-body">
        {/* Main List Column */}
        <div className="search-list-column">
          <div className="search-input-bar no-print">
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, UID, village, or district..."
              onClear={() => setSearchQuery('')}
            />
          </div>
          
          <div className="search-results-table">
            <PatientTable patients={filteredPatients} />
          </div>
        </div>

        {/* Right Filters Column */}
        <div className="search-filters-column no-print">
          <FilterPanel 
            filters={filters} 
            onFilterChange={setFilters}
            showRiskSelect={true}
            showDateRange={true}
            showDistrictSelect={true}
            showAshaSelect={true}
          />
        </div>
      </div>
    </div>
  );
}
