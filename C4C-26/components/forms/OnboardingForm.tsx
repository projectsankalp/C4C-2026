"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/lib/userContext';
import { UserProfile, calculateSustainability } from '@/lib/scoreEngine';
import { cropOptions, irrigationOptions } from '@/lib/mockData';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { Users, Trees, Sprout, Droplets, PawPrint } from 'lucide-react';

export const OnboardingForm: React.FC = () => {
  const router = useRouter();
  const { updateProfile, profile } = useUser();

  // Initialize with either existing profile or realistic defaults
  const [formData, setFormData] = useState<UserProfile>({
    householdSize: profile?.householdSize ?? 4,
    landAcres: profile?.landAcres ?? 50,
    cropType: profile?.cropType ?? 'moderate',
    irrigationFrequency: profile?.irrigationFrequency ?? 'bi-weekly',
    livestockCount: profile?.livestockCount ?? 10,
  });

  // Calculate preliminary results on the fly
  const liveResult = calculateSustainability(formData);

  const handleSliderChange = (name: keyof UserProfile, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof UserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    router.push('/dashboard');
  };

  const formSections = [
    {
      id: 'household',
      title: 'Domestic Footprint',
      icon: <Users className="w-5 h-5 text-aqua-400" />,
      description: 'Define your domestic occupancy. This estimates basic household draw.',
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-300">Household Size</label>
            <span className="text-lg font-bold text-aqua-400">{formData.householdSize} People</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={formData.householdSize}
            onChange={(e) => handleSliderChange('householdSize', parseInt(e.target.value))}
            className="accent-aqua-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>1 Person</span>
            <span>10 People</span>
            <span>20 People</span>
          </div>
        </div>
      ),
    },
    {
      id: 'land',
      title: 'Property & Land size',
      icon: <Trees className="w-5 h-5 text-aqua-400" />,
      description: 'Specify your property acreage. Larger properties provide natural rainwater recharge potential.',
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-300">Land Acres</label>
            <span className="text-lg font-bold text-aqua-400">{formData.landAcres} Acres</span>
          </div>
          <input
            type="range"
            min="1"
            max="500"
            value={formData.landAcres}
            onChange={(e) => handleSliderChange('landAcres', parseInt(e.target.value))}
            className="accent-aqua-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>1 Acre</span>
            <span>250 Acres</span>
            <span>500 Acres</span>
          </div>
        </div>
      ),
    },
    {
      id: 'crops',
      title: 'Agricultural Choices',
      icon: <Sprout className="w-5 h-5 text-aqua-400" />,
      description: 'Select the primary crop family cultivated on your land.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cropOptions.map((crop) => (
            <div
              key={crop.value}
              onClick={() => handleSelectChange('cropType', crop.value)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between h-28 ${
                formData.cropType === crop.value
                  ? 'border-aqua-500 bg-aqua-500/10 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <span className="text-sm font-semibold text-white block">{crop.label}</span>
                <span className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">{crop.description}</span>
              </div>
              <span className={`text-[10px] font-bold mt-2 uppercase self-start px-2 py-0.5 rounded ${
                crop.value === 'water-intensive' ? 'bg-red-500/10 text-red-400' :
                crop.value === 'moderate' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {crop.waterFactor}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'irrigation',
      title: 'Irrigation Methods',
      icon: <Droplets className="w-5 h-5 text-aqua-400" />,
      description: 'How frequently do you irrigate? Over-irrigation creates major table drops.',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {irrigationOptions.map((irr) => (
            <div
              key={irr.value}
              onClick={() => handleSelectChange('irrigationFrequency', irr.value)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between h-28 ${
                formData.irrigationFrequency === irr.value
                  ? 'border-aqua-500 bg-aqua-500/10 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <span className="text-sm font-semibold text-white block">{irr.label}</span>
                <span className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">{irr.description}</span>
              </div>
              <span className={`text-[10px] font-bold mt-2 uppercase self-start px-2 py-0.5 rounded ${
                irr.value === 'flood' ? 'bg-red-500/10 text-red-400' :
                irr.value === 'daily' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {irr.value === 'none' ? '0 gal' : `Est: ${irr.gallonsPerAcrePerDay} gal/ac/day`}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'livestock',
      title: 'Livestock Occupancy',
      icon: <PawPrint className="w-5 h-5 text-aqua-400" />,
      description: 'State your total animal head count. Livestock represents a steady drinking load.',
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-300">Livestock Animals</label>
            <span className="text-lg font-bold text-aqua-400">{formData.livestockCount} Head</span>
          </div>
          <input
            type="range"
            min="0"
            max="500"
            value={formData.livestockCount}
            onChange={(e) => handleSliderChange('livestockCount', parseInt(e.target.value))}
            className="accent-aqua-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0 Head</span>
            <span>250 Head</span>
            <span>500 Head</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Columns - Form Questions */}
      <div className="lg:col-span-2 space-y-6">
        {formSections.map((section, idx) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-2">
                {section.icon}
                <h3 className="text-lg font-bold text-white tracking-tight">{section.title}</h3>
              </div>
              <p className="text-sm text-slate-400 mb-4">{section.description}</p>
              {section.content}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Right Column - Live Preview */}
      <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
        <GlassCard className="flex flex-col items-center p-6 text-center border-aqua-500/20 bg-aqua-950/10">
          <h3 className="text-base font-bold text-white mb-2 uppercase tracking-widest text-slate-400">Live Preview</h3>
          
          <div className="my-4">
            <ScoreRing score={liveResult.score} size={160} />
          </div>

          <div className="w-full border-t border-white/10 my-4 pt-4 space-y-3 text-left">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Estimated Extraction</span>
              <span className="text-xl font-bold text-white">{liveResult.dailyUsageGallons.toLocaleString()} gallons/day</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Estimated Reserve Security</span>
              <span className="text-xl font-bold text-emerald-400">~{liveResult.lifespanYears} years remaining</span>
            </div>
            
            {/* Simple Breakdown bar */}
            <div className="pt-2">
              <span className="text-xs text-slate-400 block mb-1">Extraction Allocation</span>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-sky-400"
                  style={{
                    width: `${liveResult.dailyUsageGallons > 0 ? (liveResult.usageBreakdown.household / liveResult.dailyUsageGallons) * 100 : 0}%`,
                  }}
                  title="Household"
                />
                <div
                  className="h-full bg-amber-400"
                  style={{
                    width: `${liveResult.dailyUsageGallons > 0 ? (liveResult.usageBreakdown.irrigation / liveResult.dailyUsageGallons) * 100 : 0}%`,
                  }}
                  title="Irrigation"
                />
                <div
                  className="h-full bg-emerald-400"
                  style={{
                    width: `${liveResult.dailyUsageGallons > 0 ? (liveResult.usageBreakdown.livestock / liveResult.dailyUsageGallons) * 100 : 0}%`,
                  }}
                  title="Livestock"
                />
              </div>
              <div className="flex gap-4 mt-2 text-[10px] text-slate-400 justify-between">
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-sky-400 rounded-full inline-block" /> House</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full inline-block" /> Irrigate</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" /> Stock</span>
              </div>
            </div>
          </div>

          <GradientButton type="submit" className="w-full mt-2">
            Calculate My Score
          </GradientButton>
        </GlassCard>
      </div>
    </form>
  );
};

export default OnboardingForm;
