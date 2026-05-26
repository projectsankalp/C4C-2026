/**
 * @file Downloads.jsx
 * @description Secure downloads dashboard showing the application links. Restricted to approved ASHA workers and Admins.
 */

import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import VerificationBadge from "../components/VerificationBadge";
import { Download, Globe, Shield, LogOut, ArrowLeft, ArrowUpRight, Lock } from "lucide-react";

export const Downloads = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Guard checks (just in case they bypass Route wrappers)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center text-white px-4">
        <Lock className="h-12 w-12 text-slate-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
        <p className="text-slate-400 text-sm mb-6 text-center max-w-xs">
          Please sign in to access the secure downloads console.
        </p>
        <Link to="/login" className="bg-teal-600 px-6 py-2.5 rounded-xl font-bold hover:bg-teal-500 transition-colors">
          Go to Sign In
        </Link>
      </div>
    );
  }

  // If status is pending, display warning message
  if (userProfile?.status === "pending") {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center text-white px-4">
        <div className="bg-slate-800/80 border border-slate-700/60 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
          <div className="mb-6 flex justify-center">
            <VerificationBadge status="pending" />
          </div>
          <h2 className="text-2xl font-extrabold mb-3">Verification Required</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            Your account is pending approval. You will receive an email when approved.
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors text-xs"
            >
              Sign Out
            </button>
            <Link
              to="/"
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl transition-colors text-xs flex items-center justify-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check role: asha or admin
  const isAuthorized = userProfile?.role === "asha" || userProfile?.role === "admin";
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center text-white px-4">
        <div className="bg-slate-800/80 border border-slate-700/60 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
          <h2 className="text-2xl font-extrabold text-red-400 mb-3">Access Denied</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            Your current account role (<span className="font-semibold text-white uppercase">{userProfile?.role}</span>) is not authorized to access these downloads.
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors text-xs"
            >
              Sign Out
            </button>
            <Link
              to="/"
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl transition-colors text-xs flex items-center justify-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Block */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Downloads Hub
              </h1>
              <VerificationBadge status="approved" />
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
              Secure credentials approved. Download the clinical applications to begin your field tasks.
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Link
              to="/"
              className="w-full md:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all text-xs flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Portal Home
            </Link>
            <button
              onClick={handleLogout}
              className="w-full md:w-auto px-5 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold transition-all text-xs flex items-center justify-center gap-1.5 border border-red-100"
            >
              <LogOut className="h-4 w-4" />
              Logout Session
            </button>
          </div>
        </div>

        {/* Download Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Card 1: ASHA Worker App */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow group">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 mb-6 group-hover:scale-105 transition-transform duration-200">
              <Download className="h-6 w-6" />
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                ASHA Worker Application
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Offline-first Android application designed to perform vitals screenings, register patients, and write diagnostics directly to NFC cards.
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-500 space-y-2 mb-8">
                <div className="flex justify-between">
                  <span className="text-slate-400">File Type</span>
                  <span className="font-semibold text-slate-700">Android APK (.apk)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Size</span>
                  <span className="font-semibold text-slate-700">14.8 MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Build Version</span>
                  <span className="font-semibold text-slate-700">v2.0.1-beta</span>
                </div>
              </div>
            </div>

            {/* Note: The links will be replaced later by user when they upload actual APKs. We provide a simulation/placeholder download click */}
            <a
              href="https://github.com/HAFIZ-HAASHIM/GraamSehat/releases/download/v2.0.0/asha_worker_app.apk"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                // Since the file isn't uploaded yet, we prevent default and show alert
                e.preventDefault();
                alert("Downloading ASHA Worker App (v2.0.1-beta) APK installer...\n(This is a placeholder, actual release binary link is mapping to team server)");
              }}
              className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-center shadow-lg shadow-teal-600/10 hover:shadow-teal-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span>Download APK Installer</span>
              <Download className="h-4.5 w-4.5" />
            </a>
          </div>

          {/* Card 2: Villager App */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow group">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 mb-6 group-hover:scale-105 transition-transform duration-200">
              <Globe className="h-6 w-6" />
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Villager Web Application
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Lightweight Progressive Web App (PWA) allowing villagers to scan their cards via Web-NFC, review checkup history, and read health content.
              </p>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-500 space-y-2 mb-8">
                <div className="flex justify-between">
                  <span className="text-slate-400">Application Type</span>
                  <span className="font-semibold text-slate-700">Web Portal / PWA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Compatibility</span>
                  <span className="font-semibold text-slate-700">Chrome, Safari (Web NFC)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Build Version</span>
                  <span className="font-semibold text-slate-700">v1.2.4-stable</span>
                </div>
              </div>
            </div>

            <a
              href="https://graamsehat-villager.web.app"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-center shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span>Launch Villager Web App</span>
              <ArrowUpRight className="h-4.5 w-4.5 text-slate-400" />
            </a>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Downloads;
