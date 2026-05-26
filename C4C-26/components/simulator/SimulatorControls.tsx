"use client";

import React from 'react';
import { UserProfile } from '@/lib/scoreEngine';
import { cropOptions, irrigationOptions } from '@/lib/mockData';
import { GlassCard } from '@/components/ui/GlassCard';
import { RotateCcw, Users, Trees, Sprout, Droplets, PawPrint } from 'lucide-react';

interface SimulatorControlsProps {
  values: UserProfile;
  onChange: (updated: UserProfile) => void;
  onReset: () => void;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  values,
  onChange,
  onReset,
}) => {
  const handleSliderChange = (name: keyof UserProfile, val: number) => {
    onChange({ ...values, [name]: val });
  };

  const handleSelectChange = (name: keyof UserProfile, val: string) => {
    onChange({ ...values, [name]: val });
  };

  return (
    <GlassCard className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Scenario Parameters</h3>
          <p className="text-xs text-slate-400">Tweak inputs to simulate aquifer impacts</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
          title="Reset to current profile"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Household Size */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Users className="w-4 h-4 text-aqua-400" />
            Household Size
          </label>
          <span className="text-sm font-bold text-aqua-400">{values.householdSize} People</span>
        </div>
        <input
          type="range"
          min="1"
          max="20"
          value={values.householdSize}
          onChange={(e) => handleSliderChange('householdSize', parseInt(e.target.value))}
          className="accent-aqua-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>1 Person</span>
          <span>20 People</span>
        </div>
      </div>

      {/* Land Size */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Trees className="w-4 h-4 text-aqua-400" />
            Land Size
          </label>
          <span className="text-sm font-bold text-aqua-400">{values.landAcres} Acres</span>
        </div>
        <input
          type="range"
          min="1"
          max="500"
          value={values.landAcres}
          onChange={(e) => handleSliderChange('landAcres', parseInt(e.target.value))}
          className="accent-aqua-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>1 Acre</span>
          <span>500 Acres</span>
        </div>
      </div>

      {/* Crop Choice */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Sprout className="w-4 h-4 text-aqua-400" />
          Crop Type
        </label>
        <select
          value={values.cropType}
          onChange={(e) => handleSelectChange('cropType', e.target.value)}
          className="w-full bg-ocean-950 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-aqua-500 transition-colors"
        >
          {cropOptions.map((crop) => (
            <option key={crop.value} value={crop.value} className="bg-ocean-900">
              {crop.label}
            </option>
          ))}
        </select>
      </div>

      {/* Irrigation Cycles */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-aqua-400" />
          Irrigation Frequency
        </label>
        <select
          value={values.irrigationFrequency}
          onChange={(e) => handleSelectChange('irrigationFrequency', e.target.value)}
          className="w-full bg-ocean-950 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-aqua-500 transition-colors"
        >
          {irrigationOptions.map((irr) => (
            <option key={irr.value} value={irr.value} className="bg-ocean-900">
              {irr.label}
            </option>
          ))}
        </select>
      </div>

      {/* Livestock Count */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-aqua-400" />
            Livestock Count
          </label>
          <span className="text-sm font-bold text-aqua-400">{values.livestockCount} Head</span>
        </div>
        <input
          type="range"
          min="0"
          max="500"
          value={values.livestockCount}
          onChange={(e) => handleSliderChange('livestockCount', parseInt(e.target.value))}
          className="accent-aqua-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>0 Head</span>
          <span>500 Head</span>
        </div>
      </div>
    </GlassCard>
  );
};

export default SimulatorControls;
