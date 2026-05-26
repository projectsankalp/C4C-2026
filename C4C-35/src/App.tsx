import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import CreatePlanForm from "./components/CreatePlanForm";
import DashboardView from "./components/DashboardView";
import LoginView from "./components/LoginView";
import { SAMPLE_PRODUCTS } from "./components/SampleProducts";
import { BusinessPlan, UserSession } from "./types";
import { Sparkles, Trash2, ArrowLeft, Lightbulb, Compass, Award } from "lucide-react";
import { useLanguage } from "./i18n/LanguageContext";

export default function App() {
  const { t } = useLanguage();
  const [session, setSession] = useState<UserSession | null>(null);
  const [currentPlan, setCurrentPlan] = useState<BusinessPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<BusinessPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Load saved plans and active session from localStorage on boot
  useEffect(() => {
    try {
      const storedPlans = localStorage.getItem("navyora_plans");
      if (storedPlans) {
        const parsed = JSON.parse(storedPlans);
        if (Array.isArray(parsed)) {
          setSavedPlans(parsed);
          // Auto-load the latest plan if exists
          if (parsed.length > 0) {
            setCurrentPlan(parsed[0]);
          }
        }
      }

      const storedSession = localStorage.getItem("navyora_session");
      if (storedSession) {
        setSession(JSON.parse(storedSession));
      }
    } catch (e) {
      console.error("Failed to load local saved state", e);
    }
  }, []);

  const handleLoginSuccess = (userSession: UserSession) => {
    setSession(userSession);
    localStorage.setItem("navyora_session", JSON.stringify(userSession));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem("navyora_session");
    setCurrentPlan(null);
  };

  // Save specific generated plan helper
  const handleSavePlan = (plan: BusinessPlan) => {
    // Check if details already exist to avoid duplicates
    const isDuplicate = savedPlans.some(
      (p) => p.productName.toLowerCase().trim() === plan.productName.toLowerCase().trim()
    );
    if (isDuplicate) {
      alert("This setup is already saved in your Business Journal!");
      return;
    }

    const updated = [plan, ...savedPlans];
    setSavedPlans(updated);
    localStorage.setItem("navyora_plans", JSON.stringify(updated));
    alert("Saved securely to your Journal!");
  };

  const handleDeletePlan = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPlans.filter((_, i) => i !== index);
    setSavedPlans(updated);
    localStorage.setItem("navyora_plans", JSON.stringify(updated));
    if (currentPlan && savedPlans[index] && currentPlan.productName === savedPlans[index].productName) {
      setCurrentPlan(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleGeneratePlan = async (name: string, description: string, imageBase64?: string, mimeType?: string, fileUrl?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const isVision = !!imageBase64 && !!mimeType;
      const endpoint = isVision ? "/api/generate-strategy-from-image" : "/api/generate-strategy";
      const payload = isVision 
        ? { imageBase64, mimeType } 
        : { productName: name, productDescription: description };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to contact Navyora AI. Please check server status or API secret config.");
      }

      const rawData = await response.json();
      
      // If we did a vision analysis, append the local image URL to display inside our tabs
      const imageAnalysisData = rawData.imageAnalysis;
      if (imageAnalysisData && fileUrl) {
        imageAnalysisData.imageUrl = fileUrl;
      }

      const newPlan: BusinessPlan = {
        ...rawData,
        imageAnalysis: imageAnalysisData,
        createdAt: new Date().toISOString(),
      };

      setCurrentPlan(newPlan);
      // Auto-save generated plan for user convenience
      const updated = [newPlan, ...savedPlans.filter(p => p.productName !== newPlan.productName)];
      setSavedPlans(updated);
      localStorage.setItem("navyora_plans", JSON.stringify(updated));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected issue occurred while speaking with Navyora.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-[#1A237E] font-sans flex flex-col selection:bg-[#FFD93D] selection:text-[#1A237E]">
      {!session ? (
        <LoginView onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          <Header
            savedCount={savedPlans.length}
            onViewHistory={() => setShowHistory(!showHistory)}
            showHistory={showHistory}
            session={session}
            onLogout={handleLogout}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
            
            {/* Left Side Column: Saved History Journal / Navigation */}
            {showHistory && (
              <aside className="w-full lg:w-80 shrink-0 space-y-4 My-aside-journal animate-fade-in text-slate-800">
                <div className="bg-white p-5 rounded-3xl border border-[#F1E4DF] shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F1E4DF] mb-3">
                    <h3 className="text-sm font-black tracking-tight text-[#1A237E] uppercase">
                      📓 {t("app.dashboard.journal")}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFF0F0] text-[#FF6B6B] font-bold">
                      {savedPlans.length} {t("app.dashboard.journal")}
                    </span>
                  </div>

                  {savedPlans.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-xs text-slate-400">{t("app.dashboard.journal.empty")}</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                      {savedPlans.map((plan, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setCurrentPlan(plan);
                            setShowHistory(false);
                          }}
                          className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-start justify-between gap-2 group ${
                            currentPlan?.productName === plan.productName
                              ? "bg-[#FFF0F0] border-[#FF6B6B]/40 ring-1 ring-[#FF6B6B]"
                              : "bg-[#FDF8F5]/50 border-[#F1E4DF] hover:bg-[#FFF0F0]/30 hover:border-slate-200"
                          }`}
                        >
                          <div className="min-w-0 font-semibold text-xs text-slate-700">
                            <h4 className="text-xs font-bold text-[#1A237E] truncate group-hover:text-[#FF6B6B] transition-colors">
                              {plan.productName}
                            </h4>
                            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                              {plan.pricingInsight ? `₹${plan.pricingInsight.minPrice} - ₹${plan.pricingInsight.maxPrice}` : "Analyzing..."}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDeletePlan(idx, e)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100/50 opacity-0 group-hover:opacity-100 transition-all shrink-0 cursor-pointer"
                            title={t("app.dashboard.journal.delete")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Informative Side Card on Empowering Ideas */}
                <div className="bg-[#FFF9C4] p-5 rounded-3xl border border-[#FBC02D] space-y-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#F57F17] flex items-center gap-1">
                    <Award className="w-4 h-4 text-[#F57F17]" /> {t("app.sidebar.rules.title")}
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Start by showcasing to 5 people face-to-face. Give early discount codes, then incrementally scale after gathering positive endorsements. Consistent daily actions beats extensive theory!
                  </p>
                </div>
              </aside>
            )}

            {/* Center / Principal Screen Column */}
            <section className={`flex-1 space-y-8 min-w-0 ${showHistory ? "lg:max-w-4xl" : ""}`}>
              
              {/* Dynamic state notification error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-900 rounded-2xl p-4 text-xs space-y-2 font-semibold">
                  <p className="font-bold text-red-700">{t("app.error.connection.title")}</p>
                  <p>{error}</p>
                  <p className="text-slate-500 text-[10px]">
                    Make sure you have added your verified <strong>GEMINI_API_KEY</strong> secret in the application workspace settings panel.
                  </p>
                  <button 
                    onClick={() => { localStorage.clear(); window.location.reload(); }}
                    className="mt-2 text-[10px] bg-red-100 hover:bg-red-200 px-2 py-1 rounded border border-red-300 transition-colors cursor-pointer"
                  >
                    {t("app.error.connection.reset")}
                  </button>
                </div>
              )}

              {/* Setup / Creation Segment */}
              <div className="space-y-6">
                {!currentPlan && !isLoading && (
                  <div className="bg-[#FFF0F0] border border-[#F1E4DF] rounded-3xl p-6 sm:p-8 text-center space-y-4 max-w-xl mx-auto shadow-sm">
                    <div className="w-16 h-16 bg-[#FF6B6B] rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-lg rotate-3 hover:rotate-0 transition-transform">
                      N
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-extrabold text-[#1A237E] tracking-tight">{t("app.welcome.title")}</h3>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                        Welcome to Navyora. We work with home creators, bakers, fashion crafters, and local artists to turn everyday simple products into real brands. Tell us what you make to get a professional Pricing, Messaging, and First-Customers blueprint.
                      </p>
                    </div>
                    <div className="inline-flex gap-2 text-xs font-semibold text-[#FF6B6B] bg-white border border-[#F1E4DF] px-3.5 py-1.5 rounded-full select-none">
                      🌻 Calculations adaptive to Indian Rupees or global assets
                    </div>
                  </div>
                )}

                <CreatePlanForm onGenerate={handleGeneratePlan} isLoading={isLoading} />
              </div>

              {/* Current Blueprint Dashboard */}
              {currentPlan && !isLoading && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1A237E] uppercase tracking-wider">
                      {t("app.playbook.title")}
                    </span>
                    <button
                      onClick={() => setCurrentPlan(null)}
                      className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-50 border border-[#F1E4DF] rounded-full text-slate-600 text-xs font-medium transition-all shadow-2xs cursor-pointer"
                      title="Make another blueprint"
                    >
                      <ArrowLeft className="w-3 h-3 text-[#FF6B6B]" />
                      <span>{t("app.playbook.new")}</span>
                    </button>
                  </div>
                  <DashboardView plan={currentPlan} onSaveToHistory={handleSavePlan} session={session} />
                </div>
              )}

            </section>

          </main>

          {/* Persistent Elegant Branding Footer Action Bar */}
          <footer className="mt-12 bg-[#1A237E] text-white py-6 border-t border-[#F1E4DF]/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  NAVYORA <span className="text-[10px] text-[#FFD93D]">✦ Micro Entrepreneurship Coach</span>
                </span>
              </div>
              <p className="text-xs text-rose-100/70 font-semibold">
                {t("app.footer.tagline")}
              </p>
              <div className="text-[11px] text-[#FFD93D] font-mono">
                {t("app.footer.empower")}
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
