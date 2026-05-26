"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { useUser } from '@/lib/userContext';
import { calculateSustainability, UserProfile } from '@/lib/scoreEngine';

export const LifespanBarChart: React.FC = () => {
  const { profile, result } = useUser();

  if (!profile || !result) return null;

  // Calculate optimized profile values dynamically
  const optimizedProfile: UserProfile = {
    ...profile,
    cropType: profile.cropType === 'water-intensive' || profile.cropType === 'moderate' ? 'drought-resistant' : profile.cropType,
    irrigationFrequency: profile.irrigationFrequency === 'flood' || profile.irrigationFrequency === 'daily' ? 'bi-weekly' : profile.irrigationFrequency,
  };

  const optimizedResult = calculateSustainability(optimizedProfile);

  const data = [
    {
      name: 'Current Profile',
      years: result.lifespanYears,
      color: result.score >= 65 ? '#10b981' : result.score >= 35 ? '#f59e0b' : '#ef4444',
      shadowColor: result.score >= 65 ? 'rgba(16, 185, 129, 0.3)' : result.score >= 35 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)',
    },
    {
      name: 'Optimized Plan',
      years: optimizedResult.lifespanYears,
      color: '#10b981',
      shadowColor: 'rgba(16, 185, 129, 0.3)',
    },
    {
      name: 'Regional Average',
      years: 25,
      color: '#0891b2',
      shadowColor: 'rgba(8, 145, 178, 0.3)',
    }
  ];

  return (
    <div className="w-full h-80 bg-ocean-900 border border-white/10 rounded-2xl p-4 shadow-xl">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">Projected Aquifer Lifespan</h3>
        <p className="text-xs text-slate-400">Estimated years of water security remaining under current vs optimized behaviors</p>
      </div>
      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
            barSize={40}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              label={{ value: 'Years', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10, offset: 10 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
              contentStyle={{
                background: '#0c2340',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
              }}
              formatter={(value: string | number | readonly (string | number)[] | undefined) => {
                const displayVal = Array.isArray(value) ? value.join(', ') : (value ?? 0);
                return [`${displayVal} Years`, 'Aquifer Lifespan'];
              }}
            />
            <Bar dataKey="years" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LifespanBarChart;
