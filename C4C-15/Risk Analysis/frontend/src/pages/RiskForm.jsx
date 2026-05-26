import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BMIWidget from '../components/BMIWidget';
import { predictRisk } from '../services/api';
import { 
  Heart, User, Flame, Coffee, Activity, ChevronRight, ChevronLeft, ShieldAlert, CheckCircle2 
} from 'lucide-react';

export default function RiskForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State matching Pydantic schema on backend
  const [formData, setFormData] = useState({
    age: 45,
    bmi: 24.5,
    family_history: 0,
    exercise: 2,
    sugary_food: 2,
    smoking: 0,
    thirst: 0,
    headaches: 0,
    sleep: 7,
    stress: 1
  });

  // Ensure user is mock authenticated (optional, but sets personalization)
  useEffect(() => {
    const savedUser = localStorage.getItem('health_user');
    if (!savedUser) {
      // Create a default patient profile if none exists so they don't hit wall blocks
      const defaultUser = { name: "Guest Patient", age: 35, id: "guest_123" };
      localStorage.setItem('health_user', JSON.stringify(defaultUser));
    }
  }, []);

  const handleBmiChange = (calculatedBmi) => {
    setFormData(prev => ({ ...prev, bmi: calculatedBmi }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: Number(value) }));
  };

  const nextStep = () => {
    setError(null);
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call FastAPI (or its robust rules-engine fallback inside services/api)
      const response = await predictRisk(formData);
      
      // Store calculation in LocalStorage history
      const savedUser = JSON.parse(localStorage.getItem('health_user'));
      const newHistoryItem = {
        id: `assessment_${Date.now()}`,
        patientName: savedUser ? savedUser.name : "Guest Patient",
        timestamp: new Date().toISOString(),
        inputs: formData,
        results: response.data
      };

      const existingHistory = JSON.parse(localStorage.getItem('health_history')) || [];
      existingHistory.unshift(newHistoryItem); // insert at start
      localStorage.setItem('health_history', JSON.stringify(existingHistory));

      // Redirect to results page, passing the results and inputs
      navigate('/results', { state: { prediction: response.data, inputs: formData } });
    } catch (err) {
      console.error(err);
      setError("An error occurred during risk calculations. Please check your inputs and make sure the API is responsive.");
    } finally {
      setLoading(false);
    }
  };

  // Step Indicators
  const steps = [
    { num: 1, title: "Body & Age" },
    { num: 2, title: "Habits" },
    { num: 3, title: "Symptoms" }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Health Risk Assessment
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
          Please provide accurate details. Your inputs are evaluated by backend XGBoost and Random Forest classifiers.
        </p>
      </div>

      {/* Progress Tracker */}
      <div className="flex justify-between items-center mb-8 max-w-md mx-auto relative px-6">
        <div className="absolute left-10 right-10 top-5 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />
        <div 
          className="absolute left-10 top-5 h-0.5 bg-tealhealth-500 -z-10 transition-all duration-300"
          style={{ width: `${(currentStep - 1) * 44}%` }}
        />
        {steps.map((s) => (
          <div key={s.num} className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => s.num < currentStep && setCurrentStep(s.num)}
              disabled={s.num >= currentStep}
              className={`h-10 w-10 flex items-center justify-center rounded-full font-bold text-sm border-2 transition-all ${
                s.num === currentStep
                  ? 'bg-tealhealth-500 text-white border-tealhealth-500 scale-105 shadow-md shadow-tealhealth-500/20'
                  : s.num < currentStep
                  ? 'bg-emerald-500 text-white border-emerald-500 cursor-pointer'
                  : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed'
              }`}
            >
              {s.num < currentStep ? <CheckCircle2 className="h-5 w-5" /> : s.num}
            </button>
            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{s.title}</span>
          </div>
        ))}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl border border-white/20 p-6 md:p-8 shadow-md">
        
        {error && (
          <div className="mb-6 flex gap-2.5 items-start bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs p-4 rounded-2xl animate-pulse">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: DEMOGRAPHICS AND BODY METRICS */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-850 pb-2 mb-4">
              <User className="h-5 w-5 text-tealhealth-500" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Step 1: Vital Stats & Age</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Age Slider Input */}
              <div className="md:col-span-5 space-y-4">
                <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <label className="text-slate-600 dark:text-slate-300">Age</label>
                    <span className="text-tealhealth-600 dark:text-tealhealth-400 text-base">{formData.age} years</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="85"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-tealhealth-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                    <span>18 yrs</span>
                    <span>50 yrs</span>
                    <span>85 yrs</span>
                  </div>
                </div>

                {/* Family History */}
                <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                  <span className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">Family History</span>
                  <p className="text-[11px] text-slate-400 mb-3">Is there a family history of diabetes or cardiovascular conditions?</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleInputChange('family_history', 0)}
                      className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        formData.family_history === 0
                          ? 'bg-tealhealth-500 text-white border-tealhealth-500 shadow-md shadow-tealhealth-500/10'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-750'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('family_history', 1)}
                      className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        formData.family_history === 1
                          ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/10'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-750'
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>

              {/* BMI Widget */}
              <div className="md:col-span-7">
                <BMIWidget initialBmi={formData.bmi} onBmiChange={handleBmiChange} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LIFESTYLE & HABITS */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-850 pb-2 mb-4">
              <Flame className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Step 2: Lifestyle Habits</h2>
            </div>

            <div className="space-y-6">
              {/* Exercise Frequency */}
              <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <label className="text-slate-600 dark:text-slate-300">Exercise Frequency</label>
                  <span className="text-tealhealth-600 dark:text-tealhealth-400 font-bold">
                    {formData.exercise === 0 ? "None (Sedentary)" : `${formData.exercise} times/week`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={formData.exercise}
                  onChange={(e) => handleInputChange('exercise', e.target.value)}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-tealhealth-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                  <span>Sedentary</span>
                  <span>Light</span>
                  <span>Moderate</span>
                  <span>Very Active (4+)</span>
                </div>
              </div>

              {/* Sugary Food Intake */}
              <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <label className="text-slate-600 dark:text-slate-300">Sugary Food & Drink Intake</label>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {formData.sugary_food === 0 ? "Very Low" : 
                     formData.sugary_food === 1 ? "Low" :
                     formData.sugary_food === 2 ? "Moderate" :
                     formData.sugary_food === 3 ? "High" : "Very High"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={formData.sugary_food}
                  onChange={(e) => handleInputChange('sugary_food', e.target.value)}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                  <span>Very Low</span>
                  <span>Low</span>
                  <span>Moderate</span>
                  <span>High</span>
                  <span>Very High</span>
                </div>
              </div>

              {/* Smoking and Alcohol */}
              <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                <span className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Smoking / Excess Alcohol Habits</span>
                <p className="text-[11px] text-slate-400 mb-3">Do you currently smoke cigarettes or consume alcohol regularly?</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('smoking', 0)}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      formData.smoking === 0
                        ? 'bg-tealhealth-500 text-white border-tealhealth-500 shadow-md shadow-tealhealth-500/10'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-750'
                    }`}
                  >
                    No (None / Occasional)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('smoking', 1)}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      formData.smoking === 1
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-750'
                    }`}
                  >
                    Yes (Regular)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SYMPTOMS & CLINICAL INDICATORS */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-850 pb-2 mb-4">
              <Activity className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Step 3: Clinical Vitals & Symptoms</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Thirst symptom */}
              <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                <span className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Urination & Thirst Frequency</span>
                <p className="text-[11px] text-slate-400 mb-4">Do you experience frequent urination or persistent unquenchable thirst?</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('thirst', 0)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.thirst === 0
                        ? 'bg-tealhealth-500 text-white border-tealhealth-500'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-750'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('thirst', 1)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.thirst === 1
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-750'
                    }`}
                  >
                    Frequent / Intense
                  </button>
                </div>
              </div>

              {/* Headaches symptom */}
              <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
                <span className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Headaches / Dizziness</span>
                <p className="text-[11px] text-slate-400 mb-4">Do you experience frequent unexplained headaches or bouts of dizziness?</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('headaches', 0)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.headaches === 0
                        ? 'bg-tealhealth-500 text-white border-tealhealth-500'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-750'
                    }`}
                  >
                    Normal / Rare
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('headaches', 1)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.headaches === 1
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-750'
                    }`}
                  >
                    Frequent Headaches
                  </button>
                </div>
              </div>

              {/* Sleep Duration */}
              <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 md:col-span-2">
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <label className="text-slate-600 dark:text-slate-300">Average Nightly Sleep</label>
                  <span className="text-tealhealth-600 dark:text-tealhealth-400 font-bold">{formData.sleep} hours</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="10"
                  value={formData.sleep}
                  onChange={(e) => handleInputChange('sleep', e.target.value)}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-tealhealth-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                  <span>4 hrs (Severely Short)</span>
                  <span>7 hrs (Target)</span>
                  <span>10 hrs (Long)</span>
                </div>
              </div>

              {/* Stress Level */}
              <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 md:col-span-2">
                <span className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">Daily Stress Level</span>
                <div className="grid grid-cols-4 gap-2">
                  {["Low", "Moderate", "High", "Extreme"].map((lvl, index) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleInputChange('stress', index)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        formData.stress === index
                          ? index === 0
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : index === 1
                            ? 'bg-tealhealth-500 text-white border-tealhealth-500'
                            : index === 2
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/10'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-250 dark:border-slate-750'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-slate-200/50 dark:border-slate-850 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-tealhealth-600 dark:hover:text-tealhealth-400 transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
                Back
              </button>
            )}
          </div>

          <div>
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-1.5 bg-gradient-to-r from-tealhealth-600 to-indigo-600 hover:from-tealhealth-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-2xl shadow-md transition-all duration-300 hover:scale-[1.02]"
              >
                Continue
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-tealhealth-600 via-indigo-600 to-indigo-700 hover:opacity-95 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                    <span>Analyzing Risks...</span>
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5 animate-pulse text-rose-300" />
                    <span>Calculate Risk Scores</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </form>
      
    </div>
  );
}
