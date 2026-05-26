import React, { useState, useEffect } from 'react';
import { Scale, Calculator } from 'lucide-react';

export default function BMIWidget({ initialBmi = 22.0, onBmiChange }) {
  const [unitSystem, setUnitSystem] = useState('metric'); // 'metric' or 'imperial'
  
  // Metric Inputs
  const [weightKg, setWeightKg] = useState('70');
  const [heightCm, setHeightCm] = useState('175');

  // Imperial Inputs
  const [weightLbs, setWeightLbs] = useState('154');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('9');

  const [bmi, setBmi] = useState(initialBmi);

  // Recalculate BMI whenever inputs change
  useEffect(() => {
    let computedBmi = 22.0;

    if (unitSystem === 'metric') {
      const w = parseFloat(weightKg);
      const h = parseFloat(heightCm) / 100; // convert cm to meters
      if (w > 0 && h > 0) {
        computedBmi = w / (h * h);
      }
    } else {
      const w = parseFloat(weightLbs);
      const ft = parseFloat(heightFt) || 0;
      const inch = parseFloat(heightIn) || 0;
      const totalInches = (ft * 12) + inch;
      if (w > 0 && totalInches > 0) {
        computedBmi = (w / (totalInches * totalInches)) * 703;
      }
    }

    if (!isNaN(computedBmi) && computedBmi > 5 && computedBmi < 100) {
      const roundedBmi = parseFloat(computedBmi.toFixed(1));
      setBmi(roundedBmi);
      if (onBmiChange) {
        onBmiChange(roundedBmi);
      }
    }
  }, [weightKg, heightCm, weightLbs, heightFt, heightIn, unitSystem]);

  const getBmiCategory = (score) => {
    if (score < 18.5) return { label: 'Underweight', color: 'text-sky-500 bg-sky-500/10 border-sky-400/30', barColor: 'bg-sky-500' };
    if (score < 25.0) return { label: 'Normal', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-400/30', barColor: 'bg-emerald-500' };
    if (score < 30.0) return { label: 'Overweight', color: 'text-amber-500 bg-amber-500/10 border-amber-400/30', barColor: 'bg-amber-500' };
    return { label: 'Obese', color: 'text-rose-500 bg-rose-500/10 border-rose-400/30', barColor: 'bg-rose-500' };
  };

  const category = getBmiCategory(bmi);
  const needlePosition = Math.min(Math.max(((bmi - 15) / (35 - 15)) * 100, 0), 100); // map bmi 15-35 to percentage 0-100

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-tealhealth-500" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">BMI Calculator</h3>
        </div>
        
        {/* Unit Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-850 p-1 rounded-xl border border-slate-200/30 dark:border-slate-800/50">
          <button
            type="button"
            onClick={() => setUnitSystem('metric')}
            className={`text-xs font-semibold py-1.5 px-3 rounded-lg transition-all ${
              unitSystem === 'metric'
                ? 'bg-white dark:bg-slate-700 text-tealhealth-600 dark:text-tealhealth-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Metric
          </button>
          <button
            type="button"
            onClick={() => setUnitSystem('imperial')}
            className={`text-xs font-semibold py-1.5 px-3 rounded-lg transition-all ${
              unitSystem === 'imperial'
                ? 'bg-white dark:bg-slate-700 text-tealhealth-600 dark:text-tealhealth-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Imperial
          </button>
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {unitSystem === 'metric' ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="e.g. 175"
                min="100"
                max="250"
                className="w-full text-sm py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-tealhealth-500 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Weight (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="e.g. 70"
                min="30"
                max="250"
                className="w-full text-sm py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-tealhealth-500 dark:text-slate-200"
              />
            </div>
          </>
        ) : (
          <>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Height (ft & in)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value)}
                  placeholder="ft"
                  min="3"
                  max="8"
                  className="w-1/2 text-sm py-2 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-tealhealth-500 dark:text-slate-200"
                />
                <input
                  type="number"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                  placeholder="in"
                  min="0"
                  max="11"
                  className="w-1/2 text-sm py-2 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-tealhealth-500 dark:text-slate-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Weight (lbs)</label>
              <input
                type="number"
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                placeholder="e.g. 154"
                min="50"
                max="500"
                className="w-full text-sm py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-tealhealth-500 dark:text-slate-200"
              />
            </div>
          </>
        )}
      </div>

      {/* Output Display */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Calculated BMI</span>
          <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{bmi}</span>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-1">Classification</span>
          <span className={`text-xs font-bold py-1 px-3 border rounded-full ${category.color}`}>
            {category.label}
          </span>
        </div>
      </div>

      {/* Visual Needle / Progress Bar Indicator */}
      <div className="mt-4 pt-1">
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full relative overflow-hidden flex">
          <div className="w-[17.5%] h-full bg-sky-500" /> {/* Underweight: <18.5 */}
          <div className="w-[32.5%] h-full bg-emerald-500" /> {/* Normal: 18.5 - 25 */}
          <div className="w-[25%] h-full bg-amber-500" /> {/* Overweight: 25 - 30 */}
          <div className="w-[25%] h-full bg-rose-500" /> {/* Obese: >=30 */}
        </div>
        <div className="w-full relative h-4 mt-1.5">
          {/* Needle */}
          <div
            className="absolute -top-1 w-2.5 h-2.5 bg-slate-700 dark:bg-slate-300 border border-white dark:border-slate-900 rounded-full shadow-md -translate-x-1/2 transition-all duration-300"
            style={{ left: `${needlePosition}%` }}
          />
          <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-1 px-1">
            <span>15 (Under)</span>
            <span>18.5</span>
            <span>25.0</span>
            <span>30.0</span>
            <span>35+ (Obese)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
