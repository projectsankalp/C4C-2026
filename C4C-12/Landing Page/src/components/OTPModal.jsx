/**
 * @file OTPModal.jsx
 * @description Modal displaying a simulated 6-digit OTP verification panel with input shifting, shake effects, and a countdown timer.
 */

import React, { useState, useEffect, useRef } from "react";
import { X, Smartphone, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";

export const OTPModal = ({ isOpen, onClose, userUid, generatedOtp, cooldown, loading, error, success, triggerOtp, verifyOtp, onVerified }) => {
  const [otpValues, setOtpValues] = useState(Array(6).fill(""));
  const [isShaking, setIsShaking] = useState(false);
  const inputRefs = useRef([]);

  // Reset inputs when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setOtpValues(Array(6).fill(""));
      // Focus on first input
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // When error changes, trigger shake animation
  useEffect(() => {
    if (error) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // When successfully verified, execute success callback
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onVerified();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success, onVerified]);

  if (!isOpen) return null;

  const handleChange = (e, index) => {
    const val = e.target.value;
    
    // Allow digits only
    if (/^[0-9]$/.test(val)) {
      const newValues = [...otpValues];
      newValues[index] = val;
      setOtpValues(newValues);
      
      // Auto focus next input
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    } else if (val === "") {
      const newValues = [...otpValues];
      newValues[index] = "";
      setOtpValues(newValues);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otpValues[index] !== "") {
        const newValues = [...otpValues];
        newValues[index] = "";
        setOtpValues(newValues);
      } else if (index > 0) {
        inputRefs.current[index - 1].focus();
        const newValues = [...otpValues];
        newValues[index - 1] = "";
        setOtpValues(newValues);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpValues(digits);
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otpValues.join("");
    if (enteredOtp.length < 6) return;
    
    await verifyOtp(userUid, enteredOtp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        {!success && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {success ? (
          /* Success Screen */
          <div className="flex flex-col items-center text-center py-8">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border-4 border-emerald-50 mb-6 scale-110 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Phone Verified!</h3>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              Your contact number is verified. Directing to approval queue...
            </p>
          </div>
        ) : (
          /* Input Form */
          <div>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-12 w-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center border border-teal-100 mb-4">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Phone Verification</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Enter the 6-digit confirmation code we sent via SMS.
              </p>
            </div>

            {/* Simulation Yellow Banner */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 mb-6 text-xs text-amber-800 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">OTP Simulation</span>
                Your OTP is: <span className="font-mono font-black text-sm bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-amber-900">{generatedOtp || "Generating..."}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Inputs Group */}
              <div className={`flex justify-between gap-2.5 ${isShaking ? "animate-shake" : ""}`}>
                {otpValues.map((value, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength="1"
                    value={value}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    onChange={(e) => handleChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-xl font-bold border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white shadow-inner transition-all"
                  />
                ))}
              </div>

              {/* Error Alert */}
              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-150 p-3.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading || otpValues.some((v) => !v)}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-teal-600/10 flex items-center justify-center space-x-2 text-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify Code</span>
                )}
              </button>
            </form>

            {/* Resend Cooldown Footer */}
            <div className="mt-6 text-center text-xs text-slate-400">
              Didn't receive the OTP?{" "}
              {cooldown > 0 ? (
                <span className="font-semibold text-slate-600">Resend in {cooldown}s</span>
              ) : (
                <button
                  onClick={() => triggerOtp(userUid)}
                  className="font-bold text-teal-600 hover:text-teal-700 hover:underline transition-colors focus:outline-none"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OTPModal;
