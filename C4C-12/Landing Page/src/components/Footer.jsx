/**
 * @file Footer.jsx
 * @description Branded footer displaying links, quick resource access, and team attribution.
 */

import React from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-900 font-bold shadow-md shadow-teal-500/10">
                <Shield className="h-4 w-4 fill-slate-900/10" />
              </div>
              <span className="text-lg font-bold text-white tracking-wide">
                GraamSehat
              </span>
            </div>
            <p className="text-sm max-w-sm text-slate-400 leading-relaxed">
              India's first offline-first NFC health ecosystem engineered to empower rural ASHA workers and bypass the constraints of poor connectivity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#problem" className="hover:text-white transition-colors duration-200">
                  The Problem
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors duration-200">
                  Workflow
                </a>
              </li>
              <li>
                <a href="#pillars" className="hover:text-white transition-colors duration-200">
                  The 5 Pillars
                </a>
              </li>
              <li>
                <a href="#downloads" className="hover:text-white transition-colors duration-200">
                  Download Hub
                </a>
              </li>
            </ul>
          </div>

          {/* Security & Access */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Portals
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="hover:text-white transition-colors duration-200">
                  ASHA Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-white transition-colors duration-200">
                  ASHA Registration
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors duration-200">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} GraamSehat. All rights reserved.
          </p>
          <div className="text-xs font-medium text-slate-500 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-800/80">
            Built for <span className="text-teal-400 font-semibold">Code4Change 2026</span> &middot; Team <span className="text-white font-semibold">Algarythm</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
