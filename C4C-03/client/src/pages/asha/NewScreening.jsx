import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import OfflineBanner from '../../components/shared/OfflineBanner';

import StepIndicator from '../../components/screening/StepIndicator';
import Step1PatientInfo from '../../components/screening/Step1PatientInfo';
import Step2Vitals from '../../components/screening/Step2Vitals';
import Step3Symptoms from '../../components/screening/Step3Symptoms';
import Step4RiskFactors from '../../components/screening/Step4RiskFactors';
import Step5Ayurveda from '../../components/screening/Step5Ayurveda';
import Step5Pregnancy from '../../components/screening/Step5Pregnancy';

import { useScreening } from '../../hooks/useScreening';
import { useOffline } from '../../hooks/useOffline';

import { createPatient } from '../../services/patientService';
import { createScreening } from '../../services/screeningService';

import { saveOfflineScreening } from '../../utils/offlineStorage';
import { calculateBMI } from '../../utils/calculateBMI';

export default function NewScreening() {
  const navigate = useNavigate();
  const isOffline = useOffline();

  const { step, data, update, nextStep, prevStep } = useScreening();

  const [createdPatient, setCreatedPatient] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // =========================
  // CREATE PATIENT
  // =========================
  const handleCreatePatient = async () => {
    const { name, age, gender, village, phone, aadhaar } = data.patient;

    if (!name || !age || !gender || !village) {
      setError('Please fill in Name, Age, Gender, and Village');
      return;
    }

    setError('');

    try {
      const res = await createPatient({
        name,
        age: Number(age),
        gender,
        village,
        phone,
        aadhaar,
      });

      setCreatedPatient(res.data);
      nextStep();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to register patient'
      );
    }
  };

  // =========================
  // SUBMIT SCREENING
  // =========================
  const handleSubmit = async () => {
    if (!createdPatient) {
      setError('Please register the patient first');
      return;
    }

    setSubmitting(true);
    setError('');

    const bmi = calculateBMI(
      data.vitals.weight,
      data.vitals.height
    );

    const payload = {
      patientId: createdPatient._id,

      vitals: {
        ...data.vitals,
        bmi,
        systolic: Number(data.vitals.systolic),
        diastolic: Number(data.vitals.diastolic),
        weight: Number(data.vitals.weight),
        height: Number(data.vitals.height),
        waist: Number(data.vitals.waist),
      },

      symptoms: data.symptoms,
      riskFactors: data.riskFactors,
      ayurvedic: data.ayurvedic,
      pregnancy: data.pregnancy,
    };

    try {
      // OFFLINE MODE
      if (isOffline) {
        await saveOfflineScreening({
          data: payload,
          patient: createdPatient,
        });

        navigate('/asha/result', {
          state: {
            offline: true,
            patient: createdPatient,
          },
        });
        return;
      }

      // ONLINE MODE
      const res = await createScreening(payload);

      navigate('/asha/result', {
        state: {
          result: res.data.result,
          patient: createdPatient,
          screening: res.data.screening,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Submission failed. Data saved offline.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // RENDER STEP
  // =========================
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1PatientInfo
            data={data.patient}
            onChange={(v) => update('patient', v)}
            onCreatePatient={handleCreatePatient}
            createdPatient={createdPatient}
          />
        );
      case 2:
        return (
          <Step2Vitals
            data={data.vitals}
            onChange={(v) => update('vitals', v)}
          />
        );
      case 3:
        return (
          <Step3Symptoms
            data={data.symptoms}
            onChange={(v) => update('symptoms', v)}
          />
        );
      case 4:
        return (
          <Step4RiskFactors
            data={data.riskFactors}
            onChange={(v) => update('riskFactors', v)}
          />
        );
      case 5:
        return (
          <Step5Ayurveda
            data={data.ayurvedic}
            onChange={(v) => update('ayurvedic', v)}
          />
        );
      case 6:
        return (
          <Step5Pregnancy
            data={data.pregnancy}
            onChange={(v) => update('pregnancy', v)}
            gender={data.patient.gender}
          />
        );
      default:
        return null;
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-800">
      <OfflineBanner />
      <Navbar />

      <main className="max-w-2xl mx-auto p-4 md:p-6 mt-2">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('/asha')} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 active:scale-95 transition-all shadow-sm shrink-0"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            New Screening
          </h1>
        </div>

        {/* STEP INDICATOR */}
        <div className="mb-6">
          <StepIndicator current={step} />
        </div>

        {/* STEP CONTENT CONTAINER */}
        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 shadow-sm border border-slate-100 mb-6 transition-all duration-300 relative">
          {renderStep()}

          {/* Enhanced Error Toast */}
          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4">
              <span className="text-red-500 text-lg leading-none mt-0.5">⚠️</span>
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 py-3.5 px-4 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 active:scale-[0.98] transition-all"
            >
              ← Back
            </button>
          )}

          {step > 1 && step < 6 && (
            <button
              onClick={nextStep}
              className="flex-[2] py-3.5 px-4 bg-blue-600 text-white font-bold rounded-2xl shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all"
            >
              Next Step →
            </button>
          )}

          {step === 6 && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`flex-[2] py-3.5 px-4 font-bold rounded-2xl shadow-sm transition-all ${
                submitting 
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]'
              }`}
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white/70" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                '✅ Submit & Get Score'
              )}
            </button>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}