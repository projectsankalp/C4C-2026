"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/userContext';
import AnimatedPage from '@/components/ui/AnimatedPage';
import GlassCard from '@/components/ui/GlassCard';
import GradientButton from '@/components/ui/GradientButton';
import ScoreRing from '@/components/ui/ScoreRing';
import SimulatorControls from '@/components/simulator/SimulatorControls';
import SimulatorComparisonChart from '@/components/charts/SimulatorComparisonChart';
import { calculateSustainability, UserProfile } from '@/lib/scoreEngine';

import {
  AlertCircle,
  ArrowRight,
  Loader2,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

export default function SimulatorPage() {
  const { profile, result, isLoading } = useUser();

  const [simulatedProfile, setSimulatedProfile] =
    useState<UserProfile | null>(null);

  useEffect(() => {
    if (profile) {
      setSimulatedProfile({ ...profile });
    }
  }, [profile]);

  if (isLoading) {
    return (
      <AnimatedPage className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />

          <span className="text-sm text-slate-600 font-medium">
            Initializing Groundwater Simulation Engine...
          </span>
        </div>
      </AnimatedPage>
    );
  }

  if (!profile || !result || !simulatedProfile) {
    return (
      <AnimatedPage className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50">
        <div className="max-w-md w-full px-4">
          <GlassCard className="text-center p-8 border border-cyan-100 bg-white/80 shadow-2xl rounded-3xl">

            <AlertCircle className="w-12 h-12 text-cyan-500 mx-auto mb-4" />

            <h2 className="text-2xl font-bold text-slate-800 mb-2 uppercase tracking-tight">
              Simulator Locked
            </h2>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Complete your groundwater audit before running
              sustainability simulations.
            </p>

            <GradientButton
              href="/onboarding"
              className="w-full flex items-center justify-center gap-2 group"
            >
              Start Audit

              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </GradientButton>

          </GlassCard>
        </div>
      </AnimatedPage>
    );
  }

  const simulatedResult = calculateSustainability(simulatedProfile);

  const handleReset = () => {
    setSimulatedProfile({ ...profile });
  };

  const handleValuesChange = (updated: UserProfile) => {
    setSimulatedProfile(updated);
  };

  const scoreDelta = simulatedResult.score - result.score;
  const lifespanDelta =
    simulatedResult.lifespanYears - result.lifespanYears;

  const extractionDelta =
    simulatedResult.dailyUsageGallons -
    result.dailyUsageGallons;

  const hasChanges =
    JSON.stringify(profile) !==
    JSON.stringify(simulatedProfile);

  return (
    <AnimatedPage className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50 text-slate-800">

      <div className="max-w-7xl mx-auto space-y-6 px-4 py-6">

        {/* Header */}
        <div className="border-b border-cyan-100 pb-5">

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight uppercase">
            Groundwater Simulator
          </h1>

          <p className="text-sm text-slate-600 mt-1">
            Simulate groundwater usage changes and forecast
            sustainability impact in real time.
          </p>

        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Controls */}
          <div className="lg:col-span-5">
            <SimulatorControls
              values={simulatedProfile}
              onChange={handleValuesChange}
              onReset={handleReset}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-7 space-y-6">

            {/* Score Comparison */}
            <GlassCard className="flex flex-col sm:flex-row items-center justify-around gap-6 p-6 bg-white/80 border border-cyan-100 shadow-2xl rounded-3xl">

              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                  Current Usage
                </span>

                <ScoreRing
                  score={result.score}
                  size={130}
                />
              </div>

              <div className="hidden sm:block border-l border-cyan-100 h-24" />

              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-cyan-600 uppercase tracking-widest font-bold">
                  Simulated Scenario
                </span>

                <ScoreRing
                  score={simulatedResult.score}
                  size={130}
                />
              </div>

            </GlassCard>

            {/* AI Insight */}
            <AnimatePresence mode="wait">

              {hasChanges && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.3 }}
                >

                  <GlassCard
                    className={`p-5 border-l-4 rounded-3xl shadow-xl ${
                      scoreDelta >= 0
                        ? 'border-l-emerald-500 bg-emerald-50 border border-emerald-100'
                        : 'border-l-red-500 bg-red-50 border border-red-100'
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      <div
                        className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          scoreDelta >= 0
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {scoreDelta >= 0 ? (
                          <ArrowUp className="w-5 h-5" />
                        ) : (
                          <ArrowDown className="w-5 h-5" />
                        )}
                      </div>

                      <div className="space-y-2">

                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-cyan-500" />

                          <h4 className="text-sm font-bold text-slate-800">
                            {scoreDelta > 0
                              ? `Sustainability Improved by +${scoreDelta}`
                              : scoreDelta < 0
                              ? `Groundwater Stress Increased`
                              : `Resource usage remains stable`}
                          </h4>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed">

                          {scoreDelta > 0
                            ? `Your changes could extend groundwater availability by ${lifespanDelta} years and reduce extraction by ${Math.abs(
                                extractionDelta
                              ).toLocaleString()} gallons/day.`
                            : scoreDelta < 0
                            ? `This scenario may shorten groundwater lifespan by ${Math.abs(
                                lifespanDelta
                              )} years and increase extraction demand by ${extractionDelta.toLocaleString()} gallons/day.`
                            : `Try adjusting irrigation frequency or crop selection to improve sustainability outcomes.`}

                        </p>

                      </div>

                    </div>

                  </GlassCard>

                </motion.div>
              )}

            </AnimatePresence>

            {/* Metrics Table */}
            <GlassCard className="overflow-hidden border border-cyan-100 bg-white/80 shadow-2xl rounded-3xl">

              <table className="w-full text-left border-collapse text-sm">

                <thead>
                  <tr className="border-b border-cyan-100 bg-cyan-50 font-semibold text-slate-600 uppercase tracking-wider text-xs">

                    <th className="p-4">Metrics</th>
                    <th className="p-4">Current</th>
                    <th className="p-4 text-cyan-600">
                      Simulated
                    </th>
                    <th className="p-4">Impact</th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-cyan-50">

                  <tr>
                    <td className="p-4 font-semibold text-slate-800">
                      Sustainability Score
                    </td>

                    <td className="p-4 text-slate-600">
                      {result.score}/100
                    </td>

                    <td className="p-4 text-cyan-600 font-bold">
                      {simulatedResult.score}/100
                    </td>

                    <td
                      className={`p-4 font-bold ${
                        scoreDelta >= 0
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {scoreDelta > 0
                        ? `+${scoreDelta}`
                        : scoreDelta}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-800">
                      Daily Usage
                    </td>

                    <td className="p-4 text-slate-600">
                      {result.dailyUsageGallons.toLocaleString()} gal
                    </td>

                    <td className="p-4 text-cyan-600 font-bold">
                      {simulatedResult.dailyUsageGallons.toLocaleString()} gal
                    </td>

                    <td
                      className={`p-4 font-bold ${
                        extractionDelta <= 0
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {extractionDelta > 0
                        ? `+${extractionDelta.toLocaleString()}`
                        : extractionDelta.toLocaleString()}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-800">
                      Groundwater Lifespan
                    </td>

                    <td className="p-4 text-slate-600">
                      ~{result.lifespanYears} yrs
                    </td>

                    <td className="p-4 text-cyan-600 font-bold">
                      ~{simulatedResult.lifespanYears} yrs
                    </td>

                    <td
                      className={`p-4 font-bold ${
                        lifespanDelta >= 0
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {lifespanDelta > 0
                        ? `+${lifespanDelta} yrs`
                        : `${lifespanDelta} yrs`}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-4 font-semibold text-slate-800">
                      Risk Level
                    </td>

                    <td className="p-4 text-slate-600">
                      {result.riskLevel}
                    </td>

                    <td className="p-4 text-cyan-600 font-bold">
                      {simulatedResult.riskLevel}
                    </td>

                    <td className="p-4 text-slate-600 font-medium">
                      {result.riskLevel ===
                      simulatedResult.riskLevel
                        ? 'Stable'
                        : 'Changed'}
                    </td>
                  </tr>

                </tbody>

              </table>

            </GlassCard>

            {/* Charts */}
            <SimulatorComparisonChart
              currentProfile={profile}
              simulatedProfile={simulatedProfile}
            />

          </div>

        </div>
      </div>
    </AnimatedPage>
  );
}