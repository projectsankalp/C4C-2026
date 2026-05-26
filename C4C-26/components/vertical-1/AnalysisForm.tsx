"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisInput, indiaRegions } from '@/lib/mockDataV1';
import { Droplet, LandPlot, Hammer, Search, HelpCircle, LocateFixed, Loader2 } from 'lucide-react';
import { locateAndMatch } from '@/lib/geolocation';
import { toast } from 'sonner';

interface AnalysisFormProps {
  onSubmit: (input: AnalysisInput) => void;
  isLoading: boolean;
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({ onSubmit, isLoading }) => {
  const [location, setLocation] = useState('');
  const [intendedUsage, setIntendedUsage] = useState<'agriculture' | 'domestic' | 'industrial'>('domestic');
  const [borewellDepth, setBorewellDepth] = useState(40);
  const [extractionFrequency, setExtractionFrequency] = useState<'daily' | 'weekly' | 'bi-weekly' | 'monthly'>('weekly');
  const [landSize, setLandSize] = useState(5);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateMe = async () => {
    setIsLocating(true);
    const result = await locateAndMatch();
    setIsLocating(false);

    if (result.success) {
      setLocation(`${result.matchedRegion.name}, ${result.matchedRegion.state}`);
      toast.success(`Location matched: ${result.matchedRegion.name}, ${result.matchedRegion.state}`, {
        icon: <LocateFixed className="text-cyan-500" />
      });
    } else {
      toast.error('Could not detect location automatically. Please select manually.', {
        description: result.message
      });
    }
  };

  // Filter regional names matching input
  const suggestions = useMemo(() => {
    if (!location.trim()) return [];
    const query = location.toLowerCase();
    return indiaRegions
      .filter(r => r.name.toLowerCase().includes(query) || r.state.toLowerCase().includes(query))
      .slice(0, 5);
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;
    
    onSubmit({
      location: location.trim(),
      intendedUsage,
      borewellDepth,
      extractionFrequency,
      landSize
    });
  };

  const usageOptions = [
    {
      id: 'domestic' as const,
      title: 'Domestic',
      description: 'Drinking, washing, small gardening gardens',
      icon: Droplet,
      colorClass: 'text-cyan-500 bg-cyan-50 border-cyan-200 hover:border-cyan-400',
      activeBorderClass: 'border-cyan-500 shadow-cyan-100/50 shadow-md ring-2 ring-cyan-500/10'
    },
    {
      id: 'agriculture' as const,
      title: 'Agriculture',
      description: 'Crop fields, orchards, livestock grids',
      icon: LandPlot,
      colorClass: 'text-emerald-500 bg-emerald-50 border-emerald-200 hover:border-emerald-400',
      activeBorderClass: 'border-emerald-500 shadow-emerald-100/50 shadow-md ring-2 ring-emerald-500/10'
    },
    {
      id: 'industrial' as const,
      title: 'Industrial',
      description: 'Factories, heavy cooling, commercial hubs',
      icon: Hammer,
      colorClass: 'text-rose-500 bg-rose-50 border-rose-200 hover:border-rose-400',
      activeBorderClass: 'border-rose-500 shadow-rose-100/50 shadow-md ring-2 ring-rose-500/10'
    }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location Search Input */}
      <div className="relative">
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          Borewell Location / Region
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={location}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Jaipur, Amritsar, Wayanad..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all font-medium"
            />
          </div>
          <button
            type="button"
            disabled={isLocating}
            onClick={handleLocateMe}
            className="flex items-center gap-1.5 px-4 py-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-cyan-600 hover:text-cyan-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer select-none shrink-0"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
            ) : (
              <LocateFixed className="w-4 h-4" />
            )}
            <span>Locate Me</span>
          </button>
        </div>

        {/* Suggestion Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute z-30 w-full mt-2 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl shadow-xl overflow-hidden py-1"
            >
              {suggestions.map(s => (
                <li
                  key={s.id}
                  onMouseDown={() => setLocation(`${s.name}, ${s.state}`)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                >
                  <span>{s.name}, <span className="text-slate-400 font-normal">{s.state}</span></span>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                    s.stressLevel === 'critical' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                    s.stressLevel === 'high' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                    s.stressLevel === 'moderate' ? 'bg-yellow-50 border-yellow-100 text-yellow-600' :
                    'bg-emerald-50 border-emerald-100 text-emerald-600'
                  }`}>
                    {s.stressLevel}
                  </span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Intended Usage Radio Cards */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          Intended Water Usage
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {usageOptions.map(option => {
            const Icon = option.icon;
            const isSelected = intendedUsage === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setIntendedUsage(option.id)}
                className={`flex flex-col text-left p-4 rounded-xl border bg-white/80 transition-all focus:outline-none ${
                  isSelected ? option.activeBorderClass : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg border w-fit mb-3 ${option.colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">{option.title}</h4>
                <p className="text-[10px] text-slate-500 leading-normal">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Borewell Depth Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
            Borewell Target Depth
            <span className="group relative cursor-pointer text-slate-300 hover:text-slate-400">
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[9px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity leading-normal z-50 text-center font-normal">
                Deeper borewells bypass shallow recharge aquifers and extract ancient groundwater tables, increasing depletion risks.
              </span>
            </span>
          </label>
          <span className="text-sm font-black text-cyan-600">{borewellDepth} meters</span>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-4 border border-slate-100 rounded-xl">
          <input
            type="range"
            min={10}
            max={1000}
            step={10}
            value={borewellDepth}
            onChange={(e) => setBorewellDepth(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
      </div>

      {/* Extraction Frequency & Land Size Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Dropdown for extraction rate frequency */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Extraction Frequency
          </label>
          <select
            value={extractionFrequency}
            onChange={(e) => setExtractionFrequency(e.target.value as 'daily' | 'weekly' | 'bi-weekly' | 'monthly')}
            className="w-full px-4 py-3 bg-white border border-slate-200/80 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all appearance-none cursor-pointer"
            style={{
              backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 16px center',
              backgroundSize: '14px'
            }}
          >
            <option value="daily">Daily Continuous</option>
            <option value="weekly">Weekly Regular</option>
            <option value="bi-weekly">Bi-weekly Scheduled</option>
            <option value="monthly">Monthly Minimal</option>
          </select>
        </div>

        {/* Land Size Range */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Land / Plot Size
            </label>
            <span className="text-sm font-black text-cyan-600">{landSize} Acres</span>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-3 border border-slate-100 rounded-xl">
            <input
              type="range"
              min={0.5}
              max={500}
              step={0.5}
              value={landSize}
              onChange={(e) => setLandSize(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing Aquifer Scans...
          </>
        ) : (
          'Calculate Drilling Sustainability'
        )}
      </motion.button>
    </form>
  );
};

export default AnalysisForm;
