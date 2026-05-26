"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndiaRegion } from '@/lib/mockDataV1';
import { ArrowUpDown, ShieldAlert, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DistrictComparisonTableProps {
  regions: IndiaRegion[];
}

type SortField = 'name' | 'state' | 'stressLevel' | 'aquiferHealth' | 'extractionRate' | 'rechargeRate' | 'trend';
type SortOrder = 'asc' | 'desc';

// Maps stress string to a weight for accurate sorting
const stressWeights = {
  critical: 5,
  high: 4,
  moderate: 3,
  low: 2,
  safe: 1
};

// Maps trend string to weight
const trendWeights = {
  critical: 4,
  declining: 3,
  stable: 2,
  improving: 1
};

export const DistrictComparisonTable: React.FC<DistrictComparisonTableProps> = ({ regions }) => {
  const [sortField, setSortField] = useState<SortField>('stressLevel');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterQuery, setFilterQuery] = useState('');

  // Handle header sorting click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Search & Sort Memo
  const sortedRegions = useMemo(() => {
    let result = [...regions];

    if (filterQuery.trim()) {
      const query = filterQuery.toLowerCase();
      result = result.filter(
        r => r.name.toLowerCase().includes(query) || r.state.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      // Custom weights for string values to make sorting logical
      if (sortField === 'stressLevel') {
        aVal = stressWeights[a.stressLevel];
        bVal = stressWeights[b.stressLevel];
      } else if (sortField === 'trend') {
        aVal = trendWeights[a.trend];
        bVal = trendWeights[b.trend];
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [regions, sortField, sortOrder, filterQuery]);

  // Color mapping
  const stressBadgeColors = {
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    moderate: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    low: 'bg-teal-50 text-teal-700 border-teal-200',
    safe: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  // Render Trend indicator
  const renderTrendIcon = (trend: IndiaRegion['trend']) => {
    switch (trend) {
      case 'critical':
        return <span className="flex items-center gap-1 text-rose-600 font-bold"><ShieldAlert className="w-3.5 h-3.5 animate-bounce" /> Critical</span>;
      case 'declining':
        return <span className="flex items-center gap-1 text-orange-500 font-semibold"><TrendingDown className="w-3.5 h-3.5" /> Declining</span>;
      case 'stable':
        return <span className="flex items-center gap-1 text-slate-400 font-medium"><Minus className="w-3.5 h-3.5" /> Stable</span>;
      case 'improving':
        return <span className="flex items-center gap-1 text-emerald-500 font-bold"><TrendingUp className="w-3.5 h-3.5" /> Recharging</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/60 backdrop-blur-2xl border border-white/50 rounded-2xl p-6 shadow-xl overflow-hidden">
      
      {/* Table Header Filter controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4.5 h-4.5 text-cyan-500" />
            District Sustainability Indexes
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Comparative groundwater analytics of monitored districts</p>
        </div>

        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter by district/state..."
          className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all font-medium placeholder-slate-400"
        />
      </div>

      {/* Grid Scroll Area */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[500px] border border-slate-100/80 rounded-xl bg-white/80 custom-scrollbar">
        <table className="w-full border-collapse text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 sticky top-0 z-10 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              {(['name', 'state', 'stressLevel', 'aquiferHealth', 'extractionRate', 'rechargeRate', 'trend'] as const).map(col => {
                const labels: Record<string, string> = {
                  name: 'District',
                  state: 'State',
                  stressLevel: 'Stress Level',
                  aquiferHealth: 'Aquifer Health',
                  extractionRate: 'Extraction (MLD)',
                  rechargeRate: 'Recharge (MLD)',
                  trend: 'Trend'
                };
                return (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="px-5 py-4 cursor-pointer hover:bg-slate-100 hover:text-slate-700 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      {labels[col]}
                      <ArrowUpDown className={`w-3 h-3 ${sortField === col ? 'text-cyan-500' : 'text-slate-300'}`} />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/60">
            <AnimatePresence mode="popLayout">
              {sortedRegions.length > 0 ? (
                sortedRegions.map((region, idx) => (
                  <motion.tr
                    key={region.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.02, 0.2) }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-800">{region.name}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-500">{region.state}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${stressBadgeColors[region.stressLevel]}`}>
                        {region.stressLevel}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 min-w-[28px]">{region.aquiferHealth}%</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                          <div
                            className={`h-full rounded-full ${
                              region.aquiferHealth > 75 ? 'bg-emerald-500' :
                              region.aquiferHealth > 50 ? 'bg-teal-500' :
                              region.aquiferHealth > 30 ? 'bg-yellow-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${region.aquiferHealth}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-700">{region.extractionRate}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-700">{region.rechargeRate}</td>
                    <td className="px-5 py-3.5">{renderTrendIcon(region.trend)}</td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                    <div className="text-sm font-semibold">No districts matching criteria</div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default DistrictComparisonTable;
