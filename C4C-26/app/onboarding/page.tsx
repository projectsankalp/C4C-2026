"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser as useClerkUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { locateAndMatch } from '@/lib/geolocation';
import { checkWaterYieldAnomalies, FarmProfile } from '@/lib/waterYieldCheck';
import { calculateSustainability, UserProfile } from '@/lib/scoreEngine';
import { SatelliteVerificationLoader } from '@/components/shared/SatelliteVerificationLoader';
import ScoreRing from '@/components/ui/ScoreRing';
import GlassCard from '@/components/ui/GlassCard';
import GradientButton from '@/components/ui/GradientButton';
import {
  Users,
  Trees,
  Sprout,
  Droplets,
  PawPrint,
  LocateFixed,
  Loader2,
  AlertTriangle,
  MapPin
} from 'lucide-react';

interface ExtendedUserProfile extends UserProfile {
  location: string;
  dailyWaterUsage: number;
  cropName: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useClerkUser();
  const [showSatelliteLoader, setShowSatelliteLoader] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Form State
  const [formData, setFormData] = useState<ExtendedUserProfile>({
    location: '',
    householdSize: 4,
    landAcres: 50,
    cropType: 'moderate',
    cropName: 'Wheat',
    irrigationFrequency: 'bi-weekly',
    livestockCount: 10,
    dailyWaterUsage: 8000,
  });

  // Validation Error States
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Locate user using HTML5 Geolocation API and Haversine matching
  const handleLocateMe = async () => {
    setIsLocating(true);
    const result = await locateAndMatch();
    setIsLocating(false);

    if (result.success) {
      setFormData(prev => ({
        ...prev,
        location: `${result.matchedRegion.name}, ${result.matchedRegion.state}`
      }));
      toast.success(`Location detected: ${result.matchedRegion.name}, ${result.matchedRegion.state}`, {
        icon: <MapPin className="text-cyan-500" />
      });
    } else {
      toast.error('Could not detect location automatically. Please select manually.', {
        description: result.message
      });
    }
  };

  const handleSliderChange = (name: keyof ExtendedUserProfile, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error on change
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSelectChange = (name: keyof ExtendedUserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCropSelect = (type: 'none' | 'drought-resistant' | 'moderate' | 'water-intensive', name: string) => {
    setFormData(prev => ({ ...prev, cropType: type, cropName: name }));
  };

  // Validate form details against input boundaries
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.location.trim()) {
      newErrors.location = 'Location field is required.';
    }

    if (formData.householdSize < 1 || formData.householdSize > 20) {
      newErrors.householdSize = 'Household size must be between 1 and 20.';
    }

    if (formData.landAcres < 0.5 || formData.landAcres > 500) {
      newErrors.landAcres = 'Land size must be between 0.5 and 500 acres.';
    }

    if (formData.livestockCount < 0 || formData.livestockCount > 500) {
      newErrors.livestockCount = 'Livestock count must be between 0 and 500.';
    }

    if (formData.dailyWaterUsage < 0 || formData.dailyWaterUsage > 500000) {
      newErrors.dailyWaterUsage = 'Daily usage must be between 0 and 500,000 litres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Run Water Yield Anomaly checks
    const profileToCheck: FarmProfile = {
      cropType: formData.cropName,
      landSize: formData.landAcres,
      irrigationFrequency: formData.irrigationFrequency,
      householdSize: formData.householdSize,
      dailyWaterUsage: formData.dailyWaterUsage
    };

    const warningsCheck = checkWaterYieldAnomalies(profileToCheck);
    if (warningsCheck.hasAnomaly) {
      warningsCheck.warnings.forEach(warning => {
        toast.warning(warning, {
          duration: 6500,
          icon: <AlertTriangle className="text-amber-500 shrink-0" />
        });
      });
    }

    // Save profile keyed by clerk userId
    const storageKey = `jalrakshak_profile_${user?.id ?? 'guest'}`;
    localStorage.setItem(storageKey, JSON.stringify(formData));
    // Backwards compatibility for the context provider
    localStorage.setItem('groundwater_profile', JSON.stringify(formData));

    // Launch satellite loader overlay
    setShowSatelliteLoader(true);
  };

  // Live Score Preview on the fly (ignoring location and cropName metadata)
  const liveResult = calculateSustainability({
    householdSize: formData.householdSize,
    landAcres: formData.landAcres,
    cropType: formData.cropType,
    irrigationFrequency: formData.irrigationFrequency,
    livestockCount: formData.livestockCount,
  });

  const cropOptions = [
    { name: 'Sugarcane', type: 'water-intensive' as const, desc: 'Highly thirsty crop requiring constant lateral seepage.' },
    { name: 'Rice (Paddy)', type: 'water-intensive' as const, desc: 'Traditional heavy draw, flooded fields cultivation.' },
    { name: 'Cotton', type: 'water-intensive' as const, desc: 'Commercial crop demanding seasonal high moisture levels.' },
    { name: 'Wheat', type: 'moderate' as const, desc: 'Moderate alluvial draw, typical rotation wheat variety.' },
    { name: 'Millets / Sorghum', type: 'drought-resistant' as const, desc: 'Extremely resilient grains, minimal aquifer draw.' },
    { name: 'None / Fallow', type: 'none' as const, desc: 'Fallow soil layers, lets aquifers naturally recharge.' }
  ];

  const irrigationOptions = [
    { name: 'Flood / Furrow', value: 'flood' as const, desc: 'Floods soil beds. High evaporative losses.' },
    { name: 'Sprinkler Irrigation', value: 'daily' as const, desc: 'Pressurized mist sprays. Standard daily draw.' },
    { name: 'Sub-surface Drip', value: 'bi-weekly' as const, desc: 'Direct root zone pipes. Safe bi-weekly schedule.' },
    { name: 'Drought Dryland', value: 'none' as const, desc: 'Zero active irrigation. Relies solely on monsoon.' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50 text-slate-800 pt-20 px-4 md:px-8 pb-12 relative">
      
      <div className="max-w-7xl mx-auto py-8">

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/50 text-cyan-700 text-xs font-bold mb-5 shadow-sm">
            <Droplets className="w-4 h-4 text-cyan-500 animate-pulse" />
            AI Groundwater Sustainability Audit
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-slate-800 uppercase">
            Groundwater
            <span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
              {" "}Sustainability Audit
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed max-w-2xl mx-auto font-medium">
            Analyze your groundwater usage, calculate depletion risk scores, and retrieve real-time satellite verification checks.
          </p>
        </div>

        {/* Audit Form Interface */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Panel - Inputs Questions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Geolocation Section */}
            <GlassCard className="bg-white/70 border border-white/60 p-6 shadow-lg rounded-2xl text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <MapPin className="w-5 h-5 text-cyan-600" />
                  Farm Location & Aquifer Mapping
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-4">Input your district or match automatically using satellite coordinates.</p>
              
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => handleSelectChange('location', e.target.value)}
                  placeholder="e.g. Amritsar, Punjab or Jaipur, Rajasthan"
                  className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder-slate-400"
                />
                
                <button
                  type="button"
                  disabled={isLocating}
                  onClick={handleLocateMe}
                  className="absolute right-2 p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 text-cyan-600 hover:text-cyan-700 transition-colors disabled:opacity-50 cursor-pointer"
                  aria-label="Find my current coordinates"
                >
                  {isLocating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                  ) : (
                    <LocateFixed className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.location && (
                <span className="text-[10px] font-bold text-rose-500 mt-1.5 block">{errors.location}</span>
              )}
            </GlassCard>

            {/* Domestic Footprint Section */}
            <GlassCard className="bg-white/70 border border-white/60 p-6 shadow-lg rounded-2xl text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <Users className="w-5 h-5 text-cyan-600" />
                  Domestic Family Occupancy
                </div>
                <span className="text-sm font-black text-cyan-600">{formData.householdSize} People</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Defines standard home consumption load parameters (enforced limits: 1 to 20).</p>
              
              <input
                type="range"
                min={1}
                max={20}
                value={formData.householdSize}
                onChange={(e) => handleSliderChange('householdSize', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-2">
                <span>1 Occupant</span>
                <span>10 Occupants</span>
                <span>20 Occupants</span>
              </div>
              {errors.householdSize && (
                <span className="text-[10px] font-bold text-rose-500 mt-1.5 block">{errors.householdSize}</span>
              )}
            </GlassCard>

            {/* Property Size Section */}
            <GlassCard className="bg-white/70 border border-white/60 p-6 shadow-lg rounded-2xl text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <Trees className="w-5 h-5 text-cyan-600" />
                  Cultivation Land Size
                </div>
                <span className="text-sm font-black text-cyan-600">{formData.landAcres} Acres</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Total acreage matching your farm profile boundaries (enforced limits: 0.5 to 500).</p>
              
              <input
                type="range"
                min={0.5}
                max={500}
                step={0.5}
                value={formData.landAcres}
                onChange={(e) => handleSliderChange('landAcres', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-2">
                <span>0.5 Acres</span>
                <span>250 Acres</span>
                <span>500 Acres</span>
              </div>
              {errors.landAcres && (
                <span className="text-[10px] font-bold text-rose-500 mt-1.5 block">{errors.landAcres}</span>
              )}
            </GlassCard>

            {/* Crop Selection Section */}
            <GlassCard className="bg-white/70 border border-white/60 p-6 shadow-lg rounded-2xl text-left">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
                <Sprout className="w-5 h-5 text-cyan-600" />
                Agricultural Crop Selection
              </div>
              <p className="text-xs text-slate-500 mb-4">Select the primary agricultural crop currently growing in your soil beds.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {cropOptions.map((crop, idx) => {
                  const isSelected = formData.cropName === crop.name;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleCropSelect(crop.type, crop.name)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between h-28 bg-white ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-50/20 shadow-md ring-2 ring-cyan-500/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-800 block leading-tight">{crop.name}</span>
                        <span className="text-[10px] text-slate-500 mt-1 block leading-relaxed line-clamp-2">{crop.desc}</span>
                      </div>
                      <span className={`text-[9px] font-black uppercase self-start px-2 py-0.5 rounded border mt-2 ${
                        crop.type === 'water-intensive' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        crop.type === 'moderate' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        crop.type === 'drought-resistant' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {crop.type === 'none' ? 'Zero impact' : crop.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Irrigation Methods Section */}
            <GlassCard className="bg-white/70 border border-white/60 p-6 shadow-lg rounded-2xl text-left">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
                <Droplets className="w-5 h-5 text-cyan-600" />
                Water Irrigation Frequency
              </div>
              <p className="text-xs text-slate-500 mb-4">State the frequency matching your agricultural watering schedule.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {irrigationOptions.map((irr, idx) => {
                  const isSelected = formData.irrigationFrequency === irr.value;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectChange('irrigationFrequency', irr.value)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between h-28 bg-white ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-50/20 shadow-md ring-2 ring-cyan-500/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-800 block leading-tight">{irr.name}</span>
                        <span className="text-[10px] text-slate-500 mt-1 block leading-relaxed line-clamp-2">{irr.desc}</span>
                      </div>
                      <span className={`text-[9px] font-black uppercase self-start px-2 py-0.5 rounded border mt-2 ${
                        irr.value === 'flood' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        irr.value === 'daily' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {irr.value === 'none' ? 'Drought land' : irr.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Daily Extraction Volume & Livestock Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Daily Extraction Volume */}
              <GlassCard className="bg-white/70 border border-white/60 p-6 shadow-lg rounded-2xl text-left">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                    Daily Water Volume
                  </div>
                  <span className="text-xs font-black text-cyan-600">{formData.dailyWaterUsage.toLocaleString()} L</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={500000}
                  step={5000}
                  value={formData.dailyWaterUsage}
                  onChange={(e) => handleSliderChange('dailyWaterUsage', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase mt-1">
                  <span>0 Litres</span>
                  <span>500k L</span>
                </div>
                {errors.dailyWaterUsage && (
                  <span className="text-[10px] font-bold text-rose-500 mt-1.5 block">{errors.dailyWaterUsage}</span>
                )}
              </GlassCard>

              {/* Livestock Count */}
              <GlassCard className="bg-white/70 border border-white/60 p-6 shadow-lg rounded-2xl text-left">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                    <PawPrint className="w-4 h-4 text-cyan-600" />
                    Livestock Animal Count
                  </div>
                  <span className="text-xs font-black text-cyan-600">{formData.livestockCount} Head</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={500}
                  value={formData.livestockCount}
                  onChange={(e) => handleSliderChange('livestockCount', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase mt-1">
                  <span>0 Animals</span>
                  <span>500 Head</span>
                </div>
                {errors.livestockCount && (
                  <span className="text-[10px] font-bold text-rose-500 mt-1.5 block">{errors.livestockCount}</span>
                )}
              </GlassCard>
            </div>

          </div>

          {/* Right Panel - Live Preview Metrics */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
            
            <GlassCard className="flex flex-col items-center p-6 text-center border-cyan-200 bg-white/80 shadow-xl rounded-2xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Audit Preview</h3>
              
              {/* Core visual ring */}
              <div className="my-4">
                <ScoreRing score={liveResult.score} size={150} textColorClass="text-slate-800" />
              </div>

              {/* Status details indicators list */}
              <div className="w-full border-t border-slate-100 my-4 pt-4 space-y-3.5 text-left">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Calculated Extraction</span>
                  <span className="text-lg font-black text-slate-800">{liveResult.dailyUsageGallons.toLocaleString()} gal/day</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Estimated Lifespan</span>
                  <span className="text-lg font-black text-emerald-600">~{liveResult.lifespanYears} years remaining</span>
                </div>

                {/* Simple allocation split visualizer */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Extraction Breakdown</span>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
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
                  <div className="flex gap-2 mt-2 text-[9px] font-bold text-slate-400 justify-between uppercase">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-sky-400 rounded-full inline-block" /> House</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full inline-block" /> Crop</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" /> Stock</span>
                  </div>
                </div>
              </div>

              {/* Submit CTA button */}
              <GradientButton type="submit" className="w-full mt-2 cursor-pointer font-bold uppercase text-xs tracking-wider">
                Calculate Score & Verify
              </GradientButton>
            </GlassCard>

          </div>

        </form>

      </div>

      {/* Satellite Scan Overlay */}
      <SatelliteVerificationLoader
        isVisible={showSatelliteLoader}
        onComplete={() => router.push('/dashboard')}
      />

    </div>
  );
}