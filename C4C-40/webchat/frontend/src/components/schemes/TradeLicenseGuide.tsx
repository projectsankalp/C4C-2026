
import React from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useReadAloud } from '@/hooks/useReadAloud';
import { 
  Store, MapPin, Building, AlertTriangle, CheckCircle2, 
  Banknote, FileText, RefreshCw, ShieldCheck, Key, 
  Utensils, Scissors, Wrench, IdCard, Map, Clock, 
  CalendarDays, BookOpen
} from 'lucide-react';

// --------------------------------------------------------
// INLINE DICTIONARY FOR VISUAL GUIDES
// --------------------------------------------------------
const TRANSLATIONS: Record<string, Record<string, string>> = {
  hi: {
    "Shop & Trade License": "दुकान और व्यापार लाइसेंस",
    "Mandatory legal permission from your local municipality to operate a physical shop or commercial establishment.": "भौतिक दुकान या वाणिज्यिक प्रतिष्ठान संचालित करने के लिए आपकी स्थानीय नगर पालिका से अनिवार्य कानूनी अनुमति।",
    "Core Rules & Limits": "मुख्य नियम और सीमाएं",
    "Who Needs It?": "इसकी आवश्यकता किसे है?",
    "Documents Required": "आवश्यक दस्तावेज़",
    "Estimated Fees": "अनुमानित शुल्क",
    "Employee Protections Unlocked": "कर्मचारी सुरक्षा",
    "Operate Without It? High Risk.": "इसके बिना काम करना? उच्च जोखिम।",
    "Running a business without a valid trade license can result in heavy fines, sealing of your premises by the local authority, and criminal proceedings.": "वैध व्यापार लाइसेंस के बिना व्यवसाय चलाने पर भारी जुर्माना, स्थानीय प्राधिकरण द्वारा आपके परिसर को सील करना और आपराधिक कार्यवाही हो सकती है।"
  },
  ta: {
    "Shop & Trade License": "கடை மற்றும் வர்த்தக உரிமம்",
    "Mandatory legal permission from your local municipality to operate a physical shop or commercial establishment.": "உடல் கடை அல்லது வணிக நிறுவனத்தை நடத்த உங்கள் உள்ளூர் நகராட்சியிடமிருந்து கட்டாய சட்ட அனுமதி.",
    "Core Rules & Limits": "முக்கிய விதிகள் மற்றும் வரம்புகள்",
    "Who Needs It?": "இது யாருக்கு தேவை?",
    "Documents Required": "தேவையான ஆவணங்கள்",
    "Estimated Fees": "மதிப்பிடப்பட்ட கட்டணம்",
    "Employee Protections Unlocked": "பணியாளர் பாதுகாப்புகள்",
    "Operate Without It? High Risk.": "இது இல்லாமல் செயல்படுவதா? அதிக ஆபத்து.",
    "Running a business without a valid trade license can result in heavy fines, sealing of your premises by the local authority, and criminal proceedings.": "சரியான உரிமம் இல்லாமல் வணிகத்தை நடத்துவது கடுமையான அபராதம், வளாகத்திற்கு சீல் வைப்பு மற்றும் கிரிமினல் நடவடிக்கைகளுக்கு வழிவகுக்கும்."
  },
  te: {
    "Shop & Trade License": "షాప్ & ట్రేడ్ లైసెన్స్",
    "Mandatory legal permission from your local municipality to operate a physical shop or commercial establishment.": "భౌతిక దుకాణం లేదా వాణిజ్య సంస్థను నిర్వహించడానికి మీ స్థానిక మునిసిపాలిటీ నుండి తప్పనిసరి చట్టపరమైన అనుమతి.",
    "Core Rules & Limits": "ప్రధాన నియమాలు & పరిమితులు",
    "Who Needs It?": "ఇది ఎవరికి కావాలి?",
    "Documents Required": "అవసరమైన పత్రాలు",
    "Estimated Fees": "అంచనా వేయబడిన ఫీజు",
    "Employee Protections Unlocked": "ఉద్యోగుల రక్షణలు",
    "Operate Without It? High Risk.": "ఇది లేకుండా పనిచేయాలా? అధిక ప్రమాదం.",
    "Running a business without a valid trade license can result in heavy fines, sealing of your premises by the local authority, and criminal proceedings.": "చెల్లుబాటు అయ్యే ట్రేడ్ లైసెన్స్ లేకుండా వ్యాపారాన్ని నిర్వహించడం వల్ల భారీ జరిమానాలు, ప్రాంగణాన్ని సీల్ చేయడం మరియు నేర విచారణలు జరగవచ్చు."
  },
  bn: {
    "Shop & Trade License": "দোকান ও ট্রেড লাইসেন্স",
    "Mandatory legal permission from your local municipality to operate a physical shop or commercial establishment.": "একটি ভৌত দোকান বা বাণিজ্যিক প্রতিষ্ঠান পরিচালনার জন্য আপনার স্থানীয় পৌরসভার বাধ্যতামূলক আইনি অনুমতি।",
    "Core Rules & Limits": "মূল নিয়ম এবং সীমা",
    "Who Needs It?": "কাদের এটি প্রয়োজন?",
    "Documents Required": "প্রয়োজনীয় কাগজপত্র",
    "Estimated Fees": "আনুমানিক ফি",
    "Employee Protections Unlocked": "কর্মচারী সুরক্ষা",
    "Operate Without It? High Risk.": "এটি ছাড়া কাজ করবেন? উচ্চ ঝুঁকি।",
    "Running a business without a valid trade license can result in heavy fines, sealing of your premises by the local authority, and criminal proceedings.": "বৈধ ট্রেড লাইসেন্স ছাড়া ব্যবসা পরিচালনা করলে ভারী জরিমানা, প্রাঙ্গণ সিল করা এবং ফৌজদারি কার্যধারা হতে পারে।"
  },
  kan: {
    "Shop & Trade License": "ಅಂಗಡಿ ಮತ್ತು ವ್ಯಾಪಾರ ಪರವಾನಗಿ",
    "Mandatory legal permission from your local municipality to operate a physical shop or commercial establishment.": "ಭೌತಿಕ ಅಂಗಡಿ ಅಥವಾ ವಾಣಿಜ್ಯ ಸ್ಥಾಪನೆಯನ್ನು ನಿರ್ವಹಿಸಲು ನಿಮ್ಮ ಸ್ಥಳೀಯ ಪುರಸಭೆಯಿಂದ ಕಡ್ಡಾಯ ಕಾನೂನು ಅನುಮತಿ.",
    "Core Rules & Limits": "ಮುಖ್ಯ ನಿಯಮಗಳು ಮತ್ತು ಮಿತಿಗಳು",
    "Who Needs It?": "ಇದು ಯಾರಿಗೆ ಬೇಕು?",
    "Documents Required": "ಅಗತ್ಯವಿರುವ ದಾಖಲೆಗಳು",
    "Estimated Fees": "ಅಂದಾಜು ಶುಲ್ಕಗಳು",
    "Employee Protections Unlocked": "ಉದ್ಯೋಗಿ ರಕ್ಷಣೆಗಳು",
    "Operate Without It? High Risk.": "ಇದಿಲ್ಲದೆ ಕಾರ್ಯನಿರ್ವಹಿಸುವುದೇ? ಹೆಚ್ಚಿನ ಅಪಾಯ.",
    "Running a business without a valid trade license can result in heavy fines, sealing of your premises by the local authority, and criminal proceedings.": "ಮಾನ್ಯ ವ್ಯಾಪಾರ ಪರವಾನಗಿ ಇಲ್ಲದೆ ವ್ಯಾಪಾರವನ್ನು ನಡೆಸುವುದರಿಂದ ಭಾರಿ ದಂಡಗಳು, ಆವರಣದ ಸೀಲಿಂಗ್ ಮತ್ತು ಕ್ರಿಮಿನಲ್ ಮೊಕದ್ದಮೆಗಳಿಗೆ ಕಾರಣವಾಗಬಹುದು."
  }
};

export const TradeLicenseGuide = () => {
  const langCode = (useChatStore((state) => state.profile.preferredLanguage) as string) || 'en';
  const { readAloud, isPlaying } = useReadAloud();

  const t = (englishText: string) => {
    return TRANSLATIONS[langCode]?.[englishText] || englishText;
  };

  const getGuideText = () => [
    t("Shop & Trade License"),
    t("Mandatory legal permission from your local municipality to operate a physical shop or commercial establishment."),
    t("Core Rules & Limits"),
    t("Locally Issued"), t("By Municipal Corp or Panchayat."),
    t("Zone Specific"), t("Prohibits commercial work in residential zones."),
    t("Annual Renewal"), t("Must be renewed every 1-3 years."),
    t("No Property Rights"), t("Permits trading, doesn't prove ownership."),
    t("Who Needs It?"),
    t("Retail & Grocery"), t("Supermarkets, kirana, malls"),
    t("Food & Dining"), t("Restaurants, dhabas, cafes"),
    t("Services"), t("Salons, gyms, clinics"),
    t("Industrial"), t("Workshops & warehouses"),
    t("Documents Required"),
    t("Govt ID Proof"), t("Aadhaar, PAN, or Passport"),
    t("Premises Proof"), t("Rental deed or ownership doc"),
    t("Landlord NOC"), t("Required for rented spaces"),
    t("Layout Plan"), t("Dimensions of the shop"),
    t("Estimated Fees"),
    "Small Shop", "Up to 5 staff", "₹500 – ₹2k",
    "Medium", "5-20 staff", "₹2k – ₹5k",
    "Large Estab.", "20+ staff", "₹5k – ₹20k+",
    "Industrial", "Factories", "Variable",
    "*Fees vary significantly by municipality",
    t("Employee Protections Unlocked"),
    "Working Hours", "Max 9 hours/day and 48 hours/week.",
    "Rest & Leave", "Mandatory weekly rest day + sick/earned leave.",
    "Record Keeping", "Must maintain wage and attendance registers.",
    t("Operate Without It? High Risk."),
    t("Running a business without a valid trade license can result in heavy fines, sealing of your premises by the local authority, and criminal proceedings.")
  ].join('. ');

  return (
    <div className="w-full flex flex-col gap-5 animate-fade-in-up pb-8">
      
      {/* READ ALOUD BUTTON */}
      <button
        onClick={() => readAloud(getGuideText(), langCode)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all self-start
          ${isPlaying 
            ? 'bg-teal-100 text-teal-700 border border-teal-200' 
            : 'bg-white text-slate-700 border border-gray-200 hover:border-teal-200 hover:text-teal-600'
          }`}
      >
        {isPlaying ? '⏹ Stop' : '🔊 Read out loud'}
      </button>

      {/* HERO SECTION */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-[#F0FDF8] border border-teal-100 rounded-[2rem] relative overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)]">
        <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-4 relative ">
          <Store size={28} className="text-teal-600" strokeWidth={2} />
        </div>
        <h4 className="text-slate-900 font-bold text-xl mb-2 tracking-tight relative text-center">
          {t("Shop & Trade License")}
        </h4>
        <p className="text-slate-600 text-[13px] text-center leading-relaxed max-w-[280px] relative ">
          {t("Mandatory legal permission from your local municipality to operate a physical shop or commercial establishment.")}
        </p>
        <Building size={160} className="absolute -right-8 -bottom-8 text-teal-500/5 pointer-events-none" />
      </div>

      {/* CORE RULES (Visual 2x2 Grid) */}
      <div className="p-5 bg-white border border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] rounded-[1.5rem]">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="text-slate-400" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">
            {t("Core Rules & Limits")}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: MapPin, title: "Locally Issued", desc: "By Municipal Corp or Panchayat." },
            { icon: Map, title: "Zone Specific", desc: "Prohibits commercial work in residential zones." },
            { icon: RefreshCw, title: "Annual Renewal", desc: "Must be renewed every 1-3 years." },
            { icon: Key, title: "No Property Rights", desc: "Permits trading, doesn't prove ownership." },
          ].map((item, i) => (
            <div key={i} className="p-3 bg-slate-50 border border-gray-100 rounded-xl flex flex-col">
              <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 mb-2">
                <item.icon size={16} className="text-teal-600" />
              </div>
              <h5 className="font-semibold text-slate-800 text-[12px] mb-0.5">{t(item.title)}</h5>
              <p className="text-[10px] text-slate-500 leading-snug">{t(item.desc)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* WHO NEEDS IT (2x2 Grid) */}
      <div className="p-5 bg-white border border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] rounded-[1.5rem]">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="text-slate-400" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">
            {t("Who Needs It?")}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Store, title: "Retail & Grocery", desc: "Supermarkets, kirana, malls" },
            { icon: Utensils, title: "Food & Dining", desc: "Restaurants, dhabas, cafes" },
            { icon: Scissors, title: "Services", desc: "Salons, gyms, clinics" },
            { icon: Wrench, title: "Industrial", desc: "Workshops & warehouses" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-2 p-3 bg-slate-50 border border-gray-100 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                <item.icon size={16} className="text-slate-600" />
              </div>
              <div>
                <h5 className="font-semibold text-slate-800 text-[12px]">{t(item.title)}</h5>
                <p className="text-[10px] text-slate-500 leading-snug">{t(item.desc)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DOCUMENTS REQUIRED (2x2 Grid) */}
      <div className="p-5 bg-white border border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] rounded-[1.5rem]">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="text-slate-400" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">
            {t("Documents Required")}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: IdCard, title: "Govt ID Proof", desc: "Aadhaar, PAN, or Passport" },
            { icon: Building, title: "Premises Proof", desc: "Rental deed or ownership doc" },
            { icon: CheckCircle2, title: "Landlord NOC", desc: "Required for rented spaces" },
            { icon: Map, title: "Layout Plan", desc: "Dimensions of the shop" },
          ].map((doc, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-gray-100 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                <doc.icon size={16} className="text-slate-600" />
              </div>
              <div>
                <h5 className="font-semibold text-slate-800 text-[12px]">{t(doc.title)}</h5>
                <p className="text-[10px] text-slate-500 line-clamp-1">{t(doc.desc)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ESTIMATED FEES (Visual Badge Grid) */}
      <div className="p-5 bg-white border border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] rounded-[1.5rem]">
        <div className="flex items-center gap-2 mb-4">
          <Banknote className="text-slate-400" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">
            {t("Estimated Fees")}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {[
            { title: 'Small Shop', desc: 'Up to 5 staff', fee: '₹500 – ₹2k', bg: 'bg-[#F2FDF7]', border: 'border-emerald-100', text: 'text-emerald-700' },
            { title: 'Medium', desc: '5-20 staff', fee: '₹2k – ₹5k', bg: 'bg-[#F4F8FF]', border: 'border-blue-100', text: 'text-blue-700' },
            { title: 'Large Estab.', desc: '20+ staff', fee: '₹5k – ₹20k+', bg: 'bg-[#FFF4ED]', border: 'border-orange-200', text: 'text-orange-700' },
            { title: 'Industrial', desc: 'Factories', fee: 'Variable', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
          ].map((item, i) => (
            <div key={i} className={`p-3 ${item.bg} border ${item.border} rounded-xl transition-all hover:shadow-sm`}>
              <span className={`text-[16px] font-black ${item.text} block mb-1 leading-none`}>{item.fee}</span>
              <h5 className={`font-semibold text-[11px] ${item.text} mb-0.5`}>{item.title}</h5>
              <p className={`text-[10px] ${item.text} opacity-80 leading-snug`}>{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 text-center uppercase tracking-wider font-semibold">
          *Fees vary significantly by municipality
        </p>
      </div>

      {/* EMPLOYEE PROTECTIONS (Stylized Data Card) */}
      <div className="p-5 bg-[#F0FDF8] border border-teal-100 rounded-[1.5rem] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="text-teal-600" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-teal-950 tracking-tight">
            {t("Employee Protections Unlocked")}
          </h4>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-teal-50 shadow-sm">
            <Clock className="text-teal-500 shrink-0" size={16} />
            <div>
              <span className="block text-[12px] font-bold text-slate-800">Working Hours</span>
              <span className="text-[11px] text-slate-500">Max 9 hours/day and 48 hours/week.</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-teal-50 shadow-sm">
            <CalendarDays className="text-teal-500 shrink-0" size={16} />
            <div>
              <span className="block text-[12px] font-bold text-slate-800">Rest & Leave</span>
              <span className="text-[11px] text-slate-500">Mandatory weekly rest day + sick/earned leave.</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-teal-50 shadow-sm">
            <BookOpen className="text-teal-500 shrink-0" size={16} />
            <div>
              <span className="block text-[12px] font-bold text-slate-800">Record Keeping</span>
              <span className="text-[11px] text-slate-500">Must maintain wage and attendance registers.</span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER WARNING */}
      <div className="bg-[#FFF5F5] border border-red-100 rounded-[1.25rem] p-4 flex gap-3 shadow-sm">
        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} strokeWidth={2} />
        <div>
          <h5 className="text-[13px] font-bold text-red-950 mb-0.5">
            {t("Operate Without It? High Risk.")}
          </h5>
          <p className="text-[12px] text-red-900/80 leading-relaxed">
            {t("Running a business without a valid trade license can result in heavy fines, sealing of your premises by the local authority, and criminal proceedings.")}
          </p>
        </div>
      </div>

    </div>
  );
};