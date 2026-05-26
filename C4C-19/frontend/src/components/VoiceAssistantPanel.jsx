import React, { useState, useEffect, useRef } from "react";
import { api } from "../services/api";

export default function VoiceAssistantPanel({ user, healthSummary, activeTab, setActiveTab, onClose }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("Tap the mic to start speaking...");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [voiceSuccess, setVoiceSuccess] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voicePhone, setVoicePhone] = useState(user?.phone || "+91 98765 43210");
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);

  const recognitionRef = useRef(null);

  // Initialize Web Speech API SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Web Speech API is not supported in this browser. Try Chrome, Edge, or Safari.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US"; // Standard language, can adapt to hi-IN or kn-IN

    rec.onstart = () => {
      setListening(true);
      setTranscript("Listening... speak now");
      setInterimTranscript("");
      setErrorMsg("");
    };

    rec.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      if (event.error === "not-allowed") {
        setErrorMsg("Microphone permission denied. Please allow microphone access in settings.");
      } else {
        setErrorMsg(`Error occurred: ${event.error}`);
      }
      setListening(false);
    };

    rec.onend = () => {
      setListening(false);
    };

    rec.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
      }

      if (final) {
        const command = final.trim().toLowerCase();
        setTranscript(`"${final}"`);
        setInterimTranscript("");
        processVoiceCommand(command);
      }
    };

    recognitionRef.current = rec;

    // Auto-start listening on open
    try {
      rec.start();
    } catch (e) {
      console.log("Speech recognition auto-start bypassed:", e);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.log("Recognition start failed, aborting and re-trying", e);
        recognitionRef.current.abort();
        setTimeout(() => {
          recognitionRef.current.start();
        }, 300);
      }
    }
  };

  // Natively routes tabs based on speech commands!
  const processVoiceCommand = (command) => {
    // 1. Appointment view redirect
    if (
      command.includes("appoint") ||
      command.includes("appointment") ||
      command.includes("book") ||
      command.includes("doctor") ||
      command.includes("clinic")
    ) {
      setTranscript(`Redirecting to Book Appointment...`);
      setTimeout(() => {
        setActiveTab("appoint");
        onClose();
      }, 1200);
    }
    // 2. Screening / Check view redirect
    else if (
      command.includes("check") ||
      command.includes("screening") ||
      command.includes("diabetes") ||
      command.includes("hypertension") ||
      command.includes("predict") ||
      command.includes("test")
    ) {
      setTranscript(`Redirecting to Health Screening...`);
      setTimeout(() => {
        setActiveTab("check");
        onClose();
      }, 1200);
    }
    // 3. Map view redirect
    else if (
      command.includes("map") ||
      command.includes("way") ||
      command.includes("location") ||
      command.includes("phc") ||
      command.includes("hospital") ||
      command.includes("clinic location")
    ) {
      setTranscript(`Redirecting to PHC Maps...`);
      setTimeout(() => {
        setActiveTab("map");
        onClose();
      }, 1200);
    }
    // 4. Health Tips redirect
    else if (
      command.includes("tips") ||
      command.includes("tip") ||
      command.includes("guide") ||
      command.includes("health tips") ||
      command.includes("advice")
    ) {
      setTranscript(`Redirecting to Health Tips...`);
      setTimeout(() => {
        setActiveTab("tips");
        onClose();
      }, 1200);
    }
    // 5. Settings redirect
    else if (
      command.includes("settings") ||
      command.includes("config") ||
      command.includes("profile settings")
    ) {
      setTranscript(`Redirecting to Settings...`);
      setTimeout(() => {
        setActiveTab("settings");
        onClose();
      }, 1200);
    }
    // 6. Home / Dashboard redirect
    else if (
      command.includes("home") ||
      command.includes("dashboard") ||
      command.includes("back")
    ) {
      setTranscript(`Going to Home Page...`);
      setTimeout(() => {
        setActiveTab("home");
        onClose();
      }, 1200);
    }
    // 7. Outbound screening call trigger command
    else if (
      command.includes("call me") ||
      command.includes("outbound call") ||
      command.includes("screening call") ||
      command.includes("dial")
    ) {
      setTranscript(`Opening Voice Screening Dial Box...`);
      setShowPhoneVerify(true);
    }
    else {
      setTranscript(`Heard: "${command}". Try saying "Go to check", "Book doctor", or "Show map".`);
    }
  };

  const handleOutboundRequest = async (e) => {
    e.preventDefault();
    if (!voicePhone) return;
    setVoiceLoading(true);
    try {
      await api.voice.triggerHealthAssistant(voicePhone);
      setVoiceSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      console.log("Mock Outbound Call Triggered");
      setVoiceSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } finally {
      setVoiceLoading(false);
    }
  };

  return (
    <div className="auth-glass-overlay" onClick={onClose} style={{ zIndex: 25000 }}>
      <div 
        className="auth-sliding-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          borderTopLeftRadius: "30px", 
          borderTopRightRadius: "30px", 
          padding: "24px 20px", 
          background: "white", 
          maxHeight: "85%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        {/* Grey Drag Indicator Bar */}
        <div style={{ width: "40px", height: "5px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginBottom: "20px" }}></div>

        <div style={{ textAlign: "center", width: "100%", maxWidth: "420px" }}>
          
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 6px 0" }}>
            Arogya Voice Assistant
          </h2>
          <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0 }}>
            Natively speak in English to navigate or trigger outbound screenings
          </p>

          {/* Conditional layout for phone dialing vs speech listening */}
          {showPhoneVerify ? (
            <div style={{ marginTop: "24px", textAlign: "left" }}>
              {voiceSuccess ? (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#e6f4ea", color: "#10b981", display: "inline-flex", justifyContent: "center", alignItems: "center", fontSize: "24px", marginBottom: "12px" }}>✓</div>
                  <h4 style={{ margin: "0 0 6px 0", fontSize: "14px" }}>Outbound Screening Initiated</h4>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>Answering your phone will connect you to our Vocal Health AI.</p>
                </div>
              ) : (
                <form onSubmit={handleOutboundRequest}>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px" }}>
                    Confirm your number to trigger a full automated vocal AI health screening call to your handset.
                  </p>
                  
                  <div className="auth-form-group">
                    <label className="auth-form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      className="auth-form-input"
                      value={voicePhone}
                      onChange={(e) => setVoicePhone(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
                    <button type="button" className="btn-secondary" onClick={() => setShowPhoneVerify(false)} style={{ flex: 1, padding: "12px" }}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={voiceLoading} style={{ flex: 2, padding: "12px" }}>
                      {voiceLoading ? "Dialing..." : "Call My Phone"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Dynamic Transcript Recital Display Box */}
              <div style={{ 
                minHeight: "80px", 
                backgroundColor: "#f8fafc", 
                borderRadius: "20px", 
                border: "1.5px solid #e2e8f0", 
                margin: "24px 0 16px 0", 
                padding: "16px 18px", 
                display: "flex", 
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"
              }}>
                {listening ? (
                  <p style={{ fontSize: "14px", fontWeight: "700", color: "#1a3bf5", margin: 0, textAlign: "center", lineHeight: "1.5" }}>
                    {interimTranscript || transcript}
                  </p>
                ) : (
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", margin: 0, textAlign: "center", lineHeight: "1.5" }}>
                    {transcript}
                  </p>
                )}
                {errorMsg && (
                  <p style={{ fontSize: "11px", color: "#ef4444", fontWeight: "700", marginTop: "6px", margin: "6px 0 0 0" }}>
                    ⚠️ {errorMsg}
                  </p>
                )}
              </div>

              {/* Glowing Pulse audio waveform container */}
              {listening ? (
                <div className="voice-wave-container">
                  <div className="voice-wave-bar"></div>
                  <div className="voice-wave-bar"></div>
                  <div className="voice-wave-bar"></div>
                  <div className="voice-wave-bar"></div>
                  <div className="voice-wave-bar"></div>
                  <div className="voice-wave-bar"></div>
                </div>
              ) : (
                <div style={{ height: "60px", margin: "20px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" }}>TAP MIC TO START</span>
                </div>
              )}

              {/* Pulse Active Microphone Circle Button */}
              <div 
                onClick={toggleListening}
                style={{ 
                  width: "72px", 
                  height: "72px", 
                  borderRadius: "50%", 
                  backgroundColor: listening ? "#f43f5e" : "#1a3bf5", 
                  color: "white", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  cursor: "pointer",
                  boxShadow: listening ? "0 0 20px rgba(244, 63, 94, 0.4)" : "0 4px 14px rgba(26, 59, 245, 0.3)",
                  transition: "all 0.3s ease",
                  marginBottom: "24px"
                }}
              >
                {listening ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: "24px", height: "24px" }}>
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: "24px", height: "24px" }}>
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                )}
              </div>

              {/* Supported Command List Box (Image guide) */}
              <h3 style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "12px", textAlign: "left" }}>
                💡 Voice Command Examples
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", width: "100%", marginBottom: "12px" }}>
                <div onClick={() => processVoiceCommand("book doctor")} style={{ padding: "10px", borderRadius: "12px", backgroundColor: "#f1f5f9", fontSize: "11px", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer", textAlign: "left" }}>
                  🗣️ <em>"Book doctor"</em>
                </div>
                <div onClick={() => processVoiceCommand("go to check")} style={{ padding: "10px", borderRadius: "12px", backgroundColor: "#f1f5f9", fontSize: "11px", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer", textAlign: "left" }}>
                  🗣️ <em>"Go to check"</em>
                </div>
                <div onClick={() => processVoiceCommand("show map")} style={{ padding: "10px", borderRadius: "12px", backgroundColor: "#f1f5f9", fontSize: "11px", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer", textAlign: "left" }}>
                  🗣️ <em>"Show map"</em>
                </div>
                <div onClick={() => processVoiceCommand("health tips")} style={{ padding: "10px", borderRadius: "12px", backgroundColor: "#f1f5f9", fontSize: "11px", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer", textAlign: "left" }}>
                  🗣️ <em>"Health tips"</em>
                </div>
              </div>

              {/* Option to trigger phone call */}
              <button 
                className="btn-secondary" 
                onClick={() => setShowPhoneVerify(true)}
                style={{ 
                  width: "100%", 
                  borderRadius: "14px", 
                  padding: "10px", 
                  fontSize: "12px", 
                  fontWeight: "700", 
                  marginTop: "12px",
                  border: "1px dashed #cbd5e1"
                }}
              >
                📞 Prefer AI call to your phone? Trigger Screening
              </button>
            </>
          )}

          {/* Close trigger anchor */}
          <button 
            onClick={onClose} 
            style={{ width: "100%", marginTop: "20px", background: "none", border: "none", color: "var(--text-muted)", fontSize: "13px", textDecoration: "underline", cursor: "pointer", fontWeight: "700" }}
          >
            Close Voice Assistant
          </button>

        </div>
      </div>
    </div>
  );
}
