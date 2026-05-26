/**
 * GraamSehat Admin Dashboard - Full Patient Map Page
 * Location: /src/pages/PatientMap.jsx
 */

import React, { useState } from 'react';
import MapView from '../components/MapView';
import FilterPanel from '../components/FilterPanel';
import { useMapData } from '../hooks/useMapData';
import { MapPin, HelpCircle } from 'lucide-react';
import './PatientMap.css';

export default function PatientMap() {
  const [filters, setFilters] = useState({
    riskLevel: [],
    startDate: '',
    endDate: '',
    district: '',
    ashaWorkerId: ''
  });

  const { markers, heatmapPoints } = useMapData(filters);

  return (
    <div className="patient-map-page">
      <div className="map-page-header">
        <div>
          <h1>National & Regional Patient Map</h1>
          <p className="subtitle">Real-time geographical analysis of patient health status and risk markers.</p>
        </div>
        <div className="map-legend-bar">
          <span className="legend-title">Marker Scale:</span>
          <div className="legend-indicator">
            <span className="dot dot-sm" /> <span>Fewer Patients</span>
          </div>
          <div className="legend-indicator">
            <span className="dot dot-lg" /> <span>More Patients</span>
          </div>
        </div>
      </div>

      <div className="map-page-body">
        {/* Map View Area */}
        <div className="map-view-box">
          <MapView 
            markers={markers} 
            heatmapPoints={heatmapPoints} 
            height="calc(100vh - 220px)" 
          />
        </div>

        {/* Floating/Right side Filter Panel */}
        <div className="map-filter-box">
          <FilterPanel 
            filters={filters} 
            onFilterChange={setFilters} 
            showRiskSelect={true}
            showDateRange={true}
            showDistrictSelect={true}
            showAshaSelect={true}
          />
          
          <div className="glass-card map-guide-card no-print">
            <div className="guide-header">
              <HelpCircle size={16} />
              <h4>Map Navigation Help</h4>
            </div>
            <ul className="guide-list">
              <li>Markers represent aggregated district coordinates.</li>
              <li>Click a marker to view patient counts, risk classification, and top ASHA workers.</li>
              <li>Use the <strong>Heatmap</strong> overlay to visualize density concentrations of high-risk cases.</li>
              <li>Adjust date ranges to isolate screening times.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
