"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/nextjs';
import AnimatedPage from '@/components/ui/AnimatedPage';
import GlassCard from '@/components/ui/GlassCard';
import { indiaRegions, rainfallVsExtraction, groundwaterTrend, aiRecommendations } from '@/lib/mockDataV1';
import StatCard from '@/components/vertical-1/StatCard';
import RainfallExtractionChart from '@/components/vertical-1/RainfallExtractionChart';
import StressTrendChart from '@/components/vertical-1/StressTrendChart';
import AquiferHealthGauge from '@/components/vertical-1/AquiferHealthGauge';
import DistrictComparisonTable from '@/components/vertical-1/DistrictComparisonTable';
import AlertFeed from '@/components/vertical-1/AlertFeed';
import AIRecommendationCard from '@/components/vertical-1/AIRecommendationCard';
import { Droplet, AlertTriangle, ShieldCheck, Activity, LayoutGrid, Plus, Lock, Loader2 } from 'lucide-react';

export default function InsightsDashboardPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [showAllRecs, setShowAllRecs] = useState(false);

  // Compute National Average Health
  const nationalAverageHealth = useMemo(() => {
    const total = indiaRegions.reduce((sum, r) => sum + r.aquiferHealth, 0);
    return Math.round(total / indiaRegions.length);
  }, []);

  // Filter top 10 most critical districts based on stress level / sustainability score
  const topCriticalDistricts = useMemo(() => {
    return indiaRegions
      .filter(r => r.stressLevel === 'critical' || r.stressLevel === 'high')
      .sort((a, b) => a.sustainabilityScore - b.sustainabilityScore)
      .slice(0, 10);
  }, []);

  // Determine list of displayed recommendations
  const displayedRecs = useMemo(() => {
    if (showAllRecs) return aiRecommendations;
    return aiRecommendations.slice(0, 4);
  }, [showAllRecs]);

  // Auth/Loader Guards
  if (!isLoaded) {
    return (
      <AnimatedPage className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          <span className="text-sm text-slate-600 font-medium animate-pulse">
            Loading Hydro-Spatial Intelligence...
          </span>
        </div>
      </AnimatedPage>
    );
  }

  if (!isSignedIn) {
    return (
      <AnimatedPage className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full px-4">
          <GlassCard className="text-center p-8 border border-cyan-200/50 bg-white/80 shadow-2xl rounded-3xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center mx-auto text-cyan-600">
              <Lock className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              Sign In Required
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Authenticate your account to access our comprehensive national aquifer monitoring data, seasonal monsoon correlations, and predictive hydrological insights.
            </p>

            <SignInButton mode="modal">
              <button className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-full shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/35 transition-all cursor-pointer select-none">
                Sign In to View Hydro-Spatial Insights
              </button>
            </SignInButton>
          </GlassCard>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6">
      
      {/* Title Header */}
      <div className="border-b border-slate-200/55 pb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 bg-cyan-50 border border-cyan-200/60 px-3 py-1 rounded-full">
          Vertical 1 Module
        </span>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-2 flex items-center gap-2">
          AI Hydro-Spatial Insights
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">National aquifer monitoring dashboard, seasonal monsoon correlations, and environmental alerts</p>
      </div>

      {/* Section 1 - Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="National Stress Index"
          value="68%"
          subtext="Composite draw velocity factor"
          change={4}
          changeType="negative" // Index increased = negative sustainability
          icon={<AlertTriangle className="w-5 h-5 text-cyan-600" />}
          delay={0}
        />
        <StatCard
          title="Districts in Critical State"
          value="6 / 25"
          subtext="Extremely depleted aquifer indices"
          change={12}
          changeType="negative" // critical districts increased = negative
          icon={<Droplet className="w-5 h-5 text-cyan-600" />}
          delay={0.06}
        />
        <StatCard
          title="Average Aquifer Depth"
          value="38.2 meters"
          subtext="Water height beneath surface"
          change={-3.5}
          changeType="negative" // depth got deeper (-3.5% height) = negative
          icon={<Activity className="w-5 h-5 text-cyan-600" />}
          delay={0.12}
        />
        <StatCard
          title="Percolation Efficiency"
          value="44.5%"
          subtext="Monsoon absorption rate"
          change={1.5}
          changeType="positive" // percolation efficiency increased = positive
          icon={<ShieldCheck className="w-5 h-5 text-cyan-600" />}
          delay={0.18}
        />
      </div>

      {/* Section 2 - Charts Row (two columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RainfallExtractionChart data={rainfallVsExtraction} />
        <StressTrendChart data={groundwaterTrend} />
      </div>

      {/* Section 3 - Aquifer Health & District Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left (~40% visual width): Aquifer needle gauge */}
        <div className="lg:col-span-1">
          <AquiferHealthGauge value={nationalAverageHealth} />
        </div>

        {/* Right (~60% visual width): District comparative stats table */}
        <div className="lg:col-span-2">
          <DistrictComparisonTable regions={topCriticalDistricts} />
        </div>
      </div>

      {/* Section 4 - Alerts & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left: Alerts scroll feed */}
        <AlertFeed />

        {/* Right: AI recommendations cards list */}
        <div className="bg-white/60 backdrop-blur-2xl border border-white/50 rounded-2xl p-6 shadow-xl flex flex-col h-full justify-between">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
              <LayoutGrid className="w-5 h-5 text-cyan-500" />
              AI Groundwater Conservation Tactics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">High-impact watershed suggestions optimized by sustainability rankings</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <AnimatePresence mode="popLayout">
              {displayedRecs.map((rec) => (
                <motion.div
                  key={rec.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <AIRecommendationCard recommendation={rec} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Toggle all cards Button */}
          <div className="flex justify-center mt-6">
            <motion.button
              onClick={() => setShowAllRecs(prev => !prev)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:bg-slate-50 transition-all cursor-pointer select-none"
            >
              <Plus className={`w-3.5 h-3.5 transition-transform ${showAllRecs ? 'rotate-45' : 'rotate-0'}`} />
              {showAllRecs ? 'Collapse Recommendations' : 'View All Recommendations'}
            </motion.button>
          </div>
        </div>

      </div>

    </AnimatedPage>
  );
}
