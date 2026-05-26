import { useCallback, useState } from 'react';
import { usePolling } from '../hooks/usePolling';
import { api } from '../services/api';
import { auth } from '../services/auth';
import GovHeader from '../components/layout/GovHeader';
import Sidebar from '../components/layout/Sidebar';
import LiveIndicator from '../components/ui/LiveIndicator';

const SEV_STYLE = {
  emergency: { bg: '#FEE2E2', color: '#DC2626' },
  high:      { bg: '#FFEDD5', color: '#EA580C' },
  low:       { bg: '#FEF3C7', color: '#92400E' },
  info:      { bg: '#EFF6FF', color: '#1D4ED8' },
};

const AlertsPage = () => {
  const [filter, setFilter] = useState({ severity: '', village: '' });
  const [broadcast, setBroadcast] = useState({ village: '', message: '' });
  const [bcastStatus, setBcastStatus] = useState('');
  const isAdmin = auth.getRole() === 'admin';

  const buildPath = () => {
    let path = '/alerts/latest?limit=50';
    return path;
  };

  const fetchAlerts = useCallback(() => api.get(buildPath()), []);
  const { data: alertData, lastUpdated, refetch } = usePolling(fetchAlerts, 10000);

  let alerts = alertData?.data?.alerts || [];

  // Client-side filtering
  if (filter.severity) alerts = alerts.filter(a => a.severity_level === filter.severity);
  if (filter.village)  alerts = alerts.filter(a => (a.village || '').toLowerCase().includes(filter.village.toLowerCase()));

  const sendBroadcast = async (e) => {
    e.preventDefault();
    setBcastStatus('');
    try {
      await api.post('/alerts/broadcast', { village: broadcast.village, message: broadcast.message });
      setBcastStatus('success');
      setBroadcast({ village: '', message: '' });
      refetch();
    } catch (err) {
      setBcastStatus('error:' + err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-alt)' }}>
      <GovHeader />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar userRole={isAdmin ? 'admin' : 'citizen'} />
        <main style={{ flex: 1, padding: '32px', minWidth: 0 }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--color-secondary)' }}>Alert Centre</h2>
              <LiveIndicator lastUpdated={lastUpdated} isFresh />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '2fr 1fr' : '1fr', gap: '24px' }}>

            {/* Alerts Table */}
            <div>
              {/* Filters */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input value={filter.village} onChange={e => setFilter({...filter, village: e.target.value})}
                  placeholder="Filter by village..." style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 14, flex: 1 }} />
                <select value={filter.severity} onChange={e => setFilter({...filter, severity: e.target.value})}
                  style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 14 }}>
                  <option value="">All Severities</option>
                  <option value="emergency">Emergency</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                </select>
                <button onClick={() => setFilter({ severity: '', village: '' })}
                  style={{ padding: '8px 14px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#6B7280' }}>
                  Clear
                </button>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {alerts.length === 0 ? (
                  <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                    <p>No alerts found matching your filters.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                      <thead style={{ background: '#F9FAFB', position: 'sticky', top: 0 }}>
                        <tr>
                          {['Type', 'Village / Area', 'Message', 'AQI', 'Severity', 'Delivery', 'Time'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {alerts.map((a, i) => {
                          const sev = SEV_STYLE[a.severity_level] || SEV_STYLE.info;
                          return (
                            <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: a.is_new ? '#FFF7ED' : 'transparent' }}>
                              <td style={{ padding: '11px 16px', fontWeight: 600 }}>
                                {a.alert_type}
                                {a.is_new && <span style={{ marginLeft: 6, fontSize: 10, background: '#EF4444', color: '#fff', borderRadius: 3, padding: '1px 5px' }}>NEW</span>}
                              </td>
                              <td style={{ padding: '11px 16px', color: '#6B7280' }}>{a.village || a.area || '—'}</td>
                              <td style={{ padding: '11px 16px', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.message}>{a.message}</td>
                              <td style={{ padding: '11px 16px', fontWeight: 600 }}>{a.aqi_value ?? '—'}</td>
                              <td style={{ padding: '11px 16px' }}>
                                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600, background: sev.bg, color: sev.color }}>{a.severity_level}</span>
                              </td>
                              <td style={{ padding: '11px 16px', color: '#6B7280' }}>{a.delivery_status}</td>
                              <td style={{ padding: '11px 16px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>{a.alert_time?.slice(0, 16) || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Broadcast Panel */}
            {isAdmin && (
              <div>
                <div className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-secondary)', marginBottom: 16 }}>
                    📢 Send Broadcast
                  </h3>
                  {bcastStatus === 'success' && <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontSize: 13, color: '#15803D' }}>✅ Broadcast sent successfully!</div>}
                  {bcastStatus.startsWith('error') && <div style={{ background: '#FEE2E2', padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontSize: 13, color: '#DC2626' }}>❌ {bcastStatus.slice(6)}</div>}
                  <form onSubmit={sendBroadcast}>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Target Village</label>
                      <input value={broadcast.village} onChange={e => setBroadcast({...broadcast, village: e.target.value})}
                        placeholder="Village name" required
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Message</label>
                      <textarea rows={4} value={broadcast.message} onChange={e => setBroadcast({...broadcast, message: e.target.value})}
                        placeholder="Type your message..." required
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '11px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                      🚨 Send Emergency Broadcast
                    </button>
                  </form>
                </div>

                {/* Alert Stats */}
                <div className="card" style={{ marginTop: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--color-secondary)' }}>Alert Summary</h3>
                  {[['Emergency', 'emergency', '#DC2626'], ['High', 'high', '#EA580C'], ['Low', 'low', '#F59E0B']].map(([label, key, color]) => {
                    const count = (alertData?.data?.alerts || []).filter(a => a.severity_level === key).length;
                    return (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                        <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default AlertsPage;
