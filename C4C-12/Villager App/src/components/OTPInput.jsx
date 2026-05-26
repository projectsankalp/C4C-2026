/**
 * src/components/OTPInput.jsx
 * A 6-box input component for entering 6-digit OTP verification codes.
 * Implements auto-focus forward and backward deletion.
 */

import React, { useRef, useEffect } from 'react';

export default function OTPInput({ length = 6, value = [], onChange, hasError }) {
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return; // Allow numbers only

    const newValue = [...value];
    // Take only the last entered character if multiple (from autocomplete etc.)
    newValue[index] = val.substring(val.length - 1);
    onChange(newValue);

    // Auto-focus next input
    if (val && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      // If current field is empty, move focus to previous and clear it
      if (!value[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
        const newValue = [...value];
        newValue[index - 1] = '';
        onChange(newValue);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, length);
    if (pastedData.length === 0) return;

    const newValue = [...value];
    for (let i = 0; i < length; i++) {
      newValue[i] = pastedData[i] || '';
    }
    onChange(newValue);

    // Focus last filled box
    const focusIndex = Math.min(pastedData.length, length - 1);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  return (
    <div className={`otp-inputs-grid ${hasError ? 'shake-error' : ''}`}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[idx] || ''}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          className={`otp-digit-box ${value[idx] ? 'filled' : ''} ${hasError ? 'error-border' : ''}`}
          autoComplete="off"
        />
      ))}
    </div>
  );
}
