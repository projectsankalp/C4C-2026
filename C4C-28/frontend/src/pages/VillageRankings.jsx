import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePolling } from '../hooks/usePolling';
import { api } from '../services/api';
import GovHeader from '../components/layout/GovHeader';
import Sidebar from '../components/layout/Sidebar';
import AQIBadge from '../components/ui/AQIBadge';

const VillageRankings = () => {
  const navigate = useNavigate();
  const fetchRankings = useCallback(() => api.get('/rankings/current'), []);
  const { data, loading, error } = usePolling(fetchRankings, 60000);

  const rankings = data?.data?.rankings || [];

  const rewardBadge = (status) => {
    const styles = {
      eligible:     { bg: '#DCFCE7', color: '#15803D' },
      rewarded:     { bg: '#D1FAE5', color: '#065F46' },
      under_review: { bg: '#FEF3C7', color: '#92400E' },
      not_eligible: { bg: '#F3F4F6', color: '#6B7280' },
    };
    const s = styles[status] || styles.not_eligible;
    return <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, fontWeight: 600, background: s.bg, color: s.color }}>{status?.replace('_', ' ')}</span>;
  };

  const medalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-alt)' }}>
      <GovHeader />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar userRole="citizen" />
        <main style={{ flex: 1, padding: '32px', minWidth: 0 }}>

          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--color-secondary)' }}>
              🏆 Village Clean Air Rankings
            </h2>
            <p style={{ color: '#6B7280', fontSize: 14, marginTop: 6 }}>
              Quarterly competition — Villages ranked by average Air Quality performance
            </p>
          </div>

          {/* Clean Air Guidelines Banner for Village Rankings */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, #138808 0%, #0F6A06 100%)',
            border: 'none',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(19, 136, 8, 0.2)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>🏆</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                  Help Your Village Win Clean Air Rewards!
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#D1FAE5' }}>
                  Lower ranked villages can rise higher by adopting community-wide clean air action guidelines.
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
              Learn the Measures →
            </button>
          </div>

          {/* Podium */}
          {rankings.length >= 2 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', maxWidth: '600px', margin: '0 auto 32px' }}>
              {[rankings[0], rankings[1]].map((r, podiumIndex) => {
                const isGold = r?.rank_position === 1;
                return (
                  <div key={r?.rank_position} style={{
                    width: '180px',
                    textAlign: 'center', padding: '20px 12px',
                    background: isGold ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)' : '#fff',
                    border: isGold ? '2px solid #F59E0B' : '1px solid var(--color-border)',
                    borderRadius: 12,
                    boxShadow: isGold ? '0 4px 20px rgba(245,158,11,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
                    transform: isGold ? 'scale(1.05)' : 'scale(1)',
                  }}>
                    <div style={{ fontSize: 28 }}>{r?.rank_position === 1 ? '🥇' : '🥈'}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, margin: '6px 0 4px', color: 'var(--color-secondary)' }}>{r?.village_name}</div>
                    <AQIBadge aqi={Math.round(r?.average_aqi || 0)} size="sm" />
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>Score: {Math.round(r?.final_score || 0)}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Leaderboard */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', background: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--color-secondary)' }}>Full Leaderboard — {data?.data?.quarter || 'Current Quarter'}</h3>
              <span style={{ fontSize: 13, color: '#9CA3AF' }}>{rankings.length} villages ranked</span>
            </div>

            {loading && <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF' }}>Loading rankings...</div>}
            {error && <div style={{ padding: 24, color: '#DC2626', fontSize: 14 }}>⚠️ {error} — Rankings may not be generated yet.</div>}

            {!loading && rankings.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                <p style={{ fontWeight: 600 }}>No rankings generated yet.</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Admin needs to generate the quarterly ranking via the API.</p>
              </div>
            )}

            {rankings.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#F9FAFB' }}>
                    <tr>
                      {['Rank', 'Village', 'Avg Air Quality', 'Final Score', 'Hazardous Days', 'Reward Status'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i < 3 ? '#FFFBEB' : 'transparent' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: 16 }}>{medalEmoji(r.rank_position)}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{r.village_name}</td>
                        <td style={{ padding: '12px 16px' }}><AQIBadge aqi={Math.round(r.average_aqi || 0)} size="sm" /></td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-primary)' }}>{Math.round(r.final_score || 0)}</td>
                        <td style={{ padding: '12px 16px', color: r.hazardous_days > 0 ? '#DC2626' : '#16A34A' }}>{r.hazardous_days ?? 0}</td>
                        <td style={{ padding: '12px 16px' }}>{rewardBadge(r.reward_status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};

export default VillageRankings;
