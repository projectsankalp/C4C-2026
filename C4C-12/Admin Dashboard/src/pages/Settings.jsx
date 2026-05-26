/**
 * GraamSehat Admin Dashboard - Settings & Audit Page
 * Location: /src/pages/Settings.jsx
 */

import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { formatDate, formatDateTime } from '../utils/formatters';
import { Shield, Clock, ShieldCheck, ListFilter, RefreshCw, Lock } from 'lucide-react';
import './Settings.css';

export default function Settings() {
  const { currentAdmin } = useAdmin();
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchAuditLogs = async () => {
    if (!currentAdmin) return;
    try {
      setLoadingLogs(true);
      const logRef = collection(db, 'adminActivityLog');
      // Query last 15 actions by this admin
      const q = query(
        logRef,
        where('adminId', '==', currentAdmin.uid),
        orderBy('timestamp', 'desc'),
        limit(15)
      );
      
      const querySnapshot = await getDocs(q);
      const auditList = [];
      querySnapshot.forEach((doc) => {
        auditList.push({ id: doc.id, ...doc.data() });
      });
      setLogs(auditList);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      // Fallback: fetch all logs if composite index isn't created yet
      try {
        const fallbackQ = query(
          collection(db, 'adminActivityLog'),
          orderBy('timestamp', 'desc'),
          limit(15)
        );
        const snapshot = await getDocs(fallbackQ);
        const list = [];
        snapshot.forEach(doc => {
          if (doc.data().adminId === currentAdmin.uid) {
            list.push({ id: doc.id, ...doc.data() });
          }
        });
        setLogs(list);
      } catch (err) {
        console.error('Fallback query failed:', err);
      }
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [currentAdmin]);

  const getActionClass = (action) => {
    const act = action.toUpperCase();
    if (act.includes('APPROVE') || act.includes('CREATE')) return 'action-badge action-success';
    if (act.includes('REJECT') || act.includes('SUSPEND') || act.includes('DELETE')) return 'action-badge action-danger';
    return 'action-badge action-info';
  };

  return (
    <div className="settings-page">
      <div className="settings-header no-print">
        <h1>Admin Settings & Auditing</h1>
        <p className="subtitle">Configure portal preferences, view security policies, and trace your administrative action logs.</p>
      </div>

      <div className="settings-grid">
        {/* Left Column: Profile and Security policies */}
        <div className="settings-column-left">
          {/* Profile Card */}
          <div className="glass-card settings-card">
            <h3 className="settings-title"><Shield size={18} /> Admin Account Details</h3>
            <div className="settings-profile-info">
              <div className="profile-badge-large">
                {currentAdmin?.name ? currentAdmin.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="profile-details-list">
                <div className="profile-row">
                  <span className="profile-lbl">Name</span>
                  <span className="profile-val">{currentAdmin?.name || 'System Admin'}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-lbl">Email</span>
                  <span className="profile-val">{currentAdmin?.email}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-lbl">Permission Role</span>
                  <span className="profile-val badge badge-blue">
                    <ShieldCheck size={12} style={{ marginRight: '4px' }} />
                    {currentAdmin?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Preferences */}
          <div className="glass-card settings-card">
            <h3 className="settings-title"><Lock size={18} /> Security Policies</h3>
            <div className="policies-list">
              <div className="policy-item">
                <div className="policy-item-icon">
                  <Clock size={16} />
                </div>
                <div className="policy-item-body">
                  <strong>Auto Session Timeout</strong>
                  <p>Inactivity timeout is configured to <strong>8 hours</strong>. You will be signed out automatically after 8 hours of idle time.</p>
                </div>
              </div>
              <div className="policy-item">
                <div className="policy-item-icon">
                  <Shield size={16} />
                </div>
                <div className="policy-item-body">
                  <strong>Data Privacy Restrictions</strong>
                  <p>Unmasked phone numbers and Aadhaar details are only pulled inside this admin portal environment. Custom logs record all lookup attempts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Audit logs */}
        <div className="settings-column-right no-print">
          <div className="glass-card audit-logs-card">
            <div className="audit-header">
              <h3 className="settings-title"><ListFilter size={18} /> Admin Action Logs (Last 15)</h3>
              <button className="btn-refresh-logs" onClick={fetchAuditLogs} disabled={loadingLogs}>
                <RefreshCw size={14} className={loadingLogs ? 'spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="audit-logs-list">
              {loadingLogs && logs.length === 0 ? (
                <div className="logs-loading">Retrieving activity entries...</div>
              ) : logs.length === 0 ? (
                <div className="logs-empty">No activity records logged in this session yet.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="audit-log-item">
                    <div className="log-item-header">
                      <span className={getActionClass(log.action)}>{log.action}</span>
                      <span className="log-time">{formatDateTime(log.timestamp)}</span>
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="log-item-details">
                        {Object.entries(log.details).map(([key, val]) => (
                          <span key={key} className="detail-tag">
                            <strong>{key}:</strong> {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
