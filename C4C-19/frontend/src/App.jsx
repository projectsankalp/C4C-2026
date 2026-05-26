import React, { useState, useEffect } from "react";
import MobileFrame from "./components/MobileFrame";
import Navbar from "./components/Navbar";
import ProfilePanel from "./components/ProfilePanel";
import VoiceAssistantPanel from "./components/VoiceAssistantPanel";

// Views
import HomeView from "./views/HomeView";
import CheckView from "./views/CheckView";
import MapView from "./views/MapView";
import AppointView from "./views/AppointView";
import TipsView from "./views/TipsView";
import OnboardingView from "./views/OnboardingView";
import SettingsView from "./views/SettingsView";

// API
import { api } from "./services/api";

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home"); // home, check, appoint, tips, map
  const [onboarded, setOnboarded] = useState(
    localStorage.getItem("arogya_onboarded") === "true"
  );
  
  // Dashboard & State Metrics
  const [healthSummary, setHealthSummary] = useState({
    diabetesRisk: "N/A",
    hypertensionRisk: "N/A",
    lastChecked: "Never",
    heartRate: "72 bpm"
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  
  const languages = ["English", "Hindi", "Kannada"];

  // Load user session on mount
  useEffect(() => {
    const userId = localStorage.getItem("arogya_user_id");
    if (userId) {
      fetchUserProfile(userId);
    } else {
      // Default initial layout mock data for Guest experience
      setHealthSummary({
        diabetesRisk: "Medium",
        hypertensionRisk: "Normal",
        lastChecked: "Today",
        heartRate: "72 bpm"
      });
      setNotifications([
        {
          _id: "notif_welcome",
          title: "Welcome to Arogya-AI!",
          message: "Onboard your patient profile to begin screening.",
          isRead: false
        }
      ]);
    }
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const res = await api.profile.get(userId);
      if (res.success && res.user) {
        setUser(res.user);
        syncDashboardData(userId);
      }
    } catch (err) {
      console.log("Mock offline user session loaded");
      // Fallback local mockup user
      const localGuest = {
        _id: userId,
        name: "Saanvi Shetty",
        phone: "+91 98765 43210",
        language: "English",
        familyHistory: true
      };
      setUser(localGuest);
      setHealthSummary({
        diabetesRisk: "Medium",
        hypertensionRisk: "Normal",
        lastChecked: "Today",
        heartRate: "72 bpm"
      });
    }
  };

  const syncDashboardData = async (userId) => {
    try {
      const res = await api.dashboard.getData(userId);
      if (res.success && res.dashboard) {
        const hSum = res.dashboard.healthSummary;
        
        // Clean risks formats: LOW, MEDIUM, HIGH -> Normal, Medium, High for UI
        const formatRisk = (risk) => {
          if (risk === "LOW") return "Normal";
          if (risk === "MEDIUM") return "Medium";
          if (risk === "HIGH") return "High";
          return risk || "Normal";
        };

        setHealthSummary({
          diabetesRisk: formatRisk(hSum.diabetesRisk),
          hypertensionRisk: formatRisk(hSum.hypertensionRisk),
          lastChecked: res.dashboard.latestHealthRecord ? new Date(res.dashboard.latestHealthRecord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Today",
          heartRate: "72 bpm"
        });

        // Get notifications
        fetchNotifications(userId);
      }
    } catch (err) {
      console.log("Sync dashboard failed, keeping local demo state");
    }
  };

  const fetchNotifications = async (userId) => {
    try {
      const res = await api.notifications.get(userId);
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      // Seed fallback notification alerts
      setNotifications([
        {
          _id: "notif_1",
          title: "Weekly Checkup Reminder",
          message: "Time to complete your regular cardiorespiratory risk questionnaire.",
          isRead: false
        }
      ]);
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      const res = await api.notifications.markRead(id);
      if (res.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    }
  };

  const handleNewPredictionSaved = (record) => {
    const formatRisk = (risk) => {
      if (risk === "LOW") return "Normal";
      if (risk === "MEDIUM") return "Medium";
      if (risk === "HIGH") return "High";
      return risk || "Normal";
    };

    setHealthSummary({
      diabetesRisk: formatRisk(record.diabetesRisk),
      hypertensionRisk: formatRisk(record.hypertensionRisk),
      lastChecked: "Just now",
      heartRate: "72 bpm"
    });

    // Automatically trigger dashboard sync if user is logged in
    if (user) {
      syncDashboardData(user._id);
    }
  };

  const handleChangeLanguage = async (newLang) => {
    if (!user) {
      setUser(prev => ({ ...prev, language: newLang }));
      return;
    }
    try {
      const res = await api.profile.changeLanguage(user._id, newLang);
      if (res.success) {
        setUser(prev => ({ ...prev, language: newLang }));
      }
    } catch (err) {
      setUser(prev => ({ ...prev, language: newLang }));
    }
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setShowAuthModal(false);
    syncDashboardData(authenticatedUser._id);
  };

  const handleOnboardingComplete = (profileDetails) => {
    const newUser = {
      _id: "demo_user_id_" + Date.now(),
      name: profileDetails.name,
      phone: "+91 98765 43210",
      age: profileDetails.age,
      gender: profileDetails.gender,
      height: profileDetails.height,
      weight: profileDetails.weight,
      language: profileDetails.language,
      bpChecked: profileDetails.bpChecked,
      bpValue: profileDetails.bpValue,
      familyHistory: profileDetails.familyHistory
    };
    
    const diabetesRisk = profileDetails.familyHistory ? "Medium" : "Normal";
    const bpStatus = profileDetails.bpChecked ? "Medium" : "Normal";
    
    setHealthSummary({
      diabetesRisk: diabetesRisk,
      hypertensionRisk: bpStatus,
      lastChecked: "Just now",
      heartRate: "72 bpm"
    });

    localStorage.setItem("arogya_user_id", newUser._id);
    localStorage.setItem("arogya_onboarded", "true");
    setUser(newUser);
    setOnboarded(true);
  };

  const handleOnboardingSkip = (lang) => {
    const guestUser = {
      name: "Guest",
      phone: "+91 98765 43210",
      language: lang || "English",
      isGuest: true
    };
    
    setHealthSummary({
      diabetesRisk: "Medium",
      hypertensionRisk: "Normal",
      lastChecked: "Today",
      heartRate: "72 bpm"
    });

    localStorage.setItem("arogya_onboarded", "true");
    setUser(guestUser);
    setOnboarded(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("arogya_user_id");
    localStorage.removeItem("arogya_token");
    localStorage.removeItem("arogya_onboarded");
    setUser(null);
    setOnboarded(false);
    setTab("home");
    setHealthSummary({
      diabetesRisk: "N/A",
      hypertensionRisk: "N/A",
      lastChecked: "Never",
      heartRate: "72 bpm"
    });
    setNotifications([]);
  };

  // View Switching Router
  const renderActiveView = () => {
    switch (tab) {
      case "home":
        return (
          <HomeView
            user={user}
            healthSummary={healthSummary}
            notifications={notifications}
            activeTab={tab}
            setActiveTab={setTab}
            onOpenAuth={() => setShowAuthModal(true)}
            onOpenNotifications={() => setShowNotifications(!showNotifications)}
            showNotifications={showNotifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            onChangeLanguage={handleChangeLanguage}
            languages={languages}
            onOpenVoiceAssistant={() => setShowVoiceAssistant(true)}
          />
        );
      case "check":
        return (
          <CheckView
            user={user}
            onNewPredictionSaved={handleNewPredictionSaved}
            setActiveTab={setTab}
          />
        );
      case "appoint":
        return (
          <AppointView
            user={user}
            setActiveTab={setTab}
          />
        );
      case "tips":
        return (
          <TipsView
            setActiveTab={setTab}
          />
        );
      case "map":
        return (
          <MapView
            user={user}
            healthSummary={healthSummary}
            setActiveTab={setTab}
          />
        );
      case "settings":
        return (
          <SettingsView
            user={user}
            setActiveTab={setTab}
          />
        );
      default:
        return <div>View not found</div>;
    }
  };

  if (!onboarded) {
    return (
      <MobileFrame showBackButton={false}>
        <OnboardingView 
          onOnboardingComplete={handleOnboardingComplete}
          onOnboardingSkip={handleOnboardingSkip}
        />
      </MobileFrame>
    );
  }

  return (
    <MobileFrame 
      onBack={() => setTab("home")} 
      showBackButton={false}
    >
      {renderActiveView()}

      {/* Tab Navigation bottom bar */}
      <Navbar activeTab={tab} setActiveTab={setTab} />

      {/* Sliding Glass Profile Bottom Sheet Panel */}
      {showAuthModal && (
        <ProfilePanel
          user={user}
          healthSummary={healthSummary}
          onClose={() => setShowAuthModal(false)}
          onOpenSettings={() => {
            setShowAuthModal(false);
            setTab("settings");
          }}
          onOpenVoiceTest={async () => {
            setShowAuthModal(false);
            setShowVoiceAssistant(true);
          }}
          onLogout={handleLogout}
        />
      )}

      {/* Voice Assistant Speech Control Panel overlay */}
      {showVoiceAssistant && (
        <VoiceAssistantPanel
          user={user}
          healthSummary={healthSummary}
          activeTab={tab}
          setActiveTab={setTab}
          onClose={() => setShowVoiceAssistant(false)}
        />
      )}
    </MobileFrame>
  );
}
