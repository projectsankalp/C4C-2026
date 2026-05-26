/**
 * GraamSehat ASHA Worker App - Telugu Locale
 * Path: /src/locales/te.js
 * Contains all Telugu UI text mappings.
 */

export const te = {
  appName: "గ్రామసేహత్ ఆశా యాప్",
  welcome: "స్వాగతం",
  goodMorning: "శుభోదయం",
  goodAfternoon: "శుభ మధ్యాహ్నం",
  goodEvening: "శుభ సాయంత్రం",
  online: "ఆన్‌లైన్",
  offline: "ఆఫ్‌లైన్",
  syncStatus: "సింక్ స్థితి",
  syncing: "డేటా సింక్ అవుతోంది...",
  pendingSyncCount: "{count} రికార్డులు సింక్ కావాల్సి ఉన్నాయి",
  syncSuccess: "{count} రికార్డులు విజయవంతంగా అప్‌లోడ్ చేయబడ్డాయి!",
  
  // Home Screen Buttons
  btnScanCard: "కార్డు స్కాన్ చేయి",
  descScanCard: "రోగికి స్క్రీనింగ్ చేయి",
  btnMyPatients: "నా రోగులు",
  descMyPatients: "రోగుల జాబితాను చూడు",
  btnMedicineLog: "మందుల పంపిణీ",
  descMedicineLog: "మందుల పంపిణీని నమోదు చేయి",
  
  // Stats
  screenedToday: "ఈరోజు పరీక్షించిన వారు",
  pendingSync: "సింక్ కానివి",
  highRisk: "అధిక ప్రమాదం",
  
  // Scan Card Options
  scanTitle: "రోగి కార్డు స్కాన్ చేయి",
  nfcTitle: "ఆప్షన్ 1: NFC ట్యాప్",
  nfcDesc: "రోగి హెల్త్ కార్డును మీ ఫోన్ వెనుక భాగంలో తాకించండి",
  nfcNotSupported: "ఈ డివైజ్‌లో NFC సదుపాయం లేదు, బదులుగా QR వాడండి",
  qrTitle: "ఆప్షన్ 2: QR కోడ్",
  qrDesc: "కెమెరా ఉపయోగించి రోగి కార్డుపై ఉన్న QR కోడ్ స్కాన్ చేయండి",
  manualTitle: "ఆప్షన్ 3: మ్యాన్యువల్ ఐడి",
  manualDesc: "6 అంకెల హెల్త్ ఐడిని మ్యాన్యువల్‌గా నమోదు చేయండి",
  noCardOption: "రోగి వద్ద కార్డు లేదా?",
  noCardBtn: "కొత్త రోగిని నమోదు చేయి",
  manualPlaceholder: "6 అంకెలు నమోదు చేయండి",
  btnSubmit: "సమర్పించు",
  invalidUid: "అమాన్యమైన ఐడి లేదా తప్పుడు లుహ్న్ చెక్‌సమ్. మళ్లీ ప్రయత్నించండి.",
  
  // Registration Wizard
  regTitle: "కొత్త రోగి నమోదు",
  regStepPhoto: "రోగి ఫోటో",
  regStepDetails: "వ్యక్తిగత వివరాలు",
  regStepLocation: "నివాస స్థలం",
  regStepContact: "సంప్రదింపు వివరాలు",
  regStepAadhaar: "ఆధార్ ధృవీకరణ",
  regStepConfirm: "ధృవీకరణ",
  
  btnNext: "ముందుకు",
  btnBack: "వెనుకకు",
  btnSkip: "ఫోటో వద్దు",
  btnTakePhoto: "ఫోటో తీయి",
  btnRetake: "మళ్లీ తీయి",
  btnRegister: "రోగిని నమోదు చేయి",
  btnEdit: "సవరించు",
  
  labelName: "పూర్తి పేరు",
  labelAge: "వయస్సు (సంవత్సరాలలో)",
  labelGender: "లింగం",
  labelBloodGroup: "రక్త గ్రూపు",
  labelVillage: "గ్రామం పేరు",
  labelDistrict: "జిల్లా",
  labelHousehold: "ఇంటి నంబరు",
  labelPrimaryPhone: "ప్రాథమిక ఫోన్ నంబరు",
  labelAltPhone: "ప్రత్యామ్నాయ ఫోన్ (ఐచ్ఛికం)",
  labelLinkFamily: "కుటుంబ ఖాతాతో లింక్ చేయాలా?",
  labelFamilyPhone: "కుటుంబ యజమాని ఫోన్ నంబరు",
  labelAadhaar: "ఆధార్ సంఖ్య (12 అంకెలు)",
  aadhaarNotice: "ఆధార్ సంఖ్యను ఎన్‌క్రిప్ట్ చేసి భద్రపరుస్తాము మరియు కేవలం గుర్తింపు ధృవీకరణ కొరకు మాత్రమే వాడతాము.",
  noAadhaarOpt: "రోగి వద్ద ఆధార్ కార్డు లేదు",
  
  regSuccess: "రోగి నమోదు విజయవంతమైంది!",
  healthIdLabel: "సృష్టించబడిన హెల్త్ ఐడి:",
  btnPrintShare: "WhatsApp ద్వారా పంచుకోండి",
  btnGoHome: "హోమ్ పేజీకి వెళ్లు",
  btnStartScreening: "స్క్రీనింగ్ ప్రారంభించు",
  
  // Screening Wizard
  screenTitle: "ఆరోగ్య స్క్రీనింగ్",
  screenStep: "దశ {current} లో {total}",
  
  qAgeTitle: "రోగి వయస్సు ఎంత?",
  optAge1: "35 సంవత్సరాల కంటే తక్కువ",
  optAge2: "35 నుండి 49 సంవత్సరాలు",
  optAge3: "50 సంవత్సరాలు లేదా అంతకంటే ఎక్కువ",
  
  qWaistTitle: "నడుము కొలత ఎంత?",
  qGenderFirst: "దయచేసి ముందుగా లింగాన్ని ఎంచుకోండి",
  optWaistMen1: "80 సెం.మీ కంటే తక్కువ",
  optWaistMen2: "80 నుండి 89 సెం.మీ",
  optWaistMen3: "90 సెం.మీ లేదా అంతకంటే ఎక్కువ",
  optWaistWomen1: "75 సెం.మీ కంటే తక్కువ",
  optWaistWomen2: "75 నుండి 84 సెం.మీ",
  optWaistWomen3: "85 సెం.మీ లేదా అంతకంటే ఎక్కువ",
  
  qActivityTitle: "రోగి రోజువారీ శారీరక శ్రమ ఎలా ఉంటుంది?",
  optActivity1: "చాలా చురుకుగా (వ్యవసాయం/ఎక్కువ నడక)",
  optActivity2: "మధ్యస్థంగా (కొంత నడక)",
  optActivity3: "చురుకుగా ఉండరు (ఎక్కువగా కూర్చోవడం)",
  
  qFamilyTitle: "కుటుంబంలో ఎవరికైనా మధుమేహం ఉందా?",
  optFamily1: "కుటుంబ చరిత్ర లేదు",
  optFamily2: "తల్లి లేదా తండ్రిలో ఒకరికి ఉంది",
  optFamily3: "తల్లిదండ్రులు ఇద్దరికీ ఉంది",
  
  qBpTitle: "రక్తపోటు రీడింగ్ నమోదు చేయండి",
  labelBpSys: "పై సంఖ్య (Systolic)",
  labelBpDia: "క్రింది సంఖ్య (Diastolic)",
  bpNotAvailable: "రీడింగ్ అందుబాటులో లేదు (బీపీ మెషిన్ లేదు)",
  bpLivePrefix: "వర్గీకరణ: ",
  
  qGlucoseTitle: "రక్తంలో చక్కెర స్థాయి నమోదు చేయండి (mg/dL)",
  glucoseNotAvailable: "రీడింగ్ అందుబాటులో లేదు",
  glucoseLivePrefix: "వర్గీకరణ: ",
  
  qSymptomsTitle: "రోగికి ఈ క్రింది లక్షణాలలో ఏవైనా ఉన్నాయా? (అన్నీ ఎంచుకోవచ్చు)",
  optSymp1: "ఎక్కువగా దాహం వేయడం",
  optSymp2: "మసక చూపు",
  optSymp3: "పాదాలు మొద్దుబారడం",
  optSymp4: "ఎక్కువసార్లు మూత్రవిసర్జన",
  optSymp5: "కారణం లేని అలసట",
  optSympNone: "పైవేవీ కావు",
  
  // Results
  resultTitle: "స్క్రీనింగ్ ఫలితాలు",
  riskLow: "తక్కువ ప్రమాదం",
  riskMod: "మధ్యస్థ ప్రమాదం",
  riskHigh: "అధిక ప్రమాదం — వెంటనే రెఫర్ చేయి",
  patientName: "రోగి పేరు",
  idrsScore: "IDRS స్కోరు",
  bpReading: "బీపీ రీడింగ్",
  doctorsNote: "వైద్యుల సలహా పత్రం",
  btnShareWhatsApp: "WhatsApp ద్వారా పంచుకోండి",
  btnSaveContinue: "సేవ్ చేసి ముందుకు వెళ్లు",
  btnNewScreening: "కొత్త స్క్రీనింగ్",
  
  // Medicine Log
  medTitle: "మందుల పంపిణీ నమోదు",
  selectPatient: "రోగిని ఎంచుకోండి",
  patientSelected: "రోగి: {name} ({uid})",
  searchPatientPlaceholder: "పేరు లేదా ఐడి ద్వారా వెతకండి...",
  selectMed: "మందును ఎంచుకోండి",
  labelQty: "పంపిణీ చేసిన పరిమాణం",
  btnLogMed: "నమోదు చేయి",
  medSuccess: "మందుల పంపిణీ విజయవంతంగా నమోదైంది!",
  stockWarning: "తక్కువ స్టాక్: {name} — కేవలం {qty} మాత్రమే మిగిలాయి. PHC నుండి అడగండి.",
  stockOk: "స్టాక్ అప్‌డేట్ చేయబడింది. మిగిలినవి: {qty} యూనిట్లు.",
  
  // My Patients Page
  patientsTitle: "నా రోగుల డైరెక్టరీ",
  searchPlaceholder: "పేరు లేదా ఐడి ద్వారా వెతకండి...",
  sortBy: "సార్ట్ చేయి",
  filterBy: "రిస్క్ ఫిల్టర్",
  allRisks: "అన్ని రకాల రిస్కులు",
  sortLastScreened: "చివరి స్క్రీనింగ్",
  sortRisk: "ప్రమాద స్థాయి",
  sortName: "అక్షర క్రమం",
  noPatientsFound: "రోగులెవరూ కనుగొనబడలేదు.",
  lastScreenedLabel: "చివరి స్క్రీనింగ్: ",
  neverScreened: "ఎప్పుడూ లేదు",
  
  // Patient Profile
  profileTitle: "రోగి ప్రొఫైల్",
  riskBadge: "ప్రమాదం: {risk}",
  gridReadings: "తాజా రీడింగ్స్ గ్రిడ్",
  timeline: "స్క్రీనింగ్ చరిత్ర (చివరి 3)",
  btnUpdateScreening: "స్క్రీనింగ్ అప్‌డేట్ చేయి",
  btnFullHistory: "పూర్తి చరిత్ర చూడు",
  btnMedHistory: "మందుల చరిత్ర",
  btnEditPatient: "వివరాలు సవరించు",
  
  // General & Settings
  settings: "సెట్టింగ్స్",
  language: "భాష",
  logout: "లాగ్అవుట్",
  approvedStatus: "ఆమోదించబడిన ఆశా కార్యకర్త",
  pendingStatus: "ఖాతా ఆమోదం పెండింగ్‌లో ఉంది. అడ్మినిస్ట్రేటర్‌ను సంప్రదించండి.",
  mockOffline: "మాక్ ఆఫ్‌లైన్ మోడ్",
  dbReset: "స్థానిక డేటాబేస్ రీసెట్ చేయి",
  dbResetSuccess: "స్థానిక డేటాబేస్ విజయవంతంగా క్లియర్ చేయబడింది."
};
