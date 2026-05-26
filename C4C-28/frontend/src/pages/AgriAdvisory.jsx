import { useCallback, useState } from 'react';
import { api } from '../services/api';
import { auth } from '../services/auth';
import { usePolling } from '../hooks/usePolling';
import GovHeader from '../components/layout/GovHeader';
import Sidebar from '../components/layout/Sidebar';
import LiveIndicator from '../components/ui/LiveIndicator';
import { Droplets, Thermometer, Wind, Sun, CloudRain, AlertTriangle, CheckCircle2, XCircle, Clock, Wheat, Leaf, Tractor, ShieldAlert, TrendingUp, TrendingDown, Minus } from 'lucide-react';

/* ── Color Palette (Agricultural theme) ────────────────── */
const C = {
  green:   '#16A34A', greenBg:   '#F0FDF4', greenBorder:   '#BBF7D0',
  amber:   '#D97706', amberBg:   '#FFFBEB', amberBorder:   '#FDE68A',
  red:     '#DC2626', redBg:     '#FEF2F2', redBorder:     '#FECACA',
  earth:   '#92400E', earthBg:   '#FEF3C7',
  sky:     '#0369A1', skyBg:     '#F0F9FF',
  slate:   '#475569', muted:     '#94A3B8',
  cardBg:  '#FFFFFF', pageBg:    '#F8FAF5',
};

/* ── Score Gauge Component ─────────────────────────────── */
const ScoreGauge = ({ score, label, icon: Icon, status, statusColors }) => {
  const color = score >= 70 ? C.green : score >= 40 ? C.amber : C.red;
  const bg = score >= 70 ? C.greenBg : score >= 40 ? C.amberBg : C.redBg;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ background: C.cardBg, border: '1px solid #E2E8F0', borderRadius: 16, padding: '24px 16px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
    >
      <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 12px' }}>
        <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="44" cy="44" r="36" fill="none" stroke="#E2E8F0" strokeWidth="6" />
          <circle cx="44" cy="44" r="36" fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ fontSize: 22, fontWeight: 800, color }}>{score}</span>
          <span style={{ fontSize: 9, color: C.muted, fontWeight: 600 }}>/ 100</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
        <Icon size={16} color={color} />
        <span style={{ fontSize: 13, fontWeight: 700, color: C.slate }}>{label}</span>
      </div>
      <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: bg, color, letterSpacing: '0.5px' }}>
        {status}
      </span>
    </div>
  );
};

/* ── Timeline Bar (12-hour windows) ────────────────────── */
const TimelineBar = ({ windows, label }) => {
  if (!windows || windows.length === 0) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.slate, marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', gap: 3, borderRadius: 8, overflow: 'hidden' }}>
        {windows.map((w, i) => {
          const bg = w.rating === 'GOOD' ? '#86EFAC' : w.rating === 'FAIR' ? '#FDE68A' : '#FCA5A5';
          const txtColor = w.rating === 'GOOD' ? '#166534' : w.rating === 'FAIR' ? '#92400E' : '#991B1B';
          return (
            <div key={i} title={`${w.hour_label} — Score: ${w.score} (${w.rating})\nTemp: ${w.projected_temp}°C | Humidity: ${w.projected_humidity}% | AQI: ${w.projected_aqi}`}
              style={{ flex: 1, background: bg, padding: '8px 2px', textAlign: 'center', cursor: 'default', transition: 'transform 0.15s', minWidth: 0 }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scaleY(1.15)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scaleY(1)'}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: txtColor }}>{w.hour_label?.slice(0, 2)}</div>
              <div style={{ fontSize: 9, color: txtColor, opacity: 0.8 }}>{w.score}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 6, justifyContent: 'center' }}>
        {[{ label: 'Ideal', color: '#86EFAC' }, { label: 'Fair', color: '#FDE68A' }, { label: 'Avoid', color: '#FCA5A5' }].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: C.muted }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />{l.label}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Condition Pill ────────────────────────────────────── */
const CondPill = ({ icon: Icon, label, value, unit, ok }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: ok ? C.greenBg : C.amberBg, border: `1px solid ${ok ? C.greenBorder : C.amberBorder}`, borderRadius: 8, padding: '6px 12px', fontSize: 12 }}>
    <Icon size={14} color={ok ? C.green : C.amber} />
    <span style={{ color: C.slate, fontWeight: 500 }}>{label}:</span>
    <span style={{ fontWeight: 700, color: ok ? C.green : C.amber }}>{value}{unit}</span>
    {ok ? <CheckCircle2 size={12} color={C.green} /> : <AlertTriangle size={12} color={C.amber} />}
  </div>
);

/* ── Advisory Card ─────────────────────────────────────── */
const AdvisoryCard = ({ title, icon: Icon, iconColor, children, accentColor }) => (
  <div style={{ background: C.cardBg, border: '1px solid #E2E8F0', borderLeft: `4px solid ${accentColor || C.green}`, borderRadius: 12, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ background: `${accentColor}15`, padding: 8, borderRadius: 10 }}>
        <Icon size={22} color={accentColor || C.green} />
      </div>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.slate }}>{title}</h3>
    </div>
    {children}
  </div>
);

/* ── Interference Alert Row ────────────────────────────── */
const AlertRow = ({ alert }) => {
  const sevColors = { CRITICAL: C.red, HIGH: C.red, MEDIUM: C.amber, LOW: C.green };
  const sevBg = { CRITICAL: C.redBg, HIGH: C.redBg, MEDIUM: C.amberBg, LOW: C.greenBg };
  const icons = { SMOKE_DRIFT: Wind, DUST_INTERFERENCE: CloudRain, INSTABILITY: TrendingUp, ACTIVITY_INTERRUPT: XCircle };
  const AlertIcon = icons[alert.type] || AlertTriangle;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: sevBg[alert.severity] || C.amberBg, border: `1px solid ${sevColors[alert.severity] || C.amber}30`, borderRadius: 10, padding: '14px 16px', marginBottom: 8 }}>
      <AlertIcon size={18} color={sevColors[alert.severity] || C.amber} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: sevColors[alert.severity] || C.amber, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
          {alert.type?.replace(/_/g, ' ')}
        </div>
        <div style={{ fontSize: 13, color: C.slate }}>{alert.message}</div>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: sevColors[alert.severity] || C.amber, color: '#fff' }}>
        {alert.severity}
      </span>
    </div>
  );
};


/* ══════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ══════════════════════════════════════════════════════════ */
const AgriAdvisory = () => {
  const userRole = auth.getRole() === 'admin' ? 'admin' : 'citizen';
  const [selectedNode, setSelectedNode] = useState(null);

  const fetchAdvisory = useCallback(() => {
    const url = selectedNode ? `/agri/advisory?node_id=${selectedNode}` : '/agri/advisory';
    return api.get(url);
  }, [selectedNode]);

  const fetchNodes = useCallback(() => api.get('/nodes/status'), []);

  const { data: advData, lastUpdated } = usePolling(fetchAdvisory, 30000);
  const { data: nodeData } = usePolling(fetchNodes, 60000);

  const advisory = advData?.data || {};
  const spray = advisory.spray || {};
  const drying = advisory.drying || {};
  const work = advisory.work_timing || {};
  const interference = advisory.interference || {};
  const meta = advisory.meta || {};

  const nodes = nodeData?.data?.nodes || [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: C.pageBg }}>
      <GovHeader />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar userRole={userRole} />

        <main style={{ flex: 1, padding: 32, minWidth: 0, overflowY: 'auto' }}>

          {/* ── Page Header ──────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: 'linear-gradient(135deg, #16A34A, #65A30D)', padding: 8, borderRadius: 10 }}>
                  <Wheat size={22} color="#fff" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.slate }}>
                    Farm Advisory
                  </h2>
                  <p style={{ margin: 0, fontSize: 13, color: C.muted }}>
                    Environmental decision intelligence for agricultural operations
                  </p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Node filter */}
              <select
                value={selectedNode || ''}
                onChange={e => setSelectedNode(e.target.value ? parseInt(e.target.value) : null)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, color: C.slate, background: '#fff', cursor: 'pointer' }}
              >
                <option value="">All Nodes (Average)</option>
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.node_name} — {n.village}</option>
                ))}
              </select>
              <LiveIndicator lastUpdated={lastUpdated} isFresh={!!meta.generated_at} />
            </div>
          </div>

          {/* ── Score Cards Row ──────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            <ScoreGauge score={spray.spray_score || 0} label="Spray Window" icon={Leaf} status={spray.status || '—'} />
            <ScoreGauge score={drying.drying_score || 0} label="Crop Drying" icon={Sun} status={drying.status || '—'} />
            <ScoreGauge score={work.comfort_score || 0} label="Work Comfort" icon={Tractor} status={work.status || '—'} />
            <div style={{
              background: C.cardBg, border: '1px solid #E2E8F0', borderRadius: 16, padding: '24px 16px', textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                background: interference.overall_status === 'CLEAR' ? C.greenBg : interference.overall_status === 'MEDIUM' ? C.amberBg : C.redBg,
              }}>
                {interference.overall_status === 'CLEAR'
                  ? <CheckCircle2 size={28} color={C.green} />
                  : <ShieldAlert size={28} color={interference.overall_status === 'MEDIUM' ? C.amber : C.red} />
                }
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.slate, marginBottom: 4 }}>Interference</span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, letterSpacing: '0.5px',
                background: interference.overall_status === 'CLEAR' ? C.greenBg : C.redBg,
                color: interference.overall_status === 'CLEAR' ? C.green : C.red,
              }}>
                {interference.alert_count || 0} alert{(interference.alert_count || 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* ── Module 1: Spray Window ───────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <AdvisoryCard title="Smart Spraying Window" icon={Leaf} iconColor="#16A34A" accentColor="#16A34A">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                <CondPill icon={Droplets} label="Humidity" value={spray.humidity || 0} unit="%" ok={(spray.humidity || 0) >= 40 && (spray.humidity || 0) <= 70} />
                <CondPill icon={Thermometer} label="Temp" value={spray.temperature || 0} unit="°C" ok={(spray.temperature || 0) >= 15 && (spray.temperature || 0) <= 30} />
                <CondPill icon={Wind} label="AQI" value={spray.aqi || 0} unit="" ok={(spray.aqi || 0) < 150} />
              </div>
              <div style={{ marginBottom: 12 }}>
                {(spray.reasons || []).map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.slate, marginBottom: 4 }}>
                    <span>{r.includes('favorable') || r.includes('Good') ? '✅' : '⚠️'}</span> {r}
                  </div>
                ))}
              </div>
              <TimelineBar windows={spray.windows} label="12-Hour Spray Forecast" />
            </AdvisoryCard>

            {/* ── Module 2: Crop Drying ───────────────── */}
            <AdvisoryCard title="Crop Drying Optimization" icon={Sun} iconColor="#D97706" accentColor="#D97706">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                <CondPill icon={Droplets} label="Humidity" value={drying.humidity || 0} unit="%" ok={(drying.humidity || 0) < 55} />
                <CondPill icon={Thermometer} label="Temp" value={drying.temperature || 0} unit="°C" ok={(drying.temperature || 0) > 25} />
                <CondPill icon={Wind} label="AQI" value={drying.aqi || 0} unit="" ok={(drying.aqi || 0) < 200} />
              </div>
              {drying.moisture_warning && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.amberBg, border: `1px solid ${C.amberBorder}`, borderRadius: 8, padding: '8px 12px', marginBottom: 8, fontSize: 12, color: C.amber, fontWeight: 600 }}>
                  <Droplets size={14} /> Moisture Warning — High humidity may affect drying quality
                </div>
              )}
              {drying.dust_interference && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: 8, padding: '8px 12px', marginBottom: 8, fontSize: 12, color: C.red, fontWeight: 600 }}>
                  <Wind size={14} /> Dust Interference — Risk of crop contamination
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                {(drying.reasons || []).map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.slate, marginBottom: 4 }}>
                    <span>{r.includes('Good') ? '☀️' : '⚠️'}</span> {r}
                  </div>
                ))}
              </div>
              <TimelineBar windows={drying.windows} label="12-Hour Drying Forecast" />
            </AdvisoryCard>
          </div>

          {/* ── Module 3 & 4: Work Timing + Interference ─ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <AdvisoryCard title="Outdoor Work Timing" icon={Tractor} iconColor="#0369A1" accentColor="#0369A1">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                <CondPill icon={Thermometer} label="Temp" value={work.temperature || 0} unit="°C" ok={(work.temperature || 0) >= 18 && (work.temperature || 0) <= 32} />
                <CondPill icon={Droplets} label="Humidity" value={work.humidity || 0} unit="%" ok={(work.humidity || 0) < 75} />
                <CondPill icon={Wind} label="AQI" value={work.aqi || 0} unit="" ok={(work.aqi || 0) < 150} />
              </div>

              {(work.recommended_hours || []).length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.green, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> Recommended Hours
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {work.recommended_hours.map((h, i) => (
                      <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: C.greenBg, color: C.green, border: `1px solid ${C.greenBorder}` }}>{h}</span>
                    ))}
                  </div>
                </div>
              )}
              {(work.avoid_hours || []).length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.red, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <XCircle size={13} /> Avoid These Hours
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {work.avoid_hours.map((h, i) => (
                      <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: C.redBg, color: C.red, border: `1px solid ${C.redBorder}` }}>{h}</span>
                    ))}
                  </div>
                </div>
              )}

              <TimelineBar windows={work.windows} label="12-Hour Comfort Forecast" />
            </AdvisoryCard>

            <AdvisoryCard title="Smoke & Dust Interference" icon={ShieldAlert} iconColor={interference.overall_status === 'CLEAR' ? C.green : C.red} accentColor={interference.overall_status === 'CLEAR' ? C.green : C.red}>
              {(interference.active_alerts || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <CheckCircle2 size={40} color={C.green} style={{ marginBottom: 10 }} />
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.green, marginBottom: 4 }}>All Clear</div>
                  <div style={{ fontSize: 13, color: C.muted }}>No smoke or dust interference detected</div>
                  <div style={{ marginTop: 12, fontSize: 12, color: C.muted }}>
                    Baseline AQI: <strong style={{ color: C.slate }}>{interference.baseline_aqi || '—'}</strong> →
                    Current: <strong style={{ color: C.slate }}>{interference.current_aqi || '—'}</strong>
                  </div>
                </div>
              ) : (
                <div>
                  {interference.active_alerts.map((a, i) => <AlertRow key={i} alert={a} />)}
                  <div style={{ marginTop: 12, fontSize: 12, color: C.muted, textAlign: 'center' }}>
                    Baseline AQI: <strong>{interference.baseline_aqi || '—'}</strong> →
                    Current: <strong style={{ color: C.red }}>{interference.current_aqi || '—'}</strong>
                  </div>
                </div>
              )}
            </AdvisoryCard>
          </div>

          {/* ── Footer meta ──────────────────────────── */}
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: C.muted }}>
            Generated at {meta.generated_at || '—'} UTC • {meta.node_count || 0} node(s) • {meta.readings_analyzed || 0} readings analyzed
          </div>

        </main>
      </div>
    </div>
  );
};

export default AgriAdvisory;
