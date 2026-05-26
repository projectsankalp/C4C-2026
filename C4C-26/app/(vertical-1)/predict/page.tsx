"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { predictionTrajectory } from '@/lib/mockDataV1';
import PredictionChart from '@/components/vertical-1/PredictionChart';
import { Cpu, RefreshCcw, Landmark, Users, Droplets, Hammer, Sparkles } from 'lucide-react';

interface SimulatorParams {
  populationGrowthRate: number;     // 0-5%
  irrigationEfficiency: number;     // 0-100%
  rainwaterHarvesting: number;      // 0-100%
  industrialReduction: number;      // 0-100%
}

const DEFAULT_PARAMS: SimulatorParams = {
  populationGrowthRate: 1.5,
  irrigationEfficiency: 35,
  rainwaterHarvesting: 20,
  industrialReduction: 10
};

export default function PredictSimulatorPage() {
  const [params, setParams] = useState<SimulatorParams>(DEFAULT_PARAMS);

  // Check if any parameters have moved from their default baseline settings
  const isModified = useMemo(() => {
    return (
      params.populationGrowthRate !== DEFAULT_PARAMS.populationGrowthRate ||
      params.irrigationEfficiency !== DEFAULT_PARAMS.irrigationEfficiency ||
      params.rainwaterHarvesting !== DEFAULT_PARAMS.rainwaterHarvesting ||
      params.industrialReduction !== DEFAULT_PARAMS.industrialReduction
    );
  }, [params]);

  // Real-time calculation formula for groundwater lifespan changes (years)
  // Higher irrigation efficiency, rainwater harvesting, industrial recycling raise years.
  // Higher population growth lowers it.
  const calculations = useMemo(() => {
    const baselineLife = 10; // years until 2034 depletion threshold is hit
    
    // Weighted scoring offsets
    const popWeight = (params.populationGrowthRate - 1.5) * -2.5; // -8.75 years at 5%
    const irrWeight = (params.irrigationEfficiency - 35) * 0.18;  // +11.7 years at 100%
    const rwhWeight = (params.rainwaterHarvesting - 20) * 0.12;   // +9.6 years at 100%
    const indWeight = (params.industrialReduction - 10) * 0.08;   // +7.2 years at 100%

    const deltaYears = Math.round(popWeight + irrWeight + rwhWeight + indWeight);
    const simulatedLifespan = Math.max(2, Math.min(45, baselineLife + deltaYears));
    const projectedDepletionYear = 2034 + deltaYears;
    
    // Estimate volume of water saved (in Billion Litres per year nationally)

    const waterSavedBillionL = Math.max(0, Math.round(
      (params.irrigationEfficiency - 35) * 4.5 +
      (params.rainwaterHarvesting - 20) * 1.8 +
      (params.industrialReduction - 10) * 2.5
    ));

    return {
      deltaYears,
      simulatedLifespan,
      projectedDepletionYear,
      waterSavedBillionL
    };
  }, [params]);

  // Adjust predictionTrajectory coordinates dynamically based on slider multipliers
  const simulatedTrajectory = useMemo(() => {
    return predictionTrajectory.map((point) => {
      if (point.year === 2024) return { ...point };

      // Year-over-year compounding delta
      const yearsElapsed = point.year - 2024;
      
      // Compute offsets
      const popOffset = (params.populationGrowthRate - 1.5) * 0.15; // compound depletion
      const irrOffset = (params.irrigationEfficiency - 35) * -0.12; // compound savings
      const rwhOffset = (params.rainwaterHarvesting - 20) * -0.08;  // compound savings
      const indOffset = (params.industrialReduction - 10) * -0.06;  // compound savings

      const compoundingOffset = (popOffset + irrOffset + rwhOffset + indOffset) * yearsElapsed;
      const optimizedTrajectory = Math.max(38.5, Math.min(85, point.currentTrajectory + compoundingOffset));

      return {
        ...point,
        optimizedTrajectory: parseFloat(optimizedTrajectory.toFixed(1))
      };
    });
  }, [params]);

  const handleReset = () => {
    setParams(DEFAULT_PARAMS);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
      
      {/* Title Header */}
      <div className="border-b border-slate-200/55 pb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 bg-cyan-50 border border-cyan-200/60 px-3 py-1 rounded-full">
          Vertical 1 Module
        </span>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-2 flex items-center gap-2">
          Future Prediction Simulator
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">Model future water depletion curves and simulate high-impact watershed optimization guidelines</p>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* Left Side: Controls Panel (40% width equivalent -> 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/60 backdrop-blur-2xl border border-white/50 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Scenario Parameters
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Adjust national adoption parameters</p>
              </div>
              <button
                onClick={handleReset}
                className="p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-slate-700 text-slate-400 transition-colors cursor-pointer"
                aria-label="Reset parameters to baseline settings"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Slider 1: Population Growth */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-600" />
                  Population Growth Rate
                </span>
                <span className="text-cyan-600">{params.populationGrowthRate}% / yr</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.1}
                value={params.populationGrowthRate}
                onChange={(e) => setParams(prev => ({ ...prev, populationGrowthRate: Number(e.target.value) }))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                <span>Baseline reference: 1.5%</span>
                <span>Max projection: 5.0%</span>
              </div>
            </div>

            {/* Slider 2: Irrigation Efficiency */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-600" />
                  Agricultural Drip Irrigation
                </span>
                <span className="text-cyan-600">{params.irrigationEfficiency}% adoption</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={params.irrigationEfficiency}
                onChange={(e) => setParams(prev => ({ ...prev, irrigationEfficiency: Number(e.target.value) }))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                <span>Baseline reference: 35%</span>
                <span>Full scale drip: 100%</span>
              </div>
            </div>

            {/* Slider 3: Rainwater Harvesting */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-cyan-600" />
                  Rooftop Harvesting Adoption
                </span>
                <span className="text-cyan-600">{params.rainwaterHarvesting}% adoption</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={params.rainwaterHarvesting}
                onChange={(e) => setParams(prev => ({ ...prev, rainwaterHarvesting: Number(e.target.value) }))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                <span>Baseline reference: 20%</span>
                <span>Full urban harvest: 100%</span>
              </div>
            </div>

            {/* Slider 4: Industrial reduction */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Hammer className="w-4 h-4 text-cyan-600" />
                  Industrial Water Recycle
                </span>
                <span className="text-cyan-600">{params.industrialReduction}% recycling</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={params.industrialReduction}
                onChange={(e) => setParams(prev => ({ ...prev, industrialReduction: Number(e.target.value) }))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                <span>Baseline reference: 10%</span>
                <span>100% closed ZLD recycle</span>
              </div>
            </div>
          </div>

          {/* Delta Callout Card showing lifespan extension changes */}
          <AnimatePresence>
            {isModified && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 border border-cyan-400/20 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-white/10 shrink-0 text-white mt-0.5">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-50 mb-1">
                      Simulated Future Impact
                    </h4>
                    <p className="text-xs text-white leading-relaxed">
                      {calculations.deltaYears > 0 ? (
                        <>This scenario extends groundwater lifespan by <span className="font-extrabold text-white underline">+{calculations.deltaYears} years</span>, delaying depletion limit thresholds until <span className="font-bold">{calculations.projectedDepletionYear}</span>!</>
                      ) : calculations.deltaYears < 0 ? (
                        <>Uncontrolled drawing rates accelerate water depletion timelines by <span className="font-extrabold text-white underline">{calculations.deltaYears} years</span>. Critical thresholds breached in <span className="font-bold">{calculations.projectedDepletionYear}</span>.</>
                      ) : (
                        <>Parameters maintain the baseline projection, breaching threshold limits in <span className="font-bold">2034</span>.</>
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Visual Projection Charts (60% width equivalent -> 3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Line Projection Chart */}
          <PredictionChart data={simulatedTrajectory} />

          {/* Three Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Projected Depletion Year */}
            <div className="bg-white/60 backdrop-blur-2xl border border-white/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Depletion Year
              </span>
              <div className="mt-2.5">
                <span className="text-3xl font-black text-slate-800">
                  {calculations.projectedDepletionYear}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 mt-2">
                Breach danger line limit
              </span>
            </div>

            {/* Lifespan Extension */}
            <div className="bg-white/60 backdrop-blur-2xl border border-white/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Lifespan Extension
              </span>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className={`text-3xl font-black ${
                  calculations.deltaYears > 0 ? 'text-emerald-600' :
                  calculations.deltaYears < 0 ? 'text-rose-600' : 'text-slate-800'
                }`}>
                  {calculations.deltaYears > 0 ? `+${calculations.deltaYears}` : calculations.deltaYears}
                </span>
                <span className="text-xs font-bold text-slate-400">Years</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 mt-2">
                Timeline shifts vs current
              </span>
            </div>

            {/* Annual Water Saved */}
            <div className="bg-white/60 backdrop-blur-2xl border border-white/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Annual Water Saved
              </span>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="text-3xl font-black text-cyan-600">
                  {calculations.waterSavedBillionL}
                </span>
                <span className="text-xs font-bold text-cyan-500">Billion L</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 mt-2">
                Estimated national savings
              </span>
            </div>

          </div>

          {/* Bottom comparison rows */}
          <div className="bg-white/60 backdrop-blur-2xl border border-white/50 rounded-2xl p-6 shadow-xl overflow-hidden">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Water Future Scenario Matrix
            </h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold uppercase tracking-wider text-[10px] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Future Scenario</th>
                    <th className="px-4 py-3 text-center">Depletion Year</th>
                    <th className="px-4 py-3 text-center">Depth in 2038</th>
                    <th className="px-4 py-3 text-right">Annual Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {/* Current */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-slate-700">Baseline (No Change)</td>
                    <td className="px-4 py-3.5 text-center text-slate-800 font-bold">2034</td>
                    <td className="px-4 py-3.5 text-center text-slate-800 font-bold">79.5m</td>
                    <td className="px-4 py-3.5 text-right text-slate-500">0 Litres</td>
                  </tr>
                  
                  {/* Simulated Scenario */}
                  <tr className="bg-cyan-50/30 hover:bg-cyan-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-cyan-700 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 animate-pulse" />
                      Your Simulated Parameters
                    </td>
                    <td className={`px-4 py-3.5 text-center font-bold ${
                      calculations.deltaYears > 0 ? 'text-emerald-600' :
                      calculations.deltaYears < 0 ? 'text-rose-600' : 'text-slate-800'
                    }`}>{calculations.projectedDepletionYear}</td>
                    <td className="px-4 py-3.5 text-center text-slate-800 font-bold">
                      {simulatedTrajectory[simulatedTrajectory.length - 1].optimizedTrajectory}m
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-cyan-600">
                      {calculations.waterSavedBillionL} Billion L
                    </td>
                  </tr>

                  {/* Best Case */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-slate-700">Best Practice (100% Efficiency)</td>
                    <td className="px-4 py-3.5 text-center text-emerald-600 font-extrabold">2063</td>
                    <td className="px-4 py-3.5 text-center text-slate-800 font-bold">42.5m</td>
                    <td className="px-4 py-3.5 text-right text-emerald-600 font-bold">650 Billion L</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
