"use client";

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useUser } from '@/lib/userContext';

export const UsageAreaChart: React.FC = () => {
  const { result } = useUser();
  
  if (!result) return null;
  
  const baseMonthlyUsage = result.monthlyUsageGallons;

  // Seasonal multipliers to represent typical irrigation variations
  const monthlyFactors = [
    { month: 'Jan', multiplier: 0.75, benchmark: 14000 },
    { month: 'Feb', multiplier: 0.72, benchmark: 13500 },
    { month: 'Mar', multiplier: 0.88, benchmark: 15000 },
    { month: 'Apr', multiplier: 1.15, benchmark: 17000 },
    { month: 'May', multiplier: 1.38, benchmark: 19500 },
    { month: 'Jun', multiplier: 1.56, benchmark: 21000 },
    { month: 'Jul', multiplier: 1.50, benchmark: 20500 },
    { month: 'Aug', multiplier: 1.31, benchmark: 19000 },
    { month: 'Sep', multiplier: 1.06, benchmark: 16500 },
    { month: 'Oct', multiplier: 0.91, benchmark: 15000 },
    { month: 'Nov', multiplier: 0.81, benchmark: 14000 },
    { month: 'Dec', multiplier: 0.78, benchmark: 14000 },
  ];

  const chartData = monthlyFactors.map((item) => {
    const userUsage = Math.round(baseMonthlyUsage * item.multiplier);
    return {
      month: item.month,
      usage: userUsage,
      benchmark: item.benchmark,
    };
  });

  return (
    <div className="w-full h-80 bg-ocean-900 border border-white/10 rounded-2xl p-4 shadow-xl">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">Monthly Groundwater Extraction Trend</h3>
        <p className="text-xs text-slate-400">Comparing your estimated consumption (gallons) vs. regional sustainability benchmark</p>
      </div>
      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
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
            <Area
              type="monotone"
              name="Your Extraction"
              dataKey="usage"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#usageGradient)"
            />
            <Area
              type="monotone"
              name="Sustainability Benchmark"
              dataKey="benchmark"
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#benchmarkGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UsageAreaChart;
