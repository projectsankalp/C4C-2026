/**
 * @file App.jsx
 * @description Main application component. Configures React Router routes and provides PrivateRoute security wrapper.
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyPending from "./pages/VerifyPending";
import Downloads from "./pages/Downloads";
import { Shield, ExternalLink, LogOut, ArrowLeft } from "lucide-react";

// Security Route Wrapper
const PrivateRoute = ({ children, allowedRoles, checkApproved = true }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center text-white">
        <div className="h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs text-slate-400 font-mono tracking-widest uppercase">Loading Profile...</span>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userProfile?.role)) {
    return <Navigate to="/" replace />;
  }

  if (checkApproved && userProfile?.role === "asha" && userProfile?.status !== "approved") {
    return <Navigate to="/pending" replace />;
  }

  return children;
};

// Simple Admin Redirect Info Page to satisfy routing target
const AdminPortalInfo = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white text-center">
      <div className="max-w-md w-full mx-auto bg-slate-800/80 border border-slate-700/60 p-8 rounded-3xl shadow-2xl">
        <div className="h-12 w-12 bg-emerald-500/15 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto mb-6">
          <Shield className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-extrabold mb-2">Admin Session Active</h2>
        <p className="text-slate-450 text-xs uppercase tracking-wider font-semibold text-teal-400 mb-4">
          Logged in as: {userProfile?.name} (Block Admin)
        </p>
        <p className="text-slate-350 text-sm leading-relaxed mb-8">
          The Admin Dashboard Console is hosted on a secure separate server. Click below to launch the dashboard.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href="https://graamsehat-admin.web.app"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-teal-600 hover:bg-teal-500 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/10 hover:shadow-teal-500/20"
          >
            <span>Launch Admin Console</span>
            <ExternalLink className="h-4.5 w-4.5" />
          </a>
          
          <div className="grid grid-cols-2 gap-3 mt-1">
            <button
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              className="bg-slate-700 hover:bg-slate-650 py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 border border-slate-650"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-slate-700 hover:bg-slate-650 py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 border border-slate-650"
            >
              <ArrowLeft className="h-4 w-4" />
              Main Site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Pending Route (Requires Auth) */}
          <Route
            path="/pending"
            element={
              <PrivateRoute checkApproved={false}>
                <VerifyPending />
              </PrivateRoute>
            }
          />

          {/* Secure Downloads Route */}
          <Route
            path="/downloads"
            element={
              <PrivateRoute allowedRoles={["asha", "admin"]}>
                <Downloads />
              </PrivateRoute>
            }
          />

          {/* Secure Admin Redirect page */}
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminPortalInfo />
              </PrivateRoute>
            }
          />

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
