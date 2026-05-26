/**
 * @file useOTP.js
 * @description Hook to manage simulated 6-digit OTP codes, timer countdowns, error states, and Firestore log sync.
 */

import { useState, useEffect, useRef } from "react";
import { saveOtpLog, verifyOtpInDb, incrementOtpAttempts } from "../firebase/firestore";

export const useOTP = () => {
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const timerRef = useRef(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldown]);

  /**
   * Generates a 6-digit OTP, saves it in state and Firestore, and starts the countdown.
   * @param {string} uid - Firebase Auth user uid
   */
  const triggerOtp = async (uid) => {
    if (cooldown > 0) return;

    setLoading(true);
    setError("");
    try {
      // Generate a random 6 digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setAttempts(0);
      setSuccess(false);

      // Write OTP log to Firestore (simulating SMS gateway callback)
      if (uid) {
        await saveOtpLog(uid, code);
      }

      setCooldown(30);
    } catch (err) {
      console.error("Failed to trigger OTP simulation:", err);
      setError("Failed to initiate OTP simulation. Please check database connection.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verifies the entered OTP code.
   * @param {string} uid - Firebase Auth user uid
   * @param {string} enteredOtp - 6-digit input from user
   * @returns {Promise<boolean>} - True if verification succeeds
   */
  const verifyOtp = async (uid, enteredOtp) => {
    setLoading(true);
    setError("");
    try {
      if (enteredOtp === generatedOtp) {
        // Mark verified in database
        if (uid) {
          await verifyOtpInDb(uid);
        }
        setSuccess(true);
        setGeneratedOtp(""); // clear code
        return true;
      } else {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        if (uid) {
          await incrementOtpAttempts(uid, attempts);
        }
        setError("Incorrect OTP code. Please check and try again.");
        return false;
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError("An error occurred during verification. Try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearOtpError = () => {
    setError("");
  };

  return {
    generatedOtp,
    cooldown,
    loading,
    error,
    success,
    attempts,
    triggerOtp,
    verifyOtp,
    clearOtpError
  };
};

export default useOTP;
