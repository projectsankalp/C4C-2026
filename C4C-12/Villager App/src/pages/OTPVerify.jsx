/**
 * src/pages/OTPVerify.jsx
 * OTP Verification screen (Simulation Mode).
 * Displays a 6-digit OTP code input grid, resend timer, and simulation helpers.
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, ArrowLeft, KeyRound } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';
import OTPInput from '../components/OTPInput';
import { generateSimulatedOTP } from '../firebase/auth';

export default function OTPVerify({ patient, onVerifySuccess, onBack }) {
  const { t } = useLanguage();
  const [otpValues, setOtpValues] = useState(Array(6).fill(''));
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [hasError, setHasError] = useState(false);

  // Get last 3 digits of patient phone or default to '123'
  const patientPhoneLast3 = patient.phone 
    ? patient.phone.substring(patient.phone.length - 3) 
    : '123';

  // Initialize and generate OTP on mount
  useEffect(() => {
    triggerNewOTP();
  }, []);

  // Handle resend countdown
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const triggerNewOTP = () => {
    const code = generateSimulatedOTP();
    setGeneratedOTP(code);
    setCountdown(30);
    setOtpValues(Array(6).fill(''));
    setHasError(false);
  };

  const handleOTPChange = (newValues) => {
    setOtpValues(newValues);
    setHasError(false);

    // If OTP is fully entered, trigger verification automatically
    const codeEntered = newValues.join('');
    if (codeEntered.length === 6) {
      verifyCode(codeEntered);
    }
  };

  const verifyCode = (code) => {
    if (code === generatedOTP) {
      onVerifySuccess(patient);
    } else {
      setHasError(true);
      // Reset code input on error
      setTimeout(() => {
        setOtpValues(Array(6).fill(''));
      }, 800);
    }
  };

  return (
    <div className="page-container otp-verify-page animate-slide-in">
      <div className="page-header-nav">
        <button className="btn-icon back-btn" onClick={onBack} aria-label={t('common.goBack')}>
          <ArrowLeft size={24} className="text-teal" />
        </button>
      </div>

      <div className="otp-verify-main">
        <div className="form-info-section">
          <h2 className="login-headline">{t('otp.title')}</h2>
          <p className="login-subheadline">
            {t('otp.sentTo', { phone: patientPhoneLast3 })}
          </p>
        </div>

        {/* SIMULATED OTP CODE CONTAINER (Visible for testing) */}
        <div className="otp-simulation-helper glass-panel animate-scale-in">
          <div className="sim-helper-header">
            <KeyRound size={18} className="text-teal animate-float" />
            <span className="sim-helper-title">Testing Simulation Key</span>
          </div>
          <p className="sim-helper-code">{generatedOTP}</p>
          <p className="sim-helper-desc">Enter this code in the boxes below to log in.</p>
        </div>

        <div className="otp-form-box">
          <OTPInput
            length={6}
            value={otpValues}
            onChange={handleOTPChange}
            hasError={hasError}
          />

          {hasError && (
            <p className="otp-error-msg animate-bounce-spring">
              {t('otp.wrongOtp')}!
            </p>
          )}

          <div className="otp-actions">
            {countdown > 0 ? (
              <span className="otp-timer-lbl">
                {t('otp.resendIn', { seconds: countdown })}
              </span>
            ) : (
              <button 
                type="button" 
                onClick={triggerNewOTP}
                className="btn-text resend-btn"
              >
                <RefreshCw size={16} className="resend-icon" />
                <span>{t('otp.resend')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
