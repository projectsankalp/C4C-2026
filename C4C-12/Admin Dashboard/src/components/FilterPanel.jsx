/**
 * GraamSehat Admin Dashboard - Filter Panel Component
 * Location: /src/components/FilterPanel.jsx
 */

import React from 'react';
import { KARNATAKA_DISTRICTS } from '../utils/constants';
import { useAdmin } from '../context/AdminContext';
import { RotateCcw, Filter } from 'lucide-react';
import './FilterPanel.css';

export default function FilterPanel({ 
  filters, 
  onFilterChange, 
  showRiskSelect = true, 
  showDateRange = true, 
  showDistrictSelect = true, 
  showAshaSelect = true 
}) {
  const { ashaWorkers } = useAdmin();

  const handleDistrictChange = (e) => {
    onFilterChange({ ...filters, district: e.target.value });
  };

  const handleAshaChange = (e) => {
    onFilterChange({ ...filters, ashaWorkerId: e.target.value });
  };

  const handleStartDateChange = (e) => {
    onFilterChange({ ...filters, startDate: e.target.value });
  };

  const handleEndDateChange = (e) => {
    onFilterChange({ ...filters, endDate: e.target.value });
  };

  const handleRiskToggle = (risk) => {
    let newRisks = [...(filters.riskLevel || [])];
    if (newRisks.includes(risk)) {
      newRisks = newRisks.filter(r => r !== risk);
    } else {
      newRisks.push(risk);
    }
    onFilterChange({ ...filters, riskLevel: newRisks });
  };

  const handleReset = () => {
    onFilterChange({
      riskLevel: [],
      startDate: '',
      endDate: '',
      district: '',
      ashaWorkerId: ''
    });
  };

  return (
    <div className="glass-card filter-panel">
      <div className="filter-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} className="filter-title-icon" />
          <h3>Filter Records</h3>
        </div>
        <button className="btn-reset" onClick={handleReset} title="Reset all filters">
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>

      <div className="filter-panel-body">
        {/* District Select */}
        {showDistrictSelect && (
          <div className="form-group">
            <label className="form-label">District</label>
            <select 
              value={filters.district || ''} 
              onChange={handleDistrictChange} 
              className="form-input"
            >
              <option value="">All Districts</option>
              {KARNATAKA_DISTRICTS.map((dist) => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>
        )}

        {/* ASHA Worker Select */}
        {showAshaSelect && (
          <div className="form-group">
            <label className="form-label">ASHA Worker</label>
            <select 
              value={filters.ashaWorkerId || ''} 
              onChange={handleAshaChange} 
              className="form-input"
            >
              <option value="">All Workers</option>
              {ashaWorkers.map((worker) => (
                <option key={worker.id} value={worker.id}>{worker.name} ({worker.district})</option>
              ))}
            </select>
          </div>
        )}

        {/* Date Ranges */}
        {showDateRange && (
          <div className="filter-date-group">
            <div className="form-group">
              <label className="form-label">From Date</label>
              <input 
                type="date" 
                value={filters.startDate || ''} 
                onChange={handleStartDateChange} 
                className="form-input" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">To Date</label>
              <input 
                type="date" 
                value={filters.endDate || ''} 
                onChange={handleEndDateChange} 
                className="form-input" 
              />
            </div>
          </div>
        )}

        {/* Risk Selection */}
        {showRiskSelect && (
          <div className="form-group">
            <label className="form-label">Risk Category</label>
            <div className="risk-checkboxes">
              {['green', 'yellow', 'red'].map((risk) => (
                <button
                  key={risk}
                  type="button"
                  onClick={() => handleRiskToggle(risk)}
                  className={`risk-toggle-btn risk-toggle-${risk} ${(filters.riskLevel || []).includes(risk) ? 'active' : ''}`}
                >
                  <span className={`risk-dot risk-dot-${risk}`} />
                  <span>{risk}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
