/**
 * GraamSehat Admin Dashboard - Risk Donut Chart Component
 * Location: /src/components/RiskDonut.jsx
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { RISK_LEVEL_COLORS } from '../utils/constants';

export default function RiskDonut({ green = 0, yellow = 0, red = 0 }) {
  const total = green + yellow + red;

  const data = [
    { name: 'Green (Low Risk)', value: green, color: RISK_LEVEL_COLORS.green },
    { name: 'Yellow (Moderate)', value: yellow, color: RISK_LEVEL_COLORS.yellow },
    { name: 'Red (High Risk)', value: red, color: RISK_LEVEL_COLORS.red }
  ].filter(item => item.value > 0); // Hide zero categories

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = total > 0 ? Math.round((data.value / total) * 100) : 0;
      return (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          fontSize: '0.8125rem'
        }}>
          <p style={{ fontWeight: 600, color: '#0F172A', marginBottom: '2px' }}>{data.name}</p>
          <p style={{ color: '#64748B' }}>Count: <strong>{data.value}</strong> ({percent}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 260, position: 'relative' }}>
      {total === 0 ? (
        <div style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748B',
          fontSize: '0.875rem'
        }}>
          No patient data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Centered Total Label */}
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>{total}</span>
          </div>
        </>
      )}
    </div>
  );
}
