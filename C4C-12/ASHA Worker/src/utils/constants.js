/**
 * GraamSehat ASHA Worker App - Constants and Configuration
 * Path: /src/utils/constants.js
 * Contains translation-agnostic constants, medicine lists, Karnataka districts,
 * and structured advice text templates for the five support languages.
 */

// Districts of Karnataka (representative list for the dropdown)
export const KARNATAKA_DISTRICTS = [
  "Bagalkot",
  "Ballari (Bellary)",
  "Belagavi (Belgaum)",
  "Bengaluru Rural",
  "Bengaluru Urban",
  "Bidar",
  "Chamarajanagar",
  "Chikkaballapur",
  "Chikkamagaluru (Chikmagalur)",
  "Chitradurga",
  "Dakshina Kannada",
  "Davanagere",
  "Dharwad",
  "Gadag",
  "Hassan",
  "Haveri",
  "Kalaburagi (Gulbarga)",
  "Kodagu (Coorg)",
  "Kolar",
  "Koppal",
  "Mandya",
  "Mysuru (Mysore)",
  "Raichur",
  "Ramanagara",
  "Shivamogga (Shimoga)",
  "Tumakuru (Tumkur)",
  "Udupi",
  "Uttara Kannada (Karwar)",
  "Vijayapura (Bijapur)",
  "Yadgir"
];

// Medicine list with metadata (dose, default quantity, standard restock interval, localDB name)
export const MEDICINES_LIST = [
  { id: "metformin", name: "Metformin 500mg", defaultDose: "1 tablet twice daily", defaultQty: 60, nextDueDays: 30 },
  { id: "amlodipine", name: "Amlodipine 5mg", defaultDose: "1 tablet once daily", defaultQty: 30, nextDueDays: 30 },
  { id: "atenolol", name: "Atenolol 50mg", defaultDose: "1 tablet once daily", defaultQty: 30, nextDueDays: 30 },
  { id: "ors", name: "ORS Sachet", defaultDose: "1 sachet in 1L water as needed", defaultQty: 5, nextDueDays: 0 }, // as needed
  { id: "iron", name: "Iron Tablets", defaultDose: "1 tablet daily after meal", defaultQty: 30, nextDueDays: 30 },
  { id: "folic_acid", name: "Folic Acid", defaultDose: "1 tablet daily", defaultQty: 30, nextDueDays: 30 }
];

// Advice texts per risk level per language
export const RISK_ADVICE = {
  GREEN: {
    en: {
      title: "LOW RISK",
      explanation: "The patient currently shows low risk markers for diabetes and high blood pressure.",
      actions: [
        "Continue active lifestyle (at least 30 minutes of walking/farming daily).",
        "Eat healthy foods - add more vegetables, whole grains, and reduce white rice.",
        "Avoid adding extra salt to cooked food and limit fried snacks.",
        "Avoid tobacco and alcohol consumption.",
        "Inform ASHA worker if any new symptoms arise."
      ],
      nextCheckup: "Re-screen in 1 year",
      phcNeeded: false,
      phcText: "Routine follow-up"
    },
    kn: {
      title: "ಕಡಿಮೆ ಅಪಾಯ",
      explanation: "ರೋಗಿಯು ಸದ್ಯಕ್ಕೆ ಮಧುಮೇಹ ಮತ್ತು ರಕ್ತದೊತ್ತಡದ ಕಡಿಮೆ ಅಪಾಯದ ಲಕ್ಷಣಗಳನ್ನು ಹೊಂದಿದ್ದಾರೆ.",
      actions: [
        "ಸಕ್ರಿಯ ಜೀವನಶೈಲಿಯನ್ನು ಮುಂದುವರಿಸಿ (ದಿನಕ್ಕೆ ಕನಿಷ್ಠ 30 ನಿಮಿಷ ನಡಿಗೆ/ಕೃಷಿ ಕೆಲಸ).",
        "ಆರೋಗ್ಯಕರ ಆಹಾರ ಸೇವಿಸಿ - ತರಕಾರಿಗಳು, ಧಾನ್ಯಗಳನ್ನು ಹೆಚ್ಚಿಸಿ, ಬಿಳಿ ಅನ್ನ ಕಡಿಮೆ ಮಾಡಿ.",
        "ಅಡುಗೆಗೆ ಹೆಚ್ಚುವರಿ ಉಪ್ಪು ಸೇರಿಸಬೇಡಿ ಮತ್ತು ಕರಿದ ತಿಂಡಿಗಳನ್ನು ಮಿತಿಗೊಳಿಸಿ.",
        "ತಂಬಾಕು ಮತ್ತು ಮದ್ಯಪಾನದಿಂದ ದೂರವಿರಿ.",
        "ಯಾವುದೇ ಹೊಸ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದರೆ ಆಶಾ ಕಾರ್ಯಕರ್ತರಿಗೆ ತಿಳಿಸಿ."
      ],
      nextCheckup: "1 ವರ್ಷದಲ್ಲಿ ಮತ್ತೆ ತಪಾಸಣೆ ಮಾಡಿ",
      phcNeeded: false,
      phcText: "ವಾಡಿಕೆಯ ತಪಾಸಣೆ"
    },
    hi: {
      title: "कम जोखिम",
      explanation: "मरीज में वर्तमान में मधुमेह और उच्च रक्तचाप के कम जोखिम वाले लक्षण हैं।",
      actions: [
        "सक्रिय जीवनशैली जारी रखें (रोजाना कम से कम 30 मिनट टहलना या खेती का काम)।",
        "स्वस्थ भोजन खाएं - सब्जियां, साबुत अनाज बढ़ाएं और सफेद चावल कम करें।",
        "पके हुए भोजन में अतिरिक्त नमक न डालें और तले हुए स्नैक्स कम करें।",
        "तंबाकू और शराब के सेवन से बचें।",
        "कोई भी नया लक्षण दिखने पर आशा कार्यकर्ता को सूचित करें।"
      ],
      nextCheckup: "1 वर्ष में पुनः जांच करें",
      phcNeeded: false,
      phcText: "नियमित फॉलो-अप"
    },
    ta: {
      title: "குறைந்த ஆபத்து",
      explanation: "நோயாளிக்கு தற்போது நீரிழிவு மற்றும் உயர் இரத்த அழுத்தத்திற்கான ஆபத்து குறைவாக உள்ளது.",
      actions: [
        "சுறுசுறுப்பான வாழ்க்கை முறையைத் தொடரவும் (தினமும் 30 நிமிடங்கள் நடைபயிற்சி அல்லது விவசாயம்).",
        "ஆரோக்கியமான உணவை உண்ணுங்கள் - காய்கறிகள், தானியங்களை அதிகரித்து, வெள்ளை அரிசியைக் குறைக்கவும்.",
        "சமைத்த உணவில் கூடுதல் உப்பு சேர்ப்பதைத் தவிர்க்கவும், வறுத்த உணவுகளைக் குறைக்கவும்.",
        "புகையிலை மற்றும் மது அருந்துவதைத் தவிர்க்கவும்.",
        "ஏதேனும் புதிய அறிகுறிகள் தோன்றினால் ஆஷா ஊழியருக்கு தெரிவிக்கவும்."
      ],
      nextCheckup: "1 வருடத்தில் மீண்டும் பரிசோதிக்கவும்",
      phcNeeded: false,
      phcText: "வழக்கமான பின்தொடர்தல்"
    },
    te: {
      title: "తక్కువ ప్రమాదం",
      explanation: "రోగికి ప్రస్తుతం మధుమేహం మరియు రక్తపోటు వచ్చే ప్రమాదం తక్కువగా ఉంది.",
      actions: [
        "క్రియాశీల జీవనశైలిని కొనసాగించండి (రోజుకు కనీసం 30 నిమిషాలు నడక లేదా వ్యవసాయం).",
        "ఆరోగ్యకరమైన ఆహారం తీసుకోండి - కూరగాయలు, తృణధాన్యాలు పెంచండి, తెల్ల అన్నం తగ్గించండి.",
        "వండిన ఆహారంలో అదనపు ఉప్పు వేయడం మానుకోండి మరియు వేపుళ్లు తగ్గించండి.",
        "పొగాకు మరియు మద్యపానానికి దూరంగా ఉండండి.",
        "ఏదైనా కొత్త లక్షణాలు కనిపిస్తే ఆశా కార్యకర్తకు తెలియజేయండి."
      ],
      nextCheckup: "1 సంవత్సరంలో మళ్లీ స్క్రీనింగ్ చేయండి",
      phcNeeded: false,
      phcText: "సాధారణ ఫాలో-అప్"
    }
  },
  YELLOW: {
    en: {
      title: "MODERATE RISK",
      explanation: "Moderate risk markers found. Lifestyle modification and medical consultation recommended.",
      actions: [
        "Schedule visit to Primary Health Centre (PHC) for diagnostic verification.",
        "Reduce sugar, sweets, white rice, and refined flour from daily diet.",
        "Walk briskly for at least 30-45 minutes every day.",
        "Monitor blood pressure and blood sugar levels monthly.",
        "Take prescribed medicines (if any) daily without skipping."
      ],
      nextCheckup: "Re-screen in 3 months",
      phcNeeded: true,
      phcText: "PHC consultation recommended"
    },
    kn: {
      title: "ಮಧ್ಯಮ ಅಪಾಯ",
      explanation: "ಮಧ್ಯಮ ಅಪಾಯದ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿವೆ. ಜೀವನಶೈಲಿಯಲ್ಲಿ ಬದಲಾವಣೆ ಮತ್ತು ವೈದ್ಯಕೀಯ ಸಮಾಲೋಚನೆ ಅಗತ್ಯವಿದೆ.",
      actions: [
        "ಹೆಚ್ಚಿನ ತಪಾಸಣೆಗಾಗಿ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಕ್ಕೆ (PHC) ಭೇಟಿ ನೀಡಿ.",
        "ದೈನಂದಿನ ಆಹಾರದಲ್ಲಿ ಸಕ್ಕರೆ, ಸಿಹಿ, ಬಿಳಿ ಅನ್ನ ಮತ್ತು ಮೈದಾವನ್ನು ಕಡಿಮೆ ಮಾಡಿ.",
        "ಪ್ರತಿದಿನ ಕನಿಷ್ಠ 30-45 ನಿಮಿಷಗಳ ಕಾಲ ಚುರುಕಾಗಿ ನಡೆಯಿರಿ.",
        "ತಿಂಗಳಿಗೊಮ್ಮೆ ರಕ್ತದೊತ್ತಡ ಮತ್ತು ರಕ್ತದ ಸಕ್ಕರೆ ಮಟ್ಟವನ್ನು ಪರಿಶೀಲಿಸಿ.",
        "ವೈದ್ಯರು ಸೂಚಿಸಿದ ಔಷಧಿಗಳನ್ನು ತಪ್ಪದೇ ಪ್ರತಿದಿನ ತೆಗೆದುಕೊಳ್ಳಿ."
      ],
      nextCheckup: "3 ತಿಂಗಳಲ್ಲಿ ಮತ್ತೆ ತಪಾಸಣೆ ಮಾಡಿ",
      phcNeeded: true,
      phcText: "PHC ಭೇಟಿ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ"
    },
    hi: {
      title: "मध्यम जोखिम",
      explanation: "मध्यम जोखिम के लक्षण पाए गए हैं। जीवनशैली में बदलाव और डॉक्टर की सलाह जरूरी है।",
      actions: [
        "जांच की पुष्टि के लिए प्राथमिक स्वास्थ्य केंद्र (PHC) जाने का समय तय करें।",
        "दैनिक आहार में चीनी, मिठाई, सफेद चावल और मैदे की मात्रा कम करें।",
        "रोजाना कम से कम 30-45 मिनट तेज गति से चलें।",
        "हर महीने रक्तचाप और ब्लड शुगर के स्तर की निगरानी करें।",
        "यदि डॉक्टर ने कोई दवा दी है, तो उसे बिना छोड़े नियमित रूप से लें।"
      ],
      nextCheckup: "3 महीने में पुनः जांच करें",
      phcNeeded: true,
      phcText: "PHC परामर्श की सलाह दी जाती है"
    },
    ta: {
      title: "மிதமான ஆபத்து",
      explanation: "மிதமான ஆபத்து அறிகுறிகள் கண்டறியப்பட்டுள்ளன. வாழ்க்கை முறை மாற்றம் மற்றும் மருத்துவ ஆலோசனை தேவை.",
      actions: [
        "பரிசோதனைக்காக ஆரம்ப சுகாதார நிலையத்திற்கு (PHC) செல்லவும்.",
        "தினசரி உணவில் சர்க்கரை, இனிப்புகள், வெள்ளை அரிசி மற்றும் மைதாவைக் குறைக்கவும்.",
        "தினமும் குறைந்தது 30-45 நிமிடங்கள் வேகமாக நடக்கவும்.",
        "மாதந்தோறும் இரத்த அழுத்தம் மற்றும் இரத்த சர்க்கரை அளவைக் கண்காணிக்கவும்.",
        "பரிந்துரைக்கப்பட்ட மருந்துகளைத் தவறாமல் தினமும் உட்கொள்ளவும்."
      ],
      nextCheckup: "3 மாதங்களில் மீண்டும் பரிசோதிக்கவும்",
      phcNeeded: true,
      phcText: "PHC ஆலோசனை தேவை"
    },
    te: {
      title: "మధ్యస్థ ప్రమాదం",
      explanation: "మధ్యస్థ ప్రమాద సంకేతాలు కనిపించాయి. జీవనశైలి మార్పు మరియు వైద్య సంప్రదింపులు అవసరం.",
      actions: [
        "నిర్ధారణ పరీక్షల కోసం ప్రాథమిక ఆరోగ్య కేంద్రం (PHC) సందర్శించండి.",
        "రోజువారీ ఆహారంలో చక్కెర, స్వీట్లు, తెల్ల అన్నం మరియు మైదా తగ్గించండి.",
        "ప్రతిరోజూ కనీసం 30-45 నిమిషాల పాటు వేగంగా నడవండి.",
        "ప్రతినెలా రక్తపోటు మరియు బ్లడ్ షుగర్ లెవెల్స్ పరీక్షించండి.",
        "సూచించిన మందులను దాటవేయకుండా ప్రతిరోజూ తీసుకోండి."
      ],
      nextCheckup: "3 నెలల్లో మళ్లీ స్క్రీనింగ్ చేయండి",
      phcNeeded: true,
      phcText: "PHC సంప్రదింపులు సిఫార్సు చేయబడింది"
    }
  },
  RED: {
    en: {
      title: "HIGH RISK — REFER NOW",
      explanation: "High risk markers detected. Urgent referral to Primary Health Centre (PHC) required.",
      actions: [
        "IMMEDIATE referral to Primary Health Centre (PHC) or Medical Officer.",
        "Complete laboratory investigations for HbA1c and kidney function.",
        "Follow strict low-sodium, low-glycemic medical diet immediately.",
        "Begin or adjust antihypertensive/antidiabetic medication under doctor's guidance.",
        "ASHA worker to conduct home visit tracking within 15 days."
      ],
      nextCheckup: "Re-screen within 15-30 days",
      phcNeeded: true,
      phcText: "URGENT PHC REFERRAL REQUIRED"
    },
    kn: {
      title: "ಹೆಚ್ಚಿನ ಅಪಾಯ — ತಕ್ಷಣ ರವಾನಿಸಿ",
      explanation: "ಹೆಚ್ಚಿನ ಅಪಾಯದ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿವೆ. ತಕ್ಷಣವೇ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಕ್ಕೆ (PHC) ಕಳುಹಿಸಬೇಕು.",
      actions: [
        "ತಕ್ಷಣವೇ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ (PHC) ಅಥವಾ ವೈದ್ಯಾಧಿಕಾರಿಗಳ ಬಳಿಗೆ ಕಳುಹಿಸಿ.",
        "ಲ್ಯಾಬೋರೇಟರಿಯಲ್ಲಿ HbA1c ಮತ್ತು ಮೂತ್ರಪಿಂಡದ ತಪಾಸಣೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.",
        "ತಕ್ಷಣವೇ ಕಟ್ಟುನಿಟ್ಟಾದ ಕಡಿಮೆ ಉಪ್ಪು ಮತ್ತು ಕಡಿಮೆ ಸಕ್ಕರೆಯ ಆಹಾರ ಪದ್ಧತಿ ಅನುಸರಿಸಿ.",
        "ವೈದ್ಯರ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಔಷಧಿಗಳನ್ನು ಪ್ರಾರಂಭಿಸಿ ಅಥವಾ ಸರಿಹೊಂದಿಸಿ.",
        "ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯು 15 ದಿನಗಳಲ್ಲಿ ರೋಗಿಯ ಮನೆಗೆ ಭೇಟಿ ನೀಡಿ ಪರಿಶೀಲಿಸಬೇಕು."
      ],
      nextCheckup: "15-30 ದಿನಗಳಲ್ಲಿ ಮತ್ತೆ ತಪಾಸಣೆ ಮಾಡಿ",
      phcNeeded: true,
      phcText: "ತುರ್ತು PHC ರವಾನೆ ಅಗತ್ಯವಿದೆ"
    },
    hi: {
      title: "उच्च जोखिम — तुरंत रेफर करें",
      explanation: "उच्च जोखिम के लक्षण पाए गए हैं। तुरंत प्राथमिक स्वास्थ्य केंद्र (PHC) में रेफर किया जाना आवश्यक है।",
      actions: [
        "प्राथमिक स्वास्थ्य केंद्र (PHC) या चिकित्सा अधिकारी के पास तुरंत रेफर करें।",
        "HbA1c और किडनी जांच सहित सभी प्रयोगशाला परीक्षण जल्द पूरा करें।",
        "तुरंत कम नमक और कम शुगर वाले चिकित्सा आहार का कड़ाई से पालन करें।",
        "डॉक्टर की देखरेख में बीपी/शुगर की दवाएं शुरू करें या बदलें।",
        "आशा कार्यकर्ता 15 दिनों के भीतर गृह भ्रमण कर मरीज की स्थिति की जांच करें।"
      ],
      nextCheckup: "15-30 दिनों के भीतर पुनः जांच करें",
      phcNeeded: true,
      phcText: "तत्काल PHC रेफरल आवश्यक"
    },
    ta: {
      title: "அதிக ஆபத்து — உடனே பரிந்துரைக்கவும்",
      explanation: "அதிக ஆபத்து அறிகுறிகள் கண்டறியப்பட்டுள்ளன. ஆரம்ப சுகாதார நிலையத்திற்கு (PHC) அவசரமாக பரிந்துரைக்கப்பட வேண்டும்.",
      actions: [
        "உடனடியாக ஆரம்ப சுகாதார நிலையத்திற்கு (PHC) அல்லது மருத்துவ ಅಧಿಕாரியிடம் அனுப்பவும்.",
        "HbA1c மற்றும் சிறுநீரக செயல்பாடு பரிசோதனைகளை மேற்கொள்ளவும்.",
        "குறைந்த உப்பு மற்றும் குறைந்த சர்க்கரை கொண்ட உணவை உடனடியாக பின்பற்றவும்.",
        "மருத்துவரின் ஆலோசனையின் கீழ் மருந்துகளைத் தொடங்கவும் அல்லது சரிசெய்யவும்.",
        "ஆஷா ஊழியர் 15 நாட்களுக்குள் வீட்டிற்குச் சென்று கண்காணிக்க வேண்டும்."
      ],
      nextCheckup: "15-30 நாட்களில் மீண்டும் பரிசோதிக்கவும்",
      phcNeeded: true,
      phcText: "உடனடி PHC பரிந்துரை தேவை"
    },
    te: {
      title: "అధిక ప్రమాదం — వెంటనే రెఫర్ చేయండి",
      explanation: "అధిక ప్రమాద సంకేతాలు గుర్తించబడ్డాయి. ప్రాథమిక ఆరోగ్య కేంద్రానికి (PHC) వెంటనే పంపడం అవసరం.",
      actions: [
        "వెంటనే ప్రాథమిక ఆరోగ్య కేంద్రానికి (PHC) లేదా డాక్టర్ వద్దకు పంపించండి.",
        "HbA1c మరియు మూత్రపిండాల పనితీరుకు సంబంధించిన పరీక్షలు వెంటనే చేయించండి.",
        "తక్కువ ఉప్పు మరియు తక్కువ పిండిపదార్థాలు గల ఆహారాన్ని వెంటనే ప్రారంభించండి.",
        "వైద్యుల పర్యవేక్షణలో బీపీ/షుగర్ మందులు వాడటం ప్రారంభించండి.",
        "ఆశా కార్యకర్త 15 రోజుల్లోగా ఇంటికి వెళ్లి రోగి పరిస్థితిని సమీక్షించాలి."
      ],
      nextCheckup: "15-30 రోజుల్లో మళ్లీ స్క్రీనింగ్ చేయండి",
      phcNeeded: true,
      phcText: "అత్యవసర PHC రెఫరల్ అవసరం"
    }
  }
};
