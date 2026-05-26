import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { auth } from '../services/auth';
import { usePolling } from '../hooks/usePolling';
import GovHeader from '../components/layout/GovHeader';
import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/ui/StatCard';
import AQIBadge from '../components/ui/AQIBadge';
import LiveIndicator from '../components/ui/LiveIndicator';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import 'leaflet/dist/leaflet.css';
import { Radio, Users, Activity, BellRing, Send, LogOut, BrainCircuit } from 'lucide-react';

const getMarkerColor = (aqi) => {
  if (!aqi) return '#9CA3AF';
  if (aqi <= 50)  return '#16A34A';
  if (aqi <= 100) return '#65A30D';
  if (aqi <= 200) return '#F59E0B';
  if (aqi <= 300) return '#EA580C';
  return '#DC2626';
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [broadcast, setBroadcast] = useState({ village: '', message: '' });
  const [bcastStatus, setBcastStatus] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchNodes    = useCallback(() => api.get('/map/nodes'), []);
  const fetchAlerts   = useCallback(() => api.get('/alerts/latest?limit=8'), []);
  const fetchSummary  = useCallback(() => api.get('/aqi/summary'), []);
  const fetchNodeStats = useCallback(() => api.get('/nodes/status'), []);
  const fetchRankings = useCallback(() => api.get('/rankings/current'), []);
  const fetchPred     = useCallback(() => api.get('/prediction/latest'), []);

  const { data: mapData,      lastUpdated: mapTs   } = usePolling(fetchNodes,     10000);
  const { data: alertData,    lastUpdated: alertTs  } = usePolling(fetchAlerts,   10000);
  const { data: summaryData                         } = usePolling(fetchSummary,  30000);
  const { data: nodeStatsData                       } = usePolling(fetchNodeStats, 30000);
  const { data: rankingsData                        } = usePolling(fetchRankings, 60000);
  const { data: predData                            } = usePolling(fetchPred,     30000);

  const mapNodes   = mapData?.data?.nodes      || [];
  const alerts     = alertData?.data?.alerts   || [];
  const summary    = summaryData?.data         || {};
  const stats      = nodeStatsData?.data?.stats || {};
  const rankings   = rankingsData?.data?.rankings || [];
  const predictions = predData?.data?.predictions || [];

  const mapCenter = mapNodes.length > 0
    ? [mapNodes[0].latitude || 18.52, mapNodes[0].longitude || 73.85]
    : [18.52, 73.85];

  // Weekly bar chart data from rankings
  const chartData = rankings.slice(0, 5).map(r => ({
    village: r.village_name?.slice(0, 10),
    avgAQI: Math.round(r.avg_aqi || 0),
    score: Math.round(r.final_score || 0),
  }));

  const sendBroadcast = async (e) => {
    e.preventDefault();
    setBcastStatus('');
    try {
      await api.post('/alerts/broadcast', { village: broadcast.village, message: broadcast.message });
      setBcastStatus('success');
      setBroadcast({ village: '', message: '' });
    } catch (err) {
      setBcastStatus('error:' + err.message);
    }
  };

  const handleLogout = () => { auth.logout(); navigate('/login'); };

  // Demo Mode: Inject fake packets every 5 seconds
  useEffect(() => {
    let interval;
    if (isDemoMode && mapNodes.length > 0) {
      interval = setInterval(async () => {
        const randomNode = mapNodes[Math.floor(Math.random() * mapNodes.length)];
        const baseAQI = Math.max(10, (randomNode.latest_aqi || 50) + (Math.random() * 40 - 20));
        await api.post('/aqi/readings', {
          node_code: randomNode.node_code || randomNode.node_id, // backend handles either ideally, but let's use what we have
          mq135_value: baseAQI,
          temperature: 25 + (Math.random() * 5 - 2.5),
          humidity: 50 + (Math.random() * 10 - 5),
          battery_level: Math.floor(Math.random() * 30 + 70),
          lora_rssi: Math.floor(Math.random() * 60 - 110)
        }).catch(() => {});
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isDemoMode, mapNodes]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-alt)' }}>
      <GovHeader />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar userRole="admin" />
        <main style={{ flex: 1, padding: '32px', minWidth: 0 }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--color-secondary)' }}>
                Admin Control Center
              </h2>
              <LiveIndicator lastUpdated={mapTs} isFresh={mapNodes.some(n => n.is_fresh)} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setIsDemoMode(!isDemoMode)} 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: isDemoMode ? '#DCFCE7' : 'transparent', border: `1px solid ${isDemoMode ? '#16A34A' : 'var(--color-border)'}`, borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: isDemoMode ? '#16A34A' : '#6B7280', fontWeight: isDemoMode ? 600 : 400 }}
              >
                <Activity size={16} /> {isDemoMode ? 'Demo Mode: ON' : 'Demo Mode'}
              </button>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: '#6B7280' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
            <StatCard title="Total Nodes" value={stats.total || 0} icon={Radio} borderColor="#1B3A5C" />
            <StatCard title="Active Nodes" value={stats.active || 0} icon={Users} borderColor="#16A34A" />
            <StatCard title="Highest AQI" value={summary.max_aqi || '—'} icon={Activity} borderColor="#F59E0B" />
            <StatCard title="Alerts (Latest)" value={alerts.length} icon={BellRing} borderColor="#DC2626" />
          </div>

          {/* AI Diagnostics Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', margin: 0, fontWeight: 600, color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BrainCircuit size={16} color="var(--color-primary)" /> AI Predictive Diagnostics (Next 4 Hours)
              </h3>
            </div>
            {predictions.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>No predictions generated yet.</div>
            ) : (
              <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#F9FAFB' }}>
                  <tr>
                    {['Node', 'Village', 'Current AQI', 'Predicted AQI', 'Trend', 'Risk Level'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600 }}>{p.node_code}</td>
                      <td style={{ padding: '10px 16px' }}>{p.village}</td>
                      <td style={{ padding: '10px 16px' }}>{p.current_aqi}</td>
                      <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--color-primary)' }}>{p.predicted_aqi_4h}</td>
                      <td style={{ padding: '10px 16px', color: '#6B7280' }}>
                        {p.trend === 'rising' ? '↗️ Rising' : p.trend === 'falling' ? '↘️ Falling' : '→ Stable'}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, 
                          background: p.risk_level === 'EMERGENCY' ? '#FEE2E2' : p.risk_level === 'DANGER' ? '#FFEDD5' : p.risk_level === 'WARNING' ? '#FEF3C7' : '#DCFCE7', 
                          color: p.risk_level === 'EMERGENCY' ? '#DC2626' : p.risk_level === 'DANGER' ? '#9A3412' : p.risk_level === 'WARNING' ? '#92400E' : '#166534' }}>
                          {p.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Map + Broadcast */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', margin: 0, fontWeight: 600, color: 'var(--color-secondary)' }}>Live Node Network Map</h3>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                  {[['#16A34A', 'Good'], ['#F59E0B', 'Moderate'], ['#DC2626', 'Poor'], ['#9CA3AF', 'Offline']].map(([c, l]) => (
                    <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: c, display: 'inline-block' }} />{l}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ height: '380px' }}>
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="© OpenStreetMap" />
                  {mapNodes.map(node => (
                    <CircleMarker
                      key={node.node_id}
                      center={[node.latitude, node.longitude]}
                      radius={13}
                      pathOptions={{ fillColor: node.marker_color || getMarkerColor(node.latest_aqi), color: 'white', weight: 2, fillOpacity: 0.85 }}
                    >
                      <Popup>
                        <div style={{ textAlign: 'center', minWidth: 130 }}>
                          <strong>{node.node_name}</strong><br />
                          <span style={{ fontSize: 12, color: '#6B7280' }}>{node.village}</span><br />
                          {node.latest_aqi ? <AQIBadge aqi={node.latest_aqi} size="sm" /> : <span style={{ color: '#9CA3AF' }}>No data</span>}
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* Broadcast Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card">
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Send size={16} color="var(--color-primary)" /> Broadcast Alert
                </h3>
                {bcastStatus === 'success' && <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontSize: 13, color: '#15803D' }}>✅ Broadcast sent!</div>}
                {bcastStatus.startsWith('error') && <div style={{ background: '#FEE2E2', padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontSize: 13, color: '#DC2626' }}>❌ {bcastStatus.slice(6)}</div>}
                <form onSubmit={sendBroadcast}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Village Name</label>
                    <input value={broadcast.village} onChange={e => setBroadcast({...broadcast, village: e.target.value})}
                      placeholder="e.g. Khedgaon" required
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Message</label>
                    <textarea rows={3} value={broadcast.message} onChange={e => setBroadcast({...broadcast, message: e.target.value})}
                      placeholder="Enter broadcast message..." required
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '10px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                    Send Broadcast
                  </button>
                </form>
              </div>

              {/* Recent Alerts */}
              <div className="card" style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', background: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Recent Alerts</h3>
                  <LiveIndicator lastUpdated={alertTs} isFresh />
                </div>
                <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
                  {alerts.map((a, i) => (
                    <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid #F3F4F6', background: a.is_new ? '#FFF7ED' : 'transparent' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ fontWeight: 600 }}>{a.alert_type}</span>
                        <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: a.severity_level === 'emergency' ? '#FEE2E2' : '#FEF3C7', color: a.severity_level === 'emergency' ? '#DC2626' : '#92400E' }}>{a.severity_level}</span>
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: 12, color: '#6B7280' }}>{a.village} · {a.delivery_status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Rankings Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-secondary)' }}>Village Average AQI (Top 5)</h3>
              {chartData.length === 0 ? (
                <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 14 }}>Generate rankings first via Admin API</div>
              ) : (
                <div style={{ height: '240px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="village" type="category" tick={{ fontSize: 11 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="avgAQI" fill="#FF6B00" name="Avg AQI" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Top Rankings Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', background: '#F9FAFB' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--color-secondary)' }}>Village Leaderboard</h3>
              </div>
              {rankings.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No rankings generated yet.</div>
              ) : (
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#F9FAFB' }}>
                    <tr>
                      {['#', 'Village', 'Avg AQI', 'Reward'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.slice(0, 6).map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--color-primary)' }}>#{r.rank}</td>
                        <td style={{ padding: '10px 16px' }}>{r.village_name}</td>
                        <td style={{ padding: '10px 16px' }}><AQIBadge aqi={Math.round(r.avg_aqi)} size="sm" /></td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600, background: r.reward_status === 'eligible' ? '#DCFCE7' : '#F3F4F6', color: r.reward_status === 'eligible' ? '#16A34A' : '#6B7280' }}>
                            {r.reward_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
