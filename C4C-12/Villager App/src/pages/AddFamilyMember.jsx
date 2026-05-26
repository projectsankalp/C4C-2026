/**
 * src/pages/AddFamilyMember.jsx
 * Screen for linking another family member's Health ID.
 * Follows the same UID and simulated OTP verification sequence before saving.
 */

import React, { useState, useRef, useEffect, useContext } from 'react';
import { ArrowLeft, UserPlus, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';
import { validateLuhn } from '../utils/uidValidator';
import { checkPatientUID, generateSimulatedOTP } from '../firebase/auth';
import OTPInput from '../components/OTPInput';
import { PatientContext } from '../context/PatientContext';

export default function AddFamilyMember({ onBack }) {
  const { t } = useLanguage();
  const { linkFamily } = useContext(PatientContext);

  // Linking wizard states: 'RELATION' -> 'UID' -> 'OTP' -> 'SUCCESS'
  const [step, setStep] = useState('RELATION');
  const [relation, setRelation] = useState('Spouse');
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [targetPatient, setTargetPatient] = useState(null);

  // OTP states
  const [otpValues, setOtpValues] = useState(Array(6).fill(''));
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [hasOtpError, setHasOtpError] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (step === 'UID' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  const handleRelationSubmit = (e) => {
    e.preventDefault();
    setStep('UID');
  };

  const handleUidChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newDigits = [...digits];
    newDigits[index] = val.substring(val.length - 1);
    setDigits(newDigits);
    setErrorMsg('');

    if (val && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleUidKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        setErrorMsg('');
      }
    }
  };

  const handleUidPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    if (pastedData.length === 0) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setDigits(newDigits);
    setErrorMsg('');

    const focusIndex = Math.min(pastedData.length, 5);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  const uidStr = digits.join('');
  const isUidComplete = uidStr.length === 6;

  const handleUidSubmit = async (e) => {
    e.preventDefault();
    if (!isUidComplete) return;

    // Validate checksum
    if (!validateLuhn(uidStr)) {
      setErrorMsg(t('login.invalidHealthId'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Fetch patient record
    const result = await checkPatientUID(uidStr);
    setLoading(false);

    if (!result) {
      setErrorMsg('This Health ID is not registered in our system.');
      return;
    }

    setTargetPatient(result);
    // Generate simulated OTP
    const code = generateSimulatedOTP();
    setGeneratedOTP(code);
    setOtpValues(Array(6).fill(''));
    setHasOtpError(false);
    setStep('OTP');
  };

  const handleOtpChange = (newValues) => {
    setOtpValues(newValues);
    setHasOtpError(false);

    const code = newValues.join('');
    if (code.length === 6) {
      if (code === generatedOTP) {
        completeLinking();
      } else {
        setHasOtpError(true);
        setTimeout(() => {
          setOtpValues(Array(6).fill(''));
        }, 800);
      }
    }
  };

  const completeLinking = async () => {
    setLoading(true);
    const success = await linkFamily(targetPatient.uid, relation);
    setLoading(false);
    if (success) {
      setStep('SUCCESS');
    } else {
      setErrorMsg('Failed to link family member. Please try again.');
      setStep('UID');
    }
  };

  const getRelationOptions = () => {
    const list = ['Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Other'];
    // Translate relations roughly or keep standard english relation tags
    return list;
  };

  return (
    <div className="page-container add-family-page animate-slide-in">
      <div className="page-header-nav">
        <button 
          className="btn-icon back-btn" 
          onClick={step === 'UID' ? () => setStep('RELATION') : onBack} 
          disabled={step === 'SUCCESS'}
          aria-label={t('common.goBack')}
        >
          <ArrowLeft size={24} className="text-teal" />
        </button>
      </div>

      <div className="add-family-main scrollbar-none">
        
        {step === 'RELATION' && (
          <form onSubmit={handleRelationSubmit} className="relation-selection-form animate-scale-in">
            <div className="form-info-section">
              <UserPlus size={48} className="text-teal animate-float" style={{ margin: '0 auto 16px' }} />
              <h2 className="page-title">{t('addFamily.title')}</h2>
              <p className="page-subtitle">Select relationship of this family member.</p>
            </div>

            <div className="relation-grid-choices">
              {getRelationOptions().map((opt) => {
                const isSelected = relation === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setRelation(opt)}
                    className={`relation-choice-btn ${isSelected ? 'selected' : ''}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <button type="submit" className="btn-primary start-uid-btn">
              {t('common.continue')}
            </button>
          </form>
        )}

        {step === 'UID' && (
          <form onSubmit={handleUidSubmit} className="family-uid-form animate-scale-in">
            <div className="form-info-section">
              <h2 className="page-title">{t('addFamily.enterUid')}</h2>
              <p className="page-subtitle">{t('addFamily.explain')}</p>
            </div>

            {loading ? (
              <div className="mini-loader-box">
                <div className="teal-spinner animate-spin-slow"></div>
                <p>{t('login.checkingRecord')}</p>
              </div>
            ) : (
              <>
                <div className="uid-inputs-grid">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digits[idx] || ''}
                      onChange={(e) => handleUidChange(e, idx)}
                      onKeyDown={(e) => handleUidKeyDown(e, idx)}
                      onPaste={handleUidPaste}
                      className={`uid-digit-box ${digits[idx] ? 'filled' : ''} ${errorMsg ? 'error-border' : ''}`}
                      autoComplete="off"
                    />
                  ))}
                </div>

                {errorMsg && (
                  <div className="error-alert-box animate-scale-in">
                    <AlertCircle size={20} className="text-red" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary family-uid-submit"
                  disabled={!isUidComplete}
                >
                  {t('common.continue')}
                </button>
              </>
            )}
          </form>
        )}

        {step === 'OTP' && targetPatient && (
          <div className="family-otp-form animate-scale-in">
            <div className="form-info-section">
              <h2 className="page-title">{t('otp.title')}</h2>
              <p className="page-subtitle">
                Enter simulated OTP code generated for <strong>{targetPatient.name}</strong>.
              </p>
            </div>

            {/* Sim Helper Overlay */}
            <div className="otp-simulation-helper glass-panel animate-scale-in">
              <span className="sim-helper-title">Testing Simulation Key</span>
              <p className="sim-helper-code">{generatedOTP}</p>
            </div>

            <OTPInput
              length={6}
              value={otpValues}
              onChange={handleOtpChange}
              hasError={hasOtpError}
            />

            {hasOtpError && (
              <p className="otp-error-msg animate-bounce-spring">
                {t('otp.wrongOtp')}!
              </p>
            )}
          </div>
        )}

        {step === 'SUCCESS' && targetPatient && (
          <div className="family-link-success-view glass-panel animate-scale-in">
            <CheckCircle size={64} className="text-success animate-float" style={{ margin: '0 auto 20px' }} />
            <h2 className="success-title">Link Successful!</h2>
            <p className="success-desc">
              <strong>{targetPatient.name}</strong> has been linked as your <strong>{relation}</strong>.
            </p>
            <button className="btn-primary success-ok-btn" onClick={onBack}>
              Finish
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
