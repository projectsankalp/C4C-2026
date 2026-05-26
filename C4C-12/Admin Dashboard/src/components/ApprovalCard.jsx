/**
 * GraamSehat Admin Dashboard - Approval Card Component
 * Location: /src/components/ApprovalCard.jsx
 */

import React, { useState } from 'react';
import { formatDate } from '../utils/formatters';
import { Check, X, Phone, ShieldAlert } from 'lucide-react';
import './ApprovalCard.css';

export default function ApprovalCard({ worker, onApprove, onReject }) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = () => {
    if (window.confirm(`Are you sure you want to approve ${worker.name}?`)) {
      onApprove(worker.id);
    }
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    onReject(worker.id, rejectReason.trim());
    setShowRejectForm(false);
  };

  return (
    <div className="glass-card approval-card">
      <div className="approval-card-main">
        <div className="approval-avatar">
          {worker.name ? worker.name.charAt(0).toUpperCase() : 'W'}
        </div>
        <div className="approval-info">
          <h3 className="worker-name">{worker.name}</h3>
          <div className="worker-meta">
            <span className="meta-item"><strong>Emp ID:</strong> {worker.employeeId || 'N/A'}</span>
            <span className="meta-item"><strong>District:</strong> {worker.district}</span>
            <span className="meta-item"><strong>Sub-Centre:</strong> {worker.subCentre || 'N/A'}</span>
          </div>
          <div className="worker-contact">
            <Phone size={14} className="contact-icon" />
            <span>{worker.phone || 'No phone'}</span>
          </div>
        </div>
        <div className="approval-date">
          <span className="date-label">Signed up on</span>
          <span className="date-val">{formatDate(worker.createdAt)}</span>
        </div>
      </div>

      {!showRejectForm ? (
        <div className="approval-actions">
          <button className="btn btn-primary btn-approve" onClick={handleApprove}>
            <Check size={16} />
            <span>Approve Account</span>
          </button>
          <button className="btn btn-secondary btn-reject" onClick={() => setShowRejectForm(true)}>
            <X size={16} />
            <span>Reject</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleRejectSubmit} className="reject-form-panel">
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label className="form-label">Reason for Rejection</label>
            <textarea
              className="form-input reject-textarea"
              placeholder="e.g. Employee ID could not be verified in registry."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={2}
              required
            />
          </div>
          <div className="reject-form-actions">
            <button type="submit" className="btn btn-danger btn-sm">
              Confirm Rejection
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowRejectForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
