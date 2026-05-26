/**
 * @file Navbar.jsx
 * @description Navbar component with sticky glassmorphism styling, responsive mobile drawer, and authentication integration.
 */

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Menu, X, Shield, LogOut, ArrowRight, Download } from "lucide-react";

export const Navbar = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Scroll handler for landing page anchors
  const handleAnchorClick = (e, id) => {
    setIsOpen(false);
    if (location.pathname !== "/") {
      navigate(`/${id}`);
      return;
    }
    
    e.preventDefault();
    const element = document.querySelector(id);
    if (element) {
      const offset = 80; // height of navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform duration-200 p-1.5">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <path d="M 50 82.5 C 50 82.5 22.5 61.5 22.5 42.5 C 22.5 30 32.5 20 45 20 C 50 20 54 22.5 56.5 25.5" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 60 21.5 C 62.5 20 67.5 20 72.5 20 C 85 20 95 30 95 42.5 C 95 61.5 67.5 82.5 67.5 82.5 C 67.5 82.5 59.5 76.5 51 68" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 23 57.5 L 39.5 57.5 L 45 39.5 L 50 75.5 L 55.5 48.5 L 60 61 L 67 57.5 L 77 57.5" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-800 to-teal-600 bg-clip-text text-transparent">
                GraamSehat
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#problem"
              onClick={(e) => handleAnchorClick(e, "#problem")}
              className="text-slate-600 hover:text-teal-600 font-medium transition-colors duration-200"
            >
              Problem
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleAnchorClick(e, "#how-it-works")}
              className="text-slate-600 hover:text-teal-600 font-medium transition-colors duration-200"
            >
              Workflow
            </a>
            <a
              href="#pillars"
              onClick={(e) => handleAnchorClick(e, "#pillars")}
              className="text-slate-600 hover:text-teal-600 font-medium transition-colors duration-200"
            >
              5 Pillars
            </a>
            <a
              href="#stats"
              onClick={(e) => handleAnchorClick(e, "#stats")}
              className="text-slate-600 hover:text-teal-600 font-medium transition-colors duration-200"
            >
              Impact
            </a>
            <a
              href="#downloads"
              onClick={(e) => handleAnchorClick(e, "#downloads")}
              className="text-slate-600 hover:text-teal-600 font-medium transition-colors duration-200"
            >
              Downloads
            </a>
          </div>

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-800">{userProfile?.name || "User"}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">
                    {userProfile?.role}
                  </span>
                </div>
                {userProfile?.role === "asha" && userProfile?.status === "approved" && (
                  <Link
                    to="/downloads"
                    className="p-2.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-800 transition-all border border-teal-200 flex items-center gap-1.5 text-sm font-medium"
                  >
                    <Download className="h-4 w-4" />
                    Console
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-200"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-teal-700 font-semibold text-sm transition-colors duration-200 px-4 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-teal-600/10 hover:shadow-teal-700/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center space-x-1"
                >
                  <span>Register ASHA</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-teal-600 hover:bg-slate-100 focus:outline-none transition-all duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden animate-in slide-in-from-top duration-200 bg-white border-b border-slate-200 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-center border-t border-slate-100">
            <a
              href="#problem"
              onClick={(e) => handleAnchorClick(e, "#problem")}
              className="block px-3 py-3 rounded-lg text-base font-semibold text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors"
            >
              Problem
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleAnchorClick(e, "#how-it-works")}
              className="block px-3 py-3 rounded-lg text-base font-semibold text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors"
            >
              Workflow
            </a>
            <a
              href="#pillars"
              onClick={(e) => handleAnchorClick(e, "#pillars")}
              className="block px-3 py-3 rounded-lg text-base font-semibold text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors"
            >
              5 Pillars
            </a>
            <a
              href="#stats"
              onClick={(e) => handleAnchorClick(e, "#stats")}
              className="block px-3 py-3 rounded-lg text-base font-semibold text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors"
            >
              Impact
            </a>
            <a
              href="#downloads"
              onClick={(e) => handleAnchorClick(e, "#downloads")}
              className="block px-3 py-3 rounded-lg text-base font-semibold text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors"
            >
              Downloads
            </a>

            {/* Auth Section - Mobile */}
            <div className="pt-4 pb-2 border-t border-slate-100 px-3">
              {currentUser ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="text-center">
                    <div className="text-base font-bold text-slate-800">{userProfile?.name}</div>
                    <div className="text-xs inline-block px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200 mt-1">
                      {userProfile?.role}
                    </div>
                  </div>
                  {userProfile?.role === "asha" && userProfile?.status === "approved" && (
                    <Link
                      to="/downloads"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 text-base font-semibold"
                    >
                      <Download className="h-4 w-4" />
                      Downloads Console
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 border border-red-100 text-base font-semibold hover:bg-red-100"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3 rounded-xl text-center font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3 rounded-xl bg-teal-600 text-white text-center font-bold shadow-md shadow-teal-600/10 hover:bg-teal-700 transition-colors"
                  >
                    Register ASHA
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
