import { useState } from 'react';

const INITIAL = {
  patientId: null,

  patient: {},

  vitals: {
    systolic: '',
    diastolic: '',
    weight: '',
    height: '',
    waist: ''
  },

  symptoms: {
    urination: false,
    thirst: false,
    vision: false,
    headache: false,
    fatigue: false,
    numbness: false
  },

  riskFactors: {
    familyDiabetes: false,
    familyBP: false,
    smoking: 'no',
    alcohol: false,
    exercise: 'moderate',
    stress: 'low'
  },

  ayurvedic: {
    bodyHeat: false,
    digestiveIssues: false,
    fatigue: false,
    sleepDisturbances: false,
    frequentThirst: false,
    skinDryness: false,
    urinaryAbnormalities: false
  },

  pregnancy: {
    isPregnant: false,
    gestationalHistory: false
  }
};

export function useScreening() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(INITIAL);

  const update = (section, values) => setData(prev => ({
    ...prev,
    [section]: { ...prev[section], ...values }
  }));

  const reset = () => { setStep(1); setData(INITIAL); };
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return { step, data, update, reset, nextStep, prevStep, setData };
}
