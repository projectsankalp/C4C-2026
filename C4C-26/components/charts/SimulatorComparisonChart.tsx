"use client";

import React from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { calculateSustainability, UserProfile } from '@/lib/scoreEngine';

interface SimulatorComparisonChartProps {
  currentProfile: UserProfile;
  simulatedProfile: UserProfile;
}

export const SimulatorComparisonChart: React.FC<SimulatorComparisonChartProps> = ({
  currentProfile,
  simulatedProfile,
}) => {
  const currentResult = calculateSustainability(currentProfile);
  const simulatedResult = calculateSustainability(simulatedProfile);

  const monthlyFactors = [
    { month: 'Jan', multiplier: 0.75 },
    { month: 'Feb', multiplier: 0.72 },
    { month: 'Mar', multiplier: 0.88 },
    { month: 'Apr', multiplier: 1.15 },
    { month: 'May', multiplier: 1.38 },
    { month: 'Jun', multiplier: 1.56 },
    { month: 'Jul', multiplier: 1.50 },
    { month: 'Aug', multiplier: 1.31 },
    { month: 'Sep', multiplier: 1.06 },
    { month: 'Oct', multiplier: 0.91 },
    { month: 'Nov', multiplier: 0.81 },
    { month: 'Dec', multiplier: 0.78 },
  ];

  const chartData = monthlyFactors.map((item) => {
    return {
      month: item.month,
      current: Math.round(currentResult.monthlyUsageGallons * item.multiplier),
      simulated: Math.round(simulatedResult.monthlyUsageGallons * item.multiplier),
    };
  });

  return (
    <div className="w-full h-80 bg-ocean-900 border border-white/10 rounded-2xl p-4 shadow-xl">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">Live Extraction Overlay</h3>
        <p className="text-xs text-slate-400">Visualizing 12-month extraction volumes (gallons): Current vs Simulated</p>
      </div>
      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="simulatedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: '#0c2340',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              verticalAlign="bottom"
              height={36}
            />
            {/* Simulated is the area */}
            <Area
              type="monotone"
              name="Simulated Extraction"
              dataKey="simulated"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#simulatedGradient)"
              animationDuration={500}
            />
            {/* Current is the line */}
            <Line
              type="monotone"
              name="Current Extraction"
              dataKey="current"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3, fill: '#ef4444' }}
              activeDot={{ r: 5 }}
              animationDuration={500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SimulatorComparisonChart;
