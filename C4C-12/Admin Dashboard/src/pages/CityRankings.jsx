/**
 * GraamSehat Admin Dashboard - City Rankings Page
 * Location: /src/pages/CityRankings.jsx
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useRankings } from '../hooks/useRankings';
import SearchBar from '../components/SearchBar';
import RankingTable from '../components/RankingTable';
import ExportButton from '../components/ExportButton';
import { TrendingUp, HelpCircle, Activity } from 'lucide-react';
import './CityRankings.css';

export default function CityRankings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Set initial search query from URL parameters if redirected from map popup
  const urlDistrict = searchParams.get('district') || '';
  const [searchQuery, setSearchQuery] = useState(urlDistrict);
  
  const [sortConfig, setSortConfig] = useState({
    key: 'rank',
    direction: 'asc'
  });

  useEffect(() => {
    if (urlDistrict) {
      setSearchQuery(urlDistrict);
    }
  }, [urlDistrict]);

  const rankings = useRankings(searchQuery, sortConfig);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleRowClick = (districtName) => {
    // Navigate to patient search page filtered by this district
    navigate(`/search?district=${encodeURIComponent(districtName)}`);
  };

  // Format data for CSV Export
  const getCSVData = () => {
    return rankings.map(item => ({
      'Rank': item.rank,
      'District': item.districtName,
      'Total Patients': item.totalPatients,
      'High-Risk Patients': item.highRiskCount,
      'High-Risk %': `${item.highRiskPercent}%`,
      'Screenings (This Month)': item.screeningsThisMonth,
      'Active ASHA Workers': item.activeASHAs,
      'Last Activity Date': item.lastActivityDate ? item.lastActivityDate.toLocaleDateString('en-IN') : 'N/A',
      'Status': item.status
    }));
  };

  return (
    <div className="city-rankings-page">
      <div className="rankings-header no-print">
        <div>
          <h1>District Performance Rankings</h1>
          <p className="subtitle">Ranking of districts based on proportion of low-risk patients (lowest high-risk percentage ranked #1).</p>
        </div>
        <div className="rankings-header-actions">
          <ExportButton 
            data={getCSVData} 
            filename="graamsehat_district_rankings" 
            type="csv"
            label="Export Rankings CSV" 
          />
        </div>
      </div>

      {/* Overview stats panel */}
      <div className="rankings-search-bar no-print">
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Filter by district name..."
          onClear={() => setSearchQuery('')}
        />
      </div>

      {/* Legend Banner */}
      <div className="rankings-legend no-print">
        <div className="legend-pills">
          <span className="legend-lbl">Status Criteria:</span>
          <div className="legend-pill-item">
            <span className="badge badge-green">Active</span>
            <span>Optimal (&lt;30% high-risk &amp; active)</span>
          </div>
          <div className="legend-pill-item">
            <span className="badge badge-yellow">Needs Attention</span>
            <span>Moderate (&gt;30% high-risk)</span>
          </div>
          <div className="legend-pill-item">
            <span className="badge badge-red">Critical</span>
            <span>Severe (&gt;50% high-risk OR inactive &gt;14 days)</span>
          </div>
        </div>
      </div>

      {/* Rankings Grid */}
      <div className="rankings-grid">
        <RankingTable 
          rankings={rankings} 
          sortConfig={sortConfig} 
          onSort={handleSort} 
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
