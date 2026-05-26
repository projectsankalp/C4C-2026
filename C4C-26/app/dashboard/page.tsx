"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useUser as useClerkUser, SignInButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import AnimatedPage from '@/components/ui/AnimatedPage';
import GlassCard from '@/components/ui/GlassCard';
import GradientButton from '@/components/ui/GradientButton';
import ScoreRing from '@/components/ui/ScoreRing';
import UsageAreaChart from '@/components/charts/UsageAreaChart';
import LifespanBarChart from '@/components/charts/LifespanBarChart';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import { fetchGroqInsight } from '@/lib/groqClient';
import { SustainabilityResult, calculateSustainability } from '@/lib/scoreEngine';
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
  Sparkles,
  MapPin,
  Users,
  Trees,
  Sprout,
  Droplets,
  PawPrint,
  Calendar,
  Lock,
  Info
} from 'lucide-react';

interface ExtendedUserProfile {
  location: string;
  householdSize: number;
  landAcres: number;
  cropType: 'none' | 'drought-resistant' | 'moderate' | 'water-intensive';
  cropName: string;
  irrigationFrequency: 'none' | 'weekly' | 'bi-weekly' | 'daily' | 'flood';
  livestockCount: number;
  dailyWaterUsage: number;
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useClerkUser();
  const [profileData, setProfileData] = useState<ExtendedUserProfile | null>(null);
  const [resultData, setResultData] = useState<SustainabilityResult | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // AI Insight States
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  // Load profile from localStorage keyed by user.id
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !user) {
      setIsLoadingProfile(false);
      return;
    }

    const key = `jalrakshak_profile_${user.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfileData(parsed);
        setResultData(calculateSustainability(parsed));
      } catch (err) {
        console.error("Failed to parse user profile:", err);
      }
    }
    setIsLoadingProfile(false);
  }, [isLoaded, isSignedIn, user]);

  // Fetch Groq AI Insight function
  const getAIInsight = useCallback(async (profile: ExtendedUserProfile) => {
    if (insightLoading) return;
    setInsightLoading(true);
    setInsightError(null);

    try {
      const score = calculateSustainability(profile).score;
      const response = await fetchGroqInsight({
        location: profile.location,
        cropType: profile.cropName,
        landSize: profile.landAcres,
        irrigationFrequency: profile.irrigationFrequency,
        householdSize: profile.householdSize,
        sustainabilityScore: score
      });
      setAiInsight(response.insight);
    } catch (err: unknown) {
      console.error("Failed to fetch Groq AI Insight:", err);
      setInsightError("Personalized AI unavailable");
      setAiInsight(null);
    } finally {
      setInsightLoading(false);
    }
  }, [insightLoading]);

  // Trigger Groq AI call once profile is loaded
  useEffect(() => {
    if (profileData) {
      getAIInsight(profileData);
    }
  }, [profileData, getAIInsight]);

  // Auth/Loader Guards
  if (!isLoaded || isLoadingProfile) {
    return (
      <AnimatedPage className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          <span className="text-sm text-slate-600 font-medium">
            Retrieving Groundwater Sustainability Indicators...
          </span>
        </div>
      </AnimatedPage>
    );
  }

  // Not signed in card prompt
  if (!isSignedIn) {
    return (
      <AnimatedPage className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50">
        <div className="max-w-md w-full px-4">
          <GlassCard className="text-center p-8 border border-cyan-200/50 bg-white/80 shadow-2xl rounded-3xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center mx-auto text-cyan-600">
              <Lock className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              Sign In Required
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              Authenticate your account to view your personalized sustainability metrics, track reserves, and connect with AI advisors.
            </p>

            <SignInButton mode="modal">
              <button className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-full shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/35 transition-all cursor-pointer select-none">
                Sign In to View Dashboard
              </button>
            </SignInButton>
          </GlassCard>
        </div>
      </AnimatedPage>
    );
  }

  // Signed in but no audit completed
  if (!profileData || !resultData) {
    return (
      <AnimatedPage className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50">
        <div className="max-w-md w-full px-4">
          <GlassCard className="text-center p-8 border border-cyan-200/50 bg-white/80 shadow-2xl rounded-3xl">
            <AlertCircle className="w-12 h-12 text-cyan-500 mx-auto mb-4" />

            <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">
              No Profile Detected
            </h2>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Complete a quick groundwater usage audit to unlock personalized sustainability insights.
            </p>

            <GradientButton
              href="/onboarding"
              className="w-full flex items-center justify-center gap-2 group cursor-pointer"
            >
              Start Audit
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </GradientButton>
          </GlassCard>
        </div>
      </AnimatedPage>
    );
  }

  // Get initials for profile summary avatar
  const initials = user?.firstName
    ? `${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ''}`
    : 'GW';

  return (
    <AnimatedPage className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6 px-4 py-6">

        {/* Header */}
        <div className="border-b border-cyan-100 pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight uppercase">
            Sustainability Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            AI-powered groundwater monitoring and sustainability forecasting dashboard.
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

          {/* Left Column: Custom User Profile Summary */}
          <div className="lg:col-span-1">
            <GlassCard className="flex flex-col h-full justify-between bg-white/80 border border-cyan-100 shadow-2xl rounded-3xl p-6 text-left">
              <div>
                {/* Initials Avatar */}
                <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-500 flex items-center justify-center font-black text-white shadow-md shadow-cyan-500/20 text-lg">
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800 leading-tight">
                      {user?.firstName || 'Farmer'}
                    </h3>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-semibold uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Synced Profile
                    </span>
                  </div>
                </div>

                {/* Profile Details List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400 flex items-center gap-2">
                      <MapPin className="w-4.5 h-4.5 text-cyan-500" />
                      Location
                    </span>
                    <span className="font-bold text-slate-700 max-w-[120px] text-right line-clamp-1">{profileData.location}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Users className="w-4.5 h-4.5 text-cyan-500" />
                      Household
                    </span>
                    <span className="font-bold text-slate-700">{profileData.householdSize} People</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Trees className="w-4.5 h-4.5 text-cyan-500" />
                      Acreage
                    </span>
                    <span className="font-bold text-slate-700">{profileData.landAcres} Acres</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Sprout className="w-4.5 h-4.5 text-cyan-500" />
                      Crop Type
                    </span>
                    <span className="font-bold text-slate-700 text-right line-clamp-1">{profileData.cropName}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Droplets className="w-4.5 h-4.5 text-cyan-500" />
                      Irrigation
                    </span>
                    <span className="font-bold text-slate-700 text-right line-clamp-1 capitalize">{profileData.irrigationFrequency}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400 flex items-center gap-2">
                      <PawPrint className="w-4.5 h-4.5 text-cyan-500" />
                      Livestock
                    </span>
                    <span className="font-bold text-slate-700">{profileData.livestockCount} Animals</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <GradientButton href="/onboarding" variant="secondary" className="w-full text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-50 border-slate-200">
                  Edit Audit Profile
                </GradientButton>
              </div>
            </GlassCard>
          </div>

          {/* Center Column: Score & Charts */}
          <div className="lg:col-span-2 space-y-6">

            {/* Score Ring Card */}
            <GlassCard className="flex flex-col sm:flex-row items-center justify-around gap-6 py-8 px-6 bg-white/80 border border-cyan-100 shadow-2xl rounded-3xl text-left">
              <ScoreRing score={resultData.score} size={180} textColorClass="text-slate-800" />

              <div className="text-center sm:text-left space-y-2 max-w-xs">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-bold block">
                  Groundwater Security Lifespan
                </span>

                <h3 className="text-3xl md:text-4xl font-extrabold text-emerald-600">
                  ~{resultData.lifespanYears} Years
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Based on your current groundwater extraction rate of{" "}
                  {resultData.dailyUsageGallons.toLocaleString()} gal/day,
                  local reserves may sustain usage for approximately{" "}
                  {resultData.lifespanYears} years before depletion.
                </p>
              </div>
            </GlassCard>

            {/* Recharts Usage charts */}
            <UsageAreaChart />
            <LifespanBarChart />

          </div>

          {/* Right Column: Alerts & Dynamic Groq AI Insight Card */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Alerts Panel */}
            <AlertsPanel />

            {/* Dynamic AI Groq Insight Card */}
            <GlassCard className="bg-white/80 border border-cyan-100 shadow-2xl rounded-3xl p-6 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-800">Dynamic AI Insights</h3>
                </div>
                
                <button
                  onClick={() => getAIInsight(profileData)}
                  disabled={insightLoading}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-150 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                  aria-label="Refresh AI insights"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${insightLoading ? 'animate-spin text-cyan-500' : ''}`} />
                </button>
              </div>

              {/* Shimmer loading / error / result renderer */}
              <div className="relative min-h-[90px] flex flex-col justify-center">
                {insightLoading ? (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="space-y-2 text-center py-4"
                  >
                    <Loader2 className="w-5 h-5 text-cyan-500 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Analyzing farm profile...</p>
                  </motion.div>
                ) : insightError ? (
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-600">
                      <Info className="w-3.5 h-3.5" />
                      {insightError}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal font-medium">
                      Drip irrigation systems are the most effective way to sustain aquifers in high-stress zones. Consider implementing sensor-based watering loops to minimize evaporation.
                    </p>
                  </div>
                ) : aiInsight ? (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs text-slate-600 leading-relaxed font-medium bg-cyan-50/20 border border-cyan-100/30 p-3 rounded-xl"
                  >
                    {aiInsight}
                  </motion.p>
                ) : (
                  <p className="text-xs text-slate-400 text-center italic py-4">No AI insight generated.</p>
                )}
              </div>
            </GlassCard>

          </div>

        </div>
      </div>
    </AnimatedPage>
  );
}