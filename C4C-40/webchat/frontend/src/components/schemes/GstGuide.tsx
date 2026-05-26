import React from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useReadAloud } from '@/hooks/useReadAloud';
import { 
  BadgePercent, 
  ShoppingCart, 
  Truck, 
  AlertTriangle, 
  Building2, 
  Receipt, 
  Globe, 
  Clock, 
  Banknote, 
  ArrowRight
} from 'lucide-react';

// --------------------------------------------------------
// MULTILINGUAL DICTIONARY FOR GST GUIDE
// --------------------------------------------------------
const CONTENT: Record<string, any> = {
  en: {
    title: "Goods & Services Tax",
    subtitle: "The unified, destination-based tax system replacing 17+ central and state taxes across India.",
    slabsTitle: "Standard Rate Slabs",
    slabs: [
      { rate: '0%', label: 'Essentials', desc: 'Milk, fresh veg, salt' },
      { rate: '5%', label: 'Basic Goods', desc: 'Sugar, tea, medicines' },
      { rate: '12%', label: 'Processed', desc: 'Computers, packed food' },
      { rate: '18%', label: 'Services', desc: 'Electronics, most services' },
    ],
    luxuryDesc: "Luxury cars, tobacco, aerated drinks",
    triggersTitle: "Mandatory Triggers",
    triggers: [
      { title: "Turnover Limit", desc: "> ₹40L Goods / > ₹20L Services" },
      { title: "Inter-state", desc: "Selling across state lines (from ₹1)" },
      { title: "E-commerce", desc: "Selling via Amazon, Flipkart, etc." },
      { title: "Import/Export", desc: "Required regardless of turnover" },
    ],
    itcTitle: "Input Tax Credit (ITC)",
    itcDesc: "Deduct the GST paid on business purchases from the GST collected on sales.",
    collected: "Collected",
    paid: "Paid",
    youOwe: "You Owe",
    calendarTitle: "Monthly Deadlines",
    sales: "GSTR-1 (Sales)",
    salesDate: "11th of next month",
    payment: "GSTR-3B (Payment)",
    paymentDate: "20th of next month",
    penaltyTitle: "Non-Compliance",
    penaltyDesc: "Late fees are ₹50/day. Unpaid tax accrues 18% p.a. interest. Failure to register when required incurs a penalty of 10% of tax due (min ₹10k)."
  },
  hi: {
    title: "वस्तु एवं सेवा कर (GST)",
    subtitle: "भारत भर में 17+ केंद्रीय और राज्य करों की जगह लेने वाली एकीकृत कर प्रणाली।",
    slabsTitle: "मानक दर स्लैब",
    slabs: [
      { rate: '0%', label: 'आवश्यक वस्तुएं', desc: 'दूध, ताजी सब्जियां, नमक' },
      { rate: '5%', label: 'बुनियादी सामान', desc: 'चीनी, चाय, दवाएं' },
      { rate: '12%', label: 'संसाधित', desc: 'कंप्यूटर, पैक्ड फूड' },
      { rate: '18%', label: 'सेवाएं', desc: 'इलेक्ट्रॉनिक्स, अधिकांश सेवाएं' },
    ],
    luxuryDesc: "लक्जरी कारें, तंबाकू, वातित पेय",
    triggersTitle: "अनिवार्य शर्तें",
    triggers: [
      { title: "टर्नओवर सीमा", desc: "> ₹40L माल / > ₹20L सेवाएं" },
      { title: "अंतर-राज्य", desc: "राज्य की सीमाओं के पार बिक्री (₹1 से)" },
      { title: "ई-कॉमर्स", desc: "अमेज़ॅन, फ्लिपकार्ट आदि के माध्यम से बिक्री।" },
      { title: "आयात/निर्यात", desc: "टर्नओवर की परवाह किए बिना आवश्यक" },
    ],
    itcTitle: "इनपुट टैक्स क्रेडिट (ITC)",
    itcDesc: "बिक्री पर एकत्र किए गए GST से व्यावसायिक खरीदारी पर भुगतान किए गए GST की कटौती करें।",
    collected: "एकत्रित",
    paid: "भुगतान किया",
    youOwe: "आपको देना है",
    calendarTitle: "मासिक समय सीमा",
    sales: "GSTR-1 (बिक्री)",
    salesDate: "अगले महीने की 11 तारीख",
    payment: "GSTR-3B (भुगतान)",
    paymentDate: "अगले महीने की 20 तारीख",
    penaltyTitle: "अनुपालन न करना",
    penaltyDesc: "विलंब शुल्क ₹50/दिन है। unpaid टैक्स पर 18% p.a. ब्याज लगता है। पंजीकरण न करने पर 10% जुर्माना (न्यूनतम ₹10k) लगता है।"
  },
  ta: {
    title: "பொருட்கள் மற்றும் சேவை வரி (GST)",
    subtitle: "இந்தியா முழுவதும் 17+ வரிகளை மாற்றும் ஒருங்கிணைந்த வரி முறை.",
    slabsTitle: "நிலையான வரி விகிதங்கள்",
    slabs: [
      { rate: '0%', label: 'அத்தியாவசியங்கள்', desc: 'பால், காய்கறிகள், உப்பு' },
      { rate: '5%', label: 'அடிப்படைப் பொருட்கள்', desc: 'சர்க்கரை, தேநீர், மருந்துகள்' },
      { rate: '12%', label: 'பதப்படுத்தப்பட்டவை', desc: 'கணினிகள், பேக் செய்யப்பட்ட உணவு' },
      { rate: '18%', label: 'சேவைகள்', desc: 'எலக்ட்ரானிக்ஸ், சேவைகள்' },
    ],
    luxuryDesc: "சொகுசு கார்கள், புகையிலை, குளிர்பானங்கள்",
    triggersTitle: "கட்டாய நிபந்தனைகள்",
    triggers: [
      { title: "விற்றுமுதல் வரம்பு", desc: "> ₹40L பொருட்கள் / > ₹20L சேவைகள்" },
      { title: "மாநிலங்களுக்கு இடையே", desc: "மாநிலம் விட்டு மாநிலம் விற்பனை" },
      { title: "இ-காமர்ஸ்", desc: "Amazon, Flipkart மூலம் விற்பனை" },
      { title: "இறக்குமதி/ஏற்றுமதி", desc: "விற்றுமுதல் பொருட்படுத்தாமல் தேவை" },
    ],
    itcTitle: "உள்ளீட்டு வரி வரவு (ITC)",
    itcDesc: "வணிக கொள்முதல் மீது செலுத்திய GST-ஐ, விற்பனையில் வசூலிக்கப்பட்ட GST-யில் கழிக்கவும்.",
    collected: "வசூலிக்கப்பட்டது",
    paid: "செலுத்தப்பட்டது",
    youOwe: "நீங்கள் செலுத்த வேண்டியது",
    calendarTitle: "மாதாந்திர காலக்கெடு",
    sales: "GSTR-1 (விற்பனை)",
    salesDate: "அடுத்த மாதம் 11ம் தேதி",
    payment: "GSTR-3B (பணம் செலுத்துதல்)",
    paymentDate: "அடுத்த மாதம் 20ம் தேதி",
    penaltyTitle: "இணக்கமின்மை",
    penaltyDesc: "தாமதக் கட்டணம் ₹50/நாள். செலுத்தப்படாத வரிக்கு 18% வட்டி. பதிவு செய்யத் தவறினால் 10% அபராதம் (குறைந்தபட்சம் ₹10k)."
  },
  te: {
    title: "వస్తువులు మరియు సేవల పన్ను (GST)",
    subtitle: "భారతదేశం అంతటా 17+ పన్నులను భర్తీ చేసే ఏకీకృత పన్ను విధానం.",
    slabsTitle: "ప్రామాణిక రేటు స్లాబ్‌లు",
    slabs: [
      { rate: '0%', label: 'నిత్యావసరాలు', desc: 'పాలు, కూరగాయలు, ఉప్పు' },
      { rate: '5%', label: 'ప్రాథమిక వస్తువులు', desc: 'చక్కెర, టీ, మందులు' },
      { rate: '12%', label: 'ప్రాసెస్ చేయబడినవి', desc: 'కంప్యూటర్లు, ప్యాక్ చేసిన ఆహారం' },
      { rate: '18%', label: 'సేవలు', desc: 'ఎలక్ట్రానిక్స్, సేవలు' },
    ],
    luxuryDesc: "లగ్జరీ కార్లు, పొగాకు, శీతల పానీయాలు",
    triggersTitle: "తప్పనిసరి షరతులు",
    triggers: [
      { title: "టర్నోవర్ పరిమితి", desc: "> ₹40L వస్తువులు / > ₹20L సేవలు" },
      { title: "అంతర్-రాష్ట్ర", desc: "రాష్ట్రాల మధ్య విక్రయాలు (₹1 నుండి)" },
      { title: "ఇ-కామర్స్", desc: "Amazon, Flipkart ద్వారా విక్రయాలు" },
      { title: "దిగుమతి/ఎగుమతి", desc: "టర్నోవర్‌తో సంబంధం లేకుండా అవసరం" },
    ],
    itcTitle: "ఇన్‌పుట్ టాక్స్ క్రెడిట్ (ITC)",
    itcDesc: "వ్యాపార కొనుగోళ్లపై చెల్లించిన GSTని, అమ్మకాలపై వసూలు చేసిన GST నుండి తగ్గించండి.",
    collected: "సేకరించబడింది",
    paid: "చెల్లించబడింది",
    youOwe: "మీరు చెల్లించాల్సింది",
    calendarTitle: "నెలవారీ గడువులు",
    sales: "GSTR-1 (విక్రయాలు)",
    salesDate: "వచ్చే నెల 11వ తేదీ",
    payment: "GSTR-3B (చెల్లింపు)",
    paymentDate: "వచ్చే నెల 20వ తేదీ",
    penaltyTitle: "నిబంధనలు ఉల్లంఘిస్తే",
    penaltyDesc: "ఆలస్య రుసుము ₹50/రోజు. చెల్లించని పన్నుకు 18% వడ్డీ. నమోదు చేయడంలో విఫలమైతే 10% జరిమానా (కనీసం ₹10k)."
  },
  bn: {
    title: "পণ্য ও পরিষেবা কর (GST)",
    subtitle: "সারা ভারতে ১৭+ কর প্রতিস্থাপনকারী একীভূত কর ব্যবস্থা।",
    slabsTitle: "স্ট্যান্ডার্ড রেট স্ল্যাব",
    slabs: [
      { rate: '0%', label: 'অপরিহার্য', desc: 'দুধ, সবজি, লবণ' },
      { rate: '5%', label: 'মৌলিক পণ্য', desc: 'চিনি, চা, ওষুধ' },
      { rate: '12%', label: 'প্রক্রিয়াজাত', desc: 'কম্পিউটার, প্যাকেটজাত খাবার' },
      { rate: '18%', label: 'পরিষেবা', desc: 'ইলেকট্রনিক্স, বেশিরভাগ পরিষেবা' },
    ],
    luxuryDesc: "বিলাসবহুল গাড়ি, তামাক, কোমল পানীয়",
    triggersTitle: "বাধ্যতামূলক শর্তাবলী",
    triggers: [
      { title: "টার্নওভার সীমা", desc: "> ₹40L পণ্য / > ₹20L পরিষেবা" },
      { title: "আন্তঃরাজ্য", desc: "রাজ্যের সীমানা জুড়ে বিক্রি (₹1 থেকে)" },
      { title: "ই-কমার্স", desc: "Amazon, Flipkart এর মাধ্যমে বিক্রি" },
      { title: "আমদানি/রপ্তানি", desc: "টার্নওভার নির্বিশেষে প্রয়োজন" },
    ],
    itcTitle: "ইনপুট ট্যাক্স ক্রেডিট (ITC)",
    itcDesc: "ব্যবসায়িক ক্রয়ে প্রদত্ত GST, বিক্রয়ে সংগৃহীত GST থেকে কাটুন।",
    collected: "সংগৃহীত",
    paid: "প্রদত্ত",
    youOwe: "আপনার বকেয়া",
    calendarTitle: "মাসিক সময়সীমা",
    sales: "GSTR-1 (বিক্রয়)",
    salesDate: "পরের মাসের ১১ তারিখ",
    payment: "GSTR-3B (পেমেন্ট)",
    paymentDate: "পরের মাসের ২০ তারিখ",
    penaltyTitle: "অসম্মতি",
    penaltyDesc: "বিলম্ব ফি ₹50/দিন। অপরিশোধিত করের উপর 18% সুদ। নিবন্ধন না করলে 10% জরিমানা (ন্যূনতম ₹10k)।"
  },
  kan: {
    title: "ಸರಕು ಮತ್ತು ಸೇವಾ ತೆರಿಗೆ (GST)",
    subtitle: "ಭಾರತದಾದ್ಯಂತ 17+ ತೆರಿಗೆಗಳನ್ನು ಬದಲಿಸುವ ಏಕೀಕೃತ ತೆರಿಗೆ ವ್ಯವಸ್ಥೆ.",
    slabsTitle: "ಸ್ಟ್ಯಾಂಡರ್ಡ್ ದರ ಸ್ಲ್ಯಾಬ್‌ಗಳು",
    slabs: [
      { rate: '0%', label: 'ಅಗತ್ಯ ವಸ್ತುಗಳು', desc: 'ಹಾಲು, ತರಕಾರಿಗಳು, ಉಪ್ಪು' },
      { rate: '5%', label: 'ಮೂಲ ವಸ್ತುಗಳು', desc: 'ಸಕ್ಕರೆ, ಚಹಾ, ಔಷಧಗಳು' },
      { rate: '12%', label: 'ಸಂಸ್ಕರಿಸಿದ', desc: 'ಕಂಪ್ಯೂಟರ್, ಪ್ಯಾಕ್ ಮಾಡಿದ ಆಹಾರ' },
      { rate: '18%', label: 'ಸೇವೆಗಳು', desc: 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್, ಸೇವೆಗಳು' },
    ],
    luxuryDesc: "ಐಷಾರಾಮಿ ಕಾರುಗಳು, ತಂಬಾಕು, ತಂಪು ಪಾನೀಯಗಳು",
    triggersTitle: "ಕಡ್ಡಾಯ ಷರತ್ತುಗಳು",
    triggers: [
      { title: "ವಹಿವಾಟು ಮಿತಿ", desc: "> ₹40L ಸರಕುಗಳು / > ₹20L ಸೇವೆಗಳು" },
      { title: "ಅಂತರ-ರಾಜ್ಯ", desc: "ರಾಜ್ಯದ ಗಡಿಗಳಲ್ಲಿ ಮಾರಾಟ (₹1 ರಿಂದ)" },
      { title: "ಇ-ಕಾಮರ್ಸ್", desc: "Amazon, Flipkart ಮೂಲಕ ಮಾರಾಟ" },
      { title: "ಆಮದು/ರಫ್ತು", desc: "ವಹಿವಾಟು ಲೆಕ್ಕಿಸದೆ ಅಗತ್ಯವಿದೆ" },
    ],
    itcTitle: "ಇನ್ಪುಟ್ ಟ್ಯಾಕ್ಸ್ ಕ್ರೆಡಿಟ್ (ITC)",
    itcDesc: "ವ್ಯಾಪಾರ ಖರೀದಿಗಳ ಮೇಲೆ ಪಾವತಿಸಿದ GST ಯನ್ನು ಮಾರಾಟದ ಮೇಲೆ ಸಂಗ್ರಹಿಸಿದ GST ಯಿಂದ ಕಡಿತಗೊಳಿಸಿ.",
    collected: "ಸಂಗ್ರಹಿಸಲಾಗಿದೆ",
    paid: "ಪಾವತಿಸಲಾಗಿದೆ",
    youOwe: "ನೀವು ಪಾವತಿಸಬೇಕು",
    calendarTitle: "ಮಾಸಿಕ ಗಡುವುಗಳು",
    sales: "GSTR-1 (ಮಾರಾಟ)",
    salesDate: "ಮುಂದಿನ ತಿಂಗಳ 11 ನೇ ತಾರೀಖು",
    payment: "GSTR-3B (ಪಾವತಿ)",
    paymentDate: "ಮುಂದಿನ ತಿಂಗಳ 20 ನೇ ತಾರೀಖು",
    penaltyTitle: "ಅನುಸರಣೆ ವಿಫಲವಾದರೆ",
    penaltyDesc: "ವಿಳಂಬ ಶುಲ್ಕ ₹50/ದಿನ. ಪಾವತಿಸದ ತೆರಿಗೆಗೆ 18% ಬಡ್ಡಿ. ನೋಂದಾಯಿಸಲು ವಿಫಲವಾದರೆ 10% ದಂಡ (ಕನಿಷ್ಠ ₹10k)."
  }
};

export const GstGuide = () => {
  const langCode = (useChatStore((state) => state.profile.preferredLanguage) as string) || 'en';
  const { readAloud, isPlaying } = useReadAloud();
  const content = CONTENT[langCode] || CONTENT['en'];

  const getGuideText = () => [
    content.title, content.subtitle,
    content.slabsTitle,
    ...content.slabs.flatMap((s: any) => [s.rate, s.label, s.desc]),
    '28% + Cess', content.luxuryDesc,
    content.triggersTitle,
    ...content.triggers.flatMap((t: any) => [t.title, t.desc]),
    content.itcTitle, content.itcDesc,
    content.collected, '₹30k', content.paid, '₹18k', content.youOwe, '₹12k',
    content.calendarTitle,
    content.sales, content.salesDate,
    content.payment, content.paymentDate,
    content.penaltyTitle, content.penaltyDesc
  ].join('. ');

  const slabStyles = [
    { bg: 'bg-[#F8FAFC]', border: 'border-slate-200', text: 'text-slate-700' },
    { bg: 'bg-[#F4F8FF]', border: 'border-blue-100', text: 'text-blue-700' },
    { bg: 'bg-[#FFF9EA]', border: 'border-amber-200', text: 'text-amber-700' },
    { bg: 'bg-[#FFF4ED]', border: 'border-orange-200', text: 'text-orange-700' },
  ];

  const triggerIcons = [Building2, Truck, ShoppingCart, Globe];

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
          <BadgePercent size={28} className="text-blue-600" strokeWidth={2} />
        </div>
        <h4 className="text-slate-900 font-bold text-xl mb-2 tracking-tight relative text-center">
          {content.title}
        </h4>
        <p className="text-slate-600 text-[13px] text-center leading-relaxed max-w-[280px] relative ">
          {content.subtitle}
        </p>
        <BadgePercent size={160} className="absolute -right-8 -bottom-8 text-blue-500/5 pointer-events-none" />
      </div>

      {/* GST RATE SLABS (Visual Badge Grid) */}
      <div className="p-5 bg-white border border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] rounded-[1.5rem]">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="text-slate-400" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">
            {content.slabsTitle}
          </h4>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          {content.slabs.map((item: any, i: number) => (
            <div key={i} className={`p-3 ${slabStyles[i].bg} border ${slabStyles[i].border} rounded-xl relative overflow-hidden transition-all hover:shadow-sm`}>
              <div className="flex justify-between items-start mb-1">
                <span className={`text-[20px] font-black ${slabStyles[i].text} leading-none`}>{item.rate}</span>
              </div>
              <h5 className={`font-semibold text-[11px] ${slabStyles[i].text} mb-0.5`}>{item.label}</h5>
              <p className={`text-[10px] ${slabStyles[i].text} opacity-80 leading-snug`}>{item.desc}</p>
            </div>
          ))}
        </div>
        
        {/* Luxury / 28% Slab */}
        <div className="p-3 bg-[#FFF5F5] border border-red-100 rounded-xl flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1 mb-0.5">
              <span className="text-[20px] font-black text-red-700 leading-none">28%</span>
              <span className="text-[11px] font-bold text-red-700/80 uppercase tracking-wider">+ Cess</span>
            </div>
            <p className="text-[10px] text-red-700/80 leading-snug">{content.luxuryDesc}</p>
          </div>
        </div>
      </div>

      {/* WHEN IS IT MANDATORY (Visual 2x2 Grid) */}
      <div className="p-5 bg-white border border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] rounded-[1.5rem]">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-slate-400" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">
            {content.triggersTitle}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {content.triggers.map((item: any, i: number) => {
            const Icon = triggerIcons[i];
            return (
              <div key={i} className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 mb-2">
                  <Icon size={16} className="text-slate-600" />
                </div>
                <h5 className="font-semibold text-slate-800 text-[12px] mb-0.5">{item.title}</h5>
                <p className="text-[10px] text-slate-500 leading-snug">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ITC EXPLANATION (Stylized Data Card) */}
      <div className="p-5 bg-[#F2FDF7] border border-emerald-100 rounded-[1.5rem] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 mb-3">
          <Banknote className="text-emerald-600" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-emerald-950 tracking-tight">
            {content.itcTitle}
          </h4>
        </div>
        <p className="text-[12px] text-emerald-900/80 leading-relaxed mb-4">
          {content.itcDesc}
        </p>
        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
          <div className="text-center">
            <span className="block text-[10px] text-slate-500 uppercase font-semibold mb-0.5">{content.collected}</span>
            <span className="text-[13px] font-bold text-slate-800">₹30k</span>
          </div>
          <ArrowRight size={14} className="text-emerald-300" />
          <div className="text-center">
            <span className="block text-[10px] text-slate-500 uppercase font-semibold mb-0.5">{content.paid}</span>
            <span className="text-[13px] font-bold text-slate-800">₹18k</span>
          </div>
          <ArrowRight size={14} className="text-emerald-300" />
          <div className="text-center bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
            <span className="block text-[10px] text-emerald-700 uppercase font-semibold mb-0.5">{content.youOwe}</span>
            <span className="text-[13px] font-black text-emerald-800">₹12k</span>
          </div>
        </div>
      </div>

      {/* FILING CALENDAR & PENALTIES (Stacked Alerts) */}
      <div className="flex flex-col gap-3">
        {/* Simplified Calendar */}
        <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-[1.25rem]">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="text-slate-400" size={16} strokeWidth={2} />
            <h4 className="text-[13px] font-bold text-slate-900 tracking-tight">
              {content.calendarTitle}
            </h4>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-[12px] font-semibold text-slate-700">{content.sales}</span>
              <span className="text-[11px] font-medium text-slate-500">{content.salesDate}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-[12px] font-semibold text-slate-700">{content.payment}</span>
              <span className="text-[11px] font-medium text-slate-500">{content.paymentDate}</span>
            </div>
          </div>
        </div>

        {/* Penalties Alert */}
        <div className="bg-[#FFF5F5] border border-red-100 rounded-[1.25rem] p-4 flex gap-3 shadow-sm">
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} strokeWidth={2} />
          <div>
            <h5 className="text-[13px] font-bold text-red-950 mb-0.5">{content.penaltyTitle}</h5>
            <p className="text-[12px] text-red-900/80 leading-relaxed">
              {content.penaltyDesc}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};