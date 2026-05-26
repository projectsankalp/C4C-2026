/**
 * GraamSehat Admin Dashboard - District Ranking Table Component
 * Location: /src/components/RankingTable.jsx
 */

import React from 'react';
import { formatDate } from '../utils/formatters';
import { ArrowUpDown, AlertTriangle, AlertOctagon, CheckCircle } from 'lucide-react';

export default function RankingTable({ rankings, sortConfig, onSort, onRowClick }) {
  
  const getSortIcon = (key) => {
    return <ArrowUpDown size={12} style={{ marginLeft: '4px', opacity: sortConfig?.key === key ? 1 : 0.4 }} />;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Critical':
        return (
          <span className="badge badge-red">
            <AlertOctagon size={12} />
            <span>Critical</span>
          </span>
        );
      case 'Needs Attention':
        return (
          <span className="badge badge-yellow">
            <AlertTriangle size={12} />
            <span>Needs Attention</span>
          </span>
        );
      default:
        return (
          <span className="badge badge-green">
            <CheckCircle size={12} />
            <span>Active</span>
          </span>
        );
    }
  };

  return (
    <div className="table-container">
      <table className="clean-table">
        <thead>
          <tr>
            <th onClick={() => onSort('rank')}>Rank {getSortIcon('rank')}</th>
            <th onClick={() => onSort('districtName')}>District {getSortIcon('districtName')}</th>
            <th onClick={() => onSort('totalPatients')}>Total Patients {getSortIcon('totalPatients')}</th>
            <th onClick={() => onSort('highRiskCount')}>High-Risk Count {getSortIcon('highRiskCount')}</th>
            <th onClick={() => onSort('screeningsThisMonth')}>Screenings (Month) {getSortIcon('screeningsThisMonth')}</th>
            <th onClick={() => onSort('activeASHAs')}>Active ASHA Workers {getSortIcon('activeASHAs')}</th>
            <th onClick={() => onSort('lastActivityDate')}>Last Activity {getSortIcon('lastActivityDate')}</th>
            <th onClick={() => onSort('status')}>Status {getSortIcon('status')}</th>
          </tr>
        </thead>
        <tbody>
          {rankings.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No district records found matching the criteria.
              </td>
            </tr>
          ) : (
            rankings.map((row) => (
              <tr key={row.districtName} onClick={() => onRowClick && onRowClick(row.districtName)}>
                <td><strong>#{row.rank}</strong></td>
                <td><strong>{row.districtName}</strong></td>
                <td>{row.totalPatients}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{row.highRiskCount} patients</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({row.highRiskPercent}%)</span>
                  </div>
                </td>
                <td>{row.screeningsThisMonth}</td>
                <td>{row.activeASHAs}</td>
                <td>{row.lastActivityDate ? formatDate(row.lastActivityDate) : 'No activity'}</td>
                <td>{getStatusBadge(row.status)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
