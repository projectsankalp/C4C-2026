import React from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useReadAloud } from '@/hooks/useReadAloud';
import { 
  TrendingUp, Rocket, ShieldCheck, FileText, Lightbulb, 
  AlertTriangle, Banknote, Globe, Clock, Building2,
  Scale, MonitorSmartphone, CheckCircle2, Briefcase
} from 'lucide-react';

// --------------------------------------------------------
// MULTILINGUAL CONTENT DICTIONARY
// --------------------------------------------------------
const CONTENT: Record<string, any> = {
  en: {
    hero: { title: "DPIIT Recognition", desc: "Official Govt. recognition for innovative, scalable, and tech-driven companies to unlock massive tax and legal benefits." },
    eligibility: {
      title: "Eligibility Criteria",
      items: [
        { title: "Entity Type", desc: "Pvt Ltd, LLP, or Partnership." },
        { title: "Age Limit", desc: "Under 10 years from incorporation." },
        { title: "Turnover", desc: "Below ₹100 Cr annually." },
        { title: "Core Focus", desc: "Innovation & high scalability." }
      ]
    },
    financial: {
      title: "Financial Benefits",
      items: [
        { title: "Tax Holiday", desc: "3-year 100% tax exemption (via IMB)." },
        { title: "Patent Rebate", desc: "80% off & fast-tracked patents." },
        { title: "Capital Gains", desc: "Exemptions under Section 54EE." },
        { title: "Angel Tax", desc: "Exempt from Sec 56(2)(viib)." }
      ]
    },
    operational: {
      title: "Operational Perks",
      items: [
        { title: "Self-Certify", desc: "Bypass labour & env inspections." },
        { title: "Fast Winding", desc: "Close company in 90 days via IBC." },
        { title: "Govt Tenders", desc: "Priority access on GeM portal." },
        { title: "Startup Hub", desc: "Direct access to VCs & mentors." }
      ]
    },
    ffs: {
      title: "Fund of Funds (FFS)",
      desc: "The Govt has a dedicated corpus managed by SIDBI to invest in DPIIT-recognised startups via SEBI-registered Alternative Investment Funds (AIFs).",
      label: "Govt Allocation",
      value: "₹10,000 Crore"
    },
    apply: {
      title: "How to Apply",
      items: [
        { step: '1', title: "Register", desc: "On startupindia.gov.in" },
        { step: '2', title: "Apply", desc: "Fill DPIIT form & innovation details" },
        { step: '3', title: "Upload Docs", desc: "Inc. Certificate, MOA/AOA, etc." },
        { step: '4', title: "Get Issued", desc: "Usually processed in 2-3 days" }
      ]
    },
    alert: { title: "Recognition ≠ Auto Tax Benefits", desc: "DPIIT Recognition is just step one. To actually claim the 3-year tax holiday under Section 80IAC, you must file a separate application to the Inter-Ministerial Board (IMB)." }
  },
  hi: { 
    hero: { title: "DPIIT मान्यता", desc: "नवीन, स्केलेबल और तकनीकी कंपनियों के लिए बड़े कर और कानूनी लाभों को अनलॉक करने के लिए आधिकारिक सरकारी मान्यता।" },
    eligibility: {
      title: "पात्रता मानदंड",
      items: [
        { title: "इकाई प्रकार", desc: "प्राइवेट लिमिटेड, LLP, या साझेदारी।" },
        { title: "आयु सीमा", desc: "निगमन से 10 वर्ष से कम।" },
        { title: "टर्नओवर", desc: "सालाना ₹100 करोड़ से कम।" },
        { title: "मुख्य फोकस", desc: "नवाचार और उच्च स्केलेबिलिटी।" }
      ]
    },
    financial: {
      title: "वित्तीय लाभ",
      items: [
        { title: "टैक्स हॉलिडे", desc: "3 साल की 100% कर छूट (IMB के माध्यम से)।" },
        { title: "पेटेंट छूट", desc: "80% छूट और फास्ट-ट्रैक पेटेंट।" },
        { title: "पूंजीगत लाभ", desc: "धारा 54EE के तहत छूट।" },
        { title: "एंजेल टैक्स", desc: "धारा 56(2)(viib) से छूट।" }
      ]
    },
    operational: {
      title: "परिचालन लाभ",
      items: [
        { title: "स्व-प्रमाणन", desc: "श्रम और पर्यावरण निरीक्षण से बचें।" },
        { title: "फास्ट वाइंडिंग", desc: "IBC के जरिए 90 दिनों में कंपनी बंद करें।" },
        { title: "सरकारी टेंडर", desc: "GeM पोर्टल पर प्राथमिकता।" },
        { title: "स्टार्टअप हब", desc: "वीसी और मेंटर्स तक सीधी पहुंच।" }
      ]
    },
    ffs: {
      title: "फंड ऑफ फंड्स (FFS)",
      desc: "सरकार के पास SIDBI द्वारा प्रबंधित एक समर्पित कोष है जो SEBI-पंजीकृत AIF के माध्यम से DPIIT-मान्यता प्राप्त स्टार्टअप में निवेश करता है।",
      label: "सरकारी आवंटन",
      value: "₹10,000 करोड़"
    },
    apply: {
      title: "आवेदन कैसे करें",
      items: [
        { step: '1', title: "रजिस्टर करें", desc: "startupindia.gov.in पर" },
        { step: '2', title: "आवेदन करें", desc: "DPIIT फॉर्म भरें" },
        { step: '3', title: "दस्तावेज़", desc: "निगमन प्रमाणपत्र, MOA आदि अपलोड करें" },
        { step: '4', title: "प्राप्त करें", desc: "आमतौर पर 2-3 दिनों में जारी होता है" }
      ]
    },
    alert: { title: "मान्यता ≠ स्वचालित कर लाभ", desc: "DPIIT मान्यता केवल पहला कदम है। 80IAC के तहत 3 साल के कर अवकाश का दावा करने के लिए, आपको IMB में अलग से आवेदन करना होगा।" }
  },
  ta: { 
    hero: { title: "DPIIT அங்கீகாரம்", desc: "புதுமையான மற்றும் தொழில்நுட்பம் சார்ந்த நிறுவனங்களுக்கு வரி மற்றும் சட்டப் பலன்களைத் திறக்க அதிகாரப்பூர்வ அரசு அங்கீகாரம்." },
    eligibility: {
      title: "தகுதி வரம்பு",
      items: [
        { title: "நிறுவன வகை", desc: "Pvt Ltd, LLP, அல்லது கூட்டு." },
        { title: "வயது வரம்பு", desc: "தொடங்கப்பட்டதிலிருந்து 10 ஆண்டுகளுக்குள்." },
        { title: "வருவாய்", desc: "ஆண்டுக்கு ₹100 கோடிக்குக் கீழ்." },
        { title: "முக்கிய கவனம்", desc: "புதுமை மற்றும் வளர்ச்சி." }
      ]
    },
    financial: {
      title: "நிதி நன்மைகள்",
      items: [
        { title: "வரி விலக்கு", desc: "3 ஆண்டு 100% வரி விலக்கு." },
        { title: "காப்புரிமை தள்ளுபடி", desc: "80% தள்ளுபடி & விரைவான காப்புரிமை." },
        { title: "மூலதன ஆதாயம்", desc: "பிரிவு 54EE இன் கீழ் விலக்குகள்." },
        { title: "ஏஞ்சல் வரி", desc: "பிரிவு 56(2)(viib) லிருந்து விலக்கு." }
      ]
    },
    operational: {
      title: "செயல்பாட்டு சலுகைகள்",
      items: [
        { title: "சுய சான்றிதழ்", desc: "தொழிலாளர் & சுற்றுச்சூழல் ஆய்வுகளை தவிர்க்கவும்." },
        { title: "விரைவான மூடல்", desc: "90 நாட்களில் நிறுவனத்தை மூடலாம்." },
        { title: "அரசு டெண்டர்கள்", desc: "GeM போர்ட்டலில் முன்னுரிமை." },
        { title: "ஸ்டார்ட்அப் ஹப்", desc: "VC கள் & வழிகாட்டிகளுக்கு நேரடி அணுகல்." }
      ]
    },
    ffs: {
      title: "ஃபண்ட் ஆஃப் ஃபண்ட்ஸ் (FFS)",
      desc: "SEBI பதிவுசெய்த AIFகள் மூலம் DPIIT அங்கீகரிக்கப்பட்ட ஸ்டார்ட்அப்களில் முதலீடு செய்ய SIDBI நிர்வகிக்கும் பிரத்யேக நிதியத்தை அரசாங்கம் கொண்டுள்ளது.",
      label: "அரசு ஒதுக்கீடு",
      value: "₹10,000 கோடி"
    },
    apply: {
      title: "எப்படி விண்ணப்பிப்பது",
      items: [
        { step: '1', title: "பதிவு செய்க", desc: "startupindia.gov.in இல்" },
        { step: '2', title: "விண்ணப்பிக்க", desc: "DPIIT படிவத்தை நிரப்பவும்" },
        { step: '3', title: "ஆவணங்கள்", desc: "சான்றிதழ்களை பதிவேற்றவும்" },
        { step: '4', title: "அங்கீகாரம்", desc: "பொதுவாக 2-3 நாட்களில் வழங்கப்படும்" }
      ]
    },
    alert: { title: "அங்கீகாரம் ≠ தானியங்கி வரி பலன்கள்", desc: "DPIIT அங்கீகாரம் முதல் படி மட்டுமே. வரி விடுமுறையைப் பெற, நீங்கள் IMB க்கு தனியாக விண்ணப்பிக்க வேண்டும்." }
  },
  te: { 
    hero: { title: "DPIIT గుర్తింపు", desc: "పన్ను మరియు చట్టపరమైన ప్రయోజనాలను అన్‌లాక్ చేయడానికి వినూత్న, సాంకేతిక ఆధారిత కంపెనీలకు అధికారిక ప్రభుత్వ గుర్తింపు." },
    eligibility: {
      title: "అర్హత ప్రమాణాలు",
      items: [
        { title: "సంస్థ రకం", desc: "Pvt Ltd, LLP, లేదా భాగస్వామ్యం." },
        { title: "వయో పరిమితి", desc: "స్థాపించినప్పటి నుండి 10 సంవత్సరాలలోపు." },
        { title: "టర్నోవర్", desc: "ఏటా ₹100 కోట్లలోపు." },
        { title: "ప్రధాన దృష్టి", desc: "ఆవిష్కరణ & స్కేలబిలిటీ." }
      ]
    },
    financial: {
      title: "ఆర్థిక ప్రయోజనాలు",
      items: [
        { title: "పన్ను సెలవు", desc: "3 సంవత్సరాల 100% పన్ను మినహాయింపు." },
        { title: "పేటెంట్ రాయితీ", desc: "80% తగ్గింపు & వేగవంతమైన పేటెంట్లు." },
        { title: "మూలధన లాభాలు", desc: "సెక్షన్ 54EE కింద మినహాయింపులు." },
        { title: "ఏంజెల్ ట్యాక్స్", desc: "సెక్షన్ 56(2)(viib) నుండి మినహాయింపు." }
      ]
    },
    operational: {
      title: "కార్యాచరణ ప్రయోజనాలు",
      items: [
        { title: "స్వీయ ధృవీకరణ", desc: "కార్మిక & పర్యావరణ తనిఖీలను దాటవేయండి." },
        { title: "ఫాస్ట్ వైండింగ్", desc: "IBC ద్వారా 90 రోజుల్లో కంపెనీని మూసివేయండి." },
        { title: "ప్రభుత్వ టెండర్లు", desc: "GeM పోర్టల్‌లో ప్రాధాన్యత." },
        { title: "స్టార్టప్ హబ్", desc: "VCలు & మెంటార్లకు ప్రత్యక్ష ప్రాప్యత." }
      ]
    },
    ffs: {
      title: "ఫండ్ ఆఫ్ ఫండ్స్ (FFS)",
      desc: "SEBI-రిజిస్టర్డ్ AIFల ద్వారా DPIIT-గుర్తింపు పొందిన స్టార్టప్‌లలో పెట్టుబడి పెట్టడానికి ప్రభుత్వం SIDBI ద్వారా నిర్వహించబడే ప్రత్యేక నిధిని కలిగి ఉంది.",
      label: "ప్రభుత్వ కేటాయింపు",
      value: "₹10,000 కోట్లు"
    },
    apply: {
      title: "ఎలా దరఖాస్తు చేయాలి",
      items: [
        { step: '1', title: "నమోదు చేయండి", desc: "startupindia.gov.in లో" },
        { step: '2', title: "దరఖాస్తు", desc: "DPIIT ఫారమ్ నింపండి" },
        { step: '3', title: "పత్రాలు", desc: "సర్టిఫికెట్లను అప్‌లోడ్ చేయండి" },
        { step: '4', title: "జారీ పొందండి", desc: "సాధారణంగా 2-3 రోజుల్లో వస్తుంది" }
      ]
    },
    alert: { title: "గుర్తింపు ≠ ఆటోమేటిక్ పన్ను ప్రయోజనాలు", desc: "DPIIT గుర్తింపు మొదటి దశ మాత్రమే. పన్ను మినహాయింపు క్లెయిమ్ చేయడానికి మీరు IMB కి విడిగా దరఖాస్తు చేయాలి." }
  },
  bn: { 
    hero: { title: "DPIIT স্বীকৃতি", desc: "উদ্ভাবনী, প্রযুক্তি-চালিত কোম্পানিগুলির জন্য কর এবং আইনি সুবিধাগুলি আনলক করার জন্য অফিসিয়াল সরকারী স্বীকৃতি।" },
    eligibility: {
      title: "যোগ্যতার মানদণ্ড",
      items: [
        { title: "প্রতিষ্ঠানের ধরন", desc: "প্রাইভেট লিমিটেড, এলএলপি, বা অংশীদারি।" },
        { title: "বয়স সীমা", desc: "অন্তর্ভুক্তির ১০ বছরের নিচে।" },
        { title: "টার্নওভার", desc: "বার্ষিক ১০০ কোটি টাকার নিচে।" },
        { title: "মূল ফোকাস", desc: "উদ্ভাবন এবং পরিমাপযোগ্যতা।" }
      ]
    },
    financial: {
      title: "আর্থিক সুবিধাসমূহ",
      items: [
        { title: "কর অবকাশ", desc: "৩ বছরের ১০০% কর ছাড় (IMB এর মাধ্যমে)।" },
        { title: "পেটেন্ট রিবেট", desc: "৮০% ছাড় এবং দ্রুত পেটেন্ট।" },
        { title: "মূলধন লাভ", desc: "ধারা 54EE এর অধীনে ছাড়।" },
        { title: "অ্যাঞ্জেল ট্যাক্স", desc: "ধারা 56(2)(viib) থেকে অব্যাহতি।" }
      ]
    },
    operational: {
      title: "অপারেশনাল সুবিধা",
      items: [
        { title: "স্ব-প্রত্যয়ন", desc: "শ্রম এবং পরিবেশগত পরিদর্শন এড়িয়ে চলুন।" },
        { title: "দ্রুত কোম্পানি বন্ধ", desc: "IBC এর মাধ্যমে ৯০ দিনে কোম্পানি বন্ধ করুন।" },
        { title: "সরকারী টেন্ডার", desc: "GeM পোর্টালে অগ্রাধিকার।" },
        { title: "স্টার্টআপ হাব", desc: "ভিসি এবং মেন্টরদের সরাসরি অ্যাক্সেস।" }
      ]
    },
    ffs: {
      title: "ফান্ড অফ ফান্ডস (FFS)",
      desc: "SEBI-নিবন্ধিত AIF-এর মাধ্যমে DPIIT-স্বীকৃত স্টার্টআপগুলিতে বিনিয়োগ করার জন্য সরকারের কাছে SIDBI দ্বারা পরিচালিত একটি নিবেদিত তহবিল রয়েছে।",
      label: "সরকারী বরাদ্দ",
      value: "১০,০০০ কোটি টাকা"
    },
    apply: {
      title: "কিভাবে আবেদন করবেন",
      items: [
        { step: '1', title: "নিবন্ধন করুন", desc: "startupindia.gov.in এ" },
        { step: '2', title: "আবেদন করুন", desc: "DPIIT ফর্ম পূরণ করুন" },
        { step: '3', title: "ডকুমেন্ট আপলোড", desc: "সার্টিফিকেট আপলোড করুন" },
        { step: '4', title: "ইস্যু পান", desc: "সাধারণত ২-৩ দিনের মধ্যে প্রক্রিয়া করা হয়" }
      ]
    },
    alert: { title: "স্বীকৃতি ≠ স্বয়ংক্রিয় কর সুবিধা", desc: "DPIIT স্বীকৃতি শুধুমাত্র প্রথম ধাপ। কর অবকাশ দাবি করার জন্য আপনাকে আলাদাভাবে IMB এর কাছে আবেদন করতে হবে।" }
  },
  kan: { 
    hero: { title: "DPIIT ಮಾನ್ಯತೆ", desc: "ತೆರಿಗೆ ಮತ್ತು ಕಾನೂನು ಪ್ರಯೋಜನಗಳನ್ನು ಅನ್‌ಲಾಕ್ ಮಾಡಲು ನವೀನ ಮತ್ತು ತಂತ್ರಜ್ಞಾನ-ಚಾಲಿತ ಕಂಪನಿಗಳಿಗೆ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಮಾನ್ಯತೆ." },
    eligibility: {
      title: "ಅರ್ಹತೆಯ ಮಾನದಂಡ",
      items: [
        { title: "ಸಂಸ್ಥೆಯ ಪ್ರಕಾರ", desc: "Pvt Ltd, LLP, ಅಥವಾ ಪಾಲುದಾರಿಕೆ." },
        { title: "ವಯೋಮಿತಿ", desc: "ಸಂಯೋಜನೆಯಿಂದ 10 ವರ್ಷಗಳ ಒಳಗೆ." },
        { title: "ವಹಿವಾಟು", desc: "ವಾರ್ಷಿಕ ₹100 ಕೋಟಿಗಿಂತ ಕಡಿಮೆ." },
        { title: "ಮುಖ್ಯ ಗಮನ", desc: "ನಾವೀನ್ಯತೆ ಮತ್ತು ಸ್ಕೇಲೆಬಿಲಿಟಿ." }
      ]
    },
    financial: {
      title: "ಹಣಕಾಸಿನ ಪ್ರಯೋಜನಗಳು",
      items: [
        { title: "ತೆರಿಗೆ ರಜೆ", desc: "3 ವರ್ಷದ 100% ತೆರಿಗೆ ವಿನಾಯಿತಿ." },
        { title: "ಪೇಟೆಂಟ್ ರಿಯಾಯಿತಿ", desc: "80% ರಿಯಾಯಿತಿ & ವೇಗದ ಪೇಟೆಂಟ್‌ಗಳು." },
        { title: "ಬಂಡವಾಳ ಲಾಭಗಳು", desc: "ಸೆಕ್ಷನ್ 54EE ಅಡಿಯಲ್ಲಿ ವಿನಾಯಿತಿಗಳು." },
        { title: "ಏಂಜಲ್ ತೆರಿಗೆ", desc: "ಸೆಕ್ಷನ್ 56(2)(viib) ನಿಂದ ವಿನಾಯಿತಿ." }
      ]
    },
    operational: {
      title: "ಕಾರ್ಯಾಚರಣೆಯ ಸವಲತ್ತುಗಳು",
      items: [
        { title: "ಸ್ವಯಂ ಪ್ರಮಾಣೀಕರಣ", desc: "ಕಾರ್ಮಿಕ ಮತ್ತು ಪರಿಸರ ತಪಾಸಣೆಗಳನ್ನು ಬೈಪಾಸ್ ಮಾಡಿ." },
        { title: "ವೇಗದ ಮುಚ್ಚುವಿಕೆ", desc: "IBC ಮೂಲಕ 90 ದಿನಗಳಲ್ಲಿ ಕಂಪನಿಯನ್ನು ಮುಚ್ಚಿ." },
        { title: "ಸರ್ಕಾರಿ ಟೆಂಡರ್‌ಗಳು", desc: "GeM ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಆದ್ಯತೆಯ ಪ್ರವೇಶ." },
        { title: "ಸ್ಟಾರ್ಟ್ಅಪ್ ಹಬ್", desc: "ವಿಸಿಗಳು ಮತ್ತು ಮಾರ್ಗದರ್ಶಕರಿಗೆ ನೇರ ಪ್ರವೇಶ." }
      ]
    },
    ffs: {
      title: "ಫಂಡ್ ಆಫ್ ಫಂಡ್ಸ್ (FFS)",
      desc: "SEBI-ನೋಂದಾಯಿತ AIFಗಳ ಮೂಲಕ DPIIT-ಮಾನ್ಯತೆ ಪಡೆದ ಸ್ಟಾರ್ಟ್‌ಅಪ್‌ಗಳಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡಲು ಸರ್ಕಾರವು SIDBI ನಿರ್ವಹಿಸುವ ಮೀಸಲಾದ ಕಾರ್ಪಸ್ ಅನ್ನು ಹೊಂದಿದೆ.",
      label: "ಸರ್ಕಾರಿ ಹಂಚಿಕೆ",
      value: "₹10,000 ಕೋಟಿ"
    },
    apply: {
      title: "ಹೇಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬೇಕು",
      items: [
        { step: '1', title: "ನೋಂದಾಯಿಸಿ", desc: "startupindia.gov.in ನಲ್ಲಿ" },
        { step: '2', title: "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ", desc: "DPIIT ಫಾರ್ಮ್ ಭರ್ತಿ ಮಾಡಿ" },
        { step: '3', title: "ದಾಖಲೆಗಳು", desc: "ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ" },
        { step: '4', title: "ಪಡೆಯಿರಿ", desc: "ಸಾಮಾನ್ಯವಾಗಿ 2-3 ದಿನಗಳಲ್ಲಿ" }
      ]
    },
    alert: { title: "ಮಾನ್ಯತೆ ≠ ಸ್ವಯಂಚಾಲಿತ ತೆರಿಗೆ ಪ್ರಯೋಜನಗಳು", desc: "DPIIT ಮಾನ್ಯತೆ ಕೇವಲ ಮೊದಲ ಹಂತವಾಗಿದೆ. ತೆರಿಗೆ ರಜೆಯನ್ನು ಪಡೆಯಲು ನೀವು IMB ಗೆ ಪ್ರತ್ಯೇಕವಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಬೇಕು." }
  }
};

const ELIGIBILITY_ICONS = [Building2, Clock, TrendingUp, Lightbulb];
const FINANCIAL_ICONS = [ShieldCheck, FileText, TrendingUp, Briefcase];
const OPERATIONAL_ICONS = [FileText, Clock, Scale, Globe];

export const StartupIndiaGuide = () => {
  const langCode = (useChatStore((state) => state.profile.preferredLanguage) as string) || 'en';
  const { readAloud, isPlaying } = useReadAloud();
  const t = CONTENT[langCode] || CONTENT['en'];

  const getGuideText = () => [
    t.hero.title, t.hero.desc,
    t.eligibility.title,
    ...t.eligibility.items.flatMap((i: any) => [i.title, i.desc]),
    t.financial.title,
    ...t.financial.items.flatMap((i: any) => [i.title, i.desc]),
    t.operational.title,
    ...t.operational.items.flatMap((i: any) => [i.title, i.desc]),
    t.ffs.title, t.ffs.desc, t.ffs.label, t.ffs.value,
    t.apply.title,
    ...t.apply.items.flatMap((i: any) => [i.step, i.title, i.desc]),
    t.alert.title, t.alert.desc
  ].join('. ');

  return (
    <div className="w-full flex flex-col gap-5 animate-fade-in-up pb-8">
      
      {/* READ ALOUD BUTTON */}
      <button
        onClick={() => readAloud(getGuideText(), langCode)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all self-start
          ${isPlaying 
            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
            : 'bg-white text-slate-700 border border-gray-200 hover:border-indigo-200 hover:text-indigo-600'
          }`}
      >
        {isPlaying ? '⏹ Stop' : '🔊 Read out loud'}
      </button>

      {/* HERO SECTION */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-[#F5F3FF] border border-indigo-100 rounded-[2rem] relative overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)]">
        <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-4 relative ">
          <Rocket size={28} className="text-indigo-600" strokeWidth={2} />
        </div>
        <h4 className="text-slate-900 font-bold text-xl mb-2 tracking-tight relative text-center">
          {t.hero.title}
        </h4>
        <p className="text-slate-600 text-[13px] text-center leading-relaxed max-w-[280px] relative ">
          {t.hero.desc}
        </p>
        <TrendingUp size={160} className="absolute -left-8 -bottom-8 text-indigo-500/5 pointer-events-none" />
      </div>

      {/* ELIGIBILITY (Visual 2x2 Grid) */}
      <div className="p-5 bg-white border border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] rounded-[1.5rem]">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="text-slate-400" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">
            {t.eligibility.title}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {t.eligibility.items.map((item: any, i: number) => {
            const Icon = ELIGIBILITY_ICONS[i];
            return (
              <div key={i} className="p-3 bg-slate-50 border border-gray-100 rounded-xl flex flex-col">
                <Icon size={16} className="text-indigo-500 mb-2" strokeWidth={2} />
                <h5 className="font-semibold text-slate-800 text-[12px] mb-0.5">{item.title}</h5>
                <p className="text-[10px] text-slate-500 leading-snug">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FINANCIAL BENEFITS (2x2 Grid) */}
      <div className="p-5 bg-white border border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] rounded-[1.5rem]">
        <div className="flex items-center gap-2 mb-4">
          <Banknote className="text-slate-400" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">
            {t.financial.title}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {t.financial.items.map((benefit: any, i: number) => {
            const Icon = FINANCIAL_ICONS[i];
            return (
              <div key={i} className="flex flex-col gap-2 p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-emerald-600" />
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

      {/* OPERATIONAL BENEFITS (2x2 Grid) */}
      <div className="p-5 bg-white border border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] rounded-[1.5rem]">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="text-slate-400" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">
            {t.operational.title}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {t.operational.items.map((benefit: any, i: number) => {
            const Icon = OPERATIONAL_ICONS[i];
            return (
              <div key={i} className="flex flex-col gap-2 p-3 bg-slate-50 border border-gray-100 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-blue-600" />
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

      {/* FUND OF FUNDS (Stylized Data Card) */}
      <div className="p-5 bg-[#F8F5FF] border border-purple-100 rounded-[1.5rem] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 mb-3">
          <Banknote className="text-purple-600" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-purple-950 tracking-tight">
            {t.ffs.title}
          </h4>
        </div>
        <p className="text-[12px] text-purple-900/80 leading-relaxed mb-4">
          {t.ffs.desc}
        </p>
        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-purple-100 shadow-sm">
          <span className="text-[12px] font-semibold text-slate-700">{t.ffs.label}</span>
          <span className="text-[14px] font-black text-purple-700">{t.ffs.value}</span>
        </div>
      </div>

      {/* HOW TO APPLY (Visual Steps) */}
      <div className="p-5 bg-white border border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] rounded-[1.5rem]">
        <div className="flex items-center gap-2 mb-4">
          <MonitorSmartphone className="text-slate-400" size={18} strokeWidth={2} />
          <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">
            {t.apply.title}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {t.apply.items.map((item: any, i: number) => (
            <div key={i} className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
              <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[11px] mb-2">
                {item.step}
              </div>
              <h5 className="font-semibold text-slate-800 text-[12px] mb-0.5">{item.title}</h5>
              <p className="text-[10px] text-slate-500 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER ALERT */}
      <div className="bg-[#FFF9EA] border border-[#FDE6B0] rounded-[1.25rem] p-4 flex gap-3 shadow-sm">
        <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} strokeWidth={2} />
        <div>
          <h5 className="text-[13px] font-bold text-amber-950 mb-0.5">{t.alert.title}</h5>
          <p className="text-[12px] text-amber-900/80 leading-relaxed">
            {t.alert.desc}
          </p>
        </div>
      </div>

    </div>
  );
};

