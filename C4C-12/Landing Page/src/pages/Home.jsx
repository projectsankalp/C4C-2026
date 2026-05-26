/**
 * @file Home.jsx
 * @description Landing page component displaying all brand sections, the 5 Pillars of GraamSehat, and the gated downloads hub.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import HowItWorksSection from "../components/HowItWorksSection";
import StatsSection from "../components/StatsSection";
import DownloadCard from "../components/DownloadCard";
import Footer from "../components/Footer";
import { PILLARS_TEXT, APP_DOWNLOADS } from "../utils/constants";
import { CreditCard, Smartphone, Users, PhoneCall, LayoutDashboard, ArrowRight } from "lucide-react";

export const Home = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  // Helper to scroll to specific anchors on the landing page
  const handleNavigateToSection = (id) => {
    const element = document.querySelector(id);
    if (element) {
      const offset = 80; // height of Navbar
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

  const getPillarIcon = (name) => {
    switch (name) {
      case "CreditCard": return <CreditCard className="h-6 w-6 text-teal-600" />;
      case "Smartphone": return <Smartphone className="h-6 w-6 text-blue-600" />;
      case "Users": return <Users className="h-6 w-6 text-amber-600" />;
      case "PhoneCall": return <PhoneCall className="h-6 w-6 text-purple-600" />;
      case "LayoutDashboard": return <LayoutDashboard className="h-6 w-6 text-emerald-600" />;
      default: return null;
    }
  };

  // Handle gated downloads CTA clicks
  const handleDownloadCtaClick = (id) => {
    if (id === "villager") {
      // Villager App is public - open simulated or real web link
      window.open("https://graamsehat-villager.web.app", "_blank");
    } else if (id === "asha") {
      // Gated to ASHA workers
      if (!currentUser) {
        // Not logged in -> signup
        navigate("/signup");
      } else if (userProfile?.role === "asha") {
        if (userProfile.status === "approved") {
          navigate("/downloads");
        } else {
          navigate("/pending");
        }
      } else {
        // Different role logged in, redirect to downloads console directly to show access alert
        navigate("/downloads");
      }
    } else if (id === "admin") {
      // Admin dashboard login gate
      if (currentUser && userProfile?.role === "admin") {
        window.open("https://graamsehat-admin.web.app", "_blank");
      } else {
        navigate("/login");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection onNavigateToSection={handleNavigateToSection} />

      {/* Problem Statement Section */}
      <FeaturesSection />

      {/* How it Works Section */}
      <HowItWorksSection />

      {/* The 5 Pillars Section */}
      <section id="pillars" className="py-24 bg-slate-50 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {PILLARS_TEXT.title}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 font-light leading-relaxed">
              {PILLARS_TEXT.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PILLARS_TEXT.pillars.map((pillar, index) => (
              <div
                key={index}
                className={`flex flex-col bg-white border ${pillar.color} border-l-4 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className={`p-3 rounded-xl w-fit ${pillar.bg} mb-4`}>
                  {getPillarIcon(pillar.iconName)}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{pillar.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Download Hub Section */}
      <section id="downloads" className="py-24 bg-white border-t border-slate-250/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight animate-fade-in">
              Download Ecosystem Apps
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 font-light leading-relaxed">
              Access the applications powering the GraamSehat network. Gated apps require ASHA employee credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {APP_DOWNLOADS.map((app) => (
              <DownloadCard
                key={app.id}
                app={app}
                onCtaClick={handleDownloadCtaClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
