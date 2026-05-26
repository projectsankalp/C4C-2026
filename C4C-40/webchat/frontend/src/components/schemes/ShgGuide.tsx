import React from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useReadAloud } from '@/hooks/useReadAloud';
import { 
  Users, 
  Coins, 
  HeartHandshake, 
  Sprout, 
  Clock, 
  TrendingUp, 
  Landmark, 
  Star,
  BookOpen,
  MapPin
} from 'lucide-react';

// --------------------------------------------------------
// MULTILINGUAL DICTIONARY FOR SHG GUIDE
// --------------------------------------------------------
const TRANSLATIONS: Record<string, any> = {
  en: {
    heroTitle: "Self Help Group (SHG)",
    heroDesc: "A community organization of 10-20 local women who pool savings to collectively access credit and government benefits.",
    howItWorksTitle: "How it Works",
    howItWorks: [
      { step: '1', title: "Form Group", desc: "10-20 women from the same locality unite." },
      { step: '2', title: "Pool Savings", desc: "Fixed weekly or monthly deposits." },
      { step: '3', title: "Internal Lending", desc: "Small, low-interest loans to members." },
      { step: '4', title: "Bank Linkage", desc: "Eligibility for massive bank loans." },
    ],
    benefitsTitle: "Why form or join?",
    benefits: [
      { title: "Micro-Credit", desc: "Loans from pooled savings" },
      { title: "Bank Linkage", desc: "Zero-collateral bank loans" },
      { title: "Skills Training", desc: "Govt/NGO business training" },
      { title: "Social Capital", desc: "Collective community voice" },
    ],
    nrlmTitle: "NRLM Subsidy Benefits",
    nrlmDesc: "Registered SHGs receive massive financial support and grants from the Govt.",
    nrlmPoints: [
      { label: "Revolving Fund", value: "₹10k – ₹15k" },
      { label: "Community Fund", value: "Up to ₹2.5L" },
      { label: "Interest Subvention", value: "4% – 7% p.a." },
    ],
    stateProgramsTitle: "Key State Programmes",
    statePrograms: [
      { name: "DAY-NRLM", scope: "National" },
      { name: "Kudumbashree", scope: "Kerala" },
      { name: "Jeevika", scope: "Bihar" },
      { name: "Stree Nidhi", scope: "Telangana" },
    ],
    footerTitle: "Maintain Your Registers",
    footerDesc: "Banks assess SHG credibility through meeting attendance, passbooks, and repayment history. Well-kept registers are vital for securing large loans."
  },
  hi: {
    heroTitle: "स्वयं सहायता समूह (SHG)",
    heroDesc: "10-20 स्थानीय महिलाओं का एक सामुदायिक संगठन जो ऋण और सरकारी लाभों तक सामूहिक पहुंच के लिए बचत एकत्र करता है।",
    howItWorksTitle: "यह कैसे काम करता है",
    howItWorks: [
      { step: '1', title: "समूह बनाएं", desc: "एक ही इलाके की 10-20 महिलाएं एकजुट होती हैं।" },
      { step: '2', title: "बचत एकत्र करें", desc: "निश्चित साप्ताहिक या मासिक जमा।" },
      { step: '3', title: "आंतरिक ऋण", desc: "सदस्यों को छोटे, कम ब्याज वाले ऋण।" },
      { step: '4', title: "बैंक लिंकेज", desc: "बड़े बैंक ऋणों के लिए पात्रता।" },
    ],
    benefitsTitle: "क्यों बनाएं या जुड़ें?",
    benefits: [
      { title: "माइक्रो-क्रेडिट", desc: "एकत्रित बचत से ऋण" },
      { title: "बैंक लिंकेज", desc: "शून्य-संपार्श्विक बैंक ऋण" },
      { title: "कौशल प्रशिक्षण", desc: "सरकारी/NGO व्यापार प्रशिक्षण" },
      { title: "सामाजिक पूंजी", desc: "सामूहिक सामुदायिक आवाज" },
    ],
    nrlmTitle: "NRLM सब्सिडी लाभ",
    nrlmDesc: "पंजीकृत SHGs को सरकार से भारी वित्तीय सहायता और अनुदान प्राप्त होता है।",
    nrlmPoints: [
      { label: "रिवॉल्विंग फंड", value: "₹10k – ₹15k" },
      { label: "सामुदायिक फंड", value: "₹2.5L तक" },
      { label: "ब्याज सहायता", value: "4% – 7% प्रति वर्ष" },
    ],
    stateProgramsTitle: "प्रमुख राज्य कार्यक्रम",
    statePrograms: [
      { name: "DAY-NRLM", scope: "राष्ट्रीय" },
      { name: "Kudumbashree", scope: "केरल" },
      { name: "Jeevika", scope: "बिहार" },
      { name: "Stree Nidhi", scope: "तेलंगाना" },
    ],
    footerTitle: "अपने रजिस्टर बनाए रखें",
    footerDesc: "बैंक बैठक में उपस्थिति, पासबुक और पुनर्भुगतान इतिहास के माध्यम से SHG की विश्वसनीयता का आकलन करते हैं। बड़े ऋण प्राप्त करने के लिए अच्छी तरह से रखे गए रजिस्टर महत्वपूर्ण हैं।"
  },
  ta: {
    heroTitle: "சுய உதவிக் குழு (SHG)",
    heroDesc: "கடன் மற்றும் அரசு நலன்களைப் பெற சேமிப்பை ஒன்றிணைக்கும் 10-20 உள்ளூர் பெண்களின் சமூக அமைப்பு.",
    howItWorksTitle: "எப்படி செயல்படுகிறது",
    howItWorks: [
      { step: '1', title: "குழுவை உருவாக்கு", desc: "ஒரே பகுதியைச் சேர்ந்த 10-20 பெண்கள் இணைகிறார்கள்." },
      { step: '2', title: "சேமிப்பு", desc: "நிலையான வாராந்திர அல்லது மாதாந்திர வைப்பு." },
      { step: '3', title: "உள் கடன்", desc: "உறுப்பினர்களுக்கு குறைந்த வட்டி கடன்கள்." },
      { step: '4', title: "வங்கி இணைப்பு", desc: "பெரிய வங்கி கடன்களுக்கான தகுதி." },
    ],
    benefitsTitle: "ஏன் இணைய வேண்டும்?",
    benefits: [
      { title: "நுண் கடன்", desc: "சேமிப்பிலிருந்து கடன்" },
      { title: "வங்கி இணைப்பு", desc: "பிணையற்ற வங்கி கடன்கள்" },
      { title: "திறன் பயிற்சி", desc: "அரசு/NGO வணிக பயிற்சி" },
      { title: "சமூக மூலதனம்", desc: "கூட்டு சமூக குரல்" },
    ],
    nrlmTitle: "NRLM மானிய நன்மைகள்",
    nrlmDesc: "பதிவு செய்யப்பட்ட SHG-கள் அரசிடமிருந்து பெரிய நிதி ஆதரவையும் மானியங்களையும் பெறுகின்றன.",
    nrlmPoints: [
      { label: "சுழல் நிதி", value: "₹10k – ₹15k" },
      { label: "சமூக நிதி", value: "₹2.5L வரை" },
      { label: "வட்டி மானியம்", value: "ஆண்டுக்கு 4% – 7%" },
    ],
    stateProgramsTitle: "முக்கிய மாநில திட்டங்கள்",
    statePrograms: [
      { name: "DAY-NRLM", scope: "தேசிய" },
      { name: "Kudumbashree", scope: "கேரளா" },
      { name: "Jeevika", scope: "பீகார்" },
      { name: "Stree Nidhi", scope: "தெலுங்கானா" },
    ],
    footerTitle: "பதிவேடுகளைப் பராமரிக்கவும்",
    footerDesc: "கூட்ட வருகை, பாஸ்புக் மற்றும் திருப்பிச் செலுத்தும் வரலாறு மூலம் வங்கிகள் SHG நம்பகத்தன்மையை மதிப்பிடுகின்றன. பெரிய கடன்களைப் பெற சரியான பதிவேடுகள் அவசியம்."
  },
  te: {
    heroTitle: "స్వయం సహాయక బృందం (SHG)",
    heroDesc: "క్రెడిట్ మరియు ప్రభుత్వ ప్రయోజనాలను పొందడానికి పొదుపును పూల్ చేసే 10-20 స్థానిక మహిళల సంఘం.",
    howItWorksTitle: "ఇది ఎలా పనిచేస్తుంది",
    howItWorks: [
      { step: '1', title: "బృందాన్ని ఏర్పాటు", desc: "ఒకే ప్రాంతానికి చెందిన 10-20 మంది మహిళలు ఏకమవుతారు." },
      { step: '2', title: "పొదుపు", desc: "స్థిర వార లేదా నెలవారీ డిపాజిట్లు." },
      { step: '3', title: "అంతర్గత రుణాలు", desc: "సభ్యులకు చిన్న, తక్కువ వడ్డీ రుణాలు." },
      { step: '4', title: "బ్యాంకు అనుసంధానం", desc: "పెద్ద బ్యాంకు రుణాలకు అర్హత." },
    ],
    benefitsTitle: "ఎందుకు చేరాలి?",
    benefits: [
      { title: "మైక్రో-క్రెడిట్", desc: "పొదుపు నుండి రుణాలు" },
      { title: "బ్యాంకు అనుసంధానం", desc: "హామీ లేని బ్యాంకు రుణాలు" },
      { title: "నైపుణ్య శిక్షణ", desc: "ప్రభుత్వ/NGO వ్యాపార శిక్షణ" },
      { title: "సామాజిక మూలధనం", desc: "సామూహిక సామాజిక స్వరం" },
    ],
    nrlmTitle: "NRLM సబ్సిడీ ప్రయోజనాలు",
    nrlmDesc: "నమోదిత SHGలు ప్రభుత్వం నుండి భారీ ఆర్థిక సహాయం మరియు గ్రాంట్లను పొందుతాయి.",
    nrlmPoints: [
      { label: "రివాల్వింగ్ ఫండ్", value: "₹10k – ₹15k" },
      { label: "కమ్యూనిటీ ఫండ్", value: "₹2.5L వరకు" },
      { label: "వడ్డీ సబ్సిడీ", value: "సంవత్సరానికి 4% – 7%" },
    ],
    stateProgramsTitle: "ముఖ్య రాష్ట్ర కార్యక్రమాలు",
    statePrograms: [
      { name: "DAY-NRLM", scope: "జాతీయ" },
      { name: "Kudumbashree", scope: "కేరళ" },
      { name: "Jeevika", scope: "బీహార్" },
      { name: "Stree Nidhi", scope: "తెలంగాణ" },
    ],
    footerTitle: "మీ రికార్డులను నిర్వహించండి",
    footerDesc: "సమావేశ హాజరు, పాస్‌బుక్‌లు మరియు తిరిగి చెల్లించే చరిత్ర ద్వారా బ్యాంకులు SHG విశ్వసనీయతను అంచనా వేస్తాయి. పెద్ద రుణాలను పొందడానికి రికార్డులు చాలా ముఖ్యం."
  },
  bn: {
    heroTitle: "স্বনির্ভর গোষ্ঠী (SHG)",
    heroDesc: "১০-২০ জন স্থানীয় মহিলার একটি সম্প্রদায় যারা ঋণ এবং সরকারি সুবিধা পেতে সঞ্চয় একত্রিত করে।",
    howItWorksTitle: "কিভাবে কাজ করে",
    howItWorks: [
      { step: '1', title: "গ্রুপ গঠন", desc: "একই এলাকার ১০-২০ জন মহিলা একত্রিত হন।" },
      { step: '2', title: "সঞ্চয়", desc: "নির্দিষ্ট সাপ্তাহিক বা মাসিক আমানত।" },
      { step: '3', title: "অভ্যন্তরীণ ঋণ", desc: "সদস্যদের জন্য ছোট, কম সুদের ঋণ।" },
      { step: '4', title: "ব্যাংক লিঙ্কেজ", desc: "বড় ব্যাংক ঋণের জন্য যোগ্যতা।" },
    ],
    benefitsTitle: "কেন গঠন বা যোগদান করবেন?",
    benefits: [
      { title: "মাইক্রো-ক্রেডিট", desc: "সঞ্চয় থেকে ঋণ" },
      { title: "ব্যাংক লিঙ্কেজ", desc: "জামানতবিহীন ব্যাংক ঋণ" },
      { title: "দক্ষতা প্রশিক্ষণ", desc: "সরকারি/NGO ব্যবসা প্রশিক্ষণ" },
      { title: "সামাজিক পুঁজি", desc: "সম্মিলিত সম্প্রদায়ের ভয়েস" },
    ],
    nrlmTitle: "NRLM ভর্তুকি সুবিধা",
    nrlmDesc: "নিবন্ধিত SHG সরকার থেকে বিপুল আর্থিক সহায়তা এবং অনুদান পায়।",
    nrlmPoints: [
      { label: "রিভলভিং ফান্ড", value: "₹10k – ₹15k" },
      { label: "কমিউনিটি ফান্ড", value: "₹2.5L পর্যন্ত" },
      { label: "সুদ সাবভেনশন", value: "বার্ষিক 4% – 7%" },
    ],
    stateProgramsTitle: "প্রধান রাজ্য কর্মসূচি",
    statePrograms: [
      { name: "DAY-NRLM", scope: "জাতীয়" },
      { name: "Kudumbashree", scope: "কেরালা" },
      { name: "Jeevika", scope: "বিহার" },
      { name: "Stree Nidhi", scope: "তেলেঙ্গানা" },
    ],
    footerTitle: "আপনার খাতা বজায় রাখুন",
    footerDesc: "মিটিংয়ে উপস্থিতি, পাসবুক এবং ঋণ পরিশোধের ইতিহাসের মাধ্যমে ব্যাংকগুলি SHG এর বিশ্বাসযোগ্যতা মূল্যায়ন করে। বড় ঋণ সুরক্ষিত করার জন্য সুপরিচালিত খাতা অত্যাবশ্যক।"
  },
  kan: {
    heroTitle: "ಸ್ವಸಹಾಯ ಸಂಘ (SHG)",
    heroDesc: "ಕ್ರೆಡಿಟ್ ಮತ್ತು ಸರ್ಕಾರಿ ಪ್ರಯೋಜನಗಳನ್ನು ಪಡೆಯಲು ಉಳಿತಾಯವನ್ನು ಒಟ್ಟುಗೂಡಿಸುವ 10-20 ಸ್ಥಳೀಯ ಮಹಿಳೆಯರ ಸಮುದಾಯ ಸಂಸ್ಥೆ.",
    howItWorksTitle: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
    howItWorks: [
      { step: '1', title: "ಗುಂಪು ರಚಿಸಿ", desc: "ಒಂದೇ ಪ್ರದೇಶದ 10-20 ಮಹಿಳೆಯರು ಒಂದಾಗುತ್ತಾರೆ." },
      { step: '2', title: "ಉಳಿತಾಯ", desc: "ಸ್ಥಿರ ಸಾಪ್ತಾಹಿಕ ಅಥವಾ ಮಾಸಿಕ ಠೇವಣಿಗಳು." },
      { step: '3', title: "ಆಂತರಿಕ ಸಾಲ", desc: "ಸದಸ್ಯರಿಗೆ ಸಣ್ಣ, ಕಡಿಮೆ ಬಡ್ಡಿ ಸಾಲಗಳು." },
      { step: '4', title: "ಬ್ಯಾಂಕ್ ಲಿಂಕೇಜ್", desc: "ದೊಡ್ಡ ಬ್ಯಾಂಕ್ ಸಾಲಗಳಿಗೆ ಅರ್ಹತೆ." },
    ],
    benefitsTitle: "ಏಕೆ ಸೇರಬೇಕು?",
    benefits: [
      { title: "ಮೈಕ್ರೋ-ಕ್ರೆಡಿಟ್", desc: "ಉಳಿತಾಯದಿಂದ ಸಾಲಗಳು" },
      { title: "ಬ್ಯಾಂಕ್ ಲಿಂಕೇಜ್", desc: "ಶೂನ್ಯ ಮೇಲಾಧಾರ ಬ್ಯಾಂಕ್ ಸಾಲಗಳು" },
      { title: "ಕೌಶಲ್ಯ ತರಬೇತಿ", desc: "ಸರ್ಕಾರಿ/NGO ವ್ಯಾಪಾರ ತರಬೇತಿ" },
      { title: "ಸಾಮಾಜಿಕ ಬಂಡವಾಳ", desc: "ಸಾಮೂಹಿಕ ಸಮುದಾಯ ಧ್ವನಿ" },
    ],
    nrlmTitle: "NRLM ಸಬ್ಸಿಡಿ ಪ್ರಯೋಜನಗಳು",
    nrlmDesc: "ನೋಂದಾಯಿತ SHG ಗಳು ಸರ್ಕಾರದಿಂದ ಭಾರಿ ಆರ್ಥಿಕ ಬೆಂಬಲ ಮತ್ತು ಅನುದಾನವನ್ನು ಪಡೆಯುತ್ತವೆ.",
    nrlmPoints: [
      { label: "ರಿವಾಲ್ವಿಂಗ್ ಫಂಡ್", value: "₹10k – ₹15k" },
      { label: "ಕಮ್ಯುನಿಟಿ ಫಂಡ್", value: "₹2.5L ವರೆಗೆ" },
      { label: "ಬಡ್ಡಿ ಸಹಾಯಧನ", value: "ವರ್ಷಕ್ಕೆ 4% – 7%" },
    ],
    stateProgramsTitle: "ಪ್ರಮುಖ ರಾಜ್ಯ ಕಾರ್ಯಕ್ರಮಗಳು",
    statePrograms: [
      { name: "DAY-NRLM", scope: "ರಾಷ್ಟ್ರೀಯ" },
      { name: "Kudumbashree", scope: "ಕೇರಳ" },
      { name: "Jeevika", scope: "ಬಿಹಾರ" },
      { name: "Stree Nidhi", scope: "ತೆಲಂಗಾಣ" },
    ],
    footerTitle: "ನಿಮ್ಮ ರೆಕಾರ್ಡ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ",
    footerDesc: "ಸಭೆಯ ಹಾಜರಾತಿ, ಪಾಸ್‌ಬುಕ್‌ಗಳು ಮತ್ತು ಮರುಪಾವತಿ ಇತಿಹಾಸದ ಮೂಲಕ ಬ್ಯಾಂಕ್‌ಗಳು SHG ವಿಶ್ವಾಸಾರ್ಹತೆಯನ್ನು ನಿರ್ಣಯಿಸುತ್ತವೆ. ದೊಡ್ಡ ಸಾಲಗಳನ್ನು ಪಡೆಯಲು ರೆಕಾರ್ಡ್‌ಗಳು ಅತ್ಯಗತ್ಯ."
  }
};

export const ShgGuide = () => {
  const langCode = (useChatStore((state) => state.profile.preferredLanguage) as string) || 'en';
  const { readAloud, isPlaying } = useReadAloud();
  const t = TRANSLATIONS[langCode] || TRANSLATIONS['en'];

  const getGuideText = () => [
    t.heroTitle, t.heroDesc,
    t.howItWorksTitle,
    ...t.howItWorks.flatMap((step: any) => [step.step, step.title, step.desc]),
    t.benefitsTitle,
    ...t.benefits.flatMap((b: any) => [b.title, b.desc]),
    t.nrlmTitle, t.nrlmDesc,
    ...t.nrlmPoints.flatMap((p: any) => [p.label, p.value]),
    t.stateProgramsTitle,
    ...t.statePrograms.flatMap((p: any) => [p.scope, p.name]),
    t.footerTitle, t.footerDesc
  ].join('. ');

  return (
    <div className="w-full flex flex-col gap-5 animate-fade-in-up pb-8">
      
      {/* READ ALOUD BUTTON */}
      <button
        onClick={() => readAloud(getGuideText(), langCode)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all self-start
          ${isPlaying 
            ? 'bg-pink-100 text-pink-700 border border-pink-200' 
            : 'bg-white text-slate-700 border border-gray-200 hover:border-pink-200 hover:text-pink-600'
          }`}
      >
        {isPlaying ? '⏹ Stop' : '🔊 Read out loud'}
      </button>

      {/* HERO SECTION */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-[#FFF5F8] border border-pink-100 rounded-[2rem] relative overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)]">
        <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-4 relative ">
          <Users size={28} className="text-pink-500" strokeWidth={2} />
        </div>
        <h4 className="text-slate-900 font-bold text-xl mb-2 tracking-tight relative text-center">
          {t.heroTitle}
        </h4>
        <p className="text-slate-600 text-[13px] text-center leading-relaxed max-w-[280px] relative ">
          {t.heroDesc}
        </p>
        <Users size={160} className="absolute -left-8 -bottom-8 text-pink-500/5 pointer-events-none" />
      </div>

      {/* HOW IT WORKS */}
      <div className="p-5 bg-white border border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] rounded-[1.5rem]">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-slate-400" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">
            {t.howItWorksTitle}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {t.howItWorks.map((item: any, i: number) => (
            <div key={i} className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
              <div className="w-6 h-6 rounded-md bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-[11px] mb-2">
                {item.step}
              </div>
              <h5 className="font-semibold text-slate-800 text-[12px] mb-0.5">{item.title}</h5>
              <p className="text-[10px] text-slate-500 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BENEFITS */}
      <div className="p-5 bg-white border border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] rounded-[1.5rem]">
        <div className="flex items-center gap-2 mb-4">
          <HeartHandshake className="text-slate-400" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">
            {t.benefitsTitle}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {t.benefits.map((benefit: any, i: number) => {
            const icons = [Coins, Landmark, TrendingUp, Star];
            const Icon = icons[i];
            return (
              <div key={i} className="flex flex-col gap-2 p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-pink-500" />
                </div>
                <div>
                  <h5 className="font-semibold text-slate-800 text-[12px]">{benefit.title}</h5>
                  <p className="text-[10px] text-slate-500 leading-snug">{benefit.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NRLM SUBSIDIES */}
      <div className="p-5 bg-[#F2FDF7] border border-emerald-100 rounded-[1.5rem] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 mb-3">
          <Sprout className="text-emerald-600" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-emerald-950 tracking-tight">
            {t.nrlmTitle}
          </h4>
        </div>
        <p className="text-[12px] text-emerald-900/80 leading-relaxed mb-4">
          {t.nrlmDesc}
        </p>
        <div className="flex flex-col gap-2">
          {t.nrlmPoints.map((point: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
              <span className="text-[12px] font-semibold text-slate-700">{point.label}</span>
              <span className="text-[13px] font-bold text-emerald-700">{point.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STATE PROGRAMMES */}
      <div className="p-5 bg-white border border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] rounded-[1.5rem]">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="text-slate-400" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">
            {t.stateProgramsTitle}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {t.statePrograms.map((prog: any, i: number) => (
            <div key={i} className="p-3 bg-slate-50 border border-gray-100 rounded-xl flex flex-col justify-between h-full">
              <span className="text-[9px] font-bold text-pink-600 uppercase tracking-wider mb-1 block">
                {prog.scope}
              </span>
              <h5 className="font-semibold text-slate-800 text-[12px] leading-tight">
                {prog.name}
              </h5>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER ALERT */}
      <div className="bg-[#FFF9EA] border border-[#FDE6B0] rounded-[1.25rem] p-4 flex gap-3 shadow-sm">
        <BookOpen className="text-amber-600 shrink-0 mt-0.5" size={20} strokeWidth={2} />
        <div>
          <h5 className="text-[13px] font-bold text-amber-950 mb-0.5">{t.footerTitle}</h5>
          <p className="text-[12px] text-amber-900/80 leading-relaxed">
            {t.footerDesc}
          </p>
        </div>
      </div>

    </div>
  );
};