/**
 * GraamSehat ASHA Worker App - Patient Registration Wizard
 * Path: /src/pages/NewRegistration.jsx
 * Multi-step form flow wizard capturing demographic details, encrypting identifiers,
 * capturing camera snaps, capturing baseline medical readings, and generating Luhn-checksum UIDs.
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { KARNATAKA_DISTRICTS } from "../utils/constants";
import { createLocalPatient } from "../db/patients.local";
import { createLocalScreening } from "../db/screenings.local";
import { validatePhone, validateAadhaar, validateName } from "../utils/validators";
import { classifyBP, calculateIDRS, calculateOverallRisk, getRiskAdvice } from "../utils/riskCalculator";
import ProgressBar from "../components/ProgressBar";
import GameCard from "../components/GameCard";

export function NewRegistration() {
  const { t, language } = useLanguage();
  const { ashaWorkerId } = useAuth();
  const navigate = useNavigate();

  // Active step (1 to 7) or success view (8)
  const [step, setStep] = useState(1);
  const [formError, setFormError] = useState("");

  // Captured UID after registration success
  const [registeredUid, setRegisteredUid] = useState("");
  const [registeredName, setRegisteredName] = useState("");

  // Camera state
  const [stream, setStream] = useState(null);
  const [photoCaptured, setPhotoCaptured] = useState(null); // base64 string
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Form Fields State
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(""); // Male, Female, Other
  const [bloodGroup, setBloodGroup] = useState(""); // A+, B+, etc.
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("Bengaluru Urban"); // default district
  const [household, setHousehold] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [linkFamily, setLinkFamily] = useState(false);
  const [familyPhone, setFamilyPhone] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [noAadhaar, setNoAadhaar] = useState(false);

  // Baseline Medical & IDRS Readings State
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [bpNotAvailable, setBpNotAvailable] = useState(false);
  const [glucoseLevel, setGlucoseLevel] = useState("");
  const [glucoseNotAvailable, setGlucoseNotAvailable] = useState(false);
  const [physicalActivity, setPhysicalActivity] = useState(""); // vigorous, moderate, sedentary
  const [familyHistory, setFamilyHistory] = useState(""); // none, one_parent, both_parents
  const [baselineRemarks, setBaselineRemarks] = useState("");

  // Stop video stream on step transition or unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [step]);

  // Start video stream
  const startCamera = async () => {
    setFormError("");
    setCameraActive(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access failed", err);
      setFormError("Camera permission denied. Please skip photo or enable permissions.");
      setCameraActive(false);
    }
  };

  // Stop video stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  // Capture frame
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      // Draw frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Export as data URL (base64)
      const dataUrl = canvas.toDataURL("image/jpeg");
      setPhotoCaptured(dataUrl);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setPhotoCaptured(null);
    startCamera();
  };

  // Live Risk Calculation Helper
  const getCalculatedMetrics = () => {
    const ageNum = parseInt(age, 10) || 0;
    const ageGroupVal = ageNum < 35 ? "<35" : ageNum < 50 ? "35-49" : ">=50";
    
    const waistNum = parseFloat(waist) || 0;
    let waistGroupVal = "";
    if (gender === "Male") {
      waistGroupVal = waistNum < 80 ? "<80" : waistNum < 90 ? "80-89" : ">=90";
    } else {
      waistGroupVal = waistNum < 75 ? "<75" : waistNum < 85 ? "75-84" : ">=85";
    }
    
    const answers = {
      ageGroup: ageGroupVal,
      waistGroup: waistGroupVal,
      physicalActivity,
      familyHistory
    };
    
    const idrsScore = calculateIDRS(answers, gender);
    const bpClassification = bpNotAvailable ? "NOT_AVAILABLE" : classifyBP(bpSystolic, bpDiastolic);
    
    let glucoseClassification = "NOT_AVAILABLE";
    if (!glucoseNotAvailable && glucoseLevel !== "") {
      const gVal = parseInt(glucoseLevel, 10);
      if (!isNaN(gVal)) {
        glucoseClassification = gVal < 100 ? "NORMAL" : gVal <= 125 ? "PREDIABETIC" : "DIABETIC";
      }
    }
    
    const overallRisk = calculateOverallRisk(idrsScore, bpClassification, glucoseClassification);
    
    let days = 365;
    if (overallRisk === "RED") {
      days = 15;
    } else if (overallRisk === "YELLOW") {
      days = 90;
    }
    const nextMeetupDate = Date.now() + days * 24 * 60 * 60 * 1000;

    return {
      ageGroup: ageGroupVal,
      waistGroup: waistGroupVal,
      idrsScore,
      bpClassification,
      overallRisk,
      nextMeetupDate
    };
  };

  // Validation checks per step
  const validateCurrentStep = () => {
    setFormError("");
    
    if (step === 2) {
      if (!validateName(name)) {
        setFormError("Please enter a valid patient name (alphabetical, min 2 characters).");
        return false;
      }
      const parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 120) {
        setFormError("Please enter a valid age in years.");
        return false;
      }
      if (!gender) {
        setFormError("Please select patient gender.");
        return false;
      }
      if (!bloodGroup) {
        setFormError("Please select a blood group.");
        return false;
      }
    }

    if (step === 3) {
      if (!village.trim()) {
        setFormError("Please enter a village name.");
        return false;
      }
      if (!district) {
        setFormError("Please select a district.");
        return false;
      }
      if (!household.trim()) {
        setFormError("Please enter a household number.");
        return false;
      }
    }

    if (step === 4) {
      if (!validatePhone(phone)) {
        setFormError("Please enter a valid 10-digit primary phone number.");
        return false;
      }
      if (altPhone && !validatePhone(altPhone)) {
        setFormError("If providing an alternate phone, it must be a valid 10-digit number.");
        return false;
      }
      if (linkFamily && !validatePhone(familyPhone)) {
        setFormError("Please enter a valid 10-digit primary family phone number.");
        return false;
      }
    }

    if (step === 5) {
      if (!noAadhaar && !validateAadhaar(aadhaar)) {
        setFormError("Please enter a valid 12-digit Aadhaar number, or check 'Patient does not have Aadhaar'.");
        return false;
      }
    }

    if (step === 6) {
      const h = parseFloat(height);
      const w = parseFloat(weight);
      const ws = parseFloat(waist);
      
      if (isNaN(h) || h < 30 || h > 250) {
        setFormError("Please enter a valid height in cm (between 30 and 250).");
        return false;
      }
      if (isNaN(w) || w < 2 || w > 300) {
        setFormError("Please enter a valid weight in kg (between 2 and 300).");
        return false;
      }
      if (isNaN(ws) || ws < 20 || ws > 200) {
        setFormError("Please enter a valid waist circumference in cm (between 20 and 200).");
        return false;
      }
      if (!bpNotAvailable) {
        const sys = parseInt(bpSystolic, 10);
        const dia = parseInt(bpDiastolic, 10);
        if (isNaN(sys) || sys < 50 || sys > 250) {
          setFormError("Please enter a valid systolic BP mmHg (between 50 and 250).");
          return false;
        }
        if (isNaN(dia) || dia < 30 || dia > 150) {
          setFormError("Please enter a valid diastolic BP mmHg (between 30 and 150).");
          return false;
        }
      }
      if (!glucoseNotAvailable) {
        const glu = parseInt(glucoseLevel, 10);
        if (isNaN(glu) || glu < 20 || glu > 600) {
          setFormError("Please enter a valid blood glucose level mg/dL (between 20 and 600).");
          return false;
        }
      }
      if (!physicalActivity) {
        setFormError("Please select patient physical activity level.");
        return false;
      }
      if (!familyHistory) {
        setFormError("Please select patient family history of diabetes.");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setFormError("");
    setStep(prev => prev - 1);
  };

  // Final Registration Commit
  const handleRegister = async () => {
    setFormError("");
    try {
      const metrics = getCalculatedMetrics();
      const patientData = {
        name,
        age: parseInt(age, 10),
        gender,
        bloodGroup,
        village,
        district,
        household,
        phone,
        altPhone: altPhone || "",
        linkFamily,
        familyPhone: linkFamily ? familyPhone : "",
        aadhaar: noAadhaar ? "" : aadhaar,
        noAadhaar,
        photo: photoCaptured,
        ashaWorkerId,
        
        // Baseline readings
        height: parseFloat(height) || null,
        weight: parseFloat(weight) || null,
        waist: parseFloat(waist) || null,
        bpSystolic: bpNotAvailable ? null : parseInt(bpSystolic, 10),
        bpDiastolic: bpNotAvailable ? null : parseInt(bpDiastolic, 10),
        glucoseLevel: glucoseNotAvailable ? null : parseInt(glucoseLevel, 10),
        physicalActivity,
        familyHistory,
        idrsScore: metrics.idrsScore,
        overallRisk: metrics.overallRisk,
        doctorsNote: baselineRemarks,
        nextMeetupDate: metrics.nextMeetupDate
      };

      const record = await createLocalPatient(patientData);
      
      // Auto-create initial baseline screening log in database
      await createLocalScreening({
        uid: record.uid,
        date: Date.now(),
        idrsScore: metrics.idrsScore,
        bpSystolic: bpNotAvailable ? null : parseInt(bpSystolic, 10),
        bpDiastolic: bpNotAvailable ? null : parseInt(bpDiastolic, 10),
        glucoseLevel: glucoseNotAvailable ? null : parseInt(glucoseLevel, 10),
        riskLevel: metrics.idrsScore < 30 ? "low" : metrics.idrsScore < 50 ? "moderate" : metrics.idrsScore < 60 ? "high" : "very high",
        overallRisk: metrics.overallRisk,
        doctorsNote: baselineRemarks || getRiskAdvice(metrics.overallRisk, language).explanation,
        nextMeetupDate: metrics.nextMeetupDate,
        symptoms: ["none"],
        ashaWorkerId
      });

      setRegisteredUid(record.uid);
      setRegisteredName(record.name);
      setStep(8); // Go to success view
    } catch (err) {
      console.error("Local registration failed", err);
      setFormError("Failed to save patient. Please check database permissions.");
    }
  };

  // WhatsApp Card Share Link Builder
  const handleShareWhatsApp = () => {
    const text = `GraamSehat Health Portal: Patient ${registeredName} registered successfully. Health ID: ${registeredUid}.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const bloodGroups = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-", "Unknown"];

  return (
    <div style={{ padding: "16px 0", minHeight: "calc(100vh - 60px)", display: "flex", flexDirection: "column" }}>
      {step < 8 && (
        <>
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "var(--color-primary)" }}>{t("regTitle")}</h2>
          </div>
          <ProgressBar current={step} total={7} />
        </>
      )}

      {formError && (
        <div
          style={{
            backgroundColor: "var(--color-red-bg)",
            color: "var(--color-red)",
            border: "1px solid rgba(198, 40, 40, 0.2)",
            padding: "12px",
            borderRadius: "12px",
            fontSize: "14px",
            margin: "8px 16px",
            textAlign: "center",
            fontWeight: "700"
          }}
        >
          ⚠️ {formError}
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        
        {/* STEP 1: PHOTO VIEWPORT */}
        {step === 1 && (
          <div className="glass-card slide-in-right" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "800", color: "var(--color-primary)" }}>{t("regStepPhoto")}</h3>
            
            {/* Viewfinder or placeholder */}
            <div
              style={{
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                border: "3px solid var(--color-primary-light)",
                overflow: "hidden",
                position: "relative",
                backgroundColor: "#2c302d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                marginBottom: "20px"
              }}
            >
              {photoCaptured ? (
                <img src={photoCaptured} alt="Patient snap" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : cameraActive ? (
                <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "54px" }}>📷</span>
              )}
              <canvas ref={canvasRef} width={300} height={300} style={{ display: "none" }} />
            </div>

            {/* Camera Actions */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
              {cameraActive ? (
                <button onClick={capturePhoto} className="btn-primary">
                  📸 Capture Frame
                </button>
              ) : photoCaptured ? (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={handleRetake} className="btn-secondary" style={{ flex: 1 }}>
                    Retake
                  </button>
                  <button onClick={handleNext} className="btn-primary" style={{ flex: 2 }}>
                    Keep Photo
                  </button>
                </div>
              ) : (
                <button onClick={startCamera} className="btn-primary">
                  Start Camera
                </button>
              )}

              {!photoCaptured && !cameraActive && (
                <button onClick={handleNext} className="btn-secondary">
                  {t("btnSkip")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: PERSONAL DETAILS */}
        {step === 2 && (
          <div className="glass-card slide-in-right">
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "800", color: "var(--color-primary)" }}>{t("regStepDetails")}</h3>
            
            <label style={{ fontSize: "14px", fontWeight: "700", display: "block", marginBottom: "6px" }}>
              {t("labelName")}
            </label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
            />

            <label style={{ fontSize: "14px", fontWeight: "700", display: "block", marginBottom: "6px" }}>
              {t("labelAge")}
            </label>
            <input
              type="number"
              className="form-input"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 42"
            />

            <label style={{ fontSize: "14px", fontWeight: "700", display: "block", marginBottom: "8px" }}>
              {t("labelGender")}
            </label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {["Male", "Female", "Other"].map(g => (
                <div
                  key={g}
                  onClick={() => setGender(g)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    textAlign: "center",
                    fontWeight: "700",
                    cursor: "pointer",
                    background: gender === g ? "var(--color-primary-tint)" : "var(--color-card)",
                    border: `2px solid ${gender === g ? "var(--color-primary)" : "var(--color-border)"}`,
                    color: "var(--color-text-primary)",
                    transition: "var(--transition-smooth)"
                  }}
                >
                  {g === "Male" ? "👨 Male" : g === "Female" ? "👩 Female" : "⚧ Other"}
                </div>
              ))}
            </div>

            <label style={{ fontSize: "14px", fontWeight: "700", display: "block", marginBottom: "8px" }}>
              {t("labelBloodGroup")}
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
              {bloodGroups.map(bg => (
                <div
                  key={bg}
                  onClick={() => setBloodGroup(bg)}
                  style={{
                    padding: "8px 0",
                    borderRadius: "8px",
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    background: bloodGroup === bg ? "var(--color-primary-tint)" : "var(--color-card)",
                    border: `2px solid ${bloodGroup === bg ? "var(--color-primary)" : "var(--color-border)"}`,
                    color: "var(--color-text-primary)",
                    transition: "var(--transition-smooth)"
                  }}
                >
                  {bg}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: LOCATION */}
        {step === 3 && (
          <div className="glass-card slide-in-right">
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "800", color: "var(--color-primary)" }}>{t("regStepLocation")}</h3>
            
            <label style={{ fontSize: "14px", fontWeight: "700", display: "block", marginBottom: "6px" }}>
              {t("labelVillage")}
            </label>
            <input
              type="text"
              className="form-input"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="e.g. Mangalapura"
            />

            <label style={{ fontSize: "14px", fontWeight: "700", display: "block", marginBottom: "6px" }}>
              {t("labelDistrict")}
            </label>
            <select
              className="form-input"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              {KARNATAKA_DISTRICTS.map(d => (
                <option key={d} value={d} style={{ color: "var(--color-text-primary)" }}>
                  {d}
                </option>
              ))}
            </select>

            <label style={{ fontSize: "14px", fontWeight: "700", display: "block", marginBottom: "6px" }}>
              {t("labelHousehold")}
            </label>
            <input
              type="text"
              className="form-input"
              value={household}
              onChange={(e) => setHousehold(e.target.value)}
              placeholder="e.g. Ward 4 / House 21"
            />
          </div>
        )}

        {/* STEP 4: CONTACT INFO */}
        {step === 4 && (
          <div className="glass-card slide-in-right">
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "800", color: "var(--color-primary)" }}>{t("regStepContact")}</h3>
            
            <label style={{ fontSize: "14px", fontWeight: "700", display: "block", marginBottom: "6px" }}>
              {t("labelPrimaryPhone")}
            </label>
            <input
              type="tel"
              maxLength={10}
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
            />

            <label style={{ fontSize: "14px", fontWeight: "700", display: "block", marginBottom: "6px" }}>
              {t("labelAltPhone")}
            </label>
            <input
              type="tel"
              maxLength={10}
              className="form-input"
              value={altPhone}
              onChange={(e) => setAltPhone(e.target.value)}
              placeholder="e.g. 9876543211"
            />

            {/* Link to Family */}
            <div className="toggle-container" onClick={() => setLinkFamily(!linkFamily)}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-text-primary)" }}>
                {t("labelLinkFamily")}
              </span>
              <div className={`toggle-switch ${linkFamily ? "toggle-active" : ""}`} />
            </div>

            {linkFamily && (
              <div className="slide-in-right" style={{ marginTop: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "700", display: "block", marginBottom: "6px" }}>
                  {t("labelFamilyPhone")}
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  className="form-input"
                  value={familyPhone}
                  onChange={(e) => setFamilyPhone(e.target.value)}
                  placeholder="Enter primary account phone"
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 5: AADHAAR */}
        {step === 5 && (
          <div className="glass-card slide-in-right">
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "800", color: "var(--color-primary)" }}>{t("regStepAadhaar")}</h3>
            
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", lineHeight: "1.5", marginBottom: "16px" }}>
              🛡️ {t("aadhaarNotice")}
            </p>

            {!noAadhaar && (
              <div className="slide-in-right">
                <label style={{ fontSize: "14px", fontWeight: "700", display: "block", marginBottom: "6px" }}>
                  {t("labelAadhaar")}
                </label>
                <input
                  type="tel"
                  maxLength={12}
                  className="form-input"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 123456789012"
                  style={{ letterSpacing: "2px", fontSize: "18px", textAlign: "center" }}
                />
              </div>
            )}

            <div className="toggle-container" onClick={() => setNoAadhaar(!noAadhaar)}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-text-primary)" }}>
                {t("noAadhaarOpt")}
              </span>
              <div className={`toggle-switch ${noAadhaar ? "toggle-active" : ""}`} />
            </div>
          </div>
        )}

        {/* STEP 6: MEDICAL & IDRS BASELINES */}
        {step === 6 && (
          <div className="glass-card slide-in-right" style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto", padding: "20px 24px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "800", color: "var(--color-primary)", textAlign: "center" }}>
              6. Medical & IDRS Readings
            </h3>

            {/* Demographics row metrics */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Height (cm)</label>
                <input
                  type="number"
                  placeholder="e.g. 165"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="form-input"
                  style={{ marginBottom: 0, padding: "12px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Weight (kg)</label>
                <input
                  type="number"
                  placeholder="e.g. 62"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="form-input"
                  style={{ marginBottom: 0, padding: "12px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Waist (cm)</label>
                <input
                  type="number"
                  placeholder="e.g. 85"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="form-input"
                  style={{ marginBottom: 0, padding: "12px" }}
                />
              </div>
            </div>

            {/* BP Input Section */}
            <div style={{ border: "1px solid var(--color-border)", padding: "12px", borderRadius: "16px", marginBottom: "16px", background: "var(--color-surface)" }}>
              <div className="toggle-container" onClick={() => setBpNotAvailable(!bpNotAvailable)} style={{ margin: "0 0 10px 0" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-text-primary)" }}>BP Not Available</span>
                <div className={`toggle-switch ${bpNotAvailable ? "toggle-active" : ""}`} style={{ scale: "0.85" }} />
              </div>
              {!bpNotAvailable && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      placeholder="Systolic"
                      value={bpSystolic}
                      onChange={(e) => setBpSystolic(e.target.value)}
                      className="form-input"
                      style={{ marginBottom: 0, padding: "10px", fontSize: "14px", textAlign: "center" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      placeholder="Diastolic"
                      value={bpDiastolic}
                      onChange={(e) => setBpDiastolic(e.target.value)}
                      className="form-input"
                      style={{ marginBottom: 0, padding: "10px", fontSize: "14px", textAlign: "center" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sugar Input Section */}
            <div style={{ border: "1px solid var(--color-border)", padding: "12px", borderRadius: "16px", marginBottom: "16px", background: "var(--color-surface)" }}>
              <div className="toggle-container" onClick={() => setGlucoseNotAvailable(!glucoseNotAvailable)} style={{ margin: "0 0 10px 0" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-text-primary)" }}>Sugar Not Available</span>
                <div className={`toggle-switch ${glucoseNotAvailable ? "toggle-active" : ""}`} style={{ scale: "0.85" }} />
              </div>
              {!glucoseNotAvailable && (
                <input
                  type="number"
                  placeholder="Blood Glucose (mg/dL)"
                  value={glucoseLevel}
                  onChange={(e) => setGlucoseLevel(e.target.value)}
                  className="form-input"
                  style={{ marginBottom: 0, padding: "10px", fontSize: "14px", textAlign: "center" }}
                />
              )}
            </div>

            {/* Physical Activity */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "6px" }}>Physical Activity</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {[
                  { key: "vigorous", label: "Active (Vigorous exercise/heavy labor)" },
                  { key: "moderate", label: "Moderate (Normal walks/moderate activity)" },
                  { key: "sedentary", label: "Sedentary (No regular physical activity)" }
                ].map(opt => (
                  <div
                    key={opt.key}
                    onClick={() => setPhysicalActivity(opt.key)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: `1.5px solid ${physicalActivity === opt.key ? "var(--color-primary)" : "var(--color-border)"}`,
                      background: physicalActivity === opt.key ? "var(--color-primary-tint)" : "var(--color-card)",
                      fontSize: "13px",
                      fontWeight: physicalActivity === opt.key ? "700" : "500",
                      cursor: "pointer",
                      transition: "var(--transition-smooth)",
                      color: "var(--color-text-primary)"
                    }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Family History */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "6px" }}>Family Diabetes History</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {[
                  { key: "none", label: "No family history of diabetes" },
                  { key: "one_parent", label: "One parent has diabetes" },
                  { key: "both_parents", label: "Both parents have diabetes" }
                ].map(opt => (
                  <div
                    key={opt.key}
                    onClick={() => setFamilyHistory(opt.key)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: `1.5px solid ${familyHistory === opt.key ? "var(--color-primary)" : "var(--color-border)"}`,
                      background: familyHistory === opt.key ? "var(--color-primary-tint)" : "var(--color-card)",
                      fontSize: "13px",
                      fontWeight: familyHistory === opt.key ? "700" : "500",
                      cursor: "pointer",
                      transition: "var(--transition-smooth)",
                      color: "var(--color-text-primary)"
                    }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            </div>

            {/* ASHA/Doctor Remarks (Baseline Note) */}
            <div style={{ marginTop: "16px" }}>
              <label style={{ fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "6px" }}>
                ASHA / Doctor Remarks (Baseline Note)
              </label>
              <textarea
                className="form-input"
                value={baselineRemarks}
                onChange={(e) => setBaselineRemarks(e.target.value)}
                placeholder="Enter remarks, symptoms, or custom advice..."
                rows={3}
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  padding: "10px",
                  fontSize: "14px",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  resize: "vertical"
                }}
              />
            </div>
          </div>
        )}

        {/* STEP 7: CONFIRMATION SUMMARY CARD */}
        {step === 7 && (
          <div className="glass-card slide-in-right" style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "800", color: "var(--color-primary)", textAlign: "center" }}>
              {t("regStepConfirm")}
            </h3>
            
            {/* Demographic Summary Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "var(--color-surface)", padding: "16px", borderRadius: "16px", border: "1px solid var(--color-border)" }}>
              {/* Row 1: Name and Gender */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Patient Name:</span>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--color-text-primary)" }}>{name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Age / Gender:</span>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--color-text-primary)" }}>{age} Yrs / {gender}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Blood Group:</span>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--color-text-primary)" }}>{bloodGroup}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Address:</span>
                <span style={{ fontSize: "13px", fontWeight: "800", textAlign: "right", color: "var(--color-text-primary)" }}>
                  {household}, {village}, {district}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Phone Number:</span>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--color-text-primary)" }}>{phone}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Aadhaar:</span>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--color-text-primary)" }}>
                  {noAadhaar ? "No Aadhaar provided" : `•••• •••• ${aadhaar.slice(-4)}`}
                </span>
              </div>

              <hr style={{ margin: "6px 0" }} />

              {/* Medical baselines in confirmation summary */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Height / Weight:</span>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--color-text-primary)" }}>{height} cm / {weight} kg</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Waist Circumference:</span>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--color-text-primary)" }}>{waist} cm</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Blood Pressure:</span>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--color-text-primary)" }}>
                  {bpNotAvailable ? "N/A" : `${bpSystolic}/${bpDiastolic} mmHg`}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Blood Glucose:</span>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--color-text-primary)" }}>
                  {glucoseNotAvailable ? "N/A" : `${glucoseLevel} mg/dL`}
                </span>
              </div>

              <hr style={{ margin: "6px 0" }} />

              {/* Calculated risk summary row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: "600" }}>Calculated IDRS:</span>
                <strong style={{ fontSize: "14px", color: "var(--color-primary)" }}>
                  {getCalculatedMetrics().idrsScore} ({getCalculatedMetrics().idrsScore < 30 ? "Low" : getCalculatedMetrics().idrsScore < 50 ? "Moderate" : "High"})
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: "600" }}>Overall Risk:</span>
                {getCalculatedMetrics().overallRisk === "RED" ? (
                  <span className="badge badge-red" style={{ fontSize: "11px", padding: "4px 8px" }}>RED (High)</span>
                ) : getCalculatedMetrics().overallRisk === "YELLOW" ? (
                  <span className="badge badge-yellow" style={{ fontSize: "11px", padding: "4px 8px" }}>YELLOW (Mod)</span>
                ) : (
                  <span className="badge badge-green" style={{ fontSize: "11px", padding: "4px 8px" }}>GREEN (Low)</span>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: "600" }}>Next Meetup Scheduled:</span>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--color-text-primary)" }}>
                  {new Date(getCalculatedMetrics().nextMeetupDate).toLocaleDateString(language === "kn" ? "kn-IN" : "en-IN", {
                    year: "numeric", month: "short", day: "numeric"
                  })} (in {getCalculatedMetrics().overallRisk === "RED" ? 15 : getCalculatedMetrics().overallRisk === "YELLOW" ? 90 : 365} days)
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px", textAlign: "left" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: "600" }}>ASHA/Doctor Remarks:</span>
                <span style={{ fontSize: "13px", color: "var(--color-text-primary)", fontStyle: "italic", background: "var(--color-card)", padding: "8px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                  {baselineRemarks || "None entered"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1 }}>
                Edit Details
              </button>
              <button onClick={handleRegister} className="btn-primary" style={{ flex: 2 }}>
                {t("btnRegister")}
              </button>
            </div>
          </div>
        )}

        {/* STEP 8: REGISTRATION SUCCESS CARD */}
        {step === 8 && (
          <div className="glass-card text-center slide-in-right" style={{ padding: "32px 16px" }}>
            <span style={{ fontSize: "64px" }}>🎉</span>
            <h2 style={{ color: "var(--color-green)", margin: "16px 0 8px 0" }}>
              {t("regSuccess")}
            </h2>
            <p style={{ fontSize: "15px", color: "var(--color-text-secondary)", margin: "0 0 24px 0" }}>
              Health record saved locally. Patient profile is queued for synchronisation.
            </p>

            <div
              style={{
                background: "var(--color-primary-tint)",
                border: "2px dashed var(--color-primary-light)",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "32px"
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--color-text-secondary)", textTransform: "uppercase", fontWeight: "700" }}>
                {t("healthIdLabel")}
              </span>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--color-primary)", margin: "8px 0", letterSpacing: "1px" }}>
                {registeredUid}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button onClick={handleShareWhatsApp} className="btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                💬 {t("btnPrintShare")}
              </button>
              <button
                onClick={() => navigate(`/patients/${registeredUid.replace(/-/g, "")}`)}
                className="btn-primary"
                style={{ background: "var(--color-primary-light)" }}
              >
                Go to Profile
              </button>
              <button onClick={() => navigate("/")} className="btn-secondary">
                {t("btnGoHome")}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation bar */}
      {step < 7 && (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", gap: "12px" }}>
          {step > 1 ? (
            <button onClick={handleBack} className="btn-secondary" style={{ width: "100px" }}>
              {t("btnBack")}
            </button>
          ) : (
            <button onClick={() => navigate("/scan")} className="btn-secondary" style={{ width: "100px" }}>
              Cancel
            </button>
          )}

          <button onClick={handleNext} className="btn-primary" style={{ width: "140px" }}>
            {t("btnNext")}
          </button>
        </div>
      )}
    </div>
  );
}

export default NewRegistration;
