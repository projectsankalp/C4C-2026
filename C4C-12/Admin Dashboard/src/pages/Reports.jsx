/**
 * GraamSehat Admin Dashboard - Reports Page
 * Location: /src/pages/Reports.jsx
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { 
  getScreeningSummaryReportData, 
  getHighRiskPatientReportData, 
  getASHAActivityReportData, 
  getMedicineDistributionReportData 
} from '../firebase/reports';
import ExportButton from '../components/ExportButton';
import { formatDate } from '../utils/formatters';
import { KARNATAKA_DISTRICTS } from '../utils/constants';
import { FileText, Calendar, Filter, Printer, Download, Eye } from 'lucide-react';
import './Reports.css';

export default function Reports() {
  const { ashaWorkers } = useAdmin();
  const [activeTab, setActiveTab] = useState('screenings'); // screenings, high-risk, asha-activity, medicine
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);

  // Report 1 Filters (Screening Summary)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [ashaFilter, setAshaFilter] = useState('');

  // Fetch report data based on active tab and filters
  const fetchReportData = async () => {
    try {
      setLoading(true);
      let data = [];
      if (activeTab === 'screenings') {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        data = await getScreeningSummaryReportData(start, end, districtFilter, ashaFilter);
      } else if (activeTab === 'high-risk') {
        data = await getHighRiskPatientReportData();
      } else if (activeTab === 'asha-activity') {
        data = await getASHAActivityReportData();
      } else if (activeTab === 'medicine') {
        data = await getMedicineDistributionReportData();
      }
      setReportData(data);
    } catch (error) {
      console.error('Error compiling report data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeTab, startDate, endDate, districtFilter, ashaFilter]);

  // Helper to format output lists for CSV downloads
  const csvExportData = useMemo(() => {
    if (activeTab === 'screenings') {
      return reportData.map(item => ({
        'Screening ID': item.id,
        'Patient Name': item.patientName || 'N/A',
        'District': item.district || 'N/A',
        'ASHA Worker': item.ashaName || 'N/A',
        'Risk Status': item.riskLevel || 'N/A',
        'Blood Pressure': item.systolic && item.diastolic ? `${item.systolic}/${item.diastolic}` : 'N/A',
        'Glucose Level': item.glucose || 'N/A',
        'IDRS Score': item.idrs || 'N/A',
        'Screening Date': item.formattedDate
      }));
    }
    
    if (activeTab === 'high-risk') {
      return reportData.map(p => ({
        'Patient UID': p.uid || p.id,
        'Name': p.name,
        'Age': p.age,
        'Gender': p.gender,
        'Village': p.village,
        'District': p.district,
        'Risk Category': p.riskLevel,
        'Last Screened': p.lastScreened ? (p.lastScreened.toDate ? p.lastScreened.toDate().toLocaleDateString('en-IN') : new Date(p.lastScreened).toLocaleDateString('en-IN')) : 'Never',
        'Phone Number': p.phone
      }));
    }

    if (activeTab === 'asha-activity') {
      return reportData.map(item => ({
        'ASHA Worker Name': item.ashaName,
        'District': item.district,
        'Year': item.year,
        'Month': item.month,
        'Monthly Screenings Count': item.screeningsCount
      }));
    }

    if (activeTab === 'medicine') {
      return reportData.map(item => {
        // Flatten medicines map to a readable string e.g. Metformin: 10, ORS: 2
        const medsStr = Object.entries(item.medicines || {})
          .map(([med, qty]) => `${med}: ${qty}`)
          .join(' | ');
        return {
          'Distributed By (ASHA)': item.ashaName,
          'District': item.district,
          'Patient Name': item.patientName,
          'Date Issued': item.date,
          'Medicines List': medsStr
        };
      });
    }

    return [];
  }, [activeTab, reportData]);

  return (
    <div className="reports-page">
      <div className="reports-header no-print">
        <div>
          <h1>Operational Reports & Exports</h1>
          <p className="subtitle">Filter healthcare records, preview aggregates, and export to CSV or PDF printable reports.</p>
        </div>
      </div>

      {/* Tabs Selector Bar */}
      <div className="reports-tabs-bar no-print">
        <button 
          className={`tab-btn ${activeTab === 'screenings' ? 'active' : ''}`}
          onClick={() => setActiveTab('screenings')}
        >
          Screening Summary
        </button>
        <button 
          className={`tab-btn ${activeTab === 'high-risk' ? 'active' : ''}`}
          onClick={() => setActiveTab('high-risk')}
        >
          High-Risk Patients
        </button>
        <button 
          className={`tab-btn ${activeTab === 'asha-activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('asha-activity')}
        >
          ASHA Worker Activity
        </button>
        <button 
          className={`tab-btn ${activeTab === 'medicine' ? 'active' : ''}`}
          onClick={() => setActiveTab('medicine')}
        >
          Medicine Distributions
        </button>
      </div>

      {/* Report Custom Filters Block */}
      {activeTab === 'screenings' && (
        <div className="glass-card report-filters-panel no-print">
          <div className="filters-title">
            <Filter size={14} />
            <span>Filter Report Parameters</span>
          </div>
          <div className="filters-grid">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">District</label>
              <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} className="form-input">
                <option value="">All Districts</option>
                {KARNATAKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">ASHA Worker</label>
              <select value={ashaFilter} onChange={(e) => setAshaFilter(e.target.value)} className="form-input">
                <option value="">All Workers</option>
                {ashaWorkers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Export Action Controls */}
      <div className="report-action-row no-print">
        <span className="report-record-count">
          Showing <strong>{reportData.length}</strong> matching records in preview.
        </span>
        <div className="report-action-btns">
          <ExportButton 
            data={csvExportData} 
            filename={`graamsehat_${activeTab}_report`} 
            type="csv"
            label="Download CSV" 
          />
          {activeTab === 'screenings' && (
            <ExportButton 
              type="pdf" 
              label="Print / Export PDF" 
            />
          )}
        </div>
      </div>

      {/* Print Heading (Visible only on browser print) */}
      <div className="print-only print-report-header">
        <h2>GraamSehat Health Registry - Report Summary</h2>
        <p>Report Category: {activeTab.toUpperCase()}</p>
        <p>Generated on: {new Date().toLocaleDateString('en-IN')}</p>
        {activeTab === 'screenings' && (
          <p>Date Range: {startDate || 'Beginning'} to {endDate || 'Today'}</p>
        )}
      </div>

      {/* Table Preview Section */}
      <div className="report-preview-grid">
        {loading ? (
          <div className="loading-preview">Compiling records from database...</div>
        ) : (
          <div className="table-container">
            {activeTab === 'screenings' && (
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>District</th>
                    <th>ASHA Worker</th>
                    <th>Risk</th>
                    <th>BP (systolic/diastolic)</th>
                    <th>Glucose</th>
                    <th>IDRS</th>
                    <th>Date Screened</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No screenings matching parameters.</td></tr>
                  ) : (
                    reportData.map((row) => (
                      <tr key={row.id}>
                        <td><strong>{row.patientName || 'N/A'}</strong></td>
                        <td>{row.district}</td>
                        <td>{row.ashaName}</td>
                        <td><span className={`badge badge-${(row.riskLevel || 'green').toLowerCase()}`}>{row.riskLevel}</span></td>
                        <td>{row.systolic}/{row.diastolic} mmHg</td>
                        <td>{row.glucose} mg/dL</td>
                        <td>{row.idrs}</td>
                        <td>{row.formattedDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'high-risk' && (
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>UID</th>
                    <th>Name</th>
                    <th>Demographics</th>
                    <th>Location</th>
                    <th>Last Screened</th>
                    <th>Contact Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No high-risk patients recorded.</td></tr>
                  ) : (
                    reportData.map((row) => (
                      <tr key={row.id}>
                        <td>{row.uid || row.id}</td>
                        <td><strong>{row.name}</strong></td>
                        <td>{row.age} yrs / {row.gender}</td>
                        <td>{row.village}, {row.district}</td>
                        <td>{row.lastScreened ? (row.lastScreened.toDate ? formatDate(row.lastScreened.toDate()) : formatDate(row.lastScreened)) : 'Never'}</td>
                        <td>{row.phone}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'asha-activity' && (
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>ASHA Worker</th>
                    <th>District</th>
                    <th>Period</th>
                    <th>Screenings Count</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No worker activity logs.</td></tr>
                  ) : (
                    reportData.map((row, idx) => (
                      <tr key={idx}>
                        <td><strong>{row.ashaName}</strong></td>
                        <td>{row.district}</td>
                        <td>{row.month} {row.year}</td>
                        <td><strong>{row.screeningsCount}</strong> screenings</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'medicine' && (
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Distributed By (ASHA)</th>
                    <th>District</th>
                    <th>Patient Name</th>
                    <th>Date Issued</th>
                    <th>Medicines Dispensed</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No medicine distribution records.</td></tr>
                  ) : (
                    reportData.map((row) => (
                      <tr key={row.id}>
                        <td><strong>{row.ashaName}</strong></td>
                        <td>{row.district}</td>
                        <td>{row.patientName}</td>
                        <td>{row.date}</td>
                        <td>
                          <div className="meds-list-cell">
                            {Object.entries(row.medicines || {}).map(([med, qty]) => (
                              <span key={med} className="badge badge-gray" style={{ marginRight: '4px' }}>
                                {med}: {qty}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
