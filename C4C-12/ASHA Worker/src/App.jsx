/**
 * GraamSehat ASHA Worker App - App Router Layout
 * Path: /src/App.jsx
 * Configures the React Router layouts, defines private route auth guards,
 * and renders sticky headers, sync banners, and bottom navigation bars.
 */

import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";
import SyncBanner from "./components/SyncBanner";

// Page Views
import Login from "./pages/Login";
import Home from "./pages/Home";
import ScanCard from "./pages/ScanCard";
import NewRegistration from "./pages/NewRegistration";
import Screening from "./pages/Screening";
import ScreeningResult from "./pages/ScreeningResult";
import MedicineLog from "./pages/MedicineLog";
import MyPatients from "./pages/MyPatients";
import PatientProfile from "./pages/PatientProfile";
import PendingSync from "./pages/PendingSync";
import Settings from "./pages/Settings";

/**
 * Authentication Route Guard.
 * Redirects to /login if user is not verified as approved ASHA.
 */
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <span style={{ fontSize: "40px" }} className="pulse-glow">🏥</span>
        <p style={{ marginTop: "16px", color: "var(--color-text-gray)", fontWeight: "600" }}>Authenticating Session...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export function App() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Sticky App Header (Only visible if logged in and not on login page) */}
      {isAuthenticated && !isLoginPage && (
        <header className="app-header">
          <Link to="/" className="app-title-container" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg viewBox="0 0 100 100" style={{ width: "24px", height: "24px" }}>
              <path d="M 50 82.5 C 50 82.5 22.5 61.5 22.5 42.5 C 22.5 30 32.5 20 45 20 C 50 20 54 22.5 56.5 25.5" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 60 21.5 C 62.5 20 67.5 20 72.5 20 C 85 20 95 30 95 42.5 C 95 61.5 67.5 82.5 67.5 82.5 C 67.5 82.5 59.5 76.5 51 68" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 23 57.5 L 39.5 57.5 L 45 39.5 L 50 75.5 L 55.5 48.5 L 60 61 L 67 57.5 L 77 57.5" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1 className="app-title">{t("appName")}</h1>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link to="/pending-sync" style={{ textDecoration: "none", fontSize: "20px" }} title="Pending Uploads">
              📡
            </Link>
            <Link to="/settings" style={{ textDecoration: "none", fontSize: "20px" }} title="Settings">
              ⚙️
            </Link>
          </div>
        </header>
      )}

      {/* Connectivity Status Banner */}
      {isAuthenticated && !isLoginPage && <SyncBanner />}

      {/* Main Page Viewport Container */}
      <main style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
          
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/scan" element={<PrivateRoute><ScanCard /></PrivateRoute>} />
          <Route path="/new-registration" element={<PrivateRoute><NewRegistration /></PrivateRoute>} />
          <Route path="/screening/:uid" element={<PrivateRoute><Screening /></PrivateRoute>} />
          <Route path="/screening-result" element={<PrivateRoute><ScreeningResult /></PrivateRoute>} />
          <Route path="/medicine-log" element={<PrivateRoute><MedicineLog /></PrivateRoute>} />
          <Route path="/patients" element={<PrivateRoute><MyPatients /></PrivateRoute>} />
          <Route path="/patients/:uid" element={<PrivateRoute><PatientProfile /></PrivateRoute>} />
          <Route path="/pending-sync" element={<PrivateRoute><PendingSync /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Mobile-first bottom navigation bar */}
      {isAuthenticated && !isLoginPage && (
        <nav className="bottom-nav">
          <Link
            to="/"
            className={`bottom-nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            <div className="bottom-nav-icon-container">🏠</div>
            Home
          </Link>
          <Link
            to="/patients"
            className={`bottom-nav-link ${location.pathname.startsWith("/patients") ? "active" : ""}`}
          >
            <div className="bottom-nav-icon-container">👥</div>
            Patients
          </Link>
          <Link
            to="/medicine-log"
            className={`bottom-nav-link ${location.pathname === "/medicine-log" ? "active" : ""}`}
          >
            <div className="bottom-nav-icon-container">💊</div>
            Meds
          </Link>
          <Link
            to="/settings"
            className={`bottom-nav-link ${location.pathname === "/settings" ? "active" : ""}`}
          >
            <div className="bottom-nav-icon-container">⚙️</div>
            Settings
          </Link>
        </nav>
      )}
    </div>
  );
}

export default App;
