"use client";

import React from 'react';
import { useUser } from '@/lib/userContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { cropOptions, irrigationOptions } from '@/lib/mockData';
import { Users, Trees, Sprout, Droplets, PawPrint, Calendar } from 'lucide-react';

export const ProfileSummary: React.FC = () => {
  const { profile } = useUser();

  if (!profile) return null;

  const cropLabel = cropOptions.find(c => c.value === profile.cropType)?.label || profile.cropType;
  const irrigationLabel = irrigationOptions.find(i => i.value === profile.irrigationFrequency)?.label || profile.irrigationFrequency;

  // Simple current timestamp format
  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <GlassCard className="flex flex-col h-full justify-between">
      <div>
        {/* Initials Avatar */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-5 mb-5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-aqua-500 to-emerald-500 flex items-center justify-center font-bold text-white shadow-md shadow-aqua-500/20 text-lg">
            GW
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">Your Water Profile</h3>
            <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Synced: {timestamp}
            </span>
          </div>
        </div>

        {/* Inputs List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-aqua-400" />
              Household Size
            </span>
            <span className="font-semibold text-white">{profile.householdSize} People</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-2">
              <Trees className="w-4.5 h-4.5 text-aqua-400" />
              Acreage
            </span>
            <span className="font-semibold text-white">{profile.landAcres} Acres</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-2">
              <Sprout className="w-4.5 h-4.5 text-aqua-400" />
              Crop Type
            </span>
            <span className="font-semibold text-white text-right line-clamp-1">{cropLabel}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-2">
              <Droplets className="w-4.5 h-4.5 text-aqua-400" />
              Irrigation Cycle
            </span>
            <span className="font-semibold text-white text-right line-clamp-1">{irrigationLabel}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-2">
              <PawPrint className="w-4.5 h-4.5 text-aqua-400" />
              Livestock Count
            </span>
            <span className="font-semibold text-white">{profile.livestockCount} Animals</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <GradientButton href="/onboarding" variant="secondary" className="w-full text-sm">
          Edit Profile
        </GradientButton>
      </div>
    </GlassCard>
  );
};

export default ProfileSummary;
