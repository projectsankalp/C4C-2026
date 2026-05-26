/**
 * GraamSehat Admin Dashboard - Overview Page (Main Dashboard)
 * Location: /src/pages/Overview.jsx
 */

import React, { useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useAdminData } from '../hooks/useAdminData';
import { useMapData } from '../hooks/useMapData';
import StatCard from '../components/StatCard';
import RiskDonut from '../components/RiskDonut';
import MapView from '../components/MapView';
import { 
  Users, 
  Activity, 
  AlertOctagon, 
  RefreshCw, 
  UserCheck, 
  Map, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { formatDate } from '../utils/formatters';
import './Overview.css';

export default function Overview() {
  const { patients, ashaWorkers, screenings } = useAdmin();
  const { stats, alerts } = useAdminData();
  const navigate = useNavigate();

  // Map markers & heatmap configurations
  const mapFilters = useMemo(() => ({
    riskLevel: [],
    startDate: '',
    endDate: '',
    district: '',
    ashaWorkerId: ''
  }), []);
  
  const { markers, heatmapPoints } = useMapData(mapFilters);

  // Recent 10 High-Risk Patients
  const recentHighRiskPatients = useMemo(() => {
    return patients
      .filter(p => p.riskLevel === 'red')
      .slice(0, 10);
  }, [patients]);

  // Row 3: Screening activity chart — line chart of screenings per day for last 30 days
  const screeningActivityData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    // Create 30 days array
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      d.setHours(0, 0, 0, 0);
      const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      data.push({
        dateObj: d,
        label,
        count: 0
      });
    }

    // Populate counts
    screenings.forEach(s => {
      const sDate = s.timestamp ? (s.timestamp.toDate ? s.timestamp.toDate() : new Date(s.timestamp)) : null;
      if (sDate) {
        const check = new Date(sDate);
        check.setHours(0, 0, 0, 0);
        
        const matchedDay = data.find(item => item.dateObj.getTime() === check.getTime());
        if (matchedDay) {
          matchedDay.count += 1;
        }
      }
    });

    return data;
  }, [screenings]);

  // Row 3: Top 5 most active ASHA workers (by screenings this month)
  const topASHAsData = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const countMap = {};
    screenings.forEach(s => {
      const sDate = s.timestamp ? (s.timestamp.toDate ? s.timestamp.toDate() : new Date(s.timestamp)) : null;
      if (sDate && sDate >= startOfMonth && s.ashaWorkerId) {
        countMap[s.ashaWorkerId] = (countMap[s.ashaWorkerId] || 0) + 1;
      }
    });

    // Match profiles
    const list = Object.entries(countMap).map(([id, count]) => {
      const worker = ashaWorkers.find(w => w.id === id);
      return {
        name: worker ? worker.name : 'Unknown ASHA',
        screenings: count
      };
    });

    // Sort descending and take top 5
    return list.sort((a, b) => b.screenings - a.screenings).slice(0, 5);
  }, [screenings, ashaWorkers]);

  // Risk Distribution counts for donut
  const riskCounts = useMemo(() => {
    const counts = { green: 0, yellow: 0, red: 0 };
    patients.forEach(p => {
      const risk = (p.riskLevel || 'green').toLowerCase();
      if (counts[risk] !== undefined) counts[risk] += 1;
    });
    return counts;
  }, [patients]);

  return (
    <div className="overview-page">
      <div className="overview-header no-print">
        <h1>Dashboard Overview</h1>
        <p className="subtitle">Real-time health statistics and operational logs from Firestore.</p>
      </div>

      {/* Row 1 - Stat Cards */}
      <div className="stats-grid no-print">
        <StatCard 
          title="Total Patients Registered" 
          value={stats.totalPatients} 
          icon={Users} 
          subtext="Total unique patient records"
        />
        <StatCard 
          title="Total Screenings" 
          value={stats.totalScreenings} 
          icon={Activity} 
          subtext="Screening events in registry"
        />
        <StatCard 
          title="High-Risk Patients" 
          value={stats.highRiskPatients} 
          icon={AlertOctagon} 
          subtext="Requires immediate follow-up"
          type="critical"
        />
        <StatCard 
          title="Pending Syncs" 
          value={stats.pendingSyncs} 
          icon={RefreshCw} 
          subtext="Queued offline worker reports"
          type={stats.pendingSyncs > 0 ? "warning" : "default"}
        />
        <StatCard 
          title="Active ASHA Workers" 
          value={stats.activeASHAs} 
          icon={UserCheck} 
          subtext="Approved accounts active"
          type="success"
        />
        <StatCard 
          title="Districts Covered" 
          value={stats.districtsCovered} 
          icon={Map} 
          subtext="Geographic regions in scope"
        />
      </div>

      {/* Row 2 - Map | Donut | Recent High Risk */}
      <div className="overview-row row-three-panels">
        {/* Map Panel */}
        <div className="glass-card panel-map">
          <div className="panel-title-header">
            <h3>Geographic Risk Distribution</h3>
            <span className="badge badge-blue">Interactive Map</span>
          </div>
          <MapView markers={markers} heatmapPoints={heatmapPoints} height="320px" />
        </div>

        {/* Risk Donut Chart */}
        <div className="glass-card panel-risk-donut no-print">
          <div className="panel-title-header">
            <h3>Risk Classification</h3>
          </div>
          <RiskDonut 
            green={riskCounts.green} 
            yellow={riskCounts.yellow} 
            red={riskCounts.red} 
          />
        </div>

        {/* Recent High Risk Patients List */}
        <div className="glass-card panel-recent-high no-print">
          <div className="panel-title-header">
            <h3>Recent High-Risk Cases</h3>
          </div>
          <div className="recent-patients-list">
            {recentHighRiskPatients.length === 0 ? (
              <div className="empty-panel-text">No high-risk patients flagged recently.</div>
            ) : (
              recentHighRiskPatients.map((patient) => (
                <div 
                  key={patient.id} 
                  className="patient-list-item"
                  onClick={() => navigate(`/patient/${patient.id}`)}
                >
                  <div className="patient-item-dot" />
                  <div className="patient-item-details">
                    <span className="patient-item-name">{patient.name}</span>
                    <span className="patient-item-location">{patient.village}, {patient.district}</span>
                  </div>
                  <ChevronRight size={14} className="patient-item-arrow" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 3 - Screening Activity Line | Top ASHA Workers Bar */}
      <div className="overview-row row-two-panels no-print">
        {/* Screening Line Chart */}
        <div className="glass-card panel-chart-line">
          <div className="panel-title-header">
            <h3>Screening Activity (Last 30 Days)</h3>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={screeningActivityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="label" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Screenings"
                  stroke="var(--primary)" 
                  strokeWidth={3} 
                  activeDot={{ r: 6 }} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top ASHA Worker Activity Bar */}
        <div className="glass-card panel-chart-bar">
          <div className="panel-title-header">
            <h3>Top 5 ASHA Workers (This Month)</h3>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            {topASHAsData.length === 0 ? (
              <div className="empty-panel-text" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                No screening data this month.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topASHAsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="screenings" name="Screenings" fill="var(--primary-dark)" radius={[4, 4, 0, 0]}>
                    {topASHAsData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? 'var(--primary-dark)' : 'rgba(13, 148, 136, 0.7)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 4 - Alerts */}
      <div className="overview-row row-alerts no-print">
        {/* Patients Not Followed Up */}
        <div className="glass-card alert-panel-box">
          <div className="alert-box-header header-red">
            <AlertTriangle size={18} />
            <h4>60+ Days No Follow-Up ({alerts.noFollowupPatients.count})</h4>
          </div>
          <div className="alert-box-content scroll-box">
            {alerts.noFollowupPatients.count === 0 ? (
              <div className="alert-empty-msg">All patients followed up on schedule.</div>
            ) : (
              alerts.noFollowupPatients.list.map((patient) => (
                <div 
                  key={patient.id} 
                  className="alert-item-row"
                  onClick={() => navigate(`/patient/${patient.id}`)}
                >
                  <div className="alert-item-txt">
                    <strong>{patient.name}</strong>
                    <span>Last screened: {patient.lastScreened ? formatDate(patient.lastScreened) : 'Never'}</span>
                  </div>
                  <span className="alert-item-loc"><MapPin size={10} /> {patient.district}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Inactive ASHA Workers */}
        <div className="glass-card alert-panel-box">
          <div className="alert-box-header header-yellow">
            <Users size={18} />
            <h4>ASHA Workers Inactive 30+ Days ({alerts.inactiveASHAs.count})</h4>
          </div>
          <div className="alert-box-content scroll-box">
            {alerts.inactiveASHAs.count === 0 ? (
              <div className="alert-empty-msg">All approved ASHA workers active.</div>
            ) : (
              alerts.inactiveASHAs.list.map((worker) => (
                <div 
                  key={worker.id} 
                  className="alert-item-row"
                  onClick={() => navigate(`/asha/${worker.id}`)}
                >
                  <div className="alert-item-txt">
                    <strong>{worker.name}</strong>
                    <span>Last active: {worker.lastActive ? formatDate(worker.lastActive) : 'Never'}</span>
                  </div>
                  <span className="alert-item-loc"><MapPin size={10} /> {worker.district}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Zero Screening Districts */}
        <div className="glass-card alert-panel-box">
          <div className="alert-box-header header-gray">
            <Map size={18} />
            <h4>No Screenings This Month ({alerts.zeroScreeningDistricts.count})</h4>
          </div>
          <div className="alert-box-content scroll-box">
            {alerts.zeroScreeningDistricts.count === 0 ? (
              <div className="alert-empty-msg">Screenings registered in all covered districts.</div>
            ) : (
              alerts.zeroScreeningDistricts.list.map((dist) => (
                <div 
                  key={dist} 
                  className="alert-item-row"
                  onClick={() => navigate(`/rankings?district=${encodeURIComponent(dist)}`)}
                >
                  <div className="alert-item-txt">
                    <strong>{dist}</strong>
                    <span>0 screenings this month</span>
                  </div>
                  <span className="alert-item-badge badge badge-red">Attention</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
