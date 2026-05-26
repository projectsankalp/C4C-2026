/**
 * GraamSehat Admin Dashboard - Approval Queue Page
 * Location: /src/pages/ApprovalQueue.jsx
 */

import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { approveASHAWorker, rejectASHAWorker } from '../firebase/users.admin';
import ApprovalCard from '../components/ApprovalCard';
import AlertBanner from '../components/AlertBanner';
import { UserCheck, HelpCircle } from 'lucide-react';
import './ApprovalQueue.css';

export default function ApprovalQueue() {
  const { currentAdmin, pendingApprovals } = useAdmin();
  const [infoMessage, setInfoMessage] = useState('');

  const handleApprove = async (workerId) => {
    try {
      setInfoMessage('');
      await approveASHAWorker(currentAdmin.uid, workerId);
      setInfoMessage('ASHA worker account approved successfully.');
      setTimeout(() => setInfoMessage(''), 4000);
    } catch (error) {
      console.error(error);
      alert('Failed to approve ASHA worker.');
    }
  };

  const handleReject = async (workerId, reason) => {
    try {
      setInfoMessage('');
      await rejectASHAWorker(currentAdmin.uid, workerId, reason);
      setInfoMessage('ASHA worker account rejected.');
      setTimeout(() => setInfoMessage(''), 4000);
    } catch (error) {
      console.error(error);
      alert('Failed to reject ASHA worker.');
    }
  };

  return (
    <div className="approval-queue-page">
      <div className="queue-header no-print">
        <div>
          <h1>ASHA Signup Approvals</h1>
          <p className="subtitle">Review and authorize new ASHA worker accounts. Approved workers gain credentials to sync patient databases.</p>
        </div>
      </div>

      {infoMessage && (
        <div className="no-print">
          <AlertBanner message={infoMessage} type="success" onClose={() => setInfoMessage('')} />
        </div>
      )}

      <div className="queue-layout">
        {/* Pending approvals list */}
        <div className="queue-list-section">
          {pendingApprovals.length === 0 ? (
            <div className="glass-card empty-queue-card">
              <UserCheck size={40} className="empty-queue-icon" />
              <h3>All caught up!</h3>
              <p>There are no pending ASHA worker signup requests requiring authorization.</p>
            </div>
          ) : (
            <div className="queue-cards-grid">
              {pendingApprovals.map((worker) => (
                <ApprovalCard 
                  key={worker.id}
                  worker={worker}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </div>

        {/* Informative Help Panel */}
        <div className="queue-info-panel no-print">
          <div className="glass-card info-help-card">
            <div className="help-header">
              <HelpCircle size={16} />
              <h4>Registry Policy Details</h4>
            </div>
            <ul className="help-rules-list">
              <li>ASHA workers cannot self-activate. An administrator must verify and approve accounts.</li>
              <li>Verification involves matching the registered <strong>Employee ID</strong> against the district healthcare database.</li>
              <li>Rejection requires a documented reason, which will restrict registration access.</li>
              <li>Approval immediately activates writing permissions for patient screening uploads.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
