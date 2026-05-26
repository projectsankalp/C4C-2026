/**
 * GraamSehat Admin Dashboard - Patient Detail Page
 * Location: /src/pages/PatientDetail.jsx
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { getPatientById, updatePatientNotes } from '../firebase/patients.admin';
import { formatDate, maskAadhaar, formatRiskLevel } from '../utils/formatters';
import AlertBanner from '../components/AlertBanner';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  ShieldAlert, 
  Calendar, 
  Heart, 
  Droplet,
  ClipboardList,
  Clock,
  Pill,
  UserPlus,
  UserCheck,
  TrendingUp,
  Save,
  MessageSquare
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './PatientDetail.css';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentAdmin, ashaWorkers, screenings } = useAdmin();
  
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Admin Notes State
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Expandable screening section state
  const [expandedScreeningId, setExpandedScreeningId] = useState(null);

  // Fetch Patient Details
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const data = await getPatientById(id);
        setPatient(data);
        setNotes(data.notes || '');
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load patient record. Verify if patient ID exists.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  // Handle Notes Save
  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      setSuccessMsg('');
      await updatePatientNotes(currentAdmin.uid, id, notes, patient.name);
      setSuccessMsg('Notes saved successfully & logged.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  // Find ASHA assigned
  const assignedASHA = useMemo(() => {
    if (!patient || !patient.ashaWorkerId) return null;
    return ashaWorkers.find(w => w.id === patient.ashaWorkerId) || null;
  }, [patient, ashaWorkers]);

  // Screenings associated with this patient
  const patientScreenings = useMemo(() => {
    if (!patient) return [];
    
    // Check if screenings list is embedded or query general screenings
    const list = patient.screenings || [];
    if (list.length > 0) return list;

    // Fallback: search in general screenings matching patient UID or ID
    return screenings.filter(s => s.patientId === id || s.patientUid === patient.uid);
  }, [patient, screenings, id]);

  // Compile Risk History Chart Data (e.g. green=1, yellow=2, red=3)
  const riskChartData = useMemo(() => {
    if (!patient) return [];
    
    // We can extract from patient.riskHistory or patientScreenings
    const history = patient.riskHistory || [];
    if (history.length > 0) {
      return history.map(h => {
        const dateVal = h.timestamp?.toDate ? h.timestamp.toDate() : new Date(h.timestamp || h.date);
        let numVal = 1;
        if (h.riskLevel === 'yellow' || h.riskLevel === 'moderate') numVal = 2;
        if (h.riskLevel === 'red' || h.riskLevel === 'high') numVal = 3;
        
        return {
          date: formatDate(dateVal),
          dateObj: dateVal,
          risk: numVal,
          riskLabel: formatRiskLevel(h.riskLevel)
        };
      }).sort((a, b) => a.dateObj - b.dateObj);
    }

    // Compile from screenings timeline
    return patientScreenings.map(s => {
      const dateVal = s.timestamp?.toDate ? s.timestamp.toDate() : new Date(s.timestamp || s.date);
      let numVal = 1;
      if (s.riskLevel === 'yellow' || s.riskLevel === 'moderate') numVal = 2;
      if (s.riskLevel === 'red' || s.riskLevel === 'high') numVal = 3;

      return {
        date: formatDate(dateVal),
        dateObj: dateVal,
        risk: numVal,
        riskLabel: formatRiskLevel(s.riskLevel)
      };
    }).sort((a, b) => a.dateObj - b.dateObj);
  }, [patient, patientScreenings]);

  if (loading) return <div className="loading-container">Loading Patient Record...</div>;
  if (error) return <div className="content-body"><AlertBanner message={error} type="error" /></div>;
  if (!patient) return null;

  return (
    <div className="patient-detail-page">
      {/* Back navigation header */}
      <div className="detail-navigation no-print">
        <button className="btn btn-secondary back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          <span>Back to Registry</span>
        </button>
        <span className="nav-patient-indicator">Patient detail: {patient.name}</span>
      </div>

      {/* Header Info Banner */}
      <div className="patient-detail-header glass-card">
        <div className="header-avatar-section">
          {patient.photoUrl ? (
            <img src={patient.photoUrl} alt={patient.name} className="patient-photo" />
          ) : (
            <div className="patient-detail-avatar">
              {patient.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="patient-header-text">
            <div className="name-row">
              <h2>{patient.name}</h2>
              <span className={`badge badge-${(patient.riskLevel || 'green').toLowerCase()}`}>
                {formatRiskLevel(patient.riskLevel)} Risk
              </span>
            </div>
            <p className="uid-txt">UID: {patient.uid || patient.id}</p>
            <p className="reg-date">Registered on: {formatDate(patient.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="patient-detail-grid">
        {/* Left Grid: Personal, Contact, Health readings */}
        <div className="detail-column-left">
          {/* Personal Info */}
          <div className="glass-card section-card">
            <h3 className="section-title"><User size={18} /> Personal Information</h3>
            <div className="detail-info-grid">
              <div className="info-cell">
                <span className="info-label">Age</span>
                <span className="info-val">{patient.age || 'N/A'} yrs</span>
              </div>
              <div className="info-cell">
                <span className="info-label">Gender</span>
                <span className="info-val">{patient.gender || 'N/A'}</span>
              </div>
              <div className="info-cell">
                <span className="info-label">Blood Group</span>
                <span className="info-val text-red">
                  <Droplet size={14} style={{ display: 'inline', fill: 'currentColor' }} /> {patient.bloodGroup || 'N/A'}
                </span>
              </div>
              <div className="info-cell">
                <span className="info-label">Aadhaar Card</span>
                <span className="info-val">{maskAadhaar(patient.aadhaar)}</span>
              </div>
              <div className="info-cell">
                <span className="info-label">Village</span>
                <span className="info-val">{patient.village || 'N/A'}</span>
              </div>
              <div className="info-cell">
                <span className="info-label">District</span>
                <span className="info-val">{patient.district || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Contact Details (Unmasked) */}
          <div className="glass-card section-card">
            <h3 className="section-title"><Phone size={18} /> Contact Details</h3>
            <div className="detail-info-grid">
              <div className="info-cell cell-full">
                <span className="info-label">Primary Mobile (Unmasked - Admin View)</span>
                <span className="info-val text-primary highlight-phone">{patient.phone || 'N/A'}</span>
              </div>
              {patient.alternatePhone && (
                <div className="info-cell cell-full">
                  <span className="info-label">Alternate Mobile</span>
                  <span className="info-val">{patient.alternatePhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Latest Readings */}
          <div className="glass-card section-card">
            <h3 className="section-title"><Heart size={18} /> Latest Vitals & Screening Readings</h3>
            <div className="detail-info-grid">
              <div className="info-cell">
                <span className="info-label">Blood Pressure (BP)</span>
                <span className="info-val">
                  {patient.latestSystolic && patient.latestDiastolic 
                    ? `${patient.latestSystolic}/${patient.latestDiastolic} mmHg`
                    : patient.bp || 'N/A'}
                </span>
              </div>
              <div className="info-cell">
                <span className="info-label">Blood Sugar (Glucose)</span>
                <span className="info-val">
                  {patient.latestGlucose ? `${patient.latestGlucose} mg/dL` : patient.glucose || 'N/A'}
                </span>
              </div>
              <div className="info-cell">
                <span className="info-label">IDRS Score (Diabetes Risk)</span>
                <span className="info-val font-semibold">{patient.latestIdrs || patient.idrs || 'N/A'}</span>
              </div>
              <div className="info-cell cell-full">
                <span className="info-label">Symptom Checklist</span>
                <div className="symptoms-tags">
                  {patient.symptoms && patient.symptoms.length > 0 ? (
                    patient.symptoms.map(sym => (
                      <span key={sym} className="symptom-tag">{sym}</span>
                    ))
                  ) : (
                    <span className="no-symptoms">No symptoms reported.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Expandable Screenings Timeline */}
          <div className="glass-card section-card">
            <h3 className="section-title"><Clock size={18} /> Screenings Timeline</h3>
            <div className="timeline-container">
              {patientScreenings.length === 0 ? (
                <p className="timeline-empty">No screening logs recorded for this patient.</p>
              ) : (
                patientScreenings.map((screening, idx) => {
                  const sId = screening.id || idx;
                  const isExpanded = expandedScreeningId === sId;
                  const scrDate = screening.timestamp?.toDate ? screening.timestamp.toDate() : new Date(screening.timestamp || screening.date);
                  
                  return (
                    <div key={sId} className="timeline-item">
                      <div className="timeline-badge" style={{ backgroundColor: `var(--risk-${screening.riskLevel || 'green'})` }} />
                      <div className="timeline-main">
                        <div className="timeline-header" onClick={() => setExpandedScreeningId(isExpanded ? null : sId)}>
                          <div className="timeline-header-left">
                            <strong>Screening Session #{patientScreenings.length - idx}</strong>
                            <span>{formatDate(scrDate)}</span>
                          </div>
                          <button className="btn btn-secondary btn-sm timeline-toggle-btn">
                            {isExpanded ? 'Hide Readings' : 'Expand Details'}
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="timeline-details-panel">
                            <div className="timeline-details-grid">
                              <div><strong>BP:</strong> {screening.systolic}/{screening.diastolic} mmHg</div>
                              <div><strong>Glucose:</strong> {screening.glucose} mg/dL</div>
                              <div><strong>IDRS Score:</strong> {screening.idrs}</div>
                              <div><strong>Risk:</strong> <span className={`badge badge-${screening.riskLevel}`}>{screening.riskLevel}</span></div>
                            </div>
                            {screening.symptoms && screening.symptoms.length > 0 && (
                              <div style={{ marginTop: '0.5rem' }}>
                                <strong>Symptoms:</strong> {screening.symptoms.join(', ')}
                              </div>
                            )}
                            {screening.medicinesDistributed && Object.keys(screening.medicinesDistributed).length > 0 && (
                              <div className="distributed-medicines" style={{ marginTop: '0.5rem' }}>
                                <strong>Medicines Dispensed:</strong>
                                <ul style={{ fontSize: '0.75rem', paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
                                  {Object.entries(screening.medicinesDistributed).map(([med, qty]) => (
                                    <li key={med}>{med}: {qty} units</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Grid: Risk chart, assigned worker, medicine, notes, links */}
        <div className="detail-column-right">
          {/* Risk History Chart */}
          <div className="glass-card section-card no-print">
            <h3 className="section-title"><TrendingUp size={18} /> Risk Level Over Time</h3>
            <div style={{ width: '100%', height: 180 }}>
              {riskChartData.length === 0 ? (
                <div className="empty-panel-text" style={{ padding: '2rem' }}>Not enough data points for risk tracking.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={9} />
                    <YAxis 
                      domain={[0.8, 3.2]} 
                      ticks={[1, 2, 3]} 
                      tickFormatter={(val) => {
                        if (val === 1) return 'Green';
                        if (val === 2) return 'Yellow';
                        if (val === 3) return 'Red';
                        return '';
                      }}
                      stroke="#64748B" 
                      fontSize={9}
                    />
                    <Tooltip 
                      formatter={(value, name, props) => [props.payload.riskLabel, 'Risk Status']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="risk" 
                      stroke="var(--primary)" 
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Assigned ASHA Worker */}
          <div className="glass-card section-card">
            <h3 className="section-title"><UserCheck size={18} /> Assigned ASHA Worker</h3>
            {assignedASHA ? (
              <div className="asha-profile-mini" onClick={() => navigate(`/asha/${assignedASHA.id}`)}>
                <div className="mini-avatar">
                  {assignedASHA.name.charAt(0).toUpperCase()}
                </div>
                <div className="mini-details">
                  <h4>{assignedASHA.name}</h4>
                  <p>District: {assignedASHA.district}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <Phone size={12} /> {assignedASHA.phone}
                  </div>
                </div>
              </div>
            ) : (
              <p className="timeline-empty">No ASHA worker assigned to this patient.</p>
            )}
          </div>

          {/* Medicine History */}
          <div className="glass-card section-card">
            <h3 className="section-title"><Pill size={18} /> Medicine History</h3>
            <div className="med-history-list">
              {patient.medicineHistory && patient.medicineHistory.length > 0 ? (
                patient.medicineHistory.map((med, idx) => (
                  <div key={idx} className="med-history-item">
                    <span className="med-name">{med.name}</span>
                    <span className="med-dosage">{med.dosage} - Qty: {med.quantity}</span>
                    <span className="med-date">Issued: {formatDate(med.date)}</span>
                  </div>
                ))
              ) : (
                <p className="timeline-empty">No medicine dispense logs available.</p>
              )}
            </div>
          </div>

          {/* Family Members Linked */}
          <div className="glass-card section-card">
            <h3 className="section-title"><UserPlus size={18} /> Family Members Linked</h3>
            <div className="family-members-list">
              {patient.familyMembers && patient.familyMembers.length > 0 ? (
                patient.familyMembers.map((famId) => (
                  <div 
                    key={famId} 
                    className="family-member-tag clickable"
                    onClick={() => navigate(`/patient/${famId}`)}
                  >
                    <span>Patient ID: {famId}</span>
                  </div>
                ))
              ) : (
                <p className="timeline-empty">No linked family records.</p>
              )}
            </div>
          </div>

          {/* Admin-only Notes */}
          <div className="glass-card section-card no-print">
            <h3 className="section-title"><MessageSquare size={18} /> Admin-Only Notes</h3>
            <div className="notes-box">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter private administrative observations, clinical follow-up schedules, or patient case progress notes..."
                className="form-input notes-textarea"
                rows={4}
              />
              <button 
                className="btn btn-primary notes-save-btn" 
                onClick={handleSaveNotes}
                disabled={savingNotes}
              >
                <Save size={16} />
                <span>{savingNotes ? 'Saving Notes...' : 'Save Notes'}</span>
              </button>
              {successMsg && <div className="notes-success-toast">{successMsg}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
