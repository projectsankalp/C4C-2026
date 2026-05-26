/**
 * @file VerifyPending.jsx
 * @description Page displayed when an ASHA worker signs up but is waiting for admin verification.
 * Automatically checks for updates and transitions when approved.
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import VerificationBadge from "../components/VerificationBadge";
import { Shield, RefreshCw, LogOut, ArrowLeft } from "lucide-react";

export const VerifyPending = () => {
  const { currentUser, userProfile, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Poll user profile every 6 seconds to see if status changes to 'approved'
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (userProfile?.status === "approved") {
      navigate("/downloads");
      return;
    }

    const interval = setInterval(async () => {
      try {
        await refreshProfile();
      } catch (err) {
        console.error("Error refreshing profile status:", err);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [currentUser, userProfile, navigate, refreshProfile]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphic Rings */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="flex justify-center items-center space-x-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-900 font-bold shadow-lg shadow-teal-500/10">
            <Shield className="h-5 w-5 fill-slate-900/10" />
          </div>
          <span className="text-xl font-bold text-white tracking-wide">
            GraamSehat
          </span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-800/80 backdrop-blur-md py-8 px-6 sm:px-10 rounded-3xl border border-slate-700/50 shadow-2xl text-center">
          
          <div className="mb-6 flex justify-center">
            <VerificationBadge status={userProfile?.status || "pending"} />
          </div>

          <h2 className="text-2xl font-extrabold text-white mb-3">
            Approval Pending
          </h2>

          <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/30 text-left text-xs text-slate-300 space-y-3 mb-8 leading-relaxed">
            <p>
              Hi <span className="text-teal-400 font-bold">{userProfile?.name || "ASHA Worker"}</span>, your application for district <span className="font-semibold text-white">{userProfile?.district || "N/A"}</span> is submitted.
            </p>
            <p>
              Our Block Medical Officers (BMO) are reviewing your credentials. Once approved, your portal access will activate.
            </p>
            <div className="flex items-center gap-2 text-slate-400 pt-2 border-t border-slate-700/50 font-mono">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-500" />
              <span>Checking approval status in real-time...</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleLogout}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-slate-650"
            >
              <LogOut className="h-4.5 w-4.5 text-slate-400" />
              <span>Sign Out</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-teal-600/10 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
              <span>Back Home</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VerifyPending;
