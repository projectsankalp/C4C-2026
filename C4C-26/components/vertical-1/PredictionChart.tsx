"use client";

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { PredictionPoint } from '@/lib/mockDataV1';

interface PredictionChartProps {
  data: PredictionPoint[];
  selectedScenario?: string; // Optional filtering parameter
}

export const PredictionChart: React.FC<PredictionChartProps> = ({ data }) => {
  return (
    <div className="w-full h-80 bg-white/60 backdrop-blur-2xl border border-white/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      {/* Top Header Row with descriptive scenario parameters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Groundwater Depth Projection Trajectory (2024 - 2038)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Projected groundwater table levels (meters beneath surface)</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500" />
            <span className="text-slate-600">Current Trajectory (Uncontrolled)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span className="text-slate-600">Optimized Trajectory (Conservation)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500" />
            <span className="text-slate-600">Critical Threshold (65m)</span>
          </div>
        </div>
      </div>

      {/* Main LineChart */}
      <div className="flex-1 w-full h-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
              reversed // Depth goes down, so reverse Y axis to make deeper lines look lower! Extremely realistic!
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '12px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
                color: '#334155'
              }}
              formatter={(value: string | number | readonly (string | number)[] | undefined) => {
                const displayVal = Array.isArray(value) ? value[0] : value;
                const numericVal = typeof displayVal === 'number' ? displayVal : parseFloat(displayVal || '0') || 0;
                return [`${numericVal.toFixed(1)} meters`, ''];
              }}
            />
            
            {/* Current Trajectory (Rose) */}
            <Line
              type="monotone"
              dataKey="currentTrajectory"
              stroke="#f43f5e"
              strokeWidth={3}
              dot={{ r: 3, stroke: '#f43f5e', strokeWidth: 1, fill: 'white' }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              animationBegin={0}
              animationDuration={1500}
              name="Current Trajectory"
            />
            
            {/* Optimized Trajectory (Emerald) */}
            <Line
              type="monotone"
              dataKey="optimizedTrajectory"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 3, stroke: '#10b981', strokeWidth: 1, fill: 'white' }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              animationBegin={200}
              animationDuration={1500}
              name="Optimized Trajectory"
            />
            
            {/* Critical Danger Threshold (Dashed Amber) */}
            <Line
              type="monotone"
              dataKey="criticalThreshold"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="6 6"
              dot={false}
              activeDot={false}
              animationDuration={500}
              name="Critical Safety Limit"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PredictionChart;
