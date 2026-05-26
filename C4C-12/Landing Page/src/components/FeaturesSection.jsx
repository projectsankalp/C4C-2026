/**
 * @file FeaturesSection.jsx
 * @description Features/Problem section highlighting the 6 failure points on the left, and a vertical timeline on the right.
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PROBLEM_TEXT } from "../utils/constants";
import { AlertCircle, ChevronRight, HelpCircle, FileText, WifiOff, RefreshCw, Activity, AlertTriangle } from "lucide-react";

export const FeaturesSection = () => {
  const [activeTimelineStep, setActiveTimelineStep] = useState(0);

  const getCardIcon = (id) => {
    switch (id) {
      case 1: return <HelpCircle className="h-6 w-6 text-red-500" />;
      case 2: return <FileText className="h-6 w-6 text-orange-500" />;
      case 3: return <WifiOff className="h-6 w-6 text-blue-500" />;
      case 4: return <RefreshCw className="h-6 w-6 text-purple-500" />;
      case 5: return <Activity className="h-6 w-6 text-teal-500" />;
      case 6: return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      default: return <AlertCircle className="h-6 w-6 text-slate-500" />;
    }
  };

  return (
    <section id="problem" className="py-24 bg-slate-50 border-y border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {PROBLEM_TEXT.title}
          </h2>
          <p className="mt-4 text-lg text-slate-600 font-light leading-relaxed">
            {PROBLEM_TEXT.subtitle}
          </p>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: 6 Failure Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PROBLEM_TEXT.cards.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col"
              >
                <div className="p-3 bg-slate-50 rounded-xl w-fit border border-slate-100 mb-4">
                  {getCardIcon(card.id)}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-grow">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Right Column: Lakshmi's Story Vertical Timeline */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center space-x-2.5 mb-6 pb-4 border-b border-slate-100">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider">
                Case Study
              </h3>
            </div>

            <h4 className="text-xl font-extrabold text-slate-900 mb-8 leading-tight">
              {PROBLEM_TEXT.story.title}
            </h4>

            {/* Timeline Wrapper */}
            <div className="relative border-l border-slate-200 pl-6 ml-3 space-y-8">
              {PROBLEM_TEXT.story.timeline.map((step, idx) => {
                const isSelected = activeTimelineStep === idx;
                return (
                  <div
                    key={idx}
                    className="relative cursor-pointer group"
                    onClick={() => setActiveTimelineStep(idx)}
                  >
                    {/* Timeline Node Point */}
                    <div
                      className={`absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? "bg-amber-500 border-white scale-125 shadow-md shadow-amber-500/20"
                          : "bg-white border-slate-300 group-hover:border-slate-400"
                      }`}
                    >
                      {isSelected && <span className="h-1 w-1 bg-white rounded-full" />}
                    </div>

                    {/* Step Content */}
                    <div className={`p-4 rounded-xl border transition-all duration-300 ${
                      isSelected
                        ? "bg-amber-500/5 border-amber-500/20 shadow-sm"
                        : "border-transparent hover:bg-slate-50"
                    }`}>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        isSelected ? "text-amber-600" : "text-slate-400"
                      }`}>
                        {step.stage}
                      </span>
                      <h5 className={`font-bold text-base mt-0.5 ${
                        isSelected ? "text-slate-900" : "text-slate-700"
                      }`}>
                        {step.title}
                      </h5>
                      {isSelected && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.2 }}
                          className="text-sm text-slate-500 mt-2 leading-relaxed"
                        >
                          {step.desc}
                        </motion.p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <p className="mt-8 text-xs text-slate-400 text-center italic bg-slate-50 py-3 rounded-lg border border-slate-100">
              Interactive timeline &bull; Click steps to reveal Lakshmi's full progression.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
