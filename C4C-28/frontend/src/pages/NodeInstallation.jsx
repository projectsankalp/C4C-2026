import React, { useState, useCallback } from 'react';
import GovHeader from '../components/layout/GovHeader';
import Sidebar from '../components/layout/Sidebar';
import AQIBadge from '../components/ui/AQIBadge';
import LiveIndicator from '../components/ui/LiveIndicator';
import { usePolling } from '../hooks/usePolling';
import { api } from '../services/api';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Plus, Battery, Radio, Settings, X } from 'lucide-react';

const NodeInstallation = () => {
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ node_code: '', node_name: '', village: '', area: '', latitude: '', longitude: '' });
  const [formStatus, setFormStatus] = useState('');
  const [saving, setSaving]       = useState(false);

  const fetchNodes   = useCallback(() => api.get('/nodes'), []);
  const fetchStatus  = useCallback(() => api.get('/nodes/status'), []);

  const { data: nodesData, lastUpdated, refetch } = usePolling(fetchNodes, 30000);
  const { data: statsData                        } = usePolling(fetchStatus, 30000);

  const nodes = nodesData?.data?.nodes || [];
  const stats = statsData?.data?.stats || {};

  const mapCenter = nodes.length > 0
    ? [nodes[0].latitude, nodes[0].longitude]
    : [18.52, 73.85];

  const getColor = (node) => {
    if (node.status === 'offline' || node.status === 'inactive') return '#DC2626';
    if (node.status === 'maintenance') return '#F59E0B';
    if (!node.latest_aqi) return '#9CA3AF';
    if (node.latest_aqi <= 100) return '#16A34A';
    if (node.latest_aqi <= 200) return '#F59E0B';
    return '#DC2626';
  };

  const handleField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormStatus('');
    try {
      await api.post('/nodes', {
        node_code: form.node_code, node_name: form.node_name,
        village: form.village, area: form.area,
        latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude),
      });
      setFormStatus('success');
      setForm({ node_code: '', node_name: '', village: '', area: '', latitude: '', longitude: '' });
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormStatus('error:' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const statBox = (label, value, color = 'var(--color-secondary)') => (
    <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `4px solid ${color}` }}>
      <div>
        <div style={{ fontSize: 12, color: '#6B7280' }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-alt)' }}>
      <GovHeader />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar userRole="admin" />
        <main style={{ flex: 1, padding: '32px', minWidth: 0 }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-secondary)' }}>Node Installation & Inventory</h2>
              <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
                <p style={{ color: '#6B7280', fontSize: 14, margin: 0 }}>Manage ESP32 LoRa sensor deployments</p>
                <LiveIndicator lastUpdated={lastUpdated} isFresh />
              </div>
            </div>
            <button onClick={() => setShowForm(!showForm)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
              <Plus size={18} /> Register Node
            </button>
          </div>

          {/* Register Node Form */}
          {showForm && (
            <div className="card" style={{ marginBottom: 24, position: 'relative', border: '2px solid var(--color-primary)', borderRadius: 10 }}>
              <button onClick={() => setShowForm(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={20} /></button>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--color-secondary)' }}>Register New Node</h3>
              {formStatus === 'success' && <div style={{ background: '#DCFCE7', padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontSize: 13, color: '#15803D' }}>✅ Node registered successfully!</div>}
              {formStatus.startsWith('error') && <div style={{ background: '#FEE2E2', padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontSize: 13, color: '#DC2626' }}>❌ {formStatus.slice(6)}</div>}
              <form onSubmit={handleRegister}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px 16px' }}>
                  {[['Node Code *', 'node_code', 'text', 'e.g. NODE_06'], ['Node Name *', 'node_name', 'text', 'e.g. School Area'], ['Village *', 'village', 'text', 'Village name'], ['Area *', 'area', 'text', 'e.g. North Zone'], ['Latitude *', 'latitude', 'number', '18.52'], ['Longitude *', 'longitude', 'number', '73.85']].map(([label, name, type, ph]) => (
                    <div key={name}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#374151' }}>{label}</label>
                      <input type={type} name={name} value={form[name]} onChange={handleField} placeholder={ph} required step={type === 'number' ? '0.0001' : undefined}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                <button type="submit" disabled={saving} style={{ marginTop: 16, padding: '10px 24px', background: saving ? '#9CA3AF' : 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14 }}>
                  {saving ? 'Registering...' : 'Register & Activate'}
                </button>
              </form>
            </div>
          )}

          {/* Stat Boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {statBox('Total Nodes', stats.total || 0, '#1B3A5C')}
            {statBox('Active', stats.active || 0, '#16A34A')}
            {statBox('Offline', stats.offline || 0, '#DC2626')}
            {statBox('Maintenance', stats.maintenance || 0, '#F59E0B')}
          </div>

          {/* Map + Inventory */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>

            {/* Map */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', height: '460px' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', background: '#F9FAFB', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--color-secondary)' }}>Deployment Map (LoRa Coverage Zones)</h3>
              </div>
              <div style={{ height: 'calc(100% - 49px)' }}>
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="© OpenStreetMap" />
                  {nodes.map(node => (
                    <React.Fragment key={node.node_id}>
                      {node.status === 'active' && (
                        <Circle center={[node.latitude, node.longitude]} radius={2000}
                          pathOptions={{ color: '#FF6B00', fillColor: '#FF6B00', fillOpacity: 0.07, weight: 1 }} />
                      )}
                      <CircleMarker center={[node.latitude, node.longitude]} radius={9}
                        pathOptions={{ fillColor: getColor(node), color: 'white', weight: 2.5, fillOpacity: 1 }}>
                        <Popup>
                          <div style={{ minWidth: 160 }}>
                            <strong style={{ fontSize: 14 }}>{node.node_code}</strong>
                            <p style={{ margin: '4px 0 2px', fontSize: 12, color: '#6B7280' }}>{node.village} · {node.area}</p>
                            <div style={{ marginTop: 6 }}>
                              {node.latest_aqi ? <AQIBadge aqi={node.latest_aqi} size="sm" /> : <span style={{ color: '#9CA3AF', fontSize: 12 }}>No data yet</span>}
                            </div>
                            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#9CA3AF' }}>🔋 {node.battery_level ?? '—'}% · {node.status}</p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    </React.Fragment>
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* Node List */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', maxHeight: '460px', overflowY: 'auto' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', background: '#F9FAFB', position: 'sticky', top: 0 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--color-secondary)' }}>Node Inventory ({nodes.length})</h3>
              </div>
              {nodes.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No nodes registered yet. Click "Register Node" to add one.</div>
              ) : (
                nodes.map((n, i) => (
                  <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: 13 }}>{n.node_code}</strong>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6B7280' }}>{n.village} · {n.area}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {n.latest_aqi ? <AQIBadge aqi={n.latest_aqi} size="sm" /> : <span style={{ color: '#9CA3AF', fontSize: 11 }}>No data</span>}
                        <div style={{ marginTop: 2 }}>
                          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: n.status === 'active' ? '#DCFCE7' : '#FEE2E2', color: n.status === 'active' ? '#16A34A' : '#DC2626' }}>{n.status}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 11, color: '#9CA3AF', alignItems: 'center' }}>
                      <span><Battery size={12} style={{ verticalAlign: 'middle', marginRight: 2 }} />{n.battery_level ?? '—'}%</span>
                      <span><Radio size={12} style={{ verticalAlign: 'middle', marginRight: 2 }} />LoRa</span>
                      <span 
                        style={{ marginLeft: 'auto', cursor: 'pointer', color: 'var(--color-primary)', transition: 'color 0.15s' }}
                        title="Node details"
                        onClick={() => alert(`Node: ${n.node_code}\nVillage: ${n.village}\nStatus: ${n.status}\nLatest AQI: ${n.latest_aqi || 'N/A'}\nBattery: ${n.battery_level ?? 'N/A'}%`)}
                        onMouseEnter={e => e.currentTarget.style.color = '#C2410C'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--color-primary)'}
                      ><Settings size={14} /></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default NodeInstallation;
