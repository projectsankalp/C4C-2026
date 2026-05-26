/**
 * @file DownloadCard.jsx
 * @description Card module representing a specific application inside the GraamSehat ecosystem, offering public or gated access CTAs.
 */

import React from "react";
import { Link } from "react-router-dom";
import { Smartphone, Monitor, Globe, Check, ArrowRight, Lock } from "lucide-react";

export const DownloadCard = ({ app, onCtaClick }) => {
  const { id, name, description, platform, version, ctaText, isPublic, badge } = app;

  const getPlatformIcon = () => {
    if (id === "admin") return <Monitor className="h-5 w-5 text-indigo-500" />;
    if (id === "villager") return <Globe className="h-5 w-5 text-teal-500" />;
    return <Smartphone className="h-5 w-5 text-blue-500" />;
  };

  const getBadgeStyle = () => {
    if (isPublic) return "bg-teal-50 text-teal-700 border-teal-200";
    if (id === "admin") return "bg-indigo-50 text-indigo-700 border-indigo-200";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 overflow-hidden group">
      {/* Top Accent Strip */}
      <div className={`h-1.5 w-full ${
        id === "villager" ? "bg-teal-500" : id === "asha" ? "bg-blue-600" : "bg-indigo-600"
      }`} />

      <div className="p-6 flex flex-col flex-grow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform duration-200">
            {getPlatformIcon()}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getBadgeStyle()}`}>
            {badge}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-slate-800 mb-2">{name}</h3>
        <p className="text-sm text-slate-500 leading-relaxed flex-grow">{description}</p>

        {/* Metadata Details */}
        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs text-slate-500 mb-6">
          <div>
            <div className="text-slate-400 font-medium">Platform</div>
            <div className="font-semibold text-slate-700 mt-0.5">{platform}</div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Version</div>
            <div className="font-semibold text-slate-700 mt-0.5">{version}</div>
          </div>
        </div>

        {/* Action Button */}
        {isPublic ? (
          <button
            onClick={() => onCtaClick(id)}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
          >
            <span>{ctaText}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => onCtaClick(id)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
          >
            <Lock className="h-4 w-4 text-slate-400" />
            <span>{ctaText}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DownloadCard;
