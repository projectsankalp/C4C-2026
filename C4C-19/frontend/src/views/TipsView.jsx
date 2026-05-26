import React, { useState, useEffect } from "react";
import { api } from "../services/api";

export default function TipsView({ setActiveTab }) {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [speakingTipId, setSpeakingTipId] = useState(null);

  // Default rich mock tips matching the high-fidelity mockups
  const defaultTips = [
    {
      _id: "tip_1",
      title: "Take BP medicines daily",
      category: "Cardiovascular",
      description: "Never skip your blood pressure medicine. Take it at the same time every day, even if you feel fine.",
      icon: "💊"
    },
    {
      _id: "tip_2",
      title: "Reduce salt intake",
      category: "Nutrition",
      description: "Eating too much salt raises blood pressure. Avoid packaged foods and use less salt while cooking.",
      icon: "🧂"
    },
    {
      _id: "tip_3",
      title: "Walk 30 minutes daily",
      category: "Fitness",
      description: "A 30-minute brisk walk every day helps control blood sugar, blood pressure, and keeps your heart healthy.",
      icon: "🚶"
    },
    {
      _id: "tip_4",
      title: "High sugar damages eyes & kidneys",
      category: "Diabetes",
      description: "Uncontrolled blood sugar over time can damage your eyes, kidneys, and nerves. Check regularly.",
      icon: "⚠️"
    }
  ];

  useEffect(() => {
    const fetchTips = async () => {
      setLoading(true);
      try {
        const res = await api.awareness.getTips();
        if (res.success && res.tips.length > 0) {
          // Merge description templates to map exactly to beautiful screenshots
          const merged = res.tips.map((tip, idx) => {
            const match = defaultTips.find(d => d.title.toLowerCase().includes(tip.title.toLowerCase()));
            return {
              _id: tip._id || `api_${idx}`,
              title: tip.title,
              category: tip.category,
              description: match ? match.description : `Maintain healthy routines for optimal ${tip.category} balance.`,
              icon: match ? match.icon : "🩺"
            };
          });
          setTips(merged);
        } else {
          setTips(defaultTips);
        }
      } catch (err) {
        setTips(defaultTips);
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, []);

  // Browser speech synthesis text-to-speech implementation
  const handleListen = (tip) => {
    const synth = window.speechSynthesis;
    
    if (speakingTipId === tip._id) {
      // If already speaking this tip, cancel speech
      synth.cancel();
      setSpeakingTipId(null);
      return;
    }

    // Stop anything playing currently
    synth.cancel();
    setSpeakingTipId(tip._id);

    const utterance = new SpeechSynthesisUtterance(`${tip.title}. ${tip.description}`);
    
    // Auto reset state on speech end
    utterance.onend = () => {
      setSpeakingTipId(null);
    };
    utterance.onerror = () => {
      setSpeakingTipId(null);
    };

    synth.speak(utterance);
  };

  // Cancel speech synthesis on navigate away
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <>
      {/* Action Header */}
      <div className="action-banner" style={{ paddingBottom: "16px" }}>
        <button className="back-button" onClick={() => setActiveTab("home")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1 style={{ fontSize: "20px" }}>Health Tips</h1>
        <p style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "12px", marginTop: "4px" }}>
          Simple tips for a healthier life
        </p>
      </div>

      <div className="tip-list-container">
        <h2 style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "0.8px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "12px" }}>
          DAILY TIPS
        </h2>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : (
          tips.map(tip => (
            <div key={tip._id} className="tip-item-card premium-card">
              <div className="tip-card-header">
                <div className="tip-category-icon">
                  {tip.icon}
                </div>
                <div>
                  <h3 className="tip-item-title">{tip.title}</h3>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                    {tip.category}
                  </span>
                </div>
              </div>
              
              <p className="tip-item-description">{tip.description}</p>
              
              <button 
                className="tip-btn-listen" 
                onClick={() => handleListen(tip)}
                style={{ 
                  backgroundColor: speakingTipId === tip._id ? "var(--accent-red-bg)" : "var(--primary-light)",
                  color: speakingTipId === tip._id ? "var(--accent-red)" : "var(--primary)"
                }}
              >
                {speakingTipId === tip._id ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: "12px", height: "12px" }}>
                      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
                    </svg>
                    Stop Listening
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: "12px", height: "12px" }}>
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                    Listen
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
