/**
 * GraamSehat Admin Dashboard - Patient Table Component
 * Location: /src/components/PatientTable.jsx
 */

import React, { useState } from 'react';
import { formatDate, formatRiskLevel } from '../utils/formatters';
import { useAdmin } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import './PatientTable.css';

export default function PatientTable({ patients }) {
  const { ashaWorkers } = useAdmin();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Map ASHA worker ID to Name
  const getAshaName = (ashaId) => {
    if (!ashaId) return 'N/A';
    const worker = ashaWorkers.find(w => w.id === ashaId);
    return worker ? worker.name : 'Unknown';
  };

  const getRiskBadge = (risk) => {
    const norm = (risk || 'green').toLowerCase();
    return <span className={`badge badge-${norm}`}>{formatRiskLevel(norm)}</span>;
  };

  // Pagination logic
  const totalPages = Math.ceil(patients.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = patients.slice(startIndex, startIndex + itemsPerPage);

  const handleRowClick = (patientId) => {
    navigate(`/patient/${patientId}`);
  };

  return (
    <div className="patient-table-wrapper">
      <div className="table-container">
        <table className="clean-table">
          <thead>
            <tr>
              <th>UID</th>
              <th>Name</th>
              <th>Village</th>
              <th>District</th>
              <th>Risk</th>
              <th>Last Screened</th>
              <th>ASHA Worker</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPatients.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No patient records found matching the search criteria.
                </td>
              </tr>
            ) : (
              paginatedPatients.map((patient) => (
                <tr key={patient.id} onClick={() => handleRowClick(patient.id)}>
                  <td><strong>{patient.uid || patient.id}</strong></td>
                  <td><strong>{patient.name}</strong></td>
                  <td>{patient.village || 'N/A'}</td>
                  <td>{patient.district || 'N/A'}</td>
                  <td>{getRiskBadge(patient.riskLevel)}</td>
                  <td>{formatDate(patient.lastScreened)}</td>
                  <td>{getAshaName(patient.ashaWorkerId)}</td>
                  <td className="actions-column">
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(patient.id);
                      }}
                      style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={12} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {patients.length > itemsPerPage && (
        <div className="pagination-bar">
          <span className="pagination-info">
            Showing <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + itemsPerPage, patients.length)}</strong> of <strong>{patients.length}</strong> patients
          </span>
          <div className="pagination-buttons">
            <button 
              className="btn btn-secondary btn-sm pag-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <span className="page-indicator">Page {currentPage} of {totalPages}</span>
            <button 
              className="btn btn-secondary btn-sm pag-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
