import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Sparkles, Apple, Activity, Landmark, AlertTriangle, Moon, ShieldAlert, ArrowRight 
} from 'lucide-react';

export default function Recommendations() {
  const [latestReport, setLatestReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch latest assessment from LocalStorage
    const history = JSON.parse(localStorage.getItem('health_history')) || [];
    if (history.length > 0) {
      setLatestReport(history[0]); // first item is newest
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tealhealth-500" />
      </div>
    );
  }

  // Fallback if no assessment has been taken yet
  if (!latestReport) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 px-4 animate-fade-in space-y-6">
        <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-6 rounded-3xl inline-block border border-amber-500/20">
          <ShieldAlert className="h-16 w-16 mx-auto animate-bounce" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">No Assessment Record Found</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
            Personalized recommendations are generated dynamically based on your physical questionnaire outcomes.
          </p>
        </div>
        <Link
          to="/assess"
          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-tealhealth-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-2xl shadow-md transition-all hover:scale-[1.02]"
        >
          <span>Begin Risk Assessment</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const { inputs, results } = latestReport;
  const { diabetes_risk, diabetes_probability, hypertension_risk, hypertension_probability } = results;

  // Compilation of personalized clinical rules based on patient metrics
  const getDietaryAdvice = () => {
    const advice = [];
    if (diabetes_risk !== 'Low') {
      advice.push("Focus on complex carbohydrates (oatmeal, brown rice) and eliminate refined sugars to prevent insulin spikes.");
      advice.push("Incorporate soluble fiber (chia seeds, beans, lentils) which slows sugar absorption and stabilizes glycemia.");
    }
    if (hypertension_risk !== 'Low') {
      advice.push("Initiate the DASH dietary pattern (Dietary Approaches to Stop Hypertension), rich in potassium, calcium, and magnesium.");
      advice.push("Restrict daily sodium intake to under 2,000 mg (approx. 1 teaspoon of table salt) by avoiding pre-packaged foods.");
    }
    if (inputs.bmi >= 25.0) {
      advice.push("Maintain a steady 300–500 calorie daily deficit. Keep a weekly food log to track calorie density.");
    }
    if (inputs.sugary_food >= 3) {
      advice.push("Substantially reduce your sugary snacks and sweetened beverages. Swap them for flavored seltzer water or green tea.");
    }
    
    // Default general advice
    if (advice.length === 0) {
      advice.push("Maintain a balanced diet rich in leafy greens, clean proteins, and healthy monounsaturated fats (olive oil, avocados).");
      advice.push("Stay adequately hydrated with 2.5–3 liters of pure water daily.");
    }
    return advice;
  };

  const getExerciseAdvice = () => {
    const advice = [];
    if (inputs.exercise <= 1) {
      advice.push("Break out of sedentary habits slowly. Start with 10–15 minute brisk walks twice daily, aiming for 150 minutes/week.");
    } else {
      advice.push("Excellent work maintaining baseline active exercise habits. Build on this by adding 2 days of strength training.");
    }
    if (diabetes_risk !== 'Low' || inputs.bmi >= 25.0) {
      advice.push("Engage in moderate-intensity aerobic training. Muscle contraction acts like a natural sponge, drawing glucose directly from the bloodstream even without insulin.");
    }
    if (hypertension_risk !== 'Low') {
      advice.push("Avoid sudden extreme power lifting or isometric holding as it spikes pressure. Stick to steady-state cardiovascular exercises (swimming, cycling).");
    }
    return advice;
  };

  const getClinicalAdvice = () => {
    const screenings = [];
    if (diabetes_risk !== 'Low') {
      screenings.push("Schedule a laboratory Fasting Plasma Glucose (FPG) test and an HbA1c blood screening.");
      screenings.push("Keep track of your blood glucose levels. Aim for a fasting glucose below 100 mg/dL.");
    } else {
      screenings.push("Standard annual checkup including basic blood chemistry panels is adequate.");
    }
    if (hypertension_risk !== 'Low') {
      screenings.push("Ensure regular blood pressure measurements. Log measurements twice daily (morning/evening) for one week.");
      screenings.push("Discuss starting medication therapy with your primary physician if readings consistently exceed 140/90 mmHg.");
    } else {
      screenings.push("Perform a routine blood pressure screening at your annual physical (target < 120/80 mmHg).");
    }
    return screenings;
  };

  const getWarningSigns = () => {
    const signs = [];
    if (diabetes_risk !== 'Low' || inputs.thirst === 1) {
      signs.push("Polyuria (excessive frequent urination, especially interrupting sleep)");
      signs.push("Polydipsia (persistent unquenchable thirst despite heavy hydration)");
      signs.push("Unexplained rapid weight loss, tingling or numbness in hands/feet, or blurred vision");
    }
    if (hypertension_risk !== 'Low' || inputs.headaches === 1) {
      signs.push("Severe throbbing headaches, particularly concentrated in the occipital region (back of head) upon waking");
      signs.push("Epistaxis (sudden nosebleeds) or persistent tinnitus (ringing in ears)");
      signs.push("Chest tightness, mild dyspnea (shortness of breath) on exertion, or sudden dizziness");
    }
    if (signs.length === 0) {
      signs.push("Persistent chronic fatigue, sudden chest pain, radiating shoulder pain, or severe shortness of breath.");
    }
    return signs;
  };

  const getLifestyleTips = () => {
    const tips = [];
    if (inputs.sleep < 7) {
      tips.push("Establish a dark, cool, screen-free sleep environment. Eliminate blue-spectrum light at least 1 hour prior to bedtime.");
      tips.push("Irregular sleep cycles trigger systemic cortisol release, which actively worsens both blood pressure and insulin resistance.");
    }
    if (inputs.stress >= 2) {
      tips.push("Introduce 10 minutes of box-breathing (inhale 4s, hold 4s, exhale 4s, hold 4s) twice daily to down-regulate your sympathetic nervous system.");
      tips.push("Evaluate work-life stress triggers. High stress releases catecholamines which directly constrict arterial vessels.");
    }
    if (inputs.smoking === 1) {
      tips.push("Prioritize smoking cessation. Tobacco chemicals cause immediate arterial endothelial damage and stiffen blood vessels.");
    }
    return tips;
  };

  const dietaryAdvice = getDietaryAdvice();
  const exerciseAdvice = getExerciseAdvice();
  const clinicalAdvice = getClinicalAdvice();
  const warningSigns = getWarningSigns();
  const lifestyleTips = getLifestyleTips();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      
      {/* Page Header */}
      <div className="text-center md:text-left space-y-2 border-b border-slate-200/50 dark:border-slate-850 pb-6">
        <div className="inline-flex items-center gap-1 bg-tealhealth-500/10 dark:bg-tealhealth-500/20 py-1 px-3 rounded-full text-xs font-bold text-tealhealth-600 dark:text-tealhealth-400">
          <Sparkles className="h-4 w-4" /> Personalized AI Clinical Advisor
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Health Recommendations Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Personalized lifestyle modifications and diagnostic screening recommendations compiled from your latest health metrics.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Nutrition Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/20 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Apple className="h-6 w-6 text-tealhealth-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">1. Precision Nutrition & Diet</h2>
          </div>
          <ul className="space-y-3">
            {dietaryAdvice.map((item, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                <span className="h-5 w-5 bg-tealhealth-500/10 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] text-tealhealth-600 dark:text-tealhealth-400 mt-0.5">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Physical Fitness Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/20 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Activity className="h-6 w-6 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">2. Physical Fitness Protocol</h2>
          </div>
          <ul className="space-y-3">
            {exerciseAdvice.map((item, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 dark:text-slate-355 leading-relaxed">
                <span className="h-5 w-5 bg-indigo-500/10 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] text-indigo-650 dark:text-indigo-400 mt-0.5">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Clinical Screenings Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/20 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Landmark className="h-6 w-6 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">3. Diagnostic Screenings</h2>
          </div>
          <ul className="space-y-3">
            {clinicalAdvice.map((item, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                <span className="h-5 w-5 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Lifestyle Optimization Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/20 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Moon className="h-6 w-6 text-purple-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">4. Lifestyle & Sleep</h2>
          </div>
          <ul className="space-y-3">
            {lifestyleTips.length > 0 ? (
              lifestyleTips.map((item, idx) => (
                <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                  <span className="h-5 w-5 bg-purple-500/10 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="flex gap-2.5 items-start text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                <span className="h-5 w-5 bg-purple-500/10 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">
                  ✓
                </span>
                <span>Your baseline lifestyle metrics (sleep cycles, daily stress levels, non-smoking habits) are outstanding. Keep it up!</span>
              </li>
            )}
          </ul>
        </div>

      </div>

      {/* Clinical Warning Signs Banner (Red alert block) */}
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 space-y-4 animate-pulse">
        <div className="flex items-center gap-2.5 border-b border-rose-500/20 pb-3">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
          <h2 className="text-base font-extrabold text-rose-600 dark:text-rose-400">Clinical Warning Signs - Seek Prompt Consultation</h2>
        </div>
        <p className="text-xs text-rose-700/80 dark:text-rose-350/90 leading-relaxed">
          Screening scores indicate moderate-to-high risk flags. If you experience any of the following symptoms, please consult a primary care physician immediately for diagnostic blood and cardiac panels:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
          {warningSigns.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-start text-xs text-rose-700 dark:text-rose-350 leading-relaxed font-semibold">
              <span className="text-rose-500 select-none">•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
