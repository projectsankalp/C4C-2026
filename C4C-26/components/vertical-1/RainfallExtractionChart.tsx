"use client";

import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { RainfallVsExtraction } from '@/lib/mockDataV1';

interface RainfallExtractionChartProps {
  data: RainfallVsExtraction[];
}

export const RainfallExtractionChart: React.FC<RainfallExtractionChartProps> = ({ data }) => {
  return (
    <div className="w-full h-80 bg-white/60 backdrop-blur-2xl border border-white/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      {/* Header section detailing seasonal relationships */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Monsoon Rainfall vs. Groundwater Extraction (12 Months)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Juxtaposing annual precipitation volume with average drew rate</p>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-bold uppercase">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-cyan-400" />
            <span className="text-slate-600">Rainfall (MM)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-teal-500" />
            <span className="text-slate-600">Extraction (Million L/day)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span className="text-slate-600">Recharge capacity</span>
          </div>
        </div>
      </div>

      {/* Composed Chart Visual */}
      <div className="flex-1 w-full h-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: -10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
            />
            {/* Left YAxis for Rainfall */}
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            {/* Right YAxis for Extraction */}
            <YAxis
              yAxisId="right"
              orientation="right"
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
            
            {/* Rainfall Bar (left Axis) */}
            <Bar
              yAxisId="left"
              dataKey="rainfall"
              fill="url(#rainGrad)"
              radius={[4, 4, 0, 0]}
              name="Monthly Rainfall (mm)"
            />
            
            {/* Extraction Line (right Axis) */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="extraction"
              stroke="#0f766e"
              strokeWidth={3}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
              name="Extraction Volume (MLD)"
            />

            {/* Natural Recharge Line (right Axis) */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="recharge"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              name="Natural Recharge (MLD)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RainfallExtractionChart;
