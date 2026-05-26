"use client";

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { GroundwaterTrend } from '@/lib/mockDataV1';

interface StressTrendChartProps {
  data: GroundwaterTrend[];
}

export const StressTrendChart: React.FC<StressTrendChartProps> = ({ data }) => {
  return (
    <div className="w-full h-80 bg-white/60 backdrop-blur-2xl border border-white/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Historical Groundwater Depletion & Stress (2015 - 2024)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Historical decadal chart showing average water heights and draw stress</p>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-bold uppercase">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-cyan-400/20 border border-cyan-500" />
            <span className="text-slate-600">Depth (meters)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-400/20 border border-amber-500" />
            <span className="text-slate-600">Stress Index (0-100)</span>
          </div>
        </div>
      </div>

      {/* Main Area Chart */}
      <div className="flex-1 w-full h-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="depthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
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
            />
            
            {/* Groundwater Depth Area */}
            <Area
              type="monotone"
              dataKey="depth"
              stroke="#06b6d4"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#depthGrad)"
              name="Depth (meters)"
            />

            {/* Stress Index Area */}
            <Area
              type="monotone"
              dataKey="stressIndex"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#stressGrad)"
              name="Stress Index"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StressTrendChart;
