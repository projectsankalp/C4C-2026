import { useCallback } from 'react';
import { usePolling } from '../hooks/usePolling';
import { api } from '../services/api';
import GovHeader from '../components/layout/GovHeader';
import Sidebar from '../components/layout/Sidebar';
import AQIBadge from '../components/ui/AQIBadge';
import LiveIndicator from '../components/ui/LiveIndicator';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const SEVERITY_COLORS = { good: '#16A34A', satisfactory: '#65A30D', moderate: '#F59E0B', poor: '#EA580C', hazardous: '#DC2626' };

const MapPage = () => {
  const fetchMapNodes   = useCallback(() => api.get('/map/nodes'), []);
  const fetchDanger     = useCallback(() => api.get('/map/danger-zones'), []);

  const { data: mapData,    lastUpdated } = usePolling(fetchMapNodes, 10000);
  const { data: dangerData              } = usePolling(fetchDanger,   30000);

  const nodes       = mapData?.data?.nodes       || [];
  const dangerZones = dangerData?.data?.nodes    || [];

  const mapCenter = nodes.length > 0
    ? [nodes[0].latitude, nodes[0].longitude]
    : [18.52, 73.85];

  const getColor = (node) => {
    if (!node.latest_aqi) return '#9CA3AF';
    if (node.latest_aqi <= 50)  return '#16A34A';
    if (node.latest_aqi <= 100) return '#65A30D';
    if (node.latest_aqi <= 200) return '#F59E0B';
    if (node.latest_aqi <= 300) return '#EA580C';
    return '#DC2626';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-alt)' }}>
      <GovHeader />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar userRole="citizen" />
        <main style={{ flex: 1, padding: '24px', minWidth: 0 }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--color-secondary)' }}>AQI Node Map</h2>
              <LiveIndicator lastUpdated={lastUpdated} isFresh={nodes.some(n => n.is_fresh)} />
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', alignItems: 'center' }}>
              {[['#16A34A','Good'], ['#65A30D','Satisfactory'], ['#F59E0B','Moderate'], ['#EA580C','Poor'], ['#DC2626','Hazardous'], ['#9CA3AF','Offline']].map(([c, l]) => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />{l}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px' }}>
            {/* Map */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', height: '560px' }}>
              {nodes.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 32 }}>🗺️</div>
                  <p>No nodes found. Add nodes via Admin panel.</p>
                </div>
              ) : (
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="© OpenStreetMap" />
                  {nodes.map(node => (
                    <CircleMarker
                      key={node.node_id}
                      center={[node.latitude, node.longitude]}
                      radius={14}
                      pathOptions={{ fillColor: getColor(node), color: 'white', weight: 2.5, fillOpacity: 0.85 }}
                    >
                      <Popup>
                        <div style={{ minWidth: 160 }}>
                          <strong style={{ fontSize: 14 }}>{node.node_name}</strong>
                          <p style={{ margin: '4px 0', fontSize: 12, color: '#6B7280' }}>{node.village} · {node.area}</p>
                          <div style={{ marginTop: 6 }}>
                            {node.latest_aqi ? <AQIBadge aqi={node.latest_aqi} size="sm" /> : <span style={{ color: '#9CA3AF', fontSize: 12 }}>No data</span>}
                          </div>
                          <p style={{ margin: '6px 0 0', fontSize: 11, color: '#9CA3AF' }}>
                            🔋 {node.battery_level ?? '—'}% · {node.status}
                          </p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              )}
            </div>

            {/* Sidebar Panels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Danger Zones */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: '#FEE2E2', borderBottom: '1px solid #FCA5A5' }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#DC2626' }}>🚨 Danger Zones</h3>
                </div>
                {dangerZones.length === 0 ? (
                  <div style={{ padding: '16px', fontSize: 13, color: '#16A34A', textAlign: 'center' }}>✅ No danger zones currently</div>
                ) : (
                  dangerZones.slice(0, 5).map((z, i) => (
                    <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid #FEE2E2', background: '#FFF5F5' }}>
                      <strong style={{ fontSize: 13 }}>{z.node_name}</strong>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>{z.village} · AQI {z.latest_aqi}</p>
                    </div>
                  ))
                )}
              </div>

              {/* All Nodes List */}
              <div className="card" style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', background: '#F9FAFB' }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-secondary)' }}>All Nodes ({nodes.length})</h3>
                </div>
                <div style={{ overflowY: 'auto', maxHeight: '340px' }}>
                  {nodes.map((n, i) => (
                    <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: 13 }}>{n.node_code}</strong>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>{n.village}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {n.latest_aqi ? <AQIBadge aqi={n.latest_aqi} size="sm" /> : <span style={{ fontSize: 11, color: '#9CA3AF' }}>No data</span>}
                        <div style={{ marginTop: 2 }}>
                          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: n.status === 'active' ? '#DCFCE7' : '#F3F4F6', color: n.status === 'active' ? '#16A34A' : '#9CA3AF' }}>
                            {n.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default MapPage;
