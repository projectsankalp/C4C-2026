/**
 * GraamSehat ASHA Worker App - Hindi Locale
 * Path: /src/locales/hi.js
 * Contains all Hindi UI text mappings.
 */

export const hi = {
  appName: "ग्रामसेहत आशा ऐप",
  welcome: "स्वागत है",
  goodMorning: "शुभ प्रभात",
  goodAfternoon: "शुभ दोपहर",
  goodEvening: "शुभ संध्या",
  online: "ऑनलाइन",
  offline: "ऑफलाइन",
  syncStatus: "सिंक स्थिति",
  syncing: "डेटा सिंक हो रहा है...",
  pendingSyncCount: "{count} रिकॉर्ड सिंक होना बाकी हैं",
  syncSuccess: "{count} रिकॉर्ड सफलतापूर्वक अपलोड किए गए!",
  
  // Home Screen Buttons
  btnScanCard: "कार्ड स्कैन करें",
  descScanCard: "मरीज की जांच करें",
  btnMyPatients: "मेरे मरीज",
  descMyPatients: "मरीजों की सूची देखें",
  btnMedicineLog: "दवा वितरण",
  descMedicineLog: "दवा वितरण दर्ज करें",
  
  // Stats
  screenedToday: "आज जांच की गई",
  pendingSync: "सिंक बाकी",
  highRisk: "उच्च जोखिम",
  
  // Scan Card Options
  scanTitle: "मरीज का कार्ड स्कैन करें",
  nfcTitle: "विकल्प 1: NFC टैप",
  nfcDesc: "मरीज के स्वास्थ्य कार्ड को अपने फोन के पीछे स्पर्श करें",
  nfcNotSupported: "इस डिवाइस पर NFC उपलब्ध नहीं है, इसके बजाय QR का उपयोग करें",
  qrTitle: "विकल्प 2: QR कोड",
  qrDesc: "कैमरे का उपयोग करके मरीज के कार्ड पर QR कोड स्कैन करें",
  manualTitle: "विकल्प 3: मैन्युअल आईडी",
  manualDesc: "6 अंकों की स्वास्थ्य आईडी मैन्युअल रूप से दर्ज करें",
  noCardOption: "मरीज के पास कार्ड नहीं है?",
  noCardBtn: "नया मरीज पंजीकृत करें",
  manualPlaceholder: "6 अंक दर्ज करें",
  btnSubmit: "जमा करें",
  invalidUid: "अमान्य आईडी या गलत चेकसम। कृपया पुनः प्रयास करें।",
  
  // Registration Wizard
  regTitle: "नया मरीज पंजीकरण",
  regStepPhoto: "मरीज की फोटो",
  regStepDetails: "व्यक्तिगत विवरण",
  regStepLocation: "स्थान",
  regStepContact: "संपर्क जानकारी",
  regStepAadhaar: "आधार सत्यापन",
  regStepConfirm: "पुष्टि करें",
  
  btnNext: "आगे बढ़ें",
  btnBack: "पीछे जाएं",
  btnSkip: "फोटो छोड़ें",
  btnTakePhoto: "फोटो खींचें",
  btnRetake: "दोबारा लें",
  btnRegister: "मरीज पंजीकृत करें",
  btnEdit: "सुधारें",
  
  labelName: "पूरा नाम",
  labelAge: "उम्र (वर्षों में)",
  labelGender: "लिंग",
  labelBloodGroup: "रक्त समूह",
  labelVillage: "गांव का नाम",
  labelDistrict: "जिला",
  labelHousehold: "घर का नंबर",
  labelPrimaryPhone: "प्राथमिक फोन नंबर",
  labelAltPhone: "वैकल्पिक फोन (वैकल्पिक)",
  labelLinkFamily: "पारिवारिक खाते से लिंक करें?",
  labelFamilyPhone: "परिवार के मुखिया का फोन",
  labelAadhaar: "आधार संख्या (12 अंक)",
  aadhaarNotice: "आधार सुरक्षित रूप से एन्क्रिप्ट करके संग्रहीत किया जाता है और केवल पहचान सत्यापन के लिए उपयोग किया जाता है।",
  noAadhaarOpt: "मरीज के पास आधार नहीं है",
  
  regSuccess: "मरीज का पंजीकरण सफल रहा!",
  healthIdLabel: "उत्पन्न स्वास्थ्य आईडी:",
  btnPrintShare: "WhatsApp पर साझा करें",
  btnGoHome: "होम पर जाएं",
  btnStartScreening: "जांच शुरू करें",
  
  // Screening Wizard
  screenTitle: "स्वास्थ्य जांच",
  screenStep: "चरण {current} का {total}",
  
  qAgeTitle: "मरीज की उम्र कितनी है?",
  optAge1: "35 वर्ष से कम",
  optAge2: "35 से 49 वर्ष",
  optAge3: "50 वर्ष या उससे अधिक",
  
  qWaistTitle: "कमर का माप क्या है?",
  qGenderFirst: "कृपया पहले लिंग चुनें",
  optWaistMen1: "80 सेमी से कम",
  optWaistMen2: "80 से 89 सेमी",
  optWaistMen3: "90 सेमी या अधिक",
  optWaistWomen1: "75 सेमी से कम",
  optWaistWomen2: "75 से 84 सेमी",
  optWaistWomen3: "85 सेमी या अधिक",
  
  qActivityTitle: "मरीज रोजाना कितना सक्रिय रहता है?",
  optActivity1: "बहुत सक्रिय (खेती/अधिक चलना)",
  optActivity2: "मध्यम सक्रिय (थोड़ा चलना)",
  optActivity3: "सक्रिय नहीं (ज्यादातर बैठना)",
  
  qFamilyTitle: "क्या परिवार में किसी को मधुमेह है?",
  optFamily1: "कोई पारिवारिक इतिहास नहीं",
  optFamily2: "माता या पिता में से किसी एक को",
  optFamily3: "माता और पिता दोनों को",
  
  qBpTitle: "रक्तचाप रीडिंग दर्ज करें",
  labelBpSys: "ऊपरी संख्या (Systolic)",
  labelBpDia: "निचली संख्या (Diastolic)",
  bpNotAvailable: "रीडिंग उपलब्ध नहीं (बीपी मशीन नहीं है)",
  bpLivePrefix: "वर्गीकरण: ",
  
  qGlucoseTitle: "रक्त शर्करा (ब्लड ग्लूकोज) रीडिंग दर्ज करें (mg/dL)",
  glucoseNotAvailable: "रीडिंग उपलब्ध नहीं",
  glucoseLivePrefix: "वर्गीकरण: ",
  
  qSymptomsTitle: "क्या मरीज में इनमें से कोई लक्षण हैं? (सभी चुनें)",
  optSymp1: "अधिक प्यास लगना",
  optSymp2: "धुंधली दृष्टि",
  optSymp3: "पैरों में सुन्नता",
  optSymp4: "बार-बार पेशाब आना",
  optSymp5: "बिना कारण थकान",
  optSympNone: "उपरोक्त में से कोई नहीं",
  
  // Results
  resultTitle: "जांच का परिणाम",
  riskLow: "कम जोखिम",
  riskMod: "मध्यम जोखिम",
  riskHigh: "उच्च जोखिम — तुरंत रेफर करें",
  patientName: "मरीज का नाम",
  idrsScore: "IDRS स्कोर",
  bpReading: "बीपी रीडिंग",
  doctorsNote: "चिकित्सक की सलाह",
  btnShareWhatsApp: "WhatsApp पर साझा करें",
  btnSaveContinue: "सहेजें और जारी रखें",
  btnNewScreening: "नई जांच",
  
  // Medicine Log
  medTitle: "दवा वितरण दर्ज करें",
  selectPatient: "मरीज का चयन करें",
  patientSelected: "मरीज: {name} ({uid})",
  searchPatientPlaceholder: "नाम या आईडी से मरीज खोजें...",
  selectMed: "दवा का चयन करें",
  labelQty: "वितरित मात्रा",
  btnLogMed: "दर्ज करें",
  medSuccess: "दवा वितरण सफलतापूर्वक दर्ज किया गया!",
  stockWarning: "कम स्टॉक: {name} — केवल {qty} बचे हैं। PHC से अनुरोध करें।",
  stockOk: "स्टॉक अपडेट किया गया। शेष: {qty} यूनिट।",
  
  // My Patients Page
  patientsTitle: "मरीजों की निर्देशिका",
  searchPlaceholder: "नाम या आईडी से खोजें...",
  sortBy: "क्रमबद्ध करें",
  filterBy: "जोखिम से फ़िल्टर करें",
  allRisks: "सभी जोखिम",
  sortLastScreened: "अंतिम जांच",
  sortRisk: "जोखिम स्तर",
  sortName: "वर्णमाला अनुसार",
  noPatientsFound: "मरीज नहीं मिले।",
  lastScreenedLabel: "अंतिम जांच: ",
  neverScreened: "कभी नहीं",
  
  // Patient Profile
  profileTitle: "मरीज का प्रोफ़ाइल",
  riskBadge: "जोखिम: {risk}",
  gridReadings: "नवीनतम रीडिंग ग्रिड",
  timeline: "जांच इतिहास (अंतिम 3)",
  btnUpdateScreening: "जांच अपडेट करें",
  btnFullHistory: "पूरा इतिहास देखें",
  btnMedHistory: "दवा इतिहास",
  btnEditPatient: "जानकारी संपादित करें",
  
  // General & Settings
  settings: "सेटिंग्स",
  language: "भाषा",
  logout: "लॉगआउट",
  approvedStatus: "स्वीकृत आशा कार्यकर्ता",
  pendingStatus: "खाता अनुमोदन लंबित है। प्रशासक से संपर्क करें।",
  mockOffline: "नकली ऑफ़लाइन मोड",
  dbReset: "स्थानीय डेटाबेस रीसेट करें",
  dbResetSuccess: "स्थानीय डेटाबेस सफलतापूर्वक साफ़ कर दिया गया है।"
};
