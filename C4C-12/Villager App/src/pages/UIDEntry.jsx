/**
 * src/pages/UIDEntry.jsx
 * Health ID entry screen.
 * Implements 6 individual inputs for the Health ID digits and performs
 * real-time Luhn checksum validation upon completion.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ShieldAlert, ArrowLeft } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';
import { validateLuhn } from '../utils/uidValidator';

export default function UIDEntry({ onUIDSubmit, onBack }) {
  const { t } = useLanguage();
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [errorMsg, setErrorMsg] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first box on render
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return; // Allow numeric values only

    const newDigits = [...digits];
    newDigits[index] = val.substring(val.length - 1);
    setDigits(newDigits);
    setErrorMsg('');
    setIsValidated(false);

    // Auto-focus next input field
    if (val && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        setErrorMsg('');
        setIsValidated(false);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    if (pastedData.length === 0) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setDigits(newDigits);
    setErrorMsg('');
    setIsValidated(false);

    // Focus last filled box
    const focusIndex = Math.min(pastedData.length, 5);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  // Check if digits are fully entered
  const uidStr = digits.join('');
  const isComplete = uidStr.length === 6;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isComplete) return;

    // Validate Luhn Checksum
    const valid = validateLuhn(uidStr);
    if (!valid) {
      setErrorMsg(t('login.invalidHealthId'));
      setIsValidated(false);
      return;
    }

    setIsValidated(true);
    onUIDSubmit(uidStr);
  };

  return (
    <div className="page-container uid-entry-page animate-slide-in">
      <div className="page-header-nav">
        <button className="btn-icon back-btn" onClick={onBack} aria-label={t('common.goBack')}>
          <ArrowLeft size={24} className="text-teal" />
        </button>
      </div>

      <div className="uid-entry-main">
        <div className="form-info-section">
          <h2 className="login-headline">{t('login.headline')}</h2>
          <p className="login-subheadline">{t('login.subheadline')}</p>
        </div>

        <form onSubmit={handleSubmit} className="uid-input-form">
          <div className="uid-grid-wrapper">
            <div className={`uid-inputs-grid ${errorMsg ? 'shake-error' : ''}`}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digits[idx] || ''}
                  onChange={(e) => handleChange(e, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  onPaste={handlePaste}
                  className={`uid-digit-box ${digits[idx] ? 'filled' : ''} ${errorMsg ? 'error-border' : ''}`}
                  autoComplete="off"
                />
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="error-alert-box animate-scale-in">
              <ShieldAlert size={20} className="text-red" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary uid-submit-btn"
            disabled={!isComplete}
          >
            <span>{t('common.continue')}</span>
            <ChevronRight size={20} />
          </button>
        </form>
      </div>

      <div className="uid-footer-decor">
        <span className="decor-dots"></span>
      </div>
    </div>
  );
}
