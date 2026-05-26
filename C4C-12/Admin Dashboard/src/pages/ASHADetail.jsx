/**
 * GraamSehat Admin Dashboard - ASHA Worker Detail Page
 * Location: /src/pages/ASHADetail.jsx
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { toggleASHAStatus } from '../firebase/users.admin';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { formatDate } from '../utils/formatters';
import AlertBanner from '../components/AlertBanner';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  Activity, 
  AlertOctagon, 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  Pill,
  Lock,
  Unlock,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './ASHADetail.css';

export default function ASHADetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentAdmin, patients, screenings } = useAdmin();
  
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch Worker Profile
  const fetchWorker = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().role === 'asha') {
        setWorker({ id: docSnap.id, ...docSnap.data() });
        setError(null);
      } else {
        throw new Error('ASHA worker profile not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load ASHA worker profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorker();
  }, [id]);

  // Handle Approve/Suspend status toggle
  const handleStatusToggle = async () => {
    const isApproved = worker.status === 'approved';
    const newStatus = isApproved ? 'suspended' : 'approved';
    const confirmMsg = isApproved 
      ? `Are you sure you want to suspend ASHA worker ${worker.name}? Suspended accounts cannot log in to ASHA Worker App.`
      : `Approve ASHA worker ${worker.name}?`;
      
    if (!window.confirm(confirmMsg)) return;

    try {
      setUpdatingStatus(true);
      await toggleASHAStatus(currentAdmin.uid, id, newStatus);
      setWorker(prev => ({ ...prev, status: newStatus }));
      alert(`Account status updated to ${newStatus} successfully.`);
    } catch (err) {
      console.error(err);
      alert('Failed to update account status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Compile stats
  const performanceStats = useMemo(() => {
    if (!worker) return { screeningsCount: 0, patientsRegistered: 0, redAlerts: 0, medsCount: 0 };

    // 1. Screenings conducted by this ASHA
    const ashaScreenings = screenings.filter(s => s.ashaWorkerId === id);
    const screeningsCount = ashaScreenings.length || worker.screeningsCount || 0;

    // 2. Patients registered by this ASHA
    const patientsRegistered = patients.filter(p => p.ashaWorkerId === id).length;

    // 3. Red Risk cases detected
    const redAlerts = patients.filter(p => p.ashaWorkerId === id && p.riskLevel === 'red').length;

    // 4. Medicine units distributed
    let medsCount = 0;
    ashaScreenings.forEach(s => {
      if (s.medicinesDistributed) {
        Object.values(s.medicinesDistributed).forEach(qty => {
          medsCount += Number(qty) || 0;
        });
      }
    });

    return {
      screeningsCount,
      patientsRegistered,
      redAlerts,
      medsCount
    };
  }, [worker, patients, screenings, id]);

  // Screened patients directory list
  const workerPatients = useMemo(() => {
    return patients.filter(p => p.ashaWorkerId === id);
  }, [patients, id]);

  // Screenings Monthly Chart data
  const monthlyActivityData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const mockCounts = {};

    months.forEach(m => {
      mockCounts[m] = 0;
    });

    const ashaScreenings = screenings.filter(s => s.ashaWorkerId === id);
    
    ashaScreenings.forEach(s => {
      const sDate = s.timestamp ? (s.timestamp.toDate ? s.timestamp.toDate() : new Date(s.timestamp)) : null;
      if (sDate && sDate.getFullYear() === currentYear) {
        const mLabel = sDate.toLocaleString('default', { month: 'short' });
        if (mockCounts[mLabel] !== undefined) {
          mockCounts[mLabel] += 1;
        }
      }
    });

    return months.map(m => ({
      month: m,
      screenings: mockCounts[m]
    }));
  }, [screenings, id]);

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'approved') {
      return (
        <span className="badge badge-green">
          <ShieldCheck size={12} />
          <span>Active / Approved</span>
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
    return <span className="badge badge-yellow">Pending Approval</span>;
  };

  if (loading) return <div className="loading-container">Loading ASHA worker profile...</div>;
  if (error) return <div className="content-body"><AlertBanner message={error} type="error" /></div>;
  if (!worker) return null;

  return (
    <div className="asha-detail-page">
      {/* Navigation and Actions */}
      <div className="detail-navigation no-print">
        <button className="btn btn-secondary back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          <span>Back to Registry</span>
        </button>
        <span className="nav-patient-indicator">Worker detail: {worker.name}</span>
      </div>

      {/* Header Profile card */}
      <div className="asha-detail-header glass-card">
        <div className="header-info-wrapper">
          <div className="asha-avatar">
            {worker.name.charAt(0).toUpperCase()}
          </div>
          <div className="asha-title-block">
            <div className="asha-name-row">
              <h2>{worker.name}</h2>
              {getStatusBadge(worker.status)}
            </div>
            <p className="emp-id-txt">Employee ID: {worker.employeeId || 'N/A'}</p>
            <p className="subcentre-txt"><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} /> {worker.subCentre || 'No Sub-Centre'}, {worker.district} District</p>
          </div>
        </div>

        {/* Approve/Suspend Toggle Button */}
        <div className="status-toggle-wrapper no-print">
          {worker.status === 'approved' ? (
            <button 
              className="btn btn-danger" 
              onClick={handleStatusToggle} 
              disabled={updatingStatus}
            >
              <Lock size={16} />
              <span>{updatingStatus ? 'Processing...' : 'Suspend Account'}</span>
            </button>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={handleStatusToggle} 
              disabled={updatingStatus}
            >
              <Unlock size={16} />
              <span>{updatingStatus ? 'Processing...' : 'Approve Account'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="asha-stats-grid">
        <div className="glass-card asha-stat-box">
          <Activity size={24} className="stat-icon-theme" />
          <div className="stat-data">
            <span className="stat-lbl">Screenings Completed</span>
            <h3>{performanceStats.screeningsCount}</h3>
          </div>
        </div>
        <div className="glass-card asha-stat-box">
          <User size={24} className="stat-icon-theme" />
          <div className="stat-data">
            <span className="stat-lbl">Registered Patients</span>
            <h3>{performanceStats.patientsRegistered}</h3>
          </div>
        </div>
        <div className="glass-card asha-stat-box box-red">
          <AlertOctagon size={24} className="stat-icon-red" />
          <div className="stat-data">
            <span className="stat-lbl">High-Risk Cases Flagged</span>
            <h3 style={{ color: 'var(--risk-red)' }}>{performanceStats.redAlerts}</h3>
          </div>
        </div>
        <div className="glass-card asha-stat-box">
          <Pill size={24} className="stat-icon-theme" />
          <div className="stat-data">
            <span className="stat-lbl">Medicines Distributed</span>
            <h3>{performanceStats.medsCount} units</h3>
          </div>
        </div>
      </div>

      <div className="asha-detail-body-grid">
        {/* Left: Screenings bar chart */}
        <div className="asha-column-left">
          <div className="glass-card no-print">
            <h3 className="section-title"><Activity size={18} /> Monthly Screening Volumes ({new Date().getFullYear()})</h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="screenings" name="Screenings" fill="var(--primary)" radius={[4, 4, 0, 0]}>
                    {monthlyActivityData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.screenings > 0 ? 'var(--primary)' : 'rgba(13, 148, 136, 0.2)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Contact Details card */}
          <div className="glass-card section-card">
            <h3 className="section-title"><Phone size={18} /> Profile Contact Details</h3>
            <div className="contact-details-grid">
              <div className="contact-cell">
                <span className="contact-lbl">Phone Number</span>
                <span className="contact-val">{worker.phone}</span>
              </div>
              <div className="contact-cell">
                <span className="contact-lbl">Email Address</span>
                <span className="contact-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={14} /> {worker.email || 'N/A'}
                </span>
              </div>
              <div className="contact-cell">
                <span className="contact-lbl">Pending Offline Syncs</span>
                <span className="contact-val font-semibold text-primary">{worker.pendingSyncCount || 0} syncs</span>
              </div>
              <div className="contact-cell">
                <span className="contact-lbl">Sub-Centre Registry</span>
                <span className="contact-val">{worker.subCentre || 'Not Set'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Patient List screened by this ASHA worker */}
        <div className="asha-column-right">
          <div className="glass-card patient-list-card">
            <h3 className="section-title"><FileSpreadsheet size={18} /> Patients Managed ({workerPatients.length})</h3>
            <div className="asha-patients-list">
              {workerPatients.length === 0 ? (
                <p className="timeline-empty">This ASHA worker has not registered or screened any patients yet.</p>
              ) : (
                workerPatients.map((patient) => (
                  <div 
                    key={patient.id} 
                    className="asha-patient-item"
                    onClick={() => navigate(`/patient/${patient.id}`)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong className="p-name">{patient.name}</strong>
                      <span className="p-village">{patient.village}, {patient.district}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge badge-${(patient.riskLevel || 'green').toLowerCase()}`}>
                        {patient.riskLevel}
                      </span>
                    </div>
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
