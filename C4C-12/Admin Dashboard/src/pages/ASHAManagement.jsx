/**
 * GraamSehat Admin Dashboard - ASHA Management Page
 * Location: /src/pages/ASHAManagement.jsx
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import SearchBar from '../components/SearchBar';
import { formatDate } from '../utils/formatters';
import { KARNATAKA_DISTRICTS } from '../utils/constants';
import { Users, Eye, ArrowUpDown, ShieldCheck, ShieldAlert } from 'lucide-react';
import './ASHAManagement.css';

export default function ASHAManagement() {
  const { ashaWorkers, screenings } = useAdmin();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // Get total screenings conducted by each ASHA worker
  const ashaScreeningsCounts = useMemo(() => {
    const counts = {};
    screenings.forEach(s => {
      if (s.ashaWorkerId) {
        counts[s.ashaWorkerId] = (counts[s.ashaWorkerId] || 0) + 1;
      }
    });
    return counts;
  }, [screenings]);

  // Combined Search and Filters
  const filteredWorkers = useMemo(() => {
    let result = ashaWorkers.map(w => ({
      ...w,
      screeningsCount: ashaScreeningsCounts[w.id] || w.screeningsCount || 0
    }));

    // Text Search (Name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(w => w.name?.toLowerCase().includes(q));
    }

    // Status Filter
    if (statusFilter) {
      result = result.filter(w => w.status === statusFilter);
    }

    // District Filter
    if (districtFilter) {
      result = result.filter(w => w.district === districtFilter);
    }

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'lastActive') {
          valA = valA ? (valA.toDate ? valA.toDate().getTime() : new Date(valA).getTime()) : 0;
          valB = valB ? (valB.toDate ? valB.toDate().getTime() : new Date(valB).getTime()) : 0;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [ashaWorkers, searchQuery, statusFilter, districtFilter, sortConfig, ashaScreeningsCounts]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'approved') {
      return (
        <span className="badge badge-green">
          <ShieldCheck size={12} />
          <span>Approved</span>
        </span>
      );
    }
    if (s === 'suspended') {
      return (
        <span className="badge badge-red">
          <ShieldAlert size={12} />
          <span>Suspended</span>
        </span>
      );
    }
    return <span className="badge badge-yellow">Pending</span>;
  };

  return (
    <div className="asha-management-page">
      <div className="management-header no-print">
        <div>
          <h1>ASHA Worker Registry</h1>
          <p className="subtitle">Monitor ASHA worker registrations, status permissions, and operational screening counts.</p>
        </div>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="management-filters-row no-print">
        <div className="search-box">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by worker name..."
            onClear={() => setSearchQuery('')}
          />
        </div>

        <div className="filter-selects">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="form-input filter-dropdown"
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="suspended">Suspended</option>
          </select>

          <select 
            value={districtFilter} 
            onChange={(e) => setDistrictFilter(e.target.value)} 
            className="form-input filter-dropdown"
          >
            <option value="">All Districts</option>
            {KARNATAKA_DISTRICTS.map((dist) => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Workers Grid/Table */}
      <div className="table-container">
        <table className="clean-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>Name <ArrowUpDown size={12} style={{ opacity: 0.5 }} /></th>
              <th onClick={() => handleSort('district')}>District <ArrowUpDown size={12} style={{ opacity: 0.5 }} /></th>
              <th onClick={() => handleSort('subCentre')}>Sub-Centre <ArrowUpDown size={12} style={{ opacity: 0.5 }} /></th>
              <th onClick={() => handleSort('status')}>Status <ArrowUpDown size={12} style={{ opacity: 0.5 }} /></th>
              <th onClick={() => handleSort('screeningsCount')}>Screenings (Total) <ArrowUpDown size={12} style={{ opacity: 0.5 }} /></th>
              <th onClick={() => handleSort('lastActive')}>Last Active <ArrowUpDown size={12} style={{ opacity: 0.5 }} /></th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWorkers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No ASHA workers found matching criteria.
                </td>
              </tr>
            ) : (
              filteredWorkers.map((worker) => (
                <tr key={worker.id} onClick={() => navigate(`/asha/${worker.id}`)}>
                  <td><strong>{worker.name}</strong></td>
                  <td>{worker.district}</td>
                  <td>{worker.subCentre || 'N/A'}</td>
                  <td>{getStatusBadge(worker.status)}</td>
                  <td>{worker.screeningsCount}</td>
                  <td>{worker.lastActive ? formatDate(worker.lastActive) : 'Never'}</td>
                  <td className="actions-column">
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/asha/${worker.id}`);
                      }}
                      style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={12} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
