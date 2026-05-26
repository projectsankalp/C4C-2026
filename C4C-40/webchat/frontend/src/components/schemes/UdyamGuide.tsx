import React from "react";
import { useChatStore } from "@/store/useChatStore";
import { useReadAloud } from "@/hooks/useReadAloud";
import {
  Landmark,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Clock,
  Banknote,
  Award,
  CheckCircle2,
  Globe,
  MonitorSmartphone,
  Fingerprint,
  Building2,
  Download,
} from "lucide-react";

// --------------------------------------------------------
// LOCALIZED DICTIONARY FOR UDYAM GUIDE
// --------------------------------------------------------
const TRANSLATIONS: Record<string, Record<string, string>> = {
  hi: {
    "The Business Aadhaar": "व्यापार आधार (Business Aadhaar)",
    "Official MSME recognition by the Govt. of India. Provides a lifetime unique 19-digit identifier (URN).": "भारत सरकार द्वारा आधिकारिक MSME मान्यता। आजीवन अद्वितीय 19-अंकीय पहचानकर्ता (URN) प्रदान करता है।",
    "Classification Tiers": "वर्गीकरण श्रेणियाँ",
    "Micro Enterprise": "सूक्ष्म उद्यम (Micro)",
    "Small Enterprise": "लघु उद्यम (Small)",
    "Medium Enterprise": "मध्यम उद्यम (Medium)",
    "Inv: ≤ ₹1 Cr": "निवेश: ≤ ₹1 करोड़",
    "Turn: ≤ ₹5 Cr": "टर्नओवर: ≤ ₹5 करोड़",
    "Inv: ≤ ₹10 Cr": "निवेश: ≤ ₹10 करोड़",
    "Turn: ≤ ₹50 Cr": "टर्नओवर: ≤ ₹50 करोड़",
    "Inv: ≤ ₹50 Cr": "निवेश: ≤ ₹50 करोड़",
    "Turn: ≤ ₹250 Cr": "टर्नओवर: ≤ ₹250 करोड़",
    "Registration Flow": "पंजीकरण प्रक्रिया",
    "1. Visit Portal": "1. पोर्टल पर जाएं",
    "2. Verification": "2. सत्यापन",
    "Aadhaar & PAN OTP": "आधार और पैन OTP",
    "3. Business Info": "3. व्यवसाय की जानकारी",
    "Bank details & NIC": "बैंक विवरण और NIC",
    "4. Instant Issue": "4. तुरंत जारी",
    "Download certificate": "प्रमाणपत्र डाउनलोड करें",
    "Unlocked Benefits": "प्राप्त लाभ",
    "No Collateral": "बिना गारंटी ऋण",
    "Loans up to ₹5 Cr": "₹5 करोड़ तक का लोन",
    "Payment Shield": "भुगतान सुरक्षा",
    "45-day delay cover": "45-दिन की देरी पर कवर",
    "Tenders": "सरकारी टेंडर",
    "Deposit exemptions": "जमा छूट",
    "Lower Rates": "कम ब्याज दरें",
    "2% bank subvention": "2% बैंक सब्सिडी",
    "Export Boost": "निर्यात प्रोत्साहन",
    "Global trade schemes": "वैश्विक व्यापार योजनाएं",
    "100% Free Portal": "100% मुफ्त पोर्टल",
    "Registration costs ₹0. Private agents charging fees are scams. Always ensure you are using the official ": "पंजीकरण की लागत ₹0 है। फीस लेने वाले निजी एजेंट घोटाले हैं। हमेशा सुनिश्चित करें कि आप आधिकारिक ",
    " domain.": " डोमेन का उपयोग कर रहे हैं।"
  },
  ta: {
    "The Business Aadhaar": "வணிக ஆதார்",
    "Official MSME recognition by the Govt. of India. Provides a lifetime unique 19-digit identifier (URN).": "இந்திய அரசின் அதிகாரப்பூர்வ MSME அங்கீகாரம். வாழ்நாள் முழுவதும் செல்லுபடியாகும் 19 இலக்க அடையாள எண்ணை (URN) வழங்குகிறது.",
    "Classification Tiers": "வகைப்பாடு அடுக்குகள்",
    "Micro Enterprise": "குறு நிறுவனம்",
    "Small Enterprise": "சிறு நிறுவனம்",
    "Medium Enterprise": "நடுத்தர நிறுவனம்",
    "Inv: ≤ ₹1 Cr": "முதலீடு: ≤ ₹1 கோடி",
    "Turn: ≤ ₹5 Cr": "விற்றுமுதல்: ≤ ₹5 கோடி",
    "Inv: ≤ ₹10 Cr": "முதலீடு: ≤ ₹10 கோடி",
    "Turn: ≤ ₹50 Cr": "விற்றுமுதல்: ≤ ₹50 கோடி",
    "Inv: ≤ ₹50 Cr": "முதலீடு: ≤ ₹50 கோடி",
    "Turn: ≤ ₹250 Cr": "விற்றுமுதல்: ≤ ₹250 கோடி",
    "Registration Flow": "பதிவு செயல்முறை",
    "1. Visit Portal": "1. போர்ட்டலுக்குச் செல்லவும்",
    "2. Verification": "2. சரிபார்ப்பு",
    "Aadhaar & PAN OTP": "ஆதார் மற்றும் பான் OTP",
    "3. Business Info": "3. வணிகத் தகவல்",
    "Bank details & NIC": "வங்கி விவரங்கள் & NIC",
    "4. Instant Issue": "4. உடனடி வெளியீடு",
    "Download certificate": "சான்றிதழைப் பதிவிறக்கவும்",
    "Unlocked Benefits": "கிடைக்கும் நன்மைகள்",
    "No Collateral": "பிணையம் தேவையில்லை",
    "Loans up to ₹5 Cr": "₹5 கோடி வரை கடன்",
    "Payment Shield": "கட்டண பாதுகாப்பு",
    "45-day delay cover": "45 நாள் தாமத பாதுகாப்பு",
    "Tenders": "டெண்டர்கள்",
    "Deposit exemptions": "வைப்புத்தொகை விலக்கு",
    "Lower Rates": "குறைந்த வட்டி",
    "2% bank subvention": "2% வங்கி மானியம்",
    "Export Boost": "ஏற்றுமதி ஊக்கம்",
    "Global trade schemes": "உலகளாவிய வர்த்தக திட்டங்கள்",
    "100% Free Portal": "100% இலவச போர்ட்டல்",
    "Registration costs ₹0. Private agents charging fees are scams. Always ensure you are using the official ": "பதிவுச் செலவு ₹0. கட்டணம் வசூலிக்கும் தனியார் ஏஜெண்டுகள் மோசடியானவர்கள். அதிகாரப்பூர்வ ",
    " domain.": " தளத்தை பயன்படுத்துவதை உறுதிசெய்யவும்."
  },
  te: {
    "The Business Aadhaar": "వ్యాపార ఆధార్",
    "Official MSME recognition by the Govt. of India. Provides a lifetime unique 19-digit identifier (URN).": "భారత ప్రభుత్వం ద్వారా అధికారిక MSME గుర్తింపు. జీవితకాలం చెల్లుబాటయ్యే 19 అంకెల గుర్తింపు సంఖ్యను (URN) అందిస్తుంది.",
    "Classification Tiers": "వర్గీకరణ అంచెలు",
    "Micro Enterprise": "సూక్ష్మ సంస్థ",
    "Small Enterprise": "చిన్న సంస్థ",
    "Medium Enterprise": "మధ్యస్థ సంస్థ",
    "Inv: ≤ ₹1 Cr": "పెట్టుబడి: ≤ ₹1 కోటి",
    "Turn: ≤ ₹5 Cr": "టర్నోవర్: ≤ ₹5 కోట్లు",
    "Inv: ≤ ₹10 Cr": "పెట్టుబడి: ≤ ₹10 కోట్లు",
    "Turn: ≤ ₹50 Cr": "టర్నోవర్: ≤ ₹50 కోట్లు",
    "Inv: ≤ ₹50 Cr": "పెట్టుబడి: ≤ ₹50 కోట్లు",
    "Turn: ≤ ₹250 Cr": "టర్నోవర్: ≤ ₹250 కోట్లు",
    "Registration Flow": "నమోదు ప్రక్రియ",
    "1. Visit Portal": "1. పోర్టల్‌ను సందర్శించండి",
    "2. Verification": "2. ధృవీకరణ",
    "Aadhaar & PAN OTP": "ఆధార్ & పాన్ OTP",
    "3. Business Info": "3. వ్యాపార సమాచారం",
    "Bank details & NIC": "బ్యాంకు వివరాలు & NIC",
    "4. Instant Issue": "4. తక్షణ జారీ",
    "Download certificate": "సర్టిఫికేట్ డౌన్‌లోడ్",
    "Unlocked Benefits": "ప్రయోజనాలు",
    "No Collateral": "హామీ అవసరం లేదు",
    "Loans up to ₹5 Cr": "₹5 కోట్ల వరకు రుణాలు",
    "Payment Shield": "చెల్లింపు రక్షణ",
    "45-day delay cover": "45 రోజుల ఆలస్య రక్షణ",
    "Tenders": "టెండర్లు",
    "Deposit exemptions": "డిపాజిట్ మినహాయింపులు",
    "Lower Rates": "తక్కువ వడ్డీ",
    "2% bank subvention": "2% బ్యాంకు రాయితీ",
    "Export Boost": "ఎగుమతి ప్రోత్సాహం",
    "Global trade schemes": "ప్రపంచ వాణిజ్య పథకాలు",
    "100% Free Portal": "100% ఉచిత పోర్టల్",
    "Registration costs ₹0. Private agents charging fees are scams. Always ensure you are using the official ": "రిజిస్ట్రేషన్ ఖర్చు ₹0. ఫీజులు వసూలు చేసే ప్రైవేట్ ఏజెంట్లు మోసగాళ్లు. ఎల్లప్పుడూ అధికారిక ",
    " domain.": " డొమైన్‌ను ఉపయోగిస్తున్నారని నిర్ధారించుకోండి."
  },
  bn: {
    "The Business Aadhaar": "ব্যবসার আধার",
    "Official MSME recognition by the Govt. of India. Provides a lifetime unique 19-digit identifier (URN).": "ভারত সরকার দ্বারা অফিসিয়াল MSME স্বীকৃতি। একটি আজীবন অনন্য 19-সংখ্যার শনাক্তকারী (URN) প্রদান করে।",
    "Classification Tiers": "শ্রেণীবিভাগ স্তর",
    "Micro Enterprise": "ক্ষুদ্র উদ্যোগ",
    "Small Enterprise": "ছোট উদ্যোগ",
    "Medium Enterprise": "মাঝারি উদ্যোগ",
    "Inv: ≤ ₹1 Cr": "বিনিয়োগ: ≤ ₹1 কোটি",
    "Turn: ≤ ₹5 Cr": "টার্নওভার: ≤ ₹5 কোটি",
    "Inv: ≤ ₹10 Cr": "বিনিয়োগ: ≤ ₹10 কোটি",
    "Turn: ≤ ₹50 Cr": "টার্নওভার: ≤ ₹50 কোটি",
    "Inv: ≤ ₹50 Cr": "বিনিয়োগ: ≤ ₹50 কোটি",
    "Turn: ≤ ₹250 Cr": "টার্নওভার: ≤ ₹250 কোটি",
    "Registration Flow": "নিবন্ধন প্রক্রিয়া",
    "1. Visit Portal": "1. পোর্টালে যান",
    "2. Verification": "2. যাচাইকরণ",
    "Aadhaar & PAN OTP": "আধার এবং প্যান OTP",
    "3. Business Info": "3. ব্যবসার তথ্য",
    "Bank details & NIC": "ব্যাঙ্কের বিবরণ এবং NIC",
    "4. Instant Issue": "4. তাৎক্ষণিক ইস্যু",
    "Download certificate": "সার্টিফিকেট ডাউনলোড করুন",
    "Unlocked Benefits": "প্রাপ্ত সুবিধা",
    "No Collateral": "কোন গ্যারান্টি নেই",
    "Loans up to ₹5 Cr": "₹5 কোটি পর্যন্ত ঋণ",
    "Payment Shield": "পেমেন্ট সুরক্ষা",
    "45-day delay cover": "৪৫ দিনের বিলম্ব কভার",
    "Tenders": "টেন্ডার",
    "Deposit exemptions": "আমানত ছাড়",
    "Lower Rates": "কম সুদের হার",
    "2% bank subvention": "২% ব্যাঙ্ক ভর্তুকি",
    "Export Boost": "রপ্তানি বৃদ্ধি",
    "Global trade schemes": "বিশ্ব বাণিজ্য স্কিম",
    "100% Free Portal": "১০০% ফ্রি পোর্টাল",
    "Registration costs ₹0. Private agents charging fees are scams. Always ensure you are using the official ": "নিবন্ধনের খরচ ₹0। ফি আদায়কারী বেসরকারি এজেন্টরা প্রতারক। সর্বদা নিশ্চিত করুন যে আপনি অফিসিয়াল ",
    " domain.": " ডোমেইন ব্যবহার করছেন।"
  },
  kan: {
    "The Business Aadhaar": "ವ್ಯಾಪಾರ ಆಧಾರ್",
    "Official MSME recognition by the Govt. of India. Provides a lifetime unique 19-digit identifier (URN).": "ಭಾರತ ಸರ್ಕಾರದಿಂದ ಅಧಿಕೃತ MSME ಮಾನ್ಯತೆ. ಜೀವಿತಾವಧಿಯ ವಿಶಿಷ್ಟ 19-ಅಂಕಿಯ ಗುರುತಿಸುವಿಕೆಯನ್ನು (URN) ಒದಗಿಸುತ್ತದೆ.",
    "Classification Tiers": "ವರ್ಗೀಕರಣ ಹಂತಗಳು",
    "Micro Enterprise": "ಸೂಕ್ಷ್ಮ ಉದ್ಯಮ",
    "Small Enterprise": "ಸಣ್ಣ ಉದ್ಯಮ",
    "Medium Enterprise": "ಮಧ್ಯಮ ಉದ್ಯಮ",
    "Inv: ≤ ₹1 Cr": "ಹೂಡಿಕೆ: ≤ ₹1 ಕೋಟಿ",
    "Turn: ≤ ₹5 Cr": "ವಹಿವಾಟು: ≤ ₹5 ಕೋಟಿ",
    "Inv: ≤ ₹10 Cr": "ಹೂಡಿಕೆ: ≤ ₹10 ಕೋಟಿ",
    "Turn: ≤ ₹50 Cr": "ವಹಿವಾಟು: ≤ ₹50 ಕೋಟಿ",
    "Inv: ≤ ₹50 Cr": "ಹೂಡಿಕೆ: ≤ ₹50 ಕೋಟಿ",
    "Turn: ≤ ₹250 Cr": "ವಹಿವಾಟು: ≤ ₹250 ಕೋಟಿ",
    "Registration Flow": "ನೋಂದಣಿ ಪ್ರಕ್ರಿಯೆ",
    "1. Visit Portal": "1. ಪೋರ್ಟಲ್‌ಗೆ ಭೇಟಿ ನೀಡಿ",
    "2. Verification": "2. ಪರಿಶೀಲನೆ",
    "Aadhaar & PAN OTP": "ಆಧಾರ್ ಮತ್ತು ಪ್ಯಾನ್ OTP",
    "3. Business Info": "3. ವ್ಯಾಪಾರ ಮಾಹಿತಿ",
    "Bank details & NIC": "ಬ್ಯಾಂಕ್ ವಿವರಗಳು & NIC",
    "4. Instant Issue": "4. ತ್ವರಿತ ವಿತರಣೆ",
    "Download certificate": "ಪ್ರಮಾಣಪತ್ರ ಡೌನ್‌ಲೋಡ್",
    "Unlocked Benefits": "ಪ್ರಯೋಜನಗಳು",
    "No Collateral": "ಮೇಲಾಧಾರವಿಲ್ಲ",
    "Loans up to ₹5 Cr": "₹5 ಕೋಟಿವರೆಗೆ ಸಾಲ",
    "Payment Shield": "ಪಾವತಿ ರಕ್ಷಣೆ",
    "45-day delay cover": "45 ದಿನಗಳ ವಿಳಂಬ ರಕ್ಷಣೆ",
    "Tenders": "ಟೆಂಡರ್‌ಗಳು",
    "Deposit exemptions": "ಠೇವಣಿ ವಿನಾಯಿತಿಗಳು",
    "Lower Rates": "ಕಡಿಮೆ ಬಡ್ಡಿ ದರ",
    "2% bank subvention": "2% ಬ್ಯಾಂಕ್ ಸಬ್ಸಿಡಿ",
    "Export Boost": "ರಫ್ತು ಉತ್ತೇಜನ",
    "Global trade schemes": "ಜಾಗತಿಕ ವ್ಯಾಪಾರ ಯೋಜನೆಗಳು",
    "100% Free Portal": "100% ಉಚಿತ ಪೋರ್ಟಲ್",
    "Registration costs ₹0. Private agents charging fees are scams. Always ensure you are using the official ": "ನೋಂದಣಿ ವೆಚ್ಚ ₹0. ಶುಲ್ಕ ವಿಧಿಸುವ ಖಾಸಗಿ ಏಜೆಂಟ್‌ಗಳು ವಂಚಕರು. ನೀವು ಅಧಿಕೃತ ",
    " domain.": " ಡೊಮೇನ್ ಬಳಸುತ್ತಿರುವಿರಿ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ."
  }
};

export const UdyamGuide = () => {
  const langCode = (useChatStore((state) => state.profile.preferredLanguage) as string) || 'en';
  const { readAloud, isPlaying } = useReadAloud();
  const t = (text: string) => TRANSLATIONS[langCode]?.[text] || text;

  const registrationSteps = [
    { icon: MonitorSmartphone, title: t("1. Visit Portal"), desc: "udyamregistration.gov.in" },
    { icon: Fingerprint, title: t("2. Verification"), desc: t("Aadhaar & PAN OTP") },
    { icon: Building2, title: t("3. Business Info"), desc: t("Bank details & NIC") },
    { icon: Download, title: t("4. Instant Issue"), desc: t("Download certificate") },
  ];

  const unlockedBenefits = [
    { icon: Landmark, title: t("No Collateral"), desc: t("Loans up to ₹5 Cr") },
    { icon: ShieldCheck, title: t("Payment Shield"), desc: t("45-day delay cover") },
    { icon: CheckCircle2, title: t("Tenders"), desc: t("Deposit exemptions") },
    { icon: Banknote, title: t("Lower Rates"), desc: t("2% bank subvention") },
    { icon: Globe, title: t("Export Boost"), desc: t("Global trade schemes") },
  ];

  const getGuideText = () => [
    t("The Business Aadhaar"),
    t("Official MSME recognition by the Govt. of India. Provides a lifetime unique 19-digit identifier (URN)."),
    t("Classification Tiers"),
    t("Micro Enterprise"), t("Inv: ≤ ₹1 Cr"), t("Turn: ≤ ₹5 Cr"),
    t("Small Enterprise"), t("Inv: ≤ ₹10 Cr"), t("Turn: ≤ ₹50 Cr"),
    t("Medium Enterprise"), t("Inv: ≤ ₹50 Cr"), t("Turn: ≤ ₹250 Cr"),
    t("Registration Flow"),
    t("1. Visit Portal"), "udyamregistration.gov.in",
    t("2. Verification"), t("Aadhaar & PAN OTP"),
    t("3. Business Info"), t("Bank details & NIC"),
    t("4. Instant Issue"), t("Download certificate"),
    t("Unlocked Benefits"),
    t("No Collateral"), t("Loans up to ₹5 Cr"),
    t("Payment Shield"), t("45-day delay cover"),
    t("Tenders"), t("Deposit exemptions"),
    t("Lower Rates"), t("2% bank subvention"),
    t("Export Boost"), t("Global trade schemes"),
    t("100% Free Portal"),
    t("Registration costs ₹0. Private agents charging fees are scams. Always ensure you are using the official ") + ".gov.in" + t(" domain.")
  ].join('. ');

  return (
    <div className="w-full flex flex-col gap-5 animate-fade-in-up pb-8">
      
      {/* READ ALOUD BUTTON */}
      <button
        onClick={() => readAloud(getGuideText(), langCode)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all self-start
          ${isPlaying 
            ? 'bg-blue-100 text-blue-700 border border-blue-200' 
            : 'bg-white text-slate-700 border border-gray-200 hover:border-blue-200 hover:text-blue-600'
          }`}
      >
        {isPlaying ? '⏹ Stop' : '🔊 Read out loud'}
      </button>

      {/* HERO SECTION */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-[#F4F7FF] border border-blue-100 rounded-[2rem] relative overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)]">
        <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-4 relative ">
          <FileText className="text-blue-600" size={28} strokeWidth={2} />
        </div>
        <h4 className="text-slate-900 font-bold text-xl mb-2 tracking-tight relative text-center">
          {t("The Business Aadhaar")}
        </h4>
        <p className="text-slate-600 text-[13px] text-center leading-relaxed max-w-[280px] relative ">
          {t("Official MSME recognition by the Govt. of India. Provides a lifetime unique 19-digit identifier (URN).")}
        </p>
        <Landmark
          size={160}
          className="absolute -right-8 -bottom-10 text-blue-200/40 pointer-events-none"
          strokeWidth={1.5}
        />
      </div>

      {/* CLASSIFICATION TIERS (Badge Card Style) */}
      <div className="flex flex-col gap-4">
        <h4 className="font-semibold text-slate-900 text-[16px] tracking-tight px-1">
          {t("Classification Tiers")}
        </h4>

        {/* Micro */}
        <div className="border border-emerald-100 bg-[#F2FDF7] rounded-[1.5rem] p-5 relative overflow-hidden transition-all hover:shadow-sm">
          <Building2 className="absolute right-[-10px] top-[-10px] text-emerald-500/10" size={100} strokeWidth={1} />
          <h5 className="font-bold text-emerald-950 text-[16px] mb-3 relative ">{t("Micro Enterprise")}</h5>
          <div className="flex gap-2 relative ">
            <div className="bg-white text-emerald-700 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm border border-emerald-50 flex-1 text-center truncate">
              {t("Inv: ≤ ₹1 Cr")}
            </div>
            <div className="bg-white text-emerald-700 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm border border-emerald-50 flex-1 text-center truncate">
              {t("Turn: ≤ ₹5 Cr")}
            </div>
          </div>
        </div>

        {/* Small */}
        <div className="border border-blue-100 bg-[#F4F8FF] rounded-[1.5rem] p-5 relative overflow-hidden transition-all hover:shadow-sm">
          <Building2 className="absolute right-[-10px] top-[-10px] text-blue-500/10" size={100} strokeWidth={1} />
          <h5 className="font-bold text-blue-950 text-[16px] mb-3 relative ">{t("Small Enterprise")}</h5>
          <div className="flex gap-2 relative ">
            <div className="bg-white text-blue-700 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm border border-blue-50 flex-1 text-center truncate">
              {t("Inv: ≤ ₹10 Cr")}
            </div>
            <div className="bg-white text-blue-700 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm border border-blue-50 flex-1 text-center truncate">
              {t("Turn: ≤ ₹50 Cr")}
            </div>
          </div>
        </div>

        {/* Medium */}
        <div className="border border-purple-100 bg-[#F8F5FF] rounded-[1.5rem] p-5 relative overflow-hidden transition-all hover:shadow-sm">
          <Building2 className="absolute right-[-10px] top-[-10px] text-purple-500/10" size={100} strokeWidth={1} />
          <h5 className="font-bold text-purple-950 text-[16px] mb-3 relative ">{t("Medium Enterprise")}</h5>
          <div className="flex gap-2 relative ">
            <div className="bg-white text-purple-700 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm border border-purple-50 flex-1 text-center truncate">
              {t("Inv: ≤ ₹50 Cr")}
            </div>
            <div className="bg-white text-purple-700 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm border border-purple-50 flex-1 text-center truncate">
              {t("Turn: ≤ ₹250 Cr")}
            </div>
          </div>
        </div>
      </div>

      {/* REGISTRATION FLOW (Redesigned: Visual File Cards Grid) */}
      <div className="p-5 bg-white border border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] rounded-[1.5rem]">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-slate-400" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">
            {t("Registration Flow")}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {registrationSteps.map((step, i) => (
            <div key={i} className="flex flex-col gap-2 p-3 bg-slate-50 border border-gray-100 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                <step.icon size={16} className="text-slate-600" />
              </div>
              <div>
                <h5 className="font-semibold text-slate-800 text-[12px]">{step.title}</h5>
                <p className="text-[10px] text-slate-500 leading-snug">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KEY BENEFITS (Grid) */}
      <div className="p-5 bg-white border border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] rounded-[1.5rem]">
        <div className="flex items-center gap-2 mb-4">
          <Award className="text-slate-400" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">
            {t("Unlocked Benefits")}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {unlockedBenefits.map((benefit, i) => (
            <div
              key={i}
              className="p-3 bg-slate-50 border border-gray-100 rounded-xl hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-300"
            >
              <benefit.icon
                size={18}
                strokeWidth={2}
                className="text-slate-400 mb-2 group-hover:text-slate-900 transition-colors duration-300"
              />
              <h5 className="font-semibold text-slate-800 text-[12px] mb-0.5">
                {benefit.title}
              </h5>
              <p className="text-[10px] text-slate-500 leading-snug">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER WARNING ALERT */}
      <div className="p-5 bg-slate-900 rounded-[1.5rem] flex flex-col shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-slate-800 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50"></div>

        <div className="flex items-start gap-3 relative ">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/5 backdrop-blur-sm">
            <AlertTriangle className="text-amber-400" size={18} strokeWidth={2} />
          </div>
          <div>
            <h5 className="text-[14px] font-bold text-white mb-1 tracking-tight">
              {t("100% Free Portal")}
            </h5>
            <p className="text-[12px] text-slate-400 leading-relaxed">
              {t("Registration costs ₹0. Private agents charging fees are scams. Always ensure you are using the official ")}
              <span className="text-slate-300 font-medium">.gov.in</span>
              {t(" domain.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
