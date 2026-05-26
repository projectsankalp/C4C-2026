import React, { useState, useEffect, useRef } from "react";
import { BusinessPlan, ChatMessage, UserSession } from "../types";
import { 
  Coins, 
  Instagram, 
  Send, 
  Check, 
  Copy, 
  Truck, 
  CheckSquare, 
  BookmarkCheck, 
  Sparkles, 
  TrendingUp, 
  Tag, 
  User, 
  HelpCircle, 
  Camera, 
  Briefcase, 
  Plus, 
  Trash2, 
  ShoppingBag,
  Settings,
  Edit3,
  Moon,
  Sun,
  Download,
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { toPng } from "html-to-image";

interface DashboardViewProps {
  plan: BusinessPlan;
  onSaveToHistory?: (plan: BusinessPlan) => void;
  session?: UserSession | null;
  onLogout?: () => void;
  activeTabTrigger?: { tab: string; subTab?: string; timestamp: number } | null;
}

export default function DashboardView({ plan, onSaveToHistory, session, onLogout, activeTabTrigger }: DashboardViewProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"pricing" | "marketing" | "outreach" | "improvements" | "strategy" | "companion" | "image-analysis" | "business-dashboard">( 
    plan.imageAnalysis ? "image-analysis" : "pricing" 
  );
  
  // Interactive client price calculator state
  const [materialCost, setMaterialCost] = useState<number>(120);
  const [hoursMade, setHoursMade] = useState<number>(2);
  const [hourlyWage, setHourlyWage] = useState<number>(80);
  const [profitMargin, setProfitMargin] = useState<number>(50);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Outreach editable message state
  const [outreachMessage, setOutreachMessage] = useState<string>("");
  const [immediateActionsDone, setImmediateActionsDone] = useState<Record<number, boolean>>({});

  // Completed improvements state
  const [completedImprovements, setCompletedImprovements] = useState<Record<number, boolean>>({});

  // Active editable Marketing Post state
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [postTagline, setPostTagline] = useState("✦ Hand-Made Pure Creation ✦");
  const [postCta, setPostCta] = useState("DM now to order");
  const [postPrice, setPostPrice] = useState<number>(299);
  const [showPrice, setShowPrice] = useState(true);
  const [postTheme, setPostTheme] = useState<"sunset" | "royal" | "forest" | "lavender" | "berry" | "marigold">("marigold");
  const [postIllustration, setPostIllustration] = useState<"floral" | "mandala" | "stars" | "minimal-geometric" | "sparkles">("floral");
  const [showMarketingEditor, setShowMarketingEditor] = useState(false);

  // Simple Business Dashboard States
  const [productsCreated, setProductsCreated] = useState<number>(12);
  const [orders, setOrders] = useState<Array<{
    id: string;
    customerName: string;
    productName: string;
    quantity: number;
    price: number;
    status: "Pending" | "Sold" | "Delivered";
    date: string;
  }>>([]);

  const [newOrderCustomer, setNewOrderCustomer] = useState("");
  const [newOrderQty, setNewOrderQty] = useState(1);
  const [newOrderPrice, setNewOrderPrice] = useState<number>(plan.pricingInsight?.minPrice || 299);
  const [newOrderStatus, setNewOrderStatus] = useState<"Pending" | "Sold" | "Delivered">("Pending");

  // Custom User Profile, Settings & Dark Theme States
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currencySymbol, setCurrencySymbol] = useState<string>("₹");
  const [profileName, setProfileName] = useState<string>("Pranjali Sen");
  const [profileShopName, setProfileShopName] = useState<string>("Pranjali's Artisanal Soaps");
  const [profileCategory, setProfileCategory] = useState<string>("Handcrafted Organic Skincare");
  const [profileContact, setProfileContact] = useState<string>("+91 98765 43210");
  const [profileBio, setProfileBio] = useState<string>("Handcrafting small-batch lavender essentials and aromatic skincare items using premium, organic home-sourced ingredients.");
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [dashboardSubTab, setDashboardSubTab] = useState<"performance" | "profile" | "settings">("performance");

  // Keep profile settings in sync with user login session
  useEffect(() => {
    if (session) {
      if (session.isGuest) {
        setProfileName("Guest Creator");
        setProfileShopName("Temporary Guest Shop 🌻");
        setProfileCategory("Hobby Artisanal Creator");
        setProfileContact("Guest Access");
        setProfileBio("Using standard guest mode to formulate item prices, direct whatsapp pitches, and analyze crafted products.");
      } else {
        setProfileName(session.name);
        try {
          const storedUsersStr = localStorage.getItem("navyora_users") || "[]";
          const storedUsers = JSON.parse(storedUsersStr);
          const matched = storedUsers.find((u: any) => u.emailOrPhone === session.emailOrPhone);
          if (matched && matched.shopName) {
            setProfileShopName(matched.shopName);
          } else {
            setProfileShopName(`${session.name}'s Creative Studio`);
          }
        } catch (e) {
          setProfileShopName(`${session.name}'s Creative Studio`);
        }
        setProfileCategory("Partner Artisanal Crafter");
        setProfileContact(session.emailOrPhone);
        setProfileBio(`Handcrafting beautiful custom batches under Navyora guidance to bring chemicals-free solutions to local friends.`);
      }
    }
  }, [session]);

  // Interaction handlers for Business Dashboard
  const handleAddManualOrder = () => {
    if (!newOrderCustomer.trim()) return;
    const newOrd = {
      id: Date.now().toString(),
      customerName: newOrderCustomer.trim(),
      productName: plan.productName || "Handmade Product",
      quantity: newOrderQty,
      price: newOrderPrice,
      status: newOrderStatus,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    };
    setOrders(prev => [newOrd, ...prev]);
    setNewOrderCustomer("");
    setNewOrderQty(1);
    setNewOrderStatus("Pending");
  };

  const simulateRandomSale = () => {
    const clients = [
      "Mrs. Kapoor (Society President)",
      "Vineeta Nair (Instagram DM)",
      "Reema Bhatia (Flat 102)",
      "Suman (Primary School Teacher)",
      "Poonam Sen (Colleague)",
      "Meera (Gym Buddy)",
      "Dr. Kavitha (Family Doctor)",
      "Kiran (Society Ladies Club)"
    ];
    const randomClient = clients[Math.floor(Math.random() * clients.length)];
    const randomQty = Math.floor(Math.random() * 3) + 1; // 1 to 3
    const randomStatus = (["Pending", "Sold", "Delivered"] as const)[Math.floor(Math.random() * 3)];
    
    const newOrd = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      customerName: randomClient,
      productName: plan.productName || "Handmade Product",
      quantity: randomQty,
      price: plan.pricingInsight?.minPrice || 299,
      status: randomStatus,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    };
    setOrders(prev => [newOrd, ...prev]);
  };

  const updateOrderStatus = (id: string, st: "Pending" | "Sold" | "Delivered") => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: st } : o));
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  // AI Companion Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize specific companion chat for active plan
  useEffect(() => {
    if (plan) {
      setChatMessages([
        {
          sender: "companion",
          text: `Namaste! I am your Navyora AI Companion—your dedicated micro-enterprise coach. I am ready to help you implement, refine, and grow your **${plan.productName}** business. \n\nI can answer any doubts about your pricing (${currencySymbol}${plan.pricingInsight.minPrice} - ${currencySymbol}${plan.pricingInsight.maxPrice}), help write custom outreach messages, or guide you step-by-step through Levels 1, 2, and 3.\n\nWhat is on your mind? Here are some quick starting guides you can tap immediately below:`,
          createdAt: new Date().toISOString()
        }
      ]);
      setChatError(null);
      setCompletedImprovements({});
      setImmediateActionsDone({});
      if (plan.imageAnalysis) {
        setActiveTab("image-analysis");
      } else {
        setActiveTab("pricing");
      }

      // Initialize Marketing Post states
      const isSoap = plan.productName?.toLowerCase().includes("soap") || plan.productName?.toLowerCase().includes("lavender") || false;
      setPostTitle(plan.productName || "Handmade Lavender Soap");
      setPostCaption(plan.marketingKit?.instagramCaption || (isSoap ? `🚨 HURRY! Extremely limited quantities of our premium batch of Handmade Lavender Soap remain.\n\nEach peace of work takes meticulous care and cannot be rushed. Tap below or DM now to secure yours before they disappear!\n\n#HandmadeSoapIndia #VocalForLocal #GlowNaturally #LavenderLove #ChemicalFreeSkin #HomegrownBrand #SelfCareIndia` : ""));
      setPostDescription(plan.marketingKit?.productDescription || (isSoap ? "Premium hand-sourced Handmade Lavender Soap prepared in micro quantities with gorgeous custom styling details." : ""));
      setPostTagline(isSoap ? "⏳ LAST FEW PACKS REMAINING ⏳" : "✦ Hand-Made Pure Creation ✦");
      setPostPrice(plan.pricingInsight?.minPrice || (isSoap ? 150 : 299));
      setShowPrice(true);
      setPostTheme(isSoap ? "lavender" : "marigold");
      setPostIllustration("floral");
      setShowMarketingEditor(false);
      const cleanProdName = (plan.productName || "product").replace(/^handmade\s+/i, "");
      if (isSoap) {
        setPostCta("Limited stock available! DM now to order");
        setOutreachMessage(`Hey! I just started selling handmade Lavender Soap. Would love your support 😊`);
      } else {
        setPostCta("DM now to order");
        setOutreachMessage(
          plan.firstCustomersPlan?.messageToSend ||
          `Hey! I just started selling handmade ${cleanProdName}. Would love your support 😊`
        );
      }

      // Initialize Business Dashboard & Profile
      setProductsCreated(12);
      setNewOrderPrice(plan.pricingInsight?.minPrice || 299);
      
      // Auto-set profile brand & category if not customized
      setProfileShopName(`${plan.productName || "My Artisanal"} Studio`);
      setProfileCategory(plan.productName?.toLowerCase().includes("soap") ? "Organic Bath & Body Care" : "Handcrafted Homebrand");
      
      setOrders([
        {
          id: "1",
          customerName: "Mrs. Sharma (Neighbor)",
          productName: plan.productName || "Handmade Product",
          quantity: 2,
          price: plan.pricingInsight?.minPrice || 250,
          status: "Delivered",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        },
        {
          id: "2",
          customerName: "Anjali (Colleague)",
          productName: plan.productName || "Handmade Product",
          quantity: 1,
          price: plan.pricingInsight?.minPrice || 250,
          status: "Sold",
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        },
        {
          id: "3",
          customerName: "Priya (Society Group)",
          productName: plan.productName || "Handmade Product",
          quantity: 3,
          price: plan.pricingInsight?.minPrice || 250,
          status: "Pending",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        }
      ]);
    }
  }, [plan]);

  const applyTemplate = (templateType: "festive" | "launch" | "limited" | "daily") => {
    switch (templateType) {
      case "festive":
        setPostTagline("🎉 Special Festive Celebration Delight!");
        setPostCta("Limited stock available! DM now to order");
        setPostTheme("marigold");
        setPostIllustration("mandala");
        setPostCaption(`✨ Celebrate this festive season with our local, hand-crafted special: ${plan.productName}! Perfect for gifting, sharing, and creating loving startup memories.\n\n💖 100% home-made, premium quality, and crafted with absolute sincerity. Quick ordering open today!\n\n${plan.marketingKit?.hashtags?.join(" ") || "#festival #handmade #gifts"}`);
        setPostDescription(`Traditional artisan ${plan.productName} designed to bring warm smiles and deep cultural purity to your loving family.`);
        break;
      case "launch":
        setPostTagline("✨ EXCITED TO INTRODUCE! ✨");
        setPostCta("Be the first to try! DM to order");
        setPostTheme("royal");
        setPostIllustration("sparkles");
        setPostCaption(`🚀 Freshly launched from our home studio! Presenting our newest creation: ${plan.productName}.\n\nWe have spent weeks perfecting the pure materials, aesthetic style, and premium utility. Booking open today for our first batch!\n\n${plan.marketingKit?.hashtags?.join(" ") || "#newlaunch #handmade #original"}`);
        setPostDescription(`Our newly perfected signature ${plan.productName} designed to raise high-quality local standard benchmarks.`);
        break;
      case "limited":
        setPostTagline("⏳ LAST FEW PACKS REMAINING ⏳");
        setPostCta("Limited stock available! DM now to order");
        setPostTheme("berry");
        setPostIllustration("stars");
        setPostCaption(`🚨 HURRY! Extremely limited quantities of our premium batch of ${plan.productName} remain.\n\nEach peace of work takes meticulous care and cannot be rushed. Tap below or DM now to secure yours before they disappear!\n\n${plan.marketingKit?.hashtags?.join(" ") || "#limitededition #rushhour #exclusives"}`);
        setPostDescription(`Premium hand-sourced ${plan.productName} prepared in micro quantities with gorgeous custom styling details.`);
        break;
      case "daily":
        setPostTagline("🌿 Handmade Daily Perfection 🌿");
        setPostCta("DM now to order");
        setPostTheme("forest");
        setPostIllustration("floral");
        setPostCaption(`🌿 Elevate your ordinary routine into an eco-friendly mindful ritual with our humble ${plan.productName}.\n\nDesigned for everyday reliability and wholesome, safe purity. Crafted locally with absolute trust.\n\n${plan.marketingKit?.hashtags?.join(" ") || "#dailyessentials #goodvibes #gogreen"}`);
        setPostDescription(`Sustainably sourced, fresh, daily-purified ${plan.productName} prepared by hand for reliable everyday satisfaction.`);
        break;
    }
  };

  // Smooth scroll Chat container to bottom on messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading]);

  // Action to send message to /api/companion-chat
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : chatInput;
    if (!textToSend.trim()) return;

    if (isChatLoading) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: textToSend,
      createdAt: new Date().toISOString()
    };

    // Prepare updated list
    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    if (customText === undefined) {
      setChatInput("");
    }
    setIsChatLoading(true);
    setChatError(null);

    try {
      const response = await fetch("/api/companion-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: plan.productName,
          productDescription: plan.productDescription,
          pricingInsight: plan.pricingInsight,
          marketingKit: plan.marketingKit,
          firstCustomersPlan: plan.firstCustomersPlan,
          improvements: plan.improvements,
          sellingGrowthStrategy: plan.sellingGrowthStrategy,
          imageAnalysis: plan.imageAnalysis,
          chatHistory: updated.slice(-6).map(m => ({ sender: m.sender, text: m.text })), // Last 6 history
          userMessage: textToSend
        })
      });

      if (!response.ok) {
        throw new Error("Unable to contact Navyora AI Server.");
      }

      const resData = await response.json();
      const companionMsg: ChatMessage = {
        sender: "companion",
        text: resData.reply,
        createdAt: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, companionMsg]);
    } catch (err: any) {
      console.error(err);
      setChatError("We're having a temporary issue speaking with your coach. Ensure your internet is active or try again.");
    } finally {
      setIsChatLoading(false);
    }
  };

  // Safe formatting renderer helper split on ** for bolding
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, blockIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={blockIdx} className="leading-relaxed mb-2.5 text-xs sm:text-sm">
          {parts.map((part, idx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={idx} className="font-extrabold text-[#1A237E]">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  // Pricing math calculations
  const calculatedCostPrice = Number(materialCost) + (Number(hoursMade) * Number(hourlyWage));
  const calculatedSellingPrice = Math.round(calculatedCostPrice * (1 + profitMargin / 100));
  const calculatedProfit = calculatedSellingPrice - calculatedCostPrice;

  const triggerCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const downloadPostImage = async () => {
    const el = document.getElementById("graphic-canvas-preview");
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { quality: 1, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `${plan.productName || "navyora-post"}.png`;
      link.href = dataUrl;
      link.click();
      setCopiedText("Post image downloaded");
      setTimeout(() => setCopiedText(null), 2500);
    } catch {
      setCopiedText("Failed to download");
      setTimeout(() => setCopiedText(null), 2500);
    }
  };

  const toggleImprovement = (index: number) => {
    setCompletedImprovements(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const isGoodMargin = plan.pricingInsight.profitability.toLowerCase().includes("good");

  return (
    <div className={`p-5 sm:p-6 rounded-3xl border space-y-6 animate-fade-in shadow-xs transition-colors duration-300 ${isDarkMode ? "bg-[#090C22] border-[#161C4C] text-slate-100" : "bg-[#FDF8F5] border-[#F1E4DF] text-[#1A237E]"}`}>
      
      {/* Top Banner / Plan Summary Header */}
      <div className={`rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border relative overflow-hidden transition-colors ${isDarkMode ? "bg-[#11163F] border-[#1C256E]" : "bg-[#1A237E] border-[#F1E4DF]/10"}`}>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-6 translate-y-6">
          <Sparkles className="w-48 h-48 text-[#FFD93D]" />
        </div>
        <div className="z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-[#FF6B6B] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-xs transform -rotate-1">
            <Tag className="w-3.5 h-3.5" /> {t("app.dashboard.masterPlan")}
          </div>
          <h3 className="text-xl sm:text-3xl font-black tracking-tight pt-1 text-white">{plan.productName}</h3>
          <p className="text-xs sm:text-sm text-slate-200 font-light max-w-xl md:line-clamp-2">
            {plan.productDescription || "Empowering women creators to turn home-crafted items into premium small brands."}
          </p>
        </div>
        
        <div className="z-10 shrink-0 flex items-center gap-2.5">
          {/* Real-time Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`flex items-center justify-center p-2.5 rounded-full border transition-all active:scale-95 cursor-pointer`}
            style={{ 
              backgroundColor: isDarkMode ? "#FFD93D" : "rgba(255, 255, 255, 0.1)",
              borderColor: isDarkMode ? "#FFD93D" : "rgba(255, 255, 255, 0.25)",
              color: isDarkMode ? "#1A237E" : "#FFFFFF"
            }}
            title={isDarkMode ? t("app.dashboard.theme.sunny") : t("app.dashboard.theme.midnight")}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {onSaveToHistory && (
            <button
              onClick={() => onSaveToHistory(plan)}
              className="flex items-center gap-2 px-5 py-3 bg-[#FF6B6B] hover:bg-[#ff5252] active:scale-95 text-white font-black text-xs rounded-full shadow-md transition-all uppercase tracking-wider"
            >
              <BookmarkCheck className="w-4 h-4 text-[#FFD93D]" />
              {t("app.dashboard.save")}
            </button>
          )}
        </div>
      </div>

      {/* Action Tabs Menu */}
      <div className={`flex flex-wrap items-center border p-2 rounded-2xl gap-1.5 shadow-2xs transition-all ${isDarkMode ? "bg-[#11163F] border-[#1C256E]" : "bg-white border-[#F1E4DF]"}`}>
        {plan.imageAnalysis && (
          <button
            onClick={() => setActiveTab("image-analysis")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "image-analysis"
                ? "bg-[#FF6B6B] text-white shadow-sm"
                : isDarkMode
                  ? "text-slate-300 hover:bg-white/5 hover:text-white"
                  : "text-[#1A237E] hover:bg-[#FFF0F0] hover:text-[#FF6B6B]"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>📸 {t("app.dashboard.imageAnalysis")}</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("pricing")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "pricing"
              ? "bg-[#FF6B6B] text-white shadow-sm"
              : isDarkMode
                ? "text-slate-300 hover:bg-white/5 hover:text-white"
                : "text-[#1A237E] hover:bg-[#FFF0F0] hover:text-[#FF6B6B]"
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>{t("app.dashboard.pricing")}</span>
        </button>

        <button
          onClick={() => setActiveTab("marketing")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "marketing"
              ? "bg-[#FF6B6B] text-white shadow-sm"
              : isDarkMode
                ? "text-slate-300 hover:bg-white/5 hover:text-white"
                : "text-[#1A237E] hover:bg-[#FFF0F0] hover:text-[#FF6B6B]"
          }`}
        >
          <Instagram className="w-4 h-4" />
          <span>{t("app.dashboard.marketing")}</span>
        </button>

        <button
          onClick={() => setActiveTab("outreach")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "outreach"
              ? "bg-[#FF6B6B] text-white shadow-sm"
              : isDarkMode
                ? "text-slate-300 hover:bg-white/5 hover:text-white"
                : "text-[#1A237E] hover:bg-[#FFF0F0] hover:text-[#FF6B6B]"
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{t("app.dashboard.outreach")}</span>
        </button>

        <button
          onClick={() => setActiveTab("improvements")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "improvements"
              ? "bg-[#FF6B6B] text-white shadow-sm"
              : isDarkMode
                ? "text-slate-300 hover:bg-white/5 hover:text-white"
                : "text-[#1A237E] hover:bg-[#FFF0F0] hover:text-[#FF6B6B]"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>{t("app.dashboard.improvements")}</span>
        </button>

        <button
          onClick={() => setActiveTab("strategy")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "strategy"
              ? "bg-[#FF6B6B] text-white shadow-sm"
              : isDarkMode
                ? "text-slate-300 hover:bg-white/5 hover:text-white"
                : "text-[#1A237E] hover:bg-[#FFF0F0] hover:text-[#FF6B6B]"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{t("app.dashboard.strategy")}</span>
        </button>

        <button
          onClick={() => setActiveTab("business-dashboard")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "business-dashboard"
              ? "bg-[#FF6B6B] text-white shadow-sm"
              : isDarkMode
                ? "text-slate-200 bg-white/10 hover:bg-white/15"
                : "text-[#1A237E] hover:bg-[#FFF0F0] hover:text-[#FF6B6B]"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{t("app.dashboard.business")}</span>
        </button>

        <button
          onClick={() => setActiveTab("companion")}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "companion"
              ? isDarkMode ? "bg-amber-400 text-slate-900 shadow-sm ring-2 ring-amber-300/40" : "bg-[#1A237E] text-[#FFD93D] shadow-sm ring-2 ring-[#FF6B6B]/40"
              : isDarkMode
                ? "text-slate-300 hover:bg-white/5"
                : "text-[#1A237E] hover:bg-[#FFF0F0] hover:text-[#FF6B6B]"
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#FF6B6B] animate-pulse" />
          <span>{t("app.dashboard.companion")}</span>
        </button>
      </div>

      {/* Copy notification popup */}
      {copiedText && (
        <div className="fixed bottom-6 right-6 bg-[#1A237E] text-white border border-[#FFD93D]/30 px-5 py-3 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2.5 z-50 animate-bounce">
          <div className="w-5 h-5 bg-[#FF6B6B] rounded-full flex items-center justify-center text-white">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>Copied {copiedText}! Paste directly to share.</span>
        </div>
      )}

      {/* Tab Contents */}
      <div className={`rounded-3xl border p-6 shadow-xs min-h-[350px] transition-colors duration-300 ${isDarkMode ? "bg-[#11163F] border-[#1C256E] text-slate-100" : "bg-white border-[#F1E4DF] text-slate-800"}`}>
        
        {/* OPTIONAL TAB: IMAGE ANALYSIS & INSTANT AUDITING REVIEWS */}
        {activeTab === "image-analysis" && plan.imageAnalysis && (
          <div className="space-y-8 animate-fade-in text-slate-800">
            {/* 1. Header & Image Frame */}
            <div className="bg-[#FFF0F0]/50 rounded-3xl p-5 border border-[#F1E4DF] grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {plan.imageAnalysis.imageUrl && (
                <div className="md:col-span-4 flex justify-center">
                  <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-md max-w-[200px] aspect-square">
                    <img 
                      src={plan.imageAnalysis.imageUrl} 
                      alt="Analyzed product pic" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 right-2 bg-emerald-600 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Analyzed
                    </div>
                  </div>
                </div>
              )}
              <div className={`${plan.imageAnalysis.imageUrl ? "md:col-span-8" : "md:col-span-12"} space-y-4`}>
                <div className="space-y-1">
                  <span className="text-[10px] bg-[#1A237E] text-white font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                    🤖 Navyora Vision Engine Result
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#1A237E] pt-1.5">
                    Detected: {plan.imageAnalysis.productIdentified.name}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-3.5 rounded-2xl border border-[#F1E4DF] shadow-3xs pt-2">
                    <p className="text-[10px] font-black uppercase text-[#FF6B6B] tracking-wider">📦 Product Category</p>
                    <p className="text-xs sm:text-sm font-bold text-[#1A237E] mt-0.5">{plan.imageAnalysis.productIdentified.category || "Home-crafted Creations"}</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-[#F1E4DF] shadow-3xs pt-2">
                    <p className="text-[10px] font-black uppercase text-[#FF6B6B] tracking-wider">🎯 Primary Use-case</p>
                    <p className="text-xs sm:text-sm font-bold text-[#1A237E] mt-0.5">{plan.imageAnalysis.productIdentified.useCase || "Gift Gifting & Premium Decor"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Audio/Structured feedback panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Packaging Feedback */}
              <div className="bg-white rounded-3xl border border-[#F1E4DF] p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#F1E4DF]">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    📦
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#1A237E] uppercase tracking-wider">
                    Packaging Feedback
                  </h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-emerald-500/5 p-3.5 rounded-xl border border-emerald-500/10">
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">✅ What Looks Good</p>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
                      {plan.imageAnalysis.feedback.packaging.looksGood}
                    </p>
                  </div>
                  <div className="bg-rose-500/5 p-3.5 rounded-xl border border-rose-500/10">
                    <p className="text-[10px] font-black text-rose-700 uppercase tracking-widest">⚠️ Code for Improvement</p>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
                      {plan.imageAnalysis.feedback.packaging.needsImprovement}
                    </p>
                  </div>
                </div>
              </div>

              {/* Design Feedback */}
              <div className="bg-white rounded-3xl border border-[#F1E4DF] p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#F1E4DF]">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    🎨
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#1A237E] uppercase tracking-wider">
                    Design & Visual Appeal
                  </h4>
                </div>
                <div className="space-y-2.5 text-xs text-slate-700">
                  <p className="leading-relaxed">
                    <strong className="text-[#1A237E] block text-[10px] uppercase font-black tracking-wider mb-0.5 text-indigo-600">✨ Visual Appeal Index</strong>
                    {plan.imageAnalysis.feedback.design.visualAppeal}
                  </p>
                  <div className="h-px bg-slate-100" />
                  <p className="leading-relaxed">
                    <strong className="text-[#1A237E] block text-[10px] uppercase font-black tracking-wider mb-0.5 text-indigo-600">💎 Design Uniqueness</strong>
                    {plan.imageAnalysis.feedback.design.uniqueness}
                  </p>
                  <div className="h-px bg-slate-100" />
                  <p className="leading-relaxed">
                    <strong className="text-[#1A237E] block text-[10px] uppercase font-black tracking-wider mb-0.5 text-indigo-600">🛠️ Micro-Improvements Recommended</strong>
                    {plan.imageAnalysis.feedback.design.improvements}
                  </p>
                </div>
              </div>
            </div>

            {/* Market Positioning Card */}
            <div className="bg-[#1A237E] text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 text-8xl">
                🎯
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🎯</span>
                <h4 className="text-xs font-black uppercase tracking-widest text-[#FFD93D]">Market Positioning & Customer Match</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-slate-300 tracking-wider">Who this is suitable for</p>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed">{plan.imageAnalysis.feedback.marketPositioning.suitableFor}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-slate-300 tracking-wider">Premium vs budget positioning</p>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed">{plan.imageAnalysis.feedback.marketPositioning.tier}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-slate-300 tracking-wider">When it can sell best</p>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed">{plan.imageAnalysis.feedback.marketPositioning.bestSalesOccasions}</p>
                </div>
              </div>
            </div>

            {/* 3. Actionable suggestions list */}
            <div className="bg-slate-50 border border-[#F1E4DF] rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#F1E4DF]">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  🚀
                </div>
                <h4 className="text-xs sm:text-sm font-extrabold text-[#1A237E] uppercase tracking-wider">
                  Actionable Photo-Upgrade Plan
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs space-y-1 hover:border-[#FF6B6B]/30 transition-all pt-2.5">
                  <span className="text-[10px] font-black text-[#FF6B6B] block">🏷️ PACKAGING UPGRADES</span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{plan.imageAnalysis.improvements[0] || "Upgrade container box, tie with high contrast cords."}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs space-y-1 hover:border-[#FF6B6B]/30 transition-all pt-2.5">
                  <span className="text-[10px] font-black text-[#FF6B6B] block">🎗️ BRANDING IDEAS</span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{plan.imageAnalysis.improvements[1] || "Produce dynamic physical brand label tags or card greetings."}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs space-y-1 hover:border-[#FF6B6B]/30 transition-all pt-2.5">
                  <span className="text-[10px] font-black text-[#FF6B6B] block">💸 VALUE PERCEPTION</span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{plan.imageAnalysis.improvements[2] || "Emphasize raw materials or organic origin to improve value perception."}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs space-y-1 hover:border-[#FF6B6B]/30 transition-all pt-2.5">
                  <span className="text-[10px] font-black text-[#FF6B6B] block">📸 PHOTOGRAPHY TIPS</span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{plan.imageAnalysis.improvements[3] || "Photograph on clean textured backdrops near direct windows."}</p>
                </div>
              </div>
            </div>

            {/* 4. Marketing Use Outputs */}
            <div className="bg-[#FFF0F0]/20 p-5 rounded-3xl border border-[#F1E4DF] space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0F0] text-[#FF6B6B] flex items-center justify-center">
                  <Instagram className="w-4 h-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-extrabold text-[#1A237E] uppercase tracking-wider">
                  Visual-Match Copywriter Tools
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual Instagram Caption */}
                <div className="bg-white p-5 rounded-2xl border border-[#F1E4DF] space-y-3 relative group shadow-3xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[10px] font-black uppercase text-[#FF6B6B] tracking-wider">📸 Instagram Caption</span>
                    <button
                      onClick={() => triggerCopy(plan.imageAnalysis!.marketing.instagramCaption, "Caption")}
                      className="text-[#1A237E] hover:text-[#FF6B6B] transition-colors p-1"
                      title="Copy Caption"
                    >
                      <Copy className="w-4 h-4 cursor-pointer" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed italic">
                    {plan.imageAnalysis.marketing.instagramCaption}
                  </p>
                </div>

                {/* Premium Product Description / CTA */}
                <div className="bg-white p-5 rounded-2xl border border-[#F1E4DF] space-y-3 relative group shadow-3xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[10px] font-black uppercase text-[#1A237E] tracking-wider">💎 Product Description & CTA</span>
                    <button
                      onClick={() => triggerCopy(`${plan.imageAnalysis!.marketing.productDescription}\n\n👉 CTA: ${plan.imageAnalysis!.marketing.cta}`, "Narrative")}
                      className="text-[#1A237E] hover:text-[#FF6B6B] transition-colors p-1"
                      title="Copy Narrative"
                    >
                      <Copy className="w-4 h-4 cursor-pointer" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                      {plan.imageAnalysis.marketing.productDescription}
                    </p>
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl mt-2">
                      <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block">Pro-CTA Command</span>
                      <p className="text-xs font-bold text-emerald-700 mt-1">🗣️ {plan.imageAnalysis.marketing.cta}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 1: PRICING & PROFITS */}
        {activeTab === "pricing" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Target Ranges - Deep Blue Premium Card style */}
              <div className="lg:col-span-7 bg-[#1A237E] text-white p-6 rounded-3xl shadow-md flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-wider text-[#FFD93D]">💰 Pricing Insight</h4>
                  <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${
                    isGoodMargin ? "bg-[#2E7D32] text-white" : "bg-[#FF6B6B] text-white"
                  }`}>
                    {plan.pricingInsight.profitability.toUpperCase()} (approx 3.5x margin)
                  </span>
                </div>

                <div className="py-2">
                  <p className="text-xs text-slate-300 uppercase tracking-widest font-bold">Suggested Brand Selling Price</p>
                  <p className="text-4xl sm:text-5xl font-black mt-1 bg-gradient-to-r from-white to-[#FFD93D] bg-clip-text text-transparent">
                    {currencySymbol}{plan.pricingInsight.minPrice} – {currencySymbol}{plan.pricingInsight.maxPrice}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs font-black uppercase text-[#FFD93D] tracking-wide">Market Rationale:</p>
                  <p className="text-xs sm:text-sm text-slate-200 mt-1.5 leading-relaxed font-light">
                    {plan.pricingInsight.reasoning}
                  </p>
                </div>
              </div>

              {/* Action Tip Butter Yellow Box */}
              <div className="lg:col-span-5 bg-[#FFF9C4] border-2 border-[#FBC02D] p-5 rounded-3xl flex flex-col justify-between space-y-4 text-[#1A237E]">
                <div>
                  <h5 className="text-xs font-black text-[#F57F17] uppercase tracking-wider flex items-center gap-1.5">
                    ⚠️ Easy Pricing Hand-Rule
                  </h5>
                  <p className="text-xs text-slate-800 mt-2.5 leading-relaxed font-medium">
                    Always calculate the complete cost of your raw ingredients first! To keep your business running smoothly, never charge less than double your material expense. The surplus amount covers your dedicated labor, packaging, and reinvestment money.
                  </p>
                </div>
                <div className="bg-white/80 border border-[#FBC02D]/40 rounded-2xl p-3.5 text-[11px] leading-relaxed text-slate-800">
                  <strong className="text-[#F57F17] font-black uppercase">Start Strategy:</strong> Price near the lower scale ({currencySymbol}{plan.pricingInsight.minPrice}) for neighbors to generate positive reviews, then elevate it to {currencySymbol}{plan.pricingInsight.maxPrice} for formal gifting orders.
                </div>
              </div>
            </div>

            {/* Interactive Calculator Section */}
            <div className="border-t border-[#F1E4DF] pt-6 space-y-4">
              <div className="bg-[#FDF8F5] rounded-3xl p-5 sm:p-6 border border-[#F1E4DF] space-y-5">
                <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#FF6B6B]">
                      🛠️ {t("app.dashboard.pricing.calculator")}
                    </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t("app.dashboard.pricing.calculatorDesc")}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-[11px] font-black uppercase tracking-wider mb-1.5 ${isDarkMode ? "text-amber-400" : "text-[#1A237E]"}`}>
                      {t("app.dashboard.pricing.rawMaterial")} ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      value={materialCost}
                      onChange={(e) => setMaterialCost(Math.max(0, Number(e.target.value)))}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 font-bold transition-colors ${isDarkMode ? "bg-[#090C22] text-slate-100 border-[#222E7A]" : "bg-white border-[#F1E4DF] text-[#1A237E]"}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-black uppercase tracking-wider mb-1.5 ${isDarkMode ? "text-amber-400" : "text-[#1A237E]"}`}>
                      {t("app.dashboard.pricing.hours")}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={hoursMade}
                      onChange={(e) => setHoursMade(Math.max(0, Number(e.target.value)))}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 font-bold transition-colors ${isDarkMode ? "bg-[#090C22] text-slate-100 border-[#222E7A]" : "bg-white border-[#F1E4DF] text-[#1A237E]"}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-black uppercase tracking-wider mb-1.5 ${isDarkMode ? "text-amber-400" : "text-[#1A237E]"}`}>
                      {t("app.dashboard.pricing.skillWage")} ({currencySymbol}/hour)
                    </label>
                    <input
                      type="number"
                      value={hourlyWage}
                      onChange={(e) => setHourlyWage(Math.max(0, Number(e.target.value)))}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 font-bold transition-colors ${isDarkMode ? "bg-[#090C22] text-slate-100 border-[#222E7A]" : "bg-white border-[#F1E4DF] text-[#1A237E]"}`}
                    />
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border transition-colors ${isDarkMode ? "bg-[#0E1235] border-[#222E7A]" : "bg-[#FFF9F5] border-[#F1E4DF]"}`}>
                  <label className={`block text-[11px] font-black uppercase tracking-wider mb-2 ${isDarkMode ? "text-amber-400" : "text-[#1A237E]"}`}>
                    {t("app.dashboard.pricing.profitMargin")}: <span className="text-[#FF6B6B]">{profitMargin}%</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="5"
                      value={profitMargin}
                      onChange={(e) => setProfitMargin(Number(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={profitMargin}
                      onChange={(e) => setProfitMargin(Math.max(0, Math.min(500, Number(e.target.value))))}
                      className={`w-16 px-2 py-1.5 text-xs rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 font-bold text-center transition-colors ${isDarkMode ? "bg-[#090C22] text-slate-100 border-[#222E7A]" : "bg-white border-[#F1E4DF] text-[#1A237E]"}`}
                    />
                    <span className="text-[10px] font-bold text-slate-400">%</span>
                  </div>
                </div>

                <div className={`rounded-2xl p-4 border grid grid-cols-1 sm:grid-cols-3 gap-4 text-center transition-colors ${isDarkMode ? "bg-[#11163F] border-[#222E7A]" : "bg-white border-[#F1E4DF]"}`}>
                  <div className={`p-2 border-r last:border-0 ${isDarkMode ? "border-[#222E7A]" : "border-[#F1E4DF]"}`}>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">{t("app.dashboard.pricing.totalCost")}</span>
                    <strong className={`text-lg sm:text-xl font-black ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>{currencySymbol}{calculatedCostPrice}</strong>
                  </div>
                  <div className={`p-2 border-r last:border-0 rounded-xl ${isDarkMode ? "bg-emerald-950/25 border-[#222E7A]" : "bg-[#FFF0F0]/50 border-[#F1E4DF]"}`}>
                    <span className="text-[#FF6B6B] block text-[10px] uppercase tracking-wider font-black">{t("app.dashboard.pricing.recommended")} (+{profitMargin}% {t("app.dashboard.pricing.profitMargin").toLowerCase()})</span>
                    <strong className={`text-emerald-500 text-xl sm:text-2xl font-black block`}>{currencySymbol}{calculatedSellingPrice}</strong>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">{t("app.dashboard.pricing.pureProfit")}</span>
                    <strong className={`text-lg sm:text-xl font-black block ${isDarkMode ? "text-amber-400" : "text-[#1A237E]"}`}>{currencySymbol}{calculatedProfit} / pack</strong>
                  </div>
                </div>
              </div>
              
              {/* Promotional Coach Box */}
              <div className="bg-[#FFF0F0] border border-[#FF6B6B]/20 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left mt-6 animate-fade-in shadow-2xs">
                <div>
                  <h5 className="text-xs font-black text-[#1A237E] uppercase tracking-wider">💡 Confused how to offer bulk discounts or raise rates?</h5>
                  <p className="text-[11px] text-slate-500 mt-1">Let your Navyora Companion guide your pricing transitions without losing neighbors' trust.</p>
                </div>
                <button 
                  onClick={() => {
                    setActiveTab("companion");
                    setTimeout(() => handleSendMessage("Can I increase my price right now?"), 100);
                  }}
                  className="shrink-0 text-xs font-black bg-[#FF6B6B] hover:bg-[#ff5252] text-white px-4.5 py-2.5 rounded-2xl transition-all shadow-xs uppercase tracking-wider"
                >
                  Draft With Mentor
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: MARKETING KIT */}
        {activeTab === "marketing" && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            {/* Templates */}
            <div className="bg-[#FFF0F0] border border-[#FF6B6B]/20 rounded-2xl p-4 sm:p-5">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#FF6B6B] mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF6B6B]" />
                {t("app.dashboard.marketing.templates")}
              </h4>
              <p className="text-xs text-slate-500 mb-4 font-medium">
                {t("app.dashboard.marketing.templates.desc")}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  id="tpl-festive"
                  onClick={() => applyTemplate("festive")}
                  className="px-4 py-3 bg-white hover:bg-[#FDF8F5] border border-[#FBC02D] hover:border-[#FF6B6B] rounded-2xl text-xs font-bold text-[#1A237E] flex flex-col items-center gap-1 shadow-3xs cursor-pointer transition-all"
                >
                  <span className="text-lg">🎉</span>
                  <span>{t("app.dashboard.marketing.template.festive")}</span>
                </button>
                <button
                  type="button"
                  id="tpl-launch"
                  onClick={() => applyTemplate("launch")}
                  className="px-4 py-3 bg-white hover:bg-[#FDF8F5] border border-blue-200 hover:border-[#FF6B6B] rounded-2xl text-xs font-bold text-[#1A237E] flex flex-col items-center gap-1 shadow-3xs cursor-pointer transition-all"
                >
                  <span className="text-lg">🚀</span>
                  <span>{t("app.dashboard.marketing.template.launch")}</span>
                </button>
                <button
                  type="button"
                  id="tpl-limited"
                  onClick={() => applyTemplate("limited")}
                  className="px-4 py-3 bg-white hover:bg-[#FDF8F5] border border-rose-200 hover:border-[#FF6B6B] rounded-2xl text-xs font-bold text-[#1A237E] flex flex-col items-center gap-1 shadow-3xs cursor-pointer transition-all"
                >
                  <span className="text-lg">⏳</span>
                  <span>{t("app.dashboard.marketing.template.limited")}</span>
                </button>
                <button
                  type="button"
                  id="tpl-daily"
                  onClick={() => applyTemplate("daily")}
                  className="px-4 py-3 bg-white hover:bg-[#FDF8F5] border border-emerald-200 hover:border-[#FF6B6B] rounded-2xl text-xs font-bold text-[#1A237E] flex flex-col items-center gap-1 shadow-3xs cursor-pointer transition-all"
                >
                  <span className="text-lg">🌿</span>
                  <span>{t("app.dashboard.marketing.template.daily")}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Copy-ready fields: caption, description, CTA */}
              <div className="order-2 lg:order-1 lg:col-span-6 bg-white border border-[#F1E4DF] rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xs">
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#F1E4DF]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#FFF0F0] text-[#FF6B6B] flex items-center justify-center font-bold text-xs">
                      ✍️
                    </div>
                    <h3 className="text-sm font-black uppercase text-[#1A237E] tracking-wider">
                      {t("app.dashboard.marketing.post")}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMarketingEditor((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider border border-[#FF6B6B]/30 text-[#FF6B6B] bg-[#FFF0F0] hover:bg-[#FFE8E8] transition-colors cursor-pointer shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {showMarketingEditor ? "Hide visual options" : "Edit this post"}
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-black text-slate-700 uppercase tracking-wider mb-1">{t("app.dashboard.marketing.caption")}</label>
                    <textarea
                      rows={5}
                      value={postCaption}
                      onChange={(e) => setPostCaption(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FDF8F5] border border-[#F1E4DF] rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 font-medium text-slate-800 leading-relaxed text-xs"
                      placeholder="Instagram / WhatsApp caption with hashtags..."
                    />
                  </div>

                  <div>
                    <label className="block font-black text-slate-700 uppercase tracking-wider mb-1">{t("app.dashboard.marketing.productDescription")}</label>
                    <textarea
                      rows={2}
                      value={postDescription}
                      onChange={(e) => setPostDescription(e.target.value)}
                      className="w-full px-4.5 py-2.5 bg-slate-50 border border-[#F1E4DF] rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 font-medium text-slate-800 resize-none focus:bg-white text-xs"
                      placeholder="Short pitch for your post..."
                    />
                  </div>

                  <div>
                    <label className="block font-black text-slate-700 uppercase tracking-wider mb-1">
                      {t("app.dashboard.marketing.cta")} <span className="text-[#FF6B6B]">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <input
                        type="text"
                        value={postCta}
                        onChange={(e) => setPostCta(e.target.value)}
                        required
                        placeholder="e.g. DM now to order"
                        className={`sm:col-span-8 px-4.5 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 font-black focus:bg-white text-xs ${
                          postCta.trim() ? "border-[#F1E4DF] text-emerald-700" : "border-rose-300 text-rose-600"
                        }`}
                      />
                      <select
                        onChange={(e) => {
                          if (e.target.value) setPostCta(e.target.value);
                        }}
                        className="sm:col-span-4 px-3 py-2.5 bg-slate-50 border border-[#F1E4DF] rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 font-bold text-slate-700 cursor-pointer text-xs"
                      >
                        <option value="">Presets</option>
                        <option value="DM now to order">DM now to order</option>
                        <option value="Limited stock available! DM now to order">Limited stock — DM to order</option>
                        <option value="Be the first to try! DM to order">Be the first — DM to order</option>
                        <option value="Book now for batch 1">Book now for batch 1</option>
                      </select>
                    </div>
                    {!postCta.trim() && (
                      <p className="text-[10px] text-rose-500 mt-1 font-bold">CTA is required before copying.</p>
                    )}
                  </div>

                  {showMarketingEditor && (
                  <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#F1E4DF] pt-4">
                    <div>
                      <label className="block font-black text-slate-700 uppercase tracking-wider mb-1">Product Name</label>
                      <input
                        type="text"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        className="w-full px-4.5 py-2.5 bg-slate-50 border border-[#F1E4DF] rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 font-bold text-slate-800 focus:bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-black text-slate-700 uppercase tracking-wider mb-1">Tagline Slogan</label>
                      <input
                        type="text"
                        value={postTagline}
                        onChange={(e) => setPostTagline(e.target.value)}
                        className="w-full px-4.5 py-2.5 bg-slate-50 border border-[#F1E4DF] rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 font-bold text-slate-800 focus:bg-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Pricing Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block font-black text-slate-700 uppercase tracking-wider mb-1">Optional Price (₹)</label>
                      <input
                        type="number"
                        value={postPrice}
                        onChange={(e) => setPostPrice(Math.max(0, Number(e.target.value)))}
                        className="w-full px-4.5 py-2.5 bg-slate-50 border border-[#F1E4DF] rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 font-black text-[#1A237E] focus:bg-white text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="chk-show-price"
                        checked={showPrice}
                        onChange={(e) => setShowPrice(e.target.checked)}
                        className="w-4 h-4 rounded border-[#F1E4DF] text-[#FF6B6B] focus:ring-[#FF6B6B] cursor-pointer"
                      />
                      <label htmlFor="chk-show-price" className="font-bold text-slate-700 cursor-pointer select-none">
                        Show price badge on post
                      </label>
                    </div>
                  </div>

                  {/* Visual post styling */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#F1E4DF] pt-4">
                    <div>
                      <label className="block font-black text-slate-700 uppercase tracking-wider mb-1.5">Post color</label>
                      <div className="flex flex-wrap gap-2">
                        {(["marigold", "sunset", "royal", "forest", "lavender", "berry"] as const).map((theme) => {
                          const themeColors: Record<typeof theme, string> = {
                            marigold: "bg-gradient-to-tr from-amber-500 to-[#FF6B6B]",
                            sunset: "bg-gradient-to-tr from-[#FF6B6B] to-[#FF8F00]",
                            royal: "bg-gradient-to-tr from-[#1A237E] to-[#880E4F]",
                            forest: "bg-gradient-to-tr from-[#1B5E20] to-teal-900",
                            lavender: "bg-gradient-to-tr from-[#6366F1] to-[#A855F7]",
                            berry: "bg-gradient-to-tr from-[#880E4F] to-[#AD1457]",
                          };
                          return (
                            <button
                              key={theme}
                              type="button"
                              onClick={() => setPostTheme(theme)}
                              title={theme.toUpperCase()}
                              className={`w-7 h-7 rounded-full ${themeColors[theme]} border-2 transition-all cursor-pointer ${
                                postTheme === theme ? "border-slate-800 scale-110" : "border-transparent"
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block font-black text-slate-700 uppercase tracking-wider mb-1.5">Simple illustration</label>
                      <select
                        value={postIllustration}
                        onChange={(e) => setPostIllustration(e.target.value as typeof postIllustration)}
                        className="w-full px-3 py-2 bg-slate-100 border border-[#F1E4DF] rounded-xl outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 font-bold text-slate-700 cursor-pointer text-xs"
                      >
                        <option value="floral">Soft circles</option>
                        <option value="mandala">Center ring</option>
                        <option value="stars">Few stars</option>
                        <option value="minimal-geometric">Corner frame</option>
                        <option value="sparkles">Light accents</option>
                      </select>
                    </div>
                  </div>
                  </>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-[#F1E4DF]">
                    <button
                      type="button"
                      disabled={!postCta.trim()}
                      onClick={() => triggerCopy(postCaption, "Caption")}
                      className="flex-1 py-2.5 px-4 bg-[#1A237E] hover:bg-[#283593] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy caption
                    </button>
                    <button
                      type="button"
                      disabled={!postCta.trim()}
                      onClick={() => triggerCopy(`${postDescription}\n\n👉 ${postCta}`, "Description + CTA")}
                      className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-[#1A237E] border border-[#F1E4DF] rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {t("app.dashboard.marketing.copy.desc")}
                    </button>
                  </div>

                </div>
              </div>

              {/* Visual post preview */}
              <div className="order-1 lg:order-2 lg:col-span-6 space-y-4 lg:sticky lg:top-4">
                <h3 className="text-sm font-black uppercase text-[#1A237E] tracking-wider">{t("app.dashboard.marketing.visualPost")}</h3>
                <div
                  id="graphic-canvas-preview"
                  className={`aspect-square w-full max-w-[310px] sm:max-w-[400px] lg:max-w-[440px] xl:max-w-[460px] mx-auto rounded-3xl relative overflow-hidden flex flex-col justify-between p-4 sm:p-8 lg:p-9 text-center border shadow-xl transition-all duration-300 select-all ${
                    postTheme === "marigold" ? "bg-gradient-to-tr from-amber-600 via-amber-500 to-[#E64A19] text-white border-amber-700/20" :
                    postTheme === "sunset" ? "bg-gradient-to-tr from-[#D84315] via-[#FF5722] to-[#FF8F00] text-white border-[#FF5722]/30" :
                    postTheme === "royal" ? "bg-gradient-to-tr from-[#0F172A] via-[#1E1B4B] to-[#581C87] text-white border-indigo-950/40" :
                    postTheme === "forest" ? "bg-gradient-to-tr from-[#064E3B] via-[#022C22] to-teal-950 text-white border-emerald-950/40" :
                    postTheme === "lavender" ? "bg-gradient-to-tr from-[#4F46E5] via-[#6D28D9] to-[#8B5CF6] text-white border-indigo-900/30" :
                    "bg-gradient-to-tr from-[#4D0F2E] via-[#880E4F] to-[#AD1457] text-white border-rose-950/40"
                  }`}
                >
                  {/* Simple background illustrations */}
                  {postIllustration === "floral" && (
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                      <div className="absolute top-6 left-6 w-14 h-14 rounded-full border-2 border-white" />
                      <div className="absolute bottom-8 right-8 w-10 h-10 rounded-full bg-white/30" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/40" />
                    </div>
                  )}
                  {postIllustration === "mandala" && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
                      <div className="w-40 h-40 rounded-full border-2 border-white" />
                    </div>
                  )}
                  {postIllustration === "stars" && (
                    <div className="absolute inset-0 pointer-events-none opacity-25">
                      <span className="absolute top-8 left-10 text-lg text-[#FFD93D]">✦</span>
                      <span className="absolute bottom-12 right-12 text-sm text-white">✦</span>
                      <span className="absolute top-1/3 right-8 text-xs text-[#FFD93D]">✦</span>
                    </div>
                  )}
                  {postIllustration === "minimal-geometric" && (
                    <div className="absolute inset-4 border border-white/25 rounded-2xl pointer-events-none" />
                  )}
                  {postIllustration === "sparkles" && (
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                      <span className="absolute top-5 left-5 w-2 h-2 bg-[#FFD93D] rounded-full" />
                      <span className="absolute bottom-6 right-6 w-3 h-3 bg-white/50 rounded-full" />
                    </div>
                  )}

                  {/* TOP ROW: Tagline / Slogan */}
                  <div className="z-10 w-full flex flex-col items-center px-4">
                    <span 
                      className={`font-black uppercase tracking-[0.2em] text-[#FFD93D] drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)] block leading-none text-center ${
                        (postTagline || "").length > 28
                          ? "text-[7.5px] sm:text-[8.5px] lg:text-[9.5px]"
                          : (postTagline || "").length > 20
                            ? "text-[8px] sm:text-[9px] lg:text-[10px]"
                            : "text-[9px] sm:text-[9.5px] lg:text-[10.5px]"
                      }`}
                    >
                      {postTagline || "✦ EXCLUSIVE HOME CREATION ✦"}
                    </span>
                    <div className="w-10 sm:w-14 h-[1.5px] bg-[#FFD93D] mt-1.5 sm:mt-2 opacity-85 rounded-full" />
                  </div>

                  {/* MIDDLE ROW: Product Title + Beautiful Compact Glass Card Description */}
                  <div className="z-10 w-full flex flex-col items-center gap-1.5 sm:gap-3 my-auto px-4 sm:px-6">
                    <div className="space-y-1 w-full text-center">
                      <h2 
                        className={`font-black uppercase italic tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] leading-snug max-w-[240px] sm:max-w-[320px] mx-auto text-white ${
                          (postTitle || "").length > 28
                            ? "text-xs sm:text-lg lg:text-xl"
                            : (postTitle || "").length > 18
                              ? "text-sm sm:text-xl lg:text-[22px]"
                              : "text-base sm:text-2xl lg:text-[24px]"
                        }`}
                      >
                        {postTitle || plan.productName}
                      </h2>
                      <div className="flex items-center justify-center gap-1.5 mt-0.5">
                        <span className="text-[6.5px] sm:text-[7.5px] uppercase tracking-widest text-[#FFD93D] font-black font-mono bg-black/40 px-2.5 py-0.5 rounded shadow-xs">
                          100% QUALITY ASSURED
                        </span>
                      </div>
                    </div>

                    <div className="w-full max-w-[245px] sm:max-w-[320px] bg-neutral-950/45 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border border-white/10 shadow-md">
                      <p className="text-[8px] sm:text-[10.5px] lg:text-[11px] font-medium leading-normal sm:leading-relaxed text-slate-100 italic line-clamp-2 sm:line-clamp-3 select-all">
                        &ldquo;{postDescription || plan.marketingKit?.productDescription || "Pure hand-crafted locally sourced organic materials."}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* BOTTOM ROW: Dynamic Price Badge + Compelling CTA combined */}
                  <div className="z-10 w-full flex flex-col items-center gap-1.5 sm:gap-2.5 mb-1 px-4">
                    {/* Price Bubble Badge rendering if enabled */}
                    {showPrice && (
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-[6.5px] sm:text-[8px] uppercase font-black tracking-widest text-slate-200 bg-black/30 px-1.5 py-0.5 rounded-sm">Special Price</span>
                        <span className="text-[10.5px] sm:text-base lg:text-lg font-black bg-[#FFD93D] text-[#1A237E] font-mono px-3 py-0.5 sm:px-4 sm:py-1 rounded-full shadow-sm leading-none border border-white/25">
                          ₹{postPrice}
                        </span>
                      </div>
                    )}

                    {/* Mandatory Pro-CTA solid label */}
                    <div className="w-full flex justify-center">
                      <span 
                        className={`inline-block bg-[#FFD93D] text-[#1A237E] font-extrabold uppercase tracking-[0.04em] sm:tracking-[0.08em] rounded-full shadow-lg hover:scale-[1.03] transition-all animate-pulse border-2 border-white/40 select-all leading-none max-w-full text-center ${
                          (postCta || "").length > 28
                            ? "text-[7.5px] sm:text-[10px] lg:text-[11px] px-3.5 py-1.5 sm:px-5 lg:py-2"
                            : (postCta || "").length > 18
                              ? "text-[8.5px] sm:text-[11px] lg:text-[11.5px] px-4 py-2 sm:px-5.5 lg:py-2.5"
                              : "text-[9px] sm:text-[11.5px] lg:text-[12px] px-4.5 py-2 sm:px-6 lg:py-2.5"
                        }`}
                      >
                        ⚡ {postCta || "DM NOW TO ORDER"} ⚡
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled={!postCta.trim()}
                    onClick={() => {
                      const title = postTitle || plan.productName;
                      const combinedCopy = `${postTagline}\n\n🛍️ ${title}\n${postDescription}\n${showPrice ? `\n💵 ₹${postPrice}` : ""}\n\n${postCaption}\n\n👉 ${postCta.trim()}`;
                      triggerCopy(combinedCopy, "Full post");
                    }}
                    className="flex-1 py-3 px-5 bg-[#FF6B6B] hover:bg-[#ff5252] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{t("app.dashboard.marketing.copy.all")}</span>
                  </button>

                  <button
                    type="button"
                    disabled={!postCta.trim()}
                    onClick={() => triggerCopy(postCaption, "Caption")}
                    className="py-3 px-5 bg-[#1A237E] hover:bg-[#283593] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>{t("app.dashboard.marketing.copy.caption")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={downloadPostImage}
                    className="py-3 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Image</span>
                  </button>
                </div>

                <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 text-[10px] md:text-xs text-amber-800 leading-relaxed font-medium">
                  Pick a template, add your CTA, then tap <strong>Copy everything to post</strong> and paste into Instagram or WhatsApp. You can also <strong>download the post as an image</strong> to share directly!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FIRST CUSTOMERS */}
        {activeTab === "outreach" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <Send className="w-6 h-6 text-[#FF6B6B]" />
              <h2 className="text-lg sm:text-xl font-black text-[#1A237E] uppercase tracking-tight">
                {t("app.dashboard.outreach.title")}
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium -mt-3">
              No websites or paid ads — just do these steps today and start getting replies.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Immediate Actions */}
              <div className="bg-white border-2 border-[#F1E4DF] rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2.5 border-b border-[#F1E4DF] pb-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF0F0] text-[#FF6B6B] flex items-center justify-center font-black text-sm">1</div>
                  <h4 className="text-sm font-black text-[#1A237E] uppercase tracking-wider">{t("app.dashboard.outreach.immediate")}</h4>
                </div>
                <div className="space-y-2.5">
                  {[
                    "Post WhatsApp Status",
                    "Message 10 contacts",
                    "Share in 2 groups",
                  ].map((action, i) => (
                    <label
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                        immediateActionsDone[i]
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-[#FFFBF9] border-[#F1E4DF] hover:border-[#FF6B6B]/45"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!immediateActionsDone[i]}
                        onChange={(e) =>
                          setImmediateActionsDone((prev) => ({ ...prev, [i]: e.target.checked }))
                        }
                        className="w-4.5 h-4.5 rounded border-gray-300 text-[#FF6B6B] focus:ring-[#FF6B6B]"
                      />
                      <span className="text-xs sm:text-sm text-slate-700 font-bold">{action}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 2. Ready-to-Send Message (editable) */}
              <div className="bg-white border-2 border-[#F1E4DF] rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#F1E4DF] pb-3 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#FFF0F0] text-[#FF6B6B] flex items-center justify-center font-black text-sm">2</div>
                    <h4 className="text-sm font-black text-[#1A237E] uppercase tracking-wider">
                      {t("app.dashboard.outreach.readyMessage")} <span className="text-[#FF6B6B] normal-case font-bold">(editable)</span>
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerCopy(outreachMessage, "Message")}
                    disabled={!outreachMessage.trim()}
                    className="flex items-center gap-1.5 bg-[#FF6B6B] hover:bg-[#ff5252] disabled:opacity-40 text-white text-[11px] font-black px-3.5 py-1.5 rounded-full shadow-2xs cursor-pointer shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={outreachMessage}
                  onChange={(e) => setOutreachMessage(e.target.value)}
                  className="w-full bg-[#FFFBF9] rounded-2xl border-2 border-[#F1E4DF] focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] p-4 text-xs sm:text-sm text-slate-700 leading-relaxed resize-none outline-none"
                  placeholder="Edit your message, then copy and send..."
                />
                <button
                  type="button"
                  onClick={() => {
                    const cleanProdName = (plan.productName || "product").replace(/^handmade\s+/i, "");
                    setOutreachMessage(
                      `Hey! I just started selling handmade ${cleanProdName}. Would love your support 😊`
                    );
                  }}
                  className="text-[10px] font-black text-[#FF6B6B] hover:underline cursor-pointer"
                >
                  {t("app.dashboard.outreach.reset")}
                </button>
              </div>

              {/* 3. Where to Post */}
              <div className="bg-white border-2 border-[#F1E4DF] rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2.5 border-b border-[#F1E4DF] pb-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF0F0] text-[#FF6B6B] flex items-center justify-center font-black text-sm">3</div>
                  <h4 className="text-sm font-black text-[#1A237E] uppercase tracking-wider">{t("app.dashboard.outreach.whereToPost")}</h4>
                </div>
                <ul className="space-y-2.5">
                  {[
                    { name: "WhatsApp", icon: "💬" },
                    { name: "Instagram", icon: "📸" },
                    { name: "Local groups", icon: "🏘️" },
                  ].map((channel) => (
                    <li
                      key={channel.name}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-[#FFFBF9] border border-[#F1E4DF] text-xs sm:text-sm font-black text-slate-800"
                    >
                      <span className="text-base" aria-hidden>{channel.icon}</span>
                      {channel.name}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4. Conversion Tips */}
              <div className="bg-white border-2 border-[#F1E4DF] rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2.5 border-b border-[#F1E4DF] pb-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF0F0] text-[#FF6B6B] flex items-center justify-center font-black text-sm">4</div>
                  <h4 className="text-sm font-black text-[#1A237E] uppercase tracking-wider">{t("app.dashboard.outreach.conversionTips")}</h4>
                </div>
                <ul className="space-y-2.5">
                  {["Use real photos", "Reply quickly", "Offer small discount"].map((tip) => (
                    <li
                      key={tip}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-[#FFFBF9] border border-[#F1E4DF]"
                    >
                      <Check className="w-4 h-4 text-[#FF6B6B] shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-slate-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-[#1A237E] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-white">
              <p className="text-xs font-semibold text-blue-100">
                Check off actions → copy your message → post on WhatsApp, Instagram, or local groups.
              </p>
              <button
                type="button"
                onClick={() => triggerCopy(outreachMessage, "Message")}
                disabled={!outreachMessage.trim()}
                className="shrink-0 py-2.5 px-5 bg-[#FF6B6B] hover:bg-[#ff5252] disabled:opacity-40 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                {t("app.dashboard.outreach.copyMessage")}
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: IMPROVEMENTS */}
        {activeTab === "improvements" && (() => {
          const improvementsList = plan.improvements || [];
          const completedCount = Object.values(completedImprovements).filter(Boolean).length;
          const totalCount = improvementsList.length;
          const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          const currentPotential = totalCount > 0 
            ? plan.pricingInsight.minPrice + Math.round((plan.pricingInsight.maxPrice - plan.pricingInsight.minPrice) * (completedCount / totalCount)) 
            : plan.pricingInsight.minPrice;

          const getImprovementCategory = (text: string) => {
            const t = text.toLowerCase();
            if (t.includes("pack") || t.includes("box") || t.includes("wrap") || t.includes("bag") || t.includes("container") || t.includes("jar") || t.includes("bottle") || t.includes("ribbon") || t.includes("pouch") || t.includes("glass")) {
              return { label: "Packaging Upgrade", icon: "📦", bg: "bg-amber-50 text-amber-700 border-amber-200/40" };
            }
            if (t.includes("label") || t.includes("logo") || t.includes("sticker") || t.includes("card") || t.includes("tag") || t.includes("print") || t.includes("font") || t.includes("brand") || t.includes("stamp") || t.includes("name") || t.includes("craft")) {
              return { label: "Physical Branding", icon: "🏷️", bg: "bg-blue-50 text-blue-700 border-blue-200/40" };
            }
            if (t.includes("photo") || t.includes("light") || t.includes("shoot") || t.includes("camera") || t.includes("drop") || t.includes("backdrop") || t.includes("background") || t.includes("image") || t.includes("instagram")) {
              return { label: "Creative & Media", icon: "📸", bg: "bg-purple-50 text-purple-700 border-purple-200/40" };
            }
            if (t.includes("ingredient") || t.includes("raw") || t.includes("quality") || t.includes("material") || t.includes("organic") || t.includes("scent") || t.includes("oil") || t.includes("natural") || t.includes("pure") || t.includes("grade") || t.includes("add") || t.includes("prepare")) {
              return { label: "Product Craft", icon: "✨", bg: "bg-teal-50 text-teal-700 border-teal-200/40" };
            }
            return { label: "Value Presentation", icon: "🚀", bg: "bg-rose-50 text-rose-700 border-rose-200/40" };
          };

          return (
            <div className="space-y-6 animate-fade-in">
              {/* Premium Header Metrics Card */}
              <div className="bg-[#FFF8F5] border-2 border-[#F1E4DF] rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#FF6B6B] block">
                      ⭐ Value Capture scale ⭐
                    </span>
                    <h4 className="text-base font-black text-[#1A237E] uppercase tracking-tight mt-0.5">
                      {t("app.dashboard.improvements.title")}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-normal font-semibold">
                      Upgrading your product's finishing, physical presentation, and photograph staging is the most immediate way to justify charging premium margins.
                    </p>
                  </div>
                  <div className="bg-white px-5 py-3 rounded-2xl border border-[#F1E4DF] text-center shrink-0 shadow-3xs flex flex-col items-center justify-center min-w-[120px]">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-none">{t("app.dashboard.improvements.pricePotential")}</span>
                    <span className="text-2xl font-black text-[#1A237E] font-mono block mt-1.5 leading-none">
                      {currencySymbol}{currentPotential}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-[#F1E4DF] pt-4">
                  <div className="flex justify-between items-center text-[11px] font-black text-[#1A237E] uppercase tracking-wider">
                    <span>{completedCount} of {totalCount} suggestions done</span>
                    <span className="text-[#FF6B6B]">{progressPercent}% Value Unlocked</span>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className="w-full h-3 bg-[#F1E4DF] rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#ff4747] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 font-mono">
                    <span>Basic ({currencySymbol}{plan.pricingInsight.minPrice})</span>
                    <span>Premium limit ({currencySymbol}{plan.pricingInsight.maxPrice})</span>
                  </div>
                </div>
              </div>

              {/* Celebrating Completed Banner */}
              {progressPercent === 100 && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 border border-emerald-600 rounded-3xl p-5 text-white flex items-center gap-3.5 shadow-md animate-bounce">
                  <Sparkles className="w-5 h-5 text-[#FFD93D] shrink-0 fill-[#FFD93D] animate-spin animate-none" />
                  <div className="min-w-0">
                    <h5 className="text-xs sm:text-sm font-black uppercase tracking-wider leading-none">All suggestions completed!</h5>
                    <p className="text-[11px] sm:text-xs text-emerald-50 leading-relaxed font-semibold mt-1">
                      Incredible craftsmanship! Your physical presentation standard is fully elevated to justify premium prices of {currencySymbol}{plan.pricingInsight.maxPrice}!
                    </p>
                  </div>
                </div>
              )}

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {improvementsList.map((improvement, index) => {
                  const checked = !!completedImprovements[index];
                  const category = getImprovementCategory(improvement);
                  return (
                    <div
                      key={index}
                      onClick={() => toggleImprovement(index)}
                      className={`p-5 rounded-3xl border-2 cursor-pointer select-none transition-all duration-200 flex flex-col justify-between gap-4 group ${
                        checked
                          ? "bg-[#FFFBF9]/40 border-[#F1E4DF] grayscale-[10%] opacity-75 animate-pulse-once"
                          : "bg-white border-[#F1E4DF] hover:border-[#FF6B6B] hover:shadow-xs shadow-3xs"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
                          checked
                            ? "bg-[#FF6B6B] border-[#FF6B6B] text-white"
                            : "border-slate-300 bg-white group-hover:border-[#FF6B6B]/60"
                        }`}>
                          {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <p className={`text-xs sm:text-sm font-bold leading-relaxed transition-all ${
                            checked ? "text-slate-400 line-through decoration-[#FF6B6B]" : "text-slate-800"
                          }`}>
                            {improvement}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#FCDED2]/25 pt-3">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                          checked ? "text-slate-400" : "text-[#FF6B6B]"
                        }`}>
                          {t("app.dashboard.improvements.suggestion")} {index + 1}
                        </span>
                        
                        {/* Dynamic Categorized Badge */}
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 text-[9px] uppercase tracking-wider font-extrabold rounded-full border ${category.bg}`}>
                          <span>{category.icon}</span>
                          <span className="leading-none">{category.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* TAB 5: SELLING & GROWTH STRATEGY */}
        {activeTab === "strategy" && (() => {
          const growthStrategy = plan.sellingGrowthStrategy || {
            level1Start: [
              "Sell through WhatsApp contacts and Instagram stories",
              "Warm outreach to friends, family, neighbors, and close network",
              "Take manual customized orders directly over WhatsApp or phone calls"
            ],
            level2Expand: [
              "Post consistent product process videos and Reels on Instagram / Facebook",
              "List creations on local neighborhood groups or digital small-biz platforms like Meesho/Flipkart",
              "Join local community ladies associations and flea markets to showcase samples"
            ],
            level3Scale: [
              "Design personalized brand stickers, beautiful wrapping paper, and custom thank-you tags",
              "Launch a dedicated and focused Instagram business catalog profile",
              "Collaborate with micro local pages or influencers for sample giveaways",
              "Introduce bulk packs or festival bundle deals for corporate or wedding orders"
            ],
            deliveryGuidance: [
              "Start with direct neighborhood self-pickup or hand-delivery to neighbors",
              "Use local same-day courier apps like Porter, Dunzo or Borzo for quick deliveries",
              "As client volume grows, register with standard courier/shipping services for nation-wide reach"
            ]
          };

          return (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-[#1A237E] uppercase tracking-wider">
                  📈 Progressive Growth Blueprint
                </h4>
                <p className="text-xs text-slate-500">
                  Follow these step-by-step milestones to transition your home-crafted venture into a real household brand.
                </p>
              </div>

              {/* 3-Level Progression Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEVEL 1: START */}
                <div className="bg-white border-2 border-[#F1E4DF] hover:border-[#1A237E] transition-all rounded-3xl p-5 space-y-4 flex flex-col justify-between relative shadow-2xs group">
                  <div className="absolute -top-3 left-4 bg-[#1A237E] text-[#FFD93D] font-black text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xs">
                    Level 1: Start
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between pb-2 border-b border-[#FDF8F5]">
                      <span className="text-xs font-black text-[#1A237E]/80 uppercase tracking-wide">Immediate Sales</span>
                      <span className="w-8 h-8 rounded-full bg-[#FFF0F0] text-[#FF6B6B] font-black flex items-center justify-center text-xs">01</span>
                    </div>
                    <ul className="space-y-3">
                      {growthStrategy.level1Start.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3 bg-[#FFF0F0]/10 p-3 rounded-2xl border border-[#FFF0F0] text-[10px] text-slate-500 text-center font-bold">
                    Goals: Validate idea with 5 hand-crafted orders
                  </div>
                </div>

                {/* LEVEL 2: EXPAND */}
                <div className="bg-white border-2 border-[#F1E4DF] hover:border-[#FF6B6B] transition-all rounded-3xl p-5 space-y-4 flex flex-col justify-between relative shadow-2xs group">
                  <div className="absolute -top-3 left-4 bg-[#FF6B6B] text-white font-black text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xs">
                    Level 2: Expand
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between pb-2 border-b border-[#FDF8F5]">
                      <span className="text-xs font-black text-[#FF6B6B] uppercase tracking-wide">Wider Reach</span>
                      <span className="w-8 h-8 rounded-full bg-[#FFF0F0] text-[#FF6B6B] font-black flex items-center justify-center text-xs">02</span>
                    </div>
                    <ul className="space-y-3">
                      {growthStrategy.level2Expand.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3 bg-[#FFF0F0]/10 p-3 rounded-2xl border border-[#FFF0F0] text-[10px] text-[#FF6B6B] text-center font-bold">
                    Goals: Reach broad communities & get 20+ regulars
                  </div>
                </div>

                {/* LEVEL 3: SCALE */}
                <div className="bg-[#FFF9C4]/30 border-2 border-[#FBC02D] rounded-3xl p-5 space-y-4 flex flex-col justify-between relative shadow-xs group">
                  <div className="absolute -top-3 left-4 bg-[#F57F17] text-white font-black text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xs">
                    Level 3: Scale
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between pb-2 border-b border-[#FBC02D]/10">
                      <span className="text-xs font-black text-[#F57F17] uppercase tracking-wide">Business Growth</span>
                      <span className="w-8 h-8 rounded-full bg-[#FFF9C4] text-[#F57F17] font-black flex items-center justify-center text-xs">03</span>
                    </div>
                    <ul className="space-y-3">
                      {growthStrategy.level3Scale.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F57F17] mt-1.5 shrink-0" />
                          <span className="text-slate-800">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3 bg-white border border-[#FBC02D]/40 p-3 rounded-2xl text-[10px] text-[#F57F17] text-center font-black uppercase tracking-wider">
                    Goals: Establish premium brand & bulk campaigns
                  </div>
                </div>

              </div>

              {/* Delivery Guidance - Mint Card highlight */}
              <div className="border border-[#A5D6A7] bg-[#E8F5E9]/50 p-5 rounded-3xl space-y-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white border border-[#A5D6A7] flex items-center justify-center">
                    <Truck className="w-4 h-4 text-[#2E7D32]" />
                  </div>
                  <span className="text-xs font-black text-[#2E7D32] uppercase tracking-wider">
                    🚚 Growing Delivery Guidance
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {growthStrategy.deliveryGuidance.map((tip, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-2xl border border-[#A5D6A7]/40 flex gap-2.5 items-start">
                      <span className="text-xs font-black bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-lg">
                        Tip {idx + 1}
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 7: BUSINESS DASHBOARD */}
        {activeTab === "business-dashboard" && (() => {
          const pendingCount = orders.filter(o => o.status === "Pending").length;
          const soldCount = orders.filter(o => o.status === "Sold").length;
          const deliveredCount = orders.filter(o => o.status === "Delivered").length;
          const totalRevenue = orders
            .filter(o => o.status === "Sold" || o.status === "Delivered")
            .reduce((sum, o) => sum + (o.price * o.quantity), 0);

          return (
            <div className={`space-y-5 animate-fade-in transition-colors ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
              {/* Sub-navigation */}
              <div className={`flex gap-1 p-1 rounded-xl border transition-colors ${
                isDarkMode ? "bg-[#090C22] border-[#222E7A]" : "bg-slate-100/60 border-[#F1E4DF]"
              }`}>
                {[
                  { key: "performance", label: t("app.business.tab.performance"), icon: Briefcase },
                  { key: "profile", label: t("app.business.subtab.profile"), icon: User },
                  { key: "settings", label: t("app.business.subtab.settings"), icon: Settings },
                ].map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setDashboardSubTab(key as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      dashboardSubTab === key
                        ? "bg-[#FF6B6B] text-white shadow-xs"
                        : isDarkMode ? "text-slate-400 hover:bg-slate-800/40" : "text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>

              {/* PERFORMANCE */}
              {dashboardSubTab === "performance" && (
                <div className="space-y-4">
                  {/* Summary bar */}
                  <div className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                    isDarkMode ? "bg-[#11163F] border-[#222E7A]" : "bg-[#FFF8F5] border-[#F1E4DF]"
                  }`}>
                    <div>
                      <h4 className={`text-sm font-black uppercase tracking-tight ${isDarkMode ? "text-slate-100" : "text-[#1A237E]"}`}>
                        Business Operations
                      </h4>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Track orders, revenue, and inventory</p>
                    </div>
                    <button onClick={simulateRandomSale}
                      className="flex items-center gap-1.5 bg-[#FF6B6B] hover:bg-[#ff5252] text-white text-[10px] font-black px-3.5 py-2 rounded-full transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#FFD93D]" />
                      {t("app.business.simulateSale")}
                    </button>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className={`p-4 rounded-2xl border transition-all ${isDarkMode ? "bg-[#090C22] border-[#222E7A]" : "bg-white border-[#F1E4DF]"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{t("app.dashboard.business.productsCreated")}</span>
                        <ShoppingBag className="w-3.5 h-3.5 text-[#FF6B6B]" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-2xl font-black font-mono ${isDarkMode ? "text-slate-100" : "text-[#1A237E]"}`}>{productsCreated}</span>
                        <div className="flex gap-1">
                          <button onClick={() => setProductsCreated(prev => Math.max(0, prev - 1))}
                            className="w-6 h-6 rounded-lg text-sm font-bold flex items-center justify-center cursor-pointer bg-[#FFF0F0] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white transition-all">-</button>
                          <button onClick={() => setProductsCreated(prev => prev + 1)}
                            className="w-6 h-6 rounded-lg text-sm font-bold flex items-center justify-center cursor-pointer bg-[#FFF0F0] text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white transition-all">+</button>
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all ${isDarkMode ? "bg-[#090C22] border-[#222E7A]" : "bg-white border-[#F1E4DF]"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{t("app.dashboard.business.revenue")}</span>
                        <Coins className="w-3.5 h-3.5 text-[#FF6B6B]" />
                      </div>
                      <span className="text-2xl font-black text-emerald-500 font-mono">{currencySymbol}{totalRevenue}</span>
                      <span className="text-[9px] block mt-1 font-bold text-slate-400">{soldCount + deliveredCount} orders</span>
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all ${isDarkMode ? "bg-[#090C22] border-[#222E7A]" : "bg-white border-[#F1E4DF]"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{t("app.dashboard.business.orderStatus")}</span>
                        <Briefcase className="w-3.5 h-3.5 text-[#FF6B6B]" />
                      </div>
                      <div className="space-y-1.5">
                        {[
                          { label: t("app.dashboard.business.pending"), count: pendingCount, color: "bg-amber-500" },
                          { label: t("app.dashboard.business.sold"), count: soldCount, color: "bg-blue-500" },
                          { label: t("app.dashboard.business.delivered"), count: deliveredCount, color: "bg-emerald-500" },
                        ].map(({ label, count, color }) => (
                          <div key={label} className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                            <span className="flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${color}`} />{label}</span>
                            <span className={`font-mono px-2 py-0.5 rounded border ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Add Order + Order Stream */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Add Order Form */}
                    <div className={`p-4 rounded-2xl border transition-all ${isDarkMode ? "bg-[#090C22] border-[#222E7A]" : "bg-white border-[#F1E4DF]"}`}>
                      <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-rose-500/5">
                        <Plus className="w-3.5 h-3.5 text-[#FF6B6B]" />
                        <h4 className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? "text-slate-100" : "text-[#1A237E]"}`}>{t("app.dashboard.business.addSale")}</h4>
                      </div>
                      <div className="space-y-2.5">
                        <input type="text" value={newOrderCustomer} onChange={(e) => setNewOrderCustomer(e.target.value)}
                          placeholder="Customer name"
                          className={`w-full rounded-xl border px-3 py-2 text-[11px] font-semibold outline-none transition-colors ${isDarkMode ? "bg-[#11163F] border-[#222E7A] text-slate-100" : "bg-[#FFFBF9] border-[#F1E4DF] text-slate-700"}`} />
                        <div className="grid grid-cols-2 gap-2">
                          <select value={newOrderQty} onChange={(e) => setNewOrderQty(parseInt(e.target.value))}
                            className={`rounded-xl border px-2.5 py-2 text-[11px] font-semibold outline-none cursor-pointer ${isDarkMode ? "bg-[#11163F] border-[#222E7A] text-slate-100" : "bg-[#FFFBF9] border-[#F1E4DF] text-slate-700"}`}>
                            {[1, 2, 3, 4, 5, 8, 10, 25, 50].map(q => (
                              <option key={q} value={q}>{q} item{q > 1 ? "s" : ""}</option>
                            ))}
                          </select>
                          <input type="number" value={newOrderPrice} onChange={(e) => setNewOrderPrice(Math.max(0, parseInt(e.target.value) || 0))}
                            className={`rounded-xl border px-2.5 py-2 text-[11px] font-bold font-mono outline-none ${isDarkMode ? "bg-[#11163F] border-[#222E7A] text-slate-100" : "bg-[#FFFBF9] border-[#F1E4DF] text-slate-700"}`} />
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["Pending", "Sold", "Delivered"] as const).map(st => (
                            <button key={st} onClick={() => setNewOrderStatus(st)}
                              className={`py-1.5 text-[9px] font-extrabold uppercase rounded-lg border transition-all cursor-pointer ${
                                newOrderStatus === st
                                  ? st === "Pending" ? "bg-amber-500/10 border-amber-500 text-amber-500"
                                    : st === "Sold" ? "bg-blue-500/10 border-blue-500 text-blue-500"
                                    : "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                                  : isDarkMode ? "bg-slate-800/40 border-slate-700 text-slate-400" : "bg-white border-slate-200 text-slate-400"
                              }`}>{st}</button>
                          ))}
                        </div>
                      </div>
                      <button onClick={handleAddManualOrder} disabled={!newOrderCustomer.trim()}
                        className="w-full bg-[#FF6B6B] hover:bg-[#ff5252] text-white disabled:opacity-40 font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer mt-3">
                        {t("app.dashboard.business.addOrder")}
                      </button>
                    </div>

                    {/* Order Stream */}
                    <div className={`lg:col-span-2 p-4 rounded-2xl border transition-all ${isDarkMode ? "bg-[#090C22] border-[#222E7A]" : "bg-white border-[#F1E4DF]"}`}>
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-500/5">
                        <h4 className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? "text-slate-100" : "text-[#1A237E]"}`}>{t("app.dashboard.business.orderStream")}</h4>
                        <span className="text-[9px] text-slate-400 font-bold">{orders.length} orders</span>
                      </div>
                      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                        {orders.length === 0 ? (
                          <div className="text-center py-8 text-slate-400">
                            <ShoppingBag className="w-6 h-6 mx-auto mb-1.5 text-[#FF6B6B]/45" />
                            <p className="text-[11px] font-bold">{t("app.dashboard.business.noSales")}</p>
                          </div>
                        ) : orders.map((ord) => (
                          <div key={ord.id}
                            className={`flex items-center justify-between gap-2 p-3 rounded-xl border transition-all ${isDarkMode ? "bg-[#11163F] border-[#222E7A]" : "bg-[#FFFBF9]/40 border-[#F1E4DF]"}`}>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[11px] font-black ${isDarkMode ? "text-white" : "text-slate-800"}`}>{ord.customerName}</span>
                                <span className="text-[8px] text-slate-400 font-mono">{ord.date}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                                <span className="text-[#FF6B6B] font-bold">{ord.productName}</span>
                                <span>×{ord.quantity}</span>
                                <span>•</span>
                                <span className={isDarkMode ? "text-amber-400" : "text-slate-700"}>₹{ord.price * ord.quantity}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <select value={ord.status} onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                                className={`text-[9px] font-extrabold uppercase rounded-full px-2 py-1 cursor-pointer outline-none border ${
                                  ord.status === "Pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    : ord.status === "Sold" ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                } ${isDarkMode ? "bg-[#090C22]" : ""}`}>
                                <option value="Pending">Pending</option>
                                <option value="Sold">Sold</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                              <button onClick={() => deleteOrder(ord.id)}
                                className="p-1.5 rounded-lg border cursor-pointer text-slate-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PROFILE */}
              {dashboardSubTab === "profile" && (
                <div className={`p-5 rounded-2xl border transition-all ${isDarkMode ? "bg-[#090C22] border-[#222E7A]" : "bg-white border-[#F1E4DF]"}`}>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-[#FF6B6B] text-white flex items-center justify-center font-black text-2xl uppercase shrink-0">
                      {profileName ? profileName.charAt(0) : "N"}
                    </div>
                    <div>
                      <h4 className={`text-sm font-black uppercase tracking-tight ${isDarkMode ? "text-slate-100" : "text-[#1A237E]"}`}>
                        {profileName || "Navyora Creator"}
                      </h4>
                      <span className="text-[10px] font-bold text-[#FF6B6B] uppercase tracking-wider">{profileCategory || "Artisanal Crafter"}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: t("app.profile.myName"), value: profileName, set: setProfileName, placeholder: "Maya Sen" },
                      { label: t("app.profile.shopName"), value: profileShopName, set: setProfileShopName, placeholder: "My Shop Name" },
                      { label: t("app.profile.category"), value: profileCategory, set: setProfileCategory, placeholder: "Artisanal Crafter" },
                      { label: t("app.profile.whatsapp"), value: profileContact, set: setProfileContact, placeholder: "+91 98765 43210" },
                    ].map(({ label, value, set, placeholder }) => (
                      <div key={label}>
                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">{label}</label>
                        <input type="text" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                          className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold outline-none transition-colors ${isDarkMode ? "bg-[#11163F] border-[#222E7A] text-slate-100" : "bg-[#FFFBF9] border-[#F1E4DF] text-slate-700"}`} />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">{t("app.profile.bio")}</label>
                      <textarea rows={2} value={profileBio} onChange={(e) => setProfileBio(e.target.value)}
                        placeholder="Your brand story..."
                        className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold outline-none transition-colors ${isDarkMode ? "bg-[#11163F] border-[#222E7A] text-slate-100" : "bg-[#FFFBF9] border-[#F1E4DF] text-slate-700"}`} />
                    </div>
                  </div>
                  <button onClick={() => {
                    setProfileName(plan.productName?.toLowerCase().includes("soap") ? "Maya Sen" : "Navyora Creator");
                    setProfileShopName(plan.productName || "Sweet Handmades");
                    setProfileCategory("Artisanal Crafter");
                    setProfileContact("+91 98765 43210");
                    setProfileBio("Homecrafted in pristine micro-batches using local botanical ingredients and zero artificial toxins.");
                  }} className={`mt-3 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${isDarkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-[#FDF8F5] border border-[#F1E4DF] text-slate-500 hover:bg-slate-100"}`}>
                    {t("app.profile.resetMock")}
                  </button>
                </div>
              )}

              {/* SETTINGS */}
              {dashboardSubTab === "settings" && (
                <div className={`p-5 rounded-2xl border transition-all ${isDarkMode ? "bg-[#090C22] border-[#222E7A]" : "bg-white border-[#F1E4DF]"}`}>
                  <h4 className={`text-[10px] font-black uppercase tracking-wider mb-4 ${isDarkMode ? "text-slate-100" : "text-[#1A237E]"}`}>
                    {t("app.settings.storefront")}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className={`text-[9px] font-black uppercase tracking-wider block ${isDarkMode ? "text-amber-400" : "text-[#1A237E]"}`}>{t("app.settings.currency")}</label>
                      <div className="flex gap-1.5">
                        {(["₹", "$", "€", "£", "₦"] as const).map(sym => (
                          <button key={sym} onClick={() => setCurrencySymbol(sym)}
                            className={`w-9 h-9 text-xs font-bold font-mono rounded-lg border transition-all cursor-pointer ${
                              currencySymbol === sym ? "bg-[#FF6B6B] border-[#FF6B6B] text-white" : isDarkMode ? "bg-slate-800/40 border-slate-700 text-slate-300" : "bg-white border-[#F1E4DF] text-slate-600 hover:border-slate-300"
                            }`}>{sym}</button>
                        ))}
                        <input type="text" value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)}
                          className="w-16 rounded-lg border px-2 py-1.5 text-xs font-bold text-center outline-none transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={`text-[9px] font-black uppercase tracking-wider block ${isDarkMode ? "text-amber-400" : "text-[#1A237E]"}`}>{t("app.settings.hourlyWage")} ({currencySymbol}/hr)</label>
                      <input type="number" value={hourlyWage} onChange={(e) => setHourlyWage(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full max-w-[180px] rounded-xl border px-3.5 py-2 text-xs font-bold font-mono outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className={`text-[9px] font-black uppercase tracking-wider block ${isDarkMode ? "text-amber-400" : "text-[#1A237E]"}`}>{t("app.settings.theme")}</label>
                      <button onClick={() => setIsDarkMode(prev => !prev)}
                        className="flex items-center gap-2 px-3.5 py-2 text-[10px] uppercase font-black tracking-wider rounded-xl transition-all cursor-pointer border">
                        {isDarkMode ? <><Sun className="w-3.5 h-3.5" />{t("app.settings.theme.light")}</> : <><Moon className="w-3.5 h-3.5" />{t("app.settings.theme.dark")}</>}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-wider text-rose-500 block">{t("app.settings.hardReset")}</label>
                      <div className="flex gap-2">
                        <button onClick={() => setOrders([])}
                          className="px-3 py-1.5 text-[9px] uppercase font-black tracking-wider bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all cursor-pointer">{t("app.settings.clearOrders")}</button>
                        <button onClick={() => setOrders([
                          { id: "ord-1", customerName: "Arundhati Roy (WhatsApp Group)", productName: plan.productName || "Sweet Botanical Cures", quantity: 2, price: plan.pricingInsight.maxPrice || 350, status: "Delivered", date: "Today, 10:15 AM" },
                          { id: "ord-2", customerName: "Rajesh (Apt 501)", productName: plan.productName || "Sweet Botanical Cures", quantity: 1, price: plan.pricingInsight.minPrice || 240, status: "Sold", date: "Yesterday, 4:30 PM" },
                          { id: "ord-3", customerName: "Tanya Sen (Society Bazaar)", productName: plan.productName || "Sweet Botanical Cures", quantity: 3, price: plan.pricingInsight.maxPrice || 350, status: "Pending", date: "Yesterday, 11:20 AM" },
                        ])} className={`px-3 py-1.5 text-[9px] uppercase font-black tracking-wider rounded-lg transition-all cursor-pointer ${isDarkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-[#FDF8F5] border border-[#F1E4DF] text-slate-600 hover:bg-slate-100"}`}>
                          {t("app.settings.resetOrders")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 6: AI COMPANION CHAT */}
        {activeTab === "companion" && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            {/* Companion Coach Profile Header */}
            <div className="bg-[#1A237E] text-white p-5 rounded-3xl flex items-center justify-between border border-[#FFD93D]/20 gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FF6B6B] flex items-center justify-center text-white shadow-md relative shrink-0">
                  <Sparkles className="w-6 h-6 text-[#FFD93D] animate-pulse" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#1A237E] rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-sm font-black uppercase tracking-wider text-white">{t("app.dashboard.companion.title")}</h4>
                    <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest leading-none">Mentor Active</span>
                  </div>
                  <p className="text-[11px] text-slate-200 font-medium">Confident, warm, and hyper-practical business mentor for Indian home-creators.</p>
                </div>
              </div>
              <div className="hidden md:flex text-right flex-col justify-center shrink-0">
                <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">NAVYORA ACTIVE COACH</span>
                <span className="text-xs text-[#FFD93D] font-black uppercase tracking-widest">CONTEXT AWARE</span>
              </div>
            </div>

            {/* Conversation Box */}
            <div className="border border-[#F1E4DF] rounded-3xl bg-[#FDF8F5] p-4 sm:p-5 space-y-4">
              
              {/* Message Scroll bubble container */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 flex flex-col">
                {chatMessages.map((msg, index) => {
                  const isCoach = msg.sender === "companion";
                  return (
                    <div 
                      key={index} 
                      className={`flex gap-3 max-w-[85%] ${isCoach ? "self-start" : "self-end ml-auto flex-row-reverse"}`}
                    >
                      {/* Avatar logo */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-black uppercase shadow-2xs ${
                        isCoach ? "bg-[#FF6B6B] text-white" : "bg-[#1A237E]/20 text-[#1A237E]"
                      }`}>
                        {isCoach ? "N" : <User className="w-4 h-4 text-[#1A237E]" />}
                      </div>

                      {/* Text Bubble */}
                      <div className={`p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-3xs ${
                        isCoach 
                          ? "bg-white border border-[#F1E4DF] text-slate-800 rounded-tl-none" 
                          : "bg-[#1A237E] text-white rounded-tr-none"
                      }`}>
                        {renderFormattedText(msg.text)}
                      </div>
                    </div>
                  );
                })}

                {/* Loading Dots bubble */}
                {isChatLoading && (
                  <div className="flex gap-3 max-w-[40%] self-start animate-pulse">
                    <div className="w-8 h-8 rounded-xl bg-[#FF6B6B] text-white flex items-center justify-center text-xs font-black shadow-2xs">
                      N
                    </div>
                    <div className="bg-white border border-[#F1E4DF] p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#FF6B6B] rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-[#FF6B6B] rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-[#FF6B6B] rounded-full animate-bounce delay-150"></span>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {chatError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs font-bold text-center">
                    ⚠️ {chatError}
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Suggested mentor questions guide */}
              <div className="pt-4 border-t border-[#F1E4DF] space-y-2">
                <span className="text-[10px] font-black text-[#1A237E] uppercase tracking-wider block flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#FF6B6B]" /> {t("app.dashboard.companion.quickQuestions")}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isChatLoading}
                    onClick={() => handleSendMessage("Can I increase my price right now?")}
                    className="text-[11px] bg-white hover:bg-[#FFF0F0] hover:text-[#FF6B6B] active:scale-95 border border-[#F1E4DF] text-[#1A237E] px-3 py-1.5 rounded-xl font-bold transition-all text-left shadow-3xs cursor-pointer disabled:opacity-50"
                  >
                    📈 {t("app.dashboard.companion.q1")}
                  </button>
                  <button
                    type="button"
                    disabled={isChatLoading}
                    onClick={() => handleSendMessage("How do I sell outside my city?")}
                    className="text-[11px] bg-white hover:bg-[#FFF0F0] hover:text-[#FF6B6B] active:scale-95 border border-[#F1E4DF] text-[#1A237E] px-3 py-1.5 rounded-xl font-bold transition-all text-left shadow-3xs cursor-pointer disabled:opacity-50"
                  >
                    🚚 {t("app.dashboard.companion.q2")}
                  </button>
                  <button
                    type="button"
                    disabled={isChatLoading}
                    onClick={() => handleSendMessage("My product is not selling")}
                    className="text-[11px] bg-white hover:bg-[#FFF0F0] hover:text-[#FF6B6B] active:scale-95 border border-[#F1E4DF] text-[#1A237E] px-3 py-1.5 rounded-xl font-bold transition-all text-left shadow-3xs cursor-pointer disabled:opacity-50"
                  >
                    💡 {t("app.dashboard.companion.q3")}
                  </button>
                  <button
                    type="button"
                    disabled={isChatLoading}
                    onClick={() => handleSendMessage("Suggest a customized Instagram post promotion script to build sample orders")}
                    className="text-[11px] bg-white hover:bg-[#FFF0F0] hover:text-[#FF6B6B] active:scale-95 border border-[#F1E4DF] text-[#1A237E] px-3 py-1.5 rounded-xl font-bold transition-all text-left shadow-3xs cursor-pointer disabled:opacity-50"
                  >
                    ✍️ {t("app.dashboard.companion.q4")}
                  </button>
                </div>
              </div>

              {/* Type Message form box */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 pt-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t("app.dashboard.companion.placeholder")}
                  disabled={isChatLoading}
                  className="flex-1 px-4 py-3 text-xs sm:text-sm bg-white border border-[#F1E4DF] rounded-2xl outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 font-semibold text-slate-800 placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="bg-[#1A237E] hover:bg-[#1A237E]/95 disabled:opacity-45 text-white px-4 py-3 rounded-2xl transition-all shadow-md shrink-0 flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#FFD93D]" />
                </button>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
