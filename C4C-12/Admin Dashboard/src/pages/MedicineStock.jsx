/**
 * GraamSehat Admin Dashboard - Medicine Stock Page
 * Location: /src/pages/MedicineStock.jsx
 */

import React, { useMemo, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { createRestockRequest } from '../firebase/users.admin';
import AlertBanner from '../components/AlertBanner';
import { Package, Send, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import './MedicineStock.css';

export default function MedicineStock() {
  const { currentAdmin, ashaWorkers } = useAdmin();
  const [successMessage, setSuccessMessage] = useState('');
  const [requestingId, setRequestingId] = useState(null);

  // Group and aggregate stock totals per district
  const districtSummaries = useMemo(() => {
    const summary = {};
    ashaWorkers.forEach((worker) => {
      if (worker.status !== 'approved') return; // Only track approved active workers
      const dist = worker.district || 'Other';
      if (!summary[dist]) {
        summary[dist] = {
          district: dist,
          Metformin: 0,
          Amlodipine: 0,
          Atenolol: 0,
          ORS: 0,
          workersCount: 0
        };
      }

      summary[dist].Metformin += Number(worker.medicines?.Metformin || 0);
      summary[dist].Amlodipine += Number(worker.medicines?.Amlodipine || 0);
      summary[dist].Atenolol += Number(worker.medicines?.Atenolol || 0);
      summary[dist].ORS += Number(worker.medicines?.ORS || 0);
      summary[dist].workersCount += 1;
    });

    return Object.values(summary);
  }, [ashaWorkers]);

  // Handle Restock Request
  const handleRestockRequest = async (worker) => {
    // Determine top-up quantity (default top-up is to restore stock to 100 units for each medicine)
    const reqDetails = {
      ashaWorkerId: worker.id,
      ashaName: worker.name,
      district: worker.district,
      employeeId: worker.employeeId,
      items: {
        Metformin: Math.max(0, 100 - (worker.medicines?.Metformin || 0)),
        Amlodipine: Math.max(0, 100 - (worker.medicines?.Amlodipine || 0)),
        Atenolol: Math.max(0, 100 - (worker.medicines?.Atenolol || 0)),
        ORS: Math.max(0, 100 - (worker.medicines?.ORS || 0))
      }
    };

    const confirmMsg = `Submit restock request for ${worker.name} (${worker.district})?\n\nReplenishment Quantities:\n` +
      `- Metformin: +${reqDetails.items.Metformin} units\n` +
      `- Amlodipine: +${reqDetails.items.Amlodipine} units\n` +
      `- Atenolol: +${reqDetails.items.Atenolol} units\n` +
      `- ORS: +${reqDetails.items.ORS} units`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setRequestingId(worker.id);
      setSuccessMessage('');
      await createRestockRequest(currentAdmin.uid, reqDetails);
      setSuccessMessage(`Restock order submitted successfully for ${worker.name}.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      console.error(error);
      alert('Failed to submit restock request.');
    } finally {
      setRequestingId(null);
    }
  };

  // Check if any medicine stock for a worker is below 10 units
  const isStockCritical = (medicines = {}) => {
    return (
      (medicines.Metformin !== undefined && medicines.Metformin < 10) ||
      (medicines.Amlodipine !== undefined && medicines.Amlodipine < 10) ||
      (medicines.Atenolol !== undefined && medicines.Atenolol < 10) ||
      (medicines.ORS !== undefined && medicines.ORS < 10)
    );
  };

  return (
    <div className="medicine-stock-page">
      <div className="medicine-header no-print">
        <div>
          <h1>Medicine Inventory & Distribution</h1>
          <p className="subtitle">Track supply levels across districts, monitor ASHA worker allocations, and dispatch restock logs.</p>
        </div>
      </div>

      {successMessage && (
        <div className="no-print">
          <AlertBanner message={successMessage} type="success" onClose={() => setSuccessMessage('')} />
        </div>
      )}

      {/* District-level Summary Panels */}
      <div className="district-summaries-section">
        <h3>District Inventory Summary</h3>
        <div className="district-summary-grid">
          {districtSummaries.length === 0 ? (
            <div className="glass-card summary-card-empty">No active stock registries.</div>
          ) : (
            districtSummaries.map((sum) => (
              <div key={sum.district} className="glass-card summary-card">
                <div className="summary-card-header">
                  <h4>{sum.district}</h4>
                  <span className="summary-worker-badge">{sum.workersCount} Workers</span>
                </div>
                <div className="summary-card-body">
                  <div className="stock-line"><span>Metformin:</span> <strong>{sum.Metformin}</strong></div>
                  <div className="stock-line"><span>Amlodipine:</span> <strong>{sum.Amlodipine}</strong></div>
                  <div className="stock-line"><span>Atenolol:</span> <strong>{sum.Atenolol}</strong></div>
                  <div className="stock-line"><span>ORS Packets:</span> <strong>{sum.ORS}</strong></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ASHA Stock Tables */}
      <div className="asha-stock-section">
        <h3>ASHA Worker Allocations</h3>
        
        <div className="table-container">
          <table className="clean-table">
            <thead>
              <tr>
                <th>ASHA Worker</th>
                <th>District</th>
                <th>Metformin</th>
                <th>Amlodipine</th>
                <th>Atenolol</th>
                <th>ORS</th>
                <th>Last Restocked</th>
                <th className="actions-column no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ashaWorkers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No ASHA worker records found.
                  </td>
                </tr>
              ) : (
                ashaWorkers.map((worker) => {
                  const meds = worker.medicines || {};
                  const isCrit = isStockCritical(meds);
                  
                  return (
                    <tr key={worker.id} className={isCrit ? 'row-critical-alert' : ''}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong>{worker.name}</strong>
                          {isCrit && <AlertTriangle size={14} className="critical-warning-icon" title="Stock level below 10 units!" />}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Emp ID: {worker.employeeId || 'N/A'}</span>
                      </td>
                      <td>{worker.district}</td>
                      <td className={Number(meds.Metformin || 0) < 10 ? 'stock-value critical-alert' : 'stock-value'}>
                        {meds.Metformin !== undefined ? meds.Metformin : 0}
                      </td>
                      <td className={Number(meds.Amlodipine || 0) < 10 ? 'stock-value critical-alert' : 'stock-value'}>
                        {meds.Amlodipine !== undefined ? meds.Amlodipine : 0}
                      </td>
                      <td className={Number(meds.Atenolol || 0) < 10 ? 'stock-value critical-alert' : 'stock-value'}>
                        {meds.Atenolol !== undefined ? meds.Atenolol : 0}
                      </td>
                      <td className={Number(meds.ORS || 0) < 10 ? 'stock-value critical-alert' : 'stock-value'}>
                        {meds.ORS !== undefined ? meds.ORS : 0}
                      </td>
                      <td>{worker.lastRestocked ? formatDate(worker.lastRestocked) : 'Never'}</td>
                      <td className="actions-column no-print">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleRestockRequest(worker)}
                          disabled={requestingId === worker.id}
                          style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Send size={12} />
                          <span>{requestingId === worker.id ? 'Sending...' : 'Restock'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
