import React, { useState } from "react";
import { api } from "../services/api";

export default function AuthModal({ onAuthSuccess, onClose }) {
  const [step, setStep] = useState(1); // 1: Enter Phone, 2: Enter OTP, 3: Register Details
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Registration States
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [language, setLanguage] = useState("English");
  const [bpChecked, setBpChecked] = useState(false);
  const [bpValue, setBpValue] = useState("");
  const [familyHistory, setFamilyHistory] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      setError("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.auth.sendOtp(phone);
      if (res.success) {
        setStep(2);
      } else {
        setError(res.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error connecting to backend");
      // Fallback in case of absolute offline backend
      console.log("Using local offline mode for demo");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError("Please enter the verification code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.auth.verifyOtp(phone, otp);
      if (res.success) {
        // If user profile is already fully registered, complete auth
        if (res.user && res.user.name) {
          onAuthSuccess(res.user);
        } else {
          // If brand new user, proceed to registration form
          setStep(3);
        }
      } else {
        setError(res.message || "Invalid code");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid verification code");
      // For local development sandbox bypass
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !age || !height || !weight) {
      setError("Please fill out all metric fields");
      return;
    }
    setLoading(true);
    setError("");
    const payload = {
      name,
      phone,
      age: parseInt(age),
      gender,
      height: parseFloat(height),
      weight: parseFloat(weight),
      language,
      bpChecked,
      bpValue: bpChecked ? bpValue : "Normal",
      familyHistory
    };

    try {
      const res = await api.auth.register(payload);
      if (res.success) {
        // Successful register: save user local storage and notify parent
        localStorage.setItem("arogya_user_id", res.user._id);
        onAuthSuccess(res.user);
      } else {
        setError(res.message || "Registration failed");
      }
    } catch (err) {
      // Local demo fallback
      const mockUser = {
        _id: "demo_user_id_123",
        ...payload
      };
      localStorage.setItem("arogya_user_id", mockUser._id);
      onAuthSuccess(mockUser);
    } finally {
      setLoading(false);
    }
  };

  const handleBypass = () => {
    // Quick guest bypass for evaluations
    const guestUser = {
      _id: "6650db81f6236bbdcd3a91b4", // Mongo Object ID format
      name: "Saanvi Shetty",
      phone: "+91 98765 43210",
      age: 26,
      gender: "Female",
      height: 162,
      weight: 56,
      language: "English",
      bpChecked: true,
      bpValue: "135/85",
      familyHistory: true
    };
    localStorage.setItem("arogya_token", "demo_token_xyz");
    localStorage.setItem("arogya_user_id", guestUser._id);
    onAuthSuccess(guestUser);
  };

  return (
    <div className="auth-glass-overlay">
      <div className="auth-sliding-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h2 style={{ marginBottom: 0 }}>Onboarding</h2>
          <button 
            onClick={onClose} 
            style={{ 
              background: "none", 
              border: "none", 
              color: "var(--text-muted)", 
              fontSize: "20px", 
              cursor: "pointer" 
            }}
          >
            &times;
          </button>
        </div>

        {error && (
          <div 
            style={{ 
              backgroundColor: "var(--accent-red-bg)", 
              color: "var(--accent-red)", 
              padding: "10px 14px", 
              borderRadius: "8px", 
              fontSize: "12px", 
              fontWeight: "600", 
              marginBottom: "16px",
              border: "1px solid rgba(239, 68, 68, 0.15)"
            }}
          >
            {error}
          </div>
        )}

        {/* STEP 1: Enter Phone Number */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <p className="auth-card-subtitle">
              Verify your mobile number to load health summaries, book consultation calls, and sync diagnostic history.
            </p>
            <div className="auth-form-group">
              <label className="auth-form-label">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="auth-form-input"
                required
              />
            </div>
            
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginBottom: "12px" }}>
              {loading ? <span className="spinner" style={{ width: "16px", height: "16px" }}></span> : "Request One-Time PIN"}
            </button>

            <button type="button" className="btn-secondary" onClick={handleBypass} style={{ borderStyle: "dashed" }}>
              Bypass / Log in as Guest Demo
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <p className="auth-card-subtitle">
              A 6-digit code has been simulated for your local development and logged to the node server console.
            </p>

            <div 
              style={{ 
                backgroundColor: "var(--primary-light)", 
                padding: "10px 14px", 
                borderRadius: "8px", 
                fontSize: "12px", 
                color: "var(--primary)", 
                fontWeight: "600", 
                marginBottom: "16px",
                textAlign: "center"
              }}
            >
              💡 <strong>Demo Helper:</strong> Enter <strong>any 6 digits</strong> to bypass (e.g. 123456).
            </div>

            <div className="auth-form-group">
              <label className="auth-form-label">Enter 6-Digit PIN</label>
              <input
                type="text"
                maxLength="6"
                placeholder="XXXXXX"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="auth-form-input"
                style={{ textAlign: "center", fontSize: "20px", letterSpacing: "8px", fontWeight: "700" }}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginBottom: "12px" }}>
              {loading ? <span className="spinner" style={{ width: "16px", height: "16px" }}></span> : "Verify Security PIN"}
            </button>
            
            <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
              Change Phone Number
            </button>
          </form>
        )}

        {/* STEP 3: Complete Metrics Registry */}
        {step === 3 && (
          <form onSubmit={handleRegister}>
            <p className="auth-card-subtitle">
              Complete your health profile to enable ML-powered cardiovascular and diabetes risk screening.
            </p>
            
            <div className="auth-form-group">
              <label className="auth-form-label">Full Name</label>
              <input
                type="text"
                placeholder="Enter patient name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-form-input"
                required
              />
            </div>

            <div className="auth-form-row">
              <div className="auth-form-group">
                <label className="auth-form-label">Age (Years)</label>
                <input
                  type="number"
                  placeholder="e.g. 26"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="auth-form-input"
                  required
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-form-label">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="auth-form-input"
                  style={{ appearance: "auto" }}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="auth-form-row">
              <div className="auth-form-group">
                <label className="auth-form-label">Height (cm)</label>
                <input
                  type="number"
                  placeholder="e.g. 165"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="auth-form-input"
                  required
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-form-label">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="e.g. 62"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="auth-form-input"
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-form-label">Preferred Communication Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="auth-form-input"
                style={{ appearance: "auto" }}
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Kannada</option>
              </select>
            </div>

            <div className="auth-form-group" style={{ display: "flex", gap: "10px", alignItems: "center", margin: "20px 0" }}>
              <input
                type="checkbox"
                id="bpChecked"
                checked={bpChecked}
                onChange={(e) => setBpChecked(e.target.checked)}
                style={{ width: "20px", height: "20px", accentColor: "var(--primary)" }}
              />
              <label htmlFor="bpChecked" style={{ fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                Do you know your Blood Pressure values?
              </label>
            </div>

            {bpChecked && (
              <div className="auth-form-group">
                <label className="auth-form-label">Latest Blood Pressure (e.g., 120/80)</label>
                <input
                  type="text"
                  placeholder="Systolic/Diastolic (e.g. 135/85)"
                  value={bpValue}
                  onChange={(e) => setBpValue(e.target.value)}
                  className="auth-form-input"
                />
              </div>
            )}

            <div className="auth-form-group" style={{ display: "flex", gap: "10px", alignItems: "center", margin: "20px 0" }}>
              <input
                type="checkbox"
                id="familyHistory"
                checked={familyHistory}
                onChange={(e) => setFamilyHistory(e.target.checked)}
                style={{ width: "20px", height: "20px", accentColor: "var(--primary)" }}
              />
              <label htmlFor="familyHistory" style={{ fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                Family history of Diabetes / Hypertension?
              </label>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: "16px", height: "16px" }}></span> : "Complete Patient Onboarding"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
