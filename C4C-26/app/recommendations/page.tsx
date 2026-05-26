"use client";

import React, { useState, useMemo } from 'react';
import { useUser } from '@/lib/userContext';
import AnimatedPage from '@/components/ui/AnimatedPage';
import GlassCard from '@/components/ui/GlassCard';
import GradientButton from '@/components/ui/GradientButton';
import RecommendationCard from '@/components/recommendations/RecommendationCard';
import { recommendationsTips } from '@/lib/mockData';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function RecommendationsPage() {
  const { profile } = useUser();

  const [activeTab, setActiveTab] = useState<
    'all' | 'household' | 'irrigation' | 'crops' | 'livestock'
  >('all');

  const tabs = [
    { id: 'all', label: 'All Recommendations' },
    { id: 'household', label: 'Household Usage' },
    { id: 'irrigation', label: 'Irrigation' },
    { id: 'crops', label: 'Crops' },
    { id: 'livestock', label: 'Livestock' },
  ] as const;

  const sortedAndFilteredTips = useMemo(() => {
    let tips = [...recommendationsTips];

    // Filter by tab
    if (activeTab !== 'all') {
      if (activeTab === 'household') {
        tips = tips.filter(
          (tip) =>
            tip.category === 'household' ||
            tip.category === 'general'
        );
      } else {
        tips = tips.filter((tip) => tip.category === activeTab);
      }
    }

    // Personalized scoring
    if (profile) {
      return tips.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        if (profile.cropType === 'water-intensive') {
          if (a.category === 'crops') scoreA += 10;
          if (b.category === 'crops') scoreB += 10;
        }

        if (
          profile.irrigationFrequency === 'flood' ||
          profile.irrigationFrequency === 'daily'
        ) {
          if (a.category === 'irrigation') scoreA += 10;
          if (b.category === 'irrigation') scoreB += 10;
        }

        if (profile.livestockCount > 50) {
          if (a.category === 'livestock') scoreA += 10;
          if (b.category === 'livestock') scoreB += 10;
        }

        if (profile.householdSize > 5) {
          if (a.category === 'household') scoreA += 10;
          if (b.category === 'household') scoreB += 10;
        }

        if (scoreA === scoreB) {
          return b.savingsGallons - a.savingsGallons;
        }

        return scoreB - scoreA;
      });
    }

    return tips.sort(
      (a, b) => b.savingsGallons - a.savingsGallons
    );
  }, [activeTab, profile]);

  return (
    <AnimatedPage className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50 text-slate-800">

      <div className="max-w-7xl mx-auto space-y-6 px-4 py-6">

        {/* Header */}
        <div className="border-b border-cyan-100 pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight uppercase">
            Conservation Strategies
          </h1>

          <p className="text-sm text-slate-600 mt-1">
            AI-powered recommendations to reduce groundwater depletion
            and improve long-term sustainability.
          </p>
        </div>

        {/* Missing Audit Banner */}
        {!profile && (
          <GlassCard className="p-5 border border-cyan-100 bg-white/80 shadow-xl rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">

            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-cyan-500 shrink-0" />

              <p className="text-sm text-slate-600">
                Complete your groundwater audit to unlock
                personalized sustainability recommendations.
              </p>
            </div>

            <GradientButton
              href="/onboarding"
              className="py-2 px-4 text-sm shrink-0"
            >
              Take Audit
            </GradientButton>

          </GlassCard>
        )}

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-3 border-b border-cyan-100">

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-white border-cyan-500 shadow-md'
                  : 'bg-white/70 border-cyan-100 text-slate-600 hover:bg-cyan-50 hover:border-cyan-300'
              }`}
            >
              {tab.label}
            </button>
          ))}

        </div>

        {/* Recommendation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {sortedAndFilteredTips.map((tip, idx) => (
            <RecommendationCard
              key={tip.id}
              tip={tip}
              delay={idx * 0.05}
            />
          ))}

        </div>

        {/* Bottom CTA */}
        <div className="pt-8 text-center max-w-2xl mx-auto">

          <GlassCard className="p-8 border border-cyan-100 bg-white/80 shadow-2xl rounded-3xl">

            <h3 className="text-xl font-bold text-slate-800 mb-3">
              Simulate Conservation Changes
            </h3>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Test how optimized irrigation, crop changes,
              and conservation methods improve your groundwater
              sustainability score and aquifer lifespan.
            </p>

            <div className="flex justify-center">
              <GradientButton
                href="/simulator"
                className="flex items-center justify-center gap-2 group"
              >
                Open Scenario Simulator

                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </GradientButton>
            </div>

          </GlassCard>

        </div>

      </div>
    </AnimatedPage>
  );
}