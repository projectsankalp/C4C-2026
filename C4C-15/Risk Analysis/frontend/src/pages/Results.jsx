import React, { useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Heart, ArrowRight, Download, Activity, Sparkles, CheckCircle2, ShieldAlert, RotateCcw, Info
} from 'lucide-react';
import { ResponsiveContainer, RadialBarChart, RadialBar, Tooltip } from 'recharts';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef();

  const state = location.state || {};
  const { prediction, inputs } = state;

  // Safeguard: Redirect to form if accessed directly without prediction state
  if (!prediction) {
    React.useEffect(() => {
      navigate('/assess');
    }, [navigate]);
    return null;
  }

  const { 
    diabetes_risk, diabetes_probability, 
    hypertension_risk, hypertension_probability, 
    overall_risk, overall_probability, 
    explainability, models_used 
  } = prediction;

  const getRiskColors = (risk) => {
    if (risk === 'Low') return { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', circle: '#10b981' };
    if (risk === 'Moderate') return { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', circle: '#f59e0b' };
    return { text: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', circle: '#ef4444' };
  };

  const overallColors = getRiskColors(overall_risk);
  const dbColors = getRiskColors(diabetes_risk);
  const htColors = getRiskColors(hypertension_risk);

  // Format radial gauge data
  const dbGaugeData = [{ name: 'Diabetes', value: diabetes_probability, fill: dbColors.circle }];
  const htGaugeData = [{ name: 'Hypertension', value: hypertension_probability, fill: htColors.circle }];

  // Download PDF Report utilizing html2canvas and jsPDF
  const downloadPdfReport = async () => {
    const element = reportRef.current;
    if (!element) return;

    try {
      // Temporarily hide buttons to avoid rendering them in PDF
      const buttons = element.querySelectorAll('.no-print');
      buttons.forEach(btn => btn.style.display = 'none');

      // Generate canvas
      const canvas = await html2canvas(element, {
        scale: 2, // higher resolution
        useCORS: true,
        backgroundColor: document.body.classList.contains('dark') ? '#0f172a' : '#ffffff'
      });

      // Restore button display
      buttons.forEach(btn => btn.style.display = '');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 size width in mm
      const pageHeight = 297; // A4 size height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Handle multi-page if height exceeds page height
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`AI_Health_Report_${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    }
  };

  // Maps nice names for features
  const featureNames = {
    age: "Age",
    bmi: "Body Mass Index (BMI)",
    family_history: "Family History",
    exercise: "Exercise Frequency",
    sugary_food: "Sugar Consumption",
    smoking: "Smoking / Drinking Habits",
    thirst: "Frequent Urination & Thirst",
    headaches: "Headaches & Dizziness",
    sleep: "Sleep Hours",
    stress: "Stress Level"
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
      
      {/* Actions (Always outside the printable container for clean results) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/assess"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-tealhealth-500"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Retake Assessment</span>
        </Link>
        
        <button
          onClick={downloadPdfReport}
          className="flex items-center gap-2 bg-gradient-to-r from-tealhealth-600 to-indigo-600 hover:opacity-95 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02]"
        >
          <Download className="h-4 w-4" />
          <span>Download PDF Report</span>
        </button>
      </div>

      {/* Printable Report Panel */}
      <div ref={reportRef} className="glass-panel rounded-3xl border border-white/20 p-8 shadow-lg space-y-8">
        
        {/* Report Header */}
        <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-200/50 dark:border-slate-805 pb-6">
          <div>
            <span className="text-[10px] font-extrabold text-tealhealth-600 dark:text-tealhealth-400 uppercase tracking-widest block mb-1">
              Clinical Grade Predictive Output
            </span>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              AI Risk Diagnostic Report
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Generated on {new Date().toLocaleDateString()} | Patient: {localStorage.getItem('health_user') ? JSON.parse(localStorage.getItem('health_user')).name : "Anonymous"}
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-2 py-2 px-4 border rounded-2xl ${overallColors.bg} ${overallColors.border} ${overallColors.text}`}>
              {overall_risk === 'High' ? <ShieldAlert className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              <span className="font-extrabold text-sm uppercase">Overall Risk: {overall_risk} ({overall_probability}%)</span>
            </div>
          </div>
        </div>

        {/* Dual Risk Probability Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Diabetes Card */}
          <div className="glass-card rounded-2xl border border-slate-200/40 dark:border-slate-800/80 p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-3 left-3 bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-400 font-bold px-2 py-0.5 rounded-md">
              AI Engine: {models_used.diabetes}
            </div>

            <h3 className="font-extrabold text-slate-700 dark:text-slate-300 text-base mb-2 mt-2">Diabetes Risk Score</h3>
            
            {/* Radial Gauge */}
            <div className="h-32 w-32 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="80%" 
                  outerRadius="100%" 
                  data={dbGaugeData} 
                  startAngle={180} 
                  endAngle={0}
                >
                  <RadialBar minAngle={15} background={{ fill: '#e2e8f0' }} clockWise={true} dataKey="value" cornerRadius={6} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-3">
                <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-none">
                  {diabetes_probability}%
                </span>
                <span className={`text-[10px] font-bold uppercase mt-1 ${dbColors.text}`}>
                  {diabetes_risk}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 max-w-[240px]">
              Probability score indicates {diabetes_probability}% probability based on BMI, urination frequency, sugary food, and age parameters.
            </p>
          </div>

          {/* Hypertension Card */}
          <div className="glass-card rounded-2xl border border-slate-200/40 dark:border-slate-800/80 p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-3 left-3 bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-400 font-bold px-2 py-0.5 rounded-md">
              AI Engine: {models_used.hypertension}
            </div>

            <h3 className="font-extrabold text-slate-700 dark:text-slate-300 text-base mb-2 mt-2">Hypertension Risk Score</h3>
            
            {/* Radial Gauge */}
            <div className="h-32 w-32 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="80%" 
                  outerRadius="100%" 
                  data={htGaugeData} 
                  startAngle={180} 
                  endAngle={0}
                >
                  <RadialBar minAngle={15} background={{ fill: '#e2e8f0' }} clockWise={true} dataKey="value" cornerRadius={6} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-3">
                <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-none">
                  {hypertension_probability}%
                </span>
                <span className={`text-[10px] font-bold uppercase mt-1 ${htColors.text}`}>
                  {hypertension_risk}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 max-w-[240px]">
              Probability score indicates {hypertension_probability}% probability based on age, BMI, sleep duration, and headaches symptoms.
            </p>
          </div>

        </div>

        {/* Explainable AI / Local SHAP Impact Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-850 pb-2">
            <Info className="h-5 w-5 text-indigo-500 animate-bounce" />
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base">
              Explainable AI (XAI) - Local Feature Contribution Analysis
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            This visual dashboard represents a local explanation model (similar to <strong>SHAP</strong>). It isolates your specific inputs relative to the average population to show which features drive risk <strong>up</strong> (red bars, risk boosters) or pull risk <strong>down</strong> (green bars, protective habits).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            
            {/* Diabetes Factors */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-center md:text-left">
                Diabetes Impact Factors
              </h4>
              <div className="space-y-3">
                {explainability.diabetes_factors.slice(0, 5).map((factor) => {
                  const val = inputs[factor.feature];
                  const rawImpact = factor.impact;
                  const isPositive = rawImpact > 0.0;
                  const absImpact = Math.abs(rawImpact);
                  
                  // Scale width for display: map max impact to 100%
                  const percentWidth = Math.min(absImpact * 200, 100);

                  return (
                    <div key={factor.feature} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span className="text-slate-600 dark:text-slate-350">{featureNames[factor.feature]} ({val})</span>
                        <span className={isPositive ? 'text-rose-500' : 'text-emerald-500'}>
                          {isPositive ? '+' : ''}{rawImpact}
                        </span>
                      </div>
                      
                      {/* Bidirectional bar */}
                      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden flex">
                        {/* Left half: Negative impact (green) */}
                        <div className="w-1/2 h-full flex justify-end">
                          {!isPositive && (
                            <div className="h-full bg-emerald-500 rounded-l" style={{ width: `${percentWidth}%` }} />
                          )}
                        </div>
                        {/* Divider */}
                        <div className="w-0.5 h-full bg-slate-300 dark:bg-slate-650" />
                        {/* Right half: Positive impact (red) */}
                        <div className="w-1/2 h-full">
                          {isPositive && (
                            <div className="h-full bg-rose-500 rounded-r" style={{ width: `${percentWidth}%` }} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hypertension Factors */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-center md:text-left">
                Hypertension Impact Factors
              </h4>
              <div className="space-y-3">
                {explainability.hypertension_factors.slice(0, 5).map((factor) => {
                  const val = inputs[factor.feature];
                  const rawImpact = factor.impact;
                  const isPositive = rawImpact > 0.0;
                  const absImpact = Math.abs(rawImpact);
                  const percentWidth = Math.min(absImpact * 200, 100);

                  return (
                    <div key={factor.feature} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span className="text-slate-600 dark:text-slate-350">{featureNames[factor.feature]} ({val})</span>
                        <span className={isPositive ? 'text-rose-500' : 'text-emerald-500'}>
                          {isPositive ? '+' : ''}{rawImpact}
                        </span>
                      </div>
                      
                      {/* Bidirectional bar */}
                      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden flex">
                        {/* Left half */}
                        <div className="w-1/2 h-full flex justify-end">
                          {!isPositive && (
                            <div className="h-full bg-emerald-500 rounded-l" style={{ width: `${percentWidth}%` }} />
                          )}
                        </div>
                        {/* Divider */}
                        <div className="w-0.5 h-full bg-slate-300 dark:bg-slate-650" />
                        {/* Right half */}
                        <div className="w-1/2 h-full">
                          {isPositive && (
                            <div className="h-full bg-rose-500 rounded-r" style={{ width: `${percentWidth}%` }} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Clinical Disclaimer & Quick Actions */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/60 flex flex-wrap md:flex-nowrap items-center justify-between gap-6">
          <div className="space-y-1 text-slate-500 dark:text-slate-400 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider block text-slate-450">Clinical Disclaimer</span>
            <p className="text-[10px] leading-relaxed">
              This assessment is an analytical screening utilizing statistical machine learning models. It does not replace formal clinical consultation, blood work testing (like HbA1c), or diagnosis by a licensed medical practitioner.
            </p>
          </div>
          
          <div className="no-print w-full md:w-auto shrink-0">
            <Link
              to="/recommendations"
              className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-gradient-to-r from-tealhealth-600 to-indigo-600 hover:from-tealhealth-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-2xl shadow-md transition-all hover:scale-[1.02]"
            >
              <span>Personalized Advisory</span>
              <ArrowRight className="h-4 w-4 animate-bounce" />
            </Link>
          </div>
        </div>

      </div>
      
    </div>
  );
}
