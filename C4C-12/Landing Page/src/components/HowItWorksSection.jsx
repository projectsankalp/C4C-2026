/**
 * @file HowItWorksSection.jsx
 * @description How It Works section rendering 4-step clinical workflow with CSS-drawn device mockups.
 */

import React from "react";
import { HOW_IT_WORKS } from "../utils/constants";
import { CreditCard, Smartphone, CheckSquare, RefreshCw, WifiOff, CheckCircle2 } from "lucide-react";

export const HowItWorksSection = () => {
  const getStepIcon = (step) => {
    switch (step) {
      case "01": return <CreditCard className="h-6 w-6 text-teal-600" />;
      case "02": return <Smartphone className="h-6 w-6 text-teal-600" />;
      case "03": return <CheckSquare className="h-6 w-6 text-teal-600" />;
      case "04": return <RefreshCw className="h-6 w-6 text-teal-600" />;
      default: return null;
    }
  };

  const renderMockup = (step) => {
    switch (step) {
      case "01":
        // NFC Card Scan Mockup
        return (
          <div className="w-[180px] h-[320px] device-mockup flex flex-col bg-slate-900 border-slate-950 p-3 text-[10px] text-slate-300 font-mono select-none">
            {/* Phone Notch/Speaker */}
            <div className="w-16 h-4 bg-slate-950 rounded-b-xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
              <div className="w-8 h-1 bg-slate-800 rounded-full" />
            </div>
            
            {/* Status Bar */}
            <div className="flex justify-between items-center pt-2 pb-3 px-1 text-[8px] text-slate-500">
              <span>9:41 AM</span>
              <div className="flex items-center gap-1 font-sans">
                <WifiOff className="h-2 w-2 text-red-500" />
                <span>Offline</span>
              </div>
            </div>

            {/* Simulated App Screen */}
            <div className="flex-grow flex flex-col justify-center items-center text-center p-2 bg-slate-850 rounded-2xl border border-slate-800/80 mt-2">
              <div className="h-10 w-10 bg-teal-500/10 rounded-full flex items-center justify-center border border-teal-500/30 mb-3 animate-pulse">
                <CreditCard className="h-5 w-5 text-teal-400" />
              </div>
              <div className="font-bold text-white mb-1">Tap NFC Card</div>
              <div className="text-[8px] text-slate-400">Bring card close to phone back sensor</div>
              
              <div className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 mt-4 text-left">
                <div className="text-teal-400 font-bold mb-1">&bull; Scanning</div>
                <div className="text-[8px] truncate text-slate-400">UID: GS-NFC-8927X</div>
              </div>
            </div>
          </div>
        );

      case "02":
        // Vitals Input Form
        return (
          <div className="w-[180px] h-[320px] device-mockup flex flex-col bg-slate-900 border-slate-950 p-3 text-[10px] text-slate-300 font-sans select-none">
            {/* Phone Notch/Speaker */}
            <div className="w-16 h-4 bg-slate-950 rounded-b-xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
              <div className="w-8 h-1 bg-slate-800 rounded-full" />
            </div>
            
            {/* Status Bar */}
            <div className="flex justify-between items-center pt-2 pb-3 px-1 text-[8px] text-slate-500">
              <span>9:43 AM</span>
              <div className="flex items-center gap-1">
                <WifiOff className="h-2 w-2 text-red-500" />
                <span>Offline</span>
              </div>
            </div>

            {/* Simulated App Screen */}
            <div className="flex-grow flex flex-col justify-start p-2 bg-slate-850 rounded-2xl border border-slate-800/80 mt-2 overflow-hidden">
              <div className="font-bold text-white mb-2 text-center text-[9px]">Log Vitals</div>
              <div className="space-y-2">
                <div>
                  <label className="text-[7px] text-slate-400 block mb-0.5">Systolic / Diastolic</label>
                  <div className="bg-slate-900 border border-slate-800 rounded p-1 text-[8px] font-mono text-white flex justify-between">
                    <span>138 / 88</span>
                    <span className="text-[6px] text-amber-500 font-sans font-bold">Pre-HTN</span>
                  </div>
                </div>
                <div>
                  <label className="text-[7px] text-slate-400 block mb-0.5">Random Blood Sugar</label>
                  <div className="bg-slate-900 border border-slate-800 rounded p-1 text-[8px] font-mono text-white">
                    120 mg/dL
                  </div>
                </div>
                <div className="h-8 bg-teal-600 rounded flex items-center justify-center text-white font-bold text-[8px] cursor-pointer mt-4">
                  Write to Card (NFC)
                </div>
              </div>
            </div>
          </div>
        );

      case "03":
        // Offline Feedback warnings
        return (
          <div className="w-[180px] h-[320px] device-mockup flex flex-col bg-slate-900 border-slate-950 p-3 text-[10px] text-slate-300 font-sans select-none">
            {/* Phone Notch/Speaker */}
            <div className="w-16 h-4 bg-slate-950 rounded-b-xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
              <div className="w-8 h-1 bg-slate-800 rounded-full" />
            </div>
            
            {/* Status Bar */}
            <div className="flex justify-between items-center pt-2 pb-3 px-1 text-[8px] text-slate-500">
              <span>9:45 AM</span>
              <div className="flex items-center gap-1">
                <WifiOff className="h-2 w-2 text-red-500" />
                <span>Offline</span>
              </div>
            </div>

            {/* Simulated App Screen */}
            <div className="flex-grow flex flex-col justify-start p-2 bg-slate-850 rounded-2xl border border-slate-800/80 mt-2 text-center">
              <div className="font-bold text-white mb-3 text-[9px]">Triage Report</div>
              
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-2 text-left mb-3">
                <div className="text-amber-400 font-bold text-[8px] mb-1">⚠️ Moderate Risk</div>
                <p className="text-[7px] text-slate-300 leading-tight">Patient displays borderline high blood pressure. Recommendation logged.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-left">
                <div className="text-[7px] text-slate-400 font-medium">Language Audio Advisory</div>
                <div className="flex items-center gap-2 mt-1 bg-teal-900/10 border border-teal-500/20 rounded p-1">
                  <div className="h-3 w-3 bg-teal-500 rounded-full flex items-center justify-center text-slate-900 text-[6px] font-bold">▶</div>
                  <span className="text-[7px] text-teal-400">Play Advice (Hindi)</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "04":
        // Doctor Cloud sync / dashboard view
        return (
          <div className="w-[200px] h-[320px] border-8 border-slate-800 rounded-2xl shadow-xl bg-slate-900 p-2 text-[9px] text-slate-300 font-sans select-none relative overflow-hidden">
            {/* Dashboard top header */}
            <div className="border-b border-slate-800 pb-2 mb-2 flex justify-between items-center">
              <div className="font-bold text-[8px] text-white">GS Doctor Console</div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[6px] text-slate-400 font-mono">Sync: OK</span>
              </div>
            </div>

            {/* Sync Feed items */}
            <div className="space-y-2">
              <div className="bg-slate-850 border border-slate-800 rounded p-1.5">
                <div className="flex justify-between font-semibold mb-0.5 text-[8px]">
                  <span className="text-white">Ramesh Patel (52)</span>
                  <span className="text-red-400">High Risk</span>
                </div>
                <div className="text-[7px] text-slate-400">BP: 160/100, Sugar: 210 mg/dL</div>
                <div className="mt-1.5 flex gap-1.5">
                  <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-1 py-0.2 rounded text-[6px]">Review Vitals</span>
                  <span className="bg-slate-800 text-slate-300 px-1 py-0.2 rounded text-[6px]">Call IVR</span>
                </div>
              </div>

              <div className="bg-slate-850 border border-slate-800 rounded p-1.5">
                <div className="flex justify-between font-semibold mb-0.5 text-[8px]">
                  <span className="text-white">Lakshmi Devi (48)</span>
                  <span className="text-amber-400">Moderate</span>
                </div>
                <div className="text-[7px] text-slate-400">BP: 138/88, Sugar: 120 mg/dL</div>
                <div className="mt-1 text-[7px] bg-slate-900 p-1 rounded text-teal-400 border border-slate-850 font-mono italic">
                  Prescribed: Telmisartan 40mg
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {HOW_IT_WORKS.title}
          </h2>
          <p className="mt-4 text-lg text-slate-600 font-light leading-relaxed">
            {HOW_IT_WORKS.subtitle}
          </p>
        </div>

        {/* 4-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {HOW_IT_WORKS.steps.map((step, idx) => (
            <div key={idx} className="flex flex-col bg-slate-50 border border-slate-200/60 rounded-3xl p-6 hover:shadow-lg transition-all duration-300 group">
              {/* Step Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="h-12 w-12 rounded-2xl bg-teal-50 flex items-center justify-center border border-teal-100 group-hover:scale-110 transition-transform duration-200">
                  {getStepIcon(step.step)}
                </div>
                <span className="text-2xl font-black text-slate-200 group-hover:text-teal-200 transition-colors">
                  {step.step}
                </span>
              </div>

              {/* Step Info */}
              <h3 className="text-lg font-extrabold text-slate-850 mb-3">{step.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-grow">{step.desc}</p>

              {/* Inline Device Mockup */}
              <div className="mt-auto pt-6 border-t border-slate-200/50 flex justify-center">
                {renderMockup(step.step)}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;
