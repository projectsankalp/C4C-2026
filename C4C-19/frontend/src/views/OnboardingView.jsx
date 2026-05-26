import React, { useState } from "react";
import { api } from "../services/api";

export default function OnboardingView({ onOnboardingComplete, onOnboardingSkip }) {
  const [screen, setScreen] = useState(1); // 1: Language Select, 2: Basic Info, 3: Enter Phone, 4: Enter OTP
  const [language, setLanguage] = useState("English"); // English, Hindi, Kannada

  // Screen 2 Form States
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male"); // Male, Female, Other
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bpCheckedRecently, setBpCheckedRecently] = useState("No"); // Yes, No
  const [familyHistory, setFamilyHistory] = useState("No"); // Yes, No

  // Screen 3 & 4 OTP States
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Voice Guidance: Web Speech API Synthesis helper
  const speakText = (text, langCode) => {
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    
    // Attempt to match system voices for better quality
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(langCode));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const handleLanguageIntroVoice = () => {
    if (language === "English") {
      speakText(
        "Welcome to Arogya, your voice-guided rural health AI assistant. Please select your language and press continue.",
        "en-US"
      );
    } else if (language === "Hindi") {
      speakText(
        "आरोग्य में आपका स्वागत है, आपकी आवाज़-निर्देशित ग्रामीण स्वास्थ्य एआई सहायक। कृपया अपनी भाषा चुनें और जारी रखें।",
        "hi-IN"
      );
    } else if (language === "Kannada") {
      speakText(
        "ಆರೋಗ್ಯಕ್ಕೆ ಸುಸ್ವಾಗತ, ನಿಮ್ಮ ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ಎಐ ಸಹಾಯಕಿ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಮುಂದುವರಿಯಿರಿ.",
        "kn-IN"
      );
    }
  };

  const handleFormGuidanceVoice = () => {
    if (language === "English") {
      speakText(
        "Please fill out the form with your full name, age, height in centimeters, and weight in kilograms. Let us know if you checked your blood pressure recently, and if there is any family history of diabetes or high blood pressure.",
        "en-US"
      );
    } else if (language === "Hindi") {
      speakText(
        "कृपया अपना पूरा नाम, आयु, सेंटीमीटर में ऊंचाई और किलोग्राम में वजन के साथ फॉर्म भरें। हमें बताएं कि क्या आपने हाल ही में अपने रक्तचाप की जांच की है, और क्या मधुमेह या उच्च रक्तचाप का कोई पारिवारिक इतिहास है।",
        "hi-IN"
      );
    } else if (language === "Kannada") {
      speakText(
        "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು, ವಯಸ್ಸು, ಸೆಂಟಿಮೀಟರ್‌ಗಳಲ್ಲಿನ ಎತ್ತರ ಮತ್ತು ಕಿಲೋಗ್ರಾಂಗಳಲ್ಲಿನ ತೂಕದೊಂದಿಗೆ ಫಾರ್ಮ್ ಅನ್ನು ಭರ್ತಿ ಮಾಡಿ. ನೀವು ಇತ್ತೀಚೆಗೆ ನಿಮ್ಮ ರಕ್ತದೊತ್ತಡವನ್ನು ಪರೀಕ್ಷಿಸಿದ್ದೀರಾ ಮತ್ತು ಮಧುಮೇಹ ಅಥವಾ ಅಧಿಕ ರಕ್ತದೊತ್ತಡದ ಯಾವುದೇ ಕೌಟುಂಬಿಕ ಇತಿಹಾಸವಿದೆಯೇ ಎಂದು ನಮಗೆ ತಿಳಿಸಿ.",
        "kn-IN"
      );
    }
  };

  const handleContinueToInfo = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setScreen(2);
  };

  const handleFormSubmitNext = (e) => {
    e.preventDefault();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setError("");
    
    // Go to OTP Step 1 (Enter Phone Number)
    setScreen(3);
  };

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
        setScreen(4);
      } else {
        setError(res.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Demo server OTP simulated. Proceeding.");
      console.log("Using local offline mode for demo OTP");
      setScreen(4);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndRegister = async (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError("Please enter the verification code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // First verify the security code
      const verifyRes = await api.auth.verifyOtp(phone, otp);
      if (verifyRes.success) {
        // Code verified, proceed to register user with form details
        await registerUserSession();
      } else {
        setError(verifyRes.message || "Invalid security code");
      }
    } catch (err) {
      console.log("Offline bypass: registering mock user");
      // Fallback local registration
      await registerUserSession();
    } finally {
      setLoading(false);
    }
  };

  const registerUserSession = async () => {
    const payload = {
      name: name || "Saanvi Shetty",
      phone: phone || "+91 98765 43210",
      age: parseInt(age) || 26,
      gender,
      height: parseFloat(height) || 162,
      weight: parseFloat(weight) || 56,
      language,
      bpChecked: bpCheckedRecently === "Yes",
      bpValue: bpCheckedRecently === "Yes" ? "120/80" : "Normal",
      familyHistory: familyHistory === "Yes"
    };

    try {
      const res = await api.auth.register(payload);
      if (res.success) {
        localStorage.setItem("arogya_user_id", res.user._id);
        onOnboardingComplete(res.user);
      } else {
        setError(res.message || "Registration failed");
      }
    } catch (err) {
      const mockUser = {
        _id: "demo_user_id_" + Date.now(),
        ...payload
      };
      localStorage.setItem("arogya_user_id", mockUser._id);
      onOnboardingComplete(mockUser);
    }
  };

  const handleSkip = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    onOnboardingSkip(language);
  };

  return (
    <div className="onboarding-container" style={{ flex: 1, overflowY: "auto" }}>
      
      {/* SCREEN 1: Welcome & Language Select */}
      {screen === 1 && (
        <div className="onboarding-welcome-card">
          
          {/* Sprout Icon Visual */}
          <div className="sprout-container">
            <svg viewBox="0 0 100 100" style={{ width: "90px", height: "90px" }}>
              <path d="M20 80 C 35 70, 65 70, 80 80 Z" fill="#8B5A2B" />
              <path d="M50 72 Q 48 45, 52 24" fill="none" stroke="#87A922" strokeWidth="5" strokeLinecap="round" />
              <path d="M51 34 Q 68 25, 78 28 C 76 38, 62 48, 51 40 Z" fill="#9BCF53" />
              <path d="M49 46 Q 30 35, 20 40 C 24 50, 38 56, 49 52 Z" fill="#9BCF53" />
            </svg>
          </div>

          <h2 className="onboarding-title">Welcome to Arogya</h2>
          <p className="onboarding-subtitle">
            Your personal voice-guided rural health AI assistant
          </p>

          {/* Tap for Voice Assistant */}
          <div className="onboarding-voice-banner" onClick={handleLanguageIntroVoice}>
            <div className="onboarding-voice-banner-icon">🎤</div>
            <div>
              <div className="onboarding-voice-banner-title">Tap for Voice Assistant</div>
              <div className="onboarding-voice-banner-sub">AI will read and guide you in your language</div>
            </div>
          </div>

          {/* Languages Cards */}
          <div className="onboarding-lang-list">
            
            {/* English */}
            <div 
              className={`onboarding-lang-card ${language === "English" ? "active" : ""}`}
              onClick={() => setLanguage("English")}
            >
              <div className="onboarding-lang-card-left">
                <span className="onboarding-lang-card-flag">🇬🇧</span>
                <div>
                  <div className="onboarding-lang-card-name">English</div>
                  <div className="onboarding-lang-card-sub">English</div>
                </div>
              </div>
              {language === "English" && <span className="onboarding-lang-card-check">✓</span>}
            </div>

            {/* Hindi */}
            <div 
              className={`onboarding-lang-card ${language === "Hindi" ? "active" : ""}`}
              onClick={() => setLanguage("Hindi")}
            >
              <div className="onboarding-lang-card-left">
                <span className="onboarding-lang-card-flag">🇮🇳</span>
                <div>
                  <div className="onboarding-lang-card-name">Hindi</div>
                  <div className="onboarding-lang-card-sub">हिंदी</div>
                </div>
              </div>
              {language === "Hindi" && <span className="onboarding-lang-card-check">✓</span>}
            </div>

            {/* Kannada */}
            <div 
              className={`onboarding-lang-card ${language === "Kannada" ? "active" : ""}`}
              onClick={() => setLanguage("Kannada")}
            >
              <div className="onboarding-lang-card-left">
                <span className="onboarding-lang-card-flag">🇮🇳</span>
                <div>
                  <div className="onboarding-lang-card-name">Kannada</div>
                  <div className="onboarding-lang-card-sub">ಕನ್ನಡ</div>
                </div>
              </div>
              {language === "Kannada" && <span className="onboarding-lang-card-check">✓</span>}
            </div>

          </div>

          {/* Bottom Continue Button */}
          <button className="onboarding-btn-continue" onClick={handleContinueToInfo}>
            {language === "English" ? "Continue →" : language === "Hindi" ? "आगे बढ़ें →" : "ಮುಂದುವರಿಯಿರಿ →"}
          </button>
        </div>
      )}

      {/* SCREEN 2: Basic Information Setup */}
      {screen === 2 && (
        <form onSubmit={handleFormSubmitNext} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          {/* Header Banner */}
          <div className="onboarding-header-blue">
            <div className="onboarding-header-icon">👤</div>
            <div style={{ textAlign: "left" }}>
              <div className="onboarding-header-title">Basic Information</div>
              <div className="onboarding-header-sub">Let's set up your profile for health analysis</div>
            </div>
          </div>

          {/* Listen to Form Guidance */}
          <div className="onboarding-guidance-btn" onClick={handleFormGuidanceVoice}>
            <div style={{ fontSize: "20px" }}>🔊</div>
            <div className="onboarding-guidance-btn-text">
              <h4>Listen to Form Guidance</h4>
              <p>Hear instructions in your language</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="onboarding-form-card">
            
            {/* Full Name */}
            <div className="onboarding-input-group">
              <label>Your Full Name</label>
              <input 
                type="text" 
                className="onboarding-text-input" 
                placeholder="e.g. Ramesh Gowda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Age & Gender */}
            <div className="onboarding-two-col">
              <div className="onboarding-input-group">
                <label>Age (Years)</label>
                <input 
                  type="number" 
                  className="onboarding-text-input" 
                  placeholder="e.g. 45"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
              <div className="onboarding-input-group">
                <label>Gender</label>
                <div className="onboarding-gender-row">
                  <div 
                    className={`onboarding-toggle-btn ${gender === "Male" ? "active" : ""}`}
                    onClick={() => setGender("Male")}
                  >
                    Male
                  </div>
                  <div 
                    className={`onboarding-toggle-btn ${gender === "Female" ? "active" : ""}`}
                    onClick={() => setGender("Female")}
                  >
                    Female
                  </div>
                  <div 
                    className={`onboarding-toggle-btn ${gender === "Other" ? "active" : ""}`}
                    onClick={() => setGender("Other")}
                  >
                    Other
                  </div>
                </div>
              </div>
            </div>

            {/* Height & Weight */}
            <div className="onboarding-two-col">
              <div className="onboarding-input-group">
                <label>Height (cm)</label>
                <input 
                  type="number" 
                  className="onboarding-text-input" 
                  placeholder="e.g. 165"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required
                />
              </div>
              <div className="onboarding-input-group">
                <label>Weight (kg)</label>
                <input 
                  type="number" 
                  className="onboarding-text-input" 
                  placeholder="e.g. 68"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>
            </div>

          </div>

          {/* Blood Pressure checked recently */}
          <div className="onboarding-question-box">
            <h4>Have you checked your blood pressure (BP) recently?</h4>
            <div className="onboarding-yes-no-row">
              <div 
                className={`onboarding-toggle-btn ${bpCheckedRecently === "Yes" ? "active" : ""}`}
                onClick={() => setBpCheckedRecently("Yes")}
              >
                Yes
              </div>
              <div 
                className={`onboarding-toggle-btn ${bpCheckedRecently === "No" ? "active" : ""}`}
                onClick={() => setBpCheckedRecently("No")}
              >
                No
              </div>
            </div>
          </div>

          {/* Family history of Diabetes / High BP */}
          <div className="onboarding-question-box">
            <h4>Did anyone in your family have diabetes or high BP earlier?</h4>
            <div className="onboarding-yes-no-row">
              <div 
                className={`onboarding-toggle-btn ${familyHistory === "Yes" ? "active" : ""}`}
                onClick={() => setFamilyHistory("Yes")}
              >
                Yes
              </div>
              <div 
                className={`onboarding-toggle-btn ${familyHistory === "No" ? "active" : ""}`}
                onClick={() => setFamilyHistory("No")}
              >
                No
              </div>
            </div>
          </div>

          {/* Continue Submit Button */}
          <button type="submit" className="onboarding-btn-submit">
            Continue to Login →
          </button>

          {/* Skip link */}
          <span className="onboarding-skip-link" onClick={handleSkip}>
            Skip for now (Continue as Guest)
          </span>

        </form>
      )}

      {/* SCREEN 3: Enter Phone Number (OTP Step 1) */}
      {screen === 3 && (
        <form onSubmit={handleSendOtp} style={{ width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          <div className="onboarding-header-blue">
            <div className="onboarding-header-icon">📞</div>
            <div style={{ textAlign: "left" }}>
              <div className="onboarding-header-title">Verification</div>
              <div className="onboarding-header-sub">Verify your phone number to secure your account</div>
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: "var(--accent-red-bg)", color: "var(--accent-red)", padding: "12px", borderRadius: "12px", fontSize: "12px", width: "100%", marginBottom: "16px", fontWeight: "600", border: "1px solid rgba(239,68,68,0.15)" }}>
              {error}
            </div>
          )}

          <div className="onboarding-form-card" style={{ width: "100%" }}>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: "1.5" }}>
              Verify your mobile phone number. The ML risk screening records will be saved securely under this account profile.
            </p>

            <div className="onboarding-input-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                className="onboarding-text-input" 
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="onboarding-btn-submit" style={{ width: "100%" }} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: "16px", height: "16px" }}></span> : "Request One-Time PIN →"}
          </button>

          <button type="button" className="btn-secondary" onClick={() => setScreen(2)} style={{ width: "100%", marginTop: "8px", borderRadius: "18px", padding: "14px" }}>
            ← Back to Form
          </button>
        </form>
      )}

      {/* SCREEN 4: Enter OTP PIN (OTP Step 2) */}
      {screen === 4 && (
        <form onSubmit={handleVerifyOtpAndRegister} style={{ width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          <div className="onboarding-header-blue">
            <div className="onboarding-header-icon">🔑</div>
            <div style={{ textAlign: "left" }}>
              <div className="onboarding-header-title">Enter Code</div>
              <div className="onboarding-header-sub">Enter the 6-digit PIN sent to your phone</div>
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)", padding: "12px", borderRadius: "12px", fontSize: "12px", width: "100%", marginBottom: "16px", fontWeight: "600", textAlign: "center" }}>
              💡 {error}
            </div>
          )}

          <div className="onboarding-form-card" style={{ width: "100%" }}>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: "1.5" }}>
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

            <div className="onboarding-input-group">
              <label>Enter 6-Digit PIN</label>
              <input 
                type="text" 
                maxLength="6"
                placeholder="XXXXXX"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="onboarding-text-input" 
                style={{ textAlign: "center", fontSize: "20px", letterSpacing: "8px", fontWeight: "700" }}
                required
              />
            </div>
          </div>

          <button type="submit" className="onboarding-btn-submit" style={{ width: "100%" }} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: "16px", height: "16px" }}></span> : "Verify Security PIN →"}
          </button>

          <button type="button" className="btn-secondary" onClick={() => setScreen(3)} style={{ width: "100%", marginTop: "8px", borderRadius: "18px", padding: "14px" }}>
            ← Change Phone Number
          </button>
        </form>
      )}

    </div>
  );
}
