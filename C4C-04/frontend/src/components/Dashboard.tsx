import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { supabase } from '../supabaseClient';

interface DashboardData {
  gardenStage: number;
  insight: string;
  moodTimeline: { time: string, mood: string, note: string }[];
  stressData: { day: string, stress: number, activities: number }[];
  energyState: string;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [gardenAnim, setGardenAnim] = useState(false);
  const [timeRange, setTimeRange] = useState('days');
  
  // Fetch real-time user history data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;
        
        const response = await fetch(`http://localhost:8000/api/dashboard?user_id=${session.user.id}&time_range=${timeRange}`);
        const result = await response.json();
        setData(result);
        
        setTimeout(() => setGardenAnim(true), 100);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  if (loading || !data) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center', marginTop: '10rem' }}>
        <h2 style={{ color: 'var(--text-secondary)' }}>Generating your wellness insights...</h2>
        <div style={{ fontSize: '3rem', marginTop: '2rem' }}>🌿</div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Analyzing recent interactions...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Your Wellness Dashboard</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)' }}>
          Track your emotional journey, visualize your stress patterns, and watch your personal growth blossom.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* Stress Analytics Graph */}
        <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ marginBottom: '0.25rem' }}>STRESS ANALYZER</h3>
              <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-secondary)' }}>See how wellness activities impact your stress levels over time.</p>
            </div>
            
            {/* Time Range Selector */}
            <div style={{ display: 'flex', background: 'rgba(126, 200, 227, 0.1)', borderRadius: '8px', padding: '0.25rem', border: '1px solid rgba(126, 200, 227, 0.2)' }}>
              {['hours', 'days', 'weeks', 'months'].map(range => (
                <button 
                  key={range}
                  onClick={() => setTimeRange(range)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: timeRange === range ? 'var(--accent-primary)' : 'transparent',
                    color: timeRange === range ? 'white' : 'var(--text-primary)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    fontSize: '0.9rem',
                    transition: 'background 0.3s'
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.stressData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(126, 200, 227, 0.15)" />
                <XAxis dataKey="day" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid rgba(126, 200, 227, 0.2)', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: '0 4px 20px rgba(126, 200, 227, 0.15)' }}
                  itemStyle={{ color: 'var(--accent-primary)' }}
                />
                <Line type="monotone" dataKey="stress" stroke="var(--accent-primary)" strokeWidth={3} activeDot={{ r: 8 }} name="Stress Level (%)" />
                <Line type="monotone" dataKey="activities" stroke="var(--accent-secondary)" strokeWidth={3} name="Activities Completed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotional Energy Meter */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3>Emotional Energy</h3>
          <p style={{ fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Your current overall state</p>
          
          {/* Custom Radial Gauge using SVG */}
          <div style={{ position: 'relative', width: '200px', height: '100px', overflow: 'hidden', marginBottom: '1rem' }}>
            <svg viewBox="0 0 200 100" style={{ transform: 'rotate(180deg)' }}>
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(126, 200, 227, 0.15)" strokeWidth="20" strokeLinecap="round" />
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--accent-primary)" strokeWidth="20" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={gardenAnim ? "60" : "251.2"} style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
            </svg>
            <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
              {data.energyState === "Energized" ? "90%" : "50%"}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(126, 200, 227, 0.2)', borderRadius: '20px', fontSize: '0.9rem', color: 'var(--accent-primary)' }}>{data.energyState}</span>
          </div>
        </div>

        {/* Mood Journey Timeline */}
        <div className="glass-panel">
          <h3>Mood Journey</h3>
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {data.moodTimeline.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                {index !== data.moodTimeline.length - 1 && (
                  <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '-24px', width: '2px', background: 'rgba(126, 200, 227, 0.2)' }} />
                )}
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', flexShrink: 0, marginTop: '2px', boxShadow: '0 0 10px rgba(126, 200, 227, 0.4)' }} />
                <div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                    <strong>{item.mood}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.time}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(126, 200, 227, 0.15))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🧠</span>
            <h3 style={{ margin: 0 }}>AI Insights</h3>
          </div>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.6, fontStyle: 'italic' }}>
            "{data.insight}"
          </p>
        </div>

        {/* Personal Growth Garden */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3>Personal Growth Garden</h3>
          <p style={{ fontSize: '0.9rem', textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}>Your consistent habits are blooming!</p>
          
          <div style={{ fontSize: '6rem', transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)', transform: `scale(${!gardenAnim ? 0.5 : 1.1})` }}>
            {data.gardenStage === 1 ? '🌱' : (data.gardenStage === 2 ? '🪴' : '🌳')}
          </div>
          
          <div style={{ marginTop: '2.5rem', width: '100%', background: 'rgba(126, 200, 227, 0.15)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: gardenAnim ? `${data.gardenStage * 33}%` : '0%', height: '100%', background: 'linear-gradient(90deg, #7EC8E3, #A7DFF3)', transition: 'width 1.5s ease-out' }} />
          </div>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>70% to next growth stage</p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
