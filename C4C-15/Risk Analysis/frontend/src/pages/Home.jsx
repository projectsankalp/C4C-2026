import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getModelMetrics, getFeatureImportance } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, RadialBarChart, RadialBar
} from 'recharts';
import { 
  ShieldAlert, Activity, UserCheck, ChevronRight, BarChart2, Heart, Award, ArrowUpRight 
} from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [importance, setImportance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('diabetes'); // 'diabetes' or 'hypertension'

  useEffect(() => {
    // Check mock user
    const savedUser = localStorage.getItem('health_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [metricsRes, importanceRes] = await Promise.all([
          getModelMetrics(),
          getFeatureImportance()
        ]);
        setMetrics(metricsRes.data);
        setImportance(importanceRes.data);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format Recharts data for model comparison
  const getModelComparisonData = (disease) => {
    if (!metrics || !metrics[disease]) return [];
    
    return Object.entries(metrics[disease]).map(([modelName, values]) => ({
      name: modelName,
      Accuracy: parseFloat((values.Accuracy * 100).toFixed(1)),
      F1_Score: parseFloat((values.F1 * 100).toFixed(1)),
      ROC_AUC: parseFloat((values.ROC_AUC * 100).toFixed(1)),
    }));
  };

  // Format Recharts data for feature importance
  const getFeatureImportanceData = (disease) => {
    if (!importance || !importance[disease]) return [];
    
    // Map nice readable names
    const nameMapping = {
      age: "Age",
      bmi: "Body Mass Index (BMI)",
      family_history: "Family History",
      exercise: "Exercise Frequency",
      sugary_food: "Sugar Intake",
      smoking: "Smoking/Alcohol",
      thirst: "Urination/Thirst",
      headaches: "Headaches/Dizziness",
      sleep: "Sleep Duration",
      stress: "Stress Level"
    };

    return Object.entries(importance[disease])
      .map(([feature, weight]) => ({
        rawFeature: feature,
        featureName: nameMapping[feature] || feature,
        Importance: parseFloat((weight * 100).toFixed(1))
      }))
      .sort((a, b) => b.Importance - a.Importance);
  };

  const dbModelData = getModelComparisonData('diabetes');
  const htModelData = getModelComparisonData('hypertension');
  const dbImportanceData = getFeatureImportanceData('diabetes');
  const htImportanceData = getFeatureImportanceData('hypertension');

  const selectedModelName = metrics ? (activeTab === 'diabetes' ? metrics.selected_diabetes_model : metrics.selected_hypertension_model) : "Logistic Regression";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      
      {/* Hero Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-tealhealth-600 via-tealhealth-700 to-indigo-700 text-white p-8 md:p-12 shadow-lg">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center p-8 pointer-events-none">
          <Heart className="h-64 w-64 animate-pulse" />
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 py-1 px-3 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Award className="h-4 w-4" /> AI Hackathon Clinical Portal
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            AI Healthcare Risk Prediction System
          </h1>
          <p className="text-slate-100 text-base md:text-lg font-medium leading-relaxed">
            Predict diabetes, hypertension, and overall physical risk metrics utilizing deep clinical decision modeling trained on 100,000+ patient parameters.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              to="/assess"
              className="bg-white hover:bg-slate-50 text-tealhealth-700 font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              Start Risk Assessment
            </Link>
            <Link
              to="/history"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-2xl border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
            >
              Track History
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="bg-tealhealth-500/10 dark:bg-tealhealth-500/20 p-4 rounded-2xl text-tealhealth-600 dark:text-tealhealth-400">
            <Activity className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Training Dataset Size</span>
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">100,000+ Records</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-500/10 dark:bg-indigo-500/20 p-4 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Models Trained & Serialized</span>
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">3 Architectures</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="bg-amber-500/10 dark:bg-amber-500/20 p-4 rounded-2xl text-amber-600 dark:text-amber-400">
            <UserCheck className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Session Patient Identity</span>
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 truncate max-w-[200px]">
              {user ? user.name : "Anonymous Guest"}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Models Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ML Performance Metrics */}
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">ML Model Performance Comparison</h2>
            </div>
            
            {/* Disease Tab Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-850 p-1 rounded-xl border border-slate-200/30 dark:border-slate-800/50">
              <button
                onClick={() => setActiveTab('diabetes')}
                className={`text-xs font-semibold py-1.5 px-3 rounded-lg transition-all ${
                  activeTab === 'diabetes'
                    ? 'bg-white dark:bg-slate-700 text-tealhealth-600 dark:text-tealhealth-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                Diabetes
              </button>
              <button
                onClick={() => setActiveTab('hypertension')}
                className={`text-xs font-semibold py-1.5 px-3 rounded-lg transition-all ${
                  activeTab === 'hypertension'
                    ? 'bg-white dark:bg-slate-700 text-tealhealth-600 dark:text-tealhealth-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                Hypertension
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Accuracy, F1-Score, and ROC-AUC metrics calculated on a 20,000-record holds out testing set. The FastAPI backend automatically selected <strong>{selectedModelName}</strong> for real-time predictions.
          </p>

          <div className="h-[280px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activeTab === 'diabetes' ? dbModelData : htModelData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[70, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.95)', 
                    border: 'none', 
                    borderRadius: '12px', 
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Accuracy" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="F1_Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ROC_AUC" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Feature Importance */}
        <div className="lg:col-span-5 glass-card p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-tealhealth-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Global Feature Importance Weight</h2>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Relative weight weights of user characteristics in driving the {activeTab === 'diabetes' ? 'Diabetes' : 'Hypertension'} predictions.
          </p>

          <div className="flex-1 flex flex-col justify-center space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tealhealth-500" />
              </div>
            ) : (
              (activeTab === 'diabetes' ? dbImportanceData : htImportanceData).slice(0, 5).map((item, idx) => (
                <div key={item.rawFeature} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">{item.featureName}</span>
                    <span className="text-tealhealth-600 dark:text-tealhealth-400">{item.Importance}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        idx === 0 ? 'bg-gradient-to-r from-tealhealth-500 to-indigo-500' :
                        idx === 1 ? 'bg-tealhealth-500/80' :
                        idx === 2 ? 'bg-tealhealth-500/60' : 'bg-slate-400/50'
                      }`}
                      style={{ width: `${item.Importance * 3}%` }} // Scale visual representation slightly for readability
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Diagnostic Pipeline Steps */}
      <div className="glass-card p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">
          How the Prediction Pipeline Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          <div className="flex flex-col items-center text-center space-y-3 relative z-10">
            <div className="bg-tealhealth-500/10 dark:bg-tealhealth-500/20 p-4 rounded-2xl text-tealhealth-600 dark:text-tealhealth-400 font-extrabold text-xl h-14 w-14 flex items-center justify-center border border-tealhealth-500/20">
              1
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Submit Questionnaire</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[240px]">
              Answer 10 short clinical questions regarding symptoms, physical habits, age, and height/weight metrics.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 relative z-10">
            <div className="bg-indigo-500/10 dark:bg-indigo-500/20 p-4 rounded-2xl text-indigo-600 dark:text-indigo-400 font-extrabold text-xl h-14 w-14 flex items-center justify-center border border-indigo-500/20">
              2
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">FastAPI Model Evaluation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[240px]">
              Inputs are scaled and evaluated by the serialized best-performing machine learning pipelines on the backend.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 relative z-10">
            <div className="bg-amber-500/10 dark:bg-amber-500/20 p-4 rounded-2xl text-amber-600 dark:text-amber-400 font-extrabold text-xl h-14 w-14 flex items-center justify-center border border-amber-500/20">
              3
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Explainable AI & Report</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[240px]">
              Review precise risk probabilities, visual contribution explainer charts, personalized guidelines, and export to PDF.
            </p>
          </div>
          
        </div>
      </div>
      
    </div>
  );
}
