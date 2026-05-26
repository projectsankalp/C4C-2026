import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { auth } from '../services/auth';
import { t } from '../services/i18n';
import { usePolling } from '../hooks/usePolling';
import GovHeader from '../components/layout/GovHeader';
import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/ui/StatCard';
import AQIBadge from '../components/ui/AQIBadge';
import LiveIndicator from '../components/ui/LiveIndicator';
import VoiceAlertPlayer from '../components/ui/VoiceAlertPlayer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wind, MapPin, Bell, Activity, LogOut, BrainCircuit } from 'lucide-react';

const AQI_LABELS = ['good', 'satisfactory', 'moderate', 'poor', 'veryPoor', 'severe'];
const AQI_GUIDE = [
  { range: '0–50',    key: 'good',          bg: '#DCFCE7', color: '#166534' },
  { range: '51–100',  key: 'satisfactory',  bg: '#ECFCCB', color: '#3F6212' },
  { range: '101–200', key: 'moderate',       bg: '#FEF3C7', color: '#92400E' },
  { range: '201–300', key: 'poor',           bg: '#FFEDD5', color: '#9A3412' },
  { range: '301–400', key: 'veryPoor',       bg: '#FEE2E2', color: '#991B1B' },
  { range: '401–500', key: 'severe',         bg: '#7F1D1D', color: '#FEF2F2' },
];

const UserDashboard = () => {
  const navigate  = useNavigate();
  const user      = auth.getUser();
  const userLang  = localStorage.getItem('sv_lang') || user?.language_code || 'en';

  const fetchAQI     = useCallback(() => api.get('/aqi/latest'), []);
  const fetchAlerts  = useCallback(() => api.get('/alerts/latest?limit=5'), []);
  const fetchSummary = useCallback(() => api.get('/aqi/summary'), []);
  const fetchNodes   = useCallback(() => api.get('/nodes/status'), []);
  const fetchPred    = useCallback(() => api.get('/prediction/latest'), []);
  const fetchAgri    = useCallback(() => api.get('/agri/advisory'), []);

  const { data: aqiData,     lastUpdated: aqiTs  } = usePolling(fetchAQI,     5000);
  const { data: alertData,   lastUpdated: alertTs } = usePolling(fetchAlerts,  10000);
  const { data: summaryData                       } = usePolling(fetchSummary, 30000);
  const { data: nodeStats                         } = usePolling(fetchNodes,   30000);
  const { data: predData                          } = usePolling(fetchPred,    30000);
  const { data: agriData                          } = usePolling(fetchAgri,    30000);

  const readings = aqiData?.data?.nodes || aqiData?.data?.readings || [];
  const topReading = readings.find(r => r.node_code === 'NODE_02') || readings.find(r => r.latest_aqi !== null) || readings[0] || {};
  const currentAQI = topReading.latest_aqi ?? topReading.calculated_aqi ?? '—';
  const isFresh = topReading.is_fresh ?? false;

  const trendData = readings.map(r => ({
    time: r.node_code,
    aqi: r.latest_aqi ?? r.calculated_aqi ?? 0,
  }));

  const alerts = alertData?.data?.alerts || [];
  const stats  = nodeStats?.data?.stats || {};
  const summary = summaryData?.data || {};
  
  const predictions = predData?.data?.predictions || [];
  const topPred = predictions.length > 0 ? predictions[0] : null;
  const predAQI = topPred?.predicted_aqi_4h || '—';
  const predRisk = topPred?.risk_level || 'UNKNOWN';
  const predTrend = topPred?.trend === 'rising' ? '↗️' : topPred?.trend === 'falling' ? '↘️' : '→';

  const advisory = agriData?.data || {};
  const spray = advisory.spray || {};
  const drying = advisory.drying || {};
  const work = advisory.work_timing || {};
  const interference = advisory.interference || {};

  const handleLogout = () => { auth.logout(); navigate('/login'); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-alt)' }}>
      <GovHeader />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar userRole="citizen" />

        <main style={{ flex: 1, padding: '32px', minWidth: 0 }}>

          {/* Page Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--color-secondary)' }}>
                {t('welcome')}, {user?.full_name || 'Citizen'} 👋
              </h2>
              <div style={{ marginTop: '4px' }}>
                <LiveIndicator lastUpdated={aqiTs} isFresh={isFresh} />
              </div>
            </div>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: '#6B7280' }}>
              <LogOut size={16} /> {t('logout')}
            </button>
          </div>

          {/* Alert Banner */}
          {alerts.some(a => a.is_new) && (
            <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div>
                <strong style={{ color: '#92400E' }}>{t('newAlert')}</strong>
                <p style={{ margin: '2px 0 0', fontSize: '14px', color: '#78350F' }}>{alerts.find(a => a.is_new)?.message || ''}</p>
              </div>
            </div>
          )}

          {/* Clean Air Action Promotion Banner */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, #138808 0%, #0F6A06 100%)',
            border: 'none',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(19, 136, 8, 0.2)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>🌿</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                  Boost Your Village's Air Quality & Clean Air Rank!
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#D1FAE5' }}>
                  Your village performance impacts rewards. View and adopt localized Clean Air Guidelines to make an impact.
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/measures')}
              style={{
                backgroundColor: '#fff',
                color: 'var(--color-accent-green)',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              Take Action Now →
            </button>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '28px' }}>
            <StatCard title={t('currentAQI')} value={currentAQI} icon={Activity} borderColor="var(--color-aqi-moderate)" />
            <StatCard 
              title="AI Air Quality Prediction (4h)" 
              value={<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{predAQI} <span style={{ fontSize: 14 }}>{predTrend}</span></div>}
              icon={BrainCircuit} 
              borderColor={predRisk === 'DANGER' || predRisk === 'EMERGENCY' ? '#DC2626' : predRisk === 'WARNING' ? '#F59E0B' : '#16A34A'} 
            />
            <StatCard title={t('villageRank')} value={`#${summary.village_rank || '—'}`} icon={MapPin} />
            <StatCard title={t('activeNodes')} value={`${stats.active || 0} / ${stats.total || 0}`} icon={Bell} />
            <StatCard title={t('alertsToday')} value={alerts.length} icon={Wind} />
          </div>

          {/* Quick Agricultural Advisory */}
          <div className="card" style={{ marginBottom: '28px', borderLeft: '4px solid #16A34A', background: '#F8FAF5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🌾</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-secondary)' }}>
                    Environmental Decision Intelligence
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                    Real-time operational advisory for your farming activities (Main USP: Rural Intelligence)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/advisory')}
                style={{ 
                  backgroundColor: '#16A34A', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  padding: '6px 14px', 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(22,163,74,0.2)',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#15803D'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#16A34A'}
              >
                View Full Advisory & Forecasts →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {/* Spraying Window Card */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: spray.status === 'IDEAL' ? '#F0FDF4' : spray.status === 'CAUTION' ? '#FFFBEB' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '18px' }}>🌿</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Spraying Window</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>{spray.spray_score || 0}%</span>
                    <span style={{ 
                      fontSize: '9px', 
                      fontWeight: 700, 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      background: spray.status === 'IDEAL' ? '#DCFCE7' : spray.status === 'CAUTION' ? '#FEF3C7' : '#FEE2E2',
                      color: spray.status === 'IDEAL' ? '#15803D' : spray.status === 'CAUTION' ? '#B45309' : '#991B1B'
                    }}>
                      {spray.status || 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Crop Drying Card */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: drying.status === 'SAFE' ? '#F0FDF4' : drying.status === 'RISKY' ? '#FFFBEB' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '18px' }}>☀️</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Crop Drying</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>{drying.drying_score || 0}%</span>
                    <span style={{ 
                      fontSize: '9px', 
                      fontWeight: 700, 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      background: drying.status === 'SAFE' ? '#DCFCE7' : drying.status === 'RISKY' ? '#FEF3C7' : '#FEE2E2',
                      color: drying.status === 'SAFE' ? '#15803D' : drying.status === 'RISKY' ? '#B45309' : '#991B1B'
                    }}>
                      {drying.status || 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Outdoor Work Timing */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: work.status === 'COMFORTABLE' ? '#F0FDF4' : work.status === 'MODERATE' ? '#FFFBEB' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '18px' }}>🚜</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Work Comfort</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>{work.comfort_score || 0}%</span>
                    <span style={{ 
                      fontSize: '9px', 
                      fontWeight: 700, 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      background: work.status === 'COMFORTABLE' ? '#DCFCE7' : work.status === 'MODERATE' ? '#FEF3C7' : '#FEE2E2',
                      color: work.status === 'COMFORTABLE' ? '#15803D' : work.status === 'MODERATE' ? '#B45309' : '#991B1B'
                    }}>
                      {work.status || 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Smoke / Dust Interference */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: interference.overall_status === 'CLEAR' ? '#F0FDF4' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '18px' }}>🛡️</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Interference</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>{interference.alert_count || 0} Alert(s)</span>
                    <span style={{ 
                      fontSize: '9px', 
                      fontWeight: 700, 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      background: interference.overall_status === 'CLEAR' ? '#DCFCE7' : '#FEE2E2',
                      color: interference.overall_status === 'CLEAR' ? '#15803D' : '#991B1B'
                    }}>
                      {interference.overall_status || 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '28px' }}>
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '20px' }}>
                {t('liveAQIByNode')}
              </h3>
              {readings.length === 0 ? (
                <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>{t('noDataYet')}</div>
              ) : (
                <div style={{ height: '260px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} domain={[0, 400]} />
                      <Tooltip contentStyle={{ backgroundColor: '#1B3A5C', color: 'white', border: 'none', borderRadius: '6px' }} />
                      <Line type="monotone" dataKey="aqi" stroke="var(--color-primary)" strokeWidth={3} dot={{ fill: 'var(--color-primary)', r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '16px' }}>
                {t('nationalAQIScale')}
              </h3>
              <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                <tbody>
                  {AQI_GUIDE.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '8px 0', fontWeight: 500 }}>{row.range}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right' }}>
                        <span style={{ backgroundColor: row.bg, color: row.color, padding: '3px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '12px' }}>
                          {t(row.key)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts + Nodes Tables */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Alerts */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--color-secondary)' }}>{t('recentAlerts')}</h3>
                <LiveIndicator lastUpdated={alertTs} isFresh />
              </div>
              {alerts.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>{t('noAlerts')}</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#F9FAFB' }}>
                      <tr>
                        {[t('type'), t('village'), t('severity'), t('status')].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map((a, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: a.is_new ? '#FFF7ED' : 'transparent' }}>
                          <td style={{ padding: '10px 16px', fontWeight: 500 }}>{a.alert_type}{a.is_new && <span style={{ marginLeft: 6, fontSize: 10, background: '#EF4444', color: '#fff', borderRadius: 4, padding: '2px 5px' }}>NEW</span>}</td>
                          <td style={{ padding: '10px 16px', color: '#6B7280' }}>{a.village || '—'}</td>
                          <td style={{ padding: '10px 16px' }}>
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: 4, fontWeight: 600, background: a.severity_level === 'emergency' ? '#FEE2E2' : '#FEF3C7', color: a.severity_level === 'emergency' ? '#DC2626' : '#92400E' }}>
                              {a.severity_level}
                            </span>
                          </td>
                          <td style={{ padding: '10px 16px', color: '#6B7280' }}>{a.delivery_status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Nodes */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#F9FAFB' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--color-secondary)' }}>{t('nodeAQIStatus')}</h3>
              </div>
              {readings.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>{t('noReadings')}</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#F9FAFB' }}>
                      <tr>
                        {[t('node'), t('village'), t('aqi'), t('status')].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {readings.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '10px 16px', fontWeight: 600 }}>{r.node_code}</td>
                          <td style={{ padding: '10px 16px', color: '#6B7280' }}>{r.village}</td>
                          <td style={{ padding: '10px 16px' }}><AQIBadge aqi={r.latest_aqi ?? r.calculated_aqi} size="sm" /></td>
                          <td style={{ padding: '10px 16px' }}>
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: 4, fontWeight: 600, background: r.is_fresh ? '#DCFCE7' : '#F3F4F6', color: r.is_fresh ? '#16A34A' : '#9CA3AF' }}>
                              {r.is_fresh ? t('live') : t('stale')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </main>
      </div>

      {/* Voice Alert Auto-Player — plays TTS on new emergency */}
      <VoiceAlertPlayer alerts={alerts} userLang={userLang} />

    </div>
  );
};

export default UserDashboard;
